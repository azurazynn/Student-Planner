import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface Props {
  progress: number;            // 0 to 100
  color?: string;              // optional, fallback added
  height?: number;
  duration?: number;
  backgroundColor?: string;
}

export default function ProgressBar({
  progress,
  color = '#2563EB',          // fallback to blue
  height = 6,
  duration = 2800,
  backgroundColor = '#E5E7EB',
}: Props) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, { toValue: progress, duration, useNativeDriver: false }).start();
  }, [progress]);

  const width = animatedValue.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.container, { height, backgroundColor, borderRadius: height / 2 }]}>
      <Animated.View style={[styles.bar, { width, backgroundColor: color, height, borderRadius: height / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', overflow: 'hidden' },
  bar: {},
});