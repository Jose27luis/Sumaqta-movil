import { router } from 'expo-router';

export function volver(): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/(tabs)');
  }
}
