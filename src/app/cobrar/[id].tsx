import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { radios } from '@/core/theme/tokens';
import { Tema, useEstilos, useTema } from '@/core/theme/use-tema';
import { fmtMoneda } from '@/shared/format';
import { useAlturaTeclado } from '@/shared/usar-teclado';
import { ClienteBusqueda, TipoComprobante } from '@/features/cobro/cobro.types';
import { useClientes, useCobrar, useCuentaMesa, useMediosPago } from '@/features/cobro/use-cobro';
import { useSalon } from '@/features/salon/use-salon';

const TIPOS: { id: TipoComprobante; nombre: string }[] = [
  { id: 'boleta', nombre: 'Boleta' },
  { id: 'factura', nombre: 'Factura' },
  { id: 'nota', nombre: 'Nota de venta' },
];

export default function CobrarScreen() {
  const c = useTema();
  const styles = useEstilos(crear);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mesaId = id ?? '';

  const { data: salon, refetch: refetchSalon } = useSalon();
  const cuentaQuery = useCuentaMesa(mesaId);
  const mediosQuery = useMediosPago();
  const cobrar = useCobrar();

  const [tipo, setTipo] = useState<TipoComprobante>('boleta');
  const [medioPagoId, setMedioPagoId] = useState('');
  const [cliente, setCliente] = useState<ClienteBusqueda | null>(null);
  const [clienteOpen, setClienteOpen] = useState(false);

  const mesa = salon?.mesas.find((m) => String(m.id) === mesaId);
  const titulo = mesa?.nombre || `Mesa ${mesaId}`;
  const cuenta = cuentaQuery.data;
  const total = cuenta?.total ?? 0;

  const faltaCliente = tipo === 'factura' && cliente === null;
  const puedeCobrar =
    medioPagoId !== '' && !faltaCliente && (cuenta?.items.length ?? 0) > 0 && !cobrar.isPending;

  const onCobrar = () => {
    if (!puedeCobrar) {
      return;
    }
    cobrar.mutate(
      {
        mesaId,
        tipo,
        medioPagoId,
        clienteId: cliente?.id ?? null,
        items: (cuenta?.items ?? []).map((i) => ({ itemId: i.id, cantidad: i.cantidad })),
      },
      {
        onSuccess: (res) => {
          if (res.estado === 'deshabilitado') {
            Alert.alert(
              'Cobro en validación',
              `Cuenta lista: ${fmtMoneda(total)}.\n\nLa emisión del comprobante y el cierre de mesa están desactivados hasta validar el flujo con un restaurante de prueba. Se habilitan con env.cobroHabilitado.`
            );
            return;
          }
          void refetchSalon();
          Alert.alert('Mesa cobrada', `${titulo} cerrada por ${fmtMoneda(total)}.`, [
            { text: 'Listo', onPress: () => router.replace('/(tabs)') },
          ]);
        },
        onError: (err) =>
          Alert.alert('No se pudo cobrar', err instanceof Error ? err.message : 'Error desconocido'),
      }
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.iconoBtn} onPress={() => router.back()} accessibilityLabel="Volver">
          <Ionicons name="chevron-back" size={24} color={c.text} />
        </Pressable>
        <Text style={styles.titulo}>Cobrar · {titulo}</Text>
        <View style={styles.iconoBtn} />
      </View>

      {cuentaQuery.isLoading ? (
        <View style={styles.estado}>
          <ActivityIndicator color={c.brand} />
        </View>
      ) : cuentaQuery.isError ? (
        <View style={styles.estado}>
          <Text style={styles.estadoText}>No se pudo cargar la cuenta.</Text>
          <Pressable style={styles.reintentar} onPress={() => void cuentaQuery.refetch()}>
            <Text style={styles.reintentarText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
          <Text style={styles.seccion}>Cuenta</Text>
          <View style={styles.card}>
            {(cuenta?.items ?? []).length === 0 ? (
              <Text style={styles.vacio}>La mesa no tiene consumo registrado.</Text>
            ) : (
              (cuenta?.items ?? []).map((item, i) => (
                <View
                  key={`${item.id}-${i}`}
                  style={[styles.linea, i < (cuenta?.items.length ?? 0) - 1 && styles.lineaBorde]}
                >
                  <Text style={styles.lineaCant}>{item.cantidad}</Text>
                  <Text style={styles.lineaNombre}>{item.nombre}</Text>
                  <Text style={styles.lineaImporte}>{fmtMoneda(item.precio * item.cantidad)}</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValor}>{fmtMoneda(total)}</Text>
          </View>

          <Text style={styles.seccion}>Comprobante</Text>
          <View style={styles.fila}>
            {TIPOS.map((t) => (
              <Pressable
                key={t.id}
                style={[styles.opcion, tipo === t.id && styles.opcionActiva]}
                onPress={() => setTipo(t.id)}
              >
                <Text style={[styles.opcionText, tipo === t.id && styles.opcionTextActivo]}>
                  {t.nombre}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.seccion}>Cliente{tipo === 'factura' ? '' : ' (opcional)'}</Text>
          <Pressable style={styles.cliente} onPress={() => setClienteOpen(true)}>
            <Ionicons name="person-outline" size={18} color={c.muted} />
            <Text style={[styles.clienteText, !cliente && styles.clientePlaceholder]}>
              {cliente ? `${cliente.nombre} · ${cliente.numero}` : 'Seleccionar cliente'}
            </Text>
            {cliente ? (
              <Pressable onPress={() => setCliente(null)} hitSlop={10}>
                <Ionicons name="close-circle" size={18} color={c.faint} />
              </Pressable>
            ) : (
              <Ionicons name="chevron-forward" size={18} color={c.faint} />
            )}
          </Pressable>
          {faltaCliente ? <Text style={styles.aviso}>La factura requiere un cliente con RUC.</Text> : null}

          <Text style={styles.seccion}>Medio de pago</Text>
          {mediosQuery.isLoading ? (
            <ActivityIndicator color={c.brand} style={styles.mediosCarga} />
          ) : (
            <View style={styles.medios}>
              {(mediosQuery.data ?? []).map((m) => (
                <Pressable
                  key={m.id}
                  style={[styles.medio, medioPagoId === m.id && styles.medioActivo]}
                  onPress={() => setMedioPagoId(m.id)}
                >
                  <Ionicons
                    name={m.esEfectivo ? 'cash-outline' : m.tieneTarjeta ? 'card-outline' : 'wallet-outline'}
                    size={18}
                    color={medioPagoId === m.id ? c.onBrand : c.text}
                  />
                  <Text style={[styles.medioText, medioPagoId === m.id && styles.medioTextActivo]}>
                    {m.descripcion}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <Pressable
          style={[styles.cobrarBtn, !puedeCobrar && styles.cobrarBtnOff]}
          onPress={onCobrar}
          disabled={!puedeCobrar}
        >
          {cobrar.isPending ? (
            <ActivityIndicator color={c.onBrand} />
          ) : (
            <>
              <Text style={styles.cobrarText}>Cobrar y cerrar</Text>
              <Text style={styles.cobrarTotal}>{fmtMoneda(total)}</Text>
            </>
          )}
        </Pressable>
      </View>

      <ModalClientes
        visible={clienteOpen}
        onCerrar={() => setClienteOpen(false)}
        onElegir={(cl) => {
          setCliente(cl);
          setClienteOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

function ModalClientes({
  visible,
  onCerrar,
  onElegir,
}: {
  visible: boolean;
  onCerrar: () => void;
  onElegir: (cliente: ClienteBusqueda) => void;
}) {
  const c = useTema();
  const styles = useEstilos(crear);
  const insets = useSafeAreaInsets();
  const alturaTeclado = useAlturaTeclado();
  const [texto, setTexto] = useState('');
  const { data, isFetching } = useClientes(texto);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <Pressable style={styles.modalFondo} onPress={onCerrar}>
        <Pressable
          style={[styles.modalHoja, { paddingBottom: insets.bottom + 16, marginBottom: alturaTeclado }]}
          onPress={() => undefined}
        >
          <View style={styles.modalBarra} />
          <Text style={styles.modalTitulo}>Buscar cliente</Text>
          <View style={styles.buscador}>
            <Ionicons name="search" size={18} color={c.faint} />
            <TextInput
              style={styles.buscadorInput}
              value={texto}
              onChangeText={setTexto}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Buscar cliente por nombre o documento"
            />
            {isFetching ? <ActivityIndicator color={c.brand} size="small" /> : null}
          </View>
          <ScrollView style={styles.modalLista} keyboardShouldPersistTaps="handled">
            {texto.trim().length < 3 ? (
              <Text style={styles.modalAyuda}>Escribe al menos 3 caracteres.</Text>
            ) : (data ?? []).length === 0 && !isFetching ? (
              <Text style={styles.modalAyuda}>Sin resultados.</Text>
            ) : (
              (data ?? []).map((cl) => (
                <Pressable key={cl.id} style={styles.clienteFila} onPress={() => onElegir(cl)}>
                  <Text style={styles.clienteNombre}>{cl.nombre}</Text>
                  <Text style={styles.clienteNumero}>{cl.numero}</Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
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
      paddingBottom: 4,
    },
    iconoBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    titulo: { fontSize: 18, fontWeight: '800', color: c.text },
    estado: { paddingVertical: 60, alignItems: 'center', gap: 14 },
    estadoText: { color: c.muted, fontSize: 14 },
    reintentar: {
      backgroundColor: c.surfaceAlt,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: radios.sm,
    },
    reintentarText: { color: c.text, fontWeight: '700', fontSize: 14 },
    content: { padding: 20, gap: 12 },
    seccion: {
      fontSize: 13,
      fontWeight: '700',
      color: c.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      marginTop: 8,
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: radios.lg,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 16,
    },
    vacio: { fontSize: 13.5, color: c.muted, paddingVertical: 18 },
    linea: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
    lineaBorde: { borderBottomWidth: 1, borderBottomColor: c.border },
    lineaCant: { fontFamily: c.monoSemi, fontSize: 14, color: c.muted, minWidth: 22 },
    lineaNombre: { flex: 1, fontSize: 15, color: c.text, fontWeight: '600' },
    lineaImporte: { fontFamily: c.monoSemi, fontSize: 14, color: c.text },
    totalBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: c.brand,
      borderRadius: radios.lg,
      padding: 18,
    },
    totalLabel: { fontSize: 14, color: c.onBrand, fontWeight: '700', textTransform: 'uppercase' },
    totalValor: { fontFamily: c.monoSemi, fontSize: 26, color: c.onBrand },
    fila: { flexDirection: 'row', gap: 10 },
    opcion: {
      flex: 1,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radios.md,
      paddingVertical: 13,
      alignItems: 'center',
    },
    opcionActiva: { backgroundColor: c.brand, borderColor: c.brand },
    opcionText: { fontSize: 13.5, fontWeight: '700', color: c.muted },
    opcionTextActivo: { color: c.onBrand },
    cliente: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radios.md,
      paddingHorizontal: 14,
      height: 52,
    },
    clienteText: { flex: 1, fontSize: 15, color: c.text, fontWeight: '600' },
    clientePlaceholder: { color: c.muted, fontWeight: '400' },
    aviso: { fontSize: 12.5, color: c.warn, fontWeight: '600' },
    mediosCarga: { marginVertical: 16, alignSelf: 'flex-start' },
    medios: { gap: 10 },
    medio: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radios.md,
      paddingHorizontal: 16,
      height: 50,
    },
    medioActivo: { backgroundColor: c.brand, borderColor: c.brand },
    medioText: { fontSize: 15, fontWeight: '600', color: c.text },
    medioTextActivo: { color: c.onBrand },
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.surface,
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    cobrarBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: c.brand,
      borderRadius: radios.md,
      paddingHorizontal: 20,
      height: 54,
    },
    cobrarBtnOff: { opacity: 0.5 },
    cobrarText: { color: c.onBrand, fontSize: 16, fontWeight: '700' },
    cobrarTotal: { fontFamily: c.monoSemi, color: c.onBrand, fontSize: 18 },
    modalFondo: { flex: 1, backgroundColor: 'rgba(33,29,23,0.45)', justifyContent: 'flex-end' },
    modalHoja: {
      backgroundColor: c.bg,
      borderTopLeftRadius: radios.xl,
      borderTopRightRadius: radios.xl,
      padding: 20,
      gap: 12,
      maxHeight: '80%',
    },
    modalBarra: { width: 40, height: 4, borderRadius: 2, backgroundColor: c.border, alignSelf: 'center' },
    modalTitulo: { fontSize: 20, fontWeight: '800', color: c.text },
    buscador: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radios.md,
      paddingHorizontal: 14,
      height: 48,
    },
    buscadorInput: { flex: 1, fontSize: 15, color: c.text },
    modalLista: { maxHeight: 320 },
    modalAyuda: { fontSize: 13.5, color: c.muted, textAlign: 'center', paddingVertical: 24 },
    clienteFila: {
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    clienteNombre: { fontSize: 15, fontWeight: '700', color: c.text },
    clienteNumero: { fontFamily: c.mono, fontSize: 13, color: c.muted, marginTop: 2 },
  });
