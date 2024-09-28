import { View } from "react-native";
import React, { useEffect, useState } from "react";
import { Button, Layout, Text } from "@ui-kitten/components";
import { router, Stack } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = () => {

  const handleLogout = () => {
    AsyncStorage.clear()
    router.replace("/(auth)/Login")
  }

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
      <Button
        status='danger'
        onPress={handleLogout}
      >
        LogOut
      </Button>
    </View>

  );
};

export default Home;
