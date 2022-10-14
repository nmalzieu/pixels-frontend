import { useContract } from "@starknet-react/core";
import { Abi } from "starknet";

import pixelErc721ABI from "./pxl_erc721_abi.json";

export const usePxlERC721Contract = () => {
  return useContract({
    abi: pixelErc721ABI as Abi,
    address: process.env.NEXT_PUBLIC_PXL_ERC721_ADDRESS,
  });
};
