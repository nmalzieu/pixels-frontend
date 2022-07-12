import { useStarknetCall, useStarknetInvoke } from "@starknet-react/core";
import moment from "moment-timezone";
import { uint256 } from "starknet";

import { usePixelDrawerContract } from "../contracts/pixelDrawer";
import { usePixelERC721Contract } from "../contracts/pixelERC721";
import LogoImage from "../public/logo.svg";
import { useStoreState } from "../store";
import styles from "../styles/GridPage.module.scss";
import GridComponent from "./grid";
import TopNav from "./topNav";
import Window from "./window";

const DoubleSeparator = () => <div className={styles.doubleSeparator}></div>;

const GridPage = () => {
  const state = useStoreState();
  const { contract: pixelERC721Contract } = usePixelERC721Contract();
  const { contract: pixelDrawerContract } = usePixelDrawerContract();

  const { data: pixelsOfOwnerData, loading: pixelsOfOwnerLoading } =
    useStarknetCall({
      contract: pixelERC721Contract,
      method: "pixelsOfOwner",
      args: [state.account],
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

  let gridComponent = <div>LOADING GRID PAGE</div>;

  if (
    state.account &&
    matrixSizeData &&
    currentDrawingRoundData &&
    !pixelsOfOwnerLoading &&
    currentDrawingTimestampData
  ) {
    const matrixSize = uint256.uint256ToBN(matrixSizeData?.[0]).toNumber();
    const round = currentDrawingRoundData[0].toNumber();
    const pixelsOwned =
      (pixelsOfOwnerData as any)?.pixels?.map((p: any) => p.toNumber()) || [];
    console.log("pixelsOwned is", pixelsOwned);
    const currentDrawingTimestamp = currentDrawingTimestampData[0].toNumber();

    const now = moment();
    const beginningOfDrawing = moment.unix(currentDrawingTimestamp);

    const diff = now.diff(beginningOfDrawing, "days");

    if (round === 0) {
      gridComponent = <div>An admin needs to start the contract</div>;
    }

    if (diff >= 1) {
      gridComponent = (
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
    } else {
      gridComponent = (
        <div>
          <GridComponent
            gridSize={matrixSize}
            round={round}
            pixelsOwned={pixelsOwned}
          />
        </div>
      );
    }
  }

  return (
    <div className={styles.gridPage}>
      <div className={styles.logo}>
        <LogoImage />
      </div>
      <TopNav white />
      <div className={styles.container}>
        <Window style={{ width: 405, padding: 29, top: 0, left: 164 }}>
          <DoubleSeparator />
          {gridComponent}
        </Window>
      </div>
    </div>
  );
};

export default GridPage;
