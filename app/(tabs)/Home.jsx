import { View, ScrollView, Image, Pressable, Text } from "react-native";
import React, { useEffect, useRef, useState } from "react";

import { router, Stack } from "expo-router";
import { allUsersRoute, host } from "../api/APIroutes";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useTheme } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import CustomTextHeading from '../../components/CustomTextHeading';
import CustomText from '../../components/CustomText';
import Friends from "../../components/Friends"
import socket from '../../socket';

const Home = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState(null);
  const [loading, setLoading] = useState(true)
  const { colors } = useTheme()

  useEffect(() => {
    if (currentUser) {
      socket.emit("add-user", currentUser._id);
    }
  }, [currentUser]);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("chat-app-user");
        if (!storedUser) {
          router.replace("/(auth)/Login");
        } else {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
        }
      } catch (error) {
        console.error("Error fetching user from AsyncStorage:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    setLoading(true)
    const fetchContacts = async () => {
      if (currentUser && Object.keys(currentUser).length > 0) {
        if (currentUser.isAvatarImageSet) {
          try {
            const { data } = await axios.get(`${allUsersRoute}/${currentUser._id}`);
            setContacts(data);
            setLoading(false)
          } catch (error) {
            console.error("Failed to fetch contacts", error);
          }
        } else {
          router.push("/avatar/");
        }
      }
    };

    fetchContacts();
  }, [currentUser]);

  const handleChatChange = (chat) => {
    socket.emit("set-active-chat", {
      userId: currentUser._id,
      activeChat: chat._id,
    });

  };

  return (
    <View className="flex-1 px-5">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerStyle: { height: 50 },
        }}
      />
      <ScrollView className="flex-1">
        <Friends
          currentUser={currentUser}
          contacts={contacts}
          loading={loading}
          handleChatChange={handleChatChange}
        />
      </ScrollView>
    </View>
  );
};

export default Home;
