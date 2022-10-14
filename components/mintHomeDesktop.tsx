import { useStarknetCall } from "@starknet-react/core";
import { useRef, useState } from "react";

import { usePxlERC721Contract } from "../contracts/pxlERC721";
import { useStoreState } from "../store";
import styles from "../styles/Home.module.scss";
import windowStyles from "../styles/Window.module.scss";
import Mint from "./mint";
import RainbowText from "./rainbowText";
import ScrollingText from "./scrollingText";
import Star from "./star";
import TopNav from "./topNav";
import Window from "./window";

const MintHomeDesktop = () => {
  const state = useStoreState();

  const { contract: pxlERC721Contract } = usePxlERC721Contract();

  const { data: pixelsOfOwnerData } = useStarknetCall({
    contract: pxlERC721Contract,
    method: "pixelsOfOwner",
    args: [state.account],
  });

  const [hueRotate, setHueRotate] = useState(0);
  const [isMouseClicked, setIsMouseClicked] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [starRotate, setStarRotate] = useState(0);

  const starRef = useRef();

  const handleMouseMove = (event: any) => {
    // Moving the mouse changes the logo color
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

    // If mouse is clicked and the star is shown,
    // it also rotates the star
    if (isMouseClicked && pixelsOwned?.length > 0 && starRef.current) {
      const { x: lastX, y: lastY } = lastMousePosition;
      const diffX = x - lastX;
      const diffY = y - lastY;

      // Depending on cursor position and star center,
      // diffX and diffY are added / subtracted
      let addRotate = 0;
      const boundingRect = (starRef.current as any).getBoundingClientRect();
      const centerX = boundingRect.left + boundingRect.width / 2;
      const centerY = boundingRect.top + boundingRect.height / 2;
      if (x > centerX) {
        addRotate += diffY;
      } else {
        addRotate -= diffY;
      }

      if (y > centerY) {
        addRotate -= diffX;
      } else {
        addRotate += diffX;
      }
      addRotate = addRotate / 4;
      setStarRotate(starRotate + addRotate);
    }
    setLastMousePosition({ x, y });
  };

  const pixelsOwned = (pixelsOfOwnerData as any)?.pixels?.map((p: any) =>
    p.toNumber()
  );
  let showMint = true;

  // If logged in, check
  // if already has a pxl
  // and hide button
  if (
    state.account &&
    pixelsOfOwnerData &&
    pixelsOwned &&
    pixelsOwned.length > 0
  ) {
    showMint = false;
  }

  // If currently minting, hiding
  if (state.currentlyMintingHash) {
    showMint = false;
  }

  // If done minting, hiding
  if (process.env.NEXT_PUBLIC_MINT_DONE) {
    showMint = false;
  }

  let rainbowMessage: any = "";
  if (state.message) {
    if (state.currentlyMintingHash || state.failedMintHash) {
      rainbowMessage = (
        <a
          href={`${process.env.NEXT_PUBLIC_VOYAGER_LINK}/${
            state.currentlyMintingHash || state.failedMintHash
          }`}
          target="_blank"
          rel="noreferrer"
        >
          <RainbowText text={state.message} />
        </a>
      );
    } else {
      rainbowMessage = <RainbowText text={state.message} />;
    }
  } else if (process.env.NEXT_PUBLIC_MINT_DONE) {
    let messageWithLink = (
      <span>
        all pxl NFTs have been minted - join us on{" "}
        <a
          href="https://discord.gg/ufafywMTQh"
          target="_blank"
          rel="noreferrer"
          className="clickable"
        >
          Discord
        </a>{" "}
        &{" "}
        <a
          href="https://twitter.com/PxlsWtf"
          target="_blank"
          rel="noreferrer"
          className="clickable"
        >
          Twitter
        </a>{" "}
        for next announcements
      </span>
    );
    rainbowMessage = <RainbowText text={messageWithLink} />;
  }

  return (
    <div
      className={styles.home}
      onMouseMove={handleMouseMove}
      onMouseDown={() => setIsMouseClicked(true)}
      onMouseUp={() => setIsMouseClicked(false)}
    >
      <div
        className={styles.gridLogo}
        style={{ filter: `hue-rotate(${hueRotate}deg)` }}
      />
      {state.account && pixelsOwned?.length > 0 && (
        <Star pxls={pixelsOwned} rotate={starRotate} innerRef={starRef} />
      )}
      <TopNav />
      {rainbowMessage && (
        <Window
          style={{
            width: "auto",
            position: "absolute",
            left: 108,
            top: 148,
            padding: "10px 14px",
          }}
        >
          {rainbowMessage}
        </Window>
      )}

      {showMint && <Mint />}
      {state.account && pixelsOwned?.length > 0 && (
        <Window
          style={{
            width: 300,
            top: 369,
            left: `50%`,
            transform: "translateX(25%)",
          }}
        >
          <div className={windowStyles.rainbowBar}>&nbsp; </div>
          <div className={windowStyles.windowContent}>
            Welcome to the pxl community!
            <br />
            <b>Next step:</b> create our very first rtwrk together!
            <br />
            <a
              href="https://discord.gg/ufafywMTQh"
              target="_blank"
              rel="noreferrer"
            >
              Join the Discord
            </a>{" "}
            &{" "}
            <a
              href="https://twitter.com/PxlsWtf"
              target="_blank"
              rel="noreferrer"
            >
              follow Pxls on Twitter
            </a>{" "}
            to be notified on pxl-day.
          </div>
        </Window>
      )}
      <ScrollingText />
    </div>
  );
};

export default MintHomeDesktop;
