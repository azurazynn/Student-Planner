import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './utils/supabaseClient';
import { Colors } from './constants/Colors';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  course: string;
  section: string;
  photo?: string | null;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  subject: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  type: 'assignment' | 'quiz' | 'project' | 'exam';
}

export interface ClassSchedule {
  id: string;
  user_id: string;
  subject: string;
  subjectCode: string;
  days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[];
  startTime: string;
  endTime: string;
  room: string;
  professor: string;
  units: number;
}

export interface Grade {
  id: string;
  user_id: string;
  subject: string;
  subjectCode: string;
  units: number;
  midterm: number | null;
  final: number | null;
  gwa: number | null;
}

interface AppContextType {
  theme: typeof Colors.light;
  isDarkMode: boolean;
  toggleTheme: () => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => Promise<void>;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  schedule: ClassSchedule[];
  setSchedule: (schedule: ClassSchedule[]) => void;
  grades: Grade[];
  setGrades: (grades: Grade[]) => void;
  loading: boolean;
  refreshUserData: () => Promise<void>;
}

// ── Provide a concrete default value so createContext never returns undefined ──
const AppContext = createContext<AppContextType>({
  theme: Colors.light,
  isDarkMode: false,
  toggleTheme: () => { return; },
  currentUser: null,
  setCurrentUser: async () => { return; },
  tasks: [],
  setTasks: () => { return; },
  schedule: [],
  setSchedule: () => { return; },
  grades: [],
  setGrades: () => { return; },
  loading: false,
  refreshUserData: async () => { return; },
});

