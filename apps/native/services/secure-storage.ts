import * as SecureStore from "expo-secure-store";
import Storage from "expo-sqlite/kv-store";

const SECURE_STORE_VALUE_LIMIT = 2048;

export const ExpoSecureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    const refreshToken = await SecureStore.getItemAsync(key);
    if (!refreshToken) return null;
    const sessionJson = Storage.getItemSync(`${key}-session`);
    if (sessionJson) {
      try {
        const session = JSON.parse(sessionJson);
        session.refresh_token = refreshToken;
        return JSON.stringify(session);
      } catch {
        return refreshToken;
      }
    }
    return refreshToken;
  },

  async setItem(key: string, value: string): Promise<void> {
    if (value.length > SECURE_STORE_VALUE_LIMIT) {
      try {
        const session = JSON.parse(value);
        const refreshToken = session.refresh_token;
        if (refreshToken && typeof refreshToken === "string") {
          await SecureStore.setItemAsync(key, refreshToken);
        }
        const sessionCopy = { ...session };
        delete sessionCopy.refresh_token;
        Storage.setItemSync(`${key}-session`, JSON.stringify(sessionCopy));
        return;
      } catch {
        // Not JSON or parse error — fall through to direct store
      }
    }
    await SecureStore.setItemAsync(key, value);
  },

  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
    try {
      Storage.removeItemSync(`${key}-session`);
    } catch {
      // kv-store key may not exist
    }
  },
};
