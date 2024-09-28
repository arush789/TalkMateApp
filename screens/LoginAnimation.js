import React from "react";
import { View, StyleSheet, Text } from "react-native";
import LottieView from "lottie-react-native";
import { useTheme } from "@react-navigation/native";
import CustomText from "../components/CustomText";

const LoginAnimation = () => {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: "center" }}>
      <LottieView
        autoPlay
        loop={true}
        style={{
          width: 400,
          height: 380,
        }}
        source={require("../assets/animations/LoginAnimation .json")}
      />
    </View>
  );
};

export default LoginAnimation;
