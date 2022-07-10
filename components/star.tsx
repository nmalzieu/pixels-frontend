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
  let pxlsLink = (
    <a
      target="_blank"
      href={`${process.env.NEXT_PUBLIC_ASPECT_LINK}/${process.env.NEXT_PUBLIC_PIXEL_ERC721_ADDRESS}/${pxls[0]}`}
      rel="noreferrer"
    >
      PXL #{pxls[0]}
    </a>
  );
  if (pxls.length > 1) {
    pxlsLink = (
      <span>
        PXLS #
        {pxls.map((pxl, index) => (
          <span key={pxl}>
            {index > 0 && ","}
            <a
              target="_blank"
              href={`${process.env.NEXT_PUBLIC_ASPECT_LINK}/${process.env.NEXT_PUBLIC_PIXEL_ERC721_ADDRESS}/${pxl}`}
              rel="noreferrer"
            >
              {pxl}
            </a>
          </span>
        ))}
      </span>
    );
  }
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
        {pxlsLink}
      </div>
    </div>
  );
};

export default Star;
