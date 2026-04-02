import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import TaskCard from '../components/TaskCard';
import { Task } from '../types/navigation';

type Filter = 'all' | 'pending' | 'in-progress' | 'completed' | 'high' | 'overdue';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'completed', label: 'Done' },
  { key: 'overdue', label: '⏰ Overdue' }, // ✅ NEW
  { key: 'high', label: '🔴 High' },
];

export default function TasksScreen({ navigation }: any) {
  const { theme, tasks, setTasks } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [filtered, setFiltered] = useState<Task[]>([]);

  useEffect(() => {
    let result = [...tasks];

    // ✅ normalize today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter !== 'all') {
      if (filter === 'high') {
        result = result.filter(t => t.priority === 'high');
      } 
      else if (filter === 'overdue') {
        result = result.filter(t => {
          const deadline = new Date(t.deadline);
          deadline.setHours(0, 0, 0, 0);
          return deadline < today && t.status !== 'completed';
        });
      } 
      else {
        result = result.filter(t => t.status === filter);
      }
    }

    // ✅ search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q)
      );
    }

    // ✅ sort by nearest deadline
    result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    setFiltered(result);
  }, [tasks, filter, search]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Task', 'Remove this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setTasks(tasks.filter(t => t.id !== id)) },
    ]);
  };

  // ✅ counts (including overdue)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => {
      const deadline = new Date(t.deadline);
      deadline.setHours(0, 0, 0, 0);
      return deadline < today && t.status !== 'completed';
    }).length,
    high: tasks.filter(t => t.priority === 'high').length,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>My Tasks</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('AddTask')}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={[styles.searchRow, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={[styles.searchBox, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={16} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search tasks..."
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* FILTERS */}
      <View style={[styles.filterRow, { borderBottomColor: theme.border }]}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterBtn,
              {
                backgroundColor: filter === f.key ? theme.primary : 'transparent',
                borderColor: filter === f.key ? theme.primary : theme.border
              }
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[
              styles.filterLabel,
              { color: filter === f.key ? '#fff' : theme.textSecondary }
            ]}>
              {f.label}
            </Text>

            <View style={[
              styles.filterCount,
              { backgroundColor: filter === f.key ? 'rgba(255,255,255,0.25)' : theme.border }
            ]}>
              <Text style={[
                styles.filterCountText,
                { color: filter === f.key ? '#fff' : theme.textSecondary }
              ]}>
                {counts[f.key]}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            theme={theme}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="clipboard-outline" size={48} color={theme.textSecondary + '60'} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No tasks found
            </Text>
            <TouchableOpacity
              style={[styles.emptyAddBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('AddTask')}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>
                Add Your First Task
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, borderBottomWidth: 1 },
  screenTitle: { fontSize: 24, fontWeight: '800' },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 4 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  searchRow: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, height: 40, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 6, borderBottomWidth: 1 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, gap: 5 },
  filterLabel: { fontSize: 12, fontWeight: '700' },
  filterCount: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 8 },
  filterCountText: { fontSize: 10, fontWeight: '700' },
  list: { padding: 14, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15 },
  emptyAddBtn: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
});