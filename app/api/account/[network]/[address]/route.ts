import { NEXT_PUBLIC_URL } from '@/app/config';
import { parseFrameRequest } from '../../../../lib/farcaster';
import { FrameRequest, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { bundlerActions, createSmartAccountClient } from 'permissionless';
import { privateKeyToSafeSmartAccount } from 'permissionless/accounts';
import { pimlicoBundlerActions } from 'permissionless/actions/pimlico';
import { createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';
import { Address, createPublicClient, http } from 'viem';
import { arbitrumSepolia, baseSepolia } from 'viem/chains';


const eprivateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY!;
const privateKey = '0x' + eprivateKey;
const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY!;


export async function POST(req: NextRequest): Promise<NextResponse> {
    const segments = req.url.split('/');
    const swapIndex = segments.indexOf('account');
    let network;
    let tokenAddress;
    if (swapIndex !== -1 && segments.length > swapIndex + 2) {
        network = segments[swapIndex + 1];
        tokenAddress = segments[swapIndex + 2];
        console.log(`Network: ${network}, Token Address: ${tokenAddress}`);
    } else {
        console.log("URL does not contain the expected segments.");
    }

    const fid = process.env.NEXT_PUBLIC_MYFID;
    if (!fid) {
        return new NextResponse('Invalid Frame id', { status: 400 });
    }
    let publicClient;
    let paymasterUrl;
    let bundlerUrl;
    if (network === 'base') {
        paymasterUrl = `https://api.pimlico.io/v2/84532/rpc?apikey=${apiKey}`
        bundlerUrl = `https://api.pimlico.io/v1/84532/rpc?apikey=${apiKey}`

        publicClient = createPublicClient({
	        transport: http("https://rpc.ankr.com/base_sepolia"),
        })
    } else if (network === 'arbitrum') {
        paymasterUrl = `https://api.pimlico.io/v2/421614/rpc?apikey=${apiKey}`
        bundlerUrl = `https://api.pimlico.io/v1/421614/rpc?apikey=${apiKey}`

        publicClient = createPublicClient({
	        transport: http("https://rpc.ankr.com/arbitrum_sepolia"),
        })
    }
    const paymasterClient = createPimlicoPaymasterClient({
	    transport: http(paymasterUrl),
    })

    // send transaction
    const account = await privateKeyToSafeSmartAccount(publicClient!, {
        privateKey: privateKey as Address,
        safeVersion: "1.4.1", // simple version
        entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // global entrypoint
        saltNonce: BigInt(fid)
    })
    let smartAccountClient;
    let redirect;
    if (network === 'base') {
        smartAccountClient = createSmartAccountClient({
            account,
            chain: baseSepolia,
            transport: http(bundlerUrl),
            sponsorUserOperation: paymasterClient.sponsorUserOperation,
        })
            .extend(bundlerActions)
            .extend(pimlicoBundlerActions)
        redirect = `https://sepolia.basescan.org/address/${account.address}`
    } else if (network === 'arbitrum') {
        smartAccountClient = createSmartAccountClient({
            account,
            chain: arbitrumSepolia,
            transport: http(bundlerUrl),
            sponsorUserOperation: paymasterClient.sponsorUserOperation,
        })
            .extend(bundlerActions)
            .extend(pimlicoBundlerActions)
        redirect = `https://sepolia.arbiscan.io/address/${account.address}` 
    } 
    const gasPrices = await smartAccountClient!.getUserOperationGasPrice()

    const callData = await account.encodeCallData({ 
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
    console.log(network, tokenAddress);
    return new NextResponse(`<!DOCTYPE html><html><head>
    <title>Account created</title>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${NEXT_PUBLIC_URL}/api/og?address=${account.address}&fid=${fid}&userOpHash=${userOpHash}" />
    <meta property="fc:frame:button:1" content="View Smart Account" />
    <meta property="fc:frame:button:1:action" content="link" />
    <meta property="fc:frame:button:1:target" content="${redirect}" />
    <meta property="fc:frame:button:2" content="Transfert" />
    <meta property="fc:frame:button:2:action" content="post" />
    <meta property="fc:frame:post_url" content="${NEXT_PUBLIC_URL}/api/transfers/${network}/${tokenAddress}" />
  </head></html>`);
}