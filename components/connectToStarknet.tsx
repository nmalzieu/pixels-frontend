import { useStarknet } from "@starknet-react/core";
import { useCallback, useEffect } from "react";

import { useStoreDispatch, useStoreState } from "../store";

type Props = {
  connectButton: React.ReactNode;
};

const ConnectToStarknet = ({ connectButton }: Props) => {
  const state = useStoreState();
  const dispatch = useStoreDispatch();

  const {
    account: starknetConnectedAccount,
    connect,
    disconnect,
    connectors,
  } = useStarknet();
  const connector = connectors.find((c) => c.available());

  const disconnectAndDispatch = useCallback(() => {
    disconnect();
    dispatch.setAccount({
      account: "",
      accountConnected: false,
    });
  }, [disconnect, dispatch]);

  useEffect(() => {
    if (
      state.network &&
      state.network !== process.env.NEXT_PUBLIC_STARKNET_NETWORK
    ) {
      disconnectAndDispatch();
    }
  }, [disconnectAndDispatch, state.network]);

  useEffect(() => {
    if (
      state.network &&
      state.network === process.env.NEXT_PUBLIC_STARKNET_NETWORK &&
      starknetConnectedAccount &&
      starknetConnectedAccount !== state.account
    ) {
      dispatch.setAccount({
        account: starknetConnectedAccount,
        accountConnected: true,
      });
    }
  }, [dispatch, starknetConnectedAccount, state.account, state.network]);

  if (state.account) {
    return (
      <div>
        👛 {state.account.slice(0, 8)}...{" "}
        <span className="clickable" onClick={disconnectAndDispatch}>
          (disconnect)
        </span>
      </div>
    );
  } else if (!starknetConnectedAccount && connector) {
    return (
      <div onClick={() => connect(connector)} className="clickable">
        {connectButton}
      </div>
    );
  }
  return <div></div>;
};

export default ConnectToStarknet;
