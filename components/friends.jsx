import React from "react";
import { Image, View, ActivityIndicator } from "react-native";
import { useTheme } from "@react-navigation/native";
import CustomText from '../components/CustomText';
import { HStack, Skeleton } from "native-base";
import { Ionicons } from "@expo/vector-icons";

const Friends = ({ contacts, loading }) => {
    const { colors } = useTheme();

    return (
        <View className="px-2">
            <View className="flex-row justify-between items-center mb-5">
                <CustomText className=" mt-2 text-3xl" style={{ color: colors.text }}>
                    Friends
                </CustomText>
                <View className="mr-2">
                    <Ionicons name="notifications-outline" size={30} color={colors.text} />
                </View>
            </View>
            {loading ? (
                <>
                    <View className="flex-row gap-x-3 mb-10">
                        <Skeleton rounded="full" h="16" w="16" />
                        <Skeleton.Text h="10" />
                    </View>
                    <View className="flex-row gap-x-3 mb-10">
                        <Skeleton rounded="full" h="16" w="16" />
                        <Skeleton.Text h="10" />
                    </View>
                    <View className="flex-row gap-x-3 mb-10">
                        <Skeleton rounded="full" h="16" w="16" />
                        <Skeleton.Text h="10" />
                    </View>
                </>
            ) : (
                <>
                    {contacts && contacts.length > 0 ? (
                        contacts.map((contact) => (
                            <View key={contact._id} className="flex-row items-center mb-5 p-4 rounded-3xl" style={{
                                backgroundColor: colors.secondary
                            }}>
                                <View className="border-2  rounded-full mr-4" style={{
                                    borderColor: colors.text
                                }}>
                                    <Image
                                        source={{ uri: `data:image/png;base64,${contact.avatarImage}` }}
                                        className="w-12 h-12 rounded-full"
                                        resizeMode="cover"
                                    />
                                </View>
                                <CustomText className="text-lg" style={{ color: colors.text }}>
                                    {contact.username}
                                </CustomText>
                            </View>
                        ))
                    ) : (
                        <CustomText style={{ color: colors.text }}>
                            No contacts to display.
                        </CustomText>
                    )}
                </>
            )}
        </View>
    );
};

export default Friends;
