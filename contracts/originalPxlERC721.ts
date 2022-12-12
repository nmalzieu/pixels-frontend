import { useContract } from "@starknet-react/core";
import { Abi } from "starknet";

import originalPixelErc721ABI from "./original_pxl_erc721_abi.json";

export const useOriginalPxlERC721Contract = () => {
  return useContract({
    abi: originalPixelErc721ABI as Abi,
    address: process.env.NEXT_PUBLIC_ORIGINAL_PXL_ERC721_ADDRESS,
  });
};
