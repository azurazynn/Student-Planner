import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import DaySelector from '../components/DaySelector';
import ClassCard from '../components/ClassCard';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ScheduleScreen({ navigation }: any) {
  const { theme, schedule, setSchedule } = useApp();
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return DAYS.includes(today) ? today : 'Monday';
  });

  const filtered = schedule.filter(c => c.days.includes(selectedDay as any));
  const allDaysWithClasses = schedule.flatMap(c => c.days);
  const totalUnits = schedule.reduce((sum, c) => sum + (c.units || 0), 0);

  const handleDelete = (id: string) => {
    Alert.alert('Remove Class', 'Remove this class from schedule?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setSchedule(schedule.filter(c => c.id !== id)) },
    ]);
  };

  const colorIndex = (id: string) => schedule.findIndex(c => c.id === id);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.screenTitle, { color: theme.text }]}>Class Schedule</Text>
          <Text style={[styles.unitsText, { color: theme.textSecondary }]}>{totalUnits} total units • {schedule.length} subjects</Text>
        </View>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('AddClass')}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.daySelectorWrap, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <DaySelector selectedDay={selectedDay} onSelectDay={setSelectedDay} theme={theme} scheduleDays={allDaysWithClasses} />
        <Text style={[styles.dayLabel, { color: theme.text }]}>{selectedDay}</Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ padding: 14, paddingBottom: 100 }}>
        <View style={styles.dayStats}>
          <View style={[styles.statPill, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="calendar-outline" size={12} color={theme.primary} />
            <Text style={[styles.statText, { color: theme.primary }]}>{filtered.length} class{filtered.length !== 1 ? 'es' : ''}</Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: theme.success + '15' }]}>
            <Ionicons name="layers-outline" size={12} color={theme.success} />
            <Text style={[styles.statText, { color: theme.success }]}>{filtered.reduce((s, c) => s + (c.units || 0), 0)} units today</Text>
          </View>
        </View>

        {filtered.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.surface }]}>
            <Ionicons name="cafe-outline" size={36} color={theme.textSecondary + '60'} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Free Day!</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>No classes scheduled for {selectedDay}</Text>
          </View>
        ) : (
          filtered.map(c => (
            <ClassCard key={c.id} classItem={c} theme={theme} isNow={false} onDelete={handleDelete} colorIndex={colorIndex(c.id)} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, borderBottomWidth: 1 },
  screenTitle: { fontSize: 24, fontWeight: '800' },
  unitsText: { fontSize: 12, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 4 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  daySelectorWrap: { paddingTop: 12, paddingBottom: 4, borderBottomWidth: 1 },
  dayLabel: { fontSize: 13, fontWeight: '700', paddingHorizontal: 18, paddingBottom: 10, marginTop: 2 },
  list: { flex: 1 },
  dayStats: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5 },
  statText: { fontSize: 11, fontWeight: '700' },
  emptyBox: { borderRadius: 20, padding: 40, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
  emptySubtitle: { fontSize: 13, textAlign: 'center' },
});

