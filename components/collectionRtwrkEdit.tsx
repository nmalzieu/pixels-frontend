import { useStarknetCall } from "@starknet-react/core";
import { useEffect, useRef, useState } from "react";
import ReactSlider from "react-slider";
import { bnToUint256 } from "starknet/dist/utils/uint256";

import { useExecute, useTransactionStatus } from "../contracts/helpers";
import { useRtwrkDrawerContract } from "../contracts/rtwrkDrawer";
import { useRtwrkERC721Contract } from "../contracts/rtwrkERC721";
import SmallClock from "../public/clock-small.svg";
import styles from "../styles/CollectionRtwrkEdit.module.scss";
import Button from "./button";
import Grid from "./grid";
import GridLoader from "./gridLoader";

type Props = {
  rtwrkId: number;
};

const CollectionRtwrkEdit = ({ rtwrkId }: Props) => {
  const { contract: rtwrkDrawerContract } = useRtwrkDrawerContract();
  const { contract: rtwrkERC721Contract } = useRtwrkERC721Contract();
  const { data: rtwrkStepsCountData, loading: rtwrkStepsCountLoading } =
    useStarknetCall({
      contract: rtwrkDrawerContract,
      method: "rtwrkStepsCount",
      args: [rtwrkId],
    });
  const { data: currentRtwrkStepData, loading: currentRtwrkStepLoading } =
    useStarknetCall({
      contract: rtwrkERC721Contract,
      method: "rtwrkStep",
      args: [bnToUint256(rtwrkId)],
    });
  const loading = rtwrkStepsCountLoading || currentRtwrkStepLoading;
  const rtwrkStepsCount = loading ? 0 : rtwrkStepsCountData?.[0].toNumber();
  const currentRtwrkStep = loading ? 0 : currentRtwrkStepData?.[0].toNumber();
  const [sliderStep, setSliderStep] = useState(
    currentRtwrkStep || rtwrkStepsCount
  );
  const [previewStep, setPreviewStep] = useState(-1);
  const initialUpdate = useRef(false);
  useEffect(() => {
    const newValue = currentRtwrkStep || rtwrkStepsCount;
    if (!initialUpdate.current && newValue > 0) {
      initialUpdate.current = true;
      setSliderStep(newValue);
    }
  }, [rtwrkStepsCount, currentRtwrkStep]);

  const { execute: selectRtwrkStepExecute } = useExecute({
    calls: {
      contractAddress: rtwrkERC721Contract?.address,
      entrypoint: "selectRtwrkStep",
      calldata: [
        bnToUint256(rtwrkId).low,
        bnToUint256(rtwrkId).high,
        previewStep,
      ],
    },
  });

  const updatingHash =
    typeof window !== "undefined" &&
    localStorage.getItem(`pxls-selecting-step-${rtwrkId}`);

  const [updatingStep, setUpdatingStep] = useState(
    typeof window !== "undefined" &&
      !!localStorage.getItem(`pxls-selecting-step-${rtwrkId}`)
  );

  const {
    accepted: updatingAccepted,
    rejected: updatingRejected,
    loading: updatingLoading,
  } = useTransactionStatus(updatingHash || undefined);

  useEffect(() => {
    if (updatingHash && !updatingLoading) {
      if (updatingAccepted || updatingRejected) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(`pxls-selecting-step-${rtwrkId}`);
        }
        setUpdatingStep(false);
      }
    }
  }, [
    rtwrkId,
    updatingAccepted,
    updatingHash,
    updatingLoading,
    updatingRejected,
  ]);

  const selectRtwrkStep = () => {
    selectRtwrkStepExecute()
      .then((r: any) => {
        localStorage.setItem(
          `pxls-selecting-step-${rtwrkId}`,
          r.transaction_hash
        );
        setUpdatingStep(true);
      })
      .catch(console.warn);
  };

  return (
    <div className={styles.collectionRtwrkEdit}>
      <div className={styles.gridContainer}>
        {loading && <GridLoader />}
        {!loading && (
          <Grid
            round={rtwrkId}
            gridSize={20}
            viewerOnly
            step={previewStep > 0 ? previewStep : currentRtwrkStep}
          />
        )}
      </div>
      {!loading && (
        <>
          {!updatingStep && (
            <ReactSlider
              className="slider"
              thumbClassName="sliderThumb"
              trackClassName="sliderTrack"
              marks={rtwrkStepsCount}
              min={1}
              max={rtwrkStepsCount}
              value={sliderStep}
              onChange={(step: number) => {
                setSliderStep(step);
              }}
              onAfterChange={(step: number) => {
                setPreviewStep(step);
              }}
            />
          )}

          <div
            style={{
              height: 1,
              width: "100%",
              backgroundColor: "black",
              marginTop: updatingStep ? 20 : 80,
            }}
          />
          <div
            style={{
              fontStyle: "italic",
              fontSize: 30,
              marginTop: 25,
              marginBottom: 25,
            }}
          >
            RTWRK #{rtwrkId}
          </div>
          <div>
            Choose the step that you want as the image of your NFT. You can
            change it anytime in the future.
          </div>
          <br />
          {!updatingStep && (
            <Button
              disabled={previewStep === currentRtwrkStep || previewStep === -1}
              rainbow
              block
              text="Set new NFT image"
              action={selectRtwrkStep}
            />
          )}
          {updatingStep && (
            <div>
              <SmallClock />
              <br /> <br />
              Your new NFT image is being set on the blockchain. It can take up
              to several hours.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CollectionRtwrkEdit;
