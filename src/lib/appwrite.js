import { Client, Account} from 'appwrite';

export const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('68b09ea20010c1700ac0'); // Replace with your project ID

export const account = new Account(client);
export { ID } from 'appwrite';
