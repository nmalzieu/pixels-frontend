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

export const state = createModel<RootModel>()({
  state: {
    message: "",
    account: "",
    accountConnected: false,
    currentlyMintingHash: "",
  },
  reducers: {
    setMessage(state, message: string) {
      return { ...state, message };
    },
    setAccount(state, { account, accountConnected }: SetAccountType) {
      localStorage.setItem("pxls-account", account);
      return { ...state, account, accountConnected };
    },
    setMintingHash(state, hash: string) {
      if (hash) {
        localStorage.setItem("pxls-minting", hash);
      } else {
        localStorage.removeItem("pxls-minting");
      }
      return { ...state, currentlyMintingHash: hash };
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
}, 50);

export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;

export const useStoreState = () => useSelector((s: RootState) => s.state);
export const useStoreDispatch = () => {
  const dispatch = useDispatch<Dispatch>();
  return dispatch.state;
};
