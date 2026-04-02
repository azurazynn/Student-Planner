import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface Props {
  selectedDay: string;
  onSelectDay: (day: string) => void;
  theme?: any;           // make theme optional
  scheduleDays?: string[];
}

const DAYS = [
  { full: 'Monday', short: 'M' },
  { full: 'Tuesday', short: 'T' },
  { full: 'Wednesday', short: 'W' },
  { full: 'Thursday', short: 'Th' },
  { full: 'Friday', short: 'F' },
  { full: 'Saturday', short: 'Sa' },
];

export default function DaySelector({
  selectedDay,
  onSelectDay,
  theme = {},           // fallback to empty object
  scheduleDays = [],
}: Props) {
  const primary = theme.primary || '#2563EB';
  const surface = theme.surface || '#fff';
  const border = theme.border || '#ccc';
  const textSecondary = theme.textSecondary || '#888';

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {DAYS.map((day) => {
          const isSelected = selectedDay === day.full;
          const hasClass = scheduleDays.includes(day.full);

          return (
            <TouchableOpacity
              key={day.full}
              style={[
                styles.button,
                {
                  backgroundColor: isSelected ? primary : surface,
                  borderColor: isSelected ? primary : hasClass ? primary + '40' : border,
                  shadowColor: isSelected ? primary : 'transparent',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isSelected ? 0.3 : 0,
                  shadowRadius: 8,
                  elevation: isSelected ? 4 : 0,
                },
              ]}
              onPress={() => onSelectDay(day.full)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.shortLabel,
                  { color: isSelected ? '#fff' : hasClass ? primary : textSecondary },
                ]}
              >
                {day.short}
              </Text>
              {hasClass && !isSelected && <View style={[styles.dot, { backgroundColor: primary }]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingVertical: 4 },
  container: { paddingHorizontal: 16, gap: 8 },
  button: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shortLabel: { fontSize: 13, fontWeight: '700' },
  dot: { width: 4, height: 4, borderRadius: 2, position: 'absolute', bottom: 6 },
});