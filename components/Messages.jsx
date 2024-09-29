import { View, ScrollView, ActivityIndicator, Image, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import CustomText from './CustomText';
import { useTheme } from '@react-navigation/native';
import ImageViewer from 'react-native-image-zoom-viewer';
import axios from 'axios';
import { deleteMessageRoute } from '../app/api/APIroutes';
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import { storage } from '../firebaseClient'; // Import Firebase storage

const Messages = ({ messages, loading, setMessages, socket, currentUser, contactId }) => {
    const { colors } = useTheme();
    const scrollViewRef = useRef(null);
    const [visible, setVisible] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [messageMenu, setMessageMenu] = useState(false)

    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const openImageViewer = (index) => {
        const imageIndex = images.findIndex(img => img.url === messages[index].image);
        setCurrentImageIndex(imageIndex);
        setVisible(true);
    };

    const closeImageViewer = () => {
        setVisible(false);
        setCurrentImageIndex(0)
    };

    const images = messages
        .filter(message => message.image)
        .map(message => ({
            url: message.image,
        }));

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


                setMessages((prevMessages) => {
                    const updatedMessages = prevMessages.filter((message) => {
                        return (message.id && message.id !== messageIdToDelete) ||
                            (message.messageId && message.messageId !== messageIdToDelete);
                    });

                    return updatedMessages;
                });


                socket.current.emit("delete-msg", {
                    to: contactId,
                    from: currentUser,
                    messageId: messageIdToDelete,
                });

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
                contentContainerStyle={{ padding: 16, paddingBottom: 100, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                ) : messages.length === 0 ? (
                    <View style={{ alignItems: 'center', marginTop: 20 }}>
                        <CustomText style={{ color: colors.text }}>No Messages yet</CustomText>
                    </View>
                ) : (
                    messages.map((message, index) => (
                        <Pressable
                            key={index}
                            style={{
                                alignSelf: message.fromSelf ? 'flex-end' : 'flex-start',
                                backgroundColor: message.fromSelf ? colors.primary : colors.secondary,
                                padding: !message.message && message.image ? 5 : 12
                            }}
                            className="rounded-3xl max-w-[75%] my-1"
                            onLongPress={() => {
                                setSelectedMessage(message);
                                setMessageMenu(true);
                            }}
                        >
                            {message.image && (
                                <TouchableOpacity onPress={() => openImageViewer(index)} onLongPress={() => {
                                    setSelectedMessage(message);
                                    setMessageMenu(true);
                                }}>
                                    <Image
                                        source={{ uri: message.image }}
                                        className="rounded-2xl w-60 h-60"
                                        style={{
                                            marginBottom: message.message ? 10 : 0
                                        }}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            )}
                            {message.message !== "" && (
                                <CustomText style={{ color: message.fromSelf ? "" : colors.text }} className="text-[15px]">
                                    {message.message}
                                </CustomText>
                            )}
                        </Pressable>
                    ))
                )}
            </ScrollView>
            <Modal visible={visible} transparent={true} onRequestClose={closeImageViewer}>
                <ImageViewer
                    imageUrls={images}
                    index={currentImageIndex}
                    onClick={closeImageViewer}
                />
            </Modal>
            <Modal
                visible={messageMenu}
                transparent={true}
                onRequestClose={() => setMessageMenu(false)}
                animationType='slide'
            >
                <View className="flex-1 justify-end pb-10" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}>
                    <View className="bg-white rounded-3xl p-4 shadow-lg mx-4 space-y-5">
                        {selectedMessage?.fromSelf && (
                            <Pressable
                                onPress={handleDeleteMessage}
                                className="py-2">
                                <View className="flex-row justify-center items-center gap-x-2">
                                    <CustomText className="text-red-500 text-xl">Unsend</CustomText>
                                </View>
                            </Pressable>
                        )}
                        {!selectedMessage?.fromSelf && (
                            <View>
                                <CustomText>Dusro ka maal nhi dekhte</CustomText>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default Messages;
