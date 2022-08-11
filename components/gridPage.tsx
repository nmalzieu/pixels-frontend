/* eslint-disable @next/next/no-img-element */
import { useStarknetCall } from "@starknet-react/core";
import moment from "moment-timezone";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SwatchesPicker } from "react-color";
import { uint256 } from "starknet";
import { bnToUint256 } from "starknet/dist/utils/uint256";

import { useInvoke } from "../contracts/helpers";
import { usePixelDrawer2Contract } from "../contracts/pixelDrawer2";
import { usePixelERC721Contract } from "../contracts/pixelERC721";
import WhatWillYouDrawImage from "../public/what_will_you_draw.svg";
import WtfImage from "../public/wtf.svg";
import { useStoreDispatch, useStoreState } from "../store";
import styles from "../styles/GridPage.module.scss";
import windowStyles from "../styles/Window.module.scss";
import { feltArrayToStr, rgbToHex } from "../utils";
import Button from "./button";
import Colorizations from "./colorizations";
import colors, { allColors } from "./colorPickerColors";
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

  const [selectedPxlNFT, setSelectedPxlNFT] = useState<number | undefined>(
    undefined
  );
  const [loadingPixelsOfOwner, setLoadingPixelsOfOwner] = useState(true);
  const [lastCommitAt, setLastCommitAt] = useState(0);
  const currentlyColoringHashRef = useRef(state.currentlyColoringHash);
  useEffect(() => {
    if (!state.currentlyColoringHash && currentlyColoringHashRef.current) {
      setLastCommitAt(new Date().getTime());
    }
    currentlyColoringHashRef.current = state.currentlyColoringHash;
  }, [state.currentlyColoringHash]);

  const { contract: pixelERC721Contract } = usePixelERC721Contract();
  const { contract: pixelDrawerContract } = usePixelDrawer2Contract();

  const [fixedInText, setFixedInText] = useState("");

  const { data: pixelsOfOwnerData } = useStarknetCall({
    contract: pixelERC721Contract,
    method: "pixelsOfOwner",
    args: [state.account || ""],
    options: {
      watch: false,
    },
  });

  useEffect(() => {
    setLoadingPixelsOfOwner(false);
  }, [pixelsOfOwnerData]);

  useEffect(() => {
    setLoadingPixelsOfOwner(true);
  }, [state.account]);

  useEffect(() => {
    const pixelsOwned =
      (pixelsOfOwnerData as any)?.pixels?.map((p: any) => p.toNumber()) || [];
    if (pixelsOwned.length === 0 || !state.account) {
      setSelectedPxlNFT(undefined);
      return;
    }
    if (
      state.account &&
      (!selectedPxlNFT || !pixelsOwned.includes(selectedPxlNFT))
    ) {
      setSelectedPxlNFT(pixelsOwned[0]);
    }
  }, [pixelsOfOwnerData, selectedPxlNFT, state.account]);

  useEffect(() => {
    if (!state.account) {
      setSelectedPxlNFT(undefined);
    }
  }, [state.account]);

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

  const { data: themeData } = useStarknetCall({
    contract: pixelDrawerContract,
    method: "drawingTheme",
    args: [
      currentDrawingRoundData ? currentDrawingRoundData[0].toNumber() : "",
    ],
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

  const { invoke: colorizePixels } = useInvoke({
    contract: pixelDrawerContract,
    method: "colorizePixels",
  });

  let gridComponent = <GridLoader />;

  let pxlsColorizedText = "... pxls";
  const pixelsOwned =
    (pixelsOfOwnerData as any)?.pixels?.map((p: any) => p.toNumber()) || [];

  let matrixSize = 0;
  let round = 0;
  let noCurrentRound = false;

  if (
    matrixSizeData &&
    currentDrawingRoundData &&
    currentDrawingTimestampData
  ) {
    matrixSize = uint256.uint256ToBN(matrixSizeData?.[0]).toNumber();
    round = currentDrawingRoundData[0].toNumber();
    const currentDrawingTimestamp = currentDrawingTimestampData[0].toNumber();

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
          There is no rtwrk being drawn right now. Join our{" "}
          <a
            href="https://discord.com/invite/ufafywMTQh"
            target="_blank"
            rel="noreferrer"
          >
            Discord
          </a>{" "}
          or follow us on{" "}
          <a
            href="https://twitter.com/PxlsWtf"
            target="_blank"
            rel="noreferrer"
          >
            Twitter
          </a>{" "}
          to receive rtwrks notifications.
        </div>
      );
    } else {
      gridComponent = (
        <GridComponent
          gridSize={matrixSize}
          round={round + 1} // Adding 1 because 1 round is already in 1st drawer contract
          timestamp={currentDrawingTimestamp}
          saveGrid
          viewerOnly={!state.account || !selectedPxlNFT}
          key={`grid-${lastCommitAt}`}
        />
      );
    }
  }

  if (state.grid && state.grid.length > 0) {
    const colorizedCount = state.grid.filter((p: any) => p.set === true).length;
    pxlsColorizedText = `${colorizedCount} pxls`;
  }

  const handleColorPickerChange = (color: any) => {
    const rgbColor = {
      red: color.rgb.r,
      green: color.rgb.g,
      blue: color.rgb.b,
    };
    dispatch.setColorPickerMode(undefined);
    dispatch.setColorPickerColor(rgbColor);
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

  let theme = "...";
  if (noCurrentRound) {
    theme =
      "Each rtwrk has a theme that is defined by the community. It will be displayed here once rtwrk creation begins.";
  } else if (themeData) {
    const themeArray = (themeData as any).theme;
    const themeStrings = feltArrayToStr(themeArray);
    const newTheme = themeStrings.join("").trim();
    if (newTheme.length > 0) {
      theme = newTheme;
    }
  }

  let title = <span style={{ fontSize: 16, textAlign: "left" }}>👛 👛 👛</span>;
  const isGridReady = currentDrawingTimestampData && state.grid && fixedInText;
  if (state.account) {
    message = (
      <span>☀️️ Hello, pxlr! We&apos;re loading today&apos;s rtwrk...</span>
    );
    if (!noCurrentRound) {
      title = <span>🦄 Status</span>;
    }

    const temporaryColorIndexes = Object.keys(state.temporaryColors);
    const hasTemporaryColors = temporaryColorIndexes.length > 0;
    let action = null;
    let showCta = true;
    if (noCurrentRound) {
      message = (
        <span>
          Hey, pxl #{selectedPxlNFT}. We’re glad to see you here! We plan on
          having daily rtwrk drawings in the future but for now we prefer to do
          it smoothly and code iterations between two rtwrks. Thanks for your
          patience!
        </span>
      );
      showCta = false;
    }
    const colorizations: any = [];
    temporaryColorIndexes.forEach((pixelIndex) => {
      const temporaryColor = state.temporaryColors[pixelIndex];
      const hexColor = rgbToHex(
        temporaryColor.red,
        temporaryColor.green,
        temporaryColor.blue
      );
      const hexColorIndex = allColors.indexOf(hexColor);
      if (hexColorIndex >= 0) {
        colorizations.push({
          pixel_index: pixelIndex,
          color_index: hexColorIndex,
        });
      }
    });
    const colorizationAction = () =>
      colorizePixels({
        args: [bnToUint256(selectedPxlNFT), colorizations],
        metadata: {
          method: "colorizePixels",
        },
      });
    if (state.grid.length === 0) {
      // Don't change, still show loading message
    } else if (state.currentlyColoringHash) {
      message = (
        <span>
          your last colorizations are in progress. please wait a moment before
          colorizing other pixels.
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
      action = colorizationAction;
      message = (
        <span className={windowStyles.danger}>
          your color changes are not stored on the blockchain yet - click below
          to save your work.
        </span>
      );
    } else if (state.committedColorizations === 40) {
      message = (
        <span>you’re good for today! you can now leave the pxlverse.</span>
      );
    } else if (isGridReady) {
      message = (
        <span>
          hey pxl #{selectedPxlNFT}! Select a color and start colorizing.
        </span>
      );
    }
    if (pixelsOfOwnerData) {
      if (loadingPixelsOfOwner) {
        message = <span>Loading your PXL NFTs...</span>;
        showCta = false;
      } else if (pixelsOwned?.length === 0) {
        message = (
          <span>
            🤔️ It seems like you don’t have any PXL NFT in your wallet. If you
            want to join the pxlrs, you’ll have to get one first. View the
            collection on{" "}
            <a
              href="https://aspect.co/collection/0x045963ea13d95f22b58a5f0662ed172278e6b420cded736f846ca9bde8ea476a"
              target="_blank"
              rel="noreferrer"
            >
              Aspect
            </a>{" "}
            or{" "}
            <a
              href="https://mintsquare.io/collection/starknet/0x045963ea13d95f22b58a5f0662ed172278e6b420cded736f846ca9bde8ea476a/nfts"
              target="_blank"
              rel="noreferrer"
            >
              Mintsquare
            </a>
            .
          </span>
        );
        showCta = false;
      }
    }
    cta = showCta ? (
      <Button
        text="Commit to blockchain"
        disabled={
          !hasTemporaryColors ||
          !!state.failedColoringHash ||
          !!state.currentlyColoringHash
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
        state.colorPickerMode === "eyedropper"
          ? styles.eyeDropper
          : state.colorPickerMode === "eraser"
          ? styles.eraser
          : ""
      }`}
    >
      <div className={styles.gridPageContent}>
        <div className={styles.gridPageContainer}>
          <TopNav white logo />
          {selectedPxlNFT && !loadingPixelsOfOwner && (
            <div className={styles.topPxlGM}>
              👋 gm, pxl #{selectedPxlNFT}
              {pixelsOwned.length > 0 && (
                <select
                  className={styles.topPxlSelect}
                  onChange={(e) => {
                    let changePXL = false;
                    if (Object.keys(state.temporaryColors).length > 0) {
                      const leave = confirm(
                        "If you switch to another pxl NFT, you will lose your uncommitted work. Do you want to proceed?"
                      );
                      if (leave) {
                        changePXL = true;
                      }
                    } else {
                      changePXL = true;
                    }
                    if (changePXL) {
                      const selectedValue = e.target.value;
                      dispatch.resetColoringState();
                      setSelectedPxlNFT(parseInt(selectedValue, 10));
                    }
                    e.target.value = "change";
                  }}
                >
                  <option value="change">change pxl</option>
                  {pixelsOwned.map((p: any) => {
                    if (p === selectedPxlNFT) return;
                    return (
                      <option key={p} value={p}>
                        pxl #{p}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
          )}
          <div className={styles.container}>
            <Window
              style={{ width: 440, padding: "16px 29px", top: 0, left: 382 }}
            >
              <div style={{ marginTop: 12 }} />
              <DoubleSeparator />
              <div
                className={styles.gridContainer}
                onMouseEnter={() => {
                  dispatch.setMouseOverGrid(true);
                }}
                onMouseLeave={() => {
                  dispatch.setMouseOverGrid(false);
                }}
              >
                {gridComponent}
              </div>
              <DoubleSeparator />
              {isGridReady && !noCurrentRound && round >= 1 && (
                <>
                  <div className={styles.windowTitle}>TODAY’S RTWRK</div>
                  <div>
                    Will be fixed foverer <b>{fixedInText}</b>
                    <br />
                    <b>{pxlsColorizedText}</b> are already colorized
                  </div>
                </>
              )}
            </Window>
            <Window
              style={{
                width: 320,
                top: state.account && !noCurrentRound ? 200 : 0,
                left: state.account && !noCurrentRound ? "auto" : 0,
                right: state.account && !noCurrentRound ? 30 : "auto",
              }}
            >
              <div
                className={`${windowStyles.rainbowBar} ${
                  state.account && !noCurrentRound
                    ? windowStyles.rainbowBar3
                    : windowStyles.rainbowBar1
                }`}
              >
                {title}
              </div>
              <div className={windowStyles.windowContent}>
                {message}
                {cta}
                {subMessage}
              </div>
            </Window>
            <Window
              style={{
                width: 320,
                top: 33,
                right: 30,
                height: 124,
                padding: "16px 25px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                className={styles.themeContent}
                style={{
                  textTransform: noCurrentRound ? "none" : "uppercase",
                }}
              >
                {theme}
              </div>

              <div className={styles.themeTitle}>Today’s theme</div>
            </Window>
            {state.account &&
              !noCurrentRound &&
              isGridReady &&
              selectedPxlNFT &&
              !loadingPixelsOfOwner && (
                <>
                  <Window style={{ width: 320, top: 0, left: 0 }}>
                    <div
                      className={`${windowStyles.rainbowBar} ${windowStyles.rainbowBar2}`}
                    >
                      🎨 Color pickr
                    </div>
                    {/* <ChromePicker
                  color={colorPickerColor}
                  disableAlpha
                  onChange={handleColorPickerChange}
                  onChangeComplete={handleColorPickerChangeComplete}
                /> */}
                    <div className={styles.colorPickerContainer}>
                      <SwatchesPicker
                        color={{
                          r: state.colorPickerColor.red,
                          g: state.colorPickerColor.green,
                          b: state.colorPickerColor.blue,
                        }}
                        colors={colors}
                        onChange={handleColorPickerChange}
                        // onChangeComplete={handleColorPickerChangeComplete}
                      />
                    </div>

                    <div className={styles.colorPickerBottom}>
                      <img
                        alt="eyedroppper button"
                        src={
                          state.colorPickerMode === "eyedropper"
                            ? "/eyedropper-button-clicked.png"
                            : "/eyedropper-button.png"
                        }
                        style={{
                          cursor:
                            state.colorPickerMode === "eyedropper"
                              ? undefined
                              : "pointer",
                        }}
                        onClick={() => {
                          if (state.colorPickerMode === "eyedropper") {
                            dispatch.setColorPickerMode(undefined);
                          } else {
                            dispatch.setColorPickerMode("eyedropper");
                          }
                        }}
                      />
                      <img
                        alt="eraser button"
                        src={
                          state.colorPickerMode === "eraser"
                            ? "/eraser-button-clicked.png"
                            : "/eraser-button.png"
                        }
                        style={{
                          cursor:
                            state.colorPickerMode === "eraser"
                              ? undefined
                              : "pointer",
                        }}
                        onClick={() => {
                          if (state.colorPickerMode === "eraser") {
                            dispatch.setColorPickerMode(undefined);
                          } else {
                            dispatch.setColorPickerMode("eraser");
                          }
                        }}
                      />
                    </div>
                  </Window>
                  {round && !noCurrentRound && selectedPxlNFT && (
                    <Colorizations
                      round={round}
                      tokenId={selectedPxlNFT}
                      temporaryColorizations={
                        Object.keys(state.temporaryColors).length
                      }
                    />
                  )}
                </>
              )}
            <Window style={{ width: 928, top: 713, right: 100 }}>
              <ScrollingText small />
            </Window>
            <div className={styles.palmTree}>
              <Image src="/palmtree.png" alt="Palm Tree" layout="fill" />
            </div>
            <PreviousRtwrk
              maxRound={(noCurrentRound ? round + 1 : round) + 1} // Adding 1 more to shift because there is already one drawing on drawer 1
              matrixSize={matrixSize}
            />{" "}
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
      </div>
    </div>
  );
};

export default GridPage;
