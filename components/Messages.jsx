import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect, useRef } from 'react';
import CustomText from './CustomText';
import { useTheme } from '@react-navigation/native';

const Messages = ({ messages, loading }) => {
    const { colors } = useTheme();
    const scrollViewRef = useRef(null);

    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    return (
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
                    <View
                        key={index}
                        style={{
                            alignSelf: message.fromSelf ? 'flex-end' : 'flex-start',
                            backgroundColor: message.fromSelf ? colors.primary : colors.secondary,
                        }}
                        className="py-3 px-4 my-1 rounded-3xl max-w-[75%]"
                    >
                        <CustomText style={{ color: colors.text }} className="text-[15px]">
                            {message.message}
                        </CustomText>
                    </View>
                ))
            )}
        </ScrollView>
    );
};

export default Messages;
