import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { radios } from '@/core/theme/tokens';
import { Tema, useEstilos, useTema } from '@/core/theme/use-tema';

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const DIAS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function aISO(anio: number, mes: number, dia: number): string {
  return `${anio}-${pad(mes + 1)}-${pad(dia)}`;
}

interface Props {
  visible: boolean;
  valor: string;
  maxima: string;
  onCerrar: () => void;
  onElegir: (iso: string) => void;
}

export function SelectorFecha({ visible, valor, maxima, onCerrar, onElegir }: Props) {
  const c = useTema();
  const styles = useEstilos(crear);
  const [a, m, d] = valor.split('-').map(Number);
  const [anio, setAnio] = useState(a);
  const [mes, setMes] = useState(m - 1);

  const maxPartes = maxima.split('-').map(Number);
  const maxAnio = maxPartes[0];
  const maxMes = maxPartes[1] - 1;

  const enMesTope = anio === maxAnio && mes === maxMes;
  const primerDia = new Date(anio, mes, 1).getDay();
  const diasMes = new Date(anio, mes + 1, 0).getDate();

  const celdas: (number | null)[] = [];
  for (let i = 0; i < primerDia; i++) {
    celdas.push(null);
  }
  for (let dia = 1; dia <= diasMes; dia++) {
    celdas.push(dia);
  }

  function mesAnterior() {
    if (mes === 0) {
      setMes(11);
      setAnio((y) => y - 1);
    } else {
      setMes((mm) => mm - 1);
    }
  }

  function mesSiguiente() {
    if (enMesTope) {
      return;
    }
    if (mes === 11) {
      setMes(0);
      setAnio((y) => y + 1);
    } else {
      setMes((mm) => mm + 1);
    }
  }

  function deshabilitado(dia: number): boolean {
    return aISO(anio, mes, dia) > maxima;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <Pressable style={styles.fondo} onPress={onCerrar}>
        <Pressable style={styles.tarjeta} onPress={() => undefined}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.cabecera}>
              <Pressable style={styles.navBtn} onPress={mesAnterior} accessibilityLabel="Mes anterior">
                <Ionicons name="chevron-back" size={22} color={c.text} />
              </Pressable>
              <Text style={styles.titulo}>
                {MESES[mes]} {anio}
              </Text>
              <Pressable
                style={[styles.navBtn, enMesTope && styles.navBtnOff]}
                onPress={mesSiguiente}
                disabled={enMesTope}
                accessibilityLabel="Mes siguiente"
              >
                <Ionicons name="chevron-forward" size={22} color={enMesTope ? c.faint : c.text} />
              </Pressable>
            </View>

            <View style={styles.semana}>
              {DIAS.map((dia, i) => (
                <Text key={i} style={styles.diaSemana}>
                  {dia}
                </Text>
              ))}
            </View>

            <View style={styles.grilla}>
              {celdas.map((dia, i) => {
                if (dia === null) {
                  return <View key={i} style={styles.celda} />;
                }
                const iso = aISO(anio, mes, dia);
                const sel = iso === valor;
                const off = deshabilitado(dia);
                return (
                  <Pressable
                    key={i}
                    style={styles.celda}
                    onPress={() => {
                      if (!off) {
                        onElegir(iso);
                      }
                    }}
                    disabled={off}
                  >
                    <View style={[styles.dia, sel && styles.diaSel]}>
                      <Text style={[styles.diaText, sel && styles.diaTextSel, off && styles.diaTextOff]}>
                        {dia}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const crear = (c: Tema) =>
  StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(33,29,23,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  tarjeta: { backgroundColor: c.surface, borderRadius: radios.xl, padding: 16 },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: radios.sm,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnOff: { backgroundColor: c.bg },
  titulo: { fontSize: 16, fontWeight: '800', color: c.text },
  semana: { flexDirection: 'row', marginBottom: 6 },
  diaSemana: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700', color: c.faint },
  grilla: { flexDirection: 'row', flexWrap: 'wrap' },
  celda: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dia: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  diaSel: { backgroundColor: c.brand },
  diaText: { fontFamily: c.mono, fontSize: 15, color: c.text },
  diaTextSel: { color: c.onBrand, fontWeight: '700' },
  diaTextOff: { color: c.faint },
});
