import { useStarknetCall } from "@starknet-react/core";
import { useEffect } from "react";
import { bnToUint256 } from "starknet/dist/utils/uint256";

import { usePixelDrawer2Contract } from "../contracts/pixelDrawer2";
import { useStoreDispatch } from "../store";
import styles from "../styles/Colorizations.module.scss";
import windowStyles from "../styles/Window.module.scss";
import Window from "./window";

type Props = {
  round: number;
  tokenId: number;
  temporaryColorizations: number;
};

const Colorizations = ({ round, tokenId, temporaryColorizations }: Props) => {
  const { contract: pixelDrawerContract } = usePixelDrawer2Contract();
  const dispatch = useStoreDispatch();

  const { data: numberOfColorizationsData } = useStarknetCall({
    contract: pixelDrawerContract,
    method: "numberOfColorizations",
    args: [round, bnToUint256(tokenId)],
  });

  const numberOfCommittedColorizations = numberOfColorizationsData
    ? numberOfColorizationsData[0].toNumber()
    : "...";

  const remainingColorizations =
    40 - numberOfCommittedColorizations - temporaryColorizations;

  useEffect(() => {
    const num = numberOfColorizationsData
      ? numberOfColorizationsData[0].toNumber()
      : undefined;
    dispatch.setCommittedColorizations(num);
  }, [dispatch, numberOfColorizationsData]);

  return (
    <Window style={{ width: 320, top: 393, left: 0 }}>
      <div className={`${windowStyles.rainbowBar} ${windowStyles.rainbowBar1}`}>
        🤓 Colorizations
      </div>
      <div className={styles.colorizationsCounter}>
        <div
          style={{
            padding: 10,
            paddingRight: 20,
            borderRight: "1px solid black",
            marginRight: 19,
          }}
        >
          <div
            style={{
              fontSize: 40,
              marginBottom: 10,
              marginTop: 5,
            }}
          >
            {isNaN(remainingColorizations) ? "..." : remainingColorizations}
          </div>{" "}
          actions left
        </div>
        <div
          style={{
            textAlign: "left",
            display: "flex",
            alignItems: "center",
          }}
        >
          {numberOfCommittedColorizations} already committed
          <br />
          {temporaryColorizations} not committed
        </div>
      </div>
    </Window>
  );
};

export default Colorizations;
