import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const API_URL = "http://10.0.2.2:8000";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Info", "Please enter email and password.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.access_token) {
        Alert.alert("Success", "Login successful");
        router.replace("/");
      } else {
        Alert.alert("Error", data.error || "Login failed");
      }
    } catch {
      Alert.alert("Error", "Cannot connect to server");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/Signupbg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <Ionicons name="restaurant-outline" size={36} color="#075B34" />
              </View>

              <Text style={styles.logoText}>
                Sizz<Text style={styles.logoOrange}>lo</Text>
              </Text>
            </View>

            <View style={styles.headerSection}>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>
                Login to continue your{"\n"}AI cooking journey
              </Text>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={24} color="#075B34" />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#8C8C8C"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputBox}>
                <Ionicons name="lock-closed-outline" size={24} color="#075B34" />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#8C8C8C"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />

                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={23}
                    color="#9A9A9A"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberRow}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                    {rememberMe && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>

                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.line} />
              </View>

              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="google" size={25} color="#DB4437" />
                <Text style={styles.socialText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="apple" size={28} color="#000" />
                <Text style={styles.socialText}>Continue with Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="facebook" size={27} color="#1877F2" />
                <Text style={styles.socialText}>Continue with Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/")}>
                <Text style={styles.bottomText}>
                  Don’t have an account?{" "}
                  <Text style={styles.signupText}>Sign up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#FFFDF8",
  },

  safeArea: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 18,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 34,
  },

  logoIcon: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  logoText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#075B34",
    marginLeft: 8,
    letterSpacing: -1,
  },

  logoOrange: {
    color: "#F46B08",
  },

  headerSection: {
    marginBottom: 30,
  },

  title: {
    fontSize: 31,
    fontWeight: "800",
    color: "#075B34",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 19,
    lineHeight: 27,
    color: "#4B5563",
    fontWeight: "500",
  },

  formSection: {
    width: "100%",
  },

  inputBox: {
    height: 62,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.93)",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  input: {
    flex: 1,
    marginLeft: 15,
    fontSize: 17,
    color: "#222",
    fontWeight: "500",
  },

  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 22,
  },

  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  checkboxActive: {
    backgroundColor: "#075B34",
    borderColor: "#075B34",
  },

  rememberText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#202124",
    fontWeight: "600",
  },

  forgotText: {
    fontSize: 15,
    color: "#075B34",
    fontWeight: "700",
  },

  loginButton: {
    height: 62,
    borderRadius: 20,
    backgroundColor: "#006B3C",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 26,
  },

  loginButtonText: {
    fontSize: 21,
    color: "#fff",
    fontWeight: "800",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#D9D9D9",
  },

  dividerText: {
    marginHorizontal: 14,
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },

  socialButton: {
    height: 58,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.96)",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  socialText: {
    width: 220,
    marginLeft: 18,
    fontSize: 16,
    color: "#111",
    fontWeight: "600",
  },

  bottomText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 15,
    color: "#30343B",
    fontWeight: "500",
  },

  signupText: {
    color: "#075B34",
    fontWeight: "800",
  },
});