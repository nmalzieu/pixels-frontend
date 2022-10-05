import styles from "../styles/Auction.module.scss";

type Props = {
  auctionId: number;
  auctionTimestamp: number;
};

const Auction = ({ auctionId, auctionTimestamp }: Props) => {
  const isAuctionFinished = new Date().getTime() - auctionTimestamp > 24 * 3600;
  return (
    <div className={styles.auction}>
      Auction {auctionId} - {auctionTimestamp} -{" "}
      {auctionTimestamp ? "finished" : "non finished"}
    </div>
  );
};

export default Auction;
