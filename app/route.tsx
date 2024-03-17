import { NextResponse } from 'next/server';
import { createFrame } from './lib/farcaster';
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const network = searchParams.get('network');
    return new NextResponse(createFrame('main.png', 'Create / Retrieve your Smart Account', `api/account/${network}/${address}`));
}