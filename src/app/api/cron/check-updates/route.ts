import { NextRequest, NextResponse } from 'next/server';
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

async function fetchNextBranches() {
  const res = await fetch('https://api.github.com/repos/vercel/next.js/branches?per_page=10');
  if (!res.ok) throw new Error('Failed to fetch Next.js branches');
  const branches = await res.json();

  return branches.map(branch => {
    return `• Branch: ${branch.name} → ${branch.commit.sha.substring(0, 7)}`;
  }).join('\n');
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const branchesInfo = await fetchNextBranches();
    await sendSlack(`🔔 Latest Next.js Branches:\n${branchesInfo}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}