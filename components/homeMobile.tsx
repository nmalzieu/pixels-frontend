import { useState } from "react";
import styles from "../styles/Mobile.module.scss";

const HomeMobile = () => {
  const [numberOfClones, setNumberOfClones] = useState(0);
  const duplicate = () => {
    const original = document.getElementById("alert") as any;
    if (!original) return;
    const boundingRect = original.getBoundingClientRect();
    const clone = original.cloneNode(true) as any;
    clone.id = `alert-${numberOfClones + 1}`;
    clone.onclick = duplicate;
    const pageWidth = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );
    const pageHeight = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0
    );
    const x = Math.random() * (pageWidth - 0.8 * boundingRect.width);
    const y = Math.random() * (pageHeight - 0.7 * boundingRect.height);
    clone.style = `position: absolute; top: ${y}px; left: ${x}px;`;
    setNumberOfClones(numberOfClones + 1);
    original.parentNode.appendChild(clone);
  };
  return (
    <div className={styles.homeMobile}>
      <div className={styles.mobile}>
        <div className={styles.alert} onClick={duplicate} id="alert">
          <div className={styles.alertTop}></div>
          <div className={styles.alertContent}>
            PXLS only works on real computers, you boomer
            <div className={styles.alertButton}>ok</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeMobile;
