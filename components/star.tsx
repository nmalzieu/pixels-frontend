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
      style={{ transform: `rotate(${realRotate}deg)` }}
      ref={innerRef}
    >
      <StarImage />
      <div className={styles.message}>
        YOU OWN
        <br />
        PXL #{pxls.join(",")}
      </div>
    </div>
  );
};

export default Star;
