import { NextPage } from "next";

import HomeMobile from "../components/homeMobile";
import MintHomeDesktop from "../components/mintHomeDesktop";

interface Props {
  isMobileView: boolean;
}

const Home: NextPage<Props> = ({ isMobileView }) => {
  if (isMobileView) {
    return <HomeMobile />;
  }
  return <MintHomeDesktop />;
};

Home.getInitialProps = async ({ req }) => {
  const userAgent = req ? req.headers["user-agent"] : navigator.userAgent;
  const isMobileView = !!userAgent?.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  );
  return { isMobileView };
};

export default Home;
