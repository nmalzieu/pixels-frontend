import { uint256 } from "starknet";

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
