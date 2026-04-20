import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { Task } from '../types/navigation';

const SUBJECTS = [
  'ISP 627 - Mobile Applications Development',
  'ISP 626 - Enterprise Architecture',
  'PE 604 - PATHFIT 4',
  'IT 637 - App Dev & Emerging Technologies',
  'IT 621 - Database Management System',
  'GEC 607 - Science, Technology and Society',
  'ISA 617 - IS Project Management',
  'ISC 625 - Discrete Mathematics',
  'GEC 602 - Reading in Philippine History',
  'Other',
];

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Low',    color: '#10B981', icon: 'arrow-down-outline' },
  { value: 'medium', label: 'Medium', color: '#F59E0B', icon: 'remove-outline' },
  { value: 'high',   label: 'High',   color: '#EF4444', icon: 'arrow-up-outline' },
] as const;

const TYPE_OPTIONS = [
  { value: 'assignment', label: 'Assignment', color: '#4F46E5', icon: 'document-text-outline' },
  { value: 'quiz',       label: 'Quiz',       color: '#7C3AED', icon: 'help-circle-outline' },
  { value: 'project',    label: 'Project',    color: '#EC4899', icon: 'construct-outline' },
  { value: 'exam',       label: 'Exam',       color: '#EF4444', icon: 'school-outline' },
] as const;

// ── Defined OUTSIDE the screen component so they never get recreated ──────────

interface ChipGroupProps {
  label: string;
  options: readonly { value: string; label: string; color: string; icon: string }[];
  value: string;
  onChange: (v: any) => void;
  theme: any;
}

function ChipGroup({ label, options, value, onChange, theme }: ChipGroupProps) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, {
              backgroundColor: value === opt.value ? opt.color : theme.surfaceAlt,
              borderColor:     value === opt.value ? opt.color : theme.border,
            }]}
            onPress={() => onChange(opt.value)}
          >
            <Ionicons name={opt.icon as any} size={14} color={value === opt.value ? '#fff' : theme.textSecondary} />
            <Text style={[styles.chipText, { color: value === opt.value ? '#fff' : theme.textSecondary }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AddTaskScreen({ navigation }: any) {
  const { theme, tasks, setTasks, currentUser } = useApp();

  const [title, setTitle]                   = useState('');
  const [description, setDescription]       = useState('');
  const [subject, setSubject]               = useState('');
  const [deadline, setDeadline]             = useState('');
  const [priority, setPriority]             = useState<Task['priority']>('medium');
  const [type, setType]                     = useState<Task['type']>('assignment');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const handleAdd = useCallback(() => {
    if (!title.trim())   { Alert.alert('Required', 'Please enter a task title.'); return; }
    if (!subject)        { Alert.alert('Required', 'Please select a subject.'); return; }
    if (!deadline.trim()) { Alert.alert('Required', 'Please enter a deadline (e.g., 2025-12-31).'); return; }
    const parsed = new Date(deadline);
    if (isNaN(parsed.getTime())) { Alert.alert('Invalid Date', 'Use format: YYYY-MM-DD'); return; }

    const newTask: Task = {
      id:          `t${Date.now()}`,
      user_id:     currentUser?.id ?? '',
      title:       title.trim(),
      description: description.trim(),
      subject,
      deadline:    parsed.toISOString(),
      status:      'pending',
      priority,
      type,
    };
    setTasks([...tasks, newTask]);
    navigation.goBack();
  }, [title, description, subject, deadline, priority, type, currentUser, tasks]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
      keyboardShouldPersistTaps="handled"   // ← prevents tap-outside from hiding keyboard
    >
      <View style={[styles.card, { backgroundColor: theme.surface }]}>

        {/* Title */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Task Title *</Text>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceAlt }]}
          placeholder="e.g., Midterm Project"
          placeholderTextColor={theme.textSecondary}
          value={title}
          onChangeText={setTitle}
          autoCorrect={false}
        />

        {/* Description */}
        <Text style={[styles.label, { color: theme.textSecondary, marginTop: 14 }]}>Description</Text>
        <TextInput
          style={[styles.textArea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceAlt }]}
          placeholder="Optional details..."
          placeholderTextColor={theme.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          autoCorrect={false}
        />

        {/* Subject picker */}
        <Text style={[styles.label, { color: theme.textSecondary, marginTop: 14 }]}>Subject *</Text>
        <TouchableOpacity
          style={[styles.picker, { borderColor: theme.border, backgroundColor: theme.surfaceAlt }]}
          onPress={() => setShowSubjectPicker(p => !p)}
        >
          <Text style={{ color: subject ? theme.text : theme.textSecondary, flex: 1 }} numberOfLines={1}>
            {subject || 'Select a subject...'}
          </Text>
          <Ionicons name={showSubjectPicker ? 'chevron-up' : 'chevron-down'} size={16} color={theme.textSecondary} />
        </TouchableOpacity>
        {showSubjectPicker && (
          <View style={[styles.dropdown, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {SUBJECTS.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                onPress={() => { setSubject(s); setShowSubjectPicker(false); }}
              >
                <Text style={[styles.dropdownText, { color: s === subject ? theme.primary : theme.text }]}>{s}</Text>
                {s === subject && <Ionicons name="checkmark" size={14} color={theme.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Deadline */}
        <Text style={[styles.label, { color: theme.textSecondary, marginTop: 14 }]}>Deadline * (YYYY-MM-DD)</Text>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceAlt }]}
          placeholder="e.g., 2025-12-31"
          placeholderTextColor={theme.textSecondary}
          value={deadline}
          onChangeText={setDeadline}
          keyboardType="numbers-and-punctuation"
          autoCorrect={false}
        />

        {/* Priority chips */}
        <ChipGroup
          label="Priority *"
          options={PRIORITY_OPTIONS}
          value={priority}
          onChange={setPriority}
          theme={theme}
        />

        {/* Type chips */}
        <ChipGroup
          label="Type *"
          options={TYPE_OPTIONS}
          value={type}
          onChange={setType}
          theme={theme}
        />

        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handleAdd}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <Text style={styles.submitText}>Add Task</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  card:         { borderRadius: 20, padding: 20, elevation: 2 },
  label:        { fontSize: 11, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:        { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, height: 48, fontSize: 14 },
  textArea:     { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, minHeight: 80 },
  picker:       { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, height: 48, gap: 8 },
  dropdown:     { borderWidth: 1.5, borderRadius: 10, marginTop: 4, overflow: 'hidden', elevation: 4 },
  dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  dropdownText: { fontSize: 13, flex: 1 },
  chipRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, gap: 5 },
  chipText:     { fontSize: 12, fontWeight: '700' },
  submitBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: 14, marginTop: 8, gap: 8, elevation: 4 },
  submitText:   { color: '#fff', fontSize: 16, fontWeight: '700' },
});