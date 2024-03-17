import { parseFrameRequest } from '@lib/farcaster';
import { getAccount } from '@lib/mongodb';
import { FrameRequest } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { bundlerActions, createSmartAccountClient } from 'permissionless';
import { SafeSmartAccount, privateKeyToSafeSmartAccount } from 'permissionless/accounts';
import { pimlicoBundlerActions } from 'permissionless/actions/pimlico';
import { createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';
import { Address, createPublicClient, http } from 'viem';
import { arbitrumSepolia, baseSepolia } from 'viem/chains';

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL;
const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY!;

const BASE_ID = '84532';
const ARBITRUM_ID = '421614';

async function getFid(req: NextRequest){
    let frameRequest: FrameRequest | undefined;
    try {
        frameRequest = await req.json();
        if (!frameRequest) throw new Error('Could not deserialize request from frame');
    } catch (e) { return null; }
    const {fid, isValid} = await parseFrameRequest(frameRequest);
    if (!isValid || !fid) return null;
    return fid;
}

function getNetwork(network: undefined | string){
    let network_id;
    let chain;
    let scan;
    if (network === 'base') {
        network_id = BASE_ID;
        chain = baseSepolia;
        scan = 'https://sepolia.basescan.org/';
    } else if (network === 'arbitrum') {
        network_id =  ARBITRUM_ID;
        chain = arbitrumSepolia;
        scan = 'https://sepolia.arbiscan.io/';
    }
    else return null;
    return {network_id, chain, scan};
}

function getPaymasterClient(network: undefined | string){
    let network_id = getNetwork(network)?.network_id;
    let paymasterUrl = `https://api.pimlico.io/v2/${network_id}/rpc?apikey=${apiKey}`
    let bundlerUrl = `https://api.pimlico.io/v1/${network_id}/rpc?apikey=${apiKey}`
    let publicClient = createPublicClient({
        transport: http(`https://rpc.ankr.com/${network}_sepolia`),
    })
    const paymasterClient = createPimlicoPaymasterClient({
	    transport: http(paymasterUrl),
    })
    return {paymasterClient, publicClient, bundlerUrl};
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    const fid = await getFid(req);
    if (!fid) {
        return new NextResponse("Invalid request", { status: 400 });
    }

    const segments = req.url.split('/');
    const swapIndex = segments.indexOf('account');
    let network = segments[swapIndex + 1];
    let tokenAddress = segments[swapIndex + 2];

    const {paymasterClient, publicClient, bundlerUrl} = getPaymasterClient(network);

    const user_account = await getAccount(fid);
    const userPrivateKey = user_account?.account?.privateKey;
    const userPublicKey = user_account?.account?.publicKey;
    const newUser = user_account?.new;

    let account : SafeSmartAccount;
    if (newUser) {
        account = await privateKeyToSafeSmartAccount(publicClient!, {
            privateKey: userPrivateKey as Address,
            safeVersion: "1.4.1", // simple version
            entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // global entrypoint
            saltNonce: BigInt(fid)
        })
    } else {
        account = await privateKeyToSafeSmartAccount(publicClient!, {
            privateKey: userPrivateKey as Address,
            safeVersion: "1.4.1", // simple version
            entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // global entrypoint
            saltNonce: BigInt(fid),
            address: userPublicKey as Address
        })
    }

    let chain = getNetwork(network)?.chain;
    let scan = getNetwork(network)?.scan;

    let smartAccountClient = createSmartAccountClient({
        account,
        chain,
        transport: http(bundlerUrl),
        sponsorUserOperation: paymasterClient.sponsorUserOperation,
    }).extend(bundlerActions).extend(pimlicoBundlerActions)


    const callData : `0x${string}` = await account.encodeCallData({ 
        to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", 
        data: "0x1234",
        value: BigInt(0) 
    })

    const userOperation = await smartAccountClient!.prepareUserOperationRequest({
        userOperation: {
            callData
        },
    })

    userOperation.signature = await account.signUserOperation(userOperation)

    const userOpHash = await smartAccountClient!.sendUserOperation({
        userOperation,
        entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
    })

    return new NextResponse(`<!DOCTYPE html><html><head>
    <title>Account created</title>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${NEXT_PUBLIC_URL}/api/og?address=${account.address}&fid=${fid}&userOpHash=${userOpHash}" />
    <meta property="fc:frame:button:1" content="View Smart Account" />
    <meta property="fc:frame:button:1:action" content="link" />
    <meta property="fc:frame:button:1:target" content="${scan}address/${account.address}" />
    <meta property="fc:frame:button:2" content="Transfert" />
    <meta property="fc:frame:button:2:action" content="post" />
    <meta property="fc:frame:post_url" content="${NEXT_PUBLIC_URL}/api/transfers/${network}/${tokenAddress}" />
  </head></html>`);
}