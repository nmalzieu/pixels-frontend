import { useStarknet, useStarknetCall } from "@starknet-react/core";
import type { NextPage } from "next";
import { usePixelERC721Contract } from "../contracts/pixelERC721";
import { usePixelDrawerContract } from "../contracts/pixelDrawer";
import {
  getAddressFromBN,
  getNumberFromUint,
  getUintFromNumber,
} from "../utils";
import { useInvoke } from "../contracts/helpers";
import ConnectToStarknet from "../components/connectToStarknet";
import { useStoreState } from "../store";

const Admin: NextPage = () => {
  const storeState = useStoreState();
  const { account } = useStarknet();
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

  const { data: pixelsOfOwnerData, loading: pixelsOfOwnerLoading } =
    useStarknetCall({
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

  return (
    <div>
      <h1>Admin</h1>
      <ConnectToStarknet />
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
                console.log([storeState.account, 0, pixelsOwned[0], 0]);
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
            <button
              onClick={() =>
                currentDrawingRoundData[0].toNumber() == 0
                  ? startDrawing({
                      args: [],
                    })
                  : launchNewRoundIfNecessary({ args: [] })
              }
            >
              {currentDrawingRoundData[0].toNumber() == 0
                ? "Start drawing"
                : "Launch next round"}
            </button>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Admin;
