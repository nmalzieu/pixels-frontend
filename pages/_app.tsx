import "../styles/reset.css";
import "../styles/globals.css";

import { InjectedConnector, StarknetConfig } from "@starknet-react/core";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import Head from "next/head";
import { ReactElement, useMemo } from "react";
import { Provider as ReactReduxProvider } from "react-redux";
import { Provider as StrkProvider } from "starknet";

import { store, useStoreDispatch } from "../store";
// import { useStarknetNetwork } from "../utils";

const StarknetStatusComponent = () => {
  const dispatch = useStoreDispatch();
  // const network = useStarknetNetwork();
  // console.log({network});
  // useEffect(() => {
  //   dispatch.setNetwork(network || "");
  // }, [dispatch, network]);
  return <></>;
};

function StarknetApp({ children }: { children: ReactElement }) {
  const connectors = useMemo(
    () => [
      new InjectedConnector({ options: { id: "argentX" } }),
      new InjectedConnector({ options: { id: "braavos" } }),
    ],
    []
  );
  return (
    <StarknetConfig
      connectors={connectors}
      defaultProvider={
        new StrkProvider({
          // sequencer: {
          //   baseUrl:
          //     process.env.NEXT_PUBLIC_STARKNET_PROVIDER ||
          //     "http://alpha4.starknet.io",
          //   feederGatewayUrl: "feeder_gateway",
          //   gatewayUrl: "gateway",
          // },
          rpc: {
            nodeUrl: "https://starknet.blockpi.network/v1/rpc/public",
          },
        })
      }
    >
      {children}
    </StarknetConfig>
  );
}

const DynamicStarknetApp = dynamic(() => Promise.resolve(StarknetApp), {
  ssr: false,
});

function App({ Component, pageProps }: AppProps) {
  return (
    <ReactReduxProvider store={store}>
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
          content={`${process.env.NEXT_PUBLIC_URL}/social_sharing.jpg`}
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <StarknetStatusComponent />
      <DynamicStarknetApp>
        <Component {...pageProps} />
      </DynamicStarknetApp>
    </ReactReduxProvider>
  );
}

export default App;
