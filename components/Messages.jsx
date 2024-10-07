import { View, ScrollView, ActivityIndicator, Image, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import CustomText from './CustomText';
import { useTheme } from '@react-navigation/native';
import ImageViewer from 'react-native-image-zoom-viewer';
import axios from 'axios';
import { deleteMessageRoute } from '../app/api/APIroutes';
import socket from '../socket';

const Messages = ({ messages, loading, setMessages, currentUser, contactId }) => {
    const { colors } = useTheme();
    const scrollViewRef = useRef(null);
    const [visible, setVisible] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [messageMenu, setMessageMenu] = useState(false);

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


    const images = messages
        .filter((message) => message.image)
        .map((message, index) => ({
            url: message.image,
            index: index
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
                    messages.map((message, index) => {
                        const isoTime = message.time;
                        const date = new Date(isoTime);

                        const options = {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true,
                        };

                        const MessageTime = date.toLocaleString('en-US', options);
                        return (

                            <Pressable
                                key={index}
                                style={{
                                    alignSelf: message.fromSelf ? 'flex-end' : 'flex-start',
                                    backgroundColor: message.fromSelf ? colors.primary : colors.secondary,
                                    padding: !message.message && message.image ? 5 : 12,
                                    borderRadius: 20,
                                    maxWidth: '75%',
                                    marginVertical: 4,
                                }}
                                onLongPress={() => {
                                    setSelectedMessage(message);
                                    setMessageMenu(true);
                                }}
                            >
                                {message.image && (
                                    <TouchableOpacity
                                        onPress={() => openImageViewer(images.find(img => img.url === message.image).index)}
                                        onLongPress={() => {
                                            setSelectedMessage(message);
                                            setMessageMenu(true);
                                        }}
                                    >
                                        <Image
                                            source={{ uri: message.image }}
                                            style={{
                                                width: 240,
                                                height: 240,
                                                borderRadius: 15,
                                                marginBottom: message.message ? 10 : 0,
                                            }}
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                )}
                                {message.message && (

                                    <CustomText
                                        style={{
                                            color: message.fromSelf ? 'white' : colors.text,
                                        }}
                                    >
                                        {message.message}
                                    </CustomText>
                                )}

                                {/* <CustomText className="text-gray-500">
                                    {MessageTime}
                                </CustomText> */}
                            </Pressable>

                        )
                    }
                    )
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
