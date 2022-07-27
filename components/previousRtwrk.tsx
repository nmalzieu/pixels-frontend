import { useStarknetCall } from "@starknet-react/core";
import moment from "moment-timezone";
import { useEffect, useRef, useState } from "react";

import { usePixelDrawerContract } from "../contracts/pixelDrawer";
import LeftArrow from "../public/left-arrow.svg";
import RightArrow from "../public/right-arrow.svg";
import styles from "../styles/PreviousRtwrk.module.scss";
import GridComponent from "./grid";
import GridLoader from "./gridLoader";

type Props = {
  maxRound: number;
  matrixSize?: number;
};

const TripleSeparator = () => (
  <>
    <div className={styles.singleSeparator} />
    <div className={styles.singleSeparator} />
    <div className={styles.singleSeparator} />
  </>
);

const PreviousRtwrk = ({ matrixSize, maxRound }: Props) => {
  const [round, setRound] = useState(maxRound - 1);

  const { contract: pixelDrawerContract } = usePixelDrawerContract();
  const { data: drawingTimestampData } = useStarknetCall({
    contract: pixelDrawerContract,
    method: "drawingTimestamp",
    args: [round],
  });
  const roundRef = useRef(round);
  const [timestamp, setTimestamp] = useState(0);

  useEffect(() => {
    if (roundRef.current !== round) {
      setTimestamp(0);
    }
    roundRef.current = round;
  }, [round, setTimestamp]);

  useEffect(() => {
    if (round === -1 && maxRound > 0) {
      setRound(maxRound - 1);
    }
  }, [maxRound, round]);

  useEffect(() => {
    if (drawingTimestampData) {
      const t = drawingTimestampData[0].toNumber();
      if (t !== timestamp) {
        setTimestamp(t);
      }
    }
  }, [drawingTimestampData, setTimestamp, timestamp]);

  let component = <GridLoader />;
  if (round > 0 && matrixSize && timestamp) {
    component = (
      <GridComponent
        gridSize={matrixSize}
        round={round}
        myPixels={[]}
        timestamp={timestamp}
        viewerOnly
      />
    );
  }

  const beginningOfDrawing = moment.unix(timestamp).tz("Europe/Paris");

  return (
    <div className={styles.previousRtwrks}>
      <div className={styles.previousRtwrksContent}>{component}</div>
      <div className={styles.previousRtwrksSide}>
        Previous rtwrks
        <TripleSeparator />
        <div className={styles.previousRtwrksTitle}>
          RTWRK {round === -1 ? "..." : round}
        </div>
        <div>
          Colorized{" "}
          <b>
            {timestamp ? beginningOfDrawing.format("MMMM DD, YYYY") : "..."}
          </b>
        </div>
        <div className={styles.arrows}>
          <span
            className={`${styles.arrow} ${
              round === 1 ? styles.arrowDisabled : ""
            }`}
          >
            <LeftArrow
              onClick={() => {
                if (round > 1) {
                  setRound(round - 1);
                }
              }}
            />
          </span>
          <span
            className={`${styles.arrow} ${
              round >= maxRound - 1 ? styles.arrowDisabled : ""
            }`}
          >
            <RightArrow
              onClick={() => {
                if (round < maxRound) {
                  setRound(round + 1);
                }
              }}
            />
          </span>
        </div>
      </div>
    </div>
  );
};

export default PreviousRtwrk;
