// src/lib/appwrite.js
import { Client, Account, OAuthProvider, ID, Storage } from 'appwrite';

// Create Appwrite client
export const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1') // Your API endpoint
    .setProject('68b09ea20010c1700ac0'); // Your project ID

// Account instance
export const account = new Account(client);

// Storage instance
export const storage = new Storage(client);

// Export ID and OAuthProvider for use in login
export { ID, OAuthProvider };

export const BUCKET_ID = '68b0a1aa0028885b31e0';
