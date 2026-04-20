// ─── types/navigation.ts ─────────────────────────────────────────────────────
// Single source of truth for all shared types.
// Re-exports from AppContext so every screen uses the same type.

export type { Task, ClassSchedule, Grade, User } from '../AppContext';

// ─── Navigation param list ───────────────────────────────────────────────────

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignUp: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Schedule: undefined;
  Grades: undefined;
  Profile: undefined;
};

export type TaskStackParamList = {
  TasksList: undefined;
  TaskDetail: { taskId: string };
  AddTask: undefined;
};

export type ScheduleStackParamList = {
  ScheduleList: undefined;
  AddClass: undefined;
};