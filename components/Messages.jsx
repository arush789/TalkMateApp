import { View, ScrollView, ActivityIndicator, Image, TouchableOpacity, Modal, Pressable, Text, Animated } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import CustomText from './CustomText';
import { useTheme } from '@react-navigation/native';
import ImageViewer from 'react-native-image-zoom-viewer';
import axios from 'axios';
import { deleteMessageRoute } from '../app/api/APIroutes';
import socket from '../socket';
import { storage } from '../firebaseClient';

const Messages = ({ messages, loading, setMessages, currentUser, contactId }) => {
    const { colors } = useTheme();
    const scrollViewRef = useRef(null);
    const [visible, setVisible] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [messageMenu, setMessageMenu] = useState(false);
    const [gifStates, setGifStates] = useState({});
    const fallbackImage = require('../assets/images/2019-GifsInEmail.png');


    const toggleGifPlay = (id) => {
        setGifStates((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const openImageViewer = (index) => {
        setCurrentImageIndex(index);
        setVisible(true);
    };

    const closeImageViewer = () => {
        setVisible(false);
        setCurrentImageIndex(0);
    };

    const handleDeleteMessage = async () => {
        if (selectedMessage?.fromSelf) {
            try {
                const messageIdToDelete = selectedMessage?.messageId || selectedMessage?.id;

                if (selectedMessage.image) {
                    const fileRef = storage.refFromURL(selectedMessage.image);
                    await fileRef.delete();
                }

                await axios.post(deleteMessageRoute, {
                    messageId: messageIdToDelete,
                });

                socket.emit("delete-msg", {
                    to: contactId,
                    from: currentUser,
                    messageId: messageIdToDelete,
                });

                setMessages((prevMessages) =>
                    prevMessages.filter(
                        (message) => (message.messageId || message.id) !== messageIdToDelete
                    )
                );

            } catch (error) {
                console.error("Error deleting message:", error);
            } finally {
                setMessageMenu(false);
            }
        }
    };


    return (
        <>
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={{ padding: 12, paddingBottom: 100, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                ) : messages.length === 0 ? (
                    <View style={{ alignItems: 'center', marginTop: 20 }}>
                        <CustomText style={{ color: colors.text }}>No Messages yet</CustomText>
                    </View>
                ) : (
                    messages.map((message, index) => {
                        return (
                            <Pressable
                                key={index}
                                style={{
                                    alignSelf: message.fromSelf ? 'flex-end' : 'flex-start',
                                    backgroundColor: message.fromSelf ? colors.primary : colors.secondary,
                                    padding: !message.message && (message.image || message.gif) ? 5 : 12,
                                }}
                                className="rounded-2xl m-w-[75%] my-1"
                                onLongPress={() => {
                                    setSelectedMessage(message);
                                    setMessageMenu(true);
                                }}
                            >
                                {message.image && (
                                    <TouchableOpacity
                                        onPress={() => openImageViewer(index)}
                                        onLongPress={() => {
                                            setSelectedMessage(message);
                                            setMessageMenu(true);
                                        }}
                                    >
                                        <Image
                                            source={{ uri: message.image }}
                                            style={{
                                                marginBottom: message.message ? 10 : 0,
                                            }}
                                            className="w-52 h-52 rounded-2xl"
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                )}
                                {message.gif && (
                                    <View className="relative">
                                        <TouchableOpacity
                                            onPress={() => openImageViewer(index)}
                                            onLongPress={() => {
                                                setSelectedMessage(message);
                                                setMessageMenu(true);
                                            }}
                                        >
                                            <View style={{ overflow: 'hidden' }} className="w-52 h-52 rounded-xl relative">
                                                {gifStates[message.id] ? (
                                                    <Image
                                                        source={{ uri: message.gif }}
                                                        className="w-[100%] h-[100%]"
                                                        resizeMode="cover"
                                                        onLoad={() => {

                                                            setTimeout(() => {
                                                                setGifStates((prev) => ({
                                                                    ...prev,
                                                                    [message.id]: false,
                                                                }));
                                                            }, 3000);
                                                        }}
                                                    />
                                                ) : (
                                                    <Image
                                                        source={fallbackImage}
                                                        className="w-[100%] h-[100%] opacity-10"
                                                        resizeMode="cover"
                                                    />
                                                )}
                                            </View>
                                            {!gifStates[message.id] && (
                                                <Pressable
                                                    onPress={() => toggleGifPlay(message.id)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        borderRadius: 10,
                                                    }}
                                                >
                                                    <Text style={{ color: 'white' }} className="text-2xl">GIF</Text>
                                                </Pressable>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {message.message && (
                                    <Text
                                        style={{
                                            color: message.fromSelf ? 'white' : colors.text,
                                        }}
                                        className="text-[16px]"
                                    >
                                        {message.message}
                                    </Text>
                                )}
                            </Pressable>
                        );
                    })
                )}
            </ScrollView>

            <Modal visible={visible} transparent={true} onRequestClose={closeImageViewer}>
                <ImageViewer
                    imageUrls={messages.map((message) => ({
                        url: message.image || message.gif,
                    }))}
                    index={currentImageIndex}
                    onClick={closeImageViewer}
                />
            </Modal>

            <Modal
                visible={messageMenu}
                transparent={true}
                onRequestClose={() => setMessageMenu(false)}
                animationType="slide"
            >
                <View className="flex-1 justify-end pb-10" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}>
                    <View className="bg-white rounded-3xl p-4 shadow-lg mx-4 space-y-5">
                        {selectedMessage?.fromSelf && (
                            <Pressable onPress={handleDeleteMessage} className="py-2">
                                <View className="flex-row justify-center items-center gap-x-2">
                                    <CustomText className="text-red-500 text-xl">Unsend</CustomText>
                                </View>
                            </Pressable>
                        )}
                        {!selectedMessage?.fromSelf && (
                            <View>
                                <CustomText>Cannot delete others' messages</CustomText>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default Messages;
