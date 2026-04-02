import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, ClassSchedule, Grade, User } from '../types/navigation';

const KEYS = {
  USERS: '@users',
  CURRENT_USER: '@current_user',
  DARK_MODE: '@dark_mode',
  TASKS: '@tasks',
  SCHEDULE: '@schedule',
  GRADES: '@grades',
};

const DEFAULT_SCHEDULE: ClassSchedule[] = [
  { id: 's1', subject: 'Mobile Applications Development', subjectCode: 'ISP 627', days: ['Tuesday', 'Thursday'], startTime: '9:00 AM', endTime: '10:30 AM', room: 'CLR 3', professor: 'Kaye Antoinette Panaligan', units: 3 },
  { id: 's2', subject: 'Enterprise Architecture', subjectCode: 'ISP 626', days: ['Monday', 'Wednesday'], startTime: '9:00 AM', endTime: '10:30 AM', room: 'CLR 3', professor: 'Mark Julius Noval', units: 3 },
  { id: 's3', subject: 'PATHFIT 4', subjectCode: 'PE 604', days: ['Wednesday'], startTime: '1:00 PM', endTime: '3:00 PM', room: 'Gymnasium', professor: 'Mechelle Calamba', units: 2 },
  { id: 's4', subject: 'Application Development and Emerging Technologies', subjectCode: 'IT 637', days: ['Monday', 'Wednesday'], startTime: '3:30 PM', endTime: '5:00 PM', room: 'CLR 2', professor: 'Carl Montoya', units: 3 },
  { id: 's5', subject: 'Database Management System', subjectCode: 'IT 621', days: ['Tuesday', 'Thursday'], startTime: '7:30 AM', endTime: '9:00 AM', room: 'CLR 4', professor: 'Carl Montoya', units: 3 },
  { id: 's6', subject: 'Science, Technology and Society', subjectCode: 'GEC 607', days: ['Tuesday', 'Thursday'], startTime: '10:30 AM', endTime: '12:00 PM', room: 'Online Class', professor: 'Maria Yrne Bartolome', units: 3 },
  { id: 's7', subject: 'IS Project Management', subjectCode: 'ISA 617', days: ['Monday', 'Wednesday'], startTime: '10:30 AM', endTime: '12:00 PM', room: 'CLR 3', professor: 'Razel Ann Aguilar', units: 3 },
  { id: 's8', subject: 'Discrete Mathematics', subjectCode: 'ISC 625', days: ['Monday', 'Wednesday'], startTime: '7:30 AM', endTime: '9:00 AM', room: 'CLR / Online', professor: 'Chazel Joy Moñeza', units: 3 },
  { id: 's9', subject: 'Reading in Philippine History', subjectCode: 'GEC 602', days: ['Tuesday', 'Thursday'], startTime: '1:00 PM', endTime: '2:30 PM', room: 'Online Class', professor: 'Christy Garcia', units: 3 },
];

const DEFAULT_TASKS: Task[] = [
  { id: 't1', title: 'Midterm Project - Mobile App', description: 'Build a fully functional mobile application with React Native', subject: 'ISP 627 - Mobile Applications Development', deadline: new Date(Date.now() + 86400000 * 3).toISOString(), status: 'in-progress', priority: 'high', type: 'project' },
  { id: 't2', title: 'Database ER Diagram', description: 'Create entity-relationship diagram and normalization', subject: 'IT 621 - Database Management System', deadline: new Date(Date.now() + 86400000 * 5).toISOString(), status: 'pending', priority: 'medium', type: 'assignment' },
  { id: 't3', title: 'Quiz 2 - Discrete Math', description: 'Study logic, sets, and combinatorics', subject: 'ISC 625 - Discrete Mathematics', deadline: new Date(Date.now() + 86400000).toISOString(), status: 'pending', priority: 'high', type: 'quiz' },
  { id: 't4', title: 'Enterprise Architecture Case Study', description: 'Analyze TOGAF framework application', subject: 'ISP 626 - Enterprise Architecture', deadline: new Date(Date.now() + 86400000 * 7).toISOString(), status: 'pending', priority: 'low', type: 'assignment' },
  { id: 't5', subject: 'PE 604 - PATHFIT 4', title: 'Fitness Activity Log', description: 'Submit weekly fitness log', deadline: new Date(Date.now() - 86400000).toISOString(), status: 'completed', priority: 'medium', type: 'assignment' },
];

const DEFAULT_GRADES: Grade[] = [];


export const storage = {
  async getUsers(): Promise<User[]> {
    try { const d = await AsyncStorage.getItem(KEYS.USERS); return d ? JSON.parse(d) : []; } catch { return []; }
  },
  async saveUser(user: User): Promise<boolean> {
    try {
      const users = await this.getUsers();
      if (users.find(u => u.email === user.email)) return false;
      users.push(user);
      await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(users));
      return true;
    } catch { return false; }
  },
  async loginUser(email: string, password: string): Promise<User | null> {
    try { const users = await this.getUsers(); return users.find(u => u.email === email && u.password === password) || null; }
    catch { return null; }
  },
  async setCurrentUser(user: User): Promise<void> {
    await AsyncStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  },
  async getCurrentUser(): Promise<User | null> {
    try { const d = await AsyncStorage.getItem(KEYS.CURRENT_USER); return d ? JSON.parse(d) : null; } catch { return null; }
  },
  async clearCurrentUser(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.CURRENT_USER);
  },
  async setDarkMode(isDark: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.DARK_MODE, JSON.stringify(isDark));
  },
  async getDarkMode(): Promise<boolean> {
    try { const d = await AsyncStorage.getItem(KEYS.DARK_MODE); return d ? JSON.parse(d) : false; } catch { return false; }
  },
  async getTasks(): Promise<Task[]> {
    try { const d = await AsyncStorage.getItem(KEYS.TASKS); return d ? JSON.parse(d) : DEFAULT_TASKS; } catch { return DEFAULT_TASKS; }
  },
  async saveTasks(tasks: Task[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  },
  async getSchedule(): Promise<ClassSchedule[]> {
    try { const d = await AsyncStorage.getItem(KEYS.SCHEDULE); return d ? JSON.parse(d) : DEFAULT_SCHEDULE; } catch { return DEFAULT_SCHEDULE; }
  },
  async saveSchedule(schedule: ClassSchedule[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.SCHEDULE, JSON.stringify(schedule));
  },
  async getGrades(): Promise<Grade[]> {
    try { const d = await AsyncStorage.getItem(KEYS.GRADES); return d ? JSON.parse(d) : DEFAULT_GRADES; } catch { return DEFAULT_GRADES; }
  },
  async saveGrades(grades: Grade[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.GRADES, JSON.stringify(grades));
  },
};
