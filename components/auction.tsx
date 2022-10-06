import { useStarknetCall } from "@starknet-react/core";
import { useEffect, useState } from "react";

import { useInvoke } from "../contracts/helpers";
import { useRtwrkThemeAuctionContract } from "../contracts/rtwrkThemeAuction";
import styles from "../styles/Auction.module.scss";
import carouselStyles from "../styles/RtwrkAndBidCarousel.module.scss";
import Button from "./button";
import Input from "./input";

type Props = {
  auctionId: number;
  auctionTimestamp: number;
  nextRwrkId: number;
};

const Auction = ({ auctionId, auctionTimestamp, nextRwrkId }: Props) => {
  const { contract: rtwrkThemeAuctionContract } =
    useRtwrkThemeAuctionContract();
  const auctionEnd = auctionTimestamp + 24 * 3600;
  const [secondsUntilAuctionFinished, setSecondsUntilAuctionFinished] =
    useState(0);
  useEffect(() => {
    const refresh = () => {
      const sUntilFinished =
        auctionEnd - Math.floor(new Date().getTime() / 1000);
      setSecondsUntilAuctionFinished(sUntilFinished);
    };
    refresh();
    const interval = setInterval(refresh, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [auctionEnd]);

  const { data: currentAuctionBidData } = useStarknetCall({
    contract: rtwrkThemeAuctionContract,
    method: "currentAuctionBid",
    args: [auctionId],
  });

  console.log(currentAuctionBidData);

  const auctionBidsCount = 0;
  const auctionHadBids = auctionBidsCount > 0 && auctionId > 0;
  const isAuctionFinished =
    (auctionTimestamp > 0 && secondsUntilAuctionFinished < 0) ||
    auctionId === 0;

  let hoursUntilFinished = secondsUntilAuctionFinished / 3600;
  let minsUntilFinished = (secondsUntilAuctionFinished % 3600) / 60;
  let secsUntilFinished = (minsUntilFinished * 60) % 60;
  hoursUntilFinished = Math.trunc(hoursUntilFinished);
  minsUntilFinished = Math.trunc(minsUntilFinished);
  secsUntilFinished = Math.trunc(secsUntilFinished);

  const { invoke: launchAuction } = useInvoke({
    contract: rtwrkThemeAuctionContract,
    method: "launchAuction",
  });

  return (
    <div className={styles.auction}>
      {isAuctionFinished && !auctionHadBids && (
        <div>
          <div className={styles.singleSeparator} />
          There was no bid in the last auction. Start a new auction for rtwrk #
          {nextRwrkId}
          <Button
            rainbow
            block
            text="Start auction"
            action={() =>
              launchAuction({
                args: [],
                metadata: {
                  method: "launchAuction",
                },
              })
            }
          />
        </div>
      )}
      {!isAuctionFinished && (
        <>
          <div className={carouselStyles.dual}>
            <div className={carouselStyles.labelAndValue}>
              <div className={carouselStyles.label}>Auction ends in</div>
              <div style={{ width: 110 }}>
                {auctionTimestamp > 0
                  ? `${hoursUntilFinished}h ${minsUntilFinished}m ${secsUntilFinished}s`
                  : "--"}
              </div>
            </div>
            <div className={carouselStyles.labelAndValue}>
              <div className={carouselStyles.label}>Current bid</div>
              <div>--</div>
            </div>
          </div>
          <div className={carouselStyles.labelAndValue}>
            <div className={carouselStyles.label}>Current theme</div>
            <div>--</div>
          </div>
          <div className={styles.singleSeparator} />
          <Input placeholder="Your theme" />
          <div className={styles.inputAndButton}>
            <Input placeholder={`0.1 eth or more`} />
            <Button
              rainbow
              text="Place bid"
              // action={() =>
              //   launchAuction({
              //     args: [],
              //     metadata: {
              //       method: "launchAuction",
              //     },
              //   })
              // }
            />
          </div>
        </>
      )}
      {/* Auction {auctionId} - {auctionTimestamp} -{" "}
      {isAuctionFinished ? "finished" : "non finished"} */}
    </div>
  );
};

export default Auction;
