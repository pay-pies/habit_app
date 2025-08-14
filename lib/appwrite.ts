import 'react-native-url-polyfill/auto';
import { Account, Client, Databases } from 'react-native-appwrite';

const client = new Client()
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject("689e405900149758a975")
    .setPlatform("com.paypies.habittracker");

const account = new Account(client);

// Test request — get current account (will fail if not logged in, but still connects)
account.get()
    .then(response => {
        console.log("Connected! Account info:", response);
    })
    .catch(err => {
        console.log("Connected but not logged in:", err.message);
    });
