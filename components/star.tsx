import Image from "next/image";
import styles from "../styles/Star.module.scss";
import StarImage from "../public/star.svg";

const Star = ({ pxls }: { pxls: number[] }) => (
  <div className={styles.star}>
    <StarImage />
    <div className={styles.message}>
      YOU OWN
      <br />
      PXL #{pxls.join(",")}
    </div>
  </div>
);

export default Star;
