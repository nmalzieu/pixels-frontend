import { useStarknetCall } from "@starknet-react/core";
import moment from "moment-timezone";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChromePicker } from "react-color";
import { uint256 } from "starknet";
import { bnToUint256 } from "starknet/dist/utils/uint256";

import { useInvoke } from "../contracts/helpers";
import { usePixelDrawerContract } from "../contracts/pixelDrawer";
import { usePixelERC721Contract } from "../contracts/pixelERC721";
import CloseImage from "../public/cross.svg";
import WhatWillYouDrawImage from "../public/what_will_you_draw.svg";
import WtfImage from "../public/wtf.svg";
import { useStoreDispatch, useStoreState } from "../store";
import styles from "../styles/GridPage.module.scss";
import windowStyles from "../styles/Window.module.scss";
import { rgbToHex } from "../utils";
import Button from "./button";
import ConnectToStarknet from "./connectToStarknet";
import GridComponent from "./grid";
import GridLoader from "./gridLoader";
import PreviousRtwrk from "./previousRtwrk";
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
    args: [state.account || "0x000000000000000000000000000000000000dead"],
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
      if (durationInSeconds < 0) {
        setFixedInText("");
      } else {
        let hours = durationInSeconds / 3600;
        let mins = (durationInSeconds % 3600) / 60;
        let secs = (mins * 60) % 60;
        hours = Math.trunc(hours);
        mins = Math.trunc(mins);
        secs = Math.trunc(secs);
        setFixedInText(`in ${hours}h ${mins}m ${secs}s`);
      }
    }, 100);
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

  const { invoke: setPixelsColors } = useInvoke({
    contract: pixelDrawerContract,
    method: "setPixelsColors",
  });

  let gridComponent = <GridLoader />;

  let pxlsColorizedText = "... pxls";
  const pixelsOwned =
    (pixelsOfOwnerData as any)?.pixels?.map((p: any) => p.toNumber()) || [];

  let myPixels: any = [];
  let matrixSize = 0;
  let round = 0;
  let noCurrentRound = false;

  if (
    matrixSizeData &&
    currentDrawingRoundData &&
    pixelsOfOwnerData &&
    currentDrawingTimestampData
  ) {
    matrixSize = uint256.uint256ToBN(matrixSizeData?.[0]).toNumber();
    round = currentDrawingRoundData[0].toNumber();
    const currentDrawingTimestamp = currentDrawingTimestampData[0].toNumber();

    const pixelsPositions = pixelsOwned.map(
      (pixelTokenId: any) =>
        (373 * pixelTokenId + currentDrawingTimestamp) % 400
    );

    myPixels = pixelsOwned.map((pixelTokenId: any, i: any) => ({
      tokenId: pixelTokenId,
      pixelIndex: pixelsPositions[i],
    }));

    const now = moment();
    const beginningOfDrawing = moment.unix(currentDrawingTimestamp);

    const diff = now.diff(beginningOfDrawing, "days");

    if (round === 0) {
      gridComponent = <div>An admin needs to start the contract</div>;
    }

    if (diff >= 1) {
      noCurrentRound = true;
      gridComponent = (
        <div className={styles.gridMessage}>
          There is no rtwrk being drawn right now. Join our Discord or follow us
          on Twitter to receive rtwrks notifications.
        </div>
      );
    } else {
      gridComponent = (
        <GridComponent
          gridSize={matrixSize}
          round={round}
          myPixels={myPixels}
          timestamp={currentDrawingTimestamp}
          saveGrid
        />
      );
    }
  }

  if (state.grid && state.grid.length > 0) {
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

  let cta: React.ReactNode = (
    <ConnectToStarknet connectButton={<Button text="Connect wallet" />} />
  );
  let subMessage: React.ReactNode = "";
  let message = (
    <span>
      You own a PXL NFT? Connect your starknet wallet and colorize your pxl. Be
      the artist of the third internet.
    </span>
  );

  let title = (
    <span style={{ fontSize: 16, textAlign: "left" }}>
      👛 👛 👛 👛 👛 👛 👛 👛 👛 👛 👛 👛 👛 👛 👛 👛 👛
    </span>
  );
  const isGridReady = currentDrawingTimestampData && state.grid && fixedInText;
  if (state.account) {
    message = (
      <span>☀️️ Hello, pxlr! We&apos;re loading today&apos;s rtwrk...</span>
    );
    title = (
      <span>
        Hello, pxlr!{" "}
        {pixelsOwned?.length > 0 ? (
          <span>
            You own PXL{pixelsOwned.length > 1 ? "s" : ""}{" "}
            {pixelsOwned.join(",")}
          </span>
        ) : (
          ""
        )}
      </span>
    );
    const temporaryColorIndexes = Object.keys(state.temporaryColors);
    const hasTemporaryColors = temporaryColorIndexes.length > 0;
    let action = null;
    let showCta = true;
    let hasColorizedGrid = false;
    if (noCurrentRound) {
      message = <span>There is no rtwrk being drawn for now.</span>;
      showCta = false;
    } else if (state.grid.length > 0 && myPixels.length > 0) {
      myPixels.forEach((myPixel: any) => {
        const gridPixel = state.grid[myPixel.pixelIndex];
        if (gridPixel.set) {
          hasColorizedGrid = true;
        }
      });
    }
    if (state.grid.length === 0) {
      // Don't change, still show loading message
    } else if (state.currentlyColoringHash) {
      message = (
        <span>
          ⏳️ Your color changes are currently commiting to the blockchain; it
          can take a moment. You can go and drink a coffee or a tea or whatever.
        </span>
      );
    } else if (state.failedColoringHash) {
      message = (
        <span className={windowStyles.danger}>
          😢️ There was an issue with your commit and it failed. You’ll have to
          commit again to colorize your pxl today.
        </span>
      );
    } else if (hasTemporaryColors) {
      const tokenIds = temporaryColorIndexes.map((i) => bnToUint256(i));
      const colors = temporaryColorIndexes.map((i) => {
        const c = state.temporaryColors[parseInt(i, 10)];
        return [c.red, c.green, c.blue];
      });
      action = () =>
        setPixelsColors({
          args: [tokenIds, colors],
          metadata: {
            method: "setPixelsColors",
          },
        });
      message = (
        <span className={windowStyles.danger}>
          ⚠️ Your color changes are not stored on the blockchain yet - click
          below to save your work.
        </span>
      );
    } else if (hasColorizedGrid) {
      message = (
        <span>
          ✅️ Your pxl’s color is set in the virtual stone of the blockchain -
          you can still modify them and re-commit if you want.
        </span>
      );
    } else if (pixelsOfOwnerData && pixelsOwned?.length === 0) {
      message = (
        <span>
          🤔️ It seems like you don’t have any PXL NFT in your wallet. If you
          want to join the pxlrs, you’ll have to get one first.
        </span>
      );
      showCta = false;
    } else if (isGridReady) {
      message = (
        <span>
          ☀️️ Hello, pxlr! Which color are you going to choose today? Click on
          your pxl to change its color.
        </span>
      );
    }
    cta = showCta ? (
      <Button
        text="Commit to blockchain"
        disabled={
          !hasTemporaryColors ||
          !!state.currentlyColoringHash ||
          !!state.failedColoringHash
        }
        action={action}
      />
    ) : null;
  } else {
    subMessage = (
      <span className={windowStyles.danger}>
        <br />
        {state.message}
      </span>
    );
  }

  return (
    <div
      className={`${styles.gridPage} ${
        state.eyedropperMode ? styles.eyeDropper : ""
      }`}
    >
      <TopNav white logo />
      <div className={styles.container}>
        <Window style={{ width: 405, padding: "16px 29px", top: 0, left: 164 }}>
          {state.grid.length > 0 &&
          pixelsOfOwnerData &&
          pixelsOwned?.length > 0 ? (
            <img src="/click-pxl-title.png" alt="title" />
          ) : (
            <>
              <div style={{ marginTop: 12 }} />
              <DoubleSeparator />
            </>
          )}
          <div className={styles.gridContainer}>{gridComponent}</div>
          <DoubleSeparator />
          {isGridReady && !noCurrentRound && round >= 1 && (
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
        <Window style={{ width: 446, top: -20, left: 665 }}>
          <div className={windowStyles.rainbowBar}>{title}</div>
          <div className={windowStyles.windowContent}>
            {message}
            {cta}
            {subMessage}
          </div>
        </Window>
        {state.selectedPixel && (
          <Window style={{ width: 225, top: 248, left: 679 }} border>
            <div className={styles.windowCloseTitle}>
              <CloseImage
                onClick={() => {
                  dispatch.setEyeDropperMode(false);
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
            <div className={styles.colorPickerPick}>
              Or{" "}
              <span
                style={{
                  textDecoration: "underline",
                  cursor: state.eyedropperMode ? undefined : "pointer",
                }}
                onClick={() => dispatch.setEyeDropperMode(true)}
              >
                pick a pxl&apos;s color
              </span>
            </div>
          </Window>
        )}
        <Window style={{ width: 928, top: 643, right: 0 }}>
          <ScrollingText small />
        </Window>
        <div className={styles.palmTree}>
          <Image src="/palmtree.png" alt="Palm Tree" layout="fill" />
        </div>
        <PreviousRtwrk maxRound={round} matrixSize={matrixSize} />
        <a
          className={styles.wtf}
          href="https://pxlswtf.notion.site/Pxls-wtf-d379e6b48f2749c2a047813815ed038f"
          target="_blank"
          rel="noreferrer"
        >
          <WtfImage />
        </a>
        <WhatWillYouDrawImage className={styles.whatWillYouDraw} />
        <a
          className={styles.twitter}
          href="https://twitter.com/PxlsWtf"
          target="_blank"
          rel="noreferrer"
        >
          <img src="/twitter-text.png" alt="Twitter" />
        </a>

        <a
          className={styles.discord}
          href="https://discord.com/invite/ufafywMTQh"
          target="_blank"
          rel="noreferrer"
        >
          <img src="/discord-text.png" alt="Discord" />
        </a>

        <div className={styles.bottom} />
      </div>
    </div>
  );
};

export default GridPage;
