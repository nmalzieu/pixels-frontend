import styles from "../styles/TopNav.module.scss";
import ConnectToStarknet from "./connectToStarknet";

type Props = {
  white?: boolean;
};

const TopNav = ({ white }: Props) => (
  <div className={`${styles.top} ${white ? styles.topWhite : ""}`}>
    <div className={styles.topElement}>
      <ConnectToStarknet />
    </div>
    <div className={styles.topElement}>
      <div className="clickable">🙄 wtf?</div>
    </div>
  </div>
);

export default TopNav;
