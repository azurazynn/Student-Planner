import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../utils/supabaseClient';
import { useApp, User } from '../AppContext';

export default function ProfileScreen({ navigation }: any) {
  const { theme, isDarkMode, toggleTheme, currentUser, setCurrentUser, schedule, tasks, grades } = useApp();
  const [userInfo, setUserInfo] = useState<User | null>(currentUser);
  const [saving, setSaving] = useState(false);

  if (!userInfo) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.textSecondary }}>Loading profile...</Text>
      </View>
    );
  }

  // Initials from first + last word of name
  const initials = userInfo.name
    .split(' ')
    .filter((_: any, i: number, a: any[]) => i === 0 || i === a.length - 1)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase();

  const totalUnits = schedule.reduce((s, c) => s + (c.units || 0), 0);
  const completedGrades = grades.filter(g => g.gwa !== null);
  const avgGWA =
    completedGrades.length > 0
      ? (completedGrades.reduce((s, g) => s + (g.gwa || 0), 0) / completedGrades.length).toFixed(2)
      : '—';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await setCurrentUser(null); // clears context + calls supabase.auth.signOut()
          navigation.replace('Login');
        },
      },
    ]);
  };

  const handleChange = (field: keyof User, value: string) => {
    setUserInfo(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSave = async () => {
    if (!userInfo) return;
    setSaving(true);

    const { error } = await supabase
      .from('users')
      .update({
        name: userInfo.name,
        email: userInfo.email,
        student_id: userInfo.studentId,
        course: userInfo.course,
        section: userInfo.section,
        photo: userInfo.photo || null,
      })
      .eq('id', userInfo.id);   // ← uses the auth user's ID correctly

    setSaving(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      await setCurrentUser(userInfo); // update context
      Alert.alert('Saved', 'Your profile has been updated.');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) {
      setUserInfo(prev => prev ? { ...prev, photo: result.assets[0].uri } : null);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero ── */}
      <View style={[styles.hero, { backgroundColor: theme.primary }]}>
        <TouchableOpacity style={[styles.avatar, { borderColor: 'rgba(255,255,255,0.3)' }]} onPress={pickImage}>
          {userInfo.photo ? (
            <Image source={{ uri: userInfo.photo }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{initials}</Text>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={styles.heroName}>{userInfo.name}</Text>
        <Text style={styles.heroId}>{userInfo.studentId}</Text>

        <View style={styles.heroBadgeRow}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{userInfo.course}</Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Section {userInfo.section}</Text>
          </View>
        </View>

        <View style={styles.heroStats}>
          {[
            { label: 'Units', value: totalUnits },
            { label: 'Subjects', value: schedule.length },
            { label: 'GWA', value: avgGWA },
            { label: 'Tasks', value: tasks.filter(t => t.status !== 'completed').length },
          ].map((s, i) => (
            <View key={i} style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{s.value}</Text>
              <Text style={styles.heroStatLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.body}>
        {/* ── Account Info ── */}
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Account Information</Text>
          {[
            { icon: 'person-outline', label: 'Full Name', field: 'name' },
            { icon: 'mail-outline', label: 'Email', field: 'email' },
            { icon: 'id-card-outline', label: 'Student ID', field: 'studentId' },
            { icon: 'school-outline', label: 'Course', field: 'course' },
            { icon: 'people-outline', label: 'Section', field: 'section' },
          ].map((item, i) => (
            <View key={i} style={[styles.infoRow, { borderBottomColor: theme.border }]}>
              <View style={styles.infoLeft}>
                <View style={[styles.infoIcon, { backgroundColor: theme.primary + '15' }]}>
                  <Ionicons name={item.icon as any} size={14} color={theme.primary} />
                </View>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{item.label}</Text>
              </View>
              <TextInput
                style={[styles.infoValue, { color: theme.text }]}
                value={userInfo[item.field as keyof User] as string}
                onChangeText={t => handleChange(item.field as keyof User, t)}
              />
            </View>
          ))}

          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, { opacity: saving ? 0.7 : 1 }]}
            disabled={saving}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
            <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Preferences ── */}
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Preferences</Text>
          <TouchableOpacity style={[styles.prefRow, { borderBottomColor: theme.border }]} onPress={toggleTheme}>
            <View style={styles.prefLeft}>
              <View style={[styles.infoIcon, { backgroundColor: (isDarkMode ? '#6366F1' : '#F59E0B') + '20' }]}>
                <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={14} color={isDarkMode ? '#6366F1' : '#F59E0B'} />
              </View>
              <Text style={[styles.prefLabel, { color: theme.text }]}>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</Text>
            </View>
            <View style={[styles.toggle, { backgroundColor: isDarkMode ? theme.primary : theme.border }]}>
              <View style={[styles.toggleThumb, { transform: [{ translateX: isDarkMode ? 22 : 2 }] }]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Sign Out ── */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { paddingTop: 60, paddingBottom: 28, paddingHorizontal: 20, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 14, borderWidth: 3 },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  cameraIcon: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#6366F1', padding: 4, borderRadius: 12 },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  heroName: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 4 },
  heroId: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 12 },
  heroBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  heroBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  heroBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  heroStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, paddingVertical: 14, width: '100%' },
  heroStat: { flex: 1, alignItems: 'center', gap: 3 },
  heroStatVal: { fontSize: 20, fontWeight: '800', color: '#fff' },
  heroStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  body: { padding: 16, gap: 14, paddingBottom: 32 },
  card: { borderRadius: 20, padding: 18, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: '700', maxWidth: 180, textAlign: 'right' },
  saveBtn: { marginTop: 14, padding: 12, backgroundColor: '#10B981', borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  saveText: { fontWeight: '700', color: '#fff' },
  prefRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  prefLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  prefLabel: { fontSize: 15, fontWeight: '600' },
  toggle: { width: 48, height: 28, borderRadius: 14, justifyContent: 'center' },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', elevation: 2 },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 14, backgroundColor: '#FEE2E2', gap: 8 },
  signOutText: { color: '#EF4444', fontWeight: '800', fontSize: 15 },
});