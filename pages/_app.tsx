import "../styles/reset.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Provider as Starknet } from "starknet";
import { Provider as ReactReduxProvider } from "react-redux";
import {
  StarknetProvider,
  InjectedConnector,
  useStarknetTransactionManager,
} from "@starknet-react/core";
import { store, useStoreDispatch, useStoreState } from "../store";
import { useEffect } from "react";

const TransactionRefreshComponent = () => {
  const state = useStoreState();
  const dispatch = useStoreDispatch();
  const { addTransaction, transactions, removeTransaction } =
    useStarknetTransactionManager();

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
      console.log("deleting a rejected transaction");
      // ACCEPTED / REJECTED transaction
      removeTransaction(mintingTransaction.transactionHash);
      dispatch.setMintingHash("");
    } else if (
      mintingTransaction &&
      pendingStatuses.includes(mintingTransaction.status) &&
      mintingTransaction.transactionHash !== state.currentlyMintingHash
    ) {
      console.log("adding a new minting transaction");
      // New minting transaction
      dispatch.setMintingHash(mintingTransaction.transactionHash);
    } else if (!mintingTransaction && state.currentlyMintingHash) {
      console.log("adding an existing transaction");
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
        <TransactionRefreshComponent />
        <Component {...pageProps} />
      </StarknetProvider>
    </ReactReduxProvider>
  );
}

export default MyApp;
