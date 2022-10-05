import { useStarknetCall } from "@starknet-react/core";

import { useRtwrkDrawerContract } from "../contracts/rtwrkDrawer";
// import { useRtwrkERC721Contract } from "../contracts/rtwrkERC721";
import { useRtwrkThemeAuctionContract } from "../contracts/rtwrkThemeAuction";
import styles from "../styles/HomePage.module.scss";
import RtwrkAndBidCarousel from "./rtwrkAndBidCarousel";
import TopNav from "./topNav";

const HomePage = () => {
  const { contract: rtwrkDrawerContract } = useRtwrkDrawerContract();
  // const { contract: rtwrkERC721Contract } = useRtwrkERC721Contract();
  const { contract: rtwrkThemeAuctionContract } =
    useRtwrkThemeAuctionContract();
  const { data: currentRtwrkIdData } = useStarknetCall({
    contract: rtwrkDrawerContract,
    method: "currentRtwrkId",
    args: [],
    options: { blockIdentifier: "latest" },
  });
  const currentRtwrkId = currentRtwrkIdData
    ? currentRtwrkIdData[0].toNumber()
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

  // const { data: totalRtwrkSupplyData } = useStarknetCall({
  //   contract: rtwrkERC721Contract,
  //   method: "totalSupply",
  //   args: [],
  //   options: { blockIdentifier: "latest" },
  // });
  // const totalRtwrkSupply = totalRtwrkSupplyData
  //   ? totalRtwrkSupplyData[0].toNumber()
  //   : 0;
  const totalRtwrkSupply = 0;

  const { data: currentAuctionIdData } = useStarknetCall({
    contract: rtwrkThemeAuctionContract,
    method: "currentAuctionId",
    args: [],
    options: { blockIdentifier: "latest" },
  });

  const currentAuctionId = currentAuctionIdData
    ? currentAuctionIdData[0].toNumber()
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
    !currentAuctionTimestampData;

  return (
    <div className={styles.homePage}>
      <div className={styles.homePageContent}>
        <div className={styles.homePageContainer}>
          <TopNav white logo />
          {loading
            ? "Loading"
            : `rtwrk ${currentRtwrkId} at ${currentRtwrkTimestamp} - auction ${currentAuctionId} at ${currentAuctionTimestamp}`}
          {!loading && (
            <RtwrkAndBidCarousel
              matrixSize={20}
              currentRwrkId={currentRtwrkId}
              mintedCount={totalRtwrkSupply}
              currentAuctionId={currentAuctionId}
              currentAuctionTimestamp={currentAuctionTimestamp}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
