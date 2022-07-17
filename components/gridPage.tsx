import { useStarknetCall } from "@starknet-react/core";
import moment from "moment-timezone";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChromePicker } from "react-color";
import { uint256 } from "starknet";

import { useInvoke } from "../contracts/helpers";
import { usePixelDrawerContract } from "../contracts/pixelDrawer";
import { usePixelERC721Contract } from "../contracts/pixelERC721";
import CloseImage from "../public/cross.svg";
import LogoImage from "../public/logo.svg";
import { useStoreDispatch, useStoreState } from "../store";
import styles from "../styles/GridPage.module.scss";
import { rgbToHex } from "../utils";
import GridComponent from "./grid";
import GridLoader from "./gridLoader";
import ScrollingText from "./scrollingText";
import TopNav from "./topNav";
import Window from "./window";

const DoubleSeparator = () => <div className={styles.doubleSeparator}></div>;

const GridPage = () => {
  const state = useStoreState();
  const dispatch = useStoreDispatch();
  const { contract: pixelERC721Contract } = usePixelERC721Contract();
  const { contract: pixelDrawerContract } = usePixelDrawerContract();

  const [fixedInText, setFixedInText] = useState("");
  const [colorPickerColor, setColorPickerColor] = useState("#ffffff");

  const { data: pixelsOfOwnerData } = useStarknetCall({
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentDrawingTimestampData) return;
      const currentDrawingTimestamp = currentDrawingTimestampData[0].toNumber();
      const beginningOfDrawing = moment.unix(currentDrawingTimestamp);
      const now = moment();
      const endOfDrawing = beginningOfDrawing.add(1, "days");
      const durationInSeconds = endOfDrawing.diff(now, "seconds");
      let hours = durationInSeconds / 3600;
      let mins = (durationInSeconds % 3600) / 60;
      let secs = (mins * 60) % 60;
      hours = Math.trunc(hours);
      mins = Math.trunc(mins);
      secs = Math.trunc(secs);
      setFixedInText(`in ${hours}h ${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentDrawingTimestampData]);

  useEffect(() => {
    // When selected pixel changes, reset the color
    // picker color to the color of the selected pixel !
    if (!state.selectedPixel) return;
    const gridPixel = state.grid[state.selectedPixel.pixelIndex];
    const temporaryColor = state.temporaryColors[state.selectedPixel.tokenId];
    const color = temporaryColor || gridPixel.color;
    setColorPickerColor(rgbToHex(color.red, color.green, color.blue));
  }, [state.grid, state.selectedPixel, state.temporaryColors]);

  const { invoke: launchNewRound } = useInvoke({
    contract: pixelDrawerContract,
    method: "launchNewRoundIfNecessary",
  });

  let gridComponent = <GridLoader />;

  let pxlsColorizedText = "";
  let showText = false;

  if (
    state.account &&
    matrixSizeData &&
    currentDrawingRoundData &&
    pixelsOfOwnerData &&
    currentDrawingTimestampData
  ) {
    const matrixSize = uint256.uint256ToBN(matrixSizeData?.[0]).toNumber();
    const round = currentDrawingRoundData[0].toNumber();
    const pixelsOwned =
      (pixelsOfOwnerData as any)?.pixels?.map((p: any) => p.toNumber()) || [];
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
      showText = true;
      gridComponent = (
        <GridComponent
          gridSize={matrixSize}
          round={round}
          pixelsOwned={pixelsOwned}
        />
      );
    }
  }

  if (state.grid) {
    const colorizedCount = state.grid.filter((p: any) => p.set === true).length;
    pxlsColorizedText = `${colorizedCount} pxls`;
  }

  const handleColorPickerChange = (color: any) => {
    setColorPickerColor(color.hex);
  };

  const handleColorPickerChangeComplete = (data: any) => {
    if (!state.selectedPixel) return;
    dispatch.setPixelTemporaryColor({
      tokenId: state.selectedPixel.tokenId,
      color: { red: data.rgb.r, green: data.rgb.g, blue: data.rgb.b },
    });
  };

  return (
    <div className={styles.gridPage}>
      <div className={styles.logo}>
        <LogoImage />
      </div>
      <TopNav white />
      <div className={styles.container}>
        <Window style={{ width: 405, padding: 29, top: 0, left: 164 }}>
          <DoubleSeparator />
          <div className={styles.gridContainer}>{gridComponent}</div>
          <DoubleSeparator />
          {showText && (
            <>
              <div className={styles.windowTitle}>TODAY’S RTWRK</div>
              <div>
                Will be fixed foverer <b>{fixedInText}</b>
                <br />
                <b>{pxlsColorizedText}</b> have been colorized
              </div>
            </>
          )}
        </Window>
        {/* retirer 169 top, 100 left */}
        <Window style={{ width: 385, top: 82, left: 665 }}>
          <div className={styles.rainbowBar}>
            👛 👛 👛 👛 👛 👛 👛 👛 👛 👛 👛 👛 👛 👛 👛 👛 👛
          </div>
          <div className={styles.windowContent}>
            {!state.account && (
              <span>
                You own a PXL NFT? Connect your starknet wallet and colorize
                your pxl. Be the artist of the third internet.
              </span>
            )}
            {state.account && (
              <span>
                ☀️️ Hello, pxlr! Which color are you going to choose today?
                Click on your pxl to change its color.
              </span>
            )}
          </div>
        </Window>
        {state.selectedPixel && (
          <Window style={{ width: 225, top: 278, left: 679 }} border>
            <div className={styles.windowCloseTitle}>
              <CloseImage
                onClick={() => {
                  dispatch.setSelectedPixel(undefined);
                }}
              />
              PXL {state.selectedPixel.tokenId}
            </div>
            <ChromePicker
              color={colorPickerColor}
              disableAlpha
              onChange={handleColorPickerChange}
              onChangeComplete={handleColorPickerChangeComplete}
            />
          </Window>
        )}
        <Window style={{ width: 928, top: 643, right: 0 }}>
          <ScrollingText small />
        </Window>
        <div className={styles.palmTree}>
          <Image src="/palmtree.png" alt="Palm Tree" layout="fill" />
        </div>
      </div>
    </div>
  );
};

export default GridPage;
