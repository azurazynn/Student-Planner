import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '../utils/storage';
import { useApp } from '../AppContext';

export default function SignUpScreen({ navigation }: any) {
  const { theme } = useApp();
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
    await new Promise(r => setTimeout(r, 800));
    const success = await storage.saveUser({
      email: email.trim().toLowerCase(),
      password,
      name: name.trim(),
      studentId: studentId.trim(),
      course: course.trim(),
      section: section.trim().toUpperCase(),
    });
    setLoading(false);

    if (success) {
      Alert.alert('Account Created!', 'You can now sign in.', [
        { text: 'OK', onPress: () => navigation.replace('Login') }
      ]);
    } else {
      Alert.alert('Email Already Used', 'An account with this email already exists.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 40, alignItems: 'center', paddingTop: 40 }}
      >
        {/* Back to Login Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.replace('Login')}
        >
          <Ionicons name="arrow-back-outline" size={20} color={theme.text} />
          <Text style={[styles.backText, { color: theme.text }]}>Back to Login</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 20, marginTop: 40 }}>
          <Image
            source={require('../assets/studentplanner_logo.png')}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
          <Text style={[styles.logoText, { color: theme.text }]}>Student Planner</Text>
        </View>

        <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Register your student profile</Text>

        <View style={[styles.form, { backgroundColor: theme.surface }]}>
          {[
            { label: 'Full Name', value: name, onChange: setName, placeholder: 'Juan Dela Cruz', caps: 'words' },
            { label: 'Student ID', value: studentId, onChange: setStudentId, placeholder: '2024-XXXXX', caps: 'none' },
            { label: 'Course', value: course, onChange: setCourse, placeholder: 'BS Information Systems', caps: 'words' },
            { label: 'Section', value: section, onChange: setSection, placeholder: '2A', caps: 'characters' },
            { label: 'Email Address', value: email, onChange: setEmail, placeholder: 'your@email.com', caps: 'none', keyboard: 'email-address' },
          ].map(({ label, value, onChange, placeholder, caps, keyboard }: any) => (
            <View key={label} style={{ marginBottom: 14 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
              <View style={[styles.inputWrap, { borderColor: theme.border, backgroundColor: theme.surfaceAlt }]}>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={placeholder}
                  placeholderTextColor={theme.textSecondary + '80'}
                  value={value}
                  onChangeText={onChange}
                  keyboardType={keyboard || 'default'}
                  autoCapitalize={caps}
                />
              </View>
            </View>
          ))}

          <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
          <View style={[styles.inputWrap, { borderColor: theme.border, backgroundColor: theme.surfaceAlt, marginBottom: 14 }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Min. 6 characters"
              placeholderTextColor={theme.textSecondary + '80'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.textSecondary }]}>Confirm Password</Text>
          <View style={[styles.inputWrap, { borderColor: theme.border, backgroundColor: theme.surfaceAlt, marginBottom: 20 }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Re-enter password"
              placeholderTextColor={theme.textSecondary + '80'}
              value={confirmPass}
              onChangeText={setConfirmPass}
              secureTextEntry={!showPass}
            />
          </View>

          <TouchableOpacity
            style={[styles.signupBtn, { backgroundColor: theme.primary, opacity: loading ? 0.75 : 1 }]}
            onPress={handleSignUp}
            disabled={loading}
          >
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
  backBtn: { flexDirection: 'row', alignItems: 'center', position: 'absolute', top: Platform.OS === 'ios' ? 60 : 20, left: 16, zIndex: 10, gap: 6, marginTop: 30},
  backText: { fontSize: 15, fontWeight: '600' },
  logoText: { fontSize: 20, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  form: { borderRadius: 24, padding: 20, elevation: 3, width: '100%' },
  label: { fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 14, height: 48, gap: 8 },
  input: { flex: 1, fontSize: 14 },
  signupBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: 14, gap: 8, elevation: 4 },
  signupBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});