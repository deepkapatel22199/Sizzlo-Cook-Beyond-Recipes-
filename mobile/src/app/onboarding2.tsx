import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Onboarding2() {
  return (
    <ImageBackground
      source={require('../../assets/images/Onboarding2bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.content}>
        <Text style={styles.step}>2 / 3</Text>

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

      <View style={styles.cardsRow}>
        <Feature icon="sparkles" title="Personalized" sub="Recipes" />
        <Feature icon="shield-checkmark-outline" title="Healthier" sub="Choices" />
        <Feature icon="nutrition-outline" title="Balanced" sub="Nutrition" />
        <Feature icon="trending-up-outline" title="Track Your" sub="Progress" />
      </View>

      <View style={styles.bottomRow}>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.dots}>
          <TouchableOpacity onPress={() => router.replace('/onboarding1')} style={styles.dot} />
          <TouchableOpacity onPress={() => router.replace('/onboarding2')}style={[styles.dot, styles.activeDot]} />
          <TouchableOpacity onPress={() => router.replace('/onboarding3')}style={styles.dot} />
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push('/onboarding3')}
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
    <View style={styles.card}>
      <Ionicons name={icon} size={28} color="#0F7A3A" />
      <Text style={styles.cardText}>{title}{'\n'}{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  content: {
    flex:1,
    paddingTop: 80,
    paddingHorizontal: 24,
  },


  step: {
    fontSize: 18,
    fontWeight: '700',
    color: '#166534',
  },

  title: {
    fontSize: 38,
    fontWeight: '800',
    marginTop:20,
    color: '#111111',
  },

  green: {
    color: '#0F7A3A',
  },

  subtitle: {
    marginTop: 16,
    fontSize: 18,
    lineHeight: 28,
    color: '#4B5563',
    fontWeight: '500',
  },

  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: 28,
    paddingHorizontal:10,
  },

  card: {
    width: '23%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  cardText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
  },

  bottomRow: {
    marginBottom:40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal:20,
  },

  skip: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },

  dots: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CFCFCF',
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: '#0A8A43',
    width: 24,
  },

  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0A8A43',
    alignItems: 'center',
    justifyContent: 'center',
  },
});