import Link from "next/link";
import { useRouter } from "next/router";
import { BigNumberish } from "starknet/utils/number";

import { useCall } from "../contracts/helpers";
import { usePxlERC721Contract } from "../contracts/pxlERC721";
import { useRtwrkERC721Contract } from "../contracts/rtwrkERC721";
import { useStoreState } from "../store";
import styles from "../styles/CollectionPage.module.scss";
import CollectionPxl from "./collectionPxl";
import CollectionRtwtk from "./collectionRtwrk";
import CollectionRtwrkEdit from "./collectionRtwrkEdit";
import ConnectToStarknet from "./connectToStarknet";
import Loading from "./loading";
import TopNav from "./topNav";

const CollectionPage = () => {
  const router = useRouter();
  const { editing: editingStepForRtwrk } = router.query;
  const state = useStoreState();
  const showDisconnected = !state.account && state.rehydrated;
  const { contract: pxlERC721Contract } = usePxlERC721Contract();
  const { contract: rtwrkERC721Contract } = useRtwrkERC721Contract();
  const { data: pxlsOwnedData, loading: pxlsOwnedLoading } = useCall({
    contract: pxlERC721Contract,
    method: "pxlsOwned",
    args: [state.account || ""],
    condition: !!state.account,
  });
  const { data: rtwrksOwnedData, loading: rtwrksOwnedLoading } = useCall({
    contract: rtwrkERC721Contract,
    method: "rtwrksOwned",
    args: [state.account || ""],
    condition: !!state.account,
  });
  const loading = pxlsOwnedLoading || rtwrksOwnedLoading;
  const pxlsOwned =
    pxlsOwnedLoading || !pxlsOwnedData?.[0]
      ? []
      : pxlsOwnedData[0]?.map((p: BigNumberish) => p.toNumber());
  const rtwrksOwned =
    rtwrksOwnedLoading || !rtwrksOwnedData?.[0]
      ? []
      : rtwrksOwnedData[0].map((p: BigNumberish) => p.toNumber());
  const doesNotOwnAnything = pxlsOwned.length === 0 && rtwrksOwned.length === 0;
  const height = editingStepForRtwrk
    ? 1000
    : 171 + rtwrksOwned.length * 970 + pxlsOwned.length * 977 + 600;

  return (
    <div className={styles.collectionPage}>
      <div className={styles.collectionPageContent} style={{ height }}>
        <div className={styles.collectionPageContainer} style={{ height }}>
          <TopNav white logo />
          {showDisconnected && (
            <>
              <div className={styles.whiteMessage}>
                <img src="/crown.svg" alt="Crown" className={styles.crown} />
                <br />
                <br />
                gm!
                <br />
                <br />
                <ConnectToStarknet
                  connectButton={
                    <span className={styles.connectToStarknet}>
                      Connect your starknet wallet
                    </span>
                  }
                />{" "}
                to visualize your pxl & rtwrk NFTs.
              </div>
              <a
                className={styles.twitter}
                style={{ left: 450, top: 500 }}
                href="https://twitter.com/PxlsWtf"
                target="_blank"
                rel="noreferrer"
              >
                <img src="/twitter-text.png" alt="Twitter" />
              </a>
              <a
                className={styles.discord}
                style={{ left: 580, top: 600 }}
                href="https://discord.com/invite/ufafywMTQh"
                target="_blank"
                rel="noreferrer"
              >
                <img src="/discord-text.png" alt="Discord" />
              </a>
            </>
          )}
          {loading && <Loading className={styles.loading} />}
          {!showDisconnected &&
            state.rehydrated &&
            !loading &&
            (loading || doesNotOwnAnything) && (
              <>
                <img src="/skate.svg" alt="Skate" className={styles.skate} />
                <div
                  className={styles.whiteMessage}
                  style={{
                    textAlign: "left",
                    position: "absolute",
                    top: 250,
                    width: 264,
                    left: 650,
                  }}
                >
                  {!loading && (
                    <>
                      hey art lover
                      <br />
                      <br />
                      there are two ways to join the Pxls experiment:
                      <br />
                      <br />
                      1/ become an artist - get a pxl NFT and draw rtwrks with
                      the community. See the collection on{" "}
                      <a
                        href={`${process.env.NEXT_PUBLIC_ASPECT_COLLECTION_LINK}/${process.env.NEXT_PUBLIC_PXL_ERC721_ADDRESS}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "underline" }}
                      >
                        Aspect
                      </a>{" "}
                      or{" "}
                      <a
                        href={`${process.env.NEXT_PUBLIC_MINTSQUARE_COLLECTION_LINK}/${process.env.NEXT_PUBLIC_PXL_ERC721_ADDRESS}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "underline" }}
                      >
                        Mintsquare
                      </a>
                      .
                      <br />
                      <br />
                      2/ become a commissioner - ask us to draw the theme of
                      your choice and get the NFT of the rtwrk. Auctions happen
                      once every two days{" "}
                      <Link href="/">
                        <a style={{ textDecoration: "underline" }}>
                          on our website
                        </a>
                      </Link>
                      .
                    </>
                  )}
                </div>
                <a
                  className={styles.twitter}
                  style={{ left: 250, top: 400 }}
                  href="https://twitter.com/PxlsWtf"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src="/twitter-text.png" alt="Twitter" />
                </a>
                <a
                  className={styles.discord}
                  style={{ left: 470, top: 620 }}
                  href="https://discord.com/invite/ufafywMTQh"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src="/discord-text.png" alt="Discord" />
                </a>
              </>
            )}
          {!showDisconnected &&
            !loading &&
            !doesNotOwnAnything &&
            !editingStepForRtwrk && (
              <div className={styles.rtwrksAndPixels}>
                {rtwrksOwned.map((rtwrkId: number) => (
                  <CollectionRtwtk
                    key={rtwrkId}
                    rtwrkId={rtwrkId}
                    setEditingStepForRtwrk={() => {
                      router.replace(`/collection?editing=${rtwrkId}`);
                    }}
                  />
                ))}
                {pxlsOwned.map((pxlId: number) => (
                  <CollectionPxl key={pxlId} pxlId={pxlId} />
                ))}
              </div>
            )}
          {!showDisconnected &&
            !loading &&
            !doesNotOwnAnything &&
            editingStepForRtwrk && (
              <CollectionRtwrkEdit
                rtwrkId={parseInt(`${editingStepForRtwrk}`, 10)}
              />
            )}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;
