package expo.modules.focusmode

import android.os.Bundle
import android.content.Intent
import android.provider.Settings
import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import java.util.concurrent.ConcurrentHashMap

class FocusModeModule : Module() {

  companion object {
    @JvmStatic
    var currentBlockedPackages: Set<String> = emptySet()

    @JvmStatic
    var isActive: Boolean = false

    @JvmStatic
    var onAppBlocked: ((String) -> Unit)? = null

    @JvmStatic
    var onSessionEnd: (() -> Unit)? = null
  }

  override fun definition() = ModuleDefinition {
    Name("FocusMode")

    Events("onAppBlocked", "onSessionEnd", "onTimerTick")

    AsyncFunction("startSession") { blockedApps: List<String>, durationMinutes: Int, promise: Promise ->
      val context = appContext.reactContext ?: run {
        promise.resolve(false)
        return@AsyncFunction
      }

      if (!isAccessibilityServiceEnabled(context)) {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
        promise.resolve(false)
        return@AsyncFunction
      }

      currentBlockedPackages = blockedApps.toSet()
      isActive = true
      onAppBlocked = { packageName ->
        sendEvent("onAppBlocked", mapOf("packageName" to packageName))
      }
      onSessionEnd = {
        isActive = false
        currentBlockedPackages = emptySet()
        sendEvent("onSessionEnd", emptyMap<String, Any>())
      }

      val intent = Intent(context, FocusModeAccessibilityService::class.java).apply {
        action = "START_FOCUS"
        putStringArrayListExtra("blocked_apps", ArrayList(blockedApps))
        putExtra("duration_minutes", durationMinutes)
      }
      context.startService(intent)
      promise.resolve(true)
    }

    AsyncFunction("stopSession") { promise: Promise ->
      val context = appContext.reactContext ?: run {
        promise.resolve(false)
        return@AsyncFunction
      }

      isActive = false
      currentBlockedPackages = emptySet()

      val intent = Intent(context, FocusModeAccessibilityService::class.java).apply {
        action = "STOP_FOCUS"
      }
      context.startService(intent)
      promise.resolve(true)
    }

    AsyncFunction("isActive") { ->
      isActive
    }

    AsyncFunction("getBlockedApps") { ->
      currentBlockedPackages.toList()
    }
  }

  private fun isAccessibilityServiceEnabled(context: Context): Boolean {
    val enabledServices = Settings.Secure.getString(
      context.contentResolver,
      Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
    ) ?: return false
    val colonSplitter = enabledServices.split(":".toRegex())
    val serviceName = context.packageName + "/" + FocusModeAccessibilityService::class.java.canonicalName
    return colonSplitter.any { it.equals(serviceName, ignoreCase = true) }
  }
}