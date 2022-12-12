import { useStarknetCall } from "@starknet-react/core";
import moment from "moment";
import { useEffect, useState } from "react";

import { usePxlERC721Contract } from "../contracts/pxlERC721";
import { useRtwrkDrawerContract } from "../contracts/rtwrkDrawer";
import { useStoreState } from "../store";
import styles from "../styles/DrawPage.module.scss";
import ConnectToStarknet from "./connectToStarknet";
import Drawer from "./drawer";
import Loading from "./loading";
import RegenesisBanner from "./regenesisBanner";
import TopNav from "./topNav";

const DrawPage = () => {
  const state = useStoreState();
  const { contract: pxlERC721Contract } = usePxlERC721Contract();
  const { contract: rtwrkDrawerContract } = useRtwrkDrawerContract();
  const { data: pxlsOwnedData } = useStarknetCall({
    contract: pxlERC721Contract,
    method: "pxlsOwned",
    args: [state.account || ""],
    options: {
      watch: false,
    },
  });
  const { data: currentRtwrkTimestampData } = useStarknetCall({
    contract: rtwrkDrawerContract,
    method: "currentRtwrkTimestamp",
    args: [],
    options: { blockIdentifier: "latest" },
  });

  const pxlsOwned =
    (pxlsOwnedData as any)?.pxls?.map((p: any) => p.toNumber()) || [];

  const [loadingPxlsOwned, setLoadingPxlsOwned] = useState(true);

  useEffect(() => {
    setLoadingPxlsOwned(false);
  }, [pxlsOwnedData]);

  useEffect(() => {
    setLoadingPxlsOwned(true);
  }, [state.account]);

  let noCurrentDrawing = false;

  if (currentRtwrkTimestampData) {
    const currentRtwrkTimestamp = currentRtwrkTimestampData[0].toNumber();

    const now = moment();
    const beginningOfDrawing = moment.unix(currentRtwrkTimestamp);

    const diff = now.diff(beginningOfDrawing, "days");
    if (diff >= 1) {
      noCurrentDrawing = true;
    }
  }

  const allLoadingReady =
    !loadingPxlsOwned && currentRtwrkTimestampData && state.rehydrated;

  const showDisconnected = !state.account && state.rehydrated;
  const showDrawer =
    state.account &&
    allLoadingReady &&
    pxlsOwned.length > 0 &&
    !noCurrentDrawing;
  const showNoPxls = state.account && allLoadingReady && pxlsOwned.length === 0;
  const showNoCurrentDrawing =
    state.account && noCurrentDrawing && allLoadingReady && !showNoPxls;
  const showLoading =
    !showDisconnected && !showDrawer && !showNoPxls && !showNoCurrentDrawing;

  const aspectUrl = `${process.env.NEXT_PUBLIC_ASPECT_COLLECTION_LINK}/${process.env.NEXT_PUBLIC_RTWRK_ERC721_ADDRESS}`;
  const mintsquareUrl = `${process.env.NEXT_PUBLIC_MINTSQUARE_COLLECTION_LINK}/${process.env.NEXT_PUBLIC_RTWRK_ERC721_ADDRESS}`;

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
      <RegenesisBanner />
      <div
        className={styles.gridPageContent}
        style={{ height: showDrawer ? 1580 : 1000 }}
      >
        <div
          className={styles.gridPageContainer}
          style={{ height: showDrawer ? 1580 : 1000 }}
        >
          <TopNav white logo />
          {showLoading && <Loading className={styles.loading} />}
          {showDisconnected && (
            <>
              <div className={styles.whiteMessage}>
                You own a PXL NFT?{" "}
                <ConnectToStarknet
                  connectButton={
                    <span className={styles.connectToStarknet}>
                      Connect your starknet wallet
                    </span>
                  }
                />{" "}
                and colorize your pxls. Be the artist of the third internet.
              </div>
              <img
                src="/glasses.svg"
                alt="Glasses"
                className={styles.glasses}
              />
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
            </>
          )}
          {showNoCurrentDrawing && (
            <>
              <div
                className={styles.whiteMessage}
                style={{ left: 760, top: 330 }}
              >
                gm{pxlsOwned.length > 0 ? ` pxl #${pxlsOwned[0]}` : ","}
                <br />
                how are you doing today?
                <br />
                there’s no rtwrk being drawn right now
                <br />
                <br />
                have a rest!
                <br />
                <br />
                bisou
              </div>
              <img
                src="/rainbow.svg"
                alt="Rainbow"
                className={styles.rainbowImage}
              />
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
            </>
          )}
          {showNoPxls && (
            <>
              <div className={styles.whiteMessage}>
                gm!
                <br />
                it seems like you don’t have a pxl NFT in your wallet. If you
                want to draw rtwrks with us, go get one on{" "}
                <a
                  href={aspectUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "underline" }}
                >
                  Aspect
                </a>{" "}
                or{" "}
                <a
                  href={mintsquareUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "underline" }}
                >
                  Mintsquare
                </a>
              </div>
              <img
                src="/no_pxl.svg"
                alt="Doodles"
                className={styles.noPxlImage}
              />
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
            </>
          )}
          {showDrawer && <Drawer pxlsOwned={pxlsOwned} />}
        </div>
      </div>
    </div>
  );
};

export default DrawPage;
