import {
  createModel,
  init,
  Models,
  RematchDispatch,
  RematchRootState,
} from "@rematch/core";
import { useDispatch, useSelector } from "react-redux";

type SetAccountType = {
  account: string;
  accountConnected: boolean;
};

export type OwnedPixel = {
  tokenId: number;
  pixelIndex: number;
};

type Color = {
  red: number;
  green: number;
  blue: number;
};

export type GridPixel = {
  set: boolean;
  color: Color;
};

type SetPixelTemporaryColorPayload = {
  tokenId: number;
  color: Color;
};

type TemporaryColors = {
  [tokenId: number]: Color;
};

const mintingMessages = [
  "minting in progress",
  "minting in progress.",
  "minting in progress..",
  "minting in progress...",
];

export const state = createModel<RootModel>()({
  state: {
    message: "",
    account: "",
    accountConnected: false,
    network: "",
    currentlyMintingHash: "",
    grid: [] as GridPixel[],
    temporaryColors: [] as TemporaryColors,
    selectedPixel: undefined as OwnedPixel | undefined,
  },
  reducers: {
    setMessage(state, message: string) {
      return { ...state, message };
    },
    setAccount(state, { account, accountConnected }: SetAccountType) {
      localStorage.setItem("pxls-account", account);
      const newState = { ...state, account, accountConnected };
      if (state.message === "please connect wallet before minting") {
        newState.message = "";
      }
      return newState;
    },
    setMintingHash(state, hash: string) {
      const newState = { ...state, currentlyMintingHash: hash };
      if (hash) {
        localStorage.setItem("pxls-minting", hash);
        newState.message = "minting in progress...";
      } else {
        if (mintingMessages.includes(state.message)) {
          newState.message = "";
        }
        localStorage.removeItem("pxls-minting");
      }
      return newState;
    },
    setNetwork(state, network: string) {
      const newState: any = { ...state, network };
      const networkMessage = `please connect to the ${process.env.NEXT_PUBLIC_STARKNET_NETWORK} network`;
      if (network) {
        if (network !== process.env.NEXT_PUBLIC_STARKNET_NETWORK) {
          newState.message = networkMessage;
        } else if (state.message === networkMessage) {
          newState.message = "";
        }
      }
      return newState;
    },
    setGrid(state, grid: GridPixel[]) {
      return { ...state, grid };
    },
    setSelectedPixel(state, pixel: OwnedPixel | undefined) {
      return { ...state, selectedPixel: pixel };
    },
    setPixelTemporaryColor(state, payload: SetPixelTemporaryColorPayload) {
      const temporaryColors = state.temporaryColors;
      temporaryColors[payload.tokenId] = payload.color;
      return { ...state, temporaryColors };
    },
  },
});

export interface RootModel extends Models<RootModel> {
  state: typeof state;
}

export const models: RootModel = { state };

export const store = init({
  models,
});

setTimeout(() => {
  if (typeof window !== "undefined") {
    const previousAccount = localStorage.getItem("pxls-account");
    const mintingHash = localStorage.getItem("pxls-minting");
    if (previousAccount) {
      store.dispatch({
        type: "state/setAccount",
        payload: {
          account: previousAccount,
          accountConnected: false,
        },
      });
    }
    if (mintingHash) {
      store.dispatch({
        type: "state/setMintingHash",
        payload: mintingHash,
      });
    }
  }
}, 150);

setInterval(() => {
  // Making the "minting in progress..."
  // message dynamic
  const currentMessage = store.getState().state.message;
  const indexOfMessage = mintingMessages.indexOf(currentMessage);
  if (indexOfMessage > -1) {
    const nextIndex = (indexOfMessage + 1) % mintingMessages.length;
    const nextMessage = mintingMessages[nextIndex];
    store.dispatch({ type: "state/setMessage", payload: nextMessage });
  }
}, 850);

export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;

export const useStoreState = () => useSelector((s: RootState) => s.state);
export const useStoreDispatch = () => {
  const dispatch = useDispatch<Dispatch>();
  return dispatch.state;
};
