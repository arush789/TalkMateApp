import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { registerRoute } from '../api/APIroutes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

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
        const { password, confirmPassword, username, email } = formData;
        if (password !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Password Mismatch',
                text2: 'Passwords do not match.',
                ...toastOptions,
            });
            return false;
        } else if (username.length < 3) {
            Toast.show({
                type: 'error',
                text1: 'Username Error',
                text2: 'Username should be greater than 3 characters.',
                ...toastOptions,
            });
            return false;
        } else if (password.length <= 8) {
            Toast.show({
                type: 'error',
                text1: 'Password Error',
                text2: 'Password should be at least 8 characters long.',
                ...toastOptions,
            });
            return false;
        } else if (email === '') {
            Toast.show({
                type: 'error',
                text1: 'Email Error',
                text2: 'Email is required.',
                ...toastOptions,
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (handleValidation()) {
            const { password, username, email } = formData;
            setLoading(true);

            try {
                const { data } = await axios.post(registerRoute, {
                    username,
                    email,
                    password,
                });

                if (data.status === false) {
                    Toast.show({
                        type: 'error',
                        text1: 'Registration Error',
                        text2: data.msg,
                        ...toastOptions,
                    });
                }

                if (data.status === true) {
                    await AsyncStorage.setItem('chat-app-user', JSON.stringify(data.user));
                    router.replace("/(tabs)/Home");
                }
            } catch (error) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Something went wrong. Please try again later.',
                    ...toastOptions,
                });
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            const user = await AsyncStorage.getItem('chat-app-user');
            if (user) {
                router.replace("/(tabs)/Home");
            }
        };
        checkUserLoggedIn();
    }, []);

    return (
        <View className="flex-1 justify-center items-center bg-gray-100">
            <View className="bg-white p-8 rounded-lg shadow-2xl w-11/12">
                <Text className="text-2xl font-bold mb-6 text-center text-black">Register</Text>

                <TextInput
                    placeholder="Username"
                    name="username"
                    onChangeText={(value) => handleChange('username', value)}
                    className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md text-black"
                    minLength={3}
                />

                <TextInput
                    placeholder="Email"
                    name="email"
                    onChangeText={(value) => handleChange('email', value)}
                    className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-md text-black"
                />

                <TextInput
                    placeholder="Password"
                    name="password"
                    secureTextEntry
                    onChangeText={(value) => handleChange('password', value)}
                    className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-md text-black"
                />

                <TextInput
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    secureTextEntry
                    onChangeText={(value) => handleChange('confirmPassword', value)}
                    className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-md text-black"
                />

                <TouchableOpacity onPress={handleSubmit} className="w-full bg-red-400 py-3 rounded-xl" disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-center font-semibold">Sign Up</Text>
                    )}
                </TouchableOpacity>

                <View className="flex justify-center items-center mt-5">
                    <Text className="text-black">
                        Already have an account?{' '}
                        <Text
                            className="text-blue-500 font-bold"
                            onPress={() => router.replace("/(auth)/Login")}
                        >
                            Login
                        </Text>
                    </Text>
                </View>
            </View>

            <Toast />
        </View>
    );
};

export default Register;
