import { View } from 'react-native';
import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { Layout, Text } from '@ui-kitten/components';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Index = () => {

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await AsyncStorage.getItem('chat-app-user');
        if (user) {
          router.replace("/(tabs)/Home");
        } else {
          router.replace("/(auth)/Login");
        }
      } catch (error) {
        console.log('Error checking AsyncStorage:', error);
        router.replace("/(auth)/Login");
      }
    };
    checkUser();
  }, []);

  return (
    <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text category='h1'>Loading...</Text>
    </Layout>
  );
};

export default Index;
