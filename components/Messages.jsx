import { View, ScrollView, ActivityIndicator, Image, TouchableOpacity, Modal, Pressable, Text, Animated, Dimensions } from 'react-native';
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
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const fallbackImage = require('../assets/images/2019-GifsInEmail.png');
    const ref = useRef(null)
    const messageRefs = useRef([])
    const toggleGifPlay = (id) => {
        setGifStates((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const time = new Date(selectedMessage?.time);

    const displayDate = time.toLocaleString('en-GB', {
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'Asia/Kolkata',
        hour12: true
    });
    { displayDate }


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

                setSelectedMessage()

            } catch (error) {
                console.error("Error deleting message:", error);
            } finally {
                setMessageMenu(false);
                setPosition({ x: 0, y: 0 })
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

                        if (!messageRefs.current[index]) {
                            messageRefs.current[index] = React.createRef();
                        }
                        const previousMessage = index > 0 ? messages[index - 1] : null;
                        const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
                        const isFirstFromSelf = message.fromSelf && (!previousMessage || !previousMessage.fromSelf);
                        const isLastFromSelf = message.fromSelf && (!nextMessage || !nextMessage.fromSelf);
                        const isFirstFromOther = !message.fromSelf && (!previousMessage || previousMessage.fromSelf);
                        const isLastFromOther = !message.fromSelf && (!nextMessage || nextMessage.fromSelf);
                        const date = message?.time ? new Date(message.time) : null;
                        const fallbackDate = new Date();

                        let displayDate = (date && !isNaN(date)) ? date : fallbackDate;

                        displayDate = displayDate.toLocaleString('en-GB', {
                            hour: 'numeric',
                            minute: 'numeric',
                            timeZone: 'Asia/Kolkata',
                            hour12: true
                        })



                        return (
                            <Pressable
                                key={index}
                                style={{
                                    alignSelf: message.fromSelf ? 'flex-end' : 'flex-start',
                                    backgroundColor: message.fromSelf ? colors.primary : colors.secondary,
                                    padding: !message.message && (message.image || message.gif) ? 5 : 12,
                                }}

                                className={`m-w-[75%] my-[1px] 
                                    ${message.fromSelf
                                        ? (isFirstFromSelf ? "rounded-l-2xl rounded-tr-2xl" : "")
                                        : (isFirstFromOther ? "rounded-r-2xl rounded-tl-2xl" : "")}
                                    ${message.fromSelf
                                        ? (isLastFromSelf ? "rounded-l-2xl rounded-br-2xl" : "rounded-l-2xl")
                                        : (isLastFromOther ? "rounded-bl-2xl rounded-r-2xl" : "rounded-r-2xl")}
                                    ${selectedMessage && (selectedMessage?.messageId || selectedMessage?.id) !== (message.messageId || message.id) ? "opacity-40" : ""}
                                `}

                                ref={messageRefs.current[index]}
                                onLongPress={() => {
                                    setSelectedMessage(message);
                                    setMessageMenu(true);
                                    messageRefs.current[index].current.measure((x, y, width, height, pageX, pageY) => {
                                        setPosition({ x: pageX, y: pageY });
                                    });
                                }}

                            >
                                {message.image && (
                                    <TouchableOpacity
                                        onPress={() => openImageViewer(index)}
                                        onLongPress={() => {
                                            setSelectedMessage(message);
                                            setMessageMenu(true);
                                            messageRefs.current[index].current.measure((x, y, width, height, pageX, pageY) => {
                                                setPosition({ x: pageX, y: pageY });
                                            });
                                        }}
                                    >
                                        <Image
                                            source={{ uri: message.image }}
                                            style={{
                                                marginBottom: message.message ? 10 : 0,
                                            }}
                                            className="w-52 h-52 rounded-xl"
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
                                    <>
                                        <Text
                                            style={{
                                                color: message.fromSelf ? 'white' : colors.text,
                                            }}
                                            className={`text-[16px] ${selectedMessage
                                                ? (selectedMessage?.messageId || selectedMessage?.id) !== (message.messageId || message.id)
                                                    ? "opacity-20 "
                                                    : ""
                                                : ""}`}
                                        >
                                            {message.message}
                                        </Text>

                                    </>
                                )}
                            </Pressable>
                        );
                    })
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
                onRequestClose={() => {
                    setMessageMenu(false)
                    setPosition({ x: 0, y: 0 })
                    setSelectedMessage()
                }}
                animationType="fade"
            >
                <View
                    className="absolute"
                    style={{
                        top: selectedMessage?.image ? position.y + 180 : position.y + 10,
                        left: selectedMessage?.fromSelf ? undefined : position.x - 10,
                        right: selectedMessage?.fromSelf ? 10 : undefined,
                    }}
                >
                    <View className=" rounded-3xl w-52 p-4 shadow-lg mx-4 space-y-5" style={{ backgroundColor: "rgba(50, 50, 50, 0.8)" }}>
                        {selectedMessage?.fromSelf && (
                            <Pressable onPress={handleDeleteMessage} className="pt-2">
                                <View className=" justify-center items-center mb-2">
                                    <CustomText className="text-red-500 text-md">Unsend</CustomText>
                                </View>
                                <CustomText className='text-right text-gray-500'>{displayDate}</CustomText>
                            </Pressable>
                        )}
                        {!selectedMessage?.fromSelf && (
                            <View className=" justify-center items-center ">
                                <CustomText className='text-left text-gray-500'>{displayDate}</CustomText>
                            </View>
                        )}
                    </View>
                </View>
            </Modal >
        </>
    );
};

export default Messages;
