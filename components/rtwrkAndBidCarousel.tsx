import { useStarknetCall } from "@starknet-react/core";
import BigNumber from "bignumber.js";
import moment from "moment-timezone";
import { useEffect, useRef, useState } from "react";
import { uint256 } from "starknet";
import { toHex } from "starknet/utils/number";

import {
  useCall,
  useExecute,
  useTransactionStatus,
} from "../contracts/helpers";
import { useRtwrkDrawerContract } from "../contracts/rtwrkDrawer";
import { useRtwrkERC721Contract } from "../contracts/rtwrkERC721";
import AuctionWonImage from "../public/auction-won.svg";
import OutbidImage from "../public/bid-outbid.svg";
import BidProcessingImage from "../public/bid-processing.svg";
import BidWinnerImage from "../public/bid-winner.svg";
import ClockBigImage from "../public/clock-big.svg";
import SmallClock from "../public/clock-small.svg";
import LeftArrow from "../public/left-arrow.svg";
import LeftArrowHover from "../public/left-arrow-hover.svg";
import PinkBorder from "../public/pink_border.svg";
import QuestionMark from "../public/question-mark.svg";
import RightArrow from "../public/right-arrow.svg";
import RightArrowHover from "../public/right-arrow-hover.svg";
import { useStoreDispatch, useStoreState } from "../store";
import styles from "../styles/RtwrkAndBidCarousel.module.scss";
import { feltArrayToStr, getAddressFromBN, shortAddress } from "../utils";
import Auction from "./auction";
import Button from "./button";
import GridComponent from "./grid";
import GridLoader from "./gridLoader";
import UnframedRtwrkImage from "./unframedRtwrkImage";

const ORIGINAL_RTWRKS_COUNT = 13;
const BLOCK_TIME_BUFFER = 2 * 3600; // 2 hours buffer

type Props = {
  pendingRtwrkId: number;
  currentRwrkId: number;
  currentAuctionId: number;
  currentAuctionTimestamp: number;
  matrixSize?: number;
  mintedCount: number;
  pendingAuctionId: number;
};

