import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import React from 'react'
import CustomText from './CustomText'
import { useTheme } from '@react-navigation/native'

const Messages = ({ messages, loading }) => {

    const { colors } = useTheme()

    return (
        <ScrollView
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
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
                        className="p-4 my-2 rounded-2xl max-w-[75%]"
                    >
                        <CustomText style={{ color: colors.text }} className="text-md">{message.message}</CustomText>
                    </View>
                ))
            )}

        </ScrollView>
    )
}

export default Messages