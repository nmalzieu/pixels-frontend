import { useStarknetCall } from "@starknet-react/core";
import { useRef, useState } from "react";

import { usePixelERC721Contract } from "../contracts/pixelERC721";
import { useStoreState } from "../store";
import styles from "../styles/Home.module.scss";
import Mint from "./mint";
import RainbowText from "./rainbowText";
import ScrollingText from "./scrollingText";
import Star from "./star";
import TopNav from "./topNav";

const HomeDesktop = () => {
  const state = useStoreState();

  const { contract: pixelERC721Contract } = usePixelERC721Contract();

  const { data: pixelsOfOwnerData } = useStarknetCall({
    contract: pixelERC721Contract,
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
      let newRotate = starRotate;
      const boundingRect = (starRef.current as any).getBoundingClientRect();
      const centerX = boundingRect.left + boundingRect.width / 2;
      const centerY = boundingRect.top + boundingRect.height / 2;
      if (x > centerX) {
        newRotate += diffY / 2;
      } else {
        newRotate -= diffY / 2;
      }

      if (y > centerY) {
        newRotate -= diffX / 2;
      } else {
        newRotate += diffX / 2;
      }
      setStarRotate(newRotate);
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

  const rainbowMessage = state.message;

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
      {pixelsOwned?.length > 0 && (
        <Star pxls={pixelsOwned} rotate={starRotate} innerRef={starRef} />
      )}
      <TopNav />
      <div className={styles.message}>
        {state.currentlyMintingHash ? (
          <a
            href={`${process.env.NEXT_PUBLIC_VOYAGER_LINK}/${state.currentlyMintingHash}`}
            target="_blank"
            rel="noreferrer"
          >
            <RainbowText text={rainbowMessage} />
          </a>
        ) : (
          <RainbowText text={rainbowMessage} />
        )}
      </div>
      {showMint && <Mint />}
      <ScrollingText />
    </div>
  );
};

export default HomeDesktop;
