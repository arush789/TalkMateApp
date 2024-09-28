

import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Text, StyleSheet } from 'react-native';

const CustomTextHeading = ({ style, ...props }) => {
    return <Text {...props} style={[styles.text, style]} />;
};


const styles = StyleSheet.create({
    text: {
        fontFamily: 'Poppins_SemiBold', // Apply the Montserrat font globally
    },
});

export default CustomTextHeading;
