import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sniperRules } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = (searchParams.get('wallet') || 'guest').toLowerCase();

  const rows = await db
    .select()
    .from(sniperRules)
    .where(eq(sniperRules.walletAddress, wallet))
    .orderBy(desc(sniperRules.createdAt));

  return NextResponse.json({ rules: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  const wallet = (body.walletAddress || 'guest').toLowerCase();

  const [created] = await db
    .insert(sniperRules)
    .values({
      id: body.id || `rule-${Date.now()}`,
      walletAddress: wallet,
      name: body.name,
      rawPrompt: body.rawPrompt,
      pairAsset: body.pairAsset,
      maxMcapUsd: body.maxMcapUsd,
      minLiquidityUsd: body.minLiquidityUsd,
      maxTop10HoldersPct: body.maxTop10HoldersPct,
      buyAmountEth: body.buyAmountEth,
      takeProfitMultiplier: body.takeProfitMultiplier,
      stopLossPct: body.stopLossPct,
      active: true,
    })
    .returning();

  return NextResponse.json({ rule: created }, { status: 201 });
}

export async function PATCH(req: Request) {
  const { id, active, walletAddress } = await req.json();
  const wallet = (walletAddress || 'guest').toLowerCase();

  const [updated] = await db
    .update(sniperRules)
    .set({ active })
    .where(and(eq(sniperRules.id, id), eq(sniperRules.walletAddress, wallet)))
    .returning();

  return NextResponse.json({ rule: updated });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const wallet = (searchParams.get('wallet') || 'guest').toLowerCase();

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await db
    .delete(sniperRules)
    .where(and(eq(sniperRules.id, id), eq(sniperRules.walletAddress, wallet)));

  return NextResponse.json({ ok: true });
}
