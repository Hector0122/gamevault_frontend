import { ActivityIndicator, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import GameDetailScreen from '../screens/GameDetailScreen';
import type { Game } from '../types';

export type SearchStackParamList = {
  SearchList: undefined;
  GameDetail: { game: Game };
};

const SearchStackNav = createNativeStackNavigator<SearchStackParamList>();

function SearchStack() {
  return (
    <SearchStackNav.Navigator screenOptions={{ headerShown: false }}>
      <SearchStackNav.Screen name="SearchList" component={SearchScreen} />
      <SearchStackNav.Screen
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
    </SearchStackNav.Navigator>
  );
}

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Buscar: '🔍',
    Biblioteca: '🎮',
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {icons[label] ?? '📦'}
    </Text>
  );
}

export type RootStackParamList = {
  MainTabs: undefined;
  Dashboard: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
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
        name="Biblioteca"
        component={LibraryScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Biblioteca" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Buscar"
        component={SearchStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Buscar" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const AuthNav = createNativeStackNavigator();

function AuthStackNav() {
  return (
    <AuthNav.Navigator screenOptions={{ headerShown: false }}>
      <AuthNav.Screen name="Login" component={LoginScreen} />
      <AuthNav.Screen name="Register" component={RegisterScreen} />
    </AuthNav.Navigator>
  );
}

export default function AppNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return <ActivityIndicator size="large" color="#10b981" style={{ flex: 1, backgroundColor: '#030712' }} />;
  }

  if (!token) {
    return <AuthStackNav />;
  }

  return (
    <RootStack.Navigator>
      <RootStack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Dashboard',
          headerStyle: { backgroundColor: '#111827' },
          headerTintColor: '#34d399',
          headerTitleStyle: { color: '#fff' },
        }}
      />
    </RootStack.Navigator>
  );
}
