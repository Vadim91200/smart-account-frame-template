import { MongoClient } from 'mongodb';
import { ethers } from 'ethers';

const uri = process.env.NEXT_PUBLIC_MONGODB_URI!;
const client = new MongoClient(uri);
const database = client.db('accounts');
const farcaster = database.collection('farcaster');

async function findAccount(fid: number | undefined) {
    try {
        const query = { fid: fid};
        const account = await farcaster.findOne(query);
        console.log(account);
        return account;
    } finally { await client.close(); }
}

async function createAccount(fid: number | undefined) {
    try {
        const wallet = ethers.Wallet.createRandom();
        const newAccount = {
            fid: fid,
            publicKey: wallet.address,
            privateKey: wallet.privateKey,
        };
        const result = await farcaster.insertOne(newAccount);
        console.log(`Account was inserted with the _id: ${result.insertedId}`);
        return newAccount;
    } finally { await client.close(); }
}

export async function getAccount(fid: number | undefined) {
    let account = await findAccount(fid);
    if (account) return {account: await findAccount(fid), new: false};
    return {account: await createAccount(fid), new: true};
}
