import { createContext, useContext } from 'react';
import { Colors } from './constants/Colors'; 
import { Task, ClassSchedule, Grade, User } from './types/navigation'; 

export const AppContext = createContext<{
  theme: typeof Colors.light;
  isDarkMode: boolean;
  toggleTheme: () => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  schedule: ClassSchedule[];
  setSchedule: (schedule: ClassSchedule[]) => void;
  grades: Grade[];
  setGrades: (grades: Grade[]) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}>({} as any);

export const useApp = () => useContext(AppContext);