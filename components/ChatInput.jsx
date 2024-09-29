import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { storage } from '../firebaseClient';
import firebase from 'firebase/app';
import CustomText from './CustomText';

const ChatInput = ({ handleSendMsg, image, setImage }) => {
    const { colors } = useTheme();
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const onSend = () => {
        if (msg.length > 0 || image) {
            handleSendMsg(msg, image);
            setMsg('');
            setImage('');
        }
    };

    const handleFileUpload = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permission to access camera roll is required!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const selectedFile = result.assets[0];
            const uri = selectedFile.uri;
            setLoading(true);

            const response = await fetch(uri);
            const blob = await response.blob();

            const storageRef = storage.ref(`uploads/${selectedFile.fileName}`);
            const uploadTask = storageRef.put(blob);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    console.error("Error uploading file:", error);
                    setLoading(false);
                },
                () => {
                    uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                        setImage(downloadURL);
                        setLoading(false);
                    });
                }
            );
        } else {
            Alert.alert("No file selected");
        }
    };

    const handleRemoveImage = () => {
        if (image) {
            setLoading(true);
            const fileRef = storage.refFromURL(image);
            fileRef.delete()
                .then(() => {
                    console.log("Image deleted successfully from Firebase");
                    setImage('');
                })
                .catch((error) => {
                    console.error("Error deleting the image:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            Alert.alert("No image to delete");
        }
    };

    return (
        <View className="relative mb-4">
            <View className={`absolute bottom-0 left-0 right-0 rounded-3xl p-2 mb-2 shadow-lg mx-2`} style={{ backgroundColor: colors.secondary }}>
                {image ? (
                    <View className="flexitems-center mb-2 pt-2 items-center">
                        <Image source={{ uri: image }} className="w-52 h-52 rounded-md mr-2" />
                        <View className=" items-center flex-row mt-5 gap-x-2">
                            <TouchableOpacity
                                onPress={handleRemoveImage}
                                className="mr-1 flex-1 rounded-3xl px-4 py-3 bg-red-500"

                            >
                                <CustomText className="text-white">Remove</CustomText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={onSend}
                                className="mr-1 flex-1 rounded-3xl px-4 py-3"
                                style={{ backgroundColor: colors.primary }}
                            >
                                <CustomText className="text-white">Send</CustomText>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) :

                    loading ? (
                        <View className="my-5">
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>

                    ) : (
                        <View className="flex-row items-center">
                            <TextInput
                                value={msg}
                                onChangeText={(value) => setMsg(value)}
                                placeholder="Type a message..."
                                placeholderTextColor={colors.text}
                                multiline={true}
                                maxLength={500}
                                className="flex-1 bg-transparent max-h-36 min-h-12 p-2 rounded-3xl"
                                style={{ color: colors.text }}
                            />

                            <TouchableOpacity
                                onPress={onSend}
                                className="mr-1 rounded-3xl px-4 py-3"
                                style={{ backgroundColor: colors.primary }}
                            >
                                <Ionicons name="send" size={15} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleFileUpload}
                                className="rounded-3xl px-2"
                            >






                                <MaterialIcons name="add-circle-outline" size={30} color={colors.primary} />

                            </TouchableOpacity>

                        </View>
                    )
                }
            </View>
        </View>
    );
};

export default ChatInput;
