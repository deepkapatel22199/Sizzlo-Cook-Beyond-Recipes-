import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Onboarding2() {
  return (
    <ImageBackground
      source={require('../../assets/images/Onboarding2bg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.content}>
        <Text style={styles.badgeText}>2 / 3</Text>

        <Text style={styles.title}>
          <Text style={styles.green}>Personalized nutrition</Text>
          {'\n'}for a healthier you
        </Text>

        <Text style={styles.subtitle}>
          Tell us your preferences and health goals,{'\n'}
          and AI Chef will personalize recipes{'\n'}
          just for you.
        </Text>
      </View>

      <View style={styles.features}>
        <Feature icon="sparkles" title="Personalized" sub="Recipes" />
        <Feature icon="shield-checkmark-outline" title="Healthier" sub="Choices" />
        <Feature icon="nutrition-outline" title="Balanced" sub="Nutrition" />
        <Feature icon="trending-up-outline" title="Track Your" sub="Progress" />
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push('/')}
        >
          <Ionicons name="arrow-forward" size={34} color="#fff" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

function Feature({
  icon,
  title,
  sub,
}: {
  icon: any;
  title: string;
  sub: string;
}) {
  return (
    <View style={styles.featureBox}>
      <Ionicons name={icon} size={28} color="#0F7A3A" />
      <Text style={styles.featureText}>{title}</Text>
      <Text style={styles.featureText}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
  },

  content: {
    paddingTop: 75,
    paddingHorizontal: 30,
  },


  badgeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#166534',
    paddingVertical: 20,
  },

  title: {
    fontSize: 36,
    lineHeight: 45,
    fontWeight: '800',
    color: '#050505',
  },

  green: {
    color: '#0F7A3A',
  },

  subtitle: {
    marginTop: 10,
    fontSize: 18,
    lineHeight: 30,
    color: '#555',
    fontWeight: '500',
  },

  features: {
    position: 'absolute',
    left: 26,
    right: 26,
    bottom: 145,
    height: 115,
    backgroundColor: '#EEF5EA',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  featureBox: {
    alignItems: 'center',
    width: '25%',
  },

  featureText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginTop: 3,
  },

  bottom: {
    position: 'absolute',
    left: 30,
    right: 30,
    bottom: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  skip: {
    fontSize: 20,
    color: '#666',
    fontWeight: '700',
  },

  dots: {
    flexDirection: 'row',
    gap: 14,
  },

  dot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#D5E6D5',
  },

  activeDot: {
    backgroundColor: '#0A8A43',
    width: 24,
  },

  nextButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0F7A3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});