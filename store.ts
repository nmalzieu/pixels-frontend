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
  "minting in progress (can take up to several hours)   ",
  "minting in progress (can take up to several hours).  ",
  "minting in progress (can take up to several hours).. ",
  "minting in progress (can take up to several hours)...",
];

export const state = createModel<RootModel>()({
  state: {
    message: "",
    account: "",
    accountConnected: false,
    network: "",
    currentlyMintingHash: "",
    failedMintHash: "",
    currentlyColoringHash: "",
    failedColoringHash: "",
    grid: [] as GridPixel[],
    temporaryColors: [] as TemporaryColors,
    selectedPixel: undefined as OwnedPixel | undefined,
  },
  reducers: {
    setMessage(state, message: string) {
      return { ...state, message };
    },
    setAccount(state, { account, accountConnected }: SetAccountType) {
      const newState = { ...state, account, accountConnected };
      if (account) {
        localStorage.setItem("pxls-account", account);
        if (
          state.message === "please connect your Starknet wallet before minting"
        ) {
          newState.message = "";
        }
      } else {
        localStorage.removeItem("pxls-account");
      }
      return newState;
    },
    setMintingHash(state, hash: string) {
      const newState = { ...state, currentlyMintingHash: hash };
      if (hash) {
        localStorage.setItem("pxls-minting", hash);
        newState.message =
          "minting in progress (can take up to several hours)...";
      } else {
        if (mintingMessages.includes(state.message)) {
          newState.message = "";
        }
        localStorage.removeItem("pxls-minting");
      }
      return newState;
    },
    setColoringHash(state, hash: string) {
      const newState = { ...state, currentlyColoringHash: hash };
      if (hash) {
        localStorage.setItem("pxls-coloring", hash);
        // newState.message =
        //   "⏳️ Your color changes are currently commiting to the blockchain; it can take a moment. You can go and drink a coffee or a tea or whatever.";
      } else {
        // if (
        //   state.message ===
        //   "⏳️ Your color changes are currently commiting to the blockchain; it can take a moment. You can go and drink a coffee or a tea or whatever."
        // ) {
        //   newState.message = "";
        // }
        localStorage.removeItem("pxls-coloring");
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
    resetColoringState(state) {
      return { ...state, temporaryColors: [] };
    },
    setFailedMintHash(state, payload: string) {
      const newState = { ...state, failedMintHash: payload };
      if (payload) {
        newState.message = "minting did not work";
      }
      return newState;
    },
    setFailedColoringHash(state, payload: string) {
      const newState = { ...state, failedColoringHash: payload };
      // if (payload) {
      //   newState.message =
      //     "😢️ There was an issue with your commit and it failed. You’ll have to commit again to colorize your pxl today.";
      // }
      return newState;
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
  // Making the "minting in progress (can take up to several hours)..."
  // message dynamic
  const currentMessage = store.getState().state.message;
  const indexOfMessage = mintingMessages.indexOf(currentMessage);
  if (indexOfMessage > -1) {
    const nextIndex = (indexOfMessage + 1) % mintingMessages.length;
    const nextMessage = mintingMessages[nextIndex];
    store.dispatch({ type: "state/setMessage", payload: nextMessage });
  }
}, 500);

export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;

export const useStoreState = () => useSelector((s: RootState) => s.state);
export const useStoreDispatch = () => {
  const dispatch = useDispatch<Dispatch>();
  return dispatch.state;
};
