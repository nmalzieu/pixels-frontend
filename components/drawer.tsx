/* eslint-disable @next/next/no-img-element */
import { useStarknetCall } from "@starknet-react/core";
import BigNumber from "bignumber.js";
import moment from "moment-timezone";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SwatchesPicker } from "react-color";
import { uint256 } from "starknet";
import { bnToUint256 } from "starknet/dist/utils/uint256";

import { useCall, useInvoke, useTransactionStatus } from "../contracts/helpers";
import { usePxlERC721Contract } from "../contracts/pxlERC721";
import { useRtwrkDrawerContract } from "../contracts/rtwrkDrawer";
import WhatWillYouDrawImage from "../public/what_will_you_draw.svg";
import { useStoreDispatch, useStoreState } from "../store";
import styles from "../styles/Drawer.module.scss";
import windowStyles from "../styles/Window.module.scss";
import {
  feltArrayToStr,
  getAddressFromBN,
  rgbToHex,
  shortAddress,
} from "../utils";
import Button from "./button";
import Colorizations from "./colorizations";
import colors, { allColors } from "./colorPickerColors";
import ConnectToStarknet from "./connectToStarknet";
import GridComponent from "./grid";
import GridLoader from "./gridLoader";
import Window from "./window";

const DoubleSeparator = () => <div className={styles.doubleSeparator}></div>;

type Props = {
  pxlsOwned: number[];
};

