// Coin from CoinGecko markets endpoint
export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: {
    times: number;
    currency: string;
    percentage: number;
  } | null;
  last_updated: string;
}

// Detailed coin data from CoinGecko
export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  market_data: {
    current_price: {
      usd: number;
      eur: number;
      ils: number;
    };
    market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    price_change_percentage_24h: number;
    price_change_percentage_30d: number;
    price_change_percentage_60d: number;
    price_change_percentage_200d: number;
    price_change_percentage_30d_in_currency?: {
      usd: number;
    };
    price_change_percentage_60d_in_currency?: {
      usd: number;
    };
    price_change_percentage_200d_in_currency?: {
      usd: number;
    };
  };
  description: {
    en: string;
  };
  links: {
    homepage: string[];
    blockchain_site: string[];
  };
}

// Cached coin detail with timestamp
export interface CachedCoinDetail {
  data: CoinDetail;
  timestamp: number;
}

// CryptoCompare price response
export interface CryptoComparePrices {
  [symbol: string]: {
    USD: number;
  };
}

// Price history point for charts
export interface PricePoint {
  timestamp: number;
  price: number;
}

// Price history per coin
export interface PriceHistory {
  [symbol: string]: PricePoint[];
}

// OHLC candlestick (CoinGecko API)
export interface OHLCPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

// AI Recommendation
export interface AIRecommendation {
  coinId: string;
  decision: 'BUY' | 'DO NOT BUY';
  confidence: number;
  explanation: string;
  timestamp: number;
}

// AI Request Payload
export interface AIRequestPayload {
  name: string;
  current_price_usd: number;
  market_cap_usd: number;
  volume_24h_usd: number;
  price_change_percentage_30d_in_currency: number | null;
  price_change_percentage_60d_in_currency: number | null;
  price_change_percentage_200d_in_currency: number | null;
}

// Selected coin for persistence
export interface SelectedCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
}
