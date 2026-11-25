import { NextResponse } from 'next/server';
import { db } from '@/db';
import { positions } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = (searchParams.get('wallet') || 'guest').toLowerCase();

  const rows = await db
    .select()
    .from(positions)
    .where(and(eq(positions.walletAddress, wallet), eq(positions.status, 'open')))
    .orderBy(desc(positions.createdAt));

  return NextResponse.json({ positions: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  const wallet = (body.walletAddress || 'guest').toLowerCase();

  const [created] = await db
    .insert(positions)
    .values({
      id: body.id || `pos-${Date.now()}`,
      walletAddress: wallet,
      tokenAddress: body.tokenAddress,
      symbol: body.symbol,
      quoteSymbol: body.quoteSymbol,
      entryEth: Number(body.entryEth) || 0.05,
      txHash: body.txHash || null,
      status: 'open',
      pnlPct: Number(body.pnlPct) || 0,
    })
    .returning();

  return NextResponse.json({ position: created }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const all = searchParams.get('all');
  const wallet = (searchParams.get('wallet') || 'guest').toLowerCase();

  if (all === 'true') {
    await db
      .update(positions)
      .set({ status: 'closed' })
      .where(eq(positions.walletAddress, wallet));
    return NextResponse.json({ ok: true });
  }

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await db
    .update(positions)
    .set({ status: 'closed' })
    .where(and(eq(positions.id, id), eq(positions.walletAddress, wallet)));

  return NextResponse.json({ ok: true });
}
