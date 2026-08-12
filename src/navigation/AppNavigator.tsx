import { ActivityIndicator, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/tokens';
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

const detailHeaderOptions = {
  headerShown: true,
  headerTitle: 'Detalle',
  headerStyle: { backgroundColor: colors.cardBg },
  headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.text, fontFamily: fontFamily.mono, fontSize: 17 },
};

const SearchStackNav = createNativeStackNavigator<SearchStackParamList>();

function SearchStack() {
  return (
    <SearchStackNav.Navigator screenOptions={{ headerShown: false }}>
      <SearchStackNav.Screen name="SearchList" component={SearchScreen} />
      <SearchStackNav.Screen
        name="GameDetail"
        component={GameDetailScreen}
        options={detailHeaderOptions}
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
        options={detailHeaderOptions}
      />
    </LibraryStackNav.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export type RootStackParamList = {
  MainTabs: undefined;
  Dashboard: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

function renderLibraryIcon({ color, size }: { color: string; size: number }) {
  return <Icon name="gamepad-variant-outline" size={size} color={color} />;
}

function renderSearchIcon({ color, size }: { color: string; size: number }) {
  return <Icon name="magnify" size={size} color={color} />;
}

function renderOfertasIcon({ color, size }: { color: string; size: number }) {
  return <Icon name="tag-outline" size={size} color={color} />;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.cardBg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
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
      <ActivityIndicator size="large" color={colors.primary} style={styles.activity} />
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
          headerStyle: { backgroundColor: colors.cardBg },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text, fontFamily: fontFamily.mono, fontSize: 17 },
        }}
      />
    </RootStack.Navigator>
  );
}

const styles = StyleSheet.create({
  activity: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
