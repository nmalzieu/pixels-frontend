import {
  useStarknet,
  useStarknetCall,
  useStarknetInvoke,
} from "@starknet-react/core";
import { uint256 } from "starknet";
import type { NextPage } from "next";
import { usePixelERC721Contract } from "../contracts/pixelERC721";
import { usePixelDrawerContract } from "../contracts/pixelDrawer";
import GridComponent from "../components/grid";
import ConnectToStarknet from "../components/connectToStarknet";
import moment from "moment-timezone";

const Grid: NextPage = () => {
  const { account } = useStarknet();
  const { contract: pixelERC721Contract } = usePixelERC721Contract();
  const { contract: pixelDrawerContract } = usePixelDrawerContract();

  const { data: pixelsOfOwnerData } = useStarknetCall({
    contract: pixelERC721Contract,
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

  const { data: currentDrawingTimestampData } = useStarknetCall({
    contract: pixelDrawerContract,
    method: "currentDrawingTimestamp",
    args: [],
  });

  const { invoke: launchNewRound } = useStarknetInvoke({
    contract: pixelDrawerContract,
    method: "launchNewRoundIfNecessary",
  });

  if (!account) {
    return <ConnectToStarknet />;
  }

  if (
    !matrixSizeData ||
    !currentDrawingRoundData ||
    !pixelsOfOwnerData ||
    !currentDrawingTimestampData
  ) {
    return <div>Loading...</div>;
  }

  const matrixSize = uint256.uint256ToBN(matrixSizeData?.[0]).toNumber();
  const round = currentDrawingRoundData[0].toNumber();
  const pixelsOwned = pixelsOfOwnerData[0].map((p: any) => p.toNumber());
  const currentDrawingTimestamp = currentDrawingTimestampData[0].toNumber();

  const now = moment();
  const beginningOfDrawing = moment.unix(currentDrawingTimestamp);

  const diff = now.diff(beginningOfDrawing, "days");

  if (round == 0) {
    return <div>An admin needs to start the contract</div>;
  }

  if (diff >= 1) {
    return (
      <div>
        Please{" "}
        <button
          onClick={() =>
            launchNewRound({
              args: [],
            })
          }
        >
          Launch new round
        </button>
      </div>
    );
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
