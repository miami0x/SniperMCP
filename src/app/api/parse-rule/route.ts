import { NextRequest, NextResponse } from 'next/server';
import { ParsedRuleSchema, type ParsedRuleInput } from '@/lib/ai/ruleSchema';

function localFallbackParser(prompt: string): ParsedRuleInput {
  const upper = prompt.toUpperCase();
  const pairAsset = (['TTEQ', 'NVDA', 'META', 'AAPL', 'TSLA', 'WETH'] as const).find((s) =>
    upper.includes(s)
  ) || 'ANY';

  const mcapMatch = prompt.match(/(?:under|below|<|max)\s*\$?(\d+(?:\.\d+)?)\s*([km])?/i);
  let maxMcapUsd = 150_000;
  if (mcapMatch) {
    const val = parseFloat(mcapMatch[1]);
    const unit = (mcapMatch[2] || '').toLowerCase();
    maxMcapUsd = unit === 'm' ? val * 1_000_000 : unit === 'k' ? val * 1_000 : val;
  }

  const holdersMatch = prompt.match(/(?:top\s*10|holders?)\s*(?:under|below|<)?\s*(\d+(?:\.\d+)?)\s*%/i);
  const maxTop10HoldersPct = holdersMatch ? parseFloat(holdersMatch[1]) : 20;

  const tpMatch = prompt.match(/(\d+(?:\.\d+)?)\s*x/i);
  const takeProfitMultiplier = tpMatch ? parseFloat(tpMatch[1]) : 2.0;

  const ethMatch = prompt.match(/(\d+(?:\.\d+)?)\s*eth/i);
  const buyAmountEth = ethMatch ? parseFloat(ethMatch[1]) : 0.05;

  return ParsedRuleSchema.parse({
    name: `${pairAsset === 'ANY' ? 'Trench' : `$${pairAsset}`} Sniper <$${Math.round(maxMcapUsd / 1000)}K`,
    pairAsset,
    maxMcapUsd,
    minLiquidityUsd: 10_000,
    maxTop10HoldersPct,
    buyAmountEth,
    takeProfitMultiplier,
    stopLossPct: 35,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) {
      const rule = localFallbackParser(prompt);
      return NextResponse.json({ mode: 'local-parser', rule });
    }

    const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
    const model = process.env.LLM_MODEL || 'gpt-4o-mini';

    const llmRes = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Convert the user trading rule into JSON with keys: name (string), pairAsset ("TTEQ"|"NVDA"|"META"|"AAPL"|"TSLA"|"WETH"|"ANY"), maxMcapUsd (number), minLiquidityUsd (number), maxTop10HoldersPct (number), buyAmountEth (number), takeProfitMultiplier (number), stopLossPct (number). Return ONLY valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!llmRes.ok) {
      return NextResponse.json({ mode: 'local-parser', rule: localFallbackParser(prompt) });
    }

    const json = await llmRes.json();
    const raw = JSON.parse(json.choices?.[0]?.message?.content || '{}');
    const rule = ParsedRuleSchema.parse(raw);

    return NextResponse.json({ mode: 'llm', rule });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to parse rule' }, { status: 500 });
  }
}
