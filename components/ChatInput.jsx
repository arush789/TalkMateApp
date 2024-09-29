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
        <View style={{ backgroundColor: colors.secondary }} className="mb-5 mx-4 flex-row items-center rounded-3xl px-2">
            <TextInput
                value={msg}
                onChangeText={(value) => setMsg(value)}
                placeholder="Type a message..."
                placeholderTextColor={colors.text}
                multiline={true}
                maxLength={500}
                style={{
                    flex: 1,
                    backgroundColor: colors.secondary,
                    color: colors.text,
                    maxHeight: 150,
                    minHeight: 50,
                }}
                className="p-4 rounded-3xl items-center max-w-[90%]"
            />
            <TouchableOpacity
                onPress={onSend}
                className="py-4 px-4 rounded-full absolute right-0"
                style={{
                    backgroundColor: colors.primary,
                }}
            >
                <Ionicons name="send" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
};

export default ChatInput;
