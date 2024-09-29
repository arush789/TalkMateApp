import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ChatInput = ({ handleSendMsg }) => {
    const { colors } = useTheme();
    const [msg, setMsg] = useState('');

    const onSend = () => {
        if (msg.length > 0) {
            handleSendMsg(msg);
            setMsg('');
        }
    };

    return (
        <View className="relative">
            <View
                className={`absolute bottom-0 left-0 right-0 rounded-3xl p-1 mb-5 shadow-lg mx-5`}
                style={{
                    backgroundColor: colors.secondary
                }}
            >
                <View className="flex-row items-center">
                    <TextInput
                        value={msg}
                        onChangeText={(value) => setMsg(value)}
                        placeholder="Type a message..."
                        placeholderTextColor={colors.text}
                        multiline={true}
                        maxLength={500}
                        className="flex-1 bg-transparent  max-h-36 min-h-12 p-4 rounded-3xl"
                        style={{
                            color: colors.text
                        }}
                    />
                    {msg.length > 0 &&
                        <TouchableOpacity
                            onPress={onSend}
                            className="mr-1 rounded-3xl p-4"
                            style={{
                                backgroundColor: colors.primary
                            }}
                        >
                            <Ionicons name="send" size={24} color="white" />
                        </TouchableOpacity>
                    }
                </View>
            </View>
        </View>
    );
};

export default ChatInput;
