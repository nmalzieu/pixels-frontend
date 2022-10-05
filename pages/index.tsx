import type { NextPage } from "next";

import HomeMobile from "../components/homeMobile";
import HomePage from "../components/homePage";

interface Props {
  isMobileView: boolean;
}

const Grid: NextPage<Props> = ({ isMobileView }) => {
  if (isMobileView) {
    return <HomeMobile />;
  }
  return <HomePage />;
};

Grid.getInitialProps = async ({ req }) => {
  const userAgent = req ? req.headers["user-agent"] : navigator.userAgent;
  const isMobileView = !!userAgent?.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  );
  return { isMobileView };
};

export default Grid;
