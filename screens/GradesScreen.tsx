import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { Grade } from '../types/navigation';
import ProgressBar from '../components/ProgressBar';
import { SUBJECT_COLORS } from '../constants/Colors';

// Map numeric grade to GWA scale
const toGWA = (grade: number): number => {
  if (grade >= 98) return 1.0;
  if (grade >= 95) return 1.25;
  if (grade >= 92) return 1.5;
  if (grade >= 89) return 1.75;
  if (grade >= 86) return 2.0;
  if (grade >= 83) return 2.25;
  if (grade >= 80) return 2.5;
  if (grade >= 77) return 2.75;
  if (grade >= 75) return 3.0;
  return 5.0;
};

// Color based on GWA
const gwaColor = (gwa: number | null): string => {
  if (!gwa) return '#6B7280';
  if (gwa <= 1.5) return '#10B981';
  if (gwa <= 2.0) return '#4F46E5';
  if (gwa <= 2.75) return '#F59E0B';
  if (gwa <= 3.0) return '#EF4444';
  return '#6B7280';
};

// Calculate progress for the progress bar
const gradeProgress = (gwa: number | null) => {
  if (!gwa) return 0;
  const steps = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 5.0];
  const clamped = Math.max(steps[0], Math.min(steps[steps.length - 1], gwa));

  let lower = steps[0], upper = steps[steps.length - 1];
  for (let i = 0; i < steps.length - 1; i++) {
    if (clamped >= steps[i] && clamped <= steps[i + 1]) {
      lower = steps[i];
      upper = steps[i + 1];
      break;
    }
  }

  const fraction = (clamped - lower) / (upper - lower);
  const lowerProgress = 1 - (steps.indexOf(lower) / (steps.length - 1));
  const upperProgress = 1 - (steps.indexOf(upper) / (steps.length - 1));

  return lowerProgress + (upperProgress - lowerProgress) * fraction;
};

