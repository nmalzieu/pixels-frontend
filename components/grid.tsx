import { useStarknetCall } from "@starknet-react/core";
import { useEffect, useState } from "react";
import { BigNumberish } from "starknet/dist/utils/number";

import { usePixelDrawer1Contract } from "../contracts/pixelDrawer1";
import { usePixelDrawer2Contract } from "../contracts/pixelDrawer2";
import {
  Dispatch,
  GridPixel,
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
  state: RootState["state"],
  dispatch: Dispatch["state"],
  viewerOnly?: boolean
) => {
  const pixelSizePercent = 100 / gridSize;

  const temporaryColor = state.temporaryColors[pixelIndex];
  const color = viewerOnly
    ? pixelColor.color
    : temporaryColor || pixelColor.color;

  const pixelClick = async () => {
    const actionsLeft =
      40 -
      (state.committedColorizations || 0) -
      Object.keys(state.temporaryColors).length;
    if (state.colorPickerMode === "eraser") {
      dispatch.setPixelTemporaryColor({
        pixelIndex,
        color: undefined,
      });
    } else if (state.colorPickerMode === "eyedropper") {
      dispatch.setColorPickerColor(color);
      dispatch.setColorPickerMode(undefined);
    } else if (actionsLeft > 0) {
      dispatch.setPixelTemporaryColor({
        pixelIndex,
        color: state.colorPickerColor,
      });
    }
    // if (owned && !state.eyedropperMode && thisPixel) {
    //   dispatch.setSelectedPixel(thisPixel);
    // } else if (state.eyedropperMode && state.selectedPixel) {
    //   dispatch.setPixelTemporaryColor({
    //     tokenId: state.selectedPixel.tokenId,
    //     color: color,
    //   });
    //   dispatch.setEyeDropperMode(false);
    // }
  };

  return (
    <div
      key={pixelIndex}
      className={styles.pixelWrapper}
      style={{
        width: `${pixelSizePercent}%`,
        cursor: state.colorPickerMode ? "inherit" : "pointer",
      }}
      onClick={pixelClick}
    >
      <div
        className={styles.pixel}
        style={{
          backgroundColor: `rgb(${color.red},${color.green},${color.blue})`,
        }}
      >
        <div
          className={styles.whiteOverlay}
          style={{
            visibility:
              state.mouseOverGrid &&
              !temporaryColor &&
              !viewerOnly &&
              !state.colorPickerMode
                ? "visible"
                : "hidden",
          }}
        />
      </div>
    </div>
  );
};

type GridProps = {
  round: number;
  gridSize: number;
  timestamp: number;
  viewerOnly?: boolean;
  saveGrid?: boolean;
};

const Grid = ({ round, gridSize, viewerOnly, saveGrid }: GridProps) => {
  const { contract: pixelDrawer1Contract } = usePixelDrawer1Contract();
  const { contract: pixelDrawer2Contract } = usePixelDrawer2Contract();

  // Round 1 is on contract 1
  // Round >= 2 are on contract 2

  const pixelDrawerContract =
    round >= 2 ? pixelDrawer2Contract : pixelDrawer1Contract;
  const roundFromContract = round >= 2 ? round - 1 : round;

  const dispatch = useStoreDispatch();
  const state = useStoreState();

  const [pixelDataToDisplay, setPixelDataToDisplay] = useState(state.grid);
  const [refreshing, setRefreshing] = useState(false);

  const { data: gridData, refresh: refreshGrid } = useStarknetCall({
    contract: pixelDrawerContract,
    method: "getGrid",
    args: [roundFromContract],
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

  useEffect(() => {
    setRefreshing(false);
  }, [gridData]);

  if (!gridData) {
    return <GridLoader />;
  }

  const refresh = () => {
    setRefreshing(true);
    refreshGrid();
  };

  return (
    <div
      className={`${styles.gridWrapper} ${viewerOnly ? styles.viewerOnly : ""}`}
    >
      <div className={styles.grid}>
        {pixelDataToDisplay.map((pixelColor: GridPixel, pixelIndex: number) =>
          getPixel(
            pixelIndex,
            pixelColor,
            gridSize,
            state,
            dispatch,
            viewerOnly
          )
        )}
      </div>
      {!viewerOnly && (
        <div className={styles.refresh} onClick={refresh}>
          <img
            src="/refresh.gif"
            alt="refresh-animated"
            style={{ visibility: "hidden" }}
          />
          <img
            src="/refresh.jpg"
            alt="refresh"
            style={{ visibility: "hidden" }}
          />
          {refreshing && <img src="/refresh.gif" alt="refresh-animated" />}
          {!refreshing && <img src="/refresh.jpg" alt="refresh" />}
        </div>
      )}
    </div>
  );
};

export default Grid;
