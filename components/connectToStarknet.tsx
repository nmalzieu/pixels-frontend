import { useAccount, useConnectors } from "@starknet-react/core";
import { useCallback, useEffect } from "react";

import { useStoreDispatch, useStoreState } from "../store";

type Props = {
  connectButton: React.ReactNode;
};

const ConnectToStarknet = ({ connectButton }: Props) => {
  const state = useStoreState();
  const dispatch = useStoreDispatch();

  const { connect, disconnect, available, refresh } = useConnectors();
  useEffect(() => {
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const { address: starknetConnectedAccount } = useAccount();
  const connector = available.length > 0 ? available[0] : null;

  const disconnectAndDispatch = useCallback(() => {
    if (starknetConnectedAccount) {
      try {
        disconnect();
      } catch (e) {
        // console.error(e);
        console.log("[DEBUG] Could not disconnect", e);
      }
    }
    dispatch.setAccount({
      account: "",
      accountConnected: false,
    });
    dispatch.setLastBidAction(undefined);
  }, [starknetConnectedAccount, disconnect, dispatch]);

  // useEffect(() => {
  //   if (
  //     state.network &&
  //     state.network !== process.env.NEXT_PUBLIC_STARKNET_NETWORK
  //   ) {
  //     disconnectAndDispatch();
  //   }
  // }, [disconnectAndDispatch, state.network]);

  useEffect(() => {
    if (!state.rehydrated) return;
    if (
      // state.network &&
      // state.network === process.env.NEXT_PUBLIC_STARKNET_NETWORK &&
      starknetConnectedAccount &&
      starknetConnectedAccount !== state.account
    ) {
      console.log("dispatching");
      dispatch.setAccount({
        account: starknetConnectedAccount,
        accountConnected: true,
      });
    } else if (
      !starknetConnectedAccount &&
      state.account &&
      state.accountConnected
    ) {
      dispatch.setAccount({
        account: "",
        accountConnected: false,
      });
    }
  }, [
    dispatch,
    starknetConnectedAccount,
    state.account,
    state.accountConnected,
    state.network,
    state.rehydrated,
  ]);

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
      <span
        onClick={() => {
          if (connector) {
            connect(connector);
          }
        }}
        className="clickable"
      >
        {connectButton}
      </span>
    );
  }
  return <div></div>;
};

export default ConnectToStarknet;
