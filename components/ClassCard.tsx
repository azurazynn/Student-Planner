import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ClassSchedule } from '../types/navigation';
import { SUBJECT_COLORS } from '../constants/Colors';

interface Props {
  classItem: ClassSchedule;
  theme?: any; // make theme optional
  isNow?: boolean;
  onDelete?: (id: string) => void;
  colorIndex?: number;
}

export default function ClassCard({
  classItem,
  theme = {}, // fallback to empty object
  isNow = false,
  onDelete,
  colorIndex = 0,
}: Props) {
  const accentColor = SUBJECT_COLORS[colorIndex % SUBJECT_COLORS.length];
  const isOnline = classItem.room.toLowerCase().includes('online');

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface || '#fff', // fallback to white
          borderLeftColor: accentColor,
        },
      ]}
    >
      {isNow && (
        <View style={[styles.nowPill, { backgroundColor: '#F59E0B' }]}>
          <View style={styles.nowDot} />
          <Text style={styles.nowText}>LIVE</Text>
        </View>
      )}
      <View style={styles.timeStrip}>
        <Text style={[styles.timeText, { color: accentColor }]}>
          {classItem.startTime}
        </Text>
        <View style={[styles.timeLine, { backgroundColor: accentColor + '40' }]} />
        <Text style={[styles.timeText, { color: theme.textSecondary || '#888' }]}>
          {classItem.endTime}
        </Text>
      </View>
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={[styles.codeChip, { backgroundColor: accentColor + '18' }]}>
            <Text style={[styles.codeText, { color: accentColor }]}>
              {classItem.subjectCode}
            </Text>
          </View>
          <View
            style={[
              styles.roomChip,
              { backgroundColor: isOnline ? '#06B6D4' + '18' : (theme.border || '#ccc') + '80' },
            ]}
          >
            <Ionicons
              name={isOnline ? 'wifi-outline' : 'location-outline'}
              size={10}
              color={isOnline ? '#06B6D4' : theme.textSecondary || '#888'}
            />
            <Text
              style={[styles.roomText, { color: isOnline ? '#06B6D4' : theme.textSecondary || '#888' }]}
              numberOfLines={1}
            >
              {classItem.room}
            </Text>
          </View>
        </View>
        <Text style={[styles.subjectName, { color: theme.text || '#000' }]} numberOfLines={2}>
          {classItem.subject}
        </Text>
        <View style={styles.profRow}>
          <Ionicons name="person-outline" size={11} color={theme.textSecondary || '#888'} />
          <Text style={[styles.profText, { color: theme.textSecondary || '#888' }]}>
            {classItem.professor}
          </Text>
        </View>
        {onDelete && (
          <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(classItem.id)}>
            <Ionicons name="trash-outline" size={14} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  nowPill: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  nowDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff' },
  nowText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  timeStrip: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 14, gap: 4, minWidth: 62 },
  timeText: { fontSize: 11, fontWeight: '700' },
  timeLine: { width: 1.5, height: 16 },
  body: { flex: 1, paddingVertical: 12, paddingRight: 12, gap: 4 },
  topRow: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 },
  codeChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  codeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  roomChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, gap: 3, maxWidth: 120 },
  roomText: { fontSize: 10, fontWeight: '600' },
  subjectName: { fontSize: 14, fontWeight: '700', lineHeight: 19 },
  profRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  profText: { fontSize: 11 },
  deleteBtn: { position: 'absolute', bottom: 10, right: 0, padding: 4 },
});