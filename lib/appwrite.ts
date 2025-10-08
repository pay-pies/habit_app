import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto';
import { Account, Client, Databases } from 'react-native-appwrite';

const {
  EXPO_PUBLIC_APPWRITE_ENDPOINT,
  EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  EXPO_PUBLIC_DB_ID,
  EXPO_PUBLIC_HABIT_COLLECTION_ID,
  EXPO_PUBLIC_COMPLETIONS_COLLECTION_ID,
} = Constants.expoConfig?.extra || {};

export const client = new Client()
    .setEndpoint(EXPO_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(EXPO_PUBLIC_APPWRITE_PROJECT_ID)
    // .setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!);

export const account = new Account(client);
export const databases = new Databases(client);

export const DATABASE_ID = EXPO_PUBLIC_DB_ID;
export const HABIT_COLLECTION_ID = EXPO_PUBLIC_HABIT_COLLECTION_ID;
    // process.env.EXPO_PUBLIC_HABIT_COLLECTION_ID!;
    // export interface RealTimeResponse {
    //     events: string[];
    //     payload: any;
    // }
export const COMPLETIONS_COLLECTION_ID = EXPO_PUBLIC_COMPLETIONS_COLLECTION_ID;
    // process.env.EXPO_PUBLIC_COMPLETIONS_COLLECTION_ID!;
    // export interface RealTimeResponse {
    //     events: string[];
    //     payload: any;
    // }

export interface RealTimeResponse {
  events: string[];
  payload: any;
}