import Marquee from "react-fast-marquee";

import styles from "../styles/ScrollingText.module.scss";

type Props = {
  small?: boolean;
};

const ScrollingText = ({ small }: Props) => (
  <div className={`${styles.scrollingText} ${small ? styles.small : ""}`}>
    {!small && (
      <>
        <div className={styles.separator} />
        <div className={styles.separator} />
      </>
    )}
    <Marquee className={styles.marquee} gradient={false} speed={200}>
      PXLS IS A COLLABORATIVE BLOCKCHAIN ART EXPERIMENT&nbsp;PXLS IS A
      COLLABORATIVE BLOCKCHAIN ART EXPERIMENT&nbsp;
    </Marquee>
    {small && <div className={styles.separator} />}
  </div>
);

export default ScrollingText;
