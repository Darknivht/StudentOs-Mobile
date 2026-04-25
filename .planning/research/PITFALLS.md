# Domain Pitfalls: StudentOS Mobile

**Project:** StudentOS Mobile (React Native + Expo mobile learning app)
**Researched:** April 2026
**Domain:** Mobile learning app with offline-first architecture, AI integration, CBT exam prep
**Confidence:** MEDIUM-HIGH

This document catalogs critical, moderate, and minor pitfalls specific to building a mobile learning OS with WatermelonDB + Supabase sync, AI integration, CBT exam engine, and African market payments. Each pitfall includes prevention strategies and phase mapping for the 25+ phase roadmap.

---

## Table of Contents

1. [Critical Pitfalls](#critical-pitfalls)
2. [WatermelonDB Sync Pitfalls](#watermelondb-sync-pitfalls)
3. [AI Integration Pitfalls](#ai-integration-pitfalls)
4. [Native Module Pitfalls (Expo Dev Client)](#native-module-pitfalls-expo-dev-client)
5. [Offline-First Pitfalls](#offline-first-pitfalls)
6. [Security Pitfalls](#security-pitfalls)
7. [Performance Pitfalls](#performance-pitfalls)
8. [Payment Integration Pitfalls (African Market)](#payment-integration-pitfalls-african-market)
9. [Exam Prep CBT Pitfalls](#exam-prep-cbt-pitfalls)
10. [React Native-Specific Pitfalls](#react-native-specific-pitfalls)
11. [Pitfall-to-Phase Mapping](#pitfall-to-phase-mapping)
12. [Looks Done But Is Not Checklist](#looks-done-but-is-not-checklist)

---

## Critical Pitfalls

Mistakes that cause rewrites, major data loss, or production failures.

### Pitfall 1: Storing Credentials in AsyncStorage

**What goes wrong:** Authentication tokens, API keys, and refresh tokens stored in AsyncStorage are exposed as plaintext on both iOS and Android. On rooted/jailbroken devices, any app can extract these credentials.

**Why it happens:** AsyncStorage stores data as unencrypted SQLite (Android) or plist files (iOS). Developers default to AsyncStorage for simplicity without understanding the security implications.

**Consequences:** Account takeover, token theft, unauthorized subscriptions, data breaches. Particularly catastrophic for a learning app handling student data and payment information.

**Prevention:** Use `expo-secure-store` which leverages iOS Keychain and Android Keystore with hardware-backed encryption. For biometric-protected data, set `requireAuthentication: true`.

**Phase to address:** Phase 3 (Authentication) or Phase 5 (Security Foundation)

**Warning signs:**
- Any `await AsyncStorage.setItem('token', ...)` in codebase
- No SecureStore implementation in auth flows
- Missing NSFaceIDUsageDescription in iOS Info.plist

---

### Pitfall 2: Concurrent Sync Race Conditions

**What goes wrong:** Multiple `synchronize()` calls run simultaneously causing "Diagnostic error: Concurrent synchronization is not allowed." Local changes get lost or corrupted.

**Why it happens:** User actions trigger sync while another sync is in progress. Common with rapid taps or flaky network causing retry loops. WatermelonDB enforces single-sync policy.

**Consequences:** Sync stops working entirely. User data stops syncing to cloud. "DIRTY" state never resolves.

**Prevention:** Implement a sync lock using a ref or context. Always check `isSyncing` before starting a new sync. Wrap synchronize in a "retry once" block as recommended by WatermelonDB docs.

```typescript
// Recommended pattern from WatermelonDB docs
const sync = useRef(false);
async function performSync() {
  if (sync.current) return;
  sync.current = true;
  try {
    await database.write(async () => {
      await synchronize({ /* config */ });
    });
  } catch (error) {
    // Retry once after pull to resolve server conflicts
    await synchronize({ /* config */ });
  } finally {
    sync.current = false;
  }
}
```

**Phase to address:** Phase 7 (Offline Sync Engine)

**Warning signs:**
- "Concurrent synchronization is not allowed" errors in logs
- Multiple rapid sync triggers from user actions
- No debounce on sync triggers

---

### Pitfall 3: API Keys Exposed in Client

**What goes wrong:** AI provider API keys (OpenAI, Anthropic, Gemini) are embedded in the JavaScript bundle and visible to anyone who decompiles the app.

**Why it happens:** Developers put API keys in environment variables that get bundled into JS, or hardcode them for "convenience."

**Consequences:** Unlimited API usage by attackers, massive bills, quota exhaustion, account suspension by providers.

**Prevention:** Always route AI requests through your own backend proxy. The mobile client should only call your server endpoint, never directly to AI providers. Your backend adds the API key server-side.

```typescript
// WRONG - exposes key in bundle
const client = new OpenAI({ apiKey: 'sk-...' });

// CORRECT - proxy through your backend
const response = await fetch('https://your-api.com/ai/chat', {
  headers: { 'Authorization': `Bearer ${userToken}` }
});
```

**Phase to address:** Phase 9 (AI Integration) or Phase 4 (API Gateway)

**Warning signs:**
- Any `sk-` or `sk-api` strings in codebase
- Direct imports of AI SDKs with API keys
- Missing backend proxy for AI endpoints

---

## WatermelonDB Sync Pitfalls

### Pitfall 4: Sync Conflict Data Loss

**What goes wrong:** When local and server both modify the same record, default "last-write-wins" strategy silently overwrites data. User changes disappear.

**Why it happens:** Default conflict resolution uses timestamps without user notification. No visibility into which changes merged or discarded.

**Consequences:** Silent data loss. Users lose study progress, answers, notes. Trust damage.

**Prevention:** Implement custom conflict resolution. For CBT answers, use "client-wins" (local exam answers preserved). For content updates, merge intelligently or prompt user.

```typescript
// Custom conflict resolver example
const resolveConflict = ({ record, local, server }) => {
  // For CBT answers: keep local (user's responses are sacred)
  if (record.table === 'exam_responses') {
    return { ...server, ...local }; // Merge, preserving local answers
  }
  // For content: server wins but log for review
  return server;
};
```

**Phase to address:** Phase 7 (Offline Sync Engine)

---

### Pitfall 5: Large Bootstrap Sync Freezing UI

**What goes wrong:** Initial sync of large datasets (thousands of questions, materials) freezes the app for seconds or minutes.

**Why it happens:** WatermelonDB default settings render synchronously. No progress indicator. Memory spikes.

**Consequences:** App appears frozen. Users force close. Poor first impression.

**Prevention:** Use WatermelonDB v0.25+ "Turbo Login" for 5.3x faster syncs. Implement `_unsafeBatchPerCollection` for very large syncs. Show progress UI.

```typescript
await synchronize({
  database,
  server,
  // Turbo mode for large syncs
  useTurbo: true,
  // Batch for memory management
  _unsafeBatchPerCollection: true,
  // Progress callback
  onWillApplyRemoteChanges: (changes) => {
    updateProgress(changes.length);
  }
});
```

**Phase to address:** Phase 7 (Offline Sync Engine)

---

### Pitfall 6: Dirty State Tracking Performance

**What goes wrong:** `database.withChangesForTables` takes 3+ seconds on every call, causing UI freezes during sync detection.

**Why it happens:** Using `withChangesForTables` improperly filtered, or subscribing too broadly. Triggers full database scans.

**Consequences:** Every sync check freezes UI. Users see stuttering.

**Prevention:** Debounce the observer. Use RxJS properly with `skip(1)` and filtering. Consider tracking dirty state through sync status flags rather than watching all changes.

```typescript
// Correct pattern
database.withChangesForTables(['questions', 'materials'])
  .pipe(
    skip(1), // Ignore initial emission
    filter(changes => 
      !changes.every(c => c.record.syncStatus === 'synced')
    ),
    debounceTime(500) // Avoid rapid re-triggers
  )
  .subscribe(() => triggerSync());
```

**Phase to address:** Phase 7 (Offline Sync Engine)

---

## AI Integration Pitfalls

### Pitfall 7: No Streaming for Long Responses

**What goes wrong:** AI responses appear all at once after 10-30 seconds of loading. Users think app is broken and abandon the session.

**Why it happens:** Not implementing SSE (Server-Sent Events) streaming. Waiting for full response before displaying anything.

**Consequences:** Poor UX. Users leave during loading. AI feature appears broken.

**Prevention:** Implement streaming. Use `react-native-sse` or platform-specific streaming libraries. Show tokens as they arrive.

```typescript
// Example: Stream tokens as they arrive
client.chat.completions.stream(
  { model: 'gpt-4o-mini', messages },
  (data) => {
    const content = data.choices[0].delta.content;
    if (content) {
      setText(prev => prev + content); // Progressive display
    }
  },
  {
    onError: (error) => handleError(error),
    onDone: () => saveToHistory()
  }
);
```

**Phase to address:** Phase 9 (AI Integration)

---

### Pitfall 8: Provider Lock-In Without Abstraction

**What goes wrong:** Switching from OpenAI to Claude requires widespread code changes throughout the app.

**Why it happens:** Provider-specific code directly in components. No abstraction layer.

**Consequences:** Vendor lock-in. Unable to switch when quotas exhausted, prices change, or outages occur.

**Prevention:** Create an AI provider abstraction. Use a unified interface that switches providers via configuration.

```typescript
// Abstraction layer
interface AIProvider {
  chat(messages: Message[]): Promise<Stream>;
  generate(prompt: string): Promise<string>;
}

// Switch via config
const provider = createProvider(config.aiProvider); // 'openai' | 'anthropic' | 'gemini'
const response = await provider.chat(messages);
```

Libraries like `react-native-ai-hooks` provide this abstraction out of the box.

**Phase to address:** Phase 9 (AI Integration)

---

### Pitfall 9: No Quota Management

**What goes wrong:** Users hit rate limits unexpectedly. AI feature stops working mid-exam. No graceful fallback.

**Why it happens:** No tracking of usage. No caching. No fallback provider configured.

**Consequences:** Feature failure during critical moments (exams). Support spike.

**Prevention:** Implement quota tracking. Configure fallback providers. Use caching for repeated prompts.

```typescript
// Quota management with fallback
const chat = async (messages) => {
  try {
    return await primaryProvider.chat(messages);
  } catch (error) {
    if (error.status === 429) {
      return await fallbackProvider.chat(messages);
    }
    throw error;
  }
};
```

**Phase to address:** Phase 9 (AI Integration)

---

## Native Module Pitfalls (Expo Dev Client)

### Pitfall 10: Dev Client Not in Dependencies

**What goes wrong:** `expo-dev-client` in devDependencies doesn't get autolinked. Native modules don't build. App crashes with missing native errors.

**Why it happens:** Expo autolinking doesn't traverse devDependencies by design. `expo-dev-client` is a runtime dependency, not a build tool.

**Consequences:** "Module not found" errors on Android/iOS. Local dev breaks. Confusion about what's wrong.

**Prevention:** Move `expo-dev-client` from devDependencies to dependencies. Run `expo install expo-dev-client` which handles this automatically.

**Phase to address:** Phase 2 (Dev Environment Setup)

---

### Pitfall 11: Full Reload on App Focus

**What goes wrong:** Every time user backgrounds and returns to app, JS bundle reloads. All state lost. Development extremely slow.

**Why it happens:** SDK 50+ changed expo-dev-client behavior. App refocused triggers reload unless configured.

**Consequences:** Development agony. Lost state destroys productivity. Developers stop using dev client.

**Prevention:** Configure launch mode in app.json:

```json
{
  "expo": {
    "plugins": [
      ["expo-dev-launcher", {
        "launchMode": "most-recent"
      }]
    ]
  }
}
```

Or for SDK 51+:

```json
{
  "expo": {
    "plugins": [
      ["expo-dev-client", {
        "launchMode": "launcher"
      }]
    ]
  }
}
```

**Phase to address:** Phase 2 (Dev Environment Setup)

---

### Pitfall 12: New Architecture Incompatibility

**What goes wrong:** Native modules fail to build with new architecture enabled. Random crashes. Build errors.

**Why it happens:** Some native modules haven't migrated to new architecture. UseFrameworks conflicts with Dev Client.

**Consequences:** Can't build releases. Android/iOS diverge in behavior.

**Prevention:** Test new architecture early. Keep old architecture for production until modules catch up. Check `expo-doctor` warnings.

```bash
npx expo-doctor
```

**Phase to address:** Phase 2 (Dev Environment Setup)

---

## Offline-First Pitfalls

### Pitfall 13: No Sync State Visibility

**What goes wrong:** Users don't know if data is synced. Make changes offline, assume synced, lose work when reopening.

**Why it happens:** No UI indicators for sync status. No "pending" badges. No offline mode banner.

**Consequences:** User frustration. Data loss claims. Poor reviews.

**Prevention:** Build sync status indicators:
- Pending changes badge in header
- "Offline" banner when disconnected
- "Syncing..." with progress
- Last synced timestamp

**Phase to address:** Phase 7 (Offline Sync Engine) and Phase 12 (UI Components)

---

### Pitfall 14: Device Clock Dependence

**What goes wrong:** Conflict resolution fails because device clocks are wrong. Timestamp-based sync breaks entirely.

**Why it happens:** Mobile device clocks are often wrong (especially when offline/airplane mode). WatermelonDB default timestamp conflict resolution assumes accurate clocks.

**Consequences:** Wrong data wins. Out-of-order changes. Sync failures.

**Prevention:** Use server-assigned timestamps. Use Hybrid Logical Clocks (HLC). Never rely on device time.

```typescript
// Server-side timestamp assignment
const serverTimestamp = server.getTimestamp();
record._raw.updated_at = serverTimestamp;
```

**Phase to address:** Phase 7 (Offline Sync Engine)

---

### Pitfall 15: Background Sync Not Working

**What goes wrong:** App closes, changes don't sync. User reopens app days later, data missing.

**Why it happens:** No background task implementation. No foreground notification handling. App suspended = sync stops.

**Consequences:** User data loss. Sync completly broken between sessions.

**Prevention:** Implement background sync or trigger sync on app foreground:

```typescript
// Sync on app foreground
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    triggerSync();
  }
});
```

For production, use background tasks or push notifications to wake app.

**Phase to address:** Phase 7 (Offline Sync Engine)

---

## Security Pitfalls

### Pitfall 16: Biometric Bypass via Callback

**What goes wrong:** App checks biometric success locally and trusts it without server validation. Attackers can spoof the callback.

**Why it happens:** Auth result sent directly to server without actual credential validation.

**Consequences:** Complete auth bypass. Anyone with device can access accounts.

**Prevention:** Use biometric to unlock stored credentials (via SecureStore), then send those credentials to server:

```typescript
// Correct flow
async function authenticate() {
  constbiometricResult = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock to access your account'
  });
  
  if (biometricResult.success) {
    // Only now access the secure token
    const token = await SecureStore.getItemAsync('auth_token');
    await validateTokenWithServer(token); // Server validates
  }
}
```

**Phase to address:** Phase 5 (Security Foundation)

---

### Pitfall 17: Biometric Key Invalidation

**What goes wrong:** User adds new fingerprint/face enrollment. All protected data becomes permanently inaccessible.

**Why it happens:** Keys are tied to biometric template. When biometrics change, OS invalidates all protected keys.

**Consequences:** Users lose access to auth tokens after updating biometrics. Must re-authenticate entirely.

**Prevention:** Warn users before biometric changes. Provide backup authentication method (password/PIN). Store fallback credentials not protected by biometrics for critical recovery data.

```typescript
// Warn user about implications
async function onBiometricChangeDetected() {
  Alert.alert(
    'Biometrics Changed',
    'Adding new biometric data will require re-authentication. Continue?',
    [{ text: 'Cancel' }, { text: 'Continue', onPress: () => reauthenticate() }]
  );
}
```

**Phase to address:** Phase 5 (Security Foundation)

---

### Pitfall 18: No Certificate Pinning

**What goes wrong:** Man-in-the-middle attacks intercept API traffic. Tokens and exam answers stolen.

**Why it happens:** No certificate pinning on API requests. App accepts any valid cert.

**Consequences:** MITM attacks possible on public WiFi. Data interception.

**Prevention:** Implement certificate pinning for API endpoints. For Supabase, use their built-in security. For custom backends, implement pinning:

```typescript
// Using axios with pinning (simplified example)
import pinning from 'axios-pin-ning';

const api = axios.create();
pinning(api, {
  host: 'your-api.com',
  publicKey: 'your-public-key',
  includeSubdomains: true
});
```

**Phase to address:** Phase 5 (Security Foundation)

---

## Performance Pitfalls

### Pitfall 19: FlatList at Scale (10,000+ Questions)

**What goes wrong:** Scrolling through question bank lags severely. Blank spaces appear. Frame drops.

**Why it happens:** FlatList default virtualization settings not optimized for large lists. Complex row components. Without getItemLayout.

**Consequences:** App feels broken. Users abandon feature. CBT practice unusable.

**Prevention:** Optimize FlatList:

```typescript
<FlatList
  data={questions}
  renderItem={renderQuestion}
  keyExtractor={item => item.id} // Never use index
  getItemLayout={(data, index) => ({ length: 80, offset: 80 * index, index })}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>
```

**Phase to address:** Phase 14 (CBT Engine) or Phase 16 (Performance Optimization)

Consider FlashList from Shopify for very large lists (100,000+ questions). It reuses views rather than recreating them.

---

### Pitfall 20: Image-Heavy List Rendering

**What goes wrong:** Question bank with images loads slowly, uses excessive memory, causes OOM crashes on older devices.

**Why it happens:** Loading full-resolution images in list items. No lazy loading. No caching.

**Consequences:** App crashes. Extreme battery drain. Support complaints.

**Prevention:** Use `react-native-fast-image` with caching. Specify exact dimensions. Use thumbnails in lists:

```typescript
<script type="native/redacted">
import FastImage from 'react-native-fast-image';

<FastImage
  source={{ uri: question.imageUrl }}
  style={styles.thumbnail}
  resizeMode={FastImage.resizeMode.cover}
/>
</script>
```

Also implement pagination:

```typescript
const onEndReached = () => {
  if (canLoadMore && !isLoading) {
    loadMoreQuestions(); // Fetch next page
  }
};
```

**Phase to address:** Phase 16 (Performance Optimization)

---

### Pitfall 21: Memory Leaks from Animations

**What goes wrong:** App slows down over time. Eventually crashes. Memory usage grows indefinitely.

**Why it happens:** Animation callbacks not cleaned up. List items with animated values never unmount. useAnimatedStyle in components mounted/unmounted repeatedly.

**Consequences:** App degradation. Crash after extended use. Poor reviews.

**Prevention:** Always clean up animations:

```typescript
useEffect(() => {
  const listener = animation.addListener(({ value }) => {
    // Handle updates
  });
  
  return () => {
    animation.removeListener(listener); // Clean up
  };
}, []);
```

For animated style in lists, use `React.memo` to prevent unnecessary re-renders.

**Phase to address:** Phase 16 (Performance Optimization)

---

## Payment Integration Pitfalls (African Market)

### Pitfall 22: Single Payment Provider

**What goes wrong:** Provider outage means zero revenue. No fallback. User can't pay, leaves forever.

**Why it happens:** Relying on one gateway (Stripe, Flutterwave, etc.) without alternatives.

**Consequences:** Complete payment failure during outages. Lost revenue. User churn.

**Prevention:** Implement multiple providers:

```typescript
const providers = ['flutterwave', 'mpesa', 'airtel'];

async function processPayment(amount, country) {
  for (const provider of providers) {
    if (isSupported(provider, country)) {
      try {
        return await payWith(provider, amount);
      } catch (error) {
        continue; // Try next provider
      }
    }
  }
  throw new Error('No payment provider available');
}
```

**Phase to address:** Phase 15 (Payments & Subscriptions)

---

### Pitfall 23: Mobile Money Not Integrated

**What goes wrong:** Users in Kenya, Ghana, Nigeria can't pay with M-Pesa, MTN MoMo, Airtel Money. Major user base excluded.

**Why it happens:** Only card payments supported. Mobile money requires separate integration.

**Consequences:** 60%+ of African users can't pay. Massive revenue leak.

**Prevention:** Integrate mobile money via Flutterwave or direct APIs:

```javascript
// Flutterwave Mobile Money
flw.MobileMoney.mpesa({
  phone_number: '254709929220',
  amount: 1500,
  currency: 'KES',
  tx_ref: generateRef()
});
```

Understand the flow: customer receives push notification or redirects to authorization app. Payment is async - must verify via webhook.

**Phase to address:** Phase 15 (Payments & Subscriptions)

---

### Pitfall 24: Currency/Region Matrix Ignored

**What goes wrong:** Wrong currency displayed. Payment fails silently. User charged wrong amount.

**Why it happens:** Not handling per-country currency requirements. NGN, KES, GHS all need specific handling.

**Consequences:** Failed payments. Chargebacks. User distrust.

**Prevention:** Map country to currency, verify with provider:

```typescript
const countryCurrencies = {
  NG: { currency: 'NGN', provider: 'flutterwave' },
  KE: { currency: 'KES', provider: 'mpesa' },
  GH: { currency: 'GHS', provider: 'flutterwave' }
};
```

Always show amounts in user's local currency before payment.

**Phase to address:** Phase 15 (Payments & Subscriptions)

---

### Pitfall 25: Payment Verification Only on Client

**What goes wrong:** Client tells server "payment successful." Attackers spoof this and get free access.

**Why it happens:** Granting access based on client callback only. Not verifying with provider.

**Consequences:** Free subscriptions. Revenue theft.

**Prevention:** ALL payment verification must happen server-side via webhook:

```typescript
// Server webhook handler
app.post('/webhook/flutterwave', async (req, res) => {
  const signature = req.headers['verif-hash'];
  const isValid = verifySignature(signature, req.body);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const { status, amount } = req.body.data;
  
  if (status === 'successful') {
    await grantUserAccess(req.body.data.customer_email, amount);
  }
  
  res.json({ received: true });
});
```

**Phase to address:** Phase 15 (Payments & Subscriptions)

---

## Exam Prep CBT Pitfalls

### Pitfall 26: Timer Desync in Background

**What goes wrong:** User backgrounds app during exam. Opens later - timer shows wrong remaining time. Time runs out silently.

**Why it happens:** Timer only updates when app in foreground. Date.now() doesn't track background time reliably.

**Consequences:** Exam integrity compromised. Users get unexpected timeouts.

**Prevention:** Store exam start time and calculate remaining on foreground:

```typescript
useEffect(() => {
  const subscription = AppState.addEventListener('change', state => {
    if (state === 'active') {
      // Recalculate from stored start time
      const elapsed = Date.now() - examStartTime;
      setRemainingTime(maxTime - elapsed);
    }
  });
  
  return () => subscription.remove();
}, []);
```

Save exam state immediately on any answer. On resume, validate time hasn't expired server-side.

**Phase to address:** Phase 14 (CBT Engine)

---

### Pitfall 27: Answer Not Saved on Network Fail

**What goes wrong:** User answers question, network fails, but answer not persisted. After reconnect, answer is "unanswered."

**Why it happens:** Answer sent but not locally saved. Network failure loses data.

**Consequences:** User loses exam attempt. Accusations of cheating. Support nightmare.

**Prevention:** Save answers locally immediately, sync to server in background:

```typescript
const selectAnswer = async (questionId, answer) => {
  // Always save locally first (offline-first)
  await database.write(async () => {
    await database.get('responses').create(response => {
      response.questionId = questionId;
      response.answer = answer;
      response.syncStatus = 'pending';
      response.timestamp = Date.now();
    });
  });
  
  // Then sync in background
  syncToServer(); // Fire and forget
};
```

On exam submission, verify all answers synced or upload remaining.

**Phase to address:** Phase 14 (CBT Engine)

---

### Pitfall 28: Question Bank Not Shuffled

**What goes wrong:** Same question order every practice. Users memorize by position, not learn.

**Why it happens:** No randomization of question order or answer options.

**Consequences:** Valid exam prep failure. Users think they're ready but aren't.

**Prevention:** Randomize both question order and answer options:

```typescript
shuffleArray(questions); // Random order
questions.forEach(q => shuffleArray(q.options)); // Random options
```

Track randomization seed per exam for reproducibility in review.

**Phase to address:** Phase 14 (CBT Engine)

---

### Pitfall 29: No Question Difficulty Tracking

**What goes wrong:** User takes 100 questions, sees no insight into weak areas. App provides no learning value.

**Why it happens:** No tracking of per-question performance history.

**Consequences:** Poor learning outcomes. App provides no advantage over paper.

**Prevention:** Track question-level performance:

```typescript
// After answer submission
await database.write(async () => {
  await database.get('question_stats').update(stat => {
    stat.attempts = stat.attempts + 1;
    stat.correct = stat.correct + (isCorrect ? 1 : 0);
    stat.lastAttempt = Date.now();
  });
});

// Show weaknesses in analytics
const weakQuestions = database
  .get('question_stats')
  .query(Q.where('accuracy', Q.lt(0.6)));
```

**Phase to address:** Phase 18 (Analytics & Progress)

---

## React Native-Specific Pitfalls

### Pitfall 30: Old Architecture Gestures Not Working

**What goes wrong:** PanResponder conflicts with ScrollView in New Architecture. Drag gestures get passed through to scroll.

**Why it happens:** New architecture handles gesture responder differently. PanResponder doesn't block scroll in new arch.

**Consequences:** Custom gestures broken in production. User cannot interact.

**Prevention:** Use React Native Gesture Handler instead of PanResponder:

```typescript
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const panGesture = Gesture.Pan()
  .onUpdate((event) => {
    translateX.value = event.translationX;
  })
  .runOnJS(true);

return (
  <GestureDetector gesture={panGesture}>
    <Animated.View style={animatedStyle} />
  </GestureDetector>
);
```

**Phase to address:** Phase 16 (Performance Optimization)

---

### Pitfall 31: Bridge Native Module Crashes

**What goes wrong:** App crashes when calling native module. No error handling. Bridge protocol mismatches.

**Why it happens:** Not handling native promise rejections. Version mismatches between JS and native code.

**Consequences:** App crashes in production. Poor reviews.

**Prevention:** Always wrap native calls in try-catch. Validate native module availability:

```typescript
import { NativeModules } from 'react-native';

const { MyNativeModule } = NativeModules;

if (!MyNativeModule) {
  throw new Error('Native module not available');
}

try {
  const result = await MyNativeModule.doSomething();
} catch (error) {
  console.error('Native call failed:', error);
  // Graceful fallback
}
```

**Phase to address:** Phase 20 (Native Integrations)

---

### Pitfall 32: Image Component Without Dimensions

**What goes wrong:** Images flash wrong size before loading. Layout jumps. Performance tanks.

**Why it happens:** Not specifying width/height on Image components. Native must measure after load.

**Consequences:** Visible layout shifts. Poor scrolling performance. Janky experience.

**Prevention:** ALWAYS specify dimensions:

```typescript
// WRONG
<Image source={{ uri: url }} />

// CORRECT
<Image 
  source={{ uri: url }} 
  style={{ width: 120, height: 120 }} 
  defaultSource={require('../assets/placeholder.png')}
/>
```

Or use aspect ratio:

```typescript
<Image
  source={{ uri: url }}
  style={{ width: '100%', aspectRatio: 16/9 }}
/>
```

**Phase to address:** Phase 16 (Performance Optimization)

---

## Pitfall-to-Phase Mapping

| Pitfall | Severity | Phase | Phase Name |
|--------|----------|-------|------------|
| AsyncStorage credentials | Critical | 3 or 5 | Auth / Security |
| Concurrent sync | Critical | 7 | Offline Sync |
| API key exposure | Critical | 4 or 9 | API Gateway / AI |
| Sync conflicts | High | 7 | Offline Sync |
| Large bootstrap | High | 7 | Offline Sync |
| Dirty tracking | Moderate | 7 | Offline Sync |
| AI no streaming | High | 9 | AI Integration |
| Provider lock-in | Moderate | 9 | AI Integration |
| Dev client in devDeps | High | 2 | Dev Setup |
| Full reload on focus | Moderate | 2 | Dev Setup |
| No sync state UI | High | 7, 12 | Offline Sync / UI |
| Device clock sync | Moderate | 7 | Offline Sync |
| Background sync | High | 7 | Offline Sync |
| Biometric bypass | Critical | 5 | Security |
| Cert pinning | High | 5 | Security |
| FlatList scale | High | 14, 16 | CBT / Performance |
| Image loading | Moderate | 16 | Performance |
| Memory leaks | High | 16 | Performance |
| Single payment | High | 15 | Payments |
| Mobile money missing | High | 15 | Payments |
| Payment verification | Critical | 15 | Payments |
| Timer background | Critical | 14 | CBT |
| Answer persistence | Critical | 14 | CBT |
| No question shuffle | Low | 14 | CBT |
| Gesture handler | Moderate | 16 | Performance |
| Native crashes | High | 20 | Native |

---

## Looks Done But Is Not Checklist

Use this checklist to verify implementations are complete, not just superficially working:

### Authentication
- [ ] Tokens stored in SecureStore, NOT AsyncStorage
- [ ] Biometric unlocks credentials, not just flags success
- [ ] Server validates tokens, not just client
- [ ] Logout clears all secure storage

### Sync Engine
- [ ] Sync lock prevents concurrent syncs
- [ ] Sync status visible in UI (pending/synced/error)
- [ ] Failed syncs retry with exponential backoff
- [ ] Large datasets show progress, don't freeze UI
- [ ] Conflicts resolved with custom logic, not just timestamp
- [ ] Server timestamps used, not device time

### AI Integration
- [ ] API keys never in client code
- [ ] Streaming works, tokens appear progressively
- [ ] Fallback provider configured
- [ ] Quota/usage tracked and displayed
- [ ] Abstracted provider switching

### CBT Engine
- [ ] Timer continues accurately in background
- [ ] Answers saved locally immediately
- [ ] Question/order randomized
- [ ] Weak areas identified and suggested
- [ ] Time warnings (5 min, 1 min before end)

### Payments
- [ ] Multiple providers integrated
- [ ] Mobile money available for KE/NG/GH
- [ ] Payment verification happens server-side
- [ ] Webhook signature validated
- [ ] Currency mapped per country

### Security
- [ ] NSFaceIDUsageDescription in Info.plist
- [ ] Certificate pinning on API calls
- [ ] Sensitive data encrypted at rest
- [ ] Root/jailbreak not required but detected
- [ ] Session expiry implemented

### Performance
- [ ] FlatList with getItemLayout for fixed items
- [ ] Images have explicit dimensions
- [ ] Pagination on large lists
- [ ] Memory leak checks in cleanup
- [ ] Tested on low-end device (not just simulator)

### Dev Environment
- [ ] expo-dev-client in dependencies, not devDependencies
- [ ] No full reload on app focus
- [ ] Works with new architecture or explicitly disabled
- [ ] EAS build tested before production

---

## Conclusion

This document covers 32 pitfalls across the StudentOS Mobile domain. Prioritize addressing:

1. **Critical first:** Security (credentials, payment verification, biometric bypass)
2. **High impact second:** Sync reliability, CBT integrity, payment failures
3. **Performance third:** List rendering, memory, image loading
4. **Polish last:** Analytics, optimizations

Each phase in the 25+ phase roadmap should reference this document to ensure previously-identified pitfalls are addressed before they become production issues.

---

## Sources

- WatermelonDB GitHub Issues (#1904, #576, #949, #1256, #1936, #1745)
- WatermelonDB Sync Documentation
- Expo Dev Client Documentation
- React Native Gesture Handler Documentation
- React Native FlatList Performance Guide
- Flutterwave Mobile Money Documentation
- Expo SecureStore Documentation
- react-native-offline-sync library patterns
- Community discussions (GitHub, Stack Overflow, DEV.to)