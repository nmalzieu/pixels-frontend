import { useEffect, useState } from "react";

import styles from "../styles/GridLoader.module.scss";

const GridLoader = () => {
  const [showIndex, setShowIndex] = useState(3);
  useEffect(() => {
    const interval = setInterval(() => {
      setShowIndex((showIndex + 1) % 4);
    }, 1000);
    return () => clearInterval(interval);
  }, [showIndex]);
  return (
    <div className={styles.gridLoader}>
      {showIndex > 0 && <div className={styles.dot1} />}
      {showIndex > 1 && <div className={styles.dot2} />}
      {showIndex > 2 && <div className={styles.dot3} />}
    </div>
  );
};

export default GridLoader;
