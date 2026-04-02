import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image, ImageErrorEventData, NativeSyntheticEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen({ navigation }: any): React.ReactElement {
  const fade = useRef<Animated.Value>(new Animated.Value(0)).current;
  const scale = useRef<Animated.Value>(new Animated.Value(0)).current;
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    // Animate logo
    Animated.parallel([
      Animated.timing(fade, { 
        toValue: 1, 
        duration: 1000, 
        useNativeDriver: true 
      }),
      Animated.spring(scale, { 
        toValue: 1, 
        friction: 5, 
        tension: 60, 
        useNativeDriver: true 
      }),
    ]).start();

    // Navigate after 5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Login'); // or 'Main' if user is already logged in
    }, 5000);

    return () => clearTimeout(timer); // cleanup on unmount
  }, []);

  const handleImageError = (e: NativeSyntheticEvent<ImageErrorEventData>): void => {
    console.log('Failed to load splash image:', e.nativeEvent.error);
    setImageError(true);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity: fade, transform: [{ scale }] }]}>
        <View style={styles.logoContainer}>
          {!imageError ? (
            <Image
              source={require('../assets/studentplanner_logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
              onError={handleImageError}
            />
          ) : (
            <View style={styles.fallbackIconContainer}>
              <Ionicons name="school" size={70} color="#fff" />
            </View>
          )}
        </View>
        <Text style={styles.appName}>Student Planner</Text>
        <Text style={styles.tagline}>Stay on top of your academics</Text>
        <View style={styles.loadingContainer}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotDelay1]} />
          <View style={[styles.dot, styles.dotDelay2]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrap: { 
    alignItems: 'center', 
    gap: 16 
  },
  logoContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoImage: {
    width: 180,
    height: 180,
  },
  fallbackIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  appName: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#fff',
    letterSpacing: 0.5,
  },
  tagline: { 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.75)', 
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
    opacity: 0.8,
  },
  dotDelay1: {
    opacity: 0.5,
  },
  dotDelay2: {
    opacity: 0.3,
  },
});