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
        Hello fellow starknet.cc attendee! We are Pxls, a collaborative pixel
        art experiment on the Starknet blockchain.
        <br />
        <br />
        We are gathering a community of 400 people who will create daily
        artworks together.
        <br />
        <br />
        Each member of the community owns a pxl NFT. Every day, each holder can
        colorize a pixel in a 20*20 grid: we collectively give birth to an
        rtwrk.
        <br />
        <br />
        When we printed this t-shirt, we thought there would still be pxl NFTs
        available for minting. It actually went way faster than we thought and
        all 400 NFTs are already minted.
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
