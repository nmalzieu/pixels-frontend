import "../styles/reset.css";
import "../styles/globals.css";

import {
  InjectedConnector,
  StarknetProvider,
  useStarknetTransactionManager,
} from "@starknet-react/core";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import { Provider as ReactReduxProvider } from "react-redux";
import { Provider as Starknet } from "starknet";

import { store, useStoreDispatch, useStoreState } from "../store";
import { useStarknetNetwork } from "../utils";

const StarknetStatusComponent = () => {
  const state = useStoreState();
  const dispatch = useStoreDispatch();
  const { addTransaction, transactions, removeTransaction } =
    useStarknetTransactionManager();

  // Save starknet network to state
  const network = useStarknetNetwork();
  useEffect(() => {
    dispatch.setNetwork(network || "");
  }, [dispatch, network]);

  // If the minting transaction is rejected or accepted
  // we don't need it anymore
  useEffect(() => {
    const mintingTransaction = transactions.find(
      (t) => t.metadata?.method === "mint"
    );
    const pendingStatuses = [
      "TRANSACTION_RECEIVED",
      "NOT_RECEIVED",
      "RECEIVED",
      "PENDING",
    ];

    if (
      mintingTransaction &&
      !pendingStatuses.includes(mintingTransaction.status)
    ) {
      // ACCEPTED / REJECTED transaction
      removeTransaction(mintingTransaction.transactionHash);
      dispatch.setMintingHash("");
    } else if (
      mintingTransaction &&
      pendingStatuses.includes(mintingTransaction.status) &&
      mintingTransaction.transactionHash !== state.currentlyMintingHash
    ) {
      // New minting transaction
      dispatch.setMintingHash(mintingTransaction.transactionHash);
    } else if (!mintingTransaction && state.currentlyMintingHash) {
      addTransaction({
        status: "TRANSACTION_RECEIVED",
        transactionHash: state.currentlyMintingHash,
        metadata: { method: "mint" },
      });
    }
  }, [
    addTransaction,
    dispatch,
    removeTransaction,
    state.currentlyMintingHash,
    transactions,
  ]);

  return <></>;
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ReactReduxProvider store={store}>
      <StarknetProvider
        connectors={[new InjectedConnector()]}
        defaultProvider={
          new Starknet({
            baseUrl:
              process.env.NEXT_PUBLIC_STARKNET_PROVIDER ||
              "http://alpha4.starknet.io",
          })
        }
      >
        <Head>
          <title>Pxls</title>
          <meta property="og:url" content={process.env.NEXT_PUBLIC_URL} />
          <meta property="og:title" content="Pxls" />
          <meta
            property="og:description"
            content="Four hundred pxls, one unique collaborative rtwrk every day"
          />
          <meta
            property="og:image"
            content={`${process.env.NEXT_PUBLIC_URL}/social_sharing.png`}
          />
        </Head>
        <StarknetStatusComponent />
        <Component {...pageProps} />
      </StarknetProvider>
    </ReactReduxProvider>
  );
}

export default MyApp;
