import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { ClassSchedule } from '../types/navigation';

const ALL_DAYS: ClassSchedule['days'][number][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT: Record<string, string> = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat' };

// ── Defined OUTSIDE screen so it's never recreated on state change ────────────

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  caps?: 'none' | 'sentences' | 'words' | 'characters';
  keyboard?: any;
  theme: any;
}

function Field({ label, value, onChange, placeholder, caps = 'sentences', keyboard = 'default', theme }: FieldProps) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceAlt }]}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary + '80'}
        value={value}
        onChangeText={onChange}
        autoCapitalize={caps}
        keyboardType={keyboard}
        autoCorrect={false}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AddClassScreen({ navigation }: any) {
  const { theme, schedule, setSchedule } = useApp();

  const [subject,      setSubject]      = useState('');
  const [code,         setCode]         = useState('');
  const [professor,    setProfessor]    = useState('');
  const [room,         setRoom]         = useState('');
  const [startTime,    setStartTime]    = useState('');
  const [endTime,      setEndTime]      = useState('');
  const [units,        setUnits]        = useState('3');
  const [selectedDays, setSelectedDays] = useState<typeof ALL_DAYS>([]);

  const toggleDay = useCallback((day: typeof ALL_DAYS[number]) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  }, []);

  const handleAdd = useCallback(() => {
    if (!subject.trim() || !code.trim() || !professor.trim() || !room.trim() || !startTime.trim() || !endTime.trim() || selectedDays.length === 0) {
      Alert.alert('Missing Fields', 'Please fill all required fields and select at least one day.');
      return;
    }
    const newClass: ClassSchedule = {
      id:          `s${Date.now()}`,
      user_id:     '',                          // AppContext fills this on sync
      subject:     subject.trim(),
      subjectCode: code.trim().toUpperCase(),
      days:        selectedDays,
      startTime:   startTime.trim(),
      endTime:     endTime.trim(),
      room:        room.trim(),
      professor:   professor.trim(),
      units:       parseInt(units) || 3,
    };
    setSchedule([...schedule, newClass]);
    navigation.goBack();
  }, [subject, code, professor, room, startTime, endTime, units, selectedDays, schedule]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.card, { backgroundColor: theme.surface }]}>

        <Field label="Subject Code *"      value={code}       onChange={setCode}       placeholder="e.g., ISP 627"                          caps="characters" theme={theme} />
        <Field label="Subject Name *"      value={subject}    onChange={setSubject}    placeholder="e.g., Mobile Applications Development"   caps="words"      theme={theme} />
        <Field label="Professor *"         value={professor}  onChange={setProfessor}  placeholder="Prof. Name"                              caps="words"      theme={theme} />
        <Field label="Room / Platform *"   value={room}       onChange={setRoom}       placeholder="e.g., CLR 3 or Online Class"             caps="words"      theme={theme} />
        <Field label="Start Time *"        value={startTime}  onChange={setStartTime}  placeholder="e.g., 9:00 AM"                           caps="none"       theme={theme} />
        <Field label="End Time *"          value={endTime}    onChange={setEndTime}    placeholder="e.g., 10:30 AM"                          caps="none"       theme={theme} />
        <Field label="Units"               value={units}      onChange={setUnits}      placeholder="3"                                       caps="none"       keyboard="numeric" theme={theme} />

        {/* Day selector */}
        <Text style={[styles.label, { color: theme.textSecondary, marginBottom: 10 }]}>Days *</Text>
        <View style={styles.daysRow}>
          {ALL_DAYS.map(day => {
            const isSelected = selectedDays.includes(day);
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayChip, {
                  backgroundColor: isSelected ? theme.primary : theme.surfaceAlt,
                  borderColor:     isSelected ? theme.primary : theme.border,
                }]}
                onPress={() => toggleDay(day)}
              >
                <Text style={[styles.dayChipText, { color: isSelected ? '#fff' : theme.textSecondary }]}>
                  {DAY_SHORT[day]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handleAdd}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.submitText}>Add to Schedule</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  card:        { borderRadius: 20, padding: 20, elevation: 2 },
  label:       { fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:       { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, height: 48, fontSize: 14 },
  daysRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  dayChip:     { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5 },
  dayChipText: { fontSize: 13, fontWeight: '700' },
  submitBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: 14, gap: 8, elevation: 4 },
  submitText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
});