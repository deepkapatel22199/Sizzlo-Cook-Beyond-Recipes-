import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Onboarding3() {
  return (
    <ImageBackground
      source={require('../../assets/images/Onboarding3bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.content}>
        <Text style={styles.step}>3 / 3</Text>

        <Text style={styles.title}>
          <Text style={styles.green}>Cook hands-free</Text>
          {'\n'}with your voice
        </Text>

        <Text style={styles.subtitle}>
          Our touchless voice cooking guides you step-by-step, so you can focus
          on cooking delicious meals.
        </Text>

        <View style={styles.middleSection}>
          <View style={styles.featuresList}>
            <Feature icon="mic-outline" title="Voice Guided" sub="Step-by-step voice instructions" />
            <Feature icon="play-forward-outline" title="Easy Commands" sub={`Next, repeat,\nprevious, pause & more`}/>
            <Feature icon="timer-outline" title="Set Timers" sub={`Set timers with your \nvoice while cooking`} />
            <Feature icon="restaurant-outline" title="Stay Focused" sub={`No touching screen, \njust enjoy cooking`}/>
          </View>

          <View style={styles.stepBubble}>
            <Text style={styles.stepBubbleTitle}>Step 4 of 8</Text>
            <Text style={styles.stepBubbleText}>
              Add the vegetables and stir for 2 minutes.
            </Text>
          </View>
        </View>

        <View style={styles.voiceSection}>
          <View style={styles.commandTop}>
            <Text style={styles.commandChip}>“Next Step”</Text>
            <Text style={styles.commandChip}>“Set timer 5 minutes”</Text>
          </View>

          <View style={styles.micRow}>
            <View style={styles.waveLine} />
            <View style={styles.micOuter}>
              <View style={styles.micInner}>
                <Ionicons name="mic" size={42} color="#0A8A43" />
              </View>
            </View>
            <View style={styles.waveLine} />
          </View>

          <View style={styles.commandBottom}>
            <Text style={[styles.commandChip, styles.repeatChip]}>“Repeat”</Text>
            <Text style={[styles.commandChip, styles.previousChip]}>
              “Previous Step”
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>

        <View style={styles.bottomDots}>
          <TouchableOpacity
            onPress={() => router.replace('/onboarding1')}
            style={styles.dot}
          />
          <TouchableOpacity
            onPress={() => router.replace('/onboarding2')}
            style={styles.dot}
          />
          <TouchableOpacity
            onPress={() => router.replace('/onboarding3')}
            style={[styles.dot, styles.activeDot]}
          />
        </View>
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
    <View style={styles.featureRow}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={26} color="#0A8A43" />
      </View>

      <View style={styles.featureTextBox}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSub}>{sub}</Text>
      </View>
    </View>
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
    alignSelf: 'flex-start',
    backgroundColor: '#E8F4EA',
    color: '#166534',
    fontSize: 18,
    fontWeight: '800',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
  },

  title: {
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '800',
    marginTop: 28,
    color: '#111111',
  },

  green: {
    color: '#0A8A43',
  },

  subtitle: {
    fontSize: 17,
    marginTop: 16,
    color: '#4B5563',
    lineHeight: 28,
    fontWeight: '500',
  },

  middleSection: {
    marginTop: 40,
    minHeight: 300,
  },

  featuresList: {
    width: '50%',
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  featureTextBox: {
    flex: 1,
  },

  featureTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111111',
  },

  featureSub: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: '#4B5563',
    fontWeight: '500',
  },

  stepBubble: {
    position: 'absolute',
    right: 0,
    top: 10,
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
  },

  stepBubbleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0A8A43',
    marginBottom: 8,
  },

  stepBubbleText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#111111',
    fontWeight: '600',
  },

  voiceSection: {
    marginTop: 'auto',
    marginBottom: 24,
  },

  commandTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  commandBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  commandChip: {
    backgroundColor: '#E8F4EA',
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginHorizontal:6,
  },

  repeatChip: {
    backgroundColor: '#FDEAE6',
    color: '#D45A45',
  },

  previousChip: {
    backgroundColor: '#F0E8FA',
    color: '#7A4BB3',
  },

  micRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  waveLine: {
    flex: 1,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#D9E8DC',
  },

  micOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(10, 138, 67, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
  },

  micInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#0A8A43',
    alignItems: 'center',
    justifyContent: 'center',
  },

  getStartedButton: {
    height: 62,
    borderRadius: 18,
    backgroundColor: '#0A8A43',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },

  getStartedText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  bottomDots: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginBottom: 36,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D5E6D5',
    marginHorizontal: 6,
  },

  activeDot: {
    backgroundColor: '#0A8A43',
    width: 24,
  },
});