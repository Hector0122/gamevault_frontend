import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import GameDetailScreen from '../screens/GameDetailScreen';
import DealsScreen from '../screens/DealsScreen';
import type { Game, UserGame } from '../types';

export type SearchStackParamList = {
  SearchList: undefined;
  GameDetail: { game: Game; ownedIds?: number[]; userGame?: UserGame };
};

export type LibraryStackParamList = {
  LibraryList: undefined;
  GameDetail: { game: Game; ownedIds?: number[]; userGame?: UserGame };
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

const LibraryStackNav = createNativeStackNavigator<LibraryStackParamList>();

function LibraryStack() {
  return (
    <LibraryStackNav.Navigator screenOptions={{ headerShown: false }}>
      <LibraryStackNav.Screen name="LibraryList" component={LibraryScreen} />
      <LibraryStackNav.Screen
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
    </LibraryStackNav.Navigator>
  );
}

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Buscar: '🔍',
    Biblioteca: '🎮',
    Ofertas: '🏷️',
  };
  return (
    <Text style={focused ? styles.tabIconActive : styles.tabIconInactive}>
      {icons[label] ?? '📦'}
    </Text>
  );
}

export type RootStackParamList = {
  MainTabs: undefined;
  Dashboard: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

function renderLibraryIcon({ focused }: { focused: boolean }) {
  return <TabIcon label="Biblioteca" focused={focused} />;
}

function renderSearchIcon({ focused }: { focused: boolean }) {
  return <TabIcon label="Buscar" focused={focused} />;
}

function renderOfertasIcon({ focused }: { focused: boolean }) {
  return <TabIcon label="Ofertas" focused={focused} />;
}

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
        component={LibraryStack}
        options={{ tabBarIcon: renderLibraryIcon }}
      />
      <Tab.Screen
        name="Buscar"
        component={SearchStack}
        options={{ tabBarIcon: renderSearchIcon }}
      />
      <Tab.Screen
        name="Ofertas"
        component={DealsScreen}
        options={{ tabBarIcon: renderOfertasIcon }}
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
    return (
      <ActivityIndicator size="large" color="#10b981" style={styles.activity} />
    );
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

const styles = StyleSheet.create({
  tabIconActive: {
    fontSize: 20,
    opacity: 1,
  },
  tabIconInactive: {
    fontSize: 20,
    opacity: 0.5,
  },
  activity: {
    flex: 1,
    backgroundColor: '#030712',
  },
});
