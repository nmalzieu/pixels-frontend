import type { NextPage } from "next";

import GridPage from "../components/gridPage";
import HomeMobile from "../components/homeMobile";

interface Props {
  isMobileView: boolean;
}

const Grid: NextPage<Props> = ({ isMobileView }) => {
  if (isMobileView) {
    return <HomeMobile />;
  }
  return <GridPage />;
};

Grid.getInitialProps = async ({ req }) => {
  const userAgent = req ? req.headers["user-agent"] : navigator.userAgent;
  const isMobileView = !!userAgent?.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  );
  return { isMobileView };
};

export default Grid;
