import { NextPage } from "next";

import HomeDesktop from "../components/homeDesktop";
import HomeMobile from "../components/homeMobile";

interface Props {
  isMobileView: boolean;
}

const Home: NextPage<Props> = ({ isMobileView }) => {
  if (isMobileView) {
    return <HomeMobile />;
  }
  return <HomeDesktop />;
};

Home.getInitialProps = async ({ req }) => {
  const userAgent = req ? req.headers["user-agent"] : navigator.userAgent;
  const isMobileView = !!userAgent?.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  );
  return { isMobileView };
};

export default Home;
