import { useStarknet, useStarknetCall } from "@starknet-react/core";
import { uint256 } from "starknet";
import type { NextPage } from "next";
import { usePixelERC721Contract } from "../contracts/pixelERC721";
import { usePixelDrawerContract } from "../contracts/pixelDrawer";
import GridComponent from "../components/grid";

const Grid: NextPage = () => {
  const { account } = useStarknet();
  const { contract: pixelERC721Contract } = usePixelERC721Contract();
  const { contract: pixelDrawerContract } = usePixelDrawerContract();

  const { data: pixelsOfOwnerData } = useStarknetCall({
    contract: pixelDrawerContract,
    method: "pixelsOfOwner",
    args: [account],
  });

  const { data: matrixSizeData } = useStarknetCall({
    contract: pixelERC721Contract,
    method: "matrixSize",
    args: [],
  });

  const { data: currentDrawingRoundData } = useStarknetCall({
    contract: pixelDrawerContract,
    method: "currentDrawingRound",
    args: [],
  });

  if (!matrixSizeData || !currentDrawingRoundData || !pixelsOfOwnerData) {
    return <div>Loading...</div>;
  }

  const matrixSize = uint256.uint256ToBN(matrixSizeData?.[0]).toNumber();

  const round = currentDrawingRoundData[0].toNumber();

  const pixelsOwned = currentDrawingRoundData[0];

  console.log({ pixelsOwned });

  if (round == 0) {
    return <div>Loading...</div>;
  }

  return (
    <GridComponent
      gridSize={matrixSize}
      round={round}
      pixelsOwned={pixelsOwned}
    />
  );
};

export default Grid;
