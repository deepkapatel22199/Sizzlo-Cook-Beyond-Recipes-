import { useEffect } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/sizzlo-splash.png')}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});