import { useContract } from "@starknet-react/core";
import { Abi } from "starknet";

import pixelDrawer2ABI from "./pixel_drawer_2_abi.json";

export const usePixelDrawer2Contract = () => {
  return useContract({
    abi: pixelDrawer2ABI as Abi,
    address: process.env.NEXT_PUBLIC_PIXEL_DRAWER_ADDRESS_2,
  });
};
