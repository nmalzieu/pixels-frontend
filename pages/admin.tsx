import {
  useStarknet,
  useStarknetCall,
  useStarknetInvoke,
} from "@starknet-react/core";
import type { NextPage } from "next";
import { useState } from "react";
import ConnectToStarknet from "../components/connectToStarknet";
import { usePixelERC721Contract } from "../contracts/pixelERC721";
import { usePixelDrawerContract } from "../contracts/pixelDrawer";
import { getAddressFromBN, getNumberFromUint } from "../utils";

const Admin: NextPage = () => {
  const { account } = useStarknet();
  const [pixelDrawerAddress, setPixelDrawerAddress] = useState("");
  const { contract: pixelERC721Contract } = usePixelERC721Contract();
  const { contract: pixelDrawerContract } = usePixelDrawerContract();

  const { data: erc721OwnerData } = useStarknetCall({
    contract: pixelERC721Contract,
    method: "owner",
    args: [],
  });

  const { data: pixelDrawerAddressData } = useStarknetCall({
    contract: pixelERC721Contract,
    method: "pixelDrawerAddress",
    args: [],
  });

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

  const { invoke: initializeERC721 } = useStarknetInvoke({
    contract: pixelERC721Contract,
    method: "initialize",
  });

  // const { data: drawerOwnerData } = useStarknetCall({
  //   contract: pixelDrawerContract,
  //   method: "owner",
  //   args: [],
  // });

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

  const { invoke: startDrawing } = useStarknetInvoke({
    contract: pixelDrawerContract,
    method: "start",
  });

  if (!account) {
    return <ConnectToStarknet />;
  }

  return (
    <div>
      <h1>Admin</h1>
      <div>
        <h2>PixelERC721</h2>
        <ul>
          <li>address : {pixelERC721Contract?.address}</li>
          <li>
            owner :{" "}
            {erc721OwnerData
              ? getAddressFromBN(erc721OwnerData[0])
              : "loading..."}
          </li>
          <li>
            pixelDrawerAddress :{" "}
            {pixelDrawerAddressData
              ? getAddressFromBN(pixelDrawerAddressData[0])
              : "loading..."}
          </li>
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
        </ul>
        {pixelDrawerAddressData &&
          getAddressFromBN(pixelDrawerAddressData[0]) ===
            "0x0000000000000000000000000000000000000000000000000000000000000000" && (
            <div>
              <input onChange={(e) => setPixelDrawerAddress(e.target.value)} />
              <button
                onClick={() =>
                  initializeERC721({
                    args: [pixelDrawerAddress],
                  })
                }
              >
                Set pixel drawer address
              </button>
            </div>
          )}
      </div>
      <div>
        <h2>PixelDrawer</h2>
        <ul>
          <li>address : {pixelDrawerContract?.address}</li>
          {/* <li>
            owner :{" "}
            {drawerOwnerData
              ? getAddressFromBN(drawerOwnerData[0])
              : "loading..."}
          </li> */}
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
          {currentDrawingRoundData &&
            currentDrawingRoundData[0].toNumber() == 0 && (
              <button
                onClick={() =>
                  startDrawing({
                    args: [],
                  })
                }
              >
                Start drawing
              </button>
            )}
        </ul>
      </div>
    </div>
  );
};

export default Admin;
