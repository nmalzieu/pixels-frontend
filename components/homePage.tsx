import { useStarknetCall } from "@starknet-react/core";
import { useEffect } from "react";
import { uint256ToBN } from "starknet/dist/utils/uint256";

import Window from "../components/window";
import { useRtwrkDrawerContract } from "../contracts/rtwrkDrawer";
import { useRtwrkERC721Contract } from "../contracts/rtwrkERC721";
import { useRtwrkThemeAuctionContract } from "../contracts/rtwrkThemeAuction";
import CommissioningImage from "../public/commissioning.svg";
import PinkBorder from "../public/pink_border.svg";
import { useStoreDispatch, useStoreState } from "../store";
import styles from "../styles/HomePage.module.scss";
import GridLoader from "./gridLoader";
import RtwrkAndBidCarousel from "./rtwrkAndBidCarousel";
import TopNav from "./topNav";

const HomePage = () => {
  const state = useStoreState();
  const dispatch = useStoreDispatch();
  const { contract: rtwrkDrawerContract } = useRtwrkDrawerContract();
  const { contract: rtwrkERC721Contract } = useRtwrkERC721Contract();
  const { contract: rtwrkThemeAuctionContract } =
    useRtwrkThemeAuctionContract();
  const { data: currentRtwrkIdData } = useStarknetCall({
    contract: rtwrkDrawerContract,
    method: "currentRtwrkId",
    args: [],
    options: { blockIdentifier: "latest" },
  });
  const { data: pendingRtwrkIdData } = useStarknetCall({
    contract: rtwrkDrawerContract,
    method: "currentRtwrkId",
    args: [],
    options: { blockIdentifier: "pending" },
  });
  const currentRtwrkId = currentRtwrkIdData
    ? currentRtwrkIdData[0].toNumber()
    : "";
  const pendingRtwrkId = pendingRtwrkIdData
    ? pendingRtwrkIdData[0].toNumber()
    : "";
  const { data: currentRtwrkTimestampData } = useStarknetCall({
    contract: rtwrkDrawerContract,
    method: "currentRtwrkTimestamp",
    args: [],
    options: { blockIdentifier: "latest" },
  });
  const currentRtwrkTimestamp = currentRtwrkTimestampData
    ? currentRtwrkTimestampData[0].toNumber()
    : 0;

  const { data: totalRtwrkSupplyData, loading: totalRtwrkSupplyLoading } =
    useStarknetCall({
      contract: rtwrkERC721Contract,
      method: "totalSupply",
      args: [],
      options: { blockIdentifier: "latest" },
    });

  const totalRtwrkSupply = totalRtwrkSupplyData
    ? uint256ToBN(totalRtwrkSupplyData[0]).toNumber()
    : 0;

  const { data: currentAuctionIdData } = useStarknetCall({
    contract: rtwrkThemeAuctionContract,
    method: "currentAuctionId",
    args: [],
    options: { blockIdentifier: "latest" },
  });

  const { data: pendingAuctionIdData } = useStarknetCall({
    contract: rtwrkThemeAuctionContract,
    method: "currentAuctionId",
    args: [],
    options: { blockIdentifier: "pending" },
  });

  const currentAuctionId = currentAuctionIdData
    ? currentAuctionIdData[0].toNumber()
    : "";
  const pendingAuctionId = pendingAuctionIdData
    ? pendingAuctionIdData[0].toNumber()
    : "";
  const { data: currentAuctionTimestampData } = useStarknetCall({
    contract: rtwrkThemeAuctionContract,
    method: "auctionTimestamp",
    args: [currentAuctionId],
    options: { blockIdentifier: "latest" },
  });
  const currentAuctionTimestamp = currentAuctionTimestampData
    ? currentAuctionTimestampData[0].toNumber()
    : 0;

  const loading =
    !currentRtwrkTimestampData ||
    !currentRtwrkIdData ||
    !currentAuctionIdData ||
    !currentAuctionTimestampData ||
    totalRtwrkSupplyLoading ||
    !state.rehydrated;

  const now = new Date().getTime() / 1000;
  const currentRtwrkStartedSince = now - currentRtwrkTimestamp;
  const drawingIsHappening = currentRtwrkStartedSince <= 24 * 3600;
  useEffect(() => {
    dispatch.setDrawingIsHappening(drawingIsHappening);
  }, [drawingIsHappening, dispatch]);

  return (
    <div className={styles.homePage}>
      <div className={styles.homePageContent}>
        <div className={styles.homePageContainer}>
          <TopNav white logo />
          {!loading && (
            <RtwrkAndBidCarousel
              matrixSize={20}
              currentRwrkId={currentRtwrkId}
              pendingRtwrkId={pendingRtwrkId}
              mintedCount={totalRtwrkSupply}
              currentAuctionId={currentAuctionId}
              pendingAuctionId={pendingAuctionId}
              currentAuctionTimestamp={currentAuctionTimestamp}
            />
          )}
          {loading && (
            <div className={styles.previousRtwrksContent}>
              <PinkBorder className={styles.pinkBorder} />
              <GridLoader transparent />
            </div>
          )}
          <CommissioningImage className={styles.commissioning} />
          <img
            src="/palmtree.png"
            alt="palm tree"
            className={styles.palmtree}
          />
          <Window
            style={{
              position: "absolute",
              width: 525,
              height: 560,
              border: "2px solid black",
              right: 0,
              top: 1250,
              padding: 44,
            }}
          >
            Hello art lover
            <br />
            <br />
            <div className={styles.singleSeparator} />
            <div className={styles.singleSeparator} />
            <div>
              <br />
              We are a community of 400 pxl NFT holders. Every two days, we draw
              on-chain collaborative pixel art for web3 collectors.
              <br />
              <br />
              If you want us do draw something for you, propose a theme and a
              bid. If you win the auction, we will draw your theme and you will
              get your artwork (“rtwrk”) as an NFT.
              <br />
              <br />
              Each auction lasts 24 hours and each drawing take another 24
              hours. When the drawing is finished, another auction begins.
              <br />
              <br />
              Everything we do is on-chain (on the Starknet blockchain):
              auctions, drawings, image storing, NFTs. If you want to have a
              look at our contracts, check{" "}
              <a
                style={{ textDecoration: "underline" }}
                href="https://github.com/nmalzieu/pxls-contracts"
                target="_blank"
                rel="noreferrer"
              >
                our documentation
              </a>
              .
              <br />
              <br />
              What will we draw next?
            </div>
          </Window>
          <div>
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
            <a
              className={styles.github}
              href="https://github.com/nmalzieu/pxls-contracts"
              target="_blank"
              rel="noreferrer"
            >
              <img src="/github.png" alt="Github" />
            </a>
            <a
              className={styles.wtf}
              href="https://pxlswtf.notion.site/Pxls-wtf-d379e6b48f2749c2a047813815ed038f"
              target="_blank"
              rel="noreferrer"
            >
              <img src="/wtf.svg" alt="WTF" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
