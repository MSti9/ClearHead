import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Rect, Circle } from 'react-native-svg';

// Subtle paper texture overlay that creates a tactile, organic feel
// Uses SVG noise pattern for a warm minimalist aesthetic
export function PaperTexture({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="paperNoise"
            patternUnits="userSpaceOnUse"
            width="100"
            height="100"
          >
            {/* Subtle dots creating paper fiber effect */}
            <Circle cx="5" cy="12" r="0.5" fill="#8B7355" />
            <Circle cx="23" cy="8" r="0.4" fill="#9C9690" />
            <Circle cx="41" cy="31" r="0.5" fill="#8B7355" />
            <Circle cx="67" cy="19" r="0.3" fill="#A69280" />
            <Circle cx="89" cy="42" r="0.5" fill="#9C9690" />
            <Circle cx="12" cy="56" r="0.4" fill="#8B7355" />
            <Circle cx="34" cy="67" r="0.5" fill="#A69280" />
            <Circle cx="78" cy="73" r="0.3" fill="#9C9690" />
            <Circle cx="56" cy="88" r="0.4" fill="#8B7355" />
            <Circle cx="91" cy="91" r="0.5" fill="#A69280" />
            <Circle cx="18" cy="94" r="0.3" fill="#9C9690" />
            <Circle cx="47" cy="3" r="0.4" fill="#8B7355" />
            <Circle cx="72" cy="52" r="0.5" fill="#A69280" />
            <Circle cx="8" cy="38" r="0.3" fill="#9C9690" />
            <Circle cx="95" cy="25" r="0.4" fill="#8B7355" />
            <Circle cx="29" cy="79" r="0.5" fill="#A69280" />
            <Circle cx="61" cy="45" r="0.3" fill="#9C9690" />
            <Circle cx="83" cy="61" r="0.4" fill="#8B7355" />
            <Circle cx="15" cy="71" r="0.5" fill="#A69280" />
            <Circle cx="50" cy="54" r="0.3" fill="#9C9690" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#paperNoise)" />
      </Svg>
    </View>
  );
}
