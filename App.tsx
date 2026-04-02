import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from './constants/Colors';
import { storage } from './utils/storage';
import { Task, ClassSchedule, Grade, User } from './types/navigation';
import { useApp, AppContext } from './AppContext';

// Screens
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import DashboardScreen from './screens/DashboardScreen';
import TasksScreen from './screens/TasksScreen';
import TaskDetailScreen from './screens/TaskDetailScreen';
import AddTaskScreen from './screens/AddTaskScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import AddClassScreen from './screens/AddClassScreen';
import GradesScreen from './screens/GradesScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Default grade seed so GradesScreen is never empty on first launch
const DEFAULT_GRADES: Grade[] = [
  { id: 'g1', subjectCode: 'ISP 627', subject: 'Mobile Applications Development', units: 3, midterm: null, final: null, gwa: null },
  { id: 'g2', subjectCode: 'ISP 626', subject: 'Enterprise Architecture', units: 3, midterm: null, final: null, gwa: null },
  { id: 'g3', subjectCode: 'IT 637', subject: 'App Dev & Emerging Technologies', units: 3, midterm: null, final: null, gwa: null },
  { id: 'g4', subjectCode: 'IT 621', subject: 'Database Management System', units: 3, midterm: null, final: null, gwa: null },
  { id: 'g5', subjectCode: 'ISA 617', subject: 'IS Project Management', units: 3, midterm: null, final: null, gwa: null },
  { id: 'g6', subjectCode: 'ISC 625', subject: 'Discrete Mathematics', units: 3, midterm: null, final: null, gwa: null },
  { id: 'g7', subjectCode: 'GEC 607', subject: 'Science, Technology and Society', units: 3, midterm: null, final: null, gwa: null },
  { id: 'g8', subjectCode: 'GEC 602', subject: 'Reading in Philippine History', units: 3, midterm: null, final: null, gwa: null },
  { id: 'g9', subjectCode: 'PE 604', subject: 'PATHFIT 4', units: 2, midterm: null, final: null, gwa: null },
];

function MainTabs() {
  const { theme } = useApp();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, { active: any; inactive: any }> = {
            Dashboard: { active: 'home', inactive: 'home-outline' },
            Tasks: { active: 'checkbox', inactive: 'checkbox-outline' },
            Schedule: { active: 'calendar', inactive: 'calendar-outline' },
            Grades: { active: 'bar-chart', inactive: 'bar-chart-outline' },
            Profile: { active: 'person', inactive: 'person-outline' },
          };
          const iconSet = icons[route.name] || icons.Dashboard;
          return (
            <Ionicons
              name={focused ? iconSet.active : iconSet.inactive}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 64,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Grades" component={GradesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [schedule, setScheduleState] = useState<ClassSchedule[]>([]);
  const [grades, setGradesState] = useState<Grade[]>([]);
  const [currentUser, setCurrentUserState] = useState<User | null>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const [dark, t, s, g, u] = await Promise.all([
        storage.getDarkMode(),
        storage.getTasks(),
        storage.getSchedule(),
        storage.getGrades(),
        storage.getCurrentUser(),
      ]);

      setIsDarkMode(dark || false);
      setTasksState(t || []);
      setScheduleState(s || []);
      // Use saved grades if they exist, otherwise seed with defaults
      setGradesState((g && g.length > 0) ? g : DEFAULT_GRADES);
      setCurrentUserState(u || null);
    } catch (e) {
      console.error(e);
      setGradesState(DEFAULT_GRADES);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await storage.setDarkMode(newMode);
  };

  const setTasks = async (t: Task[]) => {
    setTasksState(t);
    await storage.saveTasks(t);
  };

  const setSchedule = async (s: ClassSchedule[]) => {
    setScheduleState(s);
    await storage.saveSchedule(s);
  };

  const setGrades = async (g: Grade[]) => {
    setGradesState(g);
    await storage.saveGrades(g);
  };

  const setCurrentUser = async (u: User | null) => {
    setCurrentUserState(u);
    if (u) await storage.setCurrentUser(u);
    else await storage.clearCurrentUser();
  };

  const theme = isDarkMode ? Colors.dark : Colors.light;

  if (isLoading) return <SplashScreen />;

  return (
    <AppContext.Provider
      value={{
        theme,
        isDarkMode,
        toggleTheme,
        tasks,
        setTasks,
        schedule,
        setSchedule,
        grades,
        setGrades,
        currentUser,
        setCurrentUser,
      }}
    >
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={currentUser ? 'Main' : 'Login'}
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.background },
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
          <Stack.Screen name="AddTask" component={AddTaskScreen} />
          <Stack.Screen name="AddClass" component={AddClassScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}