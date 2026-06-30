import { Component, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class LimiteError extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.root}>
          <Text style={styles.titulo}>Ocurrió un error</Text>
          <Text style={styles.mensaje}>{this.state.error.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3EEE3', padding: 28, justifyContent: 'center', gap: 10 },
  titulo: { fontSize: 19, fontWeight: '800', color: '#B23B3B' },
  mensaje: { fontSize: 13.5, color: '#211D17', lineHeight: 20 },
});
