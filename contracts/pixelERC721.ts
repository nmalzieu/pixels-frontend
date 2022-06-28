import { useContract } from "@starknet-react/core";
import { Abi } from "starknet";

import pixelErc721ABI from "./pixel_erc721_abi.json";

export const usePixelERC721Contract = () => {
  return useContract({
    abi: pixelErc721ABI as Abi,
    address: process.env.NEXT_PUBLIC_PIXEL_ERC721_ADDRESS,
  });
};
