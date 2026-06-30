import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
  useFonts,
} from '@expo-google-fonts/ibm-plex-mono';
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';

import { queryClient } from '@/core/api/query-client';
import { useSession } from '@/core/auth/session';
import { usePrinter } from '@/core/printer/printer-store';
import { useTemaStore } from '@/core/theme/tema-store';
import { useTema } from '@/core/theme/use-tema';

function GuardiaAuth() {
  const router = useRouter();
  const segments = useSegments();
  const hidratado = useSession((s) => s.hidratado);
  const autenticado = useSession((s) => s.autenticado);

  useEffect(() => {
    if (!hidratado) {
      return;
    }
    const enLogin = segments[0] === 'login';
    const enRaiz = segments[0] === undefined;
    if (!autenticado && !enLogin) {
      router.replace('/login');
    } else if (autenticado && (enLogin || enRaiz)) {
      router.replace('/(tabs)');
    }
  }, [hidratado, autenticado, segments, router]);

  return null;
}

export default function RootLayout() {
  const hidratar = useSession((s) => s.hidratar);
  const hidratarImpresora = usePrinter((s) => s.hidratar);
  const hidratarTema = useTemaStore((s) => s.hidratar);
  const [fuentesListas] = useFonts({
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  useEffect(() => {
    void hidratar();
    void hidratarImpresora();
    void hidratarTema();
  }, [hidratar, hidratarImpresora, hidratarTema]);

  if (!fuentesListas) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GuardiaAuth />
      <RootStack />
    </QueryClientProvider>
  );
}

function RootStack() {
  const tema = useTema();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: tema.bg } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="mesa/[id]" />
    </Stack>
  );
}
