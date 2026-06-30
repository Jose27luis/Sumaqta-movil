import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Tema, useEstilos, useTema } from '@/core/theme/use-tema';

export default function MesaScreen() {
  const c = useTema();
  const styles = useEstilos(crear);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.iconoBtn} onPress={() => router.back()} accessibilityLabel="Volver">
          <Ionicons name="chevron-back" size={24} color={c.text} />
        </Pressable>
        <Text style={styles.titulo}>Mesa {id}</Text>
        <View style={styles.iconoBtn} />
      </View>

      <View style={styles.centro}>
        <Ionicons name="receipt-outline" size={44} color={c.faint} />
        <Text style={styles.proximo}>Toma de pedido</Text>
        <Text style={styles.sub}>El catálogo y el envío de comanda llegan en el siguiente paso.</Text>
      </View>
    </SafeAreaView>
  );
}

const crear = (c: Tema) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 8,
    },
    iconoBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    titulo: { fontSize: 18, fontWeight: '800', color: c.text },
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
    proximo: { fontSize: 18, fontWeight: '800', color: c.text },
    sub: { fontSize: 14, color: c.muted, textAlign: 'center', lineHeight: 20 },
  });
