import React, { useEffect, useState } from "react";
import Toast from 'react-native-toast-message';
import axios from "axios";
import { setAvatarRoute } from "../api/APIroutes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, TouchableOpacity, View, Image, ScrollView } from "react-native";
import { Stack } from "expo-router";
import CustomText from "../../components/CustomText";
import { useTheme } from "@react-navigation/native";
import base64 from 'base-64'; // Import Base64 npm package

const Avatar = () => {
    const [avatars, setAvatars] = useState([]);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [loading, setLoading] = useState(true);
    const api = "https://api.dicebear.com/6.x/lorelei/png";

    const toastOptions = {
        position: 'bottom',
        autoHide: true,
        visibilityTime: 5000,
    };

    const { colors } = useTheme();

    useEffect(() => {
        const checkUser = async () => {
            const storedUser = await AsyncStorage.getItem("chat-app-user");
            if (!storedUser) {
                router.push("/(auth)/Login");
            }
        };
        checkUser();
    }, []);

    const setProfilePicture = async () => {
        if (selectedAvatar === null) {
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: 'Please select an avatar.',
                ...toastOptions,
            });
        } else {
            const user = JSON.parse(await AsyncStorage.getItem("chat-app-user"));
            const selectedImageUrl = avatars[selectedAvatar];

            try {

                const response = await axios.get(selectedImageUrl, { responseType: 'arraybuffer' });

                const image64 = response?.request?._response

                const { data } = await axios.post(`${setAvatarRoute}/${user._id}`, {
                    image: image64,
                });

                if (data.isSet) {
                    user.isAvatarImageSet = true;
                    user.avatarImage = data.image;
                    await AsyncStorage.setItem("chat-app-user", JSON.stringify(user));
                    router.replace("/(tabs)/Home");
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Validation Error',
                        text2: 'Error setting an avatar.',
                        ...toastOptions,
                    });
                }
            } catch (error) {
                Toast.show({
                    type: 'error',
                    text1: 'Validation Error',
                    text2: 'Error setting an avatar.',
                    ...toastOptions,
                });
            }
        }
    };

    const fetchAvatars = async () => {
        const avatarData = [];
        try {
            for (let i = 0; i < 6; i++) {
                const avatarUrl = `${api}?seed=${Math.round(Math.random() * 10000)}`;
                avatarData.push(avatarUrl);
            }
            setAvatars(avatarData);
        } catch (error) {
            console.error('Error fetching avatars:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {

        fetchAvatars();
    }, []);

    return (
        <View className="flex-1 items-center justify-center min-h-screen" style={{
            backgroundColor: colors.background
        }}>
            <Stack.Screen
                options={{
                    headerShown: false
                }}
            />
            <CustomText className="text-3xl font-bold" style={{ color: colors.text }}>Pick Your Avatar</CustomText>
            {loading ? (
                <CustomText className="text-xl" style={{ color: colors.text }}>Loading avatars...</CustomText>
            ) : (
                <View className="my-4 flex-wrap flex-row justify-center">
                    {avatars.map((avatar, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setSelectedAvatar(index)}
                            style={{
                                margin: 10,
                                borderWidth: 2,
                                borderColor: selectedAvatar === index ? colors.primary : "white",
                                borderRadius: 48,
                            }}
                        >
                            <Image
                                source={{ uri: avatar }}
                                style={{ width: 100, height: 96, borderRadius: 48 }}
                                onError={(error) => console.log("Image loading error", error.nativeEvent.error)}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            )}
            {
                !loading && (
                    <TouchableOpacity
                        className="bg-blue-500 mb-4 text-white p-4 rounded-2xl "
                        onPress={fetchAvatars}
                    >
                        <CustomText className="text-white text-lg">Load more</CustomText>
                    </TouchableOpacity>
                )
            }
            {
                !loading && (
                    <TouchableOpacity
                        className="bg-green-500 text-white p-4 rounded-2xl hover:bg-blue-600"
                        onPress={setProfilePicture}
                    >
                        <CustomText className="text-white text-lg">Confirm Selection</CustomText>
                    </TouchableOpacity>
                )
            }
            <Toast />
        </View>
    );
};

export default Avatar;
