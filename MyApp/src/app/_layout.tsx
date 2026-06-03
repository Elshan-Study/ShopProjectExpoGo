import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import HomeScreen from '.';


export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Товары' }} />
      <Stack.Screen name="product/form" options={{ title: 'Форма' }} />
    </Stack>
  );
}