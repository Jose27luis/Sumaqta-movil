import { ActivityIndicator, View } from 'react-native';

import { useTema } from '@/core/theme/use-tema';

export default function IndexScreen() {
  const c = useTema();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg }}>
      <ActivityIndicator color={c.brand} />
    </View>
  );
}
