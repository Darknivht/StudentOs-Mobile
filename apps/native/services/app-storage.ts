import Storage from "expo-sqlite/kv-store";

export const appStorage = {
  getItem: (key: string) => Storage.getItem(key),
  getItemSync: (key: string) => Storage.getItemSync(key),
  setItem: (key: string, value: string) => Storage.setItem(key, value),
  setItemSync: (key: string, value: string) => Storage.setItemSync(key, value),
  removeItem: (key: string) => Storage.removeItem(key),
  removeItemSync: (key: string) => Storage.removeItemSync(key),
};
