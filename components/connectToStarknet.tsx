import { useStarknet } from "@starknet-react/core";

const ConnectToStarknet = () => {
  const { account, connect, connectors } = useStarknet();
  const connector = connectors.find((c) => c.available());
  return (
    <div>
      {!account && connector && (
        <button key={connector.id()} onClick={() => connect(connector)}>
          Connect to Starknet
        </button>
      )}
    </div>
  );
};

export default ConnectToStarknet;
