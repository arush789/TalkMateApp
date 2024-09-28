import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { loginRoute } from '../api/APIroutes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';


const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const handleChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const toastOptions = {
        position: 'bottom',
        autoHide: true,
        visibilityTime: 5000,
    };

    const handleValidation = () => {
        const { password, username } = formData;
        if (password === "" || username === "") {
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: 'Username and Password are required.',
                ...toastOptions,
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (handleValidation()) {
            const { password, username } = formData;
            try {
                const { data } = await axios.post(loginRoute, {
                    username,
                    password
                });
                if (data.status === false) {
                    Toast.show({
                        type: 'error',
                        text1: 'Login Error',
                        text2: data.msg,
                        ...toastOptions,
                    });
                } else if (data.status === true) {
                    await AsyncStorage.setItem('chat-app-user', JSON.stringify(data.user));
                    router.replace("/(tabs)/Home");
                }
            } catch (error) {
                Toast.show({
                    type: 'error',
                    text1: 'Network Error',
                    text2: 'Something went wrong, please try again.',
                    ...toastOptions,
                });
            }
        }
    };

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            const user = await AsyncStorage.getItem("chat-app-user");
            if (user) {
                router.replace("/(tabs)/Home");
            }
        };
        checkUserLoggedIn();
    }, []);

    return (
        <View className="flex-1 justify-center items-center bg-gray-100">
            <View className="bg-white p-8 rounded-lg shadow-2xl w-11/12">
                <Text className="text-2xl font-bold mb-6 text-center text-black">Login</Text>

                <TextInput
                    placeholder="Display Name"
                    name="username"
                    onChangeText={(value) => handleChange('username', value)}
                    className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md text-black"
                    minLength={3}
                />

                <TextInput
                    placeholder="Password"
                    name="password"
                    secureTextEntry
                    onChangeText={(value) => handleChange('password', value)}
                    className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-md text-black"
                />

                <TouchableOpacity onPress={handleSubmit} className="w-full bg-blue-500 py-2 rounded-md">
                    <Text className="text-white text-center font-semibold">Sign In</Text>
                </TouchableOpacity>

                <View className="flex justify-center items-center mt-5">
                    <Text className="text-black">
                        Don't have an account?{' '}
                        <Text
                            className="text-blue-500 font-bold"
                            onPress={() => router.replace("/(auth)/Register")}
                        >
                            Register
                        </Text>
                    </Text>
                </View>
            </View>

            <Toast />
        </View>
    );
};

export default Login;
