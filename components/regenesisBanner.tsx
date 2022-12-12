import Link from "next/link";

import styles from "../styles/RegenesisBanner.module.scss";

export default function RegenesisBanner() {
  return (
    <Link href="/regenesis">
      <div className={styles.regenesisBanner}>
        Preparing for Starknet regenesis: burn and mint your pxl NFT in order to
        keep using it. Click here.
      </div>
    </Link>
  );
}
