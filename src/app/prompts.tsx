import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  X,
  Briefcase,
  Users,
  User,
  Cloud,
  Sun,
  Compass,
  ChevronRight,
  Shuffle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { promptCategories, getRandomPrompt, type PromptCategory } from '@/lib/prompts';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const iconMap: Record<string, React.ComponentType<{ size: number; color: string; strokeWidth: number }>> = {
  briefcase: Briefcase,
  users: Users,
  user: User,
  cloud: Cloud,
  sun: Sun,
  compass: Compass,
};

const colorMap: Record<string, { bg: string; text: string; gradient: [string, string] }> = {
  work: { bg: '#FEF3EE', text: '#C4775A', gradient: ['#C4775A', '#D4A088'] },
  relationships: { bg: '#F0EEF8', text: '#7C6BA0', gradient: ['#7C6BA0', '#9B8DC0'] },
  self: { bg: '#EEF4F0', text: '#5C7A65', gradient: ['#5C7A65', '#7C9A85'] },
  stress: { bg: '#F5F2EE', text: '#8B7355', gradient: ['#8B7355', '#A89375'] },
  gratitude: { bg: '#FEF9EE', text: '#C49A5A', gradient: ['#C49A5A', '#D4B47A'] },
  change: { bg: '#EEF2F5', text: '#5A7A8B', gradient: ['#5A7A8B', '#7A9AAB'] },
};

interface CategoryCardProps {
  category: PromptCategory;
  index: number;
  onPress: () => void;
}

function CategoryCard({ category, index, onPress }: CategoryCardProps) {
  const IconComponent = iconMap[category.icon] || Briefcase;
  const colors = colorMap[category.id] || colorMap.work;

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(150 + index * 50).springify()}
      onPress={onPress}
      className="rounded-2xl p-4 mb-3"
      style={{ backgroundColor: colors.bg }}
    >
      <View className="flex-row items-center">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${colors.text}20` }}
        >
          <IconComponent size={20} color={colors.text} strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Text
            style={{ fontFamily: 'DMSans_600SemiBold', color: colors.text }}
            className="text-base"
          >
            {category.name}
          </Text>
          <Text style={{ fontFamily: 'DMSans_400Regular' }} className="text-stone-500 text-xs">
            {category.description}
          </Text>
        </View>
        <ChevronRight size={20} color={colors.text} />
      </View>
    </AnimatedPressable>
  );
}

interface PromptListProps {
  category: PromptCategory;
  onSelectPrompt: (prompt: string) => void;
  onBack: () => void;
}

function PromptList({ category, onSelectPrompt, onBack }: PromptListProps) {
  const colors = colorMap[category.id] || colorMap.work;
  const IconComponent = iconMap[category.icon] || Briefcase;

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Category Header */}
      <Animated.View entering={FadeIn.delay(100)} className="mb-6">
        <LinearGradient
          colors={colors.gradient}
          style={{
            padding: 24,
            borderRadius: 24,
            marginBottom: 8,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mr-3">
              <IconComponent size={24} color="white" strokeWidth={2} />
            </View>
            <View>
              <Text style={{ fontFamily: 'DMSans_600SemiBold' }} className="text-white text-xl">
                {category.name}
              </Text>
              <Text style={{ fontFamily: 'DMSans_400Regular' }} className="text-white/70 text-sm">
                {category.prompts.length} prompts
              </Text>
            </View>
          </View>
        </LinearGradient>
        <Pressable
          onPress={onBack}
          className="flex-row items-center"
        >
          <Text style={{ fontFamily: 'DMSans_500Medium' }} className="text-stone-500">
            ← Back to categories
          </Text>
        </Pressable>
      </Animated.View>

      {/* Prompts */}
      {category.prompts.map((prompt, index) => (
        <AnimatedPressable
          key={index}
          entering={FadeInUp.delay(200 + index * 50).springify()}
          onPress={() => onSelectPrompt(prompt)}
          className="bg-white rounded-2xl p-4 mb-3"
          style={{
            shadowColor: '#2D2A26',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Text
            style={{ fontFamily: 'CormorantGaramond_500Medium' }}
            className="text-stone-700 text-lg leading-6"
          >
            {prompt}
          </Text>
          <View className="flex-row items-center mt-3">
            <Text style={{ fontFamily: 'DMSans_500Medium', color: colors.text }} className="text-sm">
              Use this prompt →
            </Text>
          </View>
        </AnimatedPressable>
      ))}
    </ScrollView>
  );
}

export default function PromptsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | null>(null);

  const handleClose = () => {
    router.back();
  };

  const handleSelectPrompt = (prompt: string) => {
    router.replace({
      pathname: '/new-entry',
      params: { prompt },
    });
  };

  const handleRandomPrompt = () => {
    const { prompt } = getRandomPrompt();
    router.replace({
      pathname: '/new-entry',
      params: { prompt },
    });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#FAF8F5' }}>
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        {/* Header */}
        <Animated.View
          entering={FadeIn.delay(50)}
          className="flex-row items-center justify-between px-6 py-4"
        >
          <Pressable
            onPress={handleClose}
            className="w-10 h-10 rounded-full bg-stone-100 items-center justify-center"
          >
            <X size={20} color="#78716C" strokeWidth={2} />
          </Pressable>
          <Text style={{ fontFamily: 'DMSans_500Medium' }} className="text-stone-500">
            Prompts
          </Text>
          <View className="w-10" />
        </Animated.View>

        <View className="flex-1 px-6">
          {!selectedCategory ? (
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 32 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Intro */}
              <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-6">
                <Text
                  style={{ fontFamily: 'CormorantGaramond_600SemiBold' }}
                  className="text-2xl text-stone-800 mb-2"
                >
                  Not sure where to start?
                </Text>
                <Text style={{ fontFamily: 'DMSans_400Regular' }} className="text-stone-500">
                  Pick a category or let us surprise you with a random prompt.
                </Text>
              </Animated.View>

              {/* Random Prompt Button */}
              <AnimatedPressable
                entering={FadeInDown.delay(100).springify()}
                onPress={handleRandomPrompt}
                className="mb-6"
              >
                <LinearGradient
                  colors={['#2D2A26', '#4A4540'] as [string, string]}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderRadius: 16,
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-3">
                    <Shuffle size={20} color="white" strokeWidth={2} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ fontFamily: 'DMSans_600SemiBold' }} className="text-white text-base">
                      Surprise me
                    </Text>
                    <Text style={{ fontFamily: 'DMSans_400Regular' }} className="text-white/60 text-xs">
                      Get a random prompt
                    </Text>
                  </View>
                  <ChevronRight size={20} color="white" />
                </LinearGradient>
              </AnimatedPressable>

              {/* Categories */}
              <Animated.Text
                entering={FadeInDown.delay(100).springify()}
                style={{ fontFamily: 'DMSans_600SemiBold' }}
                className="text-stone-400 text-xs uppercase tracking-wider mb-3"
              >
                Categories
              </Animated.Text>

              {promptCategories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                  onPress={() => setSelectedCategory(category)}
                />
              ))}
            </ScrollView>
          ) : (
            <PromptList
              category={selectedCategory}
              onSelectPrompt={handleSelectPrompt}
              onBack={() => setSelectedCategory(null)}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
