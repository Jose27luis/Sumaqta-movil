import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const esWeb = Platform.OS === 'web';

function webGet(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function webSet(key: string, value: string): void {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    void 0;
  }
}

function webRemove(key: string): void {
  try {
    globalThis.localStorage?.removeItem(key);
  } catch {
    void 0;
  }
}

export const secureStorage = {
  async get(key: string): Promise<string | null> {
    if (esWeb) {
      return webGet(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (esWeb) {
      webSet(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: string): Promise<void> {
    if (esWeb) {
      webRemove(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
