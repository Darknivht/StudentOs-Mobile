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
    const MMKV = require("react-native-mmkv").MMKV;
    const mmkv = new MMKV({ id: "supabase-auth" });
    adapter = {
      getItem: async (key) => mmkv.getString(key) ?? null,
      setItem: async (key, value) => mmkv.set(key, value),
      removeItem: async (key) => {
        mmkv.remove(key);
      },
    };
  } catch (e) {
    console.warn(
      "SecureStoreAdapter: MMKV not available, using memory fallback",
      e,
    );
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
          } catch (e2) {
            console.warn("SecureStore.setItem failed", e2);
            memoryStore.set(key, value);
          }
        },
        removeItem: async (key) => {
          try {
            await SecureStore.deleteItemAsync(key);
          } catch (e2) {
            console.warn("SecureStore.removeItem failed", e2);
            memoryStore.delete(key);
          }
        },
      };
    } catch (e3) {
      console.warn(
        "SecureStoreAdapter: expo-secure-store also not available",
        e3,
      );
    }
  }
}

export default adapter;
