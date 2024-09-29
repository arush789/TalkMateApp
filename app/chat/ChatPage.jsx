import React, { useEffect, useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Text, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import axios from 'axios';
import { getAllMessageRoute, sendMessageRoute } from "../api/APIroutes";
import CustomText from "../../components/CustomText"
import ChatInput from '../../components/ChatInput';
import uuid from 'react-native-uuid';
import Messages from '../../components/Messages';

const ChatPage = () => {
    const params = useLocalSearchParams();
    const { colors } = useTheme();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleSendMsg = async (msg, image) => {
        const messageText = msg || "";
        const imageUrl = image || "";
        const messageId = uuid.v4();


        setMessages((prevMessages) => [
            ...prevMessages,
            { fromSelf: true, message: messageText, image: imageUrl, messageId },
        ]);

        try {
            const response = await axios.post(sendMessageRoute, {
                from: params.currentUser,
                to: params.contactId,
                messages: messageText,
                image: imageUrl,
                messageId,
            });

            console.log('Message sent successfully:', response.data);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prevMessages) => prevMessages.filter(msg => msg.messageId !== messageId));
        }
    };


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
