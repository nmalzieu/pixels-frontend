import { useContract } from "@starknet-react/core";
import { Abi } from "starknet";

import pixelDrawerABI from "./pixel_drawer_abi.json";

export const usePixelDrawerContract = () => {
  return useContract({
    abi: pixelDrawerABI as Abi,
    address:
      process.env.NEXT_PUBLIC_PIXEL_DRAWER_ADDRESS,
  });
};

