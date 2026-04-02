export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignUp: undefined;
  Main: undefined;
  TaskDetail: { taskId: string };
  AddTask: undefined;
  AddClass: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  type: 'assignment' | 'quiz' | 'project' | 'exam';
}

export interface ClassSchedule {
  id: string;
  subject: string;
  subjectCode: string;
  days: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>;
  startTime: string;
  endTime: string;
  room: string;
  professor: string;
  units: number;
}

export interface Grade {
  id: string;
  subjectCode: string;
  subject: string;
  units: number;
  midterm: number | null;
  final: number | null;
  gwa: number | null;
  remark?: string | null;
}

export type User = {
  name: string;
  studentId: string;
  course: string;
  section: string;
  email: string;
  password: string;
  photo?: string | null;
};