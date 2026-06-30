import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Tema, useEstilos, useTema } from '@/core/theme/use-tema';

interface RutaTab {
  key: string;
  name: string;
}

interface BarraProps {
  state: { index: number; routes: RutaTab[] };
}

const meta: Record<string, { icono: keyof typeof Ionicons.glyphMap; titulo: string; ruta: string }> = {
  index: { icono: 'grid-outline', titulo: 'Salón', ruta: '/(tabs)' },
  mas: { icono: 'ellipsis-horizontal', titulo: 'Más', ruta: '/(tabs)/mas' },
};

function BarraTabs({ state }: BarraProps) {
  const router = useRouter();
  const c = useTema();
  const styles = useEstilos(crear);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.barra, { paddingBottom: insets.bottom + 9 }]}>
      {state.routes.map((ruta, index) => {
        const activo = state.index === index;
        const color = activo ? c.brand : c.faint;
        const info = meta[ruta.name];
        if (!info) {
          return null;
        }
        return (
          <Pressable
            key={ruta.key}
            style={styles.tab}
            onPress={() => router.navigate(info.ruta as never)}
          >
            <Ionicons name={info.icono} size={23} color={color} />
            <Text style={[styles.tabText, { color }]}>{info.titulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <BarraTabs state={props.state} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="mas" />
    </Tabs>
  );
}

const crear = (c: Tema) =>
  StyleSheet.create({
    barra: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: c.tabBar,
      borderTopWidth: 1,
      borderTopColor: c.border,
      paddingTop: 9,
      paddingHorizontal: 8,
    },
    tab: { flex: 1, alignItems: 'center', gap: 3 },
    tabText: { fontSize: 10.5, fontWeight: '600', fontFamily: c.sans },
  });
