import React from "react";
import { Image, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import CustomText from '../components/CustomText';
import { Skeleton } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

const Friends = ({ currentUser, contacts, loading }) => {
    const { colors } = useTheme();

    return (
        <View className="">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
                <CustomText className="mt-2 text-3xl font-semibold" style={{ color: colors.text }}>
                    Friends
                </CustomText>
                <View className="mr-2">
                    <Ionicons name="notifications-outline" size={30} color={colors.text} />
                </View>
            </View>

            {/* Loading state */}
            {loading ? (
                <>
                    {Array(3).fill(0).map((_, index) => (
                        <View key={index} className="flex-row gap-x-4 mb-6 items-center">
                            <Skeleton rounded="full" h="16" w="16" />
                            <Skeleton.Text h="10" />
                        </View>
                    ))}
                </>
            ) : (
                <>
                    {/* Contacts list */}
                    {contacts && contacts.length > 0 ? (
                        contacts.map((contact) => (
                            <Link
                                href={{
                                    pathname: '/chat/ChatPage',
                                    params: {
                                        currentUser: currentUser._id,
                                        contactName: contact.username,
                                        contactId: contact._id
                                    }
                                }}
                                key={contact._id}
                                className="mb-5 rounded-3xl"
                                style={{ backgroundColor: colors.secondary }}
                            >
                                <View className="flex-row items-center p-4 mb-4 ">
                                    {/* Avatar */}
                                    <View
                                        className="border-2 p-1 rounded-full mr-4"
                                        style={{ borderColor: colors.text }}
                                    >
                                        <Image
                                            source={{ uri: `data:image/png;base64,${contact.avatarImage}` }}
                                            className="w-12 h-12 rounded-full"
                                            resizeMode="cover"
                                        />
                                    </View>

                                    {/* Username */}
                                    <CustomText className="text-lg font-medium" style={{ color: colors.text }}>
                                        {contact.username}
                                    </CustomText>
                                </View>
                            </Link>
                        ))
                    ) : (
                        <CustomText className="text-center mt-10 text-base" style={{ color: colors.text }}>
                            No contacts to display.
                        </CustomText>
                    )}
                </>
            )}
        </View>
    );
};

export default Friends;
