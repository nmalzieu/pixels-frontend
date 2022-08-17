import { useConnectors, useStarknet } from "@starknet-react/core";
import { useCallback, useEffect } from "react";

import { useStoreDispatch, useStoreState } from "../store";

type Props = {
  connectButton: React.ReactNode;
};

const ConnectToStarknet = ({ connectButton }: Props) => {
  const state = useStoreState();
  const dispatch = useStoreDispatch();

  const { connect, disconnect, available } = useConnectors();

  const { account: starknetConnectedAccount } = useStarknet();
  const connector = available.length > 0 ? available[0] : null;

  const disconnectAndDispatch = useCallback(() => {
    if (starknetConnectedAccount) {
      try {
        disconnect();
      } catch (e) {
        console.error(e);
      }
    }
    dispatch.setAccount({
      account: "",
      accountConnected: false,
    });
  }, [starknetConnectedAccount, disconnect, dispatch]);

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

  const disconnectButton = () => {
    if (Object.keys(state.temporaryColors).length > 0) {
      const leave = confirm(
        "If you disconnect your wallet, you will lose your uncommitted work. Do you want to proceed?"
      );
      if (leave) {
        disconnectAndDispatch();
      }
    } else {
      disconnectAndDispatch();
    }
  };

  if (state.account) {
    return (
      <div>
        👛 {state.account.slice(0, 8)}...{" "}
        <span className="clickable" onClick={disconnectButton}>
          (disconnect)
        </span>
      </div>
    );
  } else if (!starknetConnectedAccount) {
    return (
      <div
        onClick={() => {
          if (connector) {
            connect(connector);
          }
        }}
        className="clickable"
      >
        {connectButton}
      </div>
    );
  }
  return <div></div>;
};

export default ConnectToStarknet;
