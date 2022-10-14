import { useStarknetCall } from "@starknet-react/core";
import type { NextPage } from "next";
import { useRef } from "react";

import ConnectToStarknet from "../components/connectToStarknet";
import { useInvoke } from "../contracts/helpers";
import { usePxlERC721Contract } from "../contracts/pxlERC721";
import { useRtwrkDrawerContract } from "../contracts/rtwrkDrawer";
import { useRtwrkERC721Contract } from "../contracts/rtwrkERC721";
import { useRtwrkThemeAuctionContract } from "../contracts/rtwrkThemeAuction";
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
  const { contract: rtwrkERC721Contract } = useRtwrkERC721Contract();
  const { contract: rtwrkThemeAuctionContract } =
    useRtwrkThemeAuctionContract();

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

  const { data: auctionAddressOnDrawerData } = useStarknetCall({
    contract: rtwrkDrawerContract,
    method: "rtwrkThemeAuctionContractAddress",
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

  const { data: currentAuctionIdData } = useStarknetCall({
    contract: rtwrkThemeAuctionContract,
    method: "currentAuctionId",
    args: [],
    options: {
      blockIdentifier: "latest",
    },
  });

  const { data: currentAuctionTimestampData } = useStarknetCall({
    contract: rtwrkThemeAuctionContract,
    method: "auctionTimestamp",
    args: [currentAuctionIdData ? currentAuctionIdData[0].toNumber() : ""],
    options: {
      blockIdentifier: "latest",
    },
  });

  const { invoke: setAuctionAddressOnDrawer } = useInvoke({
    contract: rtwrkDrawerContract,
    method: "setRtwrkThemeAuctionContractAddress",
  });

  const { invoke: setAuctionAddressOnRtwrkERC721 } = useInvoke({
    contract: rtwrkERC721Contract,
    method: "setRtwrkThemeAuctionContractAddress",
  });

  const { data: auctionAddressOnRtwrkERC721Data } = useStarknetCall({
    contract: rtwrkERC721Contract,
    method: "rtwrkThemeAuctionContractAddress",
    args: [],
  });

  const auctionAddressOnDrawerRef = useRef(null);
  const auctionAddressOnERC721Ref = useRef(null);

  return (
    <div>
      <h1>Admin</h1>
      <ConnectToStarknet connectButton="Connect to Starknet" />
      <div>
        <h2>PxlERC721</h2>
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
        <h2>RtwrkDrawer</h2>
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
          <li>
            auctionAddressOnDrawer :{" "}
            {auctionAddressOnDrawerData
              ? `0x${auctionAddressOnDrawerData[0].toString(16)}`
              : "loading..."}
          </li>
          <div>
            <input
              defaultValue={rtwrkThemeAuctionContract?.address}
              placeholder="rtwrk_theme_auction_proxy_address"
              ref={auctionAddressOnDrawerRef}
            />
            <button
              onClick={() => {
                const value = (auctionAddressOnDrawerRef?.current as any)
                  ?.value;
                setAuctionAddressOnDrawer({ args: [value] });
              }}
            >
              Update Auction Address on Drawer
            </button>
          </div>
        </ul>
      </div>
      <div>
        <h2>ThemeAuction</h2>
        <ul>
          <li>address : {rtwrkThemeAuctionContract?.address}</li>
          <li>
            currentAuctionId (latest):{" "}
            {currentAuctionIdData
              ? currentAuctionIdData[0].toNumber()
              : "loading..."}
          </li>
          <li>
            currentAuctionTimestampData (latest) :{" "}
            {currentAuctionTimestampData && currentAuctionIdData
              ? currentAuctionTimestampData[0].toNumber()
              : "loading..."}
          </li>
        </ul>
      </div>
      <div>
        <h2>RtwrkERC721</h2>
        <ul>
          <li>address : {rtwrkERC721Contract?.address}</li>
          <li>
            auctionAddressOnRtwrkERC721 :{" "}
            {auctionAddressOnRtwrkERC721Data
              ? `0x${auctionAddressOnRtwrkERC721Data[0].toString(16)}`
              : "loading..."}
          </li>
        </ul>
        <div>
          <input
            defaultValue={rtwrkThemeAuctionContract?.address}
            placeholder="rtwrk_theme_auction_proxy_address"
            ref={auctionAddressOnERC721Ref}
          />
          <button
            onClick={() => {
              const value = (auctionAddressOnERC721Ref?.current as any)?.value;
              setAuctionAddressOnRtwrkERC721({ args: [value] });
            }}
          >
            Update Auction Address on Rtwrk ERC721
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
