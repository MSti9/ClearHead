import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain } from 'lucide-react-native';

interface BrainLogoProps {
  size?: number;
  showBackground?: boolean;
}

export function BrainLogo({ size = 48, showBackground = true }: BrainLogoProps) {
  const iconSize = showBackground ? size * 0.55 : size;

  if (!showBackground) {
    return <Brain size={iconSize} color="#8B7355" strokeWidth={1.5} />;
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
      }}
    >
      <LinearGradient
        colors={['#F5E6DC', '#E8D4C8', '#DBC7B8']}
        style={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Brain size={iconSize} color="#8B7355" strokeWidth={1.5} />
      </LinearGradient>
    </View>
  );
}
