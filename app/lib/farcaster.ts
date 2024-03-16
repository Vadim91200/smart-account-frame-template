import { FrameRequest } from "@coinbase/onchainkit";
import { createPublicClient, getContract, http } from "viem";
import { optimism } from "viem/chains";
import { getSSLHubRpcClient, Message } from '@farcaster/hub-nodejs';

export const FRAME_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://privy-frames-demo.vercel.app';
const ID_REGISTRY_CONTRACT_ADDRESS: `0x${string}` = '0x00000000fc6c5f01fc30151999387bb99a9f489b'; // Optimism Mainnet
const ZERO_ADDRESS: `0x${string}` = '0x0000000000000000000000000000000000000000';
const HUB_URL = 'nemes.farcaster.xyz:2283';

export const parseFrameRequest = async (request: FrameRequest) => {
    const hub = getSSLHubRpcClient(HUB_URL);
    let fid: number | undefined;
    let isValid: boolean = true;

    try {
        const decodedMessage = Message.decode(
            Buffer.from(request.trustedData.messageBytes, "hex")
        );
        const result = await hub.validateMessage(decodedMessage);
        if (!result.isOk() || !result.value.valid || !result.value.message) {
            isValid = false;
            console.log("this is the false result", result);
        } else {
            fid = result.value.message.data?.fid;
            console.log("this is the good result", result);
        }
    } catch (error) {
        console.error("this is the error", error)
    }

    return {fid: fid, isValid: isValid};
}