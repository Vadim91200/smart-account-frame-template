import { FrameRequest } from "@coinbase/onchainkit";


const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL;
const ID_REGISTRY_CONTRACT_ADDRESS: `0x${string}` = '0x00000000fc6c5f01fc30151999387bb99a9f489b'; // Optimism Mainnet
const ZERO_ADDRESS: `0x${string}` = '0x0000000000000000000000000000000000000000';
const HUB_URL = 'nemes.farcaster.xyz:2283';
export const createFrame = (imageUrl: string, buttonText: string, apiPath: string, isRedirect = false) => {
    console.log("tout vas bien", imageUrl, buttonText, apiPath, isRedirect);
      return (`
        <!DOCTYPE html>
        <html>
            <head>
            <meta name="fc:frame" content="vNext">
            <meta name="fc:frame:image" content="${NEXT_PUBLIC_URL}/${imageUrl}">
            <meta name="fc:frame:post_url" content="${NEXT_PUBLIC_URL}/${apiPath}">
            <meta name="fc:frame:button:1" content="${buttonText}">
            <meta name="fc:frame:button:1:action" content="${isRedirect ? 'post_redirect' : 'post'}">
            </head>
        </html>`);
  }
/* export const parseFrameRequest = async (request: FrameRequest) => {
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
} */