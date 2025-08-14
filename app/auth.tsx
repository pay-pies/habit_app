import {KeyboardAvoidingView, Platform, View, Text } from "react-native";

export default function AuthScreen() {
    return (
        <KeyboardAvoidingView behavior={Platform.OS === "android" ? "height" : "padding"}>
            <View>
                <Text>Create Account</Text>
            </View>
        </KeyboardAvoidingView>
    );
}