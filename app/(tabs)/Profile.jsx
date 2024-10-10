import { Image, Pressable, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Text } from '@ui-kitten/components'
import { router, Stack } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '@react-navigation/native'
import CustomText from '../../components/CustomText'
import { AntDesign } from '@expo/vector-icons'

const Explore = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const { colors } = useTheme()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem("chat-app-user");
                if (!storedUser) {
                    router.replace("/(auth)/Login");
                } else {
                    const parsedUser = JSON.parse(storedUser);
                    setCurrentUser(parsedUser);
                }
            } catch (error) {
                console.error("Error fetching user from AsyncStorage:", error);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace("/(auth)/Login");
    };


    return (
        <View className=" flex-1 px-5 justify-center ">
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: "",
                    headerStyle: { height: 50 },
                }}
            />
            {currentUser && (
                <View className="space-y-4 p-4 rounded-3xl items-center " style={{
                    backgroundColor: colors.secondary
                }}>
                    <View className=" justify-center items-center ">
                        <View className="border-2 border-white rounded-full ">
                            <Image
                                source={{ uri: `data:image/png;base64,${currentUser.avatarImage}` }}
                                className="w-14 h-14 rounded-full"
                                resizeMode="cover"
                            />
                        </View>
                    </View>
                    <View className="items-center">
                        <CustomText style={{
                            color: colors.text
                        }}
                            className="text-xl">{currentUser.username}
                        </CustomText>
                        <CustomText style={{
                            color: colors.text
                        }}
                            className="text-md">{currentUser.email}
                        </CustomText>
                    </View>

                    <Pressable onPress={handleLogout} className="bg-red-500 p-3 rounded-3xl flex-row items-center" >
                        <AntDesign name="login" size={24} color={colors.text} />
                        <CustomText className="text-white text-lg ml-4">
                            Logout
                        </CustomText>
                    </Pressable>
                </View>
            )
            }
        </View >
    )
}

export default Explore