export default function GradesScreen() {
  const { theme, grades, setGrades } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [midVal, setMidVal] = useState('');
  const [finVal, setFinVal] = useState('');

  const openEdit = (g: Grade) => {
    setEditingId(g.id);
    setMidVal(g.midterm?.toString() || '');
    setFinVal(g.final?.toString() || '');
  };

  const saveEdit = () => {
    if (!editingId) return;
    const mid = midVal ? parseFloat(midVal) : null;
    const fin = finVal ? parseFloat(finVal) : null;

    if (mid !== null && (mid < 1.0 || mid > 5.0)) {
      Alert.alert('Invalid', 'Grade must be between 1.0 and 5.0.');
      return;
    }
    if (fin !== null && (fin < 1.0 || fin > 5.0)) {
      Alert.alert('Invalid', 'Grade must be between 1.0 and 5.0.');
      return;
    }

    const avg = mid !== null && fin !== null ? (mid + fin) / 2 : mid ?? null;
    const gwa = avg !== null ? avg : null;

    setGrades(
      grades.map(g =>
        g.id === editingId ? { ...g, midterm: mid, final: fin, gwa } : g
      )
    );
    setEditingId(null);
  };

  const completedGrades = grades.filter(g => g.gwa !== null);
  const totalUnits = grades.reduce((s, g) => s + g.units, 0);
  const overallGWA =
    completedGrades.length > 0
      ? (completedGrades.reduce((s, g) => s + (g.gwa || 0), 0) / completedGrades.length).toFixed(2)
      : null;

  const honorLabel = overallGWA
    ? parseFloat(overallGWA) <= 1.25
      ? { text: 'Summa Cum Laude' }
      : parseFloat(overallGWA) <= 1.5
      ? { text: 'Magna Cum Laude' }
      : parseFloat(overallGWA) <= 1.75
      ? { text: 'Cum Laude' }
      : null
    : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.headerDecor} />
        <Text style={styles.headerTitle}>Grades & GWA</Text>
        <Text style={styles.headerSub}>Academic Year — 2nd Semester</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryVal}>{totalUnits}</Text>
            <Text style={styles.summaryLabel}>Total Units</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
          <View style={styles.summaryBox}>
            <Text style={styles.summaryVal}>{overallGWA || '—'}</Text>
            <Text style={styles.summaryLabel}>Current GWA</Text>
            {honorLabel && <Text style={styles.honorText}>{honorLabel.text}</Text>}
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
          <View style={styles.summaryBox}>
            <Text style={styles.summaryVal}>{completedGrades.length}/{grades.length}</Text>
            <Text style={styles.summaryLabel}>Graded</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 100 }}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>TAP A SUBJECT TO ENTER GRADES</Text>
        {grades.map((g, i) => {
          const accent = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
          const gc = gwaColor(g.gwa);
          const progress = gradeProgress(g.gwa);

          return (
            <TouchableOpacity
              key={g.id}
              style={[styles.gradeCard, { backgroundColor: theme.surface, borderLeftColor: accent }]}
              onPress={() => openEdit(g)}
              activeOpacity={0.8}
            >
              <View style={styles.gradeTop}>
                <View style={{ flex: 1 }}>
                  <View style={[styles.codeChip, { backgroundColor: accent + '18' }]}>
                    <Text style={[styles.codeText, { color: accent }]}>{g.subjectCode}</Text>
                    <View style={[styles.unitBadge, { backgroundColor: accent + '30' }]}>
                      <Text style={[styles.unitText, { color: accent }]}>{g.units}u</Text>
                    </View>
                  </View>
                  <Text style={[styles.subjectName, { color: theme.text }]} numberOfLines={2}>{g.subject}</Text>
                </View>
                {g.gwa !== null ? (
                  <View style={[styles.gwaCircle, { backgroundColor: gc + '18', borderColor: gc + '40' }]}>
                    <Text style={[styles.gwaVal, { color: gc }]}>{g.gwa.toFixed(2)}</Text>
                    <Text style={[styles.gwaLabel, { color: gc }]}>GWA</Text>
                  </View>
                ) : (
                  <View style={[styles.gwaCircle, { backgroundColor: theme.border, borderColor: theme.border }]}>
                    <Ionicons name="pencil-outline" size={16} color={theme.textSecondary} />
                    <Text style={[styles.gwaLabel, { color: theme.textSecondary }]}>Enter</Text>
                  </View>
                )}
              </View>
              <View style={[styles.gradesRow, { borderTopColor: theme.border }]}>
                {[
                  { label: 'Midterm', val: g.midterm },
                  { label: 'Final', val: g.final },
                  {
                    label: 'Average',
                    val:
                      g.midterm !== null && g.final !== null
                        ? ((g.midterm + g.final) / 2).toFixed(2)
                        : g.midterm ?? null,
                  },
                ].map(({ label, val }) => (
                  <View key={label} style={styles.gradeBox}>
                    <Text style={[styles.gradeBoxLabel, { color: theme.textSecondary }]}>{label}</Text>
                    <Text style={[styles.gradeBoxVal, { color: val !== null ? theme.text : theme.textSecondary + '60' }]}>{val !== null ? val : '—'}</Text>
                  </View>
                ))}
              </View>
              {progress > 0 && (
                <View style={{ marginHorizontal: 14, marginBottom: 12 }}>
                  <ProgressBar progress={progress} color={accent} height={4} duration={1000} backgroundColor={theme.border} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal visible={editingId !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{grades.find(g => g.id === editingId)?.subjectCode || ''}</Text>
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]} numberOfLines={2}>{grades.find(g => g.id === editingId)?.subject || ''}</Text>
            <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>Midterm Grade (1.0–5.0)</Text>
            <TextInput
              style={[styles.modalInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceAlt }]}
              placeholder="e.g., 1.25"
              placeholderTextColor={theme.textSecondary}
              value={midVal}
              onChangeText={setMidVal}
              keyboardType="numeric"
            />
            <Text style={[styles.label, { color: theme.textSecondary, marginTop: 12 }]}>Final Grade (1.0–5.0)</Text>
            <TextInput
              style={[styles.modalInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceAlt }]}
              placeholder="e.g., 1.5"
              placeholderTextColor={theme.textSecondary}
              value={finVal}
              onChangeText={setFinVal}
              keyboardType="numeric"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: theme.border }]} onPress={() => setEditingId(null)}>
                <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: theme.primary }]} onPress={saveEdit}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
  headerDecor: { position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.08)' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 2 },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 20 },
  summaryRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 16 },
  summaryBox: { flex: 1, alignItems: 'center', gap: 4 },
  summaryVal: { fontSize: 22, fontWeight: '800', color: '#fff' },
  summaryLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  summaryDivider: { width: 1, marginHorizontal: 8 },
  honorText: { fontSize: 9, color: '#FDE68A', fontWeight: '700', textAlign: 'center', marginTop: 2 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 12, marginTop: 4 },
  gradeCard: { borderRadius: 16, marginBottom: 10, borderLeftWidth: 4, elevation: 2 },
  gradeTop: { flexDirection: 'row', padding: 14, paddingBottom: 8, gap: 12, alignItems: 'flex-start' },
  codeChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 6, marginBottom: 6 },
  codeText: { fontSize: 11, fontWeight: '800' },
  unitBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  unitText: { fontSize: 10, fontWeight: '700' },
  subjectName: { fontSize: 14, fontWeight: '700', lineHeight: 19 },
  gwaCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  gwaVal: { fontSize: 16, fontWeight: '900' },
  gwaLabel: { fontSize: 9, fontWeight: '700' },
  gradesRow: { flexDirection: 'row', borderTopWidth: 1, marginHorizontal: 14, paddingVertical: 10 },
  gradeBox: { flex: 1, alignItems: 'center', gap: 2 },
  gradeBoxLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  gradeBoxVal: { fontSize: 16, fontWeight: '800' },
  label: { fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, marginBottom: 4 },
  modalInput: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, height: 48, fontSize: 16 },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalCancelBtn: { flex: 1, height: 50, borderRadius: 12, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  modalCancelText: { fontWeight: '700' },
  modalSaveBtn: { flex: 2, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  modalSaveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});