const RtwrkAndBidCarousel = ({
  matrixSize,
  pendingRtwrkId,
  currentRwrkId,
  mintedCount,
  currentAuctionId,
  currentAuctionTimestamp,
  pendingAuctionId,
}: Props) => {
  const state = useStoreState();
  const dispatch = useStoreDispatch();
  const [round, setRound] = useState(
    state.drawingIsHappening || currentRwrkId > mintedCount
      ? currentRwrkId
      : currentRwrkId + 1
  );
  const { contract: rtwrkDrawerContract } = useRtwrkDrawerContract();
  const { contract: rtwrkERC721Contract } = useRtwrkERC721Contract();

  const { data: rtwrkMetadataData, loading: rtwrkMetadataDataLoading } =
    useCall({
      contract: rtwrkDrawerContract,
      method: "rtwrkMetadata",
      args: [round],
      condition: round <= currentRwrkId,
    });

  const { data: rtwrkOwnerData } = useCall({
    contract: rtwrkERC721Contract,
    method: "ownerOf",
    args: [uint256.bnToUint256(round)],
    condition: round <= mintedCount,
  });

  const {
    data: totalNumberOfPixelColorizationsData,
    loading: totalNumberOfPixelColorizationsLoading,
  } = useStarknetCall({
    contract: rtwrkDrawerContract,
    method: "totalNumberOfPixelColorizations",
    args: [round],
  });

  const { execute: settleAuctionExecute } = useExecute({
    calls: {
      contractAddress:
        process.env.NEXT_PUBLIC_RTWRK_THEME_AUCTION_ADDRESS || "",
      entrypoint: "settleAuction",
      calldata: [],
    },
  });

  const {
    accepted: settlingAuctionAccepted,
    rejected: settlingAuctionRejected,
    loading: settlingAuctionLoading,
  } = useTransactionStatus(state.settlingAuctionHash);

  useEffect(() => {
    if (state.settlingAuctionHash && !settlingAuctionLoading) {
      if (settlingAuctionAccepted || settlingAuctionRejected) {
        dispatch.setSettlingAuctionHash(undefined);
      }
    }
  }, [
    dispatch,
    settlingAuctionAccepted,
    settlingAuctionLoading,
    settlingAuctionRejected,
    state.settlingAuctionHash,
  ]);

  const settleAuction = () => {
    settleAuctionExecute()
      .then((r: any) => {
        dispatch.setSettlingAuctionHash(r.transaction_hash);
      })
      .catch(console.warn);
  };

  const roundRef = useRef(round);
  const [theme, setTheme] = useState("");
  const [timestamp, setTimestamp] = useState(0);
  const [auctionWinner, setAuctionWinner] = useState("");
  const [auctionAmount, setAuctionAmount] = useState("");
  const [owner, setOwner] = useState<string | undefined>(undefined);
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [ownerLoading, setOwnerLoading] = useState(true);
  const [hoverArrow, setHoverArrow] = useState(0);

  useEffect(() => {
    if (roundRef.current != round) {
      roundRef.current = round;
      setMetadataLoading(true);
      setOwnerLoading(true);
    }
  }, [round]);

  useEffect(() => {
    if (rtwrkMetadataData) {
      const themeArray = (rtwrkMetadataData as any).theme;
      const themeStrings = feltArrayToStr(themeArray);
      const newTheme = themeStrings.join("").trim().replace(/%20/g, " ");
      setAuctionAmount(
        new BigNumber(
          uint256
            .uint256ToBN((rtwrkMetadataData as any).auction_bid_amount)
            .toString()
        )
          .multipliedBy("1e-18")
          .toFixed()
      );
      setAuctionWinner(
        getAddressFromBN((rtwrkMetadataData as any).auction_winner)
      );
      setTheme(newTheme);
      const t = (rtwrkMetadataData as any).timestamp.toNumber();
      setTimestamp(t);
      setMetadataLoading(false);
    }
  }, [rtwrkMetadataData]);

  useEffect(() => {
    if (rtwrkOwnerData) {
      const newOwner = toHex(rtwrkOwnerData[0]);
      setOwner(newOwner);
      setOwnerLoading(false);
    }
  }, [rtwrkOwnerData]);

  let component = <GridLoader transparent />;

  const now = new Date().getTime() / 1000;

  const showIsAuctionLaunching =
    (!!state.launchAuctionHash ||
      !!state.settlingAuctionHash ||
      pendingAuctionId != currentAuctionId) &&
    round === currentRwrkId;

  const isAuctionPage = round === currentRwrkId + 1;
  const drawingStartedSince = now - timestamp;
  const isCurrentDrawing = !isAuctionPage && drawingStartedSince <= 24 * 3600;
  const auctionStartedSince = now - currentAuctionTimestamp;

  const [drawingEndsIn, setDrawingEndsIn] = useState(0);

  useEffect(() => {
    const refresh = () => {
      const now = new Date().getTime() / 1000;
      const sUntilFinished = timestamp + 24 * 3600 - Math.floor(now);
      setDrawingEndsIn(sUntilFinished);
    };
    refresh();
    const interval = setInterval(refresh, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [timestamp]);

  const isCurrentAuction = isAuctionPage && auctionStartedSince <= 24 * 3600;
  const {
    pending: lastBidActionPending,
    loading: lastBidActionLoading,
    rejected: lastBidActionRejected,
    accepted: lastBidActionAccepted,
  } = useTransactionStatus(state.lastBidAction?.transactionHash);

  const lastBidActionForThisAuction =
    state.lastBidAction && state.lastBidAction.auctionId === currentAuctionId;

  let lastBidProcessing = lastBidActionForThisAuction;
  if (lastBidActionForThisAuction && !lastBidActionLoading) {
    if (
      lastBidActionAccepted ||
      lastBidActionPending ||
      lastBidActionRejected
    ) {
      lastBidProcessing = false;
    }
  }

  const drawingEndsInWithBuffer = drawingEndsIn + BLOCK_TIME_BUFFER;
  const isInBuffer = drawingEndsIn < 0 && drawingEndsInWithBuffer > 0;

  if (!isAuctionPage && round <= mintedCount) {
    component = (
      <UnframedRtwrkImage
        rtwrkId={round}
        key={`aspect-${round}`}
        transparentLoader
      />
    );
  } else if (isAuctionPage) {
    const currentAuctionBid = state.currentAuctionBid?.bidTimestamp
      ? state.currentAuctionBid
      : undefined;
    component = <QuestionMark className={styles.bidIllustration} />;
    if (lastBidProcessing && !state.drawingIsHappening) {
      component = <BidProcessingImage className={styles.bidIllustration} />;
    } else if (currentAuctionBid && !state.drawingIsHappening) {
      if (
        new BigNumber(currentAuctionBid.bidAccount).isEqualTo(state.account)
      ) {
        if (isCurrentAuction) {
          component = <BidWinnerImage className={styles.bidIllustration} />;
        } else {
          // Auction is finished, we won
          component = <AuctionWonImage className={styles.bidIllustration} />;
        }
      } else if (lastBidActionForThisAuction && isCurrentAuction) {
        // Auction is running and we've been outbid
        component = <OutbidImage className={styles.bidIllustration} />;
      }
    } else if (state.drawingIsHappening) {
      component = <ClockBigImage className={styles.bidIllustration} />;
    }
  } else if (!isAuctionPage && round > 0 && matrixSize) {
    component = (
      <GridComponent
        gridSize={matrixSize}
        round={round}
        viewerOnly
        forceShowRefresh={!isInBuffer && isCurrentDrawing}
        transparentLoader
      />
    );
  }

  const beginningOfDrawing = moment.unix(timestamp).tz("Europe/Paris");
  const isPreAuctionDrawing = round <= ORIGINAL_RTWRKS_COUNT;

  const unframedUrl = `${process.env.NEXT_PUBLIC_UNFRAMED_ASSET_LINK}/${process.env.NEXT_PUBLIC_RTWRK_ERC721_ADDRESS}/${round}`;

  let hoursUntilFinished = drawingEndsIn / 3600;
  let minsUntilFinished = (drawingEndsIn % 3600) / 60;
  let secsUntilFinished = (minsUntilFinished * 60) % 60;
  hoursUntilFinished = Math.trunc(hoursUntilFinished);
  minsUntilFinished = Math.trunc(minsUntilFinished);
  secsUntilFinished = Math.trunc(secsUntilFinished);

  let hoursUntilFinishedWithBuffer = drawingEndsInWithBuffer / 3600;
  let minsUntilFinishedWithBuffer = (drawingEndsInWithBuffer % 3600) / 60;
  let secsUntilFinishedWithBuffer = (minsUntilFinishedWithBuffer * 60) % 60;
  hoursUntilFinishedWithBuffer = Math.trunc(hoursUntilFinishedWithBuffer);
  minsUntilFinishedWithBuffer = Math.trunc(minsUntilFinishedWithBuffer);
  secsUntilFinishedWithBuffer = Math.trunc(secsUntilFinishedWithBuffer);

  const displayAddress = (a: string) => {
    if (state.account && BigNumber(a).isEqualTo(state.account)) {
      return (
        <span>
          You <img src="/glasses-you.svg" />
        </span>
      );
    }
    return shortAddress(a);
  };

  return (
    <div className={styles.previousRtwrks}>
      <div className={styles.previousRtwrksContent}>
        <PinkBorder className={styles.pinkBorder} />
        {component}
      </div>
      <div className={styles.previousRtwrksSide}>
        <div className={styles.previousRtwrksTitle}>RTWRK #{round}</div>
        {!isAuctionPage && (
          <>
            <div className={styles.dual}>
              <div
                className={styles.labelAndValue}
                style={{ marginRight: isPreAuctionDrawing ? 0 : undefined }}
              >
                <div className={styles.label}>Winner</div>
                <div>
                  {isPreAuctionDrawing
                    ? "No winner - drawn in the pre-auction era."
                    : auctionWinner
                    ? displayAddress(auctionWinner)
                    : "--"}
                </div>
              </div>
              {!isPreAuctionDrawing && (
                <div className={styles.labelAndValue}>
                  <div className={styles.label}>Winning bid</div>
                  <div>
                    {!metadataLoading && auctionAmount
                      ? `${auctionAmount} ETH`
                      : "--"}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.labelAndValue}>
              <div className={styles.label}>Theme</div>
              <div style={{ height: 48 }}>
                {!metadataLoading && theme ? theme : "--"}
              </div>
            </div>
            {round <= mintedCount && !showIsAuctionLaunching && (
              <>
                <div className={styles.singleSeparator} />
                <div className={styles.dual}>
                  <div className={styles.labelAndValue}>
                    <div className={styles.label}>Holder</div>
                    <div title={owner}>
                      {owner && !ownerLoading ? displayAddress(owner) : "--"}
                    </div>
                  </div>
                  <div className={styles.labelAndValue}>
                    <div className={styles.label}>Date of creation</div>
                    <div>
                      {timestamp && !metadataLoading
                        ? beginningOfDrawing.format("MMM DD YYYY")
                        : "--"}
                    </div>
                  </div>
                </div>
              </>
            )}
            {showIsAuctionLaunching && (
              <>
                <div
                  className={styles.singleSeparator}
                  style={{ marginBottom: 15 }}
                />
                <SmallClock />
                <div style={{ marginTop: 10 }}>
                  Rtwrk #{currentRwrkId} is being settled. Its NFT is being
                  minted, auction for rtwrk #{currentRwrkId + 1} will start
                  soon.
                </div>
              </>
            )}

            {!isCurrentDrawing &&
              round <= mintedCount &&
              !showIsAuctionLaunching && (
                <div className={styles.dual}>
                  <a href={unframedUrl} target="_blank" rel="noreferrer">
                    View on Unframed
                  </a>
                  <div />
                </div>
              )}
            {!isCurrentDrawing &&
              round > mintedCount &&
              !metadataLoading &&
              !isInBuffer &&
              !showIsAuctionLaunching && (
                <div style={{ marginTop: -20 }}>
                  <div className={styles.singleSeparator} />
                  Rtwrk #{round} is finished. It’s fixed forever on the
                  blockchain.
                  <Button
                    rainbow
                    block
                    text="Settle, mint and start new auction"
                    action={settleAuction}
                  />
                </div>
              )}
            {!isCurrentDrawing &&
              round > mintedCount &&
              !metadataLoading &&
              isInBuffer && (
                <div>
                  <div className={styles.singleSeparator} />
                  Rtwrk #{round} is finished. It’s fixed forever on the
                  blockchain. You will be able to settle the drawing in&nbsp;
                  {hoursUntilFinishedWithBuffer}h&nbsp;
                  {minsUntilFinishedWithBuffer}m&nbsp;
                  {secsUntilFinishedWithBuffer}s
                </div>
              )}
            {isCurrentDrawing && !rtwrkMetadataDataLoading && (
              <>
                <div className={styles.singleSeparator} />
                <div className={styles.dual}>
                  <div className={styles.labelAndValue} style={{ width: 110 }}>
                    <div className={styles.label}>Drawing ends in</div>
                    <div>
                      {drawingEndsIn > 0
                        ? `${hoursUntilFinished}h ${minsUntilFinished}m ${secsUntilFinished}s`
                        : "--"}
                    </div>
                  </div>
                  <div className={styles.labelAndValue}>
                    <div className={styles.label}>Pixels colorized</div>
                    <div>
                      {!totalNumberOfPixelColorizationsLoading &&
                      totalNumberOfPixelColorizationsData
                        ? `${totalNumberOfPixelColorizationsData[0].toNumber()} pixels`
                        : "--"}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
        {isAuctionPage && (
          <Auction
            pendingAuctionId={pendingAuctionId}
            auctionId={currentAuctionId}
            auctionTimestamp={currentAuctionTimestamp}
            pendingRtwrkId={pendingRtwrkId}
            nextRwrkId={currentRwrkId + 1}
            lastBidProcessing={!!lastBidProcessing}
            lastDrawingToSettle={!isCurrentDrawing && round - 1 > mintedCount}
          />
        )}

        <div className={styles.arrows}>
          <div
            className={`${styles.arrow} ${
              round === 1 ? styles.arrowDisabled : ""
            }`}
            onClick={() => {
              if (round > 1) {
                setRound(round - 1);
              }
            }}
            onMouseEnter={() => setHoverArrow(1)}
            onMouseLeave={() => setHoverArrow(0)}
          >
            {hoverArrow === 1 ? <LeftArrowHover /> : <LeftArrow />}
          </div>
          <div
            className={`${styles.arrow} ${
              round >= currentRwrkId + 1 ? styles.arrowDisabled : ""
            }`}
            onClick={() => {
              if (round <= currentRwrkId) {
                setRound(round + 1);
              }
            }}
            onMouseEnter={() => setHoverArrow(2)}
            onMouseLeave={() => setHoverArrow(0)}
          >
            {hoverArrow === 2 ? <RightArrowHover /> : <RightArrow />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RtwrkAndBidCarousel;
