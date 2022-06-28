import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "starknet";
import { StarknetProvider, InjectedConnector } from "@starknet-react/core";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StarknetProvider
      connectors={[new InjectedConnector()]}
      defaultProvider={new Provider({ baseUrl: "http://alpha4.starknet.io" })}
    >
      <Component {...pageProps} />
    </StarknetProvider>
  );
}

export default MyApp;
