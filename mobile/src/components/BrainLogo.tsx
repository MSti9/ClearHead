import React from 'react';
import { View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface BrainLogoProps {
  size?: number;
  showBackground?: boolean;
}

export function BrainLogo({ size = 48, showBackground = true }: BrainLogoProps) {
  const imageSize = showBackground ? size * 0.65 : size * 0.65;

  if (!showBackground) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#E8D4C8',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Image
          source={require('../../public/image-2.png')}
          style={{
            width: imageSize,
            height: imageSize,
          }}
          resizeMode="contain"
        />
      </View>
    );
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
        <Image
          source={require('../../public/image-2.png')}
          style={{
            width: imageSize,
            height: imageSize,
          }}
          resizeMode="contain"
        />
      </LinearGradient>
    </View>
  );
}
