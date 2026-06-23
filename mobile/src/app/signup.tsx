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

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const showPasswordRules = password.length > 0;

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Missing Info", "Please fill all fields.");
      return;
    }

    if (!hasMinLength || !hasNumber || !hasUppercase || !hasSpecialChar) {
      Alert.alert("Weak Password", "Please complete all password rules.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Error", "Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.user_id) {
        Alert.alert("Success", "Account created successfully");
        router.replace("/login");
      } else {
        Alert.alert("Error", data.error || "Signup failed");
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
              <Ionicons name="restaurant-outline" size={32} color="#075B34" />
              <Text style={styles.logoText}>
                Sizz<Text style={styles.logoOrange}>lo</Text>
              </Text>
            </View>

            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>
              Join millions of home chefs{"\n"}cooking smarter with AI
            </Text>

            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={22} color="#075B34" />
              <View style={styles.inputTextWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#8C8C8C"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={22} color="#075B34" />
              <View style={styles.inputTextWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  placeholderTextColor="#8C8C8C"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={22} color="#075B34" />
              <View style={styles.inputTextWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor="#8C8C8C"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={21}
                  color="#9A9A9A"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={22} color="#075B34" />
              <View style={styles.inputTextWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#8C8C8C"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
              </View>
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={21}
                  color="#9A9A9A"
                />
              </TouchableOpacity>
            </View>

            {showPasswordRules && (
              <View style={styles.passwordBox}>
                <Text style={styles.passwordTitle}>Password must contain:</Text>

                <View style={styles.rulesGrid}>
                  <Rule text="At least 8 characters" active={hasMinLength} />
                  <Rule text="One number" active={hasNumber} />
                  <Rule text="One uppercase letter" active={hasUppercase} />
                  <Rule text="One special character" active={hasSpecialChar} />
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.createButton} onPress={handleSignup}>
              <Text style={styles.createButtonText}>Create Account</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>or sign up with</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="google" size={23} color="#DB4437" />
              <Text style={styles.socialText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="apple" size={25} color="#000" />
              <Text style={styles.socialText}>Continue with Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="facebook" size={25} color="#1877F2" />
              <Text style={styles.socialText}>Continue with Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.bottomText}>
                Already have an account?{" "}
                <Text style={styles.loginText}>Login</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

function Rule({ text, active }: { text: string; active: boolean }) {
  return (
    <View style={styles.ruleItem}>
      <View style={[styles.ruleIcon, active && styles.ruleIconActive]}>
        {active && <Ionicons name="checkmark" size={13} color="#fff" />}
      </View>
      <Text style={[styles.ruleText, active && styles.ruleTextActive]}>
        {text}
      </Text>
    </View>
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
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 12,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logoText: {
    fontSize: 30,
    fontWeight: "800",
    color: "#075B34",
    marginLeft: 8,
    letterSpacing: -1,
  },
  logoOrange: {
    color: "#F46B08",
  },
  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#075B34",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: "#4B5563",
    fontWeight: "500",
    marginBottom: 18,
  },
  inputBox: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inputTextWrap: {
    flex: 1,
    marginLeft: 16,
  },
  input: {
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
    padding: 0,
  },
  passwordBox: {
    borderRadius: 16,
    backgroundColor: "rgba(235,244,235,0.86)",
    padding: 12,
    marginTop: 2,
    marginBottom: 14,
  },
  passwordTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#111",
    marginBottom: 10,
  },
  rulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
  },
  ruleItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
  },
  ruleIcon: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 7,
  },
  ruleIconActive: {
    backgroundColor: "#5FA66F",
  },
  ruleText: {
    fontSize: 12.2,
    color: "#777",
    fontWeight: "500",
  },
  ruleTextActive: {
    color: "#111",
  },
  createButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#006B3C",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  createButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "800",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#D9D9D9",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500",
  },
  socialButton: {
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.96)",
    marginBottom: 9,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  socialText: {
    width: 210,
    marginLeft: 16,
    fontSize: 15,
    color: "#111",
    fontWeight: "600",
  },
  bottomText: {
    textAlign: "center",
    marginTop: 4,
    fontSize: 14,
    color: "#30343B",
    fontWeight: "500",
  },
  loginText: {
    color: "#075B34",
    fontWeight: "800",
  },
});