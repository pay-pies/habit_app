import {KeyboardAvoidingView, Platform, View, StyleSheet} from "react-native";
import {Text, TextInput, Button, useTheme} from "react-native-paper"
import {useState} from "react";
import {useAuth} from "@/lib/auth-context";
import {useRouter} from "expo-router";

export default function AuthScreen() {
    const [isSignUp, setIsSignUp] = useState<boolean>(false)
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>("");
    const {signIn, signUp} = useAuth();
    const theme = useTheme();
    const router = useRouter();
    const handleAuth = async () => {
        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }
        if (password.length < 8){
            setError("Password must be at least 8 characters long.");
            return;
        }

        setError(null);
        if (isSignUp){
            const error = await signUp(email, password)
            if (error){
                setError(error);
                return;
            }
        } else{
            const error = await signIn(email, password)
            if (error){
                setError(error);
                return;
            }
            router.replace("/");
        }
    };

    const handleSwitchMode = () => {
        setIsSignUp((prev) => !prev);
    }
    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "android" ? "height" : "padding"}
            style={styles.container}
            >
            <View style={styles.content}>
                <Text style={styles.title} variant="headlineMedium">{isSignUp ? "Create Account" : "Welcome Back!"}</Text>
                <TextInput 
                    label="Email" 
                    autoCapitalize="none" 
                    keyboardType="email-address"
                    placeholder="example@gmail.com"
                    mode="outlined"
                    style={styles.input}
                    onChangeText={setEmail}/>
                <TextInput 
                    label="Password" 
                    autoCapitalize="none" 
                    secureTextEntry
                    mode="outlined"
                    style={styles.input}
                    onChangeText={setPassword}/>
                
                {error &&
                    <Text style={{color: theme.colors.error}}>{error}</Text>
                    
                }

                <Button mode="contained" style={styles.button} onPress={handleAuth}>
                    <Text style={{color: "#fff",}}>{isSignUp ? "Sign Up" : "Sign in"}</Text>
                </Button>
                <Button mode="text" onPress={handleSwitchMode} style={styles.switchModeButton}>
                    <Text>{isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}</Text>
                </Button>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5"
    },
    content: {
        flex: 1,
        padding: 16,
        justifyContent: "center",
    },
    title: {
        textAlign: "center",
        marginBottom: 24,
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
    },
    switchModeButton: {
        marginTop: 16,
    }

});