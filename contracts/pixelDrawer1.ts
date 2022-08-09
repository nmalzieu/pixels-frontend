import { useContract } from "@starknet-react/core";
import { Abi } from "starknet";

import pixelDrawer1ABI from "./pixel_drawer_1_abi.json";

export const usePixelDrawer1Contract = () => {
  return useContract({
    abi: pixelDrawer1ABI as Abi,
    address: process.env.NEXT_PUBLIC_PIXEL_DRAWER_ADDRESS_1,
  });
};
