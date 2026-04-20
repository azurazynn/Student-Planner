import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ScrollView, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/supabaseClient';
import { useApp } from '../AppContext';

const Field = React.memo(({
  label, value, onChange, placeholder, caps = 'none',
  keyboard = 'default', secure = false, showPass = false,
  toggleShowPass, theme
}: any) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    <View style={[styles.inputWrap, { borderColor: theme.border, backgroundColor: theme.surfaceAlt }]}>
      <TextInput
        style={[styles.input, { color: theme.text }]}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary + '80'}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        autoCapitalize={caps}
        secureTextEntry={secure && !showPass}
      />
      {secure && toggleShowPass && (
        <TouchableOpacity onPress={toggleShowPass}>
          <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  </View>
));

export default function SignUpScreen({ navigation }: any) {
  const { theme, setCurrentUser } = useApp();
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('BS Information Systems');
  const [section, setSection] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    // Validation
    if (!name || !email || !password || !confirmPass || !studentId || !section) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPass) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      setLoading(false);
      Alert.alert('Signup Error', authError.message);
      return;
    }

    // 2. Insert into 'users' table
    const { error: profileError } = await supabase.from('users').insert([{
      id: authData.user?.id,
      name: name.trim(),
      student_id: studentId.trim(),
      course: course.trim(),
      section: section.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
    }]);

    if (profileError) {
      setLoading(false);
      Alert.alert('Error', profileError.message);
      return;
    }

    // 3. Automatically log in the user
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (loginError || !loginData.user) {
      setLoading(false);
      Alert.alert('Login Error', loginError?.message || 'Failed to log in.');
      return;
    }

    // 4. Set current user context
    await setCurrentUser({
      id: loginData.user.id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      studentId: studentId.trim(),
      course: course.trim(),
      section: section.trim().toUpperCase(),
      photo: null,
    });

    setLoading(false);
    Alert.alert('Welcome!', `Hello, ${name.split(' ')[0]}!`);
    navigation.replace('Main');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40, paddingTop: 40 }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.replace('Login')}>
          <Ionicons name="arrow-back-outline" size={20} color={theme.text} />
          <Text style={[styles.backText, { color: theme.text }]}>Back to Login</Text>
        </TouchableOpacity>

        <View style={{ alignItems: 'center', marginBottom: 20, marginTop: 50 }}>
          <Image source={require('../assets/studentplanner_logo.png')} style={{ width: 100, height: 100 }} resizeMode="contain" />
          <Text style={[styles.logoText, { color: theme.text }]}>Student Planner</Text>
        </View>

        <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Register your student profile</Text>

        <View style={[styles.form, { backgroundColor: theme.surface }]}>
          <Field label="Full Name *" value={name} onChange={setName} placeholder="Juan Dela Cruz" caps="words" theme={theme} />
          <Field label="Student ID *" value={studentId} onChange={setStudentId} placeholder="2024-XXXXX" theme={theme} />
          <Field label="Course *" value={course} onChange={setCourse} placeholder="BS Information Systems" caps="words" theme={theme} />
          <Field label="Section *" value={section} onChange={setSection} placeholder="2A" caps="characters" theme={theme} />
          <Field label="Email Address *" value={email} onChange={setEmail} placeholder="your@email.com" keyboard="email-address" theme={theme} />
          <Field label="Password *" value={password} onChange={setPassword} placeholder="Min. 6 characters" secure showPass={showPass} toggleShowPass={() => setShowPass(!showPass)} theme={theme} />
          <Field label="Confirm Password *" value={confirmPass} onChange={setConfirmPass} placeholder="Re-enter password" secure showPass={showPass} toggleShowPass={() => setShowPass(!showPass)} theme={theme} />

          <TouchableOpacity style={[styles.signupBtn, { backgroundColor: theme.primary, opacity: loading ? 0.75 : 1 }]} onPress={handleSignUp} disabled={loading}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
            <Text style={styles.signupBtnText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { fontSize: 15, fontWeight: '600' },
  logoText: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 14, marginBottom: 24, textAlign: 'center' },
  form: { borderRadius: 24, padding: 20, elevation: 3 },
  label: { fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 14, height: 48, gap: 8 },
  input: { flex: 1, fontSize: 14 },
  signupBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: 14, gap: 8, elevation: 4, marginTop: 8 },
  signupBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});