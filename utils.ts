import { useStarknet } from "@starknet-react/core";
import { uint256 } from "starknet";
import { toBN, toHex } from "starknet/dist/utils/number";
import { decodeShortString } from "starknet/dist/utils/shortString";

export const getAddressFromBN = (bn: any) => {
  const hexString = bn.toString(16);
  const prefix = "0".repeat(64 - hexString.length);
  return `0x${prefix}${hexString}`;
};

export const getNumberFromUint = (uint: any) => {
  return uint256.uint256ToBN(uint).toNumber();
};

export const getUintFromNumber = (num: any) => {
  return uint256.bnToUint256(num);
};

export const useStarknetNetwork = () => {
  const { account, library } = useStarknet();
  if (!account) {
    return;
  }
  try {
    const { baseUrl } = library;
    if (baseUrl.includes("alpha-mainnet.starknet.io")) {
      return "mainnet";
    } else if (baseUrl.includes("alpha4.starknet.io")) {
      return "goerli";
    } else if (baseUrl.match(/^https?:\/\/localhost.*/)) {
      return "localhost";
    }
  } catch {}
};

const componentToHex = (c: number): string => {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

export const feltArrayToStr = (feltArray: number[]) => {
  return feltArray.map((n: number) => {
    if (n === 0) {
      return "";
    }
    return decodeShortString(toHex(toBN(n)));
  });
};
