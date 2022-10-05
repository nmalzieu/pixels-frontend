import { useStarknetCall } from "@starknet-react/core";
import moment from "moment-timezone";
import { useEffect, useRef, useState } from "react";
import { uint256 } from "starknet";
import { toHex } from "starknet/utils/number";

import { useRtwrkDrawerContract } from "../contracts/rtwrkDrawer";
import { useRtwrkERC721Contract } from "../contracts/rtwrkERC721";
import LeftArrow from "../public/left-arrow.svg";
import LeftArrowHover from "../public/left-arrow-hover.svg";
import PinkBorder from "../public/pink_border.svg";
import QuestionMark from "../public/question-mark.svg";
import RightArrow from "../public/right-arrow.svg";
import RightArrowHover from "../public/right-arrow-hover.svg";
import styles from "../styles/RtwrkAndBidCarousel.module.scss";
import { feltArrayToStr, shortAddress } from "../utils";
import Auction from "./auction";
import GridComponent from "./grid";
import GridLoader from "./gridLoader";
import MintsquareRtwrkImage from "./mintsquareRtwrkImage";

const ORIGINAL_RTWRKS_COUNT = 9;

type Props = {
  currentRwrkId: number;
  currentAuctionId: number;
  currentAuctionTimestamp: number;
  matrixSize?: number;
  mintedCount: number;
};

const RtwrkAndBidCarousel = ({
  matrixSize,
  currentRwrkId,
  mintedCount,
  currentAuctionId,
  currentAuctionTimestamp,
}: Props) => {
  const [round, setRound] = useState(currentRwrkId + 1);

  const { contract: rtwrkDrawerContract } = useRtwrkDrawerContract();
  const { contract: rtwrkERC721Contract } = useRtwrkERC721Contract();

  const { data: rtwrkTimestampData } = useStarknetCall({
    contract: rtwrkDrawerContract,
    method: "rtwrkTimestamp",
    args: [round],
  });

  const { data: rtwrkThemeData } = useStarknetCall({
    contract: rtwrkDrawerContract,
    method: "rtwrkTheme",
    args: [round],
  });

  const { data: rtwrkOwnerData } = useStarknetCall({
    contract: rtwrkERC721Contract,
    method: "ownerOf",
    args: [uint256.bnToUint256(round)],
  });

  const roundRef = useRef(round);
  const timestampRef = useRef(0);
  const [theme, setTheme] = useState("");
  const [owner, setOwner] = useState<string | undefined>(undefined);
  const [timestampLoading, setTimestampLoading] = useState(true);
  const [themeLoading, setThemeLoading] = useState(true);
  const [ownerLoading, setOwnerLoading] = useState(true);
  const [hoverArrow, setHoverArrow] = useState(0);

  useEffect(() => {
    if (roundRef.current != round) {
      roundRef.current = round;
      setTimestampLoading(true);
      setThemeLoading(true);
      setOwnerLoading(true);
    }
  }, [round]);

  useEffect(() => {
    if (rtwrkTimestampData) {
      const t = rtwrkTimestampData[0].toNumber();
      if (timestampRef.current !== t) {
        timestampRef.current = t;
        setTimestampLoading(false);
      }
    }
  }, [rtwrkTimestampData]);

  useEffect(() => {
    if (rtwrkThemeData) {
      const themeArray = (rtwrkThemeData as any).theme;
      const themeStrings = feltArrayToStr(themeArray);
      const newTheme = themeStrings.join("").trim();
      setTheme(newTheme);
      setThemeLoading(false);
    }
  }, [rtwrkThemeData]);

  useEffect(() => {
    if (rtwrkOwnerData) {
      const newOwner = toHex(rtwrkOwnerData[0]);
      setOwner(newOwner);
      setOwnerLoading(false);
    }
  }, [rtwrkOwnerData]);

  const timestamp = rtwrkTimestampData ? rtwrkTimestampData[0].toNumber() : 0;

  let component = <GridLoader />;

  const isAuctionPage = round === currentRwrkId + 1;
  const isCurrentDrawing =
    !isAuctionPage && new Date().getTime() - timestamp <= 24 * 3600;
  console.log("mintedCount is", mintedCount, "round is", round);

  if (!isAuctionPage && round <= mintedCount) {
    console.log("go mintsquare");
    component = (
      <MintsquareRtwrkImage rtwrkId={round} key={`aspect-${round}`} />
    );
  } else if (round > 0 && matrixSize && timestamp && !timestampLoading) {
    component = (
      <GridComponent
        gridSize={matrixSize}
        round={round}
        timestamp={timestamp}
        viewerOnly
      />
    );
  } else if (isAuctionPage) {
    component = <QuestionMark className={styles.questionMark} />;
  }

  // if (
  //   round > 0 &&
  //   matrixSize &&
  //   timestamp &&
  //   !timestampLoading &&
  //   (isCurrentDrawing || round > mintedCount)
  // ) {
  //   component = (
  //     <GridComponent
  //       gridSize={matrixSize}
  //       round={round}
  //       timestamp={timestamp}
  //       viewerOnly
  //     />
  //   );
  // } else if (!isAuctionPage) {
  //   console.log("rendering for fake");
  //   component = (
  //     <MintsquareRtwrkImage rtwrkId={round} key={`aspect-${round}`} />
  //   );
  // } else if (isAuctionPage) {
  //   component = <QuestionMark className={styles.questionMark} />;
  // }

  const beginningOfDrawing = moment.unix(timestamp).tz("Europe/Paris");
  const isPreAuctionDrawing = round <= ORIGINAL_RTWRKS_COUNT;

  const aspectUrl = `${process.env.NEXT_PUBLIC_ASPECT_LINK}/${process.env.NEXT_PUBLIC_RTWRK_ERC721_ADDRESS}/${round}`;
  const mintsquareUrl = `${process.env.NEXT_PUBLIC_MINTSQUARE_LINK}/${process.env.NEXT_PUBLIC_RTWRK_ERC721_ADDRESS}/${round}`;

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
            <div className={styles.labelAndValue}>
              <div className={styles.label}>Winner</div>
              <div>
                {isPreAuctionDrawing
                  ? "No winner - drawn in the pre-auction era."
                  : "WINNER"}
              </div>
            </div>
            <div className={styles.labelAndValue}>
              <div className={styles.label}>Theme</div>
              <div>{!themeLoading && theme ? theme : "..."}</div>
            </div>
            <div className={styles.singleSeparator} />
            <div className={styles.dual}>
              <div className={styles.labelAndValue}>
                <div className={styles.label}>Holder</div>
                <div title={owner}>
                  {owner && !ownerLoading ? shortAddress(owner) : "..."}
                </div>
              </div>
              <div className={styles.labelAndValue}>
                <div className={styles.label}>Date of creation</div>
                <div>
                  {timestamp && !timestampLoading
                    ? beginningOfDrawing.format("MMM DD YYYY")
                    : "..."}
                </div>
              </div>
            </div>
            <div className={styles.dual}>
              <a href={aspectUrl} target="_blank" rel="noreferrer">
                View on Aspect
              </a>
              <a href={mintsquareUrl} target="_blank" rel="noreferrer">
                View on Mintsquare
              </a>
            </div>
          </>
        )}
        {isAuctionPage && (
          <Auction
            auctionId={currentAuctionId}
            auctionTimestamp={currentAuctionTimestamp}
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
