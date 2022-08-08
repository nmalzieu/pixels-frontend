import { useStarknetCall } from "@starknet-react/core";
import type { NextPage } from "next";
import { useRef } from "react";

import ConnectToStarknet from "../components/connectToStarknet";
import { useInvoke } from "../contracts/helpers";
import { usePixelDrawerContract } from "../contracts/pixelDrawer";
import { usePixelERC721Contract } from "../contracts/pixelERC721";
import { useStoreState } from "../store";
import {
  getAddressFromBN,
  getNumberFromUint,
  getUintFromNumber,
} from "../utils";

const Admin: NextPage = () => {
  const storeState = useStoreState();
  const { contract: pixelERC721Contract } = usePixelERC721Contract();
  const { contract: pixelDrawerContract } = usePixelDrawerContract();

  const { data: matrixSizeData } = useStarknetCall({
    contract: pixelERC721Contract,
    method: "matrixSize",
    args: [],
  });

  const { data: maxSupplyData } = useStarknetCall({
    contract: pixelERC721Contract,
    method: "maxSupply",
    args: [],
  });

  const { data: totalSupplyData } = useStarknetCall({
    contract: pixelERC721Contract,
    method: "totalSupply",
    args: [],
  });

  const { data: drawerOwnerData } = useStarknetCall({
    contract: pixelDrawerContract,
    method: "owner",
    args: [],
  });

  const { data: pixelsOfOwnerData } = useStarknetCall({
    contract: pixelERC721Contract,
    method: "pixelsOfOwner",
    args: [storeState.account],
  });

  const pixelsOwned = (pixelsOfOwnerData as any)?.pixels?.map((p: any) =>
    p.toNumber()
  );

  const { invoke: transfer } = useInvoke({
    contract: pixelERC721Contract,
    method: "transferFrom",
  });

  const { data: pixelERC721AddressData } = useStarknetCall({
    contract: pixelDrawerContract,
    method: "pixelERC721Address",
    args: [],
  });

  const { data: currentDrawingRoundData } = useStarknetCall({
    contract: pixelDrawerContract,
    method: "currentDrawingRound",
    args: [],
  });

  const { invoke: startDrawing } = useInvoke({
    contract: pixelDrawerContract,
    method: "start",
  });

  const { invoke: launchNewRoundIfNecessary } = useInvoke({
    contract: pixelDrawerContract,
    method: "launchNewRoundIfNecessary",
  });

  const themeRef = useRef(null);

  return (
    <div>
      <h1>Admin</h1>
      <ConnectToStarknet connectButton="Connect to Starknet" />
      <div>
        <h2>PixelERC721</h2>
        <ul>
          <li>address : {pixelERC721Contract?.address}</li>
          <li>
            matrixSize :{" "}
            {matrixSizeData
              ? getNumberFromUint(matrixSizeData?.[0])
              : "loading..."}
          </li>
          <li>
            maxSupply :{" "}
            {maxSupplyData
              ? getNumberFromUint(maxSupplyData?.[0])
              : "loading..."}
          </li>
          <li>
            totalSupply :{" "}
            {totalSupplyData
              ? getNumberFromUint(totalSupplyData?.[0])
              : "loading..."}
          </li>
          <li>
            pxls owned by current user : {pixelsOwned && pixelsOwned.join(",")}
          </li>
          {pixelsOwned && pixelsOwned.length > 0 && (
            <button
              onClick={() => {
                transfer({
                  args: [
                    storeState.account,
                    "0x000000000000000000000000000000000000dead",
                    getUintFromNumber(pixelsOwned[0]),
                  ],
                });
              }}
            >
              Transfer token to 0
            </button>
          )}
        </ul>
      </div>
      <div>
        <h2>PixelDrawer</h2>
        <ul>
          <li>address : {pixelDrawerContract?.address}</li>
          <li>
            owner :{" "}
            {drawerOwnerData
              ? getAddressFromBN(drawerOwnerData[0])
              : "loading..."}
          </li>
          <li>
            pixelERC721Address :{" "}
            {pixelERC721AddressData
              ? getAddressFromBN(pixelERC721AddressData[0])
              : "loading..."}
          </li>

          <li>
            currentDrawingRound :{" "}
            {currentDrawingRoundData
              ? currentDrawingRoundData[0].toNumber()
              : "loading..."}
          </li>
          {currentDrawingRoundData && (
            <div>
              <input placeholder="theme" ref={themeRef} />
              <button
                onClick={() => {
                  const themeValue = (themeRef?.current as any)?.value;
                  const themeArray = themeValue
                    .split(",")
                    .map((s: any) => s.trim());
                  launchNewRoundIfNecessary({ args: [themeArray] });
                }}
              >
                Launch next round
              </button>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Admin;
