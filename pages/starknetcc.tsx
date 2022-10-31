import { NextPage } from "next";

import LogoImage from "../public/logo.svg";
import styles from "../styles/StarknetCC.module.scss";

const StarknetCC: NextPage = () => {
  return (
    <div className={styles.StarknetCC}>
      <div className={styles.logo}>
        <LogoImage />
      </div>
      <div className={styles.message}>
        Hello fellow Starknet.cc attendee!
        <br />
        <br />
        We are a community of 400 pxl NFT holders. Every two days, we draw
        on-chain collaborative pixel art for web3 collectors.
        <br />
        <br />
        If you want us do draw something for you, propose a theme and a bid. If
        you win the auction, we will draw your theme and you will get your
        artwork (“rtwrk”) as an NFT.
        <br />
        <br />
        Visit{" "}
        <a href="https://pxls.wtf/" style={{ textDecoration: "underline" }}>
          https://pxls.wtf/
        </a>{" "}
        on desktop to propose a theme!
      </div>
      <a href="https://twitter.com/PxlsWtf" target="_blank" rel="noreferrer">
        <img src="/twitter.png" alt="Twitter" />
        <br />
        Twitter
      </a>
    </div>
  );
};

export default StarknetCC;
