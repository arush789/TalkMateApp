import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import axios from 'axios';
import { getAllMessageRoute, host, sendMessageRoute } from "../api/APIroutes";
import CustomText from "../../components/CustomText";
import ChatInput from '../../components/ChatInput';
import uuid from 'react-native-uuid';
import Messages from '../../components/Messages';
import { io } from 'socket.io-client';

const ChatPage = () => {
    const params = useLocalSearchParams();
    const { colors } = useTheme();
    const [messages, setMessages] = useState([]);
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const socket = useRef();

    useEffect(() => {
        if (params.currentUser) {
            socket.current = io(host);
            socket.current.emit("add-user", params.currentUser);
        }

        if (socket.current) {
            socket.current.emit("set-active-chat", {
                userId: params.currentUser,
                activeChat: params.contactId,
            });
        }

        return () => {
            socket.current.disconnect();
        };
    }, [params.currentUser]);


    useEffect(() => {
        if (socket.current) {
            socket.current.on("msg-recieve", (data) => {
                setArrivalMessage({
                    fromSelf: false,
                    message: data.message,
                    image: data.image,
                    messageId: data.messageId,
                });
            });

        }
    }, [socket]);

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

            socket.current.emit("send-msg", {
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
            />
            <ChatInput handleSendMsg={handleSendMsg} />
        </KeyboardAvoidingView>
    );
};

export default ChatPage;
