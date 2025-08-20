import {View, StyleSheet} from 'react-native';
import {useState} from 'react';
import {useAuth} from '../../lib/auth-context';
import {TextInput, SegmentedButtons, Button, useTheme, Text} from "react-native-paper";
import {databases, DATABASE_ID, HABIT_COLLECTION_ID} from '../../lib/appwrite';
import {ID} from 'react-native-appwrite';
import {useRouter} from 'expo-router';

const styles = StyleSheet.create({
    container:{
        flex: 1,
        padding: 16,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
    },
    input:{
        marginBottom: 16,
    },
    frequencyContainer:{
        marginBottom: 24,
    },
});

const FREQUENCIES = ["daily", "weekly", "monthly"];
type Frequency = (typeof FREQUENCIES)[number];
export default function AddHabitScreen() {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [frequency, setFrequency] = useState<Frequency>("daily");
    const {user} = useAuth();
    const router = useRouter();
    const [error, setError] = useState<string>("");
    const theme = useTheme();
    const handleSubmit = async () => {
        if (!user) return;
        console.log("Submitting habit");
        console.log(user);
        try{
        await databases.createDocument(
            DATABASE_ID, 
            HABIT_COLLECTION_ID, 
            ID.unique(),
            {
                user_id: user.$id,
                title,
                description,
                frequency,
                streak_count: 0,
                last_completed: new Date().toISOString(),
                created_at: new Date().toISOString(),
            }
        );
        // router.back();
        router.replace("/");
    } catch (error) {
        if (error instanceof Error) {
            setError(error.message);
            return;
        } 
        setError("An error occurred while adding the habit.");
    }
    
};

    return(
        <View style={styles.container}>
            <TextInput 
                label="Title" 
                mode="outlined" 
                style={styles.input} 
                value={title}
                onChangeText={setTitle}
                />
            <TextInput 
                label="Description" 
                mode="outlined" 
                style={styles.input}
                value={description}
                onChangeText={setDescription}/>
            <View style={styles.frequencyContainer}>
                <SegmentedButtons 
                    value={frequency}
                    onValueChange={(value) => setFrequency(value as Frequency)}
                    buttons={FREQUENCIES.map((freq) => ({
                        value: freq,
                        label: freq.charAt(0).toUpperCase() + freq.slice(1),
                }))}
            />
            </View>
            <Button mode="contained" onPress={handleSubmit}disabled={!title || !description}>
                Add Habit
            </Button>
            {error &&
                    <Text style={{color: theme.colors.error}}>{error}</Text>
                    
                }
            </View>
        );
    }