const Drawer = ({ pxlsOwned }: Props) => {
  const state = useStoreState();
  const dispatch = useStoreDispatch();

  const [selectedPxlNFT, setSelectedPxlNFT] = useState<number | undefined>(
    undefined
  );
  const [lastCommitAt, setLastCommitAt] = useState(0);

  const { contract: pxlERC721Contract } = usePxlERC721Contract();
  const { contract: rtwrkDrawerContract } = useRtwrkDrawerContract();

  const [fixedInText, setFixedInText] = useState("");

  useEffect(() => {
    if (pxlsOwned.length === 0 || !state.account) {
      setSelectedPxlNFT(undefined);
      return;
    }
    if (
      state.account &&
      (!selectedPxlNFT || !pxlsOwned.includes(selectedPxlNFT))
    ) {
      setSelectedPxlNFT(pxlsOwned[0]);
    }
  }, [pxlsOwned, selectedPxlNFT, state.account]);

  useEffect(() => {
    if (!state.account) {
      setSelectedPxlNFT(undefined);
    }
  }, [state.account]);

  const { data: matrixSizeData } = useStarknetCall({
    contract: pxlERC721Contract,
    method: "matrixSize",
    args: [],
  });

  const { data: currentRtwrkIdData } = useStarknetCall({
    contract: rtwrkDrawerContract,
    method: "currentRtwrkId",
    args: [],
    options: { blockIdentifier: "latest" },
  });

  const { data: currentRtwrkTimestampData } = useStarknetCall({
    contract: rtwrkDrawerContract,
    method: "currentRtwrkTimestamp",
    args: [],
    options: { blockIdentifier: "latest" },
  });

  const { data: rtwrkMetadataData } = useCall({
    contract: rtwrkDrawerContract,
    method: "rtwrkMetadata",
    args: [currentRtwrkIdData ? currentRtwrkIdData[0].toNumber() : ""],
    condition: !!currentRtwrkIdData,
  });

  const { data: totalNumberOfPixelColorizationsData } = useCall({
    contract: rtwrkDrawerContract,
    method: "totalNumberOfPixelColorizations",
    args: [currentRtwrkIdData ? currentRtwrkIdData[0].toNumber() : ""],
    condition: !!currentRtwrkIdData,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentRtwrkTimestampData) return;
      const currentRtwrkTimestamp = currentRtwrkTimestampData[0].toNumber();
      const beginningOfDrawing = moment.unix(currentRtwrkTimestamp);
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
  }, [currentRtwrkTimestampData]);

  const { invoke: colorizePixels } = useInvoke({
    contract: rtwrkDrawerContract,
    method: "colorizePixels",
  });

  const {
    pending: colorizationPending,
    accepted: colorizationAccepted,
    rejected: colorizationRejected,
    loading: colorizationLoading,
  } = useTransactionStatus(state.currentlyColoringHash);

  useEffect(() => {
    console.log({
      currentlyColoringHash: state.currentlyColoringHash,
      colorizationLoading: colorizationLoading,
    });
    if (state.currentlyColoringHash && !colorizationLoading) {
      if (colorizationPending || colorizationAccepted) {
        console.log("PENDING OR ACCEPTED");
        dispatch.setColoringHash("");
        dispatch.resetColoringState();
        setLastCommitAt(new Date().getTime());
      } else if (colorizationRejected) {
        console.log("REJECTEDD");
        dispatch.setColoringHash("");
        dispatch.setFailedColoringHash(state.currentlyColoringHash);
      }
    }
  }, [
    state.currentlyColoringHash,
    colorizationLoading,
    colorizationPending,
    colorizationAccepted,
    colorizationRejected,
    dispatch,
  ]);

  let gridComponent = <GridLoader />;

  let pxlsColorizedText = "... / 2000";

  let matrixSize = 0;
  let round = 0;
  let noCurrentRound = false;

  const technicalDifficulty = process.env.NEXT_PUBLIC_TECHNICAL_DIFFICULTY;

  if (
    matrixSizeData &&
    currentRtwrkIdData &&
    currentRtwrkTimestampData &&
    !technicalDifficulty
  ) {
    matrixSize = uint256.uint256ToBN(matrixSizeData?.[0]).toNumber();
    round = currentRtwrkIdData[0].toNumber();
    const currentRtwrkTimestamp = currentRtwrkTimestampData[0].toNumber();

    const now = moment();
    const beginningOfDrawing = moment.unix(currentRtwrkTimestamp);

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
          round={round}
          saveGrid
          viewerOnly={!state.account || !selectedPxlNFT}
          key={`grid-${lastCommitAt}`}
        />
      );
    }
  }

  if (technicalDifficulty && !noCurrentRound) {
    gridComponent = (
      <div className={styles.gridMessage}>
        We&apos;re having a technical difficulty and need to postpone the rwtrk.
        Stay tuned!
      </div>
    );
  }

  let overTotalLimit = false;

  if (totalNumberOfPixelColorizationsData) {
    const totalNumberOfPixelColorizationsCount =
      totalNumberOfPixelColorizationsData[0].toNumber();
    if (
      totalNumberOfPixelColorizationsCount +
        Object.keys(state.temporaryColors).length >
      2000
    ) {
      overTotalLimit = true;
    }
    pxlsColorizedText = `${totalNumberOfPixelColorizationsCount} / 2000`;
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

  let theme = "--";
  let bidAmount = "";
  let bidWinner = "";
  if (noCurrentRound || technicalDifficulty) {
    theme =
      "Each rtwrk has a theme that is defined by the community. It will be displayed here once rtwrk creation begins.";
  } else if (rtwrkMetadataData) {
    const themeArray = (rtwrkMetadataData as any).theme;
    const themeStrings = feltArrayToStr(themeArray);
    const newTheme = themeStrings.join("").trim().replace(/%20/g, " ");
    if (newTheme.length > 0) {
      theme = newTheme;
    }
    bidAmount = new BigNumber(
      uint256
        .uint256ToBN((rtwrkMetadataData as any).auction_bid_amount)
        .toString()
    )
      .multipliedBy("1e-18")
      .toFixed();
    bidAmount = `${bidAmount} eth`;
    bidWinner = getAddressFromBN((rtwrkMetadataData as any).auction_winner);
  }

  let title = <span style={{ fontSize: 16, textAlign: "left" }}>👛 👛 👛</span>;
  const isGridReady = currentRtwrkTimestampData && state.grid && fixedInText;
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
      ).toUpperCase();
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
      })
        .then((a: any) => {
          dispatch.setColoringHash(a.transaction_hash);
        })
        .catch(console.warn);
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
      if (overTotalLimit) {
        message = (
          <span>
            you can&apos;t commit you colorizations. there is a total limit of
            2000 pixels colorized per rtwrk and your colorization will exceed
            this limit.
          </span>
        );
        showCta = false;
      }
    } else if (state.committedColorizations === 20) {
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
    if (pxlsOwned?.length === 0) {
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

  if (technicalDifficulty && !noCurrentRound) {
    message = (
      <span>
        We&apos;re having a technical difficulty and need to postpone the rwtrk.
        Stay tuned!
      </span>
    );
    noCurrentRound = true;
  }

  return (
    <div>
      {selectedPxlNFT && (
        <div className={styles.topPxlGM}>
          👋 gm, pxl #{selectedPxlNFT}
          {pxlsOwned.length > 1 && (
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
              {pxlsOwned.map((p: any) => {
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
        <Window style={{ width: 440, padding: "16px 29px", top: 0, left: 382 }}>
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
                <b>{pxlsColorizedText}</b> colorizations committed by pxlrs
              </div>
            </>
          )}
        </Window>
        <Window
          style={{
            width: 320,
            top: state.account && !noCurrentRound ? 380 : 0,
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
            height: 296,
            padding: "16px 25px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div
            className={styles.themeContent}
            // style={{
            //   textTransform: noCurrentRound ? "none" : "uppercase",
            // }}
          >
            {theme}
          </div>
          {bidAmount && (
            <>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    borderBottom: "1px solid black",
                    width: 270,
                    marginBottom: 20,
                  }}
                />
                Find inspiration for the rtwrk in the{" "}
                <a
                  href="https://discord.com/channels/998172245274931240/998224567988404316"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#FF8780" }}
                >
                  dedicated Discord channel
                </a>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    borderBottom: "1px solid black",
                    width: 270,
                    marginBottom: 20,
                    marginTop: 20,
                  }}
                />
                Ordered by <b title={bidWinner}>{shortAddress(bidWinner)}</b>
                <br />
                for <b>{bidAmount}</b>
              </div>
            </>
          )}

          <div className={styles.themeTitle}>Today’s theme</div>
        </Window>
        {state.account && !noCurrentRound && isGridReady && selectedPxlNFT && (
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
                key={`colorizations-${lastCommitAt}`}
                round={round}
                tokenId={selectedPxlNFT}
                temporaryColorizations={
                  Object.keys(state.temporaryColors).length
                }
              />
            )}
          </>
        )}

        <div className={styles.palmTree}>
          <Image src="/palmtree.png" alt="Palm Tree" layout="fill" />
        </div>
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
        {/* <div className={styles.bottom} /> */}
      </div>
    </div>
  );
};

export default Drawer;
