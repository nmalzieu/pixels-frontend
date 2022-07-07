import { useStarknet } from "@starknet-react/core";
import { useEffect, useState } from "react";
import { useStoreDispatch, useStoreState } from "../store";

const ConnectToStarknet = () => {
  const state = useStoreState();
  const dispatch = useStoreDispatch();

  const {
    account: starknetConnectedAccount,
    connect,
    connectors,
  } = useStarknet();
  const connector = connectors.find((c) => c.available());

  useEffect(() => {
    if (
      starknetConnectedAccount &&
      starknetConnectedAccount !== state.account
    ) {
      dispatch.setAccount({
        account: starknetConnectedAccount,
        accountConnected: true,
      });
    }
  }, [dispatch, starknetConnectedAccount, state.account]);

  if (state.account) {
    return <div>👛 {state.account}</div>;
  } else if (!starknetConnectedAccount && connector) {
    return (
      <div onClick={() => connect(connector)} className="clickable">
        👛 connect wallet
      </div>
    );
  }
  return <div></div>;
};

export default ConnectToStarknet;
