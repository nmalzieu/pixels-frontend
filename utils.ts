import { useEffect, useRef } from "react";
import { uint256 } from "starknet";
import { toBN, toHex } from "starknet/dist/utils/number";
import {
  decodeShortString,
  encodeShortString,
} from "starknet/dist/utils/shortString";

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

// export const useStarknetNetwork = () => {
//   const { library } = useStarknet();
//   try {
//     const baseUrl =
//       (library as any).baseUrl || (library as any).provider?.baseUrl;
//     const nodeUrl = (library as any).provider?.nodeUrl;
//     console.log({baseUrl, nodeUrl});
//     if (
//       baseUrl.includes(
//         "alpha-mainnet.starknet.io" || nodeUrl.includes("starknet-mainnet")
//       )
//     ) {
//       return "mainnet";
//     } else if (
//       baseUrl.includes("alpha4.starknet.io") ||
//       nodeUrl.includes("starknet-testnet")
//     ) {
//       return "goerli";
//     } else if (baseUrl.match(/^https?:\/\/localhost.*/)) {
//       return "localhost";
//     }
//   } catch {}
// };

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

export const strToFeltArray = (str: string): string[] => {
  const feltStrings = str.match(/.{1,31}/g);
  if (!feltStrings) return [];
  const felts = feltStrings.map((s) => toBN(encodeShortString(s)).toString());
  return felts;
};

export const getExecuteParameterFromTheme = (theme: string): string[] => {
  const feltArray = [];
  try {
    for (const letter of theme) {
      feltArray.push(toBN(encodeShortString(letter)).toString());
    }
  } catch (e) {
    // console.error(e);
  }
  return [feltArray.length.toString(), ...feltArray];
};

export const shortAddress = (address: string) => {
  const addressWith0x = address.slice(0, 2) === "0x" ? address : `0x${address}`;
  return `${addressWith0x.slice(0, 6)}...${address.slice(
    address.length - 3,
    address.length
  )}`;
};

export const usePrevious = (value: any) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

export const useHasChanged = (value: any, callback: any) => {
  const previous = usePrevious(value);
  const hasChanged = previous !== value;

  useEffect(() => {
    if (hasChanged) {
      callback && callback(previous);
    }
  }, [callback, hasChanged, previous]);
  return [hasChanged, previous];
};

export const capitalizeFirstLetter = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};
