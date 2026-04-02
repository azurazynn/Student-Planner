import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types/navigation';

interface Props {
  task: Task;
  theme: any;
  onPress: () => void;
  onDelete?: (id: string) => void;
}

const PRIORITY_CONFIG = {
  low: { color: '#10B981', icon: 'arrow-down-outline' as const, label: 'Low' },
  medium: { color: '#F59E0B', icon: 'remove-outline' as const, label: 'Med' },
  high: { color: '#EF4444', icon: 'arrow-up-outline' as const, label: 'High' },
};

const STATUS_CONFIG = {
  pending: { color: '#F59E0B', label: 'Pending' },
  'in-progress': { color: '#4F46E5', label: 'In Progress' },
  completed: { color: '#10B981', label: 'Done' },
};

const TYPE_ICONS = {
  assignment: 'document-text-outline' as const,
  quiz: 'help-circle-outline' as const,
  project: 'construct-outline' as const,
  exam: 'school-outline' as const,
};

export default function TaskCard({ task, theme, onPress, onDelete }: Props) {
  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'completed';
  const priority = PRIORITY_CONFIG[task.priority];
  const status = STATUS_CONFIG[task.status];
  const deadlineDiff = Math.ceil((new Date(task.deadline).getTime() - Date.now()) / 86400000);
  const deadlineLabel = isOverdue ? `${Math.abs(deadlineDiff)}d overdue` : deadlineDiff === 0 ? 'Due today' : `${deadlineDiff}d left`;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surface }, task.status === 'completed' && { opacity: 0.7 }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.leftAccent, { backgroundColor: priority.color }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={[styles.typeChip, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name={TYPE_ICONS[task.type]} size={11} color={theme.primary} />
            <Text style={[styles.typeText, { color: theme.primary }]}>{task.type.toUpperCase()}</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: status.color + '18' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <Text style={[styles.title, { color: theme.text }, task.status === 'completed' && styles.strikethrough]} numberOfLines={2}>{task.title}</Text>
        <Text style={[styles.subject, { color: theme.textSecondary }]} numberOfLines={1}>{task.subject}</Text>
        <View style={styles.bottomRow}>
          <View style={[styles.deadlineChip, { backgroundColor: isOverdue ? '#FEE2E2' : '#F1F5F9' }]}>
            <Ionicons name="time-outline" size={11} color={isOverdue ? '#EF4444' : theme.textSecondary} />
            <Text style={[styles.deadlineText, { color: isOverdue ? '#EF4444' : theme.textSecondary }]}>{deadlineLabel}</Text>
          </View>
          <View style={[styles.priorityChip, { backgroundColor: priority.color + '15' }]}>
            <Ionicons name={priority.icon} size={11} color={priority.color} />
            <Text style={[styles.priorityText, { color: priority.color }]}>{priority.label}</Text>
          </View>
        </View>
      </View>
      {onDelete && (
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(task.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={18} color={theme.textSecondary + '80'} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', borderRadius: 16, marginBottom: 10,
    overflow: 'hidden', elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  leftAccent: { width: 4 },
  content: { flex: 1, padding: 14, gap: 6 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 4 },
  typeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  title: { fontSize: 15, fontWeight: '700', lineHeight: 20 },
  strikethrough: { textDecorationLine: 'line-through' },
  subject: { fontSize: 12, lineHeight: 16 },
  bottomRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
  deadlineChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 4 },
  deadlineText: { fontSize: 10, fontWeight: '600' },
  priorityChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 4 },
  priorityText: { fontSize: 10, fontWeight: '600' },
  deleteBtn: { padding: 8, justifyContent: 'flex-start', paddingTop: 10 },
});
