import { useMemo, useState } from 'react';
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
import { Producto } from '@/features/catalogo/catalogo.types';
import { useCategorias, useProductos } from '@/features/catalogo/use-catalogo';
import { ItemPedido, totalImporte, totalItems, useBag } from '@/features/pedido/bag-store';
import { useSalon } from '@/features/salon/use-salon';

const TODAS = -1;

export default function MesaScreen() {
  const c = useTema();
  const styles = useEstilos(crear);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mesaId = id ?? '';

  const { data: salon } = useSalon();
  const productosQuery = useProductos();
  const categoriasQuery = useCategorias();

  const items = useBag((s) => s.porMesa[mesaId] ?? []);
  const agregar = useBag((s) => s.agregar);
  const limpiar = useBag((s) => s.limpiar);

  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState(TODAS);
  const [carritoOpen, setCarritoOpen] = useState(false);

  const mesa = salon?.mesas.find((m) => String(m.id) === mesaId);
  const titulo = mesa?.nombre || `Mesa ${mesaId}`;

  const cantidades = useMemo(() => {
    const mapa: Record<number, number> = {};
    items.forEach((i) => {
      mapa[i.id] = i.cantidad;
    });
    return mapa;
  }, [items]);

  const productos = useMemo(() => {
    const lista = productosQuery.data ?? [];
    const texto = busqueda.trim().toLowerCase();
    return lista.filter((p) => {
      const coincideCat = categoria === TODAS || p.categoriaId === categoria;
      const coincideTexto = texto === '' || p.nombre.toLowerCase().includes(texto);
      return coincideCat && coincideTexto;
    });
  }, [productosQuery.data, busqueda, categoria]);

  const nItems = totalItems(items);
  const total = totalImporte(items);

  const enviarComanda = () => {
    Alert.alert(
      'Enviar comanda',
      `${nItems} ítems · ${fmtMoneda(total)}\n\nEl registro de la comanda en el servidor y la impresión se conectarán al validar el flujo con un restaurante de prueba.`,
      [
        { text: 'Seguir editando', style: 'cancel' },
        {
          text: 'Vaciar pedido',
          style: 'destructive',
          onPress: () => {
            limpiar(mesaId);
            setCarritoOpen(false);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.iconoBtn} onPress={() => router.back()} accessibilityLabel="Volver">
          <Ionicons name="chevron-back" size={24} color={c.text} />
        </Pressable>
        <Text style={styles.titulo}>{titulo}</Text>
        <View style={styles.iconoBtn} />
      </View>

      <View style={styles.buscador}>
        <Ionicons name="search" size={18} color={c.faint} />
        <TextInput
          style={styles.buscadorInput}
          value={busqueda}
          onChangeText={setBusqueda}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Buscar producto"
        />
        {busqueda !== '' ? (
          <Pressable onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={18} color={c.faint} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <ChipCategoria nombre="Todas" activo={categoria === TODAS} onPress={() => setCategoria(TODAS)} />
        {(categoriasQuery.data ?? []).map((cat) => (
          <ChipCategoria
            key={cat.id}
            nombre={cat.nombre}
            activo={categoria === cat.id}
            onPress={() => setCategoria(cat.id)}
          />
        ))}
      </ScrollView>

      {productosQuery.isLoading ? (
        <View style={styles.estado}>
          <ActivityIndicator color={c.brand} />
        </View>
      ) : productosQuery.isError ? (
        <View style={styles.estado}>
          <Text style={styles.estadoText}>No se pudo cargar el catálogo.</Text>
          <Pressable style={styles.reintentar} onPress={() => void productosQuery.refetch()}>
            <Text style={styles.reintentarText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.lista, { paddingBottom: insets.bottom + (nItems > 0 ? 96 : 24) }]}
          keyboardShouldPersistTaps="handled"
        >
          {productos.length === 0 ? (
            <Text style={styles.vacio}>No hay productos para mostrar.</Text>
          ) : (
            productos.map((p) => (
              <ProductoFila
                key={p.id}
                producto={p}
                enCarrito={cantidades[p.id] ?? 0}
                onAgregar={() => agregar(mesaId, p)}
              />
            ))
          )}
        </ScrollView>
      )}

      {nItems > 0 ? (
        <View style={[styles.barra, { paddingBottom: insets.bottom + 12 }]}>
          <Pressable style={styles.barraBtn} onPress={() => setCarritoOpen(true)}>
            <View style={styles.barraBadge}>
              <Text style={styles.barraBadgeText}>{nItems}</Text>
            </View>
            <Text style={styles.barraText}>Ver pedido</Text>
            <Text style={styles.barraTotal}>{fmtMoneda(total)}</Text>
          </Pressable>
        </View>
      ) : null}

      <Carrito
        visible={carritoOpen}
        mesaId={mesaId}
        items={items}
        total={total}
        onCerrar={() => setCarritoOpen(false)}
        onEnviar={enviarComanda}
      />
    </SafeAreaView>
  );
}

function ChipCategoria({ nombre, activo, onPress }: { nombre: string; activo: boolean; onPress: () => void }) {
  const styles = useEstilos(crear);
  return (
    <Pressable style={[styles.chip, activo && styles.chipActivo]} onPress={onPress}>
      <Text style={[styles.chipText, activo && styles.chipTextActivo]}>{nombre}</Text>
    </Pressable>
  );
}

function ProductoFila({
  producto,
  enCarrito,
  onAgregar,
}: {
  producto: Producto;
  enCarrito: number;
  onAgregar: () => void;
}) {
  const c = useTema();
  const styles = useEstilos(crear);
  return (
    <Pressable style={styles.prod} onPress={onAgregar}>
      <View style={styles.prodInfo}>
        <Text style={styles.prodNombre}>{producto.nombre}</Text>
        <Text style={styles.prodPrecio}>{fmtMoneda(producto.precio)}</Text>
      </View>
      {enCarrito > 0 ? (
        <View style={styles.prodBadge}>
          <Text style={styles.prodBadgeText}>{enCarrito}</Text>
        </View>
      ) : (
        <View style={styles.prodAdd}>
          <Ionicons name="add" size={20} color={c.onBrand} />
        </View>
      )}
    </Pressable>
  );
}

function Carrito({
  visible,
  mesaId,
  items,
  total,
  onCerrar,
  onEnviar,
}: {
  visible: boolean;
  mesaId: string;
  items: ItemPedido[];
  total: number;
  onCerrar: () => void;
  onEnviar: () => void;
}) {
  const styles = useEstilos(crear);
  const insets = useSafeAreaInsets();
  const alturaTeclado = useAlturaTeclado();
  const incrementar = useBag((s) => s.incrementar);
  const decrementar = useBag((s) => s.decrementar);
  const setNota = useBag((s) => s.setNota);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <Pressable style={styles.modalFondo} onPress={onCerrar}>
        <Pressable
          style={[styles.modalHoja, { paddingBottom: insets.bottom + 16, marginBottom: alturaTeclado }]}
          onPress={() => undefined}
        >
          <View style={styles.modalBarra} />
          <Text style={styles.modalTitulo}>Pedido</Text>
          <ScrollView style={styles.modalLista} keyboardShouldPersistTaps="handled">
            {items.map((item) => (
              <ItemCarrito
                key={item.id}
                item={item}
                onMas={() => incrementar(mesaId, item.id)}
                onMenos={() => decrementar(mesaId, item.id)}
                onNota={(t) => setNota(mesaId, item.id, t)}
              />
            ))}
          </ScrollView>
          <View style={styles.modalTotalFila}>
            <Text style={styles.modalTotalLabel}>Total</Text>
            <Text style={styles.modalTotalValor}>{fmtMoneda(total)}</Text>
          </View>
          <Pressable style={styles.enviarBtn} onPress={onEnviar}>
            <Ionicons name="send" size={18} color="#F3EEE3" />
            <Text style={styles.enviarText}>Enviar comanda</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ItemCarrito({
  item,
  onMas,
  onMenos,
  onNota,
}: {
  item: ItemPedido;
  onMas: () => void;
  onMenos: () => void;
  onNota: (texto: string) => void;
}) {
  const c = useTema();
  const styles = useEstilos(crear);
  return (
    <View style={styles.itemBox}>
      <View style={styles.itemTop}>
        <Text style={styles.itemNombre}>{item.nombre}</Text>
        <Text style={styles.itemImporte}>{fmtMoneda(item.precio * item.cantidad)}</Text>
      </View>
      <View style={styles.itemControles}>
        <Pressable style={styles.itemPaso} onPress={onMenos}>
          <Ionicons name="remove" size={18} color={c.text} />
        </Pressable>
        <Text style={styles.itemCantidad}>{item.cantidad}</Text>
        <Pressable style={styles.itemPaso} onPress={onMas}>
          <Ionicons name="add" size={18} color={c.text} />
        </Pressable>
        <TextInput
          style={styles.itemNota}
          value={item.nota}
          onChangeText={onNota}
          accessibilityLabel={`Nota para ${item.nombre}`}
        />
      </View>
    </View>
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
    buscador: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radios.md,
      paddingHorizontal: 14,
      height: 46,
      marginHorizontal: 16,
      marginTop: 6,
    },
    buscadorInput: { flex: 1, fontSize: 15, color: c.text },
    chips: { paddingHorizontal: 16, gap: 8, paddingVertical: 12 },
    chip: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    chipActivo: { backgroundColor: c.brand, borderColor: c.brand },
    chipText: { fontSize: 13, fontWeight: '600', color: c.muted },
    chipTextActivo: { color: c.onBrand },
    estado: { paddingVertical: 60, alignItems: 'center', gap: 14 },
    estadoText: { color: c.muted, fontSize: 14 },
    reintentar: {
      backgroundColor: c.surfaceAlt,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: radios.sm,
    },
    reintentarText: { color: c.text, fontWeight: '700', fontSize: 14 },
    lista: { paddingHorizontal: 16, gap: 10 },
    vacio: { fontSize: 14, color: c.muted, textAlign: 'center', paddingVertical: 40 },
    prod: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radios.md,
      padding: 14,
    },
    prodInfo: { flex: 1, gap: 4 },
    prodNombre: { fontSize: 15, fontWeight: '700', color: c.text },
    prodPrecio: { fontFamily: c.monoSemi, fontSize: 14, color: c.accent },
    prodAdd: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: c.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    prodBadge: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    prodBadgeText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
    barra: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: c.surface,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    barraBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: c.brand,
      borderRadius: radios.md,
      paddingHorizontal: 18,
      height: 54,
    },
    barraBadge: {
      minWidth: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: c.onBrand,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
    },
    barraBadgeText: { color: c.brand, fontSize: 14, fontWeight: '800' },
    barraText: { flex: 1, color: c.onBrand, fontSize: 16, fontWeight: '700' },
    barraTotal: { fontFamily: c.monoSemi, color: c.onBrand, fontSize: 16 },
    modalFondo: { flex: 1, backgroundColor: 'rgba(33,29,23,0.45)', justifyContent: 'flex-end' },
    modalHoja: {
      backgroundColor: c.bg,
      borderTopLeftRadius: radios.xl,
      borderTopRightRadius: radios.xl,
      padding: 20,
      gap: 12,
      maxHeight: '82%',
    },
    modalBarra: { width: 40, height: 4, borderRadius: 2, backgroundColor: c.border, alignSelf: 'center' },
    modalTitulo: { fontSize: 20, fontWeight: '800', color: c.text },
    modalLista: { maxHeight: 360 },
    itemBox: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radios.md,
      padding: 14,
      marginBottom: 10,
      gap: 10,
    },
    itemTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    itemNombre: { flex: 1, fontSize: 15, fontWeight: '700', color: c.text },
    itemImporte: { fontFamily: c.monoSemi, fontSize: 14, color: c.text },
    itemControles: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    itemPaso: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: c.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemCantidad: { fontFamily: c.monoSemi, fontSize: 16, color: c.text, minWidth: 22, textAlign: 'center' },
    itemNota: {
      flex: 1,
      height: 38,
      backgroundColor: c.surfaceAlt,
      borderRadius: 10,
      paddingHorizontal: 12,
      fontSize: 13.5,
      color: c.text,
    },
    modalTotalFila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    modalTotalLabel: { fontSize: 15, fontWeight: '700', color: c.muted },
    modalTotalValor: { fontFamily: c.monoSemi, fontSize: 22, color: c.text },
    enviarBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: c.brand,
      borderRadius: radios.md,
      paddingVertical: 16,
    },
    enviarText: { color: c.onBrand, fontSize: 16, fontWeight: '700' },
  });
