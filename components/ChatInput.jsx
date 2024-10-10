import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, Modal, FlatList, Keyboard, } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import CustomText from './CustomText';
import { storage } from '../firebaseClient';
import firebase from 'firebase/app';
import { KeyboardAvoidingView } from 'react-native';

const TENOR_API_KEY = 'AIzaSyC3txr-QN-LDQUssfIQSIKQLIou69HkSzM';

const ChatInput = ({
    handleSendMsg,
    image,
    setImage,
    selectedGif,
    setSelectedGif
}) => {
    const { colors } = useTheme();
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [gifModalVisible, setGifModalVisible] = useState(false);
    const [gifs, setGifs] = useState([]);
    const [flatListHeight, setFlatListHeight] = useState(true);
    const [loadGif, setLoadGif] = useState(null)

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setFlatListHeight(false);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setFlatListHeight(true);
        });

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);



    const onSend = () => {
        if (msg.length > 0 || image || selectedGif) {
            handleSendMsg(msg, image, selectedGif);
            setMsg('');
            setImage('');
            setSelectedGif('');
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
            allowsEditing: false,
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
        }
    };

    const handleGifSearch = async (query) => {
        try {
            const response = await axios.get(`https://tenor.googleapis.com/v2/search?q=${query || "funny"}&key=${TENOR_API_KEY}&limit=12`);

            setGifs(response.data.results);
            setLoadGif(response.data.next);
            setGifModalVisible(true);
        } catch (error) {
            console.error('Error fetching GIFs:', error);
        }
    };

    const handleLoadMore = async () => {
        if (!loadGif) return;

        try {
            const response = await axios.get(`https://tenor.googleapis.com/v2/search?q=${searchQuery || "funny"}&key=${TENOR_API_KEY}&limit=10&pos=${loadGif}`);

            setGifs((prevGifs) => [...prevGifs, ...response.data.results]);
            setLoadGif(response.data.next);
        } catch (error) {
            console.error('Error fetching more GIFs:', error);
        }
    };

    const handleRemoveImage = () => {
        if (image) {
            setLoading(true);
            const fileRef = storage.refFromURL(image);
            fileRef.delete()
                .then(() => {
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

    const renderGifItem = ({ item }) => (
        <TouchableOpacity onPress={() => {
            setSelectedGif(item.media_formats.gif.url);
            setGifModalVisible(false);
        }}>
            <View style={{ width: 180, height: 180, margin: 5, borderRadius: 10, overflow: 'hidden' }}>
                <Image
                    source={{ uri: item.media_formats.gif.url }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                />
            </View>
        </TouchableOpacity>
    );


    return (
        <View className="relative mb-4">
            <View className={`absolute bottom-0 left-0 right-0 rounded-3xl p-2 mb-2 shadow-lg mx-2`} style={{ backgroundColor: colors.secondary }}>
                {image ? (
                    <View className="mb-2 justify-center pt-2 px-2">
                        <Image source={{ uri: image }} className="w-full h-96 rounded-xl mr-2 " style={{ objectFit: "contain", backgroundColor: colors.background }} />
                        <View className="items-center flex-row mt-5 gap-x-2">
                            <TouchableOpacity
                                onPress={() => {
                                    setImage('');
                                    handleRemoveImage();
                                }}
                                className="mr-1 flex-1 rounded-3xl px-4 py-3 bg-red-500"
                            >
                                <CustomText className="text-white text-center">Remove</CustomText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={onSend}
                                className="mr-1 flex-1 rounded-3xl px-4 py-3"
                                style={{ backgroundColor: colors.primary }}
                            >
                                <CustomText className="text-white text-center">Send</CustomText>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : loading ? (
                    <View className="my-5">
                        <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                ) : selectedGif ? (
                    <View className="mb-2 justify-center pt-2 px-2 " >
                        <View style={{ overflow: 'hidden' }} className="w-full h-96 rounded-3xl">
                            <Image source={{ uri: selectedGif }} className="w-[100%]  h-[100%] rounded-3xl mr-2 " />
                        </View>
                        <View className="items-center flex-row mt-5 gap-x-2">
                            <TouchableOpacity
                                onPress={() => setSelectedGif('')}
                                className="mr-1 flex-1 rounded-3xl px-4 py-3 bg-red-500"
                            >
                                <CustomText className="text-white text-center">Remove GIF</CustomText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={onSend}
                                className="mr-1 flex-1 rounded-3xl px-4 py-3"
                                style={{ backgroundColor: colors.primary }}
                            >
                                <CustomText className="text-white text-center">Send GIF</CustomText>
                            </TouchableOpacity>
                        </View>
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
                        {msg.length > 0 && (
                            <TouchableOpacity
                                onPress={onSend}
                                className="mr-1 rounded-3xl px-4 py-3"
                                style={{ backgroundColor: colors.primary }}
                            >
                                <Ionicons name="send" size={15} color="white" />
                            </TouchableOpacity>
                        )}
                        {msg.length === 0 && (
                            <View className="flex-row">
                                <TouchableOpacity onPress={handleFileUpload} className="rounded-3xl px-2">
                                    <MaterialIcons name="add-circle-outline" size={30} color={colors.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleGifSearch('funny')} className="rounded-3xl px-2">
                                    <MaterialIcons name="gif" size={30} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </View>
            <Modal
                visible={gifModalVisible}
                animationType="slide"
                onRequestClose={() => {
                    setGifModalVisible(false);
                    setLoadGif(12);
                }}
                transparent={true}
            >
                <View className={`flex-1 ${flatListHeight ? "justify-end" : "justify-normal"}`}>

                    <View style={{ backgroundColor: colors.secondary }} className="rounded-t-3xl py-3 items-center">
                        <TextInput
                            value={searchQuery}
                            onChangeText={(text) => {
                                setSearchQuery(text);
                                handleGifSearch(text);
                            }}
                            placeholder="Search for GIFs..."
                            placeholderTextColor={colors.text}
                            className="p-4 rounded-lg mx-2 mb-4 mt-4 text-text w-96"
                            style={{ backgroundColor: colors.background, color: colors.text }}
                        />
                        <FlatList
                            data={gifs}
                            renderItem={renderGifItem}
                            numColumns={2}
                            keyExtractor={(item, index) => index.toString()}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.5}
                            style={{ maxHeight: 400 }}
                            ListFooterComponent={() => (
                                <View className="my-2">
                                    <ActivityIndicator size="small" color={colors.primary} />
                                </View>
                            )}
                        />
                    </View>

                </View>
            </Modal>
        </View>
    );
};

export default ChatInput;
