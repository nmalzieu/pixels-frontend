import type { NextPage } from "next";
import { useStarknet } from "@starknet-react/core";
import Mint from "../components/mint";
import ConnectToStarknet from "../components/connectToStarknet";

const Home: NextPage = () => {
  const { account } = useStarknet();

  return (
    <div>
      <h1>Welcome to PXLS!</h1>
      {!account && <ConnectToStarknet />}
      {account && <Mint />}
    </div>
  );
};

export default Home;
