import React, {useEffect, useState} from 'react';
import {Text} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {supabase} from '../lib/supabase';
import type {Session} from '@supabase/supabase-js';

// Auth screens
import LandingScreen from '../screens/auth/LandingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Tab screens
import DashboardScreen from '../screens/tabs/DashboardScreen';
import TripsScreen from '../screens/tabs/TripsScreen';
import MatchScreen from '../screens/tabs/MatchScreen';
import ChatScreen from '../screens/tabs/ChatScreen';
import JournalScreen from '../screens/tabs/JournalScreen';
import ProfileScreen from '../screens/tabs/ProfileScreen';

// Detail screens
import TripDetailScreen from '../screens/detail/TripDetailScreen';
import TripCreateScreen from '../screens/detail/TripCreateScreen';
import ChatConversationScreen from '../screens/detail/ChatConversationScreen';
import JournalDetailScreen from '../screens/detail/JournalDetailScreen';
import JournalCreateScreen from '../screens/detail/JournalCreateScreen';
import ProfileEditScreen from '../screens/detail/ProfileEditScreen';

const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const TripsStack = createNativeStackNavigator();
const ChatStack = createNativeStackNavigator();
const JournalStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function TripsStackNav() {
  return (
    <TripsStack.Navigator screenOptions={{headerShown: false}}>
      <TripsStack.Screen name="TripsList" component={TripsScreen} />
      <TripsStack.Screen name="TripDetail" component={TripDetailScreen} />
      <TripsStack.Screen name="TripCreate" component={TripCreateScreen} />
    </TripsStack.Navigator>
  );
}

function ChatStackNav() {
  return (
    <ChatStack.Navigator screenOptions={{headerShown: false}}>
      <ChatStack.Screen name="ChatList" component={ChatScreen} />
      <ChatStack.Screen name="ChatConversation" component={ChatConversationScreen} />
    </ChatStack.Navigator>
  );
}

function JournalStackNav() {
  return (
    <JournalStack.Navigator screenOptions={{headerShown: false}}>
      <JournalStack.Screen name="JournalList" component={JournalScreen} />
      <JournalStack.Screen name="JournalDetail" component={JournalDetailScreen} />
      <JournalStack.Screen name="JournalCreate" component={JournalCreateScreen} />
    </JournalStack.Navigator>
  );
}

function ProfileStackNav() {
  return (
    <ProfileStack.Navigator screenOptions={{headerShown: false}}>
      <ProfileStack.Screen name="ProfileView" component={ProfileScreen} />
      <ProfileStack.Screen name="ProfileEdit" component={ProfileEditScreen} />
    </ProfileStack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1d4ed8',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {paddingBottom: 5, height: 60},
        tabBarLabelStyle: {fontSize: 11},
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Kort',
          tabBarIcon: ({color}) => (
            <Text style={{fontSize: 20, color}}>🗺️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Trips"
        component={TripsStackNav}
        options={{
          tabBarLabel: 'Ture',
          tabBarIcon: ({color}) => (
            <Text style={{fontSize: 20, color}}>🎣</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Match"
        component={MatchScreen}
        options={{
          tabBarLabel: 'Match',
          tabBarIcon: ({color}) => (
            <Text style={{fontSize: 20, color}}>❤️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStackNav}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({color}) => (
            <Text style={{fontSize: 20, color}}>💬</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalStackNav}
        options={{
          tabBarLabel: 'Journal',
          tabBarIcon: ({color}) => (
            <Text style={{fontSize: 20, color}}>📖</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNav}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({color}) => (
            <Text style={{fontSize: 20, color}}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session: s}}) => {
      setSession(s);
      setLoading(false);
    });
    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  if (!session) {
    return (
      <AuthStack.Navigator screenOptions={{headerShown: false}}>
        <AuthStack.Screen name="Landing" component={LandingScreen} />
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
      </AuthStack.Navigator>
    );
  }

  return <AppTabs />;
}
