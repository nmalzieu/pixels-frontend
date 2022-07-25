import { useStarknetCall } from "@starknet-react/core";
import { useEffect } from "react";
import { uint256 } from "starknet";
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
  owned: boolean,
  myPixels: OwnedPixel[],
  state: RootState["state"],
  dispatch: Dispatch["state"]
) => {
  const pixelSizePercent = 100 / gridSize;

  // Get pixel tokenId
  const thisPixel = myPixels.find((p) => p.pixelIndex === pixelIndex);

  const pixelClick = async () => {
    if (!owned || state.currentlyColoringHash) return;
    dispatch.setSelectedPixel(thisPixel);
  };

  const temporaryColor = thisPixel?.tokenId
    ? state.temporaryColors[thisPixel.tokenId]
    : null;
  const color = temporaryColor || pixelColor.color;
  const showQuestionMark = owned && !color;

  return (
    <div
      key={pixelIndex}
      className={`${styles.pixelWrapper} ${owned ? styles.pixelOwned : ""} ${
        owned && !state.currentlyColoringHash ? styles.pointer : ""
      }`}
      style={{
        width: `${pixelSizePercent}%`,
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
  pixelsOwned: number[];
};

const Grid = ({ round, gridSize, pixelsOwned }: GridProps) => {
  const { contract: pixelDrawerContract } = usePixelDrawerContract();
  const dispatch = useStoreDispatch();
  const state = useStoreState();

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
    dispatch.setGrid(pixelData);
  }, [dispatch, gridData]);

  const usePixelsPositions = (pixelsOwned: any) =>
    pixelsOwned.map((pixelOwned: any) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useStarknetCall({
        contract: pixelDrawerContract,
        method: "currentTokenPixelIndex",
        args: [uint256.bnToUint256(pixelOwned)],
      })
    );

  const pixelsPositionsData = usePixelsPositions(pixelsOwned);
  const pixelsPositions = pixelsPositionsData.map((p: any) =>
    p?.data?.[0]?.toNumber()
  );

  const myPixels = pixelsOwned.map((pixelTokenId, i) => ({
    tokenId: pixelTokenId,
    pixelIndex: pixelsPositions[i],
  }));

  if (
    !gridData ||
    pixelsPositionsData.some((position: any) => !position.data)
  ) {
    return <GridLoader />;
  }

  return (
    <div className={styles.gridWrapper}>
      <div className={styles.grid}>
        {state.grid.map((pixelColor: GridPixel, pixelIndex: number) =>
          getPixel(
            pixelIndex,
            pixelColor,
            gridSize,
            pixelsPositions.includes(pixelIndex),
            myPixels,
            state,
            dispatch
          )
        )}
      </div>
    </div>
  );
};

export default Grid;
