/**
 * OpenAI API Service
 * Provides AI-powered cryptocurrency investment recommendations.
 * Uses the OpenAI SDK directly in the browser (frontend-only pattern).
 */

import OpenAI from 'openai';
import type { AIRequestPayload } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

/** AI recommendation response structure */
interface AIResponse {
  decision: 'BUY' | 'DO NOT BUY';
  confidence: number;
  explanation: string;
}

/** Calculate volume to market cap ratio (liquidity indicator) */
function getVolumeToCapRatio(volume: number, marketCap: number): string {
  const ratio = (volume / marketCap) * 100;
  if (ratio > 10) return `${ratio.toFixed(1)}% (Very High liquidity)`;
  if (ratio > 5) return `${ratio.toFixed(1)}% (High liquidity)`;
  if (ratio > 2) return `${ratio.toFixed(1)}% (Moderate liquidity)`;
  return `${ratio.toFixed(1)}% (Low liquidity)`;
}

/** Determine trend direction from price changes */
function getTrendAnalysis(p30: number | null, p60: number | null, p200: number | null): string {
  if (p30 === null) return 'Insufficient data for trend analysis';
  
  const trends: string[] = [];
  
  if (p30 > 0) trends.push('Short-term uptrend (30d)');
  else trends.push('Short-term downtrend (30d)');
  
  if (p60 !== null) {
    if (p60 > 0 && p30 > p60) trends.push('accelerating momentum');
    else if (p60 > 0 && p30 < p60) trends.push('slowing momentum');
    else if (p60 < 0 && p30 > p60) trends.push('recovering from decline');
  }
  
  if (p200 !== null) {
    if (p200 > 50) trends.push('strong long-term performance');
    else if (p200 < -50) trends.push('significant long-term decline');
  }
  
  return trends.join(', ');
}

/**
 * Constructs an enhanced AI prompt with technical analysis context.
 */
function buildPrompt(payload: AIRequestPayload): string {
  const volumeRatio = getVolumeToCapRatio(payload.volume_24h_usd, payload.market_cap_usd);
  const trendAnalysis = getTrendAnalysis(
    payload.price_change_percentage_30d_in_currency,
    payload.price_change_percentage_60d_in_currency,
    payload.price_change_percentage_200d_in_currency
  );

  return `Analyze this cryptocurrency and provide an investment recommendation.

## Market Data for ${payload.name}

| Metric | Value |
|--------|-------|
| Current Price | $${payload.current_price_usd.toLocaleString()} |
| Market Cap | $${payload.market_cap_usd.toLocaleString()} |
| 24h Volume | $${payload.volume_24h_usd.toLocaleString()} |
| Volume/MCap Ratio | ${volumeRatio} |
| 30-day Change | ${payload.price_change_percentage_30d_in_currency !== null ? `${payload.price_change_percentage_30d_in_currency.toFixed(2)}%` : 'N/A'} |
| 60-day Change | ${payload.price_change_percentage_60d_in_currency !== null ? `${payload.price_change_percentage_60d_in_currency.toFixed(2)}%` : 'N/A'} |
| 200-day Change | ${payload.price_change_percentage_200d_in_currency !== null ? `${payload.price_change_percentage_200d_in_currency.toFixed(2)}%` : 'N/A'} |

## Pre-Analysis
- Trend: ${trendAnalysis}
- Market Cap Tier: ${payload.market_cap_usd > 10e9 ? 'Large Cap (>$10B)' : payload.market_cap_usd > 1e9 ? 'Mid Cap ($1B-$10B)' : 'Small Cap (<$1B)'}

## Your Task
Evaluate using these criteria:
1. **Momentum**: Are price trends positive across timeframes?
2. **Liquidity**: Is volume healthy relative to market cap?
3. **Risk Level**: Consider market cap size and volatility
4. **Entry Timing**: Is current price favorable based on recent movements?

Respond with JSON only:
{
  "decision": "BUY" | "DO NOT BUY",
  "confidence": <number 1-100>,
  "explanation": "<2-3 sentences with specific reasoning>"
}`;
}

/**
 * Fetches an AI-powered buy/sell recommendation for a cryptocurrency.
 * Uses technical analysis criteria for more informed suggestions.
 */
export const getAIRecommendation = async (
  payload: AIRequestPayload
): Promise<AIResponse> => {
  const prompt = buildPrompt(payload);

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `You are a cryptocurrency technical analyst. Provide objective, data-driven recommendations.
Recommend BUY for positive momentum and favorable conditions, DO NOT BUY for negative trends, high risk, or uncertain signals.
Always respond with valid JSON only. No markdown, no extra text.`,
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.4,
    max_tokens: 300,
  });

  const content = completion.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  try {
    const parsed = JSON.parse(content) as AIResponse;
    
    // Validate and normalize response
    if (!parsed.decision || !parsed.explanation) {
      throw new Error('Invalid response structure');
    }
    
    // Normalize decision to BUY or DO NOT BUY
    const upperDecision = parsed.decision.toUpperCase();
    if (upperDecision.includes('BUY') && !upperDecision.includes('DO NOT') && !upperDecision.includes('NOT')) {
      parsed.decision = 'BUY';
    } else {
      parsed.decision = 'DO NOT BUY';
    }
    
    // Ensure confidence is valid
    parsed.confidence = Math.min(100, Math.max(1, parsed.confidence || 50));
    
    return parsed;
  } catch {
    // Fallback parsing
    const lowerContent = content.toLowerCase();
    const isBuy = lowerContent.includes('buy') && !lowerContent.includes('do not') && !lowerContent.includes("don't");
    
    return {
      decision: isBuy ? 'BUY' : 'DO NOT BUY',
      confidence: 50,
      explanation: content.substring(0, 400),
    };
  }
};

// Kept for compatibility if used elsewhere
export const buildAIPrompt = buildPrompt;
