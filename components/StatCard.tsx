import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  theme: any;
  onPress?: () => void;
  subtitle?: string;
}

export default function StatCard({ title, value, icon, color, theme, onPress, subtitle }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surface }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: color }]}>{subtitle}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, padding: 14, borderRadius: 16, marginHorizontal: 4,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  value: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  title: { fontSize: 11, fontWeight: '600' },
  subtitle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
});
