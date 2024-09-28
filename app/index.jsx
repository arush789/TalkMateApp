import { View } from 'react-native'
import React, { useEffect } from 'react'
import { router } from 'expo-router'
import { Layout, Text } from '@ui-kitten/components'

const Index = () => {

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/(tabs)/Home");
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text category='h1'>Loading...</Text>
    </Layout>
  )
}

export default Index