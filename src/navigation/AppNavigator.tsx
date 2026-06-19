import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import GameDetailScreen from '../screens/GameDetailScreen';
import type { Game } from '../types';

export type SearchStackParamList = {
  SearchList: undefined;
  GameDetail: { game: Game };
};

const Stack = createNativeStackNavigator<SearchStackParamList>();

function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchList" component={SearchScreen} />
      <Stack.Screen
        name="GameDetail"
        component={GameDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Detalle',
          headerStyle: { backgroundColor: '#111827' },
          headerTintColor: '#34d399',
          headerTitleStyle: { color: '#fff' },
        }}
      />
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '📊',
    Buscar: '🔍',
    Biblioteca: '🎮',
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {icons[label] ?? '📦'}
    </Text>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111827',
          borderTopColor: '#1f2937',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#34d399',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Dashboard" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Buscar"
        component={SearchStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Buscar" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Biblioteca"
        component={LibraryScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Biblioteca" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
