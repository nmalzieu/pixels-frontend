import { useContract } from "@starknet-react/core";
import { Abi } from "starknet";

import rtwrkDrawerABI from "./rtwrk_drawer_abi.json";

export const useRtwrkDrawerContract = () => {
  return useContract({
    abi: rtwrkDrawerABI as Abi,
    address: process.env.NEXT_PUBLIC_RTWRK_DRAWER_ADDRESS,
  });
};
