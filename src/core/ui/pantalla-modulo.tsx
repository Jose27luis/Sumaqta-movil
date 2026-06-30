import { ReactNode } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { radios } from '@/core/theme/tokens';
import { Tema, useEstilos } from '@/core/theme/use-tema';

export function PantallaModulo({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children?: ReactNode;
}) {
  const styles = useEstilos(crear);
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.titulo}>{titulo}</Text>
        {descripcion ? <Text style={styles.descripcion}>{descripcion}</Text> : null}
      </View>
      <View style={styles.body}>
        {children ?? (
          <View style={styles.vacio}>
            <Text style={styles.vacioText}>Módulo en construcción</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const crear = (c: Tema) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
    titulo: { fontSize: 26, fontWeight: '800', color: c.text, fontFamily: c.sansBold },
    descripcion: { fontSize: 14, color: c.muted, marginTop: 4, fontFamily: c.sans },
    body: { flex: 1, paddingHorizontal: 20 },
    vacio: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    vacioText: {
      color: c.faint,
      fontSize: 15,
      backgroundColor: c.surfaceAlt,
      borderRadius: radios.md,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontFamily: c.sans,
    },
  });
