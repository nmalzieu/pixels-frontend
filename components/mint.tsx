import { uint256 } from "starknet";
import { useStarknetCall } from "@starknet-react/core";
import { usePixelERC721Contract } from "../contracts/pixelERC721";
import { useStarknetTransactionManager } from "@starknet-react/core";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import styles from "../styles/Mint.module.scss";
import { useStoreDispatch, useStoreState } from "../store";
import { useInvoke } from "../contracts/helpers";
import MintButtonImage from "../public/mint-button.svg";
import MintButtonImageHover from "../public/mint-button-hover.svg";

const Mint = () => {
  const [hoverMintButton, setHoverMintButton] = useState(false);
  const [isMintReady, setIsMintReady] = useState(false);
  const [waitingToMint, setWaitingToMint] = useState(false);
  const [addedTransactionToRefresh, setAddedTransactionToRefresh] =
    useState(false);
  const state = useStoreState();
  const dispatch = useStoreDispatch();

  const { transactions } = useStarknetTransactionManager();

  const { contract: pixelERC721Contract } = usePixelERC721Contract();

  const { data: totalSupplyData } = useStarknetCall({
    contract: pixelERC721Contract,
    method: "totalSupply",
    args: [],
  });

  const { data: maxSupplyData } = useStarknetCall({
    contract: pixelERC721Contract,
    method: "maxSupply",
    args: [],
  });

  const { invoke: mint } = useInvoke({
    contract: pixelERC721Contract,
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
      dispatch.setMessage("please connect wallet before minting");
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
