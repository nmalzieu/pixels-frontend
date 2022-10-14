import { useContract } from "@starknet-react/core";
import { Abi } from "starknet";

import erc20ABI from "./erc20_abi.json";

export const useEthERC20Contract = () => {
  return useContract({
    abi: erc20ABI as Abi,
    address: process.env.NEXT_PUBLIC_ETH_ERC20_ADDRESS,
  });
};
