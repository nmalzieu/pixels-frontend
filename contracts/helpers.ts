import { useStarknet, useStarknetInvoke } from "@starknet-react/core";
import { useEffect, useRef } from "react";
import { Contract } from "starknet";

import { useStoreDispatch, useStoreState } from "../store";

export const useInvoke = ({
  contract,
  method,
}: {
  contract: Contract | undefined;
  method: string;
}) => {
  // Here we do a lazy connection, i.e. connect to starknet if
  // trying to invoke and not yet connected!
  const state = useStoreState();
  const dispatch = useStoreDispatch();
  const { invoke, ...rest } = useStarknetInvoke({ contract, method });
  const {
    account: starknetConnectedAccount,
    connect,
    disconnect,
    connectors,
  } = useStarknet();

  const accountRef = useRef(starknetConnectedAccount);
  const invokeRef = useRef(invoke);
  const networkRef = useRef(state.network);
  const disconnectRef = useRef(disconnect);
  const messageRef = useRef(state.message);
  const currentlyConnectingRef = useRef(false);
  useEffect(() => {
    accountRef.current = starknetConnectedAccount;
    invokeRef.current = invoke;
    networkRef.current = state.network;
    disconnectRef.current = disconnect;
    messageRef.current = state.message;
  });

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

  const connectThenInvoke = ({ args, metadata }: any) =>
    new Promise((resolve, reject) => {
      let interval: any;
      interval = setInterval(() => {
        if (accountRef.current) {
          currentlyConnectingRef.current = false;
          clearInterval(interval);
          // Invoking only if on the right network
          if (networkRef.current === process.env.NEXT_PUBLIC_STARKNET_NETWORK) {
            invokeRef.current({ args, metadata }).then(resolve).catch(reject);
          } else {
            disconnectRef.current();
            dispatch.setAccount({
              account: "",
              accountConnected: false,
            });
            clearInterval(interval);
            reject("Wrong network");
          }
        } else {
          const connector = connectors.find((c) => c.available());
          if (connector && !currentlyConnectingRef.current) {
            if (
              messageRef.current !==
              `please connect to the ${process.env.NEXT_PUBLIC_STARKNET_NETWORK} network`
            ) {
              currentlyConnectingRef.current = true;
              connect(connector);
            } else {
              disconnectRef.current();
              dispatch.setAccount({
                account: "",
                accountConnected: false,
              });
              clearInterval(interval);
              reject("Wrong network");
            }
          } else if (!currentlyConnectingRef.current) {
            clearInterval(interval);
            reject("No connector found!");
          }
        }
      }, 100);
    });

  return { invoke: connectThenInvoke, ...rest };
};
