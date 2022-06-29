import { useStarknetCall, useStarknetInvoke } from "@starknet-react/core";
import { uint256 } from "starknet";
import { BigNumberish } from "starknet/dist/utils/number";
import { usePixelDrawerContract } from "../contracts/pixelDrawer";
import styles from "../styles/Grid.module.scss";

type OwnedPixel = {
  tokenId: number;
  pixelIndex: number;
};

const getPixel = (
  pixelIndex: number,
  pixelColor: any,
  gridSize: number,
  owned: boolean,
  myPixels: OwnedPixel[],
  setPixelColor: any
) => {
  const pixelSizePercent = 100 / gridSize;
  // Pixel # = column + row * gridSize
  const row = Math.floor(pixelIndex / gridSize);
  const column = pixelIndex - row * gridSize;

  const top = pixelSizePercent * row;
  const left = pixelSizePercent * column;

  const pixelClick = async () => {
    if (!owned) return;
    // Get pixel tokenId
    const tokenId = myPixels.find((p) => p.pixelIndex === pixelIndex)?.tokenId;
    const r = await setPixelColor({
      args: [
        [tokenId, 0],
        [255, 0, 0], // TODO select color
      ],
    });
  };

  return (
    <div
      key={pixelIndex}
      className={`${styles.pixelWrapper} ${owned ? styles.pixelOwned : ""}`}
      style={{
        width: `${pixelSizePercent}%`,
        position: "absolute",
        top: `${top}%`,
        left: `${left}%`,
      }}
    >
      <div
        className={styles.pixel}
        onClick={pixelClick}
        style={{
          backgroundColor: `rgb(${pixelColor.color.red},${pixelColor.color.green},${pixelColor.color.blue})`,
        }}
      ></div>
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

  const { data: gridData } = useStarknetCall({
    contract: pixelDrawerContract,
    method: "getGrid",
    args: [round],
  });

  const { invoke: setPixelColor } = useStarknetInvoke({
    contract: pixelDrawerContract,
    method: "setPixelColor",
  });

  const usePixelsPositions = (pixelsOwned: any) =>
    pixelsOwned.map((pixelOwned: any) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useStarknetCall({
        contract: pixelDrawerContract,
        method: "tokenPixelIndex",
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

  if (!gridData) {
    return <div>Loading...</div>;
  }

  const pixelData: any = [];
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
        : 50;
    } else if (index % 4 === 2) {
      pixelData[pixelData.length - 1].color.green = pixelData[
        pixelData.length - 1
      ].set
        ? numberValue
        : 50;
    } else if (index % 4 === 3) {
      pixelData[pixelData.length - 1].color.blue = pixelData[
        pixelData.length - 1
      ].set
        ? numberValue
        : 50;
    }
  });

  return (
    <div className={styles.gridWrapper}>
      <div className={styles.grid}>
        {pixelData.map((pixelColor: any, pixelIndex: number) =>
          getPixel(
            pixelIndex,
            pixelColor,
            gridSize,
            pixelsPositions.includes(pixelIndex),
            myPixels,
            setPixelColor
          )
        )}
      </div>
    </div>
  );
};

export default Grid;
