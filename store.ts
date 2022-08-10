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
  pixelIndex: number;
  color: Color | undefined;
};

type TemporaryColors = {
  [pixelIndex: string]: Color;
};

const mintingMessages = [
  "minting in progress (can take up to several hours)   ",
  "minting in progress (can take up to several hours).  ",
  "minting in progress (can take up to several hours).. ",
  "minting in progress (can take up to several hours)...",
];

type ColorPickerMode = undefined | "eyedropper" | "eraser";

const setAlertIfLeave = () => {
  window.onbeforeunload = function () {
    return "You have uncommitted colorizations. Do you want to quit PXLs?";
  };
};

const unsetAlertIfLeave = () => {
  window.onbeforeunload = null;
};

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
    temporaryColors: {} as TemporaryColors,
    colorPickerColor: { red: 183, green: 28, blue: 28 } as Color,
    colorPickerMode: undefined as ColorPickerMode,
    selectedPixel: undefined as OwnedPixel | undefined,
    mouseOverGrid: false,
    committedColorizations: undefined as number | undefined,
  },
  reducers: {
    setColorPickerColor(state, color: Color) {
      return { ...state, colorPickerColor: color };
    },
    setMessage(state, message: string) {
      return { ...state, message };
    },
    setAccount(state, { account, accountConnected }: SetAccountType) {
      let newState = { ...state, account, accountConnected };
      if (account) {
        localStorage.setItem("pxls-account", account);
        if (
          state.message === "please connect your Starknet wallet before minting"
        ) {
          newState.message = "";
        }
      } else {
        localStorage.removeItem("pxls-account");
        newState = (this as any)["state/resetColoringState"](newState);
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
      } else {
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
      if (payload.color) {
        temporaryColors[payload.pixelIndex] = payload.color;
      } else if (temporaryColors[payload.pixelIndex]) {
        delete temporaryColors[payload.pixelIndex];
      }
      setAlertIfLeave();
      return { ...state, temporaryColors };
    },
    resetColoringState(state) {
      unsetAlertIfLeave();
      return { ...state, temporaryColors: {} };
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
    setColorPickerMode(state, mode: ColorPickerMode) {
      return { ...state, colorPickerMode: mode };
    },
    setMouseOverGrid(state, mouseOverGrid: boolean) {
      return { ...state, mouseOverGrid };
    },
    setCommittedColorizations(state, committedColorizations: number) {
      return { ...state, committedColorizations };
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
    const coloringHash = localStorage.getItem("pxls-coloring");
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
    if (coloringHash) {
      store.dispatch({
        type: "state/setColoringHash",
        payload: coloringHash,
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
