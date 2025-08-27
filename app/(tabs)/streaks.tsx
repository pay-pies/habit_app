import {View, Text} from 'react-native';
import {useState, useEffect} from 'react'
import {Habit, HabitCompletion} from '@/types/databases.type';
import {useAuth} from '@/lib/auth-context';
import {databases, DATABASE_ID, COMPLETIONS_COLLECTION_ID, HABIT_COLLECTION_ID} from '@/lib/appwrite'
import {Query} from 'react-native-appwrite'
export default function StreaksScreen() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [completedHabits, setCompletedHabits] = useState<HabitCompletion[]>();
    const {user} = useAuth()
    useEffect(() => {
        if (user) {
          fetchHabits();
          fetchCompletions();
        }
        }, [user]);
        const fetchHabits = async () => {
            try{
              const response = await databases.listDocuments<Habit>(
                DATABASE_ID, 
                HABIT_COLLECTION_ID,
                [Query.equal("user-id", user?.$id ?? "")]
              );
              setHabits(response.documents as Habit[]);
            } catch (error) {
              console.error(error);
            }
          };
        
          const fetchCompletions = async () => {
            try{
              const response = await databases.listDocuments<HabitCompletion>(
                DATABASE_ID, 
                COMPLETIONS_COLLECTION_ID,
                [Query.equal("user-id", user?.$id ?? "")]
              );
              // console.log(response.documents);
              const completions = response.documents as HabitCompletion[]
              setCompletedHabits(completions);
            } catch (error) {
              console.error(error);
            }
          };
    return(
        <View>
            <Text>Hello this is the login page</Text>
        </View>
    );
}