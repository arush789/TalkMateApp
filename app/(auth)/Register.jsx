import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Pressable, Keyboard } from 'react-native';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { registerRoute } from '../api/APIroutes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack } from 'expo-router';
import { Icon, Input } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import CustomTextHeading from '../../components/CustomTextHeading';
import { useTheme } from '@react-navigation/native';
import CustomText from '../../components/CustomText';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);

    const { colors } = useTheme()

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
        Keyboard.dismiss()
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
        <View
            className="flex-1 justify-center items-center "
            style={{
                backgroundColor: colors.background,
            }}
        >
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerStyle: { backgroundColor: colors.background },
                    headerTitle: ""
                }}
            />
            <View
                className="px-8 py-12 rounded-3xl shadow-2xl w-11/12"
                style={{
                    backgroundColor: colors.secondary
                }}
            >
                <CustomTextHeading
                    className="text-3xl mb-6 text-center"
                    style={{
                        color: colors.text,
                    }}
                >Register</CustomTextHeading>

                <Input
                    placeholder="Username"
                    name="username"
                    onChangeText={(value) => handleChange('username', value)}
                    className="w-full p-4 text-lg"
                    rounded="2xl"
                    mb="5"
                    minLength={3}
                    InputLeftElement={
                        <Icon as={<MaterialIcons name="person" />} size={5} ml="5" color="muted.400" />
                    }
                    color={colors.text}
                    backgroundColor={colors.background}
                    borderWidth={0}
                    autoComplete='off'
                />


                <Input
                    placeholder="Email"
                    name="email"
                    rounded="2xl"
                    mb="5"
                    onChangeText={(value) => handleChange('email', value)}
                    className="w-full p-4 text-lg"
                    color={colors.text}
                    backgroundColor={colors.background}
                    borderWidth={0}
                />

                <Input
                    placeholder="Password"
                    name="password"
                    rounded="2xl"
                    mb="5"

                    onChangeText={(value) => handleChange('password', value)}
                    className="w-full p-4 text-lg"
                    type={show ? 'text' : 'password'}
                    InputRightElement={
                        <Pressable onPress={() => setShow(!show)}>
                            <Icon
                                as={<MaterialIcons name={show ? 'visibility' : 'visibility-off'} />}
                                size={5}
                                mr="5"
                                color="muted.400"
                            />
                        </Pressable>
                    }
                    color={colors.text}
                    backgroundColor={colors.background}
                    borderWidth={0}
                />

                <Input
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    rounded="2xl"
                    mb="5"
                    onChangeText={(value) => handleChange('confirmPassword', value)}
                    className="w-full p-4 text-lg"
                    color={colors.text}
                    backgroundColor={colors.background}
                    borderWidth={0}
                />

                <TouchableOpacity onPress={handleSubmit} className="w-full bg-red-500 py-4 rounded-2xl" disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <CustomText className="text-white text-center text-xl">Sign Up</CustomText>
                    )}
                </TouchableOpacity>

            </View>

            <Toast />
        </View>
    );
};

export default Register;
