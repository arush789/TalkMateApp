import { View } from "react-native";
import React from "react";
import { Layout, Text } from "@ui-kitten/components";
import { Stack } from "expo-router";

const Home = () => {
  return (

    <View className=" flex-1 px-5">

      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerStyle: { height: 50 },
        }}
      />
      <Text category='h1' >HOME</Text>
    </View>

  );
};

export default Home;
