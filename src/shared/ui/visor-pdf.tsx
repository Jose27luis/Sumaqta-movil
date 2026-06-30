import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { radios } from '@/core/theme/tokens';
import { Tema, useEstilos, useTema } from '@/core/theme/use-tema';
import { compartirPdf, enviarWhatsApp } from '@/shared/compartir';

type Formato = 'a4' | 'ticket';

function visorUrl(pdf: string): string {
  if (Platform.OS === 'android') {
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdf)}`;
  }
  return pdf;
}

interface Props {
  visible: boolean;
  numero: string;
  a4Url: string;
  ticketUrl: string;
  onCerrar: () => void;
}

export function VisorPdf({ visible, numero, a4Url, ticketUrl, onCerrar }: Props) {
  const c = useTema();
  const styles = useEstilos(crear);
  const [formato, setFormato] = useState<Formato>('a4');
  const [cargando, setCargando] = useState(true);
  const [telefono, setTelefono] = useState('');
  const url = formato === 'a4' ? a4Url : ticketUrl;

  function cambiar(f: Formato) {
    if (f !== formato) {
      setCargando(true);
      setFormato(f);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCerrar}>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable style={styles.iconoBtn} onPress={onCerrar} accessibilityLabel="Cerrar">
            <Ionicons name="close" size={24} color={c.text} />
          </Pressable>
          <Text style={styles.titulo} numberOfLines={1}>
            {numero}
          </Text>
          <View style={styles.iconoBtn} />
        </View>

        <View style={styles.tabs}>
          <Pressable style={[styles.tab, formato === 'a4' && styles.tabOn]} onPress={() => cambiar('a4')}>
            <Text style={[styles.tabText, formato === 'a4' && styles.tabTextOn]}>A4</Text>
          </Pressable>
          {ticketUrl ? (
            <Pressable
              style={[styles.tab, formato === 'ticket' && styles.tabOn]}
              onPress={() => cambiar('ticket')}
            >
              <Text style={[styles.tabText, formato === 'ticket' && styles.tabTextOn]}>Ticket</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.visor}>
          <WebView
            key={url}
            source={{ uri: visorUrl(url) }}
            onLoadStart={() => setCargando(true)}
            onLoadEnd={() => setCargando(false)}
            style={styles.web}
          />
          {cargando ? (
            <View style={styles.carga}>
              <ActivityIndicator color={c.brand} size="large" />
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.telLabel}>WhatsApp del cliente (opcional)</Text>
          <View style={styles.telBox}>
            <Text style={styles.telPrefijo}>+51</Text>
            <TextInput
              style={styles.telInput}
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
              maxLength={12}
              accessibilityLabel="Número de WhatsApp del cliente"
            />
          </View>
          <Pressable
            style={styles.whatsapp}
            onPress={() => void enviarWhatsApp(url, `Tu comprobante ${numero}:`, telefono)}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
            <Text style={styles.whatsappText}>
              {telefono.trim() ? 'Enviar al número' : 'Enviar por WhatsApp'}
            </Text>
          </Pressable>
          <Pressable
            style={styles.compartir}
            onPress={() => void compartirPdf(url, `Comprobante ${numero}`)}
          >
            <Ionicons name="share-social-outline" size={20} color={c.text} />
            <Text style={styles.compartirText}>Compartir por otro medio</Text>
          </Pressable>
        </View>
      </SafeAreaView>
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
    paddingVertical: 8,
  },
  iconoBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 16, fontWeight: '700', color: c.text, flex: 1, textAlign: 'center' },
  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 10 },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: c.surfaceAlt,
  },
  tabOn: { backgroundColor: c.brand },
  tabText: { fontSize: 14, fontWeight: '700', color: c.muted },
  tabTextOn: { color: c.onBrand },
  visor: { flex: 1, backgroundColor: '#525659' },
  web: { flex: 1 },
  carga: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.bg,
  },
  footer: {
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: c.border,
    backgroundColor: c.surface,
  },
  telLabel: { fontSize: 12.5, fontWeight: '600', color: c.muted },
  telBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: c.bg,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radios.md,
    paddingHorizontal: 14,
    height: 50,
  },
  telPrefijo: { fontFamily: c.monoSemi, fontSize: 16, color: c.muted },
  telInput: { flex: 1, fontFamily: c.monoSemi, fontSize: 17, color: c.text, letterSpacing: 1 },
  whatsapp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1FA855',
    borderRadius: radios.md,
    paddingVertical: 15,
  },
  whatsappText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  compartir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: c.surfaceAlt,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radios.md,
    paddingVertical: 14,
  },
  compartirText: { color: c.text, fontSize: 15, fontWeight: '700' },
});
