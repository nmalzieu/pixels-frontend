import { useContract } from "@starknet-react/core";
import { Abi } from "starknet";

import rtwrkThemeAuctionABI from "./rtwrk_theme_auction_abi.json";

export const useRtwrkThemeAuctionContract = () => {
  return useContract({
    abi: rtwrkThemeAuctionABI as Abi,
    address: process.env.NEXT_PUBLIC_RTWRK_THEME_AUCTION_ADDRESS,
  });
};
