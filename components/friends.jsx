import React, { useEffect, useState } from "react";
import { FlatList, Image, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import CustomText from './CustomText';
import { Skeleton } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { getAllMessageRoute } from "@/app/api/APIroutes";
import { useGlobalState } from "./globalState/GlobalProvider"
import axios from "axios";

const Friends = ({ currentUser, contacts, loading, handleChatChange, socket, pendingMessagesCount, setPendingMessagesCount }) => {
    const { colors } = useTheme();
    const fallbackImage = require('../assets/images/blank-profile-picture-973460_1280.png');
    const { lastMessageShow, setLastMessageShow } = useGlobalState()
    const [imageErrors, setImageErrors] = useState({});

    const handleImageError = (contactId) => {
        setImageErrors((prev) => ({ ...prev, [contactId]: true }));
    };

    const fetchLastMessage = async (contactId) => {
        try {
            const response = await axios.post(getAllMessageRoute, {
                from: currentUser._id,
                to: contactId,
            });

            const lastMessageData = response.data?.lastMessage || null;
            const pendingMessageData = response.data?.pendingRead || [];

            let lastMessageText = "No messages yet";
            let lastMessageSide = "";
            let pendingCount = 0;

            if (lastMessageData) {
                if (lastMessageData.message) {
                    lastMessageText = lastMessageData.message;
                    lastMessageSide = lastMessageData.fromSelf;
                } else if (lastMessageData.image) {
                    lastMessageText = "Sent an image";
                    lastMessageSide = lastMessageData.fromSelf;
                } else if (lastMessageData.gif) {
                    lastMessageText = "Sent a GIF";
                    lastMessageSide = lastMessageData.fromSelf;
                }
            }

            pendingCount = pendingMessageData.length;

            setLastMessageShow((prev) => ({
                ...prev,
                [contactId]: {
                    text: lastMessageText,
                    fromSelf: lastMessageSide,
                },
            }));

            setPendingMessagesCount((prev) => ({
                ...prev,
                [contactId]: pendingCount,
            }));

        } catch (error) {
            console.error(`Error fetching message for contact ${contactId}:`, error);
            setLastMessageShow((prev) => ({
                ...prev,
                [contactId]: {
                    text: "No messages yet",
                    fromSelf: false,
                },
            }));
        }
    };

    useEffect(() => {
        if (contacts) {
            contacts.forEach((contact) => {
                fetchLastMessage(contact._id);
            });
        }
    }, [contacts]);

    useEffect(() => {
        socket.on("lastMsgRecieve", (data) => {
            const { message, fromSelf, from, to, image, gif } = data;

            const contactId = from === currentUser._id ? to : from;

            if (from !== currentUser._id) {
                setLastMessageShow((prev) => ({
                    ...prev,
                    [contactId]: {
                        text: image ? "Sent an image" : gif ? "Sent a GIF" : message || "No messages yet",
                        fromSelf: fromSelf,
                    },
                }));
            }
        });

        return () => {
            socket.off("lastMsgRecieve");
        };
    }, [socket, currentUser]);

    return (
        <View >
            <View className="flex-row justify-between items-center mb-6 px-5">
                <CustomText className="mt-2 text-3xl font-semibold" style={{ color: colors.text }}>
                    Friends
                </CustomText>
                <View className="mr-2">
                    <Ionicons name="notifications-outline" size={30} color={colors.text} />
                </View>
            </View>

            {loading ? (
                <>
                    {Array(3).fill(0).map((_, index) => (
                        <View key={index} className=" flex-row gap-x-4  mb-6 items-center justify-center">
                            <Skeleton rounded="full" h="16" w="16" />
                            <Skeleton.Text h="10" w="300px" />
                        </View>
                    ))}
                </>
            ) : (
                <FlatList
                    data={contacts}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => {
                        const imageUri = imageErrors[item._id]
                            ? fallbackImage
                            : { uri: `data:image/png;base64,${item.avatarImage}` };
                        if (item && item.username) {
                            return (
                                <Link
                                    href={{
                                        pathname: '/chat/ChatPage',
                                        params: {
                                            currentUser: currentUser._id,
                                            contactName: item.username,
                                            contactId: item._id,
                                        },
                                    }}
                                    onPress={() => handleChatChange(item)}
                                    key={item._id}
                                    className="mb-3 rounded-full mx-4"
                                    style={{ backgroundColor: colors.secondary }}
                                >
                                    <View className="flex-row items-center p-4 mb-4">

                                        <View
                                            className="border-2 p-1 rounded-full mr-4"
                                            style={{ borderColor: colors.text }}
                                        >
                                            <Image
                                                source={imageUri}
                                                className="w-12 h-12 rounded-full"
                                                resizeMode="cover"
                                                onError={() => handleImageError(item._id)}
                                            />
                                        </View>

                                        <View>
                                            {/* Username */}
                                            <CustomText className="text-lg font-medium" style={{ color: colors.text }}>
                                                {item.username}
                                            </CustomText>

                                            {/* Last message */}
                                            <CustomText className="text-sm text-gray-600">
                                                {lastMessageShow[item._id]?.fromSelf ? "You: " : ""}
                                                {lastMessageShow[item._id]?.text || "Loading..."}
                                            </CustomText>

                                            {/* Pending message count */}
                                            {pendingMessagesCount[item._id] > 0 && (
                                                <CustomText className="text-xs text-red-500">
                                                    {pendingMessagesCount[item._id]} new message
                                                    {pendingMessagesCount[item._id] > 1 ? 's' : ''}
                                                </CustomText>
                                            )}
                                        </View>
                                    </View>
                                </Link>
                            );
                        } else {
                            return (
                                <CustomText>
                                    No Friends
                                </CustomText>
                            )
                        }
                    }}
                />

            )}
        </View>
    );
};

export default Friends;
