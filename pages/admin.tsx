import { useStarknetCall } from "@starknet-react/core";
import type { NextPage } from "next";
import { useRef } from "react";

import ConnectToStarknet from "../components/connectToStarknet";
import { useInvoke } from "../contracts/helpers";
import { usePxlERC721Contract } from "../contracts/pxlERC721";
import { useRtwrkDrawerContract } from "../contracts/rtwrkDrawer";
import { useStoreState } from "../store";
import {
  getAddressFromBN,
  getNumberFromUint,
  getUintFromNumber,
} from "../utils";

const Admin: NextPage = () => {
  const storeState = useStoreState();
  const { contract: pxlERC721Contract } = usePxlERC721Contract();
  const { contract: rtwrkDrawerContract } = useRtwrkDrawerContract();

  const { data: matrixSizeData } = useStarknetCall({
    contract: pxlERC721Contract,
    method: "matrixSize",
    args: [],
  });

  const { data: maxSupplyData } = useStarknetCall({
    contract: pxlERC721Contract,
    method: "maxSupply",
    args: [],
  });

  const { data: totalSupplyData } = useStarknetCall({
    contract: pxlERC721Contract,
    method: "totalSupply",
    args: [],
  });

  const { data: drawerOwnerData } = useStarknetCall({
    contract: rtwrkDrawerContract,
    method: "owner",
    args: [],
  });

  const { data: pixelsOfOwnerData } = useStarknetCall({
    contract: pxlERC721Contract,
    method: "pixelsOfOwner",
    args: [storeState.account],
  });

  const pixelsOwned = (pixelsOfOwnerData as any)?.pixels?.map((p: any) =>
    p.toNumber()
  );

  const { invoke: transfer } = useInvoke({
    contract: pxlERC721Contract,
    method: "transferFrom",
  });

  const { data: pxlERC721AddressData } = useStarknetCall({
    contract: rtwrkDrawerContract,
    method: "pxlERC721Address",
    args: [],
  });

  const { data: currentRtwrkIdDataPending } = useStarknetCall({
    contract: rtwrkDrawerContract,
    method: "currentRtwrkId",
    args: [],
    options: {
      blockIdentifier: "pending",
    },
  });

  const { data: currentRtwrkTimestampDataPending } = useStarknetCall({
    contract: rtwrkDrawerContract,
    method: "currentRtwrkTimestamp",
    args: [],
    options: {
      blockIdentifier: "pending",
    },
  });

  const { data: currentRtwrkIdDataLatest } = useStarknetCall({
    contract: rtwrkDrawerContract,
    method: "currentRtwrkId",
    args: [],
    options: {
      blockIdentifier: "latest",
    },
  });

  const { data: currentRtwrkTimestampDataLatest } = useStarknetCall({
    contract: rtwrkDrawerContract,
    method: "currentRtwrkTimestamp",
    args: [],
    options: {
      blockIdentifier: "latest",
    },
  });

  const { invoke: launchNewRtwrkIfNecessary } = useInvoke({
    contract: rtwrkDrawerContract,
    method: "launchNewRtwrkIfNecessary",
  });

  const themeRef = useRef(null);

  return (
    <div>
      <h1>Admin</h1>
      <ConnectToStarknet connectButton="Connect to Starknet" />
      <div>
        <h2>PixelERC721</h2>
        <ul>
          <li>address : {pxlERC721Contract?.address}</li>
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
          <li>address : {rtwrkDrawerContract?.address}</li>
          <li>
            owner :{" "}
            {drawerOwnerData
              ? getAddressFromBN(drawerOwnerData[0])
              : "loading..."}
          </li>
          <li>
            pxlERC721Address :{" "}
            {pxlERC721AddressData
              ? getAddressFromBN(pxlERC721AddressData[0])
              : "loading..."}
          </li>

          <li>
            currentRtwrkId (pending) :{" "}
            {currentRtwrkIdDataPending
              ? currentRtwrkIdDataPending[0].toNumber()
              : "loading..."}
          </li>
          <li>
            currentRtwrkId (latest) :{" "}
            {currentRtwrkIdDataLatest
              ? currentRtwrkIdDataLatest[0].toNumber()
              : "loading..."}
          </li>
          <li>
            currentRtwrkTimestamp (pending) :{" "}
            {currentRtwrkTimestampDataPending
              ? currentRtwrkTimestampDataPending[0].toNumber()
              : "loading..."}
          </li>
          <li>
            currentRtwrkTimestamp (latest) :{" "}
            {currentRtwrkTimestampDataLatest
              ? currentRtwrkTimestampDataLatest[0].toNumber()
              : "loading..."}
          </li>
          {currentRtwrkTimestampDataLatest && (
            <div>
              <input placeholder="theme" ref={themeRef} />
              <button
                onClick={() => {
                  const themeValue = (themeRef?.current as any)?.value;
                  const themeArray = themeValue
                    .split(",")
                    .map((s: any) => s.trim());
                  launchNewRtwrkIfNecessary({ args: [themeArray] });
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
