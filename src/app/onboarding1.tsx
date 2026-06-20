import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../../assets/images/Onboarding1bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.content}>
        <Text style={styles.step}>1 / 3</Text>

        <Text style={styles.title}>
          Discover recipes{'\n'}you'll love with AI
        </Text>

        <Text style={styles.subtitle}>
          Get personalized recipe recommendations based on ingredients,
          preferences and your health goals.
        </Text>

        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Text style={styles.cardEmoji}><Ionicons name="sparkles-outline" size={30} color="#0A8A43" /></Text>
            <Text style={styles.cardText}>Smart{'\n'}Suggestions</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardEmoji}><Ionicons name="nutrition-outline" size={30} color="#0A8A43" /></Text>
            <Text style={styles.cardText}>Healthy{'\n'}Choices</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardEmoji}><Ionicons name="time-outline" size={30} color="#0A8A43" /></Text>
            <Text style={styles.cardText}>Save{'\n'}Time</Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <TouchableOpacity onPress={() => router.replace('/')}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>

          <View style={styles.dots}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.arrow}><Ionicons name="arrow-forward" size={28} color="#FFFFFF" /></Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  content: {
    flex: 1,
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
    marginTop: 20,
    color: '#111111',
  },

  subtitle: {
    fontSize: 18,
    marginTop: 16,
    color: '#4B5563',
  },

  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: 28,
  },

  card: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  cardEmoji: {
    fontSize: 28,
  },

  cardText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },

  bottomRow: {
    marginBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  skip: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
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
    justifyContent: 'center',
    alignItems: 'center',
  },

  arrow: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
});