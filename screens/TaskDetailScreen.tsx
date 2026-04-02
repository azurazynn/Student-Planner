import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { Task } from '../types/navigation';

const STATUS_OPTIONS: Task['status'][] = ['pending', 'in-progress', 'completed'];
const PRIORITY_COLORS: Record<Task['priority'], string> = { low: '#10B981', medium: '#F59E0B', high: '#EF4444' };
const STATUS_COLORS: Record<Task['status'], string> = { pending: '#F59E0B', 'in-progress': '#4F46E5', completed: '#10B981' };
const TYPE_ICONS: Record<Task['type'], any> = { assignment: 'document-text-outline', quiz: 'help-circle-outline', project: 'construct-outline', exam: 'school-outline' };

export default function TaskDetailScreen({ route, navigation }: any) {
  const { taskId } = route.params;
  const { theme, tasks, setTasks } = useApp();
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    setTask(tasks.find(t => t.id === taskId) || null);
  }, [taskId, tasks]);

  const updateStatus = (status: Task['status']) => {
    if (!task) return;
    const updated = { ...task, status };
    setTask(updated);
    setTasks(tasks.map(t => t.id === taskId ? updated : t));
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Permanently remove this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { setTasks(tasks.filter(t => t.id !== taskId)); navigation.goBack(); } },
    ]);
  };

  if (!task) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Task not found.</Text>
      </View>
    );
  }

  // ✅ Better date handling
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(task.deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  const isOverdue = deadlineDate < today && task.status !== 'completed';
  const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / 86400000);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>

        {/* 🔥 BADGES */}
        <View style={styles.topBadges}>
          <View style={[styles.badge, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name={TYPE_ICONS[task.type]} size={12} color={theme.primary} />
            <Text style={[styles.badgeText, { color: theme.primary }]}>{task.type.toUpperCase()}</Text>
          </View>

          <View style={[styles.badge, { backgroundColor: PRIORITY_COLORS[task.priority] + '15' }]}>
            <Text style={[styles.badgeText, { color: PRIORITY_COLORS[task.priority] }]}>
              {task.priority.toUpperCase()} PRIORITY
            </Text>
          </View>

          {/* ✅ OVERDUE BADGE */}
          {isOverdue && (
            <View style={[styles.badge, { backgroundColor: '#EF444415' }]}>
              <Text style={[styles.badgeText, { color: '#EF4444' }]}>OVERDUE</Text>
            </View>
          )}
        </View>

        {/* 🔥 TITLE */}
        <Text style={[
          styles.title,
          { color: isOverdue ? '#EF4444' : theme.text }
        ]}>
          {task.title}
        </Text>

        {/* SUBJECT */}
        <View style={[styles.subjectRow, { backgroundColor: theme.surfaceAlt }]}>
          <Ionicons name="book-outline" size={14} color={theme.primary} />
          <Text style={[styles.subjectText, { color: theme.textSecondary }]} numberOfLines={2}>
            {task.subject}
          </Text>
        </View>

        {/* DEADLINE */}
        <View style={[
          styles.deadlineCard,
          {
            backgroundColor:
              isOverdue ? '#FEF2F2' :
              task.status === 'completed' ? '#F0FDF4' :
              '#EEF2FF'
          }
        ]}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={
              isOverdue ? '#EF4444' :
              task.status === 'completed' ? '#10B981' :
              '#4F46E5'
            }
          />

          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 10,
              fontWeight: '800',
              color: isOverdue ? '#EF4444' : '#6B7280',
              letterSpacing: 0.5
            }}>
              {task.status === 'completed' ? 'COMPLETED' : isOverdue ? 'OVERDUE' : 'DEADLINE'}
            </Text>

            <Text style={{
              fontWeight: '700',
              color: isOverdue ? '#EF4444' : '#1E293B'
            }}>
              {deadlineDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>

          {task.status !== 'completed' && (
            <Text style={{
              fontSize: 12,
              fontWeight: '700',
              color: isOverdue ? '#EF4444' : '#6B7280'
            }}>
              {isOverdue
                ? `${Math.abs(daysLeft)}d ago`
                : daysLeft === 0
                  ? 'Today!'
                  : `${daysLeft}d left`}
            </Text>
          )}
        </View>

        {/* DESCRIPTION */}
        {task.description ? (
          <>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>DESCRIPTION</Text>
            <Text style={[styles.description, { color: theme.text }]}>
              {task.description}
            </Text>
          </>
        ) : null}

        {/* STATUS */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: 20 }]}>
          UPDATE STATUS
        </Text>

        <View style={styles.statusRow}>
          {STATUS_OPTIONS.map(s => (
            <TouchableOpacity
              key={s}
              style={[
                styles.statusBtn,
                {
                  backgroundColor: task.status === s ? STATUS_COLORS[s] : theme.surfaceAlt,
                  borderColor: task.status === s ? STATUS_COLORS[s] : theme.border
                }
              ]}
              onPress={() => updateStatus(s)}
            >
              <Ionicons
                name={s === 'completed' ? 'checkmark-circle' : s === 'in-progress' ? 'time' : 'ellipse-outline'}
                size={14}
                color={task.status === s ? '#fff' : theme.textSecondary}
              />
              <Text style={[
                styles.statusText,
                { color: task.status === s ? '#fff' : theme.textSecondary }
              ]}>
                {s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* DELETE */}
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
        <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 15 }}>
          Delete Task
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { margin: 16, padding: 20, borderRadius: 20, elevation: 3, gap: 14 },
  topBadges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, gap: 5 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '800', lineHeight: 28 },
  subjectRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, gap: 8 },
  subjectText: { flex: 1, fontSize: 13, lineHeight: 18 },
  deadlineCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, gap: 12 },
  sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  description: { fontSize: 14, lineHeight: 22 },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, gap: 5 },
  statusText: { fontSize: 11, fontWeight: '700' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, marginBottom: 32, padding: 16, borderRadius: 14, backgroundColor: '#FEE2E2', gap: 8 },
});