import { NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';
import crypto from 'crypto';
import fetch from 'node-fetch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function sendSlack(text: string) {
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
}

function hash(text: string) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = 'https://nextjs.org/docs';
  const res = await fetch(url);
  const html = await res.text();
  const newHash = hash(html);

  const oldHash = await get('last_docs_hash');
  if (newHash !== oldHash) {
    await sendSlack(`🔔 Next.js docs updated! See here: ${url}`);
    await fetch(
      `https://api.vercel.com/v2/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: [{ key: 'last_docs_hash', value: newHash }] }),
      }
    );
  }

  return NextResponse.json({ ok: true });
}
