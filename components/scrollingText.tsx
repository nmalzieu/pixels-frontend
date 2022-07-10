import Marquee from "react-fast-marquee";
import styles from "../styles/ScrollingText.module.scss";

const ScrollingText = () => (
  <div className={styles.scrollingText}>
    <div className={styles.separator} />
    <div className={styles.separator} />
    <Marquee className={styles.marquee} gradient={false} speed={200}>
    PXLS IS A COLLABORATIVE BLOCKCHAIN ART EXPERIMENT&nbsp;PXLS IS A COLLABORATIVE BLOCKCHAIN ART EXPERIMENT&nbsp;
    </Marquee>
  </div>
);

export default ScrollingText;
