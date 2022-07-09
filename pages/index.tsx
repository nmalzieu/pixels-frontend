import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useStarknet, useStarknetCall } from "@starknet-react/core";
import Mint from "../components/mint";
import ConnectToStarknet from "../components/connectToStarknet";
import styles from "../styles/Home.module.scss";
import { useStoreState } from "../store";
import RainbowText from "../components/rainbowText";
import { usePixelERC721Contract } from "../contracts/pixelERC721";
import Star from "../components/star";
import ScrollingText from "../components/scrollingText";

const Home: NextPage = () => {
  const state = useStoreState();

  const { contract: pixelERC721Contract } = usePixelERC721Contract();

  const { data: pixelsOfOwnerData, loading: pixelsOfOwnerLoading } =
    useStarknetCall({
      contract: pixelERC721Contract,
      method: "pixelsOfOwner",
      args: [state.account],
    });

  const [hueRotate, setHueRotate] = useState(0);

  const handleMouseMove = (event: any) => {
    const x = event.screenX;
    const y = event.screenY;
    const width = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );
    const height = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0
    );
    const position = (x + y) / (width + height);
    const rotate = 3 * position * 360;
    setHueRotate(rotate);
  };

  const pixelsOwned = (pixelsOfOwnerData as any)?.pixels?.map((p: any) =>
    p.toNumber()
  );
  let showMint = true;

  // If logged in...
  if (
    state.account &&
    !pixelsOfOwnerLoading &&
    pixelsOwned &&
    pixelsOwned.length > 0
  ) {
    showMint = false;
  }

  const rainbowMessage = state.message;

  return (
    <div className={styles.home} onMouseMove={handleMouseMove}>
      <div
        className={styles.gridLogo}
        style={{ filter: `hue-rotate(${hueRotate}deg)` }}
      />
      {pixelsOwned?.length > 0 && <Star pxls={pixelsOwned} />}
      <div className={styles.top}>
        <div className={styles.topElement}>
          <ConnectToStarknet />
        </div>
        <div className={styles.topElement}>
          <div className="clickable">🙄 wtf?</div>
        </div>
      </div>
      <div className={styles.message}>
        <RainbowText text={rainbowMessage} />
      </div>
      {showMint && <Mint />}
      <ScrollingText />
    </div>
  );
};

export default Home;
