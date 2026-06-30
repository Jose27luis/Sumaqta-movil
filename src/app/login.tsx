import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listarMozos, login, Mozo } from '@/core/auth/auth.api';
import { useSession } from '@/core/auth/session';
import { env } from '@/core/config/env';
import { radios } from '@/core/theme/tokens';
import { Tema, useEstilos, useTema } from '@/core/theme/use-tema';

const PIN_MIN = 4;
const PIN_MAX = 6;

export default function LoginScreen() {
  const c = useTema();
  const styles = useEstilos(crear);
  const iniciar = useSession((s) => s.iniciar);
  const tenantGuardado = useSession((s) => s.tenant);

  const [dominio, setDominio] = useState(tenantGuardado);
  const [confirmado, setConfirmado] = useState(tenantGuardado.trim() !== '');
  const [mozos, setMozos] = useState<Mozo[]>([]);
  const [cargandoMozos, setCargandoMozos] = useState(false);
  const [errorMozos, setErrorMozos] = useState<string | null>(null);
  const [mozoSel, setMozoSel] = useState<Mozo | null>(null);
  const [pin, setPin] = useState('');
  const [entrando, setEntrando] = useState(false);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);

  const sufijo = dominio.includes('.') ? '' : `.${env.baseDomain}`;

  async function cargarMozos(tenant: string) {
    setCargandoMozos(true);
    setErrorMozos(null);
    try {
      const lista = await listarMozos(tenant);
      setMozos(lista);
    } catch {
      setErrorMozos('No se pudo cargar la lista de mozos. Revisa el restaurante.');
    } finally {
      setCargandoMozos(false);
    }
  }

  useEffect(() => {
    if (confirmado && dominio.trim() !== '') {
      void cargarMozos(dominio.trim());
    }
  }, [confirmado]);

  const onContinuar = () => {
    if (dominio.trim() === '') {
      return;
    }
    setConfirmado(true);
  };

  const onCambiarRestaurante = () => {
    setConfirmado(false);
    setMozoSel(null);
    setMozos([]);
    setPin('');
    setErrorLogin(null);
  };

  const onSeleccionarMozo = (m: Mozo) => {
    setMozoSel(m);
    setPin('');
    setErrorLogin(null);
  };

  const onDigito = (d: string) => {
    if (pin.length >= PIN_MAX) {
      return;
    }
    setErrorLogin(null);
    setPin(pin + d);
  };

  const onBorrar = () => setPin(pin.slice(0, -1));

  const onIngresar = async () => {
    if (!mozoSel || pin.length < PIN_MIN || entrando) {
      return;
    }
    setEntrando(true);
    setErrorLogin(null);
    try {
      const resultado = await login(dominio.trim(), mozoSel.email, pin);
      await iniciar(dominio.trim(), resultado.token, resultado.usuario);
    } catch {
      setErrorLogin('PIN incorrecto. Inténtalo de nuevo.');
      setPin('');
      setEntrando(false);
    }
  };

  if (!confirmado) {
    return (
      <SafeAreaView style={styles.root}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.contentCentro} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <View style={styles.logo}>
                <Image
                  source={require('../../assets/images/amantix-logo.png')}
                  style={styles.logoImg}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>Sumaqta</Text>
              <Text style={styles.subtitle}>Toma de pedidos para tu restaurante</Text>
            </View>

            <Text style={styles.label}>Restaurante</Text>
            <View style={styles.campo}>
              <TextInput
                style={[styles.input, styles.mono]}
                value={dominio}
                onChangeText={setDominio}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Restaurante o subdominio"
              />
              {sufijo ? <Text style={styles.sufijo}>{sufijo}</Text> : null}
            </View>

            <Pressable
              style={[styles.button, dominio.trim() === '' && styles.buttonDisabled]}
              onPress={onContinuar}
              disabled={dominio.trim() === ''}
            >
              <Text style={styles.buttonText}>Continuar</Text>
              <Ionicons name="arrow-forward" size={17} color={c.onBrand} />
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (!mozoSel) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.headerLista}>
          <Text style={styles.titleLista}>¿Quién eres?</Text>
          <Pressable style={styles.cambiar} onPress={onCambiarRestaurante}>
            <Ionicons name="swap-horizontal" size={15} color={c.accent} />
            <Text style={styles.cambiarText}>{dominio.trim()}</Text>
          </Pressable>
        </View>

        {cargandoMozos ? (
          <View style={styles.estado}>
            <ActivityIndicator color={c.brand} />
          </View>
        ) : errorMozos ? (
          <View style={styles.estado}>
            <Text style={styles.estadoText}>{errorMozos}</Text>
            <Pressable style={styles.reintentar} onPress={() => void cargarMozos(dominio.trim())}>
              <Text style={styles.reintentarText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : mozos.length === 0 ? (
          <View style={styles.estado}>
            <Text style={styles.estadoText}>No hay mozos registrados en este restaurante.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.grid}>
            {mozos.map((m) => (
              <Pressable key={m.email} style={styles.mozo} onPress={() => onSeleccionarMozo(m)}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{(m.nombre || m.email).slice(0, 1).toUpperCase()}</Text>
                </View>
                <Text style={styles.mozoNombre} numberOfLines={1}>
                  {m.nombre || m.email}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.pinHeader}>
        <Pressable style={styles.iconoBtn} onPress={() => setMozoSel(null)} accessibilityLabel="Volver">
          <Ionicons name="chevron-back" size={24} color={c.text} />
        </Pressable>
      </View>

      <View style={styles.pinTop}>
        <View style={styles.avatarGrande}>
          <Text style={styles.avatarGrandeText}>
            {(mozoSel.nombre || mozoSel.email).slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.pinNombre}>{mozoSel.nombre || mozoSel.email}</Text>
        <Text style={styles.pinSub}>Ingresa tu PIN</Text>

        <View style={styles.puntos}>
          {Array.from({ length: PIN_MAX }).map((_, i) => (
            <View key={i} style={[styles.punto, i < pin.length && styles.puntoLleno]} />
          ))}
        </View>

        {errorLogin ? <Text style={styles.error}>{errorLogin}</Text> : null}
      </View>

      <View style={styles.pad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <Pressable key={d} style={styles.tecla} onPress={() => onDigito(d)}>
            <Text style={styles.teclaText}>{d}</Text>
          </Pressable>
        ))}
        <View style={styles.teclaVacia} />
        <Pressable style={styles.tecla} onPress={() => onDigito('0')}>
          <Text style={styles.teclaText}>0</Text>
        </Pressable>
        <Pressable style={styles.tecla} onPress={onBorrar} accessibilityLabel="Borrar">
          <Ionicons name="backspace-outline" size={26} color={c.text} />
        </Pressable>
      </View>

      <Pressable
        style={[styles.button, styles.pinBoton, (pin.length < PIN_MIN || entrando) && styles.buttonDisabled]}
        onPress={onIngresar}
        disabled={pin.length < PIN_MIN || entrando}
      >
        {entrando ? (
          <ActivityIndicator color={c.onBrand} />
        ) : (
          <>
            <Text style={styles.buttonText}>Ingresar</Text>
            <Ionicons name="arrow-forward" size={17} color={c.onBrand} />
          </>
        )}
      </Pressable>
    </SafeAreaView>
  );
}

const crear = (c: Tema) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    flex: { flex: 1 },
    contentCentro: { padding: 28, paddingTop: 60, paddingBottom: 40, flexGrow: 1, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 28 },
    logo: {
      width: 96,
      height: 96,
      borderRadius: 22,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      overflow: 'hidden',
    },
    logoImg: { width: 80, height: 80 },
    title: { fontSize: 27, fontWeight: '800', color: c.text, letterSpacing: -0.5, textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#7A7163', fontWeight: '500', marginTop: 4, textAlign: 'center' },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: '#7A7163',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      marginBottom: 7,
      marginTop: 16,
    },
    campo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: '#E0D8C8',
      borderRadius: 13,
      paddingHorizontal: 14,
      height: 52,
    },
    input: { flex: 1, fontSize: 15, color: c.text },
    mono: { fontFamily: c.mono },
    sufijo: { fontFamily: c.mono, fontSize: 15, color: c.faint },
    button: {
      flexDirection: 'row',
      height: 54,
      borderRadius: 14,
      backgroundColor: c.brand,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 28,
    },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: c.onBrand, fontSize: 16, fontWeight: '700' },
    headerLista: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 8,
      gap: 8,
    },
    titleLista: { fontSize: 26, fontWeight: '800', color: c.text, letterSpacing: -0.6 },
    cambiar: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start' },
    cambiarText: { fontFamily: c.mono, fontSize: 13, color: c.accent, fontWeight: '600' },
    estado: { paddingVertical: 60, alignItems: 'center', gap: 14, paddingHorizontal: 24 },
    estadoText: { color: c.muted, fontSize: 14, textAlign: 'center' },
    reintentar: {
      backgroundColor: c.surfaceAlt,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: radios.sm,
    },
    reintentarText: { color: c.text, fontWeight: '700', fontSize: 14 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 18, gap: 14 },
    mozo: {
      width: '47%',
      backgroundColor: c.surface,
      borderRadius: radios.lg,
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: 22,
      alignItems: 'center',
      gap: 10,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { color: c.onBrand, fontSize: 22, fontWeight: '800' },
    mozoNombre: { fontSize: 15, fontWeight: '700', color: c.text, maxWidth: '90%' },
    pinHeader: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 8 },
    iconoBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    pinTop: { alignItems: 'center', gap: 8, paddingTop: 8 },
    avatarGrande: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: c.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarGrandeText: { color: c.onBrand, fontSize: 28, fontWeight: '800' },
    pinNombre: { fontSize: 19, fontWeight: '800', color: c.text, marginTop: 4 },
    pinSub: { fontSize: 14, color: c.muted },
    puntos: { flexDirection: 'row', gap: 12, marginTop: 14 },
    punto: {
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: c.faint,
      backgroundColor: 'transparent',
    },
    puntoLleno: { backgroundColor: c.brand, borderColor: c.brand },
    error: { color: c.danger, fontSize: 13, fontWeight: '600', marginTop: 12 },
    pad: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 40,
      paddingTop: 22,
      gap: 14,
      justifyContent: 'center',
    },
    tecla: {
      width: '27%',
      aspectRatio: 1.7,
      backgroundColor: c.surface,
      borderRadius: radios.lg,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    teclaVacia: { width: '27%', aspectRatio: 1.7 },
    teclaText: { fontFamily: c.monoSemi, fontSize: 26, color: c.text },
    pinBoton: { marginHorizontal: 28, marginTop: 'auto', marginBottom: 24 },
  });
