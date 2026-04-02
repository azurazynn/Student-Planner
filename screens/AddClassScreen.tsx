import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { ClassSchedule } from '../types/navigation';

const ALL_DAYS: ClassSchedule['days'][number][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT: Record<string, string> = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat' };

export default function AddClassScreen({ navigation }: any) {
  const { theme, schedule, setSchedule } = useApp();
  const [subject, setSubject] = useState('');
  const [code, setCode] = useState('');
  const [professor, setProfessor] = useState('');
  const [room, setRoom] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [units, setUnits] = useState('3');
  const [selectedDays, setSelectedDays] = useState<typeof ALL_DAYS>([]);

  const toggleDay = (day: typeof ALL_DAYS[number]) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleAdd = () => {
    if (!subject.trim() || !code.trim() || !professor.trim() || !room.trim() || !startTime.trim() || !endTime.trim() || selectedDays.length === 0) {
      Alert.alert('Missing Fields', 'Please fill all required fields and select at least one day.'); return;
    }
    const newClass: ClassSchedule = {
      id: `s${Date.now()}`, subject: subject.trim(), subjectCode: code.trim().toUpperCase(),
      days: selectedDays, startTime: startTime.trim(), endTime: endTime.trim(),
      room: room.trim(), professor: professor.trim(), units: parseInt(units) || 3,
    };
    setSchedule([...schedule, newClass]);
    navigation.goBack();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        {[
          { label: 'Subject Code *', value: code, onChange: setCode, placeholder: 'e.g., ISP 627', caps: 'characters' },
          { label: 'Subject Name *', value: subject, onChange: setSubject, placeholder: 'e.g., Mobile Applications Development', caps: 'words' },
          { label: 'Professor *', value: professor, onChange: setProfessor, placeholder: 'Prof. Name', caps: 'words' },
          { label: 'Room / Platform *', value: room, onChange: setRoom, placeholder: 'e.g., CLR 3 or Online Class', caps: 'words' },
          { label: 'Start Time *', value: startTime, onChange: setStartTime, placeholder: 'e.g., 9:00 AM', caps: 'none' },
          { label: 'End Time *', value: endTime, onChange: setEndTime, placeholder: 'e.g., 10:30 AM', caps: 'none' },
          { label: 'Units', value: units, onChange: setUnits, placeholder: '3', caps: 'none', keyboard: 'numeric' },
        ].map(({ label, value, onChange, placeholder, caps, keyboard }: any) => (
          <View key={label} style={{ marginBottom: 14 }}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceAlt }]} placeholder={placeholder} placeholderTextColor={theme.textSecondary + '80'} value={value} onChangeText={onChange} autoCapitalize={caps} keyboardType={keyboard || 'default'} />
          </View>
        ))}

        <Text style={[styles.label, { color: theme.textSecondary, marginBottom: 10 }]}>Days *</Text>
        <View style={styles.daysRow}>
          {ALL_DAYS.map(day => {
            const isSelected = selectedDays.includes(day);
            return (
              <TouchableOpacity key={day} style={[styles.dayChip, { backgroundColor: isSelected ? theme.primary : theme.surfaceAlt, borderColor: isSelected ? theme.primary : theme.border }]} onPress={() => toggleDay(day)}>
                <Text style={[styles.dayChipText, { color: isSelected ? '#fff' : theme.textSecondary }]}>{DAY_SHORT[day]}</Text>
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
  container: { flex: 1 },
  card: { borderRadius: 20, padding: 20, elevation: 2 },
  label: { fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, height: 48, fontSize: 14 },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  dayChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5 },
  dayChipText: { fontSize: 13, fontWeight: '700' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: 14, gap: 8, elevation: 4 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
