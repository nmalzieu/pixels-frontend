import LogoImage from "../public/logo.svg";
import styles from "../styles/TopNav.module.scss";
import ConnectToStarknet from "./connectToStarknet";

type Props = {
  white?: boolean;
  logo?: boolean;
};

const TopNav = ({ white, logo }: Props) => (
  <div className={`${styles.top} ${white ? styles.topWhite : ""}`}>
    <div className={styles.topElement}>
      <ConnectToStarknet connectButton="👛 connect wallet" />
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
    {logo && (
      <div className={styles.logo}>
        <LogoImage />
      </div>
    )}
  </div>
);

export default TopNav;