export function useApp() {
  return useContext(AppContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode]         = useState(false);
  const [currentUser, setCurrentUserState]  = useState<User | null>(null);
  const [tasks, setTasksState]              = useState<Task[]>([]);
  const [schedule, setScheduleState]        = useState<ClassSchedule[]>([]);
  const [grades, setGradesState]            = useState<Grade[]>([]);
  const [loading, setLoading]               = useState(false);

  const theme       = isDarkMode ? Colors.dark : Colors.light;
  const toggleTheme = () => setIsDarkMode(prev => !prev);

  // ── Fetch all data for a user ─────────────────────────────────────────────

  const loadUserData = async (userId: string) => {
    setLoading(true);
    try {
      const [{ data: td }, { data: sd }, { data: gd }] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', userId).order('deadline', { ascending: true }),
        supabase.from('schedule').select('*').eq('user_id', userId),
        supabase.from('grades').select('*').eq('user_id', userId),
      ]);

      setTasksState((td || []).map((t: any): Task => ({
        id: t.id, user_id: t.user_id, title: t.title,
        description: t.description ?? '', subject: t.subject,
        deadline: t.deadline, status: t.status,
        priority: t.priority, type: t.type,
      })));

      const scheduleList: ClassSchedule[] = (sd || []).map((s: any): ClassSchedule => ({
        id: s.id, user_id: s.user_id, subject: s.subject,
        subjectCode: s.subject_code, days: s.days,
        startTime: s.start_time, endTime: s.end_time,
        room: s.room, professor: s.professor, units: s.units,
      }));
      setScheduleState(scheduleList);

      // Build a map of saved grade values keyed by schedule id
      const gradeValuesMap: Record<string, { midterm: number | null; final: number | null; gwa: number | null }> = {};
      (gd || []).forEach((g: any) => {
        gradeValuesMap[g.id] = { midterm: g.midterm ?? null, final: g.final ?? null, gwa: g.gwa ?? null };
      });

      // Derive grades from schedule so every subject always appears,
      // then merge in any saved grade values from the grades table.
      const derivedGrades: Grade[] = scheduleList.map((c): Grade => {
        const saved = gradeValuesMap[c.id] ?? {};
        return {
          id:          c.id,
          user_id:     userId,
          subject:     c.subject,
          subjectCode: c.subjectCode,
          units:       c.units,
          midterm:     saved.midterm ?? null,
          final:       saved.final   ?? null,
          gwa:         saved.gwa     ?? null,
        };
      });
      setGradesState(derivedGrades);
    } catch (e) {
      console.error('loadUserData error:', e);
    }
    setLoading(false);
  };

  // ── Login / Logout ────────────────────────────────────────────────────────

  const setCurrentUser = async (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      await loadUserData(user.id);
    } else {
      setTasksState([]);
      setScheduleState([]);
      setGradesState([]);
      await supabase.auth.signOut();
    }
  };

  const refreshUserData = async () => {
    if (currentUser) await loadUserData(currentUser.id);
  };

  // ── Sync tasks ────────────────────────────────────────────────────────────

  const setTasks = async (newTasks: Task[]) => {
    setTasksState(newTasks);
    if (!currentUser) return;

    const { data: ex } = await supabase.from('tasks').select('id').eq('user_id', currentUser.id);
    const exIds  = new Set((ex || []).map((t: any) => t.id));
    const newIds = new Set(newTasks.map(t => t.id));

    for (const t of newTasks) {
      const row = {
        id: t.id, user_id: currentUser.id, title: t.title,
        description: t.description ?? '', subject: t.subject,
        deadline: t.deadline, status: t.status, priority: t.priority, type: t.type,
      };
      if (exIds.has(t.id)) await supabase.from('tasks').update(row).eq('id', t.id);
      else                  await supabase.from('tasks').insert(row);
    }
    for (const id of exIds) {
      if (!newIds.has(id)) await supabase.from('tasks').delete().eq('id', id);
    }
  };

  // ── Sync schedule ─────────────────────────────────────────────────────────

  const setSchedule = async (newSchedule: ClassSchedule[]) => {
    setScheduleState(newSchedule);
    if (!currentUser) return;

    const { data: ex } = await supabase.from('schedule').select('id').eq('user_id', currentUser.id);
    const exIds  = new Set((ex || []).map((s: any) => s.id));
    const newIds = new Set(newSchedule.map(c => c.id));

    for (const c of newSchedule) {
      const row = {
        id: c.id, user_id: currentUser.id, subject: c.subject,
        subject_code: c.subjectCode, days: c.days,
        start_time: c.startTime, end_time: c.endTime,
        room: c.room, professor: c.professor, units: c.units,
      };
      if (exIds.has(c.id)) {
        await supabase.from('schedule').update(row).eq('id', c.id);
      } else {
        await supabase.from('schedule').insert(row);

        // ✅ Auto-create a matching grade row for every new class added
        const gradeRow = {
          id:           c.id,           // same id so GradesScreen can look it up
          user_id:      currentUser.id,
          subject:      c.subject,
          subject_code: c.subjectCode,
          units:        c.units,
          midterm:      null,
          final:        null,
          gwa:          null,
        };
        await supabase.from('grades').insert(gradeRow);

        // Update local grades state immediately so UI reflects without reload
        setGradesState(prev => {
          // Avoid duplicates if grade entry already exists
          if (prev.some(g => g.id === c.id)) return prev;
          return [...prev, {
            id:          c.id,
            user_id:     currentUser.id,
            subject:     c.subject,
            subjectCode: c.subjectCode,
            units:       c.units,
            midterm:     null,
            final:       null,
            gwa:         null,
          }];
        });
      }
    }

    // ✅ When a class is deleted, also remove its grade row
    for (const id of exIds) {
      if (!newIds.has(id)) {
        await supabase.from('schedule').delete().eq('id', id);
        await supabase.from('grades').delete().eq('id', id);
        setGradesState(prev => prev.filter(g => g.id !== id));
      }
    }
  };

  // ── Sync grades ───────────────────────────────────────────────────────────

  const setGrades = async (newGrades: Grade[]) => {
    setGradesState(newGrades);
    if (!currentUser) return;

    for (const g of newGrades) {
      await supabase.from('grades').upsert({
        id: g.id, user_id: currentUser.id, subject: g.subject,
        subject_code: g.subjectCode, units: g.units,
        midterm: g.midterm, final: g.final, gwa: g.gwa,
      });
    }
  };

  // ── Restore Supabase session on app start ─────────────────────────────────

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: p } = await supabase
          .from('users').select('*').eq('id', session.user.id).single();

        if (p) {
          const user: User = {
            id: p.id, name: p.name, email: p.email,
            studentId: p.student_id, course: p.course,
            section: p.section, photo: p.photo ?? null,
          };
          setCurrentUserState(user);
          await loadUserData(user.id);
        }
      } catch (e) {
        console.error('Session restore error:', e);
      }
    };
    restoreSession();
  }, []);

  return (
    <AppContext.Provider value={{
      theme, isDarkMode, toggleTheme,
      currentUser, setCurrentUser,
      tasks, setTasks,
      schedule, setSchedule,
      grades, setGrades,
      loading, refreshUserData,
    }}>
      {children}
    </AppContext.Provider>
  );
}