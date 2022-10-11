import BigNumber from "bignumber.js";
import moment from "moment-timezone";
import { uint256 } from "starknet";

import { useCall } from "../contracts/helpers";
import { useRtwrkDrawerContract } from "../contracts/rtwrkDrawer";
import { useStoreState } from "../store";
import styles from "../styles/CollectionRtwrk.module.scss";
import { feltArrayToStr, getAddressFromBN, shortAddress } from "../utils";
import AspectRtwrkImage from "./aspectRtwrkImage";
import Button from "./button";

const ORIGINAL_RTWRKS_COUNT = 10;

type Props = {
  rtwrkId: number;
  setEditingStepForRtwrk: any;
};

const CollectionRtwtk = ({ rtwrkId, setEditingStepForRtwrk }: Props) => {
  const state = useStoreState();
  const { contract: rtwrkDrawerContract } = useRtwrkDrawerContract();
  const { data: rtwrkMetadataData, loading: rtwrkMetadataLoading } = useCall({
    contract: rtwrkDrawerContract,
    method: "rtwrkMetadata",
    args: [rtwrkId],
    condition: true,
  });
  const aspectUrl = `${process.env.NEXT_PUBLIC_ASPECT_LINK}/${process.env.NEXT_PUBLIC_RTWRK_ERC721_ADDRESS}/${rtwrkId}`;
  const mintsquareUrl = `${process.env.NEXT_PUBLIC_MINTSQUARE_LINK}/${process.env.NEXT_PUBLIC_RTWRK_ERC721_ADDRESS}/${rtwrkId}`;

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

  const isPreAuctionDrawing = rtwrkId <= ORIGINAL_RTWRKS_COUNT;
  let auctionWinner = "";
  let theme = "";
  let auctionBidAmount = "";
  let timestamp = 0;
  if (!rtwrkMetadataLoading && rtwrkMetadataData) {
    const themeArray = (rtwrkMetadataData as any).theme;
    const themeStrings = feltArrayToStr(themeArray);
    theme = themeStrings.join("").trim();
    auctionBidAmount = new BigNumber(
      uint256
        .uint256ToBN((rtwrkMetadataData as any).auction_bid_amount)
        .toString()
    )
      .multipliedBy("1e-18")
      .toString();

    auctionWinner = getAddressFromBN((rtwrkMetadataData as any).auction_winner);
    timestamp = (rtwrkMetadataData as any).timestamp.toNumber();
  }

  return (
    <div className={styles.collectionRtwrk}>
      <div className={styles.gridContainer}>
        <AspectRtwrkImage rtwrkId={rtwrkId} />;
      </div>
      <div
        style={{
          fontStyle: "italic",
          fontSize: 30,
          marginTop: 25,
          marginBottom: 25,
        }}
      >
        RTWRK #{rtwrkId}
      </div>
      <div className={styles.dual}>
        <div className={styles.labelAndValue} style={{ minWidth: 170 }}>
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
            <div>{auctionBidAmount} eth</div>
          </div>
        )}
      </div>
      <div className={styles.labelAndValue}>
        <div className={styles.label}>Theme</div>
        <div>{theme || "--"}</div>
      </div>
      <div
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "black",
          marginBottom: 25,
        }}
      />
      <div className={styles.labelAndValue}>
        <div className={styles.label}>Date of creation</div>
        <div>
          {" "}
          {timestamp
            ? moment.unix(timestamp).tz("Europe/Paris").format("MMM DD YYYY")
            : "--"}
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
      <br />
      <Button
        rainbow
        block
        text="Change NFT image"
        action={() => setEditingStepForRtwrk(rtwrkId)}
      />
    </div>
  );
};

export default CollectionRtwtk;
