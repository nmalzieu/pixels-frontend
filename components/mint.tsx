import { uint256 } from "starknet";
import {
  useStarknet,
  useStarknetCall,
  useStarknetInvoke,
} from "@starknet-react/core";
import { usePixelERC721Contract } from "../contracts/pixelERC721";


const Mint = () => {
  const { account } = useStarknet();
  const { contract: pixelERC721Contract } = usePixelERC721Contract();

  const { data: totalSupplyData, loading: totalSupplyLoading } =
    useStarknetCall({
      contract: pixelERC721Contract,
      method: "totalSupply",
      args: [],
    });

  const { data: maxSupplyData, loading: maxSupplyLoading } = useStarknetCall({
    contract: pixelERC721Contract,
    method: "maxSupply",
    args: [],
  });

  const { data: balanceOfData, loading: balanceOfLoading } = useStarknetCall({
    contract: pixelERC721Contract,
    method: "balanceOf",
    args: [account],
  });

  const { invoke: mint } = useStarknetInvoke({
    contract: pixelERC721Contract,
    method: "mint",
  });

  const totalSupply = totalSupplyData
    ? uint256.uint256ToBN(totalSupplyData?.[0]).toNumber()
    : 0;
  const maxSupply = maxSupplyData
    ? uint256.uint256ToBN(maxSupplyData?.[0]).toNumber()
    : 0;
  const balance = balanceOfData
    ? uint256.uint256ToBN(balanceOfData?.[0]).toNumber()
    : 0;
  const loading = !totalSupplyData || !maxSupplyData || !balanceOfData;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>
        {totalSupply} PXLS minted / {maxSupply}
      </h2>
      {balance > 0 && (
        <span>
          Your account {account} already owns {balance} PXLS, you cannot mint
          another one
        </span>
      )}
      {balance == 0 && (
        <button
          onClick={() =>
            mint({
              args: [account],
            })
          }
        >
          Mint your pixel
        </button>
      )}
    </div>
  );
};

export default Mint;
