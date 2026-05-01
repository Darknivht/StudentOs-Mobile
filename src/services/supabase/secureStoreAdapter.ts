import { Platform } from "react-native";

type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const memoryStore = new Map<string, string>();

const memoryAdapter: StorageAdapter = {
  getItem: async (key) => memoryStore.get(key) ?? null,
  setItem: async (key, value) => {
    memoryStore.set(key, value);
  },
  removeItem: async (key) => {
    memoryStore.delete(key);
  },
};

let adapter: StorageAdapter = memoryAdapter;

if (Platform.OS !== "web") {
  try {
    const SecureStore = require("expo-secure-store");
    adapter = {
      getItem: async (key) => {
        try {
          return await SecureStore.getItemAsync(key);
        } catch {
          return null;
        }
      },
      setItem: async (key, value) => {
        try {
          await SecureStore.setItemAsync(key, value);
        } catch (e) {
          console.warn("SecureStore.setItem failed, caching in memory", e);
          memoryStore.set(key, value);
        }
      },
      removeItem: async (key) => {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch (e) {
          console.warn(
            "SecureStore.removeItem failed, removing from memory",
            e,
          );
          memoryStore.delete(key);
        }
      },
    };
    console.log("SecureStoreAdapter: using expo-secure-store");
  } catch (e) {
    console.warn(
      "SecureStoreAdapter: expo-secure-store not available, using memory fallback",
      e,
    );
  }
}

export default adapter;
