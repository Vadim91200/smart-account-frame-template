import { ethers }  from  'ethers';
import { NEXT_PUBLIC_URL } from '@/app/config';
import { privateKeyToSafeSmartAccount } from 'permissionless/accounts';
import { Address, Hash, createPublicClient, http } from 'viem';
import { NextRequest, NextResponse } from 'next/server';
import { bundlerActions, createSmartAccountClient } from 'permissionless';
import { pimlicoBundlerActions } from 'permissionless/actions/pimlico';
import { createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';
import { arbitrumSepolia, baseSepolia } from 'viem/chains';
import { abi } from '@uniswap/swap-router-contracts/artifacts/contracts/interfaces/ISwapRouter02.sol/ISwapRouter02.json'

const UNISWAP_ROUTER_ADDRESS = '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E';
const ETH_ADDRESS = '0x0000000000000000000000000000000000000000'; // Wrapped ETH address
const PEPE_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'; // DAI token address

const INFURA_API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY!;
const eprivateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY!;
const privateKey = '0x' + eprivateKey;
const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY!;
export async function POST(req: NextRequest): Promise<NextResponse> {
    const segments = req.url.split('/');
    const swapIndex = segments.indexOf('transfers');
    let network;
    let tokenAddress;
    if (swapIndex !== -1 && segments.length > swapIndex + 2) {
        network = segments[swapIndex + 1];
        tokenAddress = segments[swapIndex + 2];
        console.log(`Network: ${network}, Token Address: ${tokenAddress}`);
    } else {
        console.log("URL does not contain the expected segments.");
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
    const fid = process.env.NEXT_PUBLIC_MYFID;
    const account = await privateKeyToSafeSmartAccount(publicClient!, {
        privateKey: privateKey as Hash,
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
        redirect = `https://sepolia.basescan.org/tx/`
    } else if (network === 'arbitrum') {
        smartAccountClient = createSmartAccountClient({
            account,
            chain: arbitrumSepolia,
            transport: http(bundlerUrl),
            sponsorUserOperation: paymasterClient.sponsorUserOperation,
        })
            .extend(bundlerActions)
            .extend(pimlicoBundlerActions)
        redirect = `https://sepolia.arbiscan.io/tx/` 
    } 
    const dynamicPart = tokenAddress!.slice(2); // Remove the '0x' part
    const txHash = await smartAccountClient!.sendTransaction({
        to: `0x${dynamicPart}`, 
        value: ethers.parseEther("0.001"),
    });
    console.log(txHash);
    return new NextResponse(`<!DOCTYPE html><html><head>
    <title>Done</title>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${NEXT_PUBLIC_URL}/park-2.png" />
    <meta property="fc:frame:button:1" content="View Transaction result" />
    <meta property="fc:frame:button:1:action" content="link" />
    <meta property="fc:frame:button:1:target" content="${redirect}${txHash}" />
   </head></html>`);
}






