import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, Pressable, Animated, Easing, ActivityIndicator, Keyboard } from 'react-native';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { loginRoute } from '../api/APIroutes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router, Stack } from 'expo-router';
import { Icon, Input } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import CustomTextHeading from '../../components/CustomTextHeading';
import CustomText from '../../components/CustomText';
import { useTheme } from '@react-navigation/native';
import LoginAnimation from '../../screens/LoginAnimation';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);

    const { colors } = useTheme();

    const loginAnimOpacity = useRef(new Animated.Value(0)).current;
    const loginAnimTranslateY = useRef(new Animated.Value(100)).current;

    const logoAnimTranslateY = useRef(new Animated.Value(100)).current;
    const logoAnimOpacity = useRef(new Animated.Value(0)).current;

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
        if (password === '' || username === '') {
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
        Keyboard.dismiss()
        if (handleValidation()) {
            setLoading(true)
            const { password, username } = formData;
            try {
                const { data } = await axios.post(loginRoute, {
                    username,
                    password,
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
                    router.replace('/(tabs)/Home');
                }
            } catch (error) {
                Toast.show({
                    type: 'error',
                    text1: 'Network Error',
                    text2: 'Something went wrong, please try again.',
                    ...toastOptions,
                });
            } finally {
                setLoading(false)
            }
        }
    };

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            const user = await AsyncStorage.getItem('chat-app-user');
            if (user) {
                router.replace('/(tabs)/Home');
            }
        };
        checkUserLoggedIn();

        Animated.sequence([


            Animated.timing(logoAnimOpacity, {
                toValue: 1,
                duration: 800,
                easing: Easing.ease,
                useNativeDriver: true,
            }),
            Animated.delay(1000),
            Animated.parallel([
                Animated.timing(logoAnimTranslateY, {
                    toValue: -20,
                    duration: 800,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(loginAnimOpacity, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
                Animated.timing(loginAnimTranslateY, {
                    toValue: 0,
                    duration: 800,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    return (
        <View
            className="flex-1 py-10"
            style={{
                backgroundColor: colors.background,
            }}
        >
            <Stack.Screen
                options={{
                    headerShown: false
                }}
            />
            <View className="justify-end items-center h-full">

                <Animated.View
                    style={{
                        transform: [{ translateY: logoAnimTranslateY }],
                        opacity: logoAnimOpacity,
                    }}
                >
                    <LoginAnimation />
                </Animated.View>

                {/* Animated login form */}
                <Animated.View
                    style={{
                        transform: [{ translateY: loginAnimTranslateY }],
                        opacity: loginAnimOpacity,
                        backgroundColor: colors.secondary,
                    }}
                    className="p-8 rounded-3xl shadow-2xl w-11/12"
                >
                    <CustomTextHeading
                        className="text-3xl mb-6 text-center"
                        style={{
                            color: colors.text,
                        }}
                    >
                        Login
                    </CustomTextHeading>
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
                    <TouchableOpacity
                        onPress={handleSubmit}
                        className="w-full py-3 rounded-2xl"
                        style={{
                            backgroundColor: colors.primary,
                        }}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <CustomText className="text-white text-center text-xl">Sign In</CustomText>
                        )}
                    </TouchableOpacity>

                    <View className="flex justify-center items-center mt-5">
                        <CustomText
                            style={{
                                color: colors.text,
                            }}
                            className="text-md"
                        >
                            Don't have an account?{' '}
                            <Link href={"/(auth)/Register"}>
                                <CustomTextHeading
                                    className="text-blue-500 text-lg"

                                >
                                    Register
                                </CustomTextHeading>
                            </Link>
                        </CustomText>
                    </View>
                </Animated.View>
            </View>

            <Toast />
        </View>
    );
};

export default Login;
