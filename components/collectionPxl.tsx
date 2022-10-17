import { useStarknetCall } from "@starknet-react/core";
import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { bnToUint256, uint256ToBN } from "starknet/dist/utils/uint256";

import { useExecute, useTransactionStatus } from "../contracts/helpers";
import { useRtwrkThemeAuctionContract } from "../contracts/rtwrkThemeAuction";
import SmallClock from "../public/clock-small.svg";
import styles from "../styles/CollectionPxl.module.scss";
import AspectPxlImage from "./aspectPxlImage";
import Button from "./button";

type Props = {
  pxlId: number;
};

const CollectionPxl = ({ pxlId }: Props) => {
  const { contract: rtwrkThemeAuctionContract } =
    useRtwrkThemeAuctionContract();
  const pxlIdUint256 = bnToUint256(pxlId);
  const { data: balanceData, loading: balanceLoading } = useStarknetCall({
    contract: rtwrkThemeAuctionContract,
    method: "colorizerBalance",
    args: [pxlIdUint256],
  });
  const { execute: withdrawExecute } = useExecute({
    calls: {
      contractAddress:
        process.env.NEXT_PUBLIC_RTWRK_THEME_AUCTION_ADDRESS || "",
      entrypoint: "withdrawColorizerBalance",
      calldata: [pxlIdUint256.low, pxlIdUint256.high],
    },
  });
  const aspectUrl = `${process.env.NEXT_PUBLIC_ASPECT_ASSET_LINK}/${process.env.NEXT_PUBLIC_PXL_ERC721_ADDRESS}/${pxlId}`;
  const mintsquareUrl = `${process.env.NEXT_PUBLIC_MINTSQUARE_ASSET_LINK}/${process.env.NEXT_PUBLIC_PXL_ERC721_ADDRESS}/${pxlId}`;
  let balance = "0";

  if (!balanceLoading && balanceData?.[0]) {
    balance = new BigNumber(uint256ToBN(balanceData[0]).toString())
      .multipliedBy("1e-18")
      .toString();
  }

  const [withdrawing, setWithdrawing] = useState(
    typeof window !== "undefined" &&
      !!localStorage.getItem(`pxls-withdrawing-${pxlId}`)
  );

  const withdraw = () => {
    withdrawExecute()
      .then((r: any) => {
        localStorage.setItem(`pxls-withdrawing-${pxlId}`, r.transaction_hash);
        setWithdrawing(true);
      })
      .catch(console.warn);
  };

  const withdrawingHash =
    typeof window !== "undefined" &&
    localStorage.getItem(`pxls-withdrawing-${pxlId}`);

  const {
    accepted: withdrawingAccepted,
    rejected: withdrawingRejected,
    loading: withdrawingLoading,
  } = useTransactionStatus(withdrawingHash || undefined);

  useEffect(() => {
    if (withdrawingHash && !withdrawingLoading) {
      if (withdrawingAccepted || withdrawingRejected) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(`pxls-withdrawing-${pxlId}`);
        }
        setWithdrawing(false);
      }
    }
  }, [
    pxlId,
    withdrawingAccepted,
    withdrawingHash,
    withdrawingLoading,
    withdrawingRejected,
  ]);

  return (
    <div className={styles.collectionPxl}>
      <div className={styles.gridContainer}>
        <AspectPxlImage pxlId={pxlId} />
      </div>
      <div
        style={{
          fontStyle: "italic",
          fontSize: 30,
          marginTop: 25,
          marginBottom: 25,
        }}
      >
        PXL #{pxlId}
      </div>
      <div className={styles.dual}>
        <a href={aspectUrl} target="_blank" rel="noreferrer">
          View on Aspect
        </a>
        <a href={mintsquareUrl} target="_blank" rel="noreferrer">
          View on Mintsquare
        </a>
      </div>
      <div
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "black",
          marginTop: 25,
          marginBottom: 25,
        }}
      />
      <div className={styles.labelAndValue}>
        <div className={styles.label}>Contributions</div>
        <div>
          Every time you contribute to an rtwrk, you get a share of the auction
          revenue. Your balance is updated with every rtwrk settlement. You can
          withdraw it whenever you want.
        </div>
      </div>
      {!withdrawing && (
        <>
          <div className={styles.labelAndValue}>
            <div className={styles.label}>Balance</div>
            <div>{balance} eth</div>
          </div>
          <Button
            rainbow
            block
            disabled={balance === "0"}
            text={`Withdraw ${balance} eth`}
            action={withdraw}
          />
        </>
      )}
      {withdrawing && (
        <div>
          <SmallClock />
          <br /> <br />
          Withdraw in process. It can take up to several hours (we’re waiting
          for Starknet’s next block).
        </div>
      )}
    </div>
  );
};

export default CollectionPxl;
