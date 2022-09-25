import { useStarknetCall } from "@starknet-react/core";
import { useCallback, useEffect, useState } from "react";
import { uint256 } from "starknet";

import { useInvoke } from "../contracts/helpers";
import { usePxlERC721Contract } from "../contracts/pxlERC721";
import MintButtonImage from "../public/mint-button.svg";
import MintButtonImageHover from "../public/mint-button-hover.svg";
import { useStoreDispatch, useStoreState } from "../store";
import styles from "../styles/Mint.module.scss";

const Mint = () => {
  const [hoverMintButton, setHoverMintButton] = useState(false);
  const [isMintReady, setIsMintReady] = useState(false);
  const [waitingToMint, setWaitingToMint] = useState(false);
  const state = useStoreState();
  const dispatch = useStoreDispatch();

  const { contract: pxlERC721Contract } = usePxlERC721Contract();

  const { data: totalSupplyData } = useStarknetCall({
    contract: pxlERC721Contract,
    method: "totalSupply",
    args: [],
  });

  const { data: maxSupplyData } = useStarknetCall({
    contract: pxlERC721Contract,
    method: "maxSupply",
    args: [],
  });

  const { invoke: mint } = useInvoke({
    contract: pxlERC721Contract,
    method: "mint",
  });

  const mintIfPossible = useCallback(() => {
    if (!state.account || !totalSupplyData || !maxSupplyData) return;
    const totalSupply = uint256.uint256ToBN(totalSupplyData?.[0]).toNumber();
    const maxSupply = uint256.uint256ToBN(maxSupplyData?.[0]).toNumber();
    if (totalSupply === maxSupply) {
      dispatch.setMessage("all pxl NFTs have been minted");
    } else {
      mint({
        args: [state.account],
        metadata: {
          method: "mint",
        },
      });
    }
  }, [state.account, dispatch, maxSupplyData, mint, totalSupplyData]);

  useEffect(() => {
    // This checks regularly to see if we're ready
    // to mint or still waiting for some data from
    // Starknet (totalSupply / maxSupply)
    const interval = setInterval(() => {
      if (totalSupplyData && maxSupplyData && !isMintReady) {
        if (state.account && waitingToMint) {
          setWaitingToMint(false);
          mintIfPossible();
        }
        setIsMintReady(true);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [
    state.account,
    isMintReady,
    maxSupplyData,
    mint,
    mintIfPossible,
    totalSupplyData,
    waitingToMint,
  ]);

  const mintPixel = () => {
    if (!state.account) {
      dispatch.setMessage("please connect your Starknet wallet before minting");
    } else if (!isMintReady) {
      setWaitingToMint(true);
    } else {
      mintIfPossible();
    }
  };

  return (
    <div
      className={styles.mintButton}
      onClick={mintPixel}
      onMouseEnter={() => setHoverMintButton(true)}
      onMouseLeave={() => setHoverMintButton(false)}
    >
      {hoverMintButton ? <MintButtonImageHover /> : <MintButtonImage />}
    </div>
  );
};

export default Mint;
