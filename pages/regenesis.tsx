import type { NextPage } from "next";

import HomeMobile from "../components/homeMobile";
import RegenesisPage from "../components/regenesisPage";

interface Props {
  isMobileView: boolean;
}

const Regenesis: NextPage<Props> = ({ isMobileView }) => {
  if (isMobileView) {
    return <HomeMobile />;
  }
  return <RegenesisPage />;
};

Regenesis.getInitialProps = async ({ req }) => {
  const userAgent = req ? req.headers["user-agent"] : navigator.userAgent;
  const isMobileView = !!userAgent?.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  );
  return { isMobileView };
};

export default Regenesis;
