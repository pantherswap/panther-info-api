import { client } from "./apollo/exchange/client";
import { CURRENT_GLOBAL_DATA, GLOBAL_DATA } from "./apollo/exchange/queries";
import { getBlockFromTimestamp } from "./blocks/queries";
import {
  CurrentUniswapFactoriesQuery,
  CurrentUniswapFactoriesQueryVariables,
  UniswapFactoriesQuery,
  UniswapFactoriesQueryVariables,
} from "./generated/exchange/subgraph";

export type GlobalData = {
  total_liquidity_BNB: string;
  total_liquidity_USD: string;
  total_volume_BNB: string;
  total_volume_USD: string;
  volume_BNB: string;
  volume_USD: string;
  tx_count: number;
};
export const FACTORY_ADDRESS = "0x670f55c6284c629c23baE99F585e3f17E8b9FC31";
export const SKIP_BLOCKS = 200;
export const BLOCK_TIME = 3;

export async function getGlobalData(): Promise<GlobalData> {
  const epochSecond = Math.round(new Date().getTime() / 1000);
  const oneDayAgoBlock = await getBlockFromTimestamp(
    epochSecond - 86400 - SKIP_BLOCKS * BLOCK_TIME
  );

  if (!oneDayAgoBlock) {
    throw new Error("Failed to fetch blocks from the subgraph");
  }

  const { data: currentResult, errors: currentResultErrors } = await client.query<
    CurrentUniswapFactoriesQuery,
    CurrentUniswapFactoriesQueryVariables
  >({
    query: CURRENT_GLOBAL_DATA,
    variables: {
      factoryAddress: FACTORY_ADDRESS,
    },
    fetchPolicy: "cache-first",
  });

  const { data: oneDayAgoResult, errors: oneDayAgoResultErrors } = await client.query<
    UniswapFactoriesQuery,
    UniswapFactoriesQueryVariables
  >({
    query: GLOBAL_DATA,
    variables: {
      factoryAddress: FACTORY_ADDRESS,
      blockNumber: +oneDayAgoBlock,
    },
    fetchPolicy: "cache-first",
  });

  if (!currentResult.uniswapFactories[0] || !oneDayAgoResult.uniswapFactories[0]) {
    throw new Error("Failed to fetch uniswap factories from subgraph");
  }

  const currentData = currentResult.uniswapFactories[0];
  const oneDayAgoData = oneDayAgoResult.uniswapFactories[0];

  const oneDayVolumeBNB =
    parseFloat(currentData.totalVolumeETH) - parseFloat(oneDayAgoData.totalVolumeETH);
  const oneDayVolumeUSD =
    parseFloat(currentData.totalVolumeUSD) - parseFloat(oneDayAgoData.totalVolumeUSD);
  const oneDayTxCount = parseInt(currentData.txCount) - parseInt(oneDayAgoData.txCount);

  // return data
  let data = <GlobalData>{};
  data.total_liquidity_BNB = currentData.totalLiquidityETH;
  data.total_liquidity_USD = currentData.totalLiquidityUSD;
  data.total_volume_BNB = currentData.totalVolumeETH;
  data.total_volume_USD = currentData.totalVolumeUSD;
  data.volume_BNB = oneDayVolumeBNB.toString();
  data.volume_USD = oneDayVolumeUSD.toString();
  data.tx_count = oneDayTxCount;

  return data;
}
