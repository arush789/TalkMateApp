import React, { useEffect, useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import axios from 'axios';
import { getAllMessageRoute, sendMessageRoute } from "../api/APIroutes";
import CustomText from "../../components/CustomText";
import ChatInput from '../../components/ChatInput';
import uuid from 'react-native-uuid';
import Messages from '../../components/Messages';
import socket from '../../socket';

const ChatPage = () => {
    const params = useLocalSearchParams();
    const { colors } = useTheme();
    const [messages, setMessages] = useState([]);
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const [image, setImage] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        socket.on("msg-recieve", (data) => {
            setArrivalMessage({
                fromSelf: false,
                message: data.message,
                image: data.image,
                messageId: data.messageId,
            });
        });

        socket.on("msg-deleted", (data) => {
            if (data.messageId || data.id) {
                setMessages((prevMessages) => {
                    const updatedMessages = prevMessages.filter((message) => {
                        return (message.id && message.id !== data.messageId) ||
                            (message.messageId && message.messageId !== data.messageId);
                    });
                    return updatedMessages;
                });
            } else {
                console.error("Message ID is missing in the delete event data:", data);
            }
        });

        return () => {
            socket.off("msg-recieve");
            socket.off("msg-deleted");
        };
    }, [params.currentUser]);

    useEffect(() => {
        arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
    }, [arrivalMessage]);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await axios.post(getAllMessageRoute, {
                from: params.currentUser,
                to: params.contactId,
            });
            setMessages(response.data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.contactId) {
            fetchMessages();
        }
    }, [params.contactId]);

    const handleSendMsg = async (msg, image) => {
        const messageText = msg || "";
        const imageUrl = image || "";
        const messageId = uuid.v4();

        setMessages((prevMessages) => [
            ...prevMessages,
            { fromSelf: true, message: messageText, image: imageUrl, messageId },
        ]);

        try {
            await axios.post(sendMessageRoute, {
                from: params.currentUser,
                to: params.contactId,
                messages: messageText,
                image: imageUrl,
                messageId,
            });

            socket.emit("send-msg", {
                from: params.currentUser,
                to: params.contactId,
                message: messageText,
                image: imageUrl,
                messageId,
            });

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prevMessages) => prevMessages.filter(msg => msg.messageId !== messageId));
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Stack.Screen
                options={{
                    headerStyle: {
                        backgroundColor: colors.background,
                    },
                    headerTitle: params.contactName || "Chat",
                    headerShadowVisible: false,
                }}
            />
            <Messages
                messages={messages}
                loading={loading}
                setMessages={setMessages}
                socket={socket}
                currentUser={params.currentUser}
                contactId={params.contactId}
            />
            <ChatInput handleSendMsg={handleSendMsg} image={image} setImage={setImage} />
        </KeyboardAvoidingView>
    );
};

export default ChatPage;
