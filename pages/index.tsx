import { NextPage } from "next";

import HomeDesktop from "../components/homeDesktop";
import HomeMobile from "../components/homeMobile";
import { useStoreState } from "../store";

interface Props {
  isMobileView: boolean;
}

const Home: NextPage<Props> = ({ isMobileView }) => {
  const state = useStoreState();
  if (isMobileView) {
    return <HomeMobile />;
  }
  return <HomeDesktop key={state.account} />;
};

Home.getInitialProps = async ({ req }) => {
  const userAgent = req ? req.headers["user-agent"] : navigator.userAgent;
  const isMobileView = !!userAgent?.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  );
  return { isMobileView };
};

export default Home;
