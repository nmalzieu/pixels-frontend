import { useStarknet } from "@starknet-react/core";
import { useStarknetCall } from "@starknet-react/core";
import { usePixelDrawerContract } from "../contracts/pixelDrawer";
import styles from "../styles/Grid.module.scss";

const getPixel = (pixelIndex: number, pixelColor: any, gridSize: number) => {
  const pixelSizePercent = 100 / gridSize;
  // Pixel # = column + row * gridSize
  const row = Math.floor(pixelIndex / gridSize);
  const column = pixelIndex - row * gridSize;

  const top = pixelSizePercent * row;
  const left = pixelSizePercent * column;

  return (
    <div
      key={pixelIndex}
      className={styles.pixelWrapper}
      style={{
        width: `${pixelSizePercent}%`,
        position: "absolute",
        top: `${top}%`,
        left: `${left}%`,
      }}
    >
      <div
        className={styles.pixel}
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

  if (!gridData) {
    return <div>Loading...</div>;
  }

  const pixelData: any = [];
  gridData[0].forEach((value: number, index: number) => {
    if (index % 4 === 0) {
      pixelData.push({
        set: value === 1,
        color: {},
      });
    } else if (index % 4 === 1) {
      pixelData[pixelData.length - 1].color.red = pixelData[
        pixelData.length - 1
      ].set
        ? value
        : 50;
    } else if (index % 4 === 2) {
      pixelData[pixelData.length - 1].color.green = pixelData[
        pixelData.length - 1
      ].set
        ? value
        : 50;
    } else if (index % 4 === 3) {
      pixelData[pixelData.length - 1].color.blue = pixelData[
        pixelData.length - 1
      ].set
        ? value
        : 50;
    }
  });

  return (
    <div className={styles.gridWrapper}>
      <div className={styles.grid}>
        {pixelData.map((pixelColor: any, pixelIndex: number) =>
          getPixel(pixelIndex, pixelColor, gridSize)
        )}
      </div>
    </div>
  );
};

export default Grid;
