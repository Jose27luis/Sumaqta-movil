import { Linking, Share } from 'react-native';

export async function abrirPdf(url: string): Promise<void> {
  await Linking.openURL(url);
}

export async function compartirPdf(url: string, titulo: string): Promise<void> {
  await Share.share({ message: `${titulo}\n${url}`, url });
}

export function normalizarTelefono(numero: string): string {
  const digitos = numero.replace(/\D/g, '');
  if (digitos.length === 9 && digitos.startsWith('9')) {
    return `51${digitos}`;
  }
  return digitos;
}

export async function enviarWhatsApp(url: string, mensaje: string, numero?: string): Promise<void> {
  const texto = encodeURIComponent(`${mensaje} ${url}`);
  const tel = numero ? normalizarTelefono(numero) : '';
  const appUrl = tel ? `whatsapp://send?phone=${tel}&text=${texto}` : `whatsapp://send?text=${texto}`;
  const webUrl = tel ? `https://wa.me/${tel}?text=${texto}` : `https://wa.me/?text=${texto}`;
  const puede = await Linking.canOpenURL(appUrl);
  if (puede) {
    await Linking.openURL(appUrl);
    return;
  }
  await Linking.openURL(webUrl);
}
