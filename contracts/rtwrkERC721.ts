import { useContract } from "@starknet-react/core";
import { Abi } from "starknet";

import rtwrkERC721ABI from "./rtwrk_erc721_abi.json";

export const useRtwrkERC721Contract = () => {
  return useContract({
    abi: rtwrkERC721ABI as Abi,
    address: process.env.NEXT_PUBLIC_RTWRK_ERC721_ADDRESS,
  });
};
