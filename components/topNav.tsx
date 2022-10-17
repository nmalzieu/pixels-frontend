import Link from "next/link";

import LogoImage from "../public/logo.svg";
import { useStoreState } from "../store";
import styles from "../styles/TopNav.module.scss";
import { capitalizeFirstLetter } from "../utils";
import ConnectToStarknet from "./connectToStarknet";

type Props = {
  white?: boolean;
  logo?: boolean;
};

const TopNav = ({ white, logo }: Props) => {
  const state = useStoreState();
  return (
    <div className={`${styles.top} ${white ? styles.topWhite : ""}`}>
      <div className={styles.topElement}>
        <Link href="/">
          <a className="clickable">🦄 home</a>
        </Link>
      </div>
      <div className={styles.topElement}>
        <Link href="/draw">
          <a className="clickable">🎨 draw</a>
        </Link>
      </div>
      <div className={styles.topElement}>
        <Link href="/collection">
          <a className="clickable">🖼 my collection</a>
        </Link>
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
      <div
        className={styles.topElement}
        style={{ marginLeft: "auto", marginRight: 0 }}
      >
        <ConnectToStarknet connectButton="👛 connect wallet" />
        {state.message && (
          <div className={styles.wrongNetworkMessage}>
            😵👆
            <br />
            Wrong network!
            <br />
            {capitalizeFirstLetter(state.message)}
          </div>
        )}
      </div>
      {logo && (
        <Link href="/">
          <div className={styles.logo}>
            <LogoImage />
          </div>
        </Link>
      )}
    </div>
  );
};

export default TopNav;
