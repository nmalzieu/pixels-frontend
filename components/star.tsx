import Image from "next/image";
import styles from "../styles/Star.module.scss";

const Star = ({ pxls }: { pxls: number[] }) => (
  <div className={styles.star}>
    <Image
      src="/star.svg"
      alt="Star"
      width={532}
      height={506}
      layout="fixed"
      className={styles.starImage}
    />
    <div className={styles.message}>
      YOU OWN
      <br />
      PXL #{pxls.join(",")}
    </div>
  </div>
);

export default Star;
