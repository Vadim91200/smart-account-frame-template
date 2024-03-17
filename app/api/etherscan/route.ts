import { FrameRequest } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { parseFrameRequest } from '@lib/farcaster';
import { getAccount } from '@lib/mongodb';

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

async function getResponse(req: NextRequest): Promise<NextResponse> {
    const body: FrameRequest = await req.json();
    const fid = await getFid(req);
    if (!fid) {
        return new NextResponse("Invalid request", { status: 400 });
    }

    const user_account = await getAccount(fid);
    const userPublicKey = user_account?.account?.publicKey;

    return NextResponse.redirect(
        `https://sepolia.etherscan.io/address/${userPublicKey}`,
        { status: 302 },
    );
}

export async function POST(req: NextRequest): Promise<Response> {
    return getResponse(req);
}

export const dynamic = 'force-dynamic';