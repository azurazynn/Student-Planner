import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';

// ── Screens ──────────────────────────────────────────────────────────────────
import SplashScreen   from '../screens/SplashScreen';
import LoginScreen    from '../screens/LoginScreen';
import SignUpScreen   from '../screens/SignUpScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TasksScreen    from '../screens/TasksScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import AddTaskScreen  from '../screens/AddTaskScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import AddClassScreen from '../screens/AddClassScreen';
import GradesScreen   from '../screens/GradesScreen';
import ProfileScreen  from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Bottom Tab Navigator ──────────────────────────────────────────────────────
function MainTabs() {
  const { theme } = useApp();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: 6,
          paddingTop: 6,
          height: 62,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, { active: any; inactive: any }> = {
            Dashboard: { active: 'home',          inactive: 'home-outline' },
            Tasks:     { active: 'checkbox',      inactive: 'checkbox-outline' },
            Schedule:  { active: 'calendar',      inactive: 'calendar-outline' },
            Grades:    { active: 'bar-chart',     inactive: 'bar-chart-outline' },
            Profile:   { active: 'person-circle', inactive: 'person-circle-outline' },
          };
          const icon = icons[route.name];
          return (
            <Ionicons
              name={focused ? icon?.active : icon?.inactive}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Tasks"     component={TasksStack} />
      <Tab.Screen name="Schedule"  component={ScheduleStack} />
      <Tab.Screen name="Grades"    component={GradesScreen} />
      <Tab.Screen name="Profile"   component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ── Tasks Stack ───────────────────────────────────────────────────────────────
function TasksStack() {
  const { theme } = useApp();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TasksList"   component={TasksScreen} />
      <Stack.Screen name="TaskDetail"  component={TaskDetailScreen}
        options={{
          headerShown: true,
          title: 'Task Details',
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '800' },
        }}
      />
      <Stack.Screen name="AddTask" component={AddTaskScreen}
        options={{
          headerShown: true,
          title: 'Add Task',
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '800' },
        }}
      />
    </Stack.Navigator>
  );
}

// ── Schedule Stack ────────────────────────────────────────────────────────────
function ScheduleStack() {
  const { theme } = useApp();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ScheduleList" component={ScheduleScreen} />
      <Stack.Screen name="AddClass" component={AddClassScreen}
        options={{
          headerShown: true,
          title: 'Add Class',
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '800' },
        }}
      />
    </Stack.Navigator>
  );
}

// ── Root Stack ────────────────────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash"  component={SplashScreen} />
      <Stack.Screen name="Login"   component={LoginScreen} />
      <Stack.Screen name="SignUp"  component={SignUpScreen} />
      <Stack.Screen name="Main"    component={MainTabs} />
    </Stack.Navigator>
  );
}