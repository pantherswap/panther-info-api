import gql from "graphql-tag";

export const GLOBAL_DATA = gql`
  query uniswapFactories($blockNumber: Int!, $factoryAddress: ID!) {
    uniswapFactories(block: { number: $blockNumber }, where: { id: $factoryAddress }) {
      id
      totalVolumeUSD
      totalVolumeETH
      untrackedVolumeUSD
      totalLiquidityUSD
      totalLiquidityETH
      txCount
      pairCount
    }
  }
`;

export const CURRENT_GLOBAL_DATA = gql`
  query currentUniswapFactories($factoryAddress: ID!) {
    uniswapFactories(where: { id: $factoryAddress }) {
      id
      totalVolumeUSD
      totalVolumeETH
      untrackedVolumeUSD
      totalLiquidityUSD
      totalLiquidityETH
      txCount
      pairCount
    }
  }
`;
