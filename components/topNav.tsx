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
      <a
        className="clickable"
        href="https://pxlswtf.notion.site/Pxls-wtf-d379e6b48f2749c2a047813815ed038f"
        target="_blank"
        rel="noreferrer"
      >
        🙄 wtf?
      </a>
    </div>
  </div>
);

export default TopNav;
