import { NEXT_PUBLIC_URL } from '@/app/config';
import { parseFrameRequest } from '../../lib/farcaster';
import { FrameRequest, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { bundlerActions, createSmartAccountClient } from 'permissionless';
import { privateKeyToSafeSmartAccount } from 'permissionless/accounts';
import { pimlicoBundlerActions } from 'permissionless/actions/pimlico';
import { createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';
import { Address, createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';


const eprivateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY!;
const privateKey = '0x' + eprivateKey;
const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY!;
const paymasterUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${apiKey}`
const bundlerUrl = `https://api.pimlico.io/v1/sepolia/rpc?apikey=${apiKey}`

const publicClient = createPublicClient({
	transport: http("https://rpc.ankr.com/eth_sepolia"),
})
 
const paymasterClient = createPimlicoPaymasterClient({
	transport: http(paymasterUrl),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
    const body: FrameRequest = await req.json();
    const fid = process.env.NEXT_PUBLIC_MYFID;

    if (!fid) {
        return new NextResponse('Invalid Frame id', { status: 400 });
    }

    // send transaction
    const account = await privateKeyToSafeSmartAccount(publicClient, {
        privateKey: privateKey as Address,
        safeVersion: "1.4.1", // simple version
        entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // global entrypoint
        saltNonce: BigInt(fid)
    })

    const smartAccountClient = createSmartAccountClient({
        account,
        chain: sepolia,
        transport: http(bundlerUrl),
        sponsorUserOperation: paymasterClient.sponsorUserOperation,
    })
        .extend(bundlerActions)
        .extend(pimlicoBundlerActions)
        
    const gasPrices = await smartAccountClient.getUserOperationGasPrice()

    const callData = await account.encodeCallData({ 
        to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", 
        data: "0x1234",
        value: BigInt(0) 
    })

    const userOperation = await smartAccountClient.prepareUserOperationRequest({
        userOperation: {
            callData
        },
    })

    userOperation.signature = await account.signUserOperation(userOperation)

    const userOpHash = await smartAccountClient.sendUserOperation({
        userOperation,
        entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
    })

    return new NextResponse(
        getFrameHtmlResponse({
            buttons: [
                {
                    label: `View Smart Account`,
                    action: "post_redirect"
                },
            ],
            image: `${NEXT_PUBLIC_URL}/api/og?address=${account.address}&fid=${fid}&userOpHash=${userOpHash}`,
            post_url: `${NEXT_PUBLIC_URL}/api/etherscan`,
        }),
    );
    


}
  

export const dynamic = 'force-dynamic';