import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/core/auth/session';
import { radios } from '@/core/theme/tokens';
import { Tema, useEstilos, useTema } from '@/core/theme/use-tema';
import { fmtMoneda } from '@/shared/format';
import { EstadoMesa, Mesa } from '@/features/salon/salon.types';
import { useSalon } from '@/features/salon/use-salon';

const TODOS = 'Todos';

function colorEstado(c: Tema, estado: EstadoMesa): string {
  if (estado === 'porCobrar') {
    return c.warn;
  }
  return estado === 'ocupada' ? c.accent : c.ok;
}

function rotuloEstado(estado: EstadoMesa): string {
  if (estado === 'porCobrar') {
    return 'Por cobrar';
  }
  return estado === 'ocupada' ? 'Ocupada' : 'Libre';
}

export default function SalonScreen() {
  const c = useTema();
  const styles = useEstilos(crear);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const usuario = useSession((s) => s.usuario);
  const { data, isLoading, isError, refetch, isRefetching } = useSalon();

  const [ambiente, setAmbiente] = useState(TODOS);

  const ambientes = useMemo(() => {
    const nombres = (data?.ambientes ?? []).map((a) => a.nombre).filter((n) => n.trim() !== '');
    return [TODOS, ...nombres];
  }, [data]);

  const mesas = useMemo(() => {
    const lista = data?.mesas ?? [];
    return ambiente === TODOS ? lista : lista.filter((m) => m.ambiente === ambiente);
  }, [data, ambiente]);

  const ocupadas = mesas.filter((m) => m.estado !== 'libre').length;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.titulo}>Salón</Text>
          {usuario?.nombre ? <Text style={styles.saludo}>Hola, {usuario.nombre}</Text> : null}
        </View>
        <Pressable style={styles.iconoBtn} onPress={() => void refetch()} accessibilityLabel="Actualizar">
          {isRefetching ? (
            <ActivityIndicator color={c.text} size="small" />
          ) : (
            <Ionicons name="refresh" size={20} color={c.text} />
          )}
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.estado}>
          <ActivityIndicator color={c.brand} />
        </View>
      ) : isError ? (
        <View style={styles.estado}>
          <Text style={styles.estadoText}>No se pudo cargar el salón.</Text>
          <Pressable style={styles.reintentar} onPress={() => void refetch()}>
            <Text style={styles.reintentarText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chips}
          >
            {ambientes.map((nombre) => {
              const activo = nombre === ambiente;
              return (
                <Pressable
                  key={nombre}
                  style={[styles.chip, activo && styles.chipActivo]}
                  onPress={() => setAmbiente(nombre)}
                >
                  <Text style={[styles.chipText, activo && styles.chipTextActivo]}>{nombre}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.resumen}>
            <Text style={styles.resumenText}>
              {mesas.length} mesas · {ocupadas} en servicio
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + 24 }]}
            showsVerticalScrollIndicator={false}
          >
            {mesas.length === 0 ? (
              <View style={styles.vacioBox}>
                <Ionicons name="grid-outline" size={36} color={c.faint} />
                <Text style={styles.vacioText}>No hay mesas en este ambiente.</Text>
              </View>
            ) : (
              mesas.map((mesa) => (
                <MesaCard
                  key={mesa.id}
                  mesa={mesa}
                  onPress={() => router.push(`/mesa/${mesa.id}`)}
                />
              ))
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

function MesaCard({ mesa, onPress }: { mesa: Mesa; onPress: () => void }) {
  const c = useTema();
  const styles = useEstilos(crear);
  const color = colorEstado(c, mesa.estado);
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardTop}>
        <Text style={styles.cardNombre}>{mesa.nombre || `Mesa ${mesa.id}`}</Text>
        <View style={[styles.punto, { backgroundColor: color }]} />
      </View>
      <Text style={[styles.cardEstado, { color }]}>{rotuloEstado(mesa.estado)}</Text>
      {mesa.estado !== 'libre' ? (
        <>
          <Text style={styles.cardTotal}>{fmtMoneda(mesa.total)}</Text>
          <View style={styles.cardMeta}>
            {mesa.personas > 0 ? (
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={13} color={c.muted} />
                <Text style={styles.metaText}>{mesa.personas}</Text>
              </View>
            ) : null}
            {mesa.mozo ? <Text style={styles.metaText}>{mesa.mozo}</Text> : null}
          </View>
        </>
      ) : (
        <Text style={styles.cardLibre}>Toca para abrir</Text>
      )}
    </Pressable>
  );
}

const crear = (c: Tema) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 8,
    },
    titulo: { fontSize: 26, fontWeight: '800', color: c.text, letterSpacing: -0.6 },
    saludo: { fontSize: 13.5, color: c.muted, marginTop: 2 },
    iconoBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    estado: { paddingVertical: 60, alignItems: 'center', gap: 14 },
    estadoText: { color: c.muted, fontSize: 14 },
    reintentar: {
      backgroundColor: c.surfaceAlt,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: radios.sm,
    },
    reintentarText: { color: c.text, fontWeight: '700', fontSize: 14 },
    chipsScroll: { flexGrow: 0 },
    chips: { paddingHorizontal: 20, gap: 8, paddingVertical: 4, alignItems: 'center' },
    chip: {
      paddingHorizontal: 14,
      height: 34,
      justifyContent: 'center',
      borderRadius: 999,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    chipActivo: { backgroundColor: c.brand, borderColor: c.brand },
    chipText: { fontSize: 13, fontWeight: '600', color: c.muted, lineHeight: 16 },
    chipTextActivo: { color: c.onBrand },
    resumen: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 4 },
    resumenText: { fontSize: 12.5, color: c.muted, fontWeight: '600' },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 14,
      paddingTop: 8,
      gap: 12,
    },
    card: {
      width: '47%',
      backgroundColor: c.surface,
      borderRadius: radios.lg,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      minHeight: 120,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardNombre: { fontSize: 17, fontWeight: '800', color: c.text },
    punto: { width: 10, height: 10, borderRadius: 5 },
    cardEstado: { fontSize: 12, fontWeight: '700', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.3 },
    cardTotal: { fontFamily: c.monoSemi, fontSize: 22, color: c.text, marginTop: 10 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    metaText: { fontSize: 12, color: c.muted, fontWeight: '600' },
    cardLibre: { fontSize: 12.5, color: c.faint, marginTop: 10 },
    vacioBox: { width: '100%', alignItems: 'center', gap: 12, paddingVertical: 50 },
    vacioText: { fontSize: 14, color: c.muted },
  });
