import { NEXT_PUBLIC_URL } from "@/app/config";
import { parseFrameRequest } from "../../lib/farcaster";
import { FrameRequest, getFrameHtmlResponse } from "@coinbase/onchainkit";
import { NextRequest, NextResponse } from "next/server";
import {
  bundlerActions,
  createSmartAccountClient,
  walletClientToSmartAccountSigner,
  providerToSmartAccountSigner,
} from "permissionless";
import { signerToSafeSmartAccount } from "permissionless/accounts";
import { pimlicoBundlerActions } from "permissionless/actions/pimlico";
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico";
import { createWalletClient, createPublicClient, http, custom } from "viem";
import { sepolia } from "viem/chains";

const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY!;
const paymasterUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${apiKey}`;
const bundlerUrl = `https://api.pimlico.io/v1/sepolia/rpc?apikey=${apiKey}`;
const smartAccountSigner = await providerToSmartAccountSigner(
  (window as any).ethereum
);

const publicClient = createPublicClient({
  transport: http("https://rpc.ankr.com/eth_sepolia"),
});

const paymasterClient = createPimlicoPaymasterClient({
  transport: http(paymasterUrl),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body: FrameRequest = await req.json();
  const fid = process.env.NEXT_PUBLIC_MYFID;

  if (!fid) {
    return new NextResponse("Invalid Frame id", { status: 400 });
  }

  // send transaction
  const safeAccount = await signerToSafeSmartAccount(publicClient, {
    entryPoint: "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789",
    signer: smartAccountSigner,
    safeVersion: "1.4.1",
  });

  const smartAccountClient = createSmartAccountClient({
    account: safeAccount, // Add the 'safeAccount' property
    chain: sepolia,
    transport: http(bundlerUrl),
    sponsorUserOperation: paymasterClient.sponsorUserOperation,
  })
    .extend(bundlerActions)
    .extend(pimlicoBundlerActions);

  const gasPrices = await smartAccountClient.getUserOperationGasPrice();

  const txHash = await smartAccountClient.sendTransaction({
    to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    value: parseEther("0.1"),
    maxFeePerGas: gasPrices.fast.maxFeePerGas, // if using Pimlico
    maxPriorityFeePerGas: gasPrices.fast.maxPriorityFeePerGas, // if using Pimlico
  });

  return new NextResponse(`<!DOCTYPE html><html><head>
    <title>Account created</title>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${NEXT_PUBLIC_URL}/api/og?address=${safeAccount.address}&fid=${fid}&userOpHash=${userOpHash}" />
    <meta property="fc:frame:button:1" content="View Smart Account" />
    <meta property="fc:frame:button:1:action" content="link" />
    <meta property="fc:frame:button:1:target" content="https://sepolia.etherscan.io/address/${safeAccount.address}" />
    <meta property="fc:frame:button:2" content="Buy Ape" />
    <meta property="fc:frame:button:2:action" content="post" />
    <meta property="fc:frame:post_url" content="${NEXT_PUBLIC_URL}/api/swap" />
  </head></html>`);
}

export const dynamic = "force-dynamic";
function parseEther(arg0: string): bigint | undefined {
    throw new Error("Function not implemented.");
}

