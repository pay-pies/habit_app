import { Models } from "react-native-appwrite";

export interface Habit extends Models.Document{
    "user-id": string;
    title: string;
    description: string;
    frequency: string;
    "streak-count": number;
    "last-completed": string;
    "created-at": string;

}

export interface HabitCompletion extends Models.Document{
    "habit-id": string;
    "user-id": string;
    "completed-at": string;
}