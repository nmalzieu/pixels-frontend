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
        Hello fellow Starknet CC attendee! We are Pxls, a collaborative pixel
        art experiment on the Starknet blockchain.
        <br />
        <br />
        We have gathered a community of 400 people who will create daily
        on-chain artworks together.
        <br />
        <br />
        First rtwrks will be created by our community in a few days. Follow our
        adventures on Twitter!
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
