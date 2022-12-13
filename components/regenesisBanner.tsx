import Link from "next/link";

import styles from "../styles/RegenesisBanner.module.scss";

export default function RegenesisBanner() {
  return (
    <Link href="/regenesis">
      <div className={styles.regenesisBanner}>
        Preparing for Starknet regenesis: burn and mint your pxl NFT in order to
        keep using it.<a className={styles.clickHere}>Click here.</a>
      </div>
    </Link>
  );
}
