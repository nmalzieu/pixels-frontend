import styles from "../styles/Star.module.scss";
import StarImage from "../public/star.svg";

const Star = ({
  pxls,
  rotate,
  innerRef,
}: {
  pxls: number[];
  rotate: number;
  innerRef: any;
}) => {
  const basicRotate = -21.23;
  const realRotate = rotate + basicRotate;
  return (
    <div
      className={styles.star}
      style={{ transform: `translate(-50%, -50%) rotate(${realRotate}deg)` }}
      ref={innerRef}
    >
      <StarImage />
      <div className={styles.message}>
        YOU OWN
        <br />
        <span className={styles.underline}>PXL #{pxls.join(",")}</span>
      </div>
    </div>
  );
};

export default Star;
