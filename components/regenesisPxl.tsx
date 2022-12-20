import { useEffect } from "react";

import { useTransactionStatus } from "../contracts/helpers";
import styles from "../styles/RegenesisPage.module.scss";
import Window from "./window";

export default function RegenesisPxl({
  pxlTop,
  pxl,
  migrating,
  burnAndMint,
  setMigrating,
}: any) {
  const migratingHash = migrating[pxl.pxlId];
  const { accepted, rejected, loading } = useTransactionStatus(
    migratingHash || undefined
  );

  useEffect(() => {
    if (migratingHash && !loading) {
      if (accepted || rejected) {
        if (typeof window !== "undefined") {
          const currentMigrating =
            JSON.parse(
              localStorage.getItem("pxls-migrating-regenesis") || "{}"
            ) || {};
          delete currentMigrating[pxl.pxlId];
          localStorage.setItem(
            "pxls-migrating-regenesis",
            JSON.stringify(currentMigrating)
          );
          setMigrating(currentMigrating);
        }
      }
    }
  }, [accepted, loading, migratingHash, pxl.pxlId, rejected, setMigrating]);

  return (
    <Window
      style={{
        width: 525,
        padding: "16px 29px 30px 29px",
        top: pxlTop,
        left: 0,
        height: pxl.migrated && migrating[pxl.pxlId] ? 157 : 212,
      }}
    >
      <div style={{ marginTop: 12 }} />
      <div>
        <b>PXL #{pxl.pxlId}</b>
        <br />
        <br />
        {!pxl.migrated && (
          <p>
            {migrating[pxl.pxlId]
              ? "ℹ️ This pxl NFT is being burnt and minted. Please check again later to make sure it’s all done."
              : "⚠️ This pxl NFT was not yet migrated. Please click below to start the migration."}
            {!migrating[pxl.pxlId] && (
              <>
                <br />
                <span
                  className={styles.button}
                  onClick={() => burnAndMint(pxl.pxlId)}
                >
                  Burn and mint
                </span>
              </>
            )}
          </p>
        )}
        {pxl.migrated && (
          <p>
            {migrating[pxl.pxlId]
              ? "ℹ️ This pxl NFT is being burnt and minted. Please check again later to make sure it’s all done."
              : "✅ You’re all set! Your pxl NFT is ready for post-regenesis era on the Starknet blockchain!"}
            {!migrating[pxl.pxlId] && (
              <>
                <br />
                <a
                  href={`${process.env.NEXT_PUBLIC_ASPECT_ASSET_LINK}/${process.env.NEXT_PUBLIC_PXL_ERC721_ADDRESS}/${pxl.pxlId}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    marginTop: 32,
                    display: "inline-block",
                    marginRight: 10,
                  }}
                >
                  See it on Aspect
                </a>
                |
                <a
                  href={`${process.env.NEXT_PUBLIC_MINTSQUARE_ASSET_LINK}/${process.env.NEXT_PUBLIC_PXL_ERC721_ADDRESS}/${pxl.pxlId}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    marginTop: 32,
                    display: "inline-block",
                    marginLeft: 10,
                  }}
                >
                  See it on Mintsquare
                </a>
              </>
            )}
          </p>
        )}
      </div>
    </Window>
  );
}
