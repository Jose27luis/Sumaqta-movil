import { StyleSheet, Text, View } from 'react-native';

import { Tema, useEstilos, useTema } from '@/core/theme/use-tema';
import { TonoEstado } from '@/features/ventas/ventas.types';

interface Props {
  tono: TonoEstado;
  etiqueta: string;
}

export function BadgeEstado({ tono, etiqueta }: Props) {
  const c = useTema();
  const styles = useEstilos(crear);
  const fondos: Record<TonoEstado, string> = {
    ok: '#E3EFE6',
    warn: '#F4EAD4',
    danger: '#F3DDDD',
    muted: c.surfaceAlt,
  };
  const textos: Record<TonoEstado, string> = {
    ok: c.ok,
    warn: c.warn,
    danger: c.danger,
    muted: c.muted,
  };
  return (
    <View style={[styles.badge, { backgroundColor: fondos[tono] }]}>
      <Text style={[styles.texto, { color: textos[tono] }]}>{etiqueta}</Text>
    </View>
  );
}

const crear = (c: Tema) =>
  StyleSheet.create({
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
    texto: { fontSize: 12, fontWeight: '700', fontFamily: c.sansBold },
  });
