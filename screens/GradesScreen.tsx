import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
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
  const { theme, grades, setGrades, schedule } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedGradeType, setSelectedGradeType] = useState<'midterm' | 'final' | null>(null);
  const [gradeValue, setGradeValue] = useState('');

  // ✅ FIX: Build a lookup map from schedule so each grade row can show
  //         the subject name and code even if the grades object lacks them.
  const scheduleMap = React.useMemo(() => {
    const map: Record<string, { subject: string; subjectCode: string; units: number }> = {};
    schedule.forEach(c => {
      // Key by schedule id — grades are expected to share the same id as schedule entries
      map[c.id] = { subject: c.subject, subjectCode: c.subjectCode, units: c.units };
    });
    return map;
  }, [schedule]);

  // ✅ FIX: Helper to safely get subject info — prefer fields on the grade object
  //         itself (if they exist), then fall back to the schedule lookup.
  const getSubjectInfo = (g: any) => {
    const fromSchedule = scheduleMap[g.id] ?? {};
    return {
      subject:     g.subject     || fromSchedule.subject     || 'No Subject Name',
      subjectCode: g.subjectCode || fromSchedule.subjectCode || '—',
      units:       g.units       ?? fromSchedule.units       ?? 0,
    };
  };

  const openAddGrade = (id: string) => {
    setEditingId(id);
    setSelectedGradeType(null);
    setGradeValue('');
  };

  const saveGrade = () => {
    if (!editingId || !selectedGradeType) return;

    const value = parseFloat(gradeValue);
    if (isNaN(value) || value < 1.0 || value > 5.0) {
      Alert.alert('Invalid', 'Grade must be between 1.0 and 5.0.');
      return;
    }

    setGrades(grades.map(g => {
      if (g.id === editingId) {
        const newMid = selectedGradeType === 'midterm' ? value : g.midterm;
        const newFin = selectedGradeType === 'final' ? value : g.final;
        const avg = newMid !== null && newFin !== null ? (newMid + newFin) / 2 : newMid ?? null;
        return { ...g, midterm: newMid, final: newFin, gwa: avg };
      }
      return g;
    }));

    setEditingId(null);
    setSelectedGradeType(null);
    setGradeValue('');
  };

  const completedGrades = grades.filter(g => g.gwa !== null);
  const totalUnits = grades.reduce((s, g) => s + (getSubjectInfo(g).units), 0);
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

  // ✅ FIX: The editing grade's display info
  const editingGrade = grades.find(g => g.id === editingId);
  const editingInfo  = editingGrade ? getSubjectInfo(editingGrade) : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
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

      {/* Grades List */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 100 }}>
        {grades.length === 0 ? (
          // ✅ FIX: Friendly empty state when no schedule/grades exist yet
          <View style={[styles.emptyBox, { backgroundColor: theme.surface }]}>
            <Ionicons name="school-outline" size={40} color={theme.textSecondary + '60'} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Subjects Yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Add classes in your Schedule tab — they'll appear here automatically.
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>TAP A SUBJECT TO ENTER GRADES</Text>
            {grades.map((g, i) => {
              const accent = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
              const gc = gwaColor(g.gwa);
              const progress = gradeProgress(g.gwa);
              // ✅ FIX: Use helper so subject / code always resolves
              const { subject, subjectCode } = getSubjectInfo(g);

              return (
                <View key={g.id} style={[styles.gradeCard, { backgroundColor: theme.surface, borderLeftColor: accent }]}>
                  <View style={styles.gradeTop}>
                    <View style={{ flex: 1 }}>
                      {/* Subject Code */}
                      <View style={[styles.codeChip, { backgroundColor: accent + '18' }]}>
                        <Text style={[styles.codeText, { color: accent }]}>{subjectCode}</Text>
                      </View>
                      {/* Subject Name */}
                      <Text style={[styles.subjectName, { color: theme.text }]} numberOfLines={2}>
                        {subject}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => openAddGrade(g.id)}>
                      <View style={[styles.gwaCircle, { backgroundColor: g.gwa ? gc + '18' : theme.border, borderColor: g.gwa ? gc + '40' : theme.border }]}>
                        {g.gwa ? (
                          <>
                            <Text style={[styles.gwaVal, { color: gc }]}>{g.gwa.toFixed(2)}</Text>
                            <Text style={[styles.gwaLabel, { color: gc }]}>GWA</Text>
                          </>
                        ) : (
                          <>
                            <Ionicons name="add-outline" size={20} color={theme.textSecondary} />
                            <Text style={[styles.gwaLabel, { color: theme.textSecondary }]}>Add</Text>
                          </>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Grades Row */}
                  <View style={[styles.gradesRow, { borderTopColor: theme.border }]}>
                    {[{ label: 'Midterm', val: g.midterm }, { label: 'Final', val: g.final }, {
                      label: 'Average',
                      val: g.midterm !== null && g.final !== null
                        ? ((g.midterm + g.final) / 2).toFixed(2)
                        : g.midterm ?? null,
                    }].map(({ label, val }) => (
                      <View key={label} style={styles.gradeBox}>
                        <Text style={[styles.gradeBoxLabel, { color: theme.textSecondary }]}>{label}</Text>
                        <Text style={[styles.gradeBoxVal, { color: val !== null ? theme.text : theme.textSecondary + '60' }]}>
                          {val !== null ? val : '—'}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Progress Bar */}
                  {progress > 0 && (
                    <View style={{ marginHorizontal: 14, marginBottom: 12 }}>
                      <ProgressBar progress={progress} color={accent} height={4} duration={1000} backgroundColor={theme.border} />
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Modal */}
      <Modal visible={editingId !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.surface }]}>
            {/* ✅ FIX: Use resolved editingInfo instead of direct g.subjectCode */}
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingInfo?.subjectCode ?? '—'}
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]} numberOfLines={2}>
              {editingInfo?.subject ?? 'No Subject Name'}
            </Text>

            {!selectedGradeType ? (
              <>
                <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>Select Grade Type</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                  <TouchableOpacity style={[styles.modalSaveBtn, { flex: 1, backgroundColor: theme.primary }]} onPress={() => setSelectedGradeType('midterm')}>
                    <Text style={styles.modalSaveText}>Midterm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalSaveBtn, { flex: 1, backgroundColor: theme.primary }]} onPress={() => setSelectedGradeType('final')}>
                    <Text style={styles.modalSaveText}>Final</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>
                  Enter {selectedGradeType.charAt(0).toUpperCase() + selectedGradeType.slice(1)} Grade
                </Text>
                <TextInput
                  style={[styles.modalInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceAlt }]}
                  placeholder="e.g., 1.25"
                  placeholderTextColor={theme.textSecondary}
                  value={gradeValue}
                  onChangeText={setGradeValue}
                  keyboardType="numeric"
                  autoFocus
                />

                <View style={styles.modalBtns}>
                  <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: theme.border }]} onPress={() => setEditingId(null)}>
                    <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: theme.primary }]} onPress={saveGrade}>
                    <Text style={styles.modalSaveText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  emptyBox: { borderRadius: 20, padding: 40, alignItems: 'center', gap: 10, marginTop: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
  emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});