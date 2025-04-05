import {z} from "zod";
import type {Action} from "solana-agent-kit";

export const topListPools: Action = {
  name: "FETCH_TOP_LIST_LIQUIDITY_POOLS",
  description: "Fetch the top list of liquidity pools in Orca for order by highest APY",
  similes: [
    "fetch top list of liquidity pools",
    "fetch top list of orca pools",
    "I want to see the top list of liquidity pools",
  ],
  examples: [],
  schema: z.object({}),
  handler: async (agent) => {
    if (!agent.config.COINGECKO_PRO_API_KEY) {
      throw new Error("No CoinGecko Pro API key provided");
    }

    const response = await fetch(`https://pro-api.coingecko.com/api/v3/onchain/networks/solana/dexes/orca/pools?sort=h24_volume_usd_desc`, {
      headers: {
        'x-cg-pro-api-key': agent.config.COINGECKO_PRO_API_KEY,
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const { data } = await response.json();
    return data.slice(0, 5);
  },
};
