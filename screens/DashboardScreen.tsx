import React, { useState, useEffect, useRef } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';
import ClassCard from '../components/ClassCard';

interface DonutSlice {
  value: number;
  color: string;
  label: string;
}

function DonutChart({ slices, size = 140, strokeWidth = 18 }: {
  slices: DonutSlice[];
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const total = slices.reduce((s, x) => s + x.value, 0);
  const animProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animProgress.setValue(0);
    Animated.timing(animProgress, {
      toValue: 1,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [total]);

  if (total === 0) {
    return (
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <Svg width={size} height={size}>
          <Circle
            cx={cx} cy={cy} r={radius}
            stroke="#E2E8F0" strokeWidth={strokeWidth}
            fill="none"
          />
        </Svg>
        <View style={StyleSheet.absoluteFill}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '700' }}>NO TASKS</Text>
          </View>
        </View>
      </View>
    );
  }

  // Build arc segments
  let offset = -circumference * 0.25; // start from top (12 o'clock)
  const segments = slices
    .filter(s => s.value > 0)
    .map(s => {
      const dash = (s.value / total) * circumference;
      const gap = circumference - dash;
      const seg = { ...s, dash, gap, offset };
      offset += dash;
      return seg;
    });

  const completedPct = slices.find(s => s.label === 'Done')?.value ?? 0;
  const pct = total > 0 ? Math.round((completedPct / total) * 100) : 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={cx} cy={cy} r={radius}
          stroke="#E2E8F0" strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Segments */}
        <G rotation="-90" origin={`${cx},${cy}`}>
          {segments.map((seg, i) => (
            <Circle
              key={i}
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={-seg.offset + circumference * 0.25}
              strokeLinecap="round"
            />
          ))}
        </G>
      </Svg>
      {/* Center label */}
      <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#0F172A' }}>{pct}%</Text>
        <Text style={{ fontSize: 9, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5 }}>DONE</Text>
      </View>
    </View>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function DashboardScreen({ navigation }: any) {
  const { theme, tasks, schedule, grades, currentUser } = useApp();
  const [now, setNow] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  // Task counts
  const inProgress  = tasks.filter(t => t.status === 'in-progress').length;
  const done        = tasks.filter(t => t.status === 'completed').length;
  const overdue     = tasks.filter(t => new Date(t.deadline) < now && t.status !== 'completed').length;
  const pending     = tasks.filter(t => t.status === 'pending' && new Date(t.deadline) >= now).length;
  const totalActive = tasks.filter(t => t.status !== 'completed').length;

  const donutSlices: DonutSlice[] = [
    { value: done,       color: '#10B981', label: 'Done' },
    { value: inProgress, color: '#4F46E5', label: 'In Progress' },
    { value: overdue,    color: '#EF4444', label: 'Overdue' },
    { value: pending,    color: '#F59E0B', label: 'Pending' },
  ];

  const todayName    = now.toLocaleDateString('en-US', { weekday: 'long' }) as any;
  const todayClasses = schedule.filter(c => c.days.includes(todayName));

  const isCurrentClass = (c: any) => {
    const parseTime = (s: string) => {
      const [time, period] = s.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };
    const cur = now.getHours() * 60 + now.getMinutes();
    return cur >= parseTime(c.startTime) && cur < parseTime(c.endTime);
  };

  const greeting    = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';
  const displayName = currentUser ? currentUser.name.split(' ')[0] : 'Student';
  const completedGrades = grades.filter(g => g.gwa !== null);
  const avgGWA = completedGrades.length > 0
    ? (completedGrades.reduce((sum, g) => sum + (g.gwa || 0), 0) / completedGrades.length).toFixed(2)
    : '—';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero ── */}
      <View style={[styles.hero, { backgroundColor: theme.primary }]}>
        <View style={styles.heroDecor1} />
        <View style={styles.heroDecor2} />
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.greetingText}>{greeting} 👋</Text>
            <Text style={styles.nameText}>{displayName}!</Text>
          </View>
          <View style={styles.clockBox}>
            <Text style={styles.clockTime}>
              {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.clockDate}>
              {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>
        {overdue > 0 && (
          <TouchableOpacity style={styles.alertBanner} onPress={() => navigation.navigate('Tasks')}>
            <Ionicons name="warning-outline" size={14} color="#FEF3C7" />
            <Text style={styles.alertText}>{overdue} overdue task{overdue > 1 ? 's' : ''} — tap to view</Text>
            <Ionicons name="chevron-forward" size={14} color="#FEF3C7" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Body ── */}
      <View style={styles.body}>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard title="Pending"   value={totalActive} icon="time-outline"           color={theme.warning} theme={theme} onPress={() => navigation.navigate('Tasks')} />
          <StatCard title="Completed" value={done}        icon="checkmark-circle-outline" color={theme.success} theme={theme} />
          <StatCard title="Avg GWA"   value={avgGWA}      icon="trending-up-outline"     color={theme.primary} theme={theme} onPress={() => navigation.navigate('Grades')} />
        </View>

        {/* ── Task Progress Donut ── */}
        <View style={[styles.chartCard, { backgroundColor: theme.surface }]}>
          {/* Card header */}
          <View style={styles.chartHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Task Progress</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
              <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* Chart + legend row */}
          <View style={styles.chartBody}>
            <DonutChart slices={donutSlices} size={148} strokeWidth={20} />

            {/* Legend */}
            <View style={styles.legend}>
              {[
                { label: 'Done',        value: done,       color: '#10B981', icon: 'checkmark-circle' as const },
                { label: 'In Progress', value: inProgress, color: '#4F46E5', icon: 'time'             as const },
                { label: 'Overdue',     value: overdue,    color: '#EF4444', icon: 'alert-circle'     as const },
                { label: 'Pending',     value: pending,    color: '#F59E0B', icon: 'ellipse'          as const },
              ].map(item => (
                <View key={item.label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>{item.label}</Text>
                  </View>
                  <Text style={[styles.legendValue, { color: theme.text }]}>{item.value}</Text>
                </View>
              ))}

              {/* Total */}
              <View style={[styles.legendTotal, { borderTopColor: theme.border }]}>
                <Text style={[styles.legendTotalLabel, { color: theme.textSecondary }]}>Total Tasks</Text>
                <Text style={[styles.legendTotalValue, { color: theme.text }]}>{tasks.length}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Today's Classes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Classes</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
              <Text style={[styles.seeAll, { color: theme.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          {todayClasses.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
              <Ionicons name="sunny-outline" size={28} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No classes today. Enjoy your day!</Text>
            </View>
          ) : todayClasses.map((c, i) => (
            <ClassCard key={c.id} classItem={c} theme={theme} isNow={isCurrentClass(c)} colorIndex={i} />
          ))}
        </View>

        {/* Upcoming Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionDot, { backgroundColor: theme.secondary }]} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Tasks</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
              <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          {tasks.filter(t => t.status !== 'completed').slice(0, 3).map(task => (
            <TaskCard
              key={task.id} task={task} theme={theme}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
            />
          ))}
          {tasks.filter(t => t.status !== 'completed').length === 0 && (
            <View style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
              <Ionicons name="checkmark-done-outline" size={28} color={theme.success} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>All caught up! No pending tasks.</Text>
            </View>
          )}
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Hero
  hero: { paddingTop: 56, paddingBottom: 32, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  heroDecor1: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.08)' },
  heroDecor2: { position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.06)' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greetingText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  nameText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  clockBox: { alignItems: 'flex-end' },
  clockTime: { fontSize: 28, fontWeight: '800', color: '#fff' },
  clockDate: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(239,68,68,0.3)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 14 },
  alertText: { flex: 1, color: '#FEF3C7', fontSize: 12, fontWeight: '600' },

  // Body
  body: { padding: 16 },
  statsRow: { flexDirection: 'row', marginHorizontal: -4, marginTop: 16, marginBottom: 16 },

  // Donut chart card
  chartCard: { borderRadius: 20, padding: 18, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  chartBody: { flexDirection: 'row', alignItems: 'center', gap: 20 },

  // Legend
  legend: { flex: 1, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12 },
  legendValue: { fontSize: 13, fontWeight: '800', minWidth: 22, textAlign: 'right' },
  legendTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 8, marginTop: 2 },
  legendTotalLabel: { fontSize: 11, fontWeight: '700' },
  legendTotalValue: { fontSize: 15, fontWeight: '900' },

  // Quick actions
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  quickBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14, borderWidth: 1, gap: 6 },
  quickLabel: { fontSize: 11, fontWeight: '700' },

  // Sections
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  seeAll: { fontSize: 13, fontWeight: '700' },
  emptyCard: { borderRadius: 16, padding: 24, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 14, textAlign: 'center' },
});