import { Image, Pressable, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Text } from '@ui-kitten/components'
import { router, Stack } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '@react-navigation/native'
import CustomText from '../../components/CustomText'
import { AntDesign, FontAwesome5, MaterialIcons } from '@expo/vector-icons'

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
        <View className=" flex-1 px-5 mb-28 justify-center">
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: "",
                    headerStyle: { height: 50 },
                }}
            />
            {currentUser && (
                <View className="space-y-4 p-4 rounded-3xl  h-full " style={{
                    backgroundColor: colors.tabBarBgColor
                }}>
                    <View className=" justify-center items-center gap-y-4">
                        <View className="border-2  rounded-full " style={{ borderColor: colors.text }}>
                            <Image
                                source={{ uri: `data:image/png;base64,${currentUser.avatarImage}` }}
                                className="w-14 h-14 rounded-full"
                                resizeMode="cover"
                            />
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
                    </View>

                    <View className="space-y-5 ">
                        <Pressable className=" p-5 rounded-3xl  flex-row items-center" style={{ backgroundColor: colors.background }}>
                            <FontAwesome5 name="user-edit" size={24} color={colors.text} />
                            <CustomText className=" text-lg ml-4" style={{ color: colors.text }}>
                                Edit profile
                            </CustomText>
                        </Pressable>
                        <Pressable className="  p-5 rounded-3xl flex-row items-center" style={{ backgroundColor: colors.background }} >
                            <MaterialIcons name="support-agent" size={24} color={colors.text} />
                            <CustomText className=" text-lg ml-4" style={{ color: colors.text }}>
                                Support
                            </CustomText>
                        </Pressable>
                        <Pressable onPress={handleLogout} className="bg-red-500 p-5 rounded-3xl flex-row items-center" >
                            <AntDesign name="login" size={24} color="white" />
                            <CustomText className="text-white text-lg ml-4">
                                Logout
                            </CustomText>
                        </Pressable>
                    </View>

                </View>
            )
            }
        </View >
    )
}

export default Explore