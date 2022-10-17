import {
  useAccount,
  useConnectors,
  useStarknetCall,
  UseStarknetCallProps,
  useStarknetExecute,
  UseStarknetExecuteArgs,
  useStarknetInvoke,
} from "@starknet-react/core";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Contract } from "starknet";

import { useStoreDispatch, useStoreState } from "../store";

type CallProps = UseStarknetCallProps<unknown[]> & {
  condition: boolean;
};

export const useCall = ({
  contract,
  method,
  args,
  options,
  condition,
}: CallProps) => {
  return useStarknetCall({
    contract,
    method: condition ? method : undefined,
    args,
    options,
  });
};

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
  const { address: starknetConnectedAccount } = useAccount();
  const { connect, disconnect, available } = useConnectors();

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
          const connector = available.length > 0 ? available[0] : null;

          if (connector && !currentlyConnectingRef.current) {
            if (
              messageRef.current !==
              `please connect to the ${process.env.NEXT_PUBLIC_STARKNET_NETWORK} network`
            ) {
              currentlyConnectingRef.current = true;
              connect(connector);
            } else {
              currentlyConnectingRef.current = false;
              disconnectRef.current();
              dispatch.setAccount({
                account: "",
                accountConnected: false,
              });
              clearInterval(interval);
              reject("Wrong network");
            }
          } else if (!connector && !currentlyConnectingRef.current) {
            currentlyConnectingRef.current = false;
            clearInterval(interval);
            reject("No connector found!");
          } else {
            clearInterval(interval);
            console.log("An error occured connectThenInvoke");
          }
        }
      }, 100);
    });

  return { invoke: connectThenInvoke, ...rest };
};

export const useExecute = ({ calls }: UseStarknetExecuteArgs) => {
  // Here we do a lazy connection, i.e. connect to starknet if
  // trying to invoke and not yet connected!
  const state = useStoreState();
  const dispatch = useStoreDispatch();
  const { execute, ...rest } = useStarknetExecute({ calls });

  const { address: starknetConnectedAccount } = useAccount();
  const { connect, disconnect, available } = useConnectors();

  const accountRef = useRef(starknetConnectedAccount);
  const executeRef = useRef(execute);
  const networkRef = useRef(state.network);
  const disconnectRef = useRef(disconnect);
  const messageRef = useRef(state.message);
  const currentlyConnectingRef = useRef(false);
  useEffect(() => {
    accountRef.current = starknetConnectedAccount;
    executeRef.current = execute;
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

  const connectThenExecute = () =>
    new Promise((resolve, reject) => {
      let interval: any;
      interval = setInterval(() => {
        if (accountRef.current) {
          currentlyConnectingRef.current = false;
          clearInterval(interval);
          // Invoking only if on the right network
          if (networkRef.current === process.env.NEXT_PUBLIC_STARKNET_NETWORK) {
            executeRef.current().then(resolve).catch(reject);
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
          const connector = available.length > 0 ? available[0] : null;

          if (connector && !currentlyConnectingRef.current) {
            if (
              messageRef.current !==
              `please connect to the ${process.env.NEXT_PUBLIC_STARKNET_NETWORK} network`
            ) {
              currentlyConnectingRef.current = true;
              connect(connector);
            } else {
              currentlyConnectingRef.current = false;
              disconnectRef.current();
              dispatch.setAccount({
                account: "",
                accountConnected: false,
              });
              clearInterval(interval);
              reject("Wrong network");
            }
          } else if (!connector && !currentlyConnectingRef.current) {
            currentlyConnectingRef.current = false;
            clearInterval(interval);
            reject("No connector found!");
          } else {
            clearInterval(interval);
            console.log("An error occured connectThenExecute");
          }
        }
      }, 100);
    });

  return { execute: connectThenExecute, ...rest };
};

export const useTransactionStatus = (transactionHash: string | undefined) => {
  const [status, setStatus] = useState(undefined);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!transactionHash) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const fetchData = async () => {
      try {
        const { data: response } = await axios.get(
          `${process.env.NEXT_PUBLIC_STARKNET_PROVIDER}/feeder_gateway/get_transaction_status?transactionHash=${transactionHash}`
        );
        setStatus(response.tx_status);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [transactionHash]);

  const notYetPending = [
    "TRANSACTION_RECEIVED",
    "NOT_RECEIVED",
    "RECEIVED",
    undefined,
  ].includes(status);
  const pending = status === "PENDING";
  const accepted = ["ACCEPTED_ON_L2", "ACCEPTED_ON_L1"].includes(status || "");
  const rejected = status === "REJECTED";

  return {
    notYetPending,
    pending,
    accepted,
    rejected,
    status,
    loading,
  };
};
