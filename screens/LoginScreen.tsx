import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '../utils/storage';
import { useApp } from '../AppContext';

export default function LoginScreen({ navigation }: any) {
  const { theme } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

   const users = await storage.getUsers();
   const user = users.find(u => u.email === email.trim().toLowerCase());
    if (!user || user.password !== password) {
      Alert.alert('Login Failed', 'Invalid email or password.');
    } else {
      Alert.alert('Welcome', `Hello ${user.name}!`);
      navigation.replace('Main');
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 40, alignItems: 'center', paddingTop: 60 }}
      >
        <Image
          source={require('../assets/studentplanner_logo.png')}
          style={{ width: 140, height: 140 }}
          resizeMode="contain"
        />
        <Text style={[styles.logoText, { color: theme.text, marginBottom: 20 }]}>Student Planner</Text>

        <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Sign in to continue</Text>

        <View style={[styles.form, { backgroundColor: theme.surface }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Email Address</Text>
          <View style={[styles.inputWrap, { borderColor: theme.border, backgroundColor: theme.surfaceAlt, marginBottom: 14 }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="your@email.com"
              placeholderTextColor={theme.textSecondary + '80'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
          <View style={[styles.inputWrap, { borderColor: theme.border, backgroundColor: theme.surfaceAlt, marginBottom: 20 }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Enter password"
              placeholderTextColor={theme.textSecondary + '80'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: theme.primary, opacity: loading ? 0.75 : 1 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Ionicons name="log-in-outline" size={18} color="#fff" />
            <Text style={styles.loginBtnText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.replace('SignUp')} style={{ marginTop: 16 }}>
            <Text style={{ color: theme.primary, fontWeight: '600' }}>Create a new account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoText: { fontSize: 20, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  form: { borderRadius: 24, padding: 20, elevation: 3, width: '100%' },
  label: { fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 14, height: 48, gap: 8 },
  input: { flex: 1, fontSize: 14 },
  loginBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: 14, gap: 8, elevation: 4 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});