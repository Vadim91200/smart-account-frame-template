import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { NEXT_PUBLIC_URL } from './config';
import { NextRequest, NextResponse } from 'next/server';
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
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const network = searchParams.get('network');
    return new NextResponse(createFrame('main.png', 'Deploy Smart Account', `api/account/${network}/${address}`));
}
export const dynamic = 'force-dynamic';