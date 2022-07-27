import { useStarknetCall } from "@starknet-react/core";
import { useEffect, useState } from "react";
import { BigNumberish } from "starknet/dist/utils/number";

import { usePixelDrawerContract } from "../contracts/pixelDrawer";
import {
  Dispatch,
  GridPixel,
  OwnedPixel,
  RootState,
  useStoreDispatch,
  useStoreState,
} from "../store";
import styles from "../styles/Grid.module.scss";
import GridLoader from "./gridLoader";

const getPixel = (
  pixelIndex: number,
  pixelColor: GridPixel,
  gridSize: number,
  myPixels: OwnedPixel[],
  state: RootState["state"],
  dispatch: Dispatch["state"]
) => {
  const pixelSizePercent = 100 / gridSize;

  // Get pixel tokenId
  const thisPixel = myPixels.find((p) => p.pixelIndex === pixelIndex);

  const owned = !!myPixels.find((p) => p.pixelIndex === pixelIndex);

  const temporaryColor = thisPixel?.tokenId
    ? state.temporaryColors[thisPixel.tokenId]
    : null;
  const color = temporaryColor || pixelColor.color;
  const showQuestionMark = owned && !color;

  const pixelClick = async () => {
    if (state.currentlyColoringHash) return;
    if (owned && !state.eyedropperMode && thisPixel) {
      dispatch.setSelectedPixel(thisPixel);
    } else if (state.eyedropperMode && state.selectedPixel) {
      dispatch.setPixelTemporaryColor({
        tokenId: state.selectedPixel.tokenId,
        color: color,
      });
      dispatch.setEyeDropperMode(false);
    }
  };

  return (
    <div
      key={pixelIndex}
      className={`${styles.pixelWrapper} ${owned ? styles.pixelOwned : ""} ${
        owned && !state.currentlyColoringHash ? styles.pointer : ""
      } ${
        owned && pixelColor.set && !temporaryColor ? styles.pixelCommitted : ""
      }`}
      style={{
        width: `${pixelSizePercent}%`,
        cursor:
          owned && !state.currentlyColoringHash && !state.eyedropperMode
            ? "pointer"
            : undefined,
      }}
    >
      <div
        className={styles.pixel}
        onClick={pixelClick}
        style={{
          backgroundColor: `rgb(${color.red},${color.green},${color.blue})`,
        }}
      >
        {showQuestionMark && <span className={styles.questionMark}>?</span>}
      </div>
    </div>
  );
};

type GridProps = {
  round: number;
  gridSize: number;
  timestamp: number;
  myPixels: {
    tokenId: number;
    pixelIndex: number;
  }[];
  viewerOnly?: boolean;
  saveGrid?: boolean;
};

const Grid = ({
  round,
  gridSize,
  myPixels,
  viewerOnly,
  saveGrid,
}: GridProps) => {
  const { contract: pixelDrawerContract } = usePixelDrawerContract();
  const dispatch = useStoreDispatch();
  const state = useStoreState();

  const [pixelDataToDisplay, setPixelDataToDisplay] = useState(state.grid);

  const { data: gridData } = useStarknetCall({
    contract: pixelDrawerContract,
    method: "getGrid",
    args: [round],
  });

  useEffect(() => {
    const pixelData: any = [];
    if (!gridData) return;

    gridData[0].forEach((value: BigNumberish, index: number) => {
      const numberValue = value.toNumber();
      if (index % 4 === 0) {
        pixelData.push({
          set: numberValue === 1,
          color: {},
        });
      } else if (index % 4 === 1) {
        pixelData[pixelData.length - 1].color.red = pixelData[
          pixelData.length - 1
        ].set
          ? numberValue
          : 242;
      } else if (index % 4 === 2) {
        pixelData[pixelData.length - 1].color.green = pixelData[
          pixelData.length - 1
        ].set
          ? numberValue
          : 242;
      } else if (index % 4 === 3) {
        pixelData[pixelData.length - 1].color.blue = pixelData[
          pixelData.length - 1
        ].set
          ? numberValue
          : 242;
      }
    });
    setPixelDataToDisplay(pixelData);
    if (saveGrid) {
      dispatch.setGrid(pixelData);
    }
  }, [dispatch, gridData, saveGrid]);

  if (!gridData) {
    return <GridLoader />;
  }

  return (
    <div
      className={`${styles.gridWrapper} ${viewerOnly ? styles.viewerOnly : ""}`}
    >
      <div className={styles.grid}>
        {pixelDataToDisplay.map((pixelColor: GridPixel, pixelIndex: number) =>
          getPixel(pixelIndex, pixelColor, gridSize, myPixels, state, dispatch)
        )}
      </div>
    </div>
  );
};

export default Grid;
