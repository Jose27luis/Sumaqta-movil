import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/core/auth/session';
import { radios } from '@/core/theme/tokens';
import { Tema, useEstilos, useTema } from '@/core/theme/use-tema';

export default function MasScreen() {
  const c = useTema();
  const styles = useEstilos(crear);
  const usuario = useSession((s) => s.usuario);
  const tenant = useSession((s) => s.tenant);
  const cerrar = useSession((s) => s.cerrar);

  const confirmarSalir = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => void cerrar() },
    ]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Más</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.perfil}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={c.onBrand} />
          </View>
          <Text style={styles.nombre}>{usuario?.nombre || 'Mozo'}</Text>
          {usuario?.email ? <Text style={styles.sub}>{usuario.email}</Text> : null}
        </View>

        <View style={styles.card}>
          <Fila etiqueta="Restaurante" valor={tenant} />
          <Fila etiqueta="Rol" valor={usuario?.rol || 'Mozo'} />
          {usuario?.ruc ? <Fila etiqueta="RUC" valor={usuario.ruc} ultimo /> : null}
        </View>

        <Pressable style={styles.salir} onPress={confirmarSalir}>
          <Ionicons name="log-out-outline" size={20} color={c.danger} />
          <Text style={styles.salirText}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Fila({ etiqueta, valor, ultimo }: { etiqueta: string; valor: string; ultimo?: boolean }) {
  const styles = useEstilos(crear);
  return (
    <View style={[styles.fila, !ultimo && styles.filaBorde]}>
      <Text style={styles.filaEtiqueta}>{etiqueta}</Text>
      <Text style={styles.filaValor}>{valor}</Text>
    </View>
  );
}

const crear = (c: Tema) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
    titulo: { fontSize: 26, fontWeight: '800', color: c.text, letterSpacing: -0.6 },
    content: { padding: 20, gap: 18 },
    perfil: { alignItems: 'center', gap: 8, paddingVertical: 12 },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: c.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nombre: { fontSize: 19, fontWeight: '800', color: c.text },
    sub: { fontSize: 13.5, color: c.muted },
    card: {
      backgroundColor: c.surface,
      borderRadius: radios.lg,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 16,
    },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 15,
    },
    filaBorde: { borderBottomWidth: 1, borderBottomColor: c.border },
    filaEtiqueta: { fontSize: 14, color: c.muted, fontWeight: '600' },
    filaValor: { fontSize: 14.5, color: c.text, fontWeight: '700' },
    salir: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radios.md,
      paddingVertical: 15,
    },
    salirText: { color: c.danger, fontSize: 15, fontWeight: '700' },
  });
