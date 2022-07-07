import { Contract } from "starknet";
import { useStarknet, useStarknetInvoke } from "@starknet-react/core";
import { useEffect, useRef } from "react";
import { useStoreState, useStoreDispatch } from "../store";

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
    connectors,
  } = useStarknet();

  const accountRef = useRef(starknetConnectedAccount);
  const invokeRef = useRef(invoke);
  useEffect(() => {
    accountRef.current = starknetConnectedAccount;
    invokeRef.current = invoke;
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
          clearInterval(interval);
          invokeRef.current({ args, metadata }).then(resolve).catch(reject);
        } else {
          const connector = connectors.find((c) => c.available());
          if (connector) {
            connect(connector);
          } else {
            clearInterval(interval);
            reject("No connector found!");
          }
        }
      }, 100);
    });

  return { invoke: connectThenInvoke, ...rest };
};
