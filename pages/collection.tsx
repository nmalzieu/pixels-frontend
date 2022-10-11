import type { NextPage } from "next";

import CollectionPage from "../components/collectionPage";
import HomeMobile from "../components/homeMobile";

interface Props {
  isMobileView: boolean;
}

const Collection: NextPage<Props> = ({ isMobileView }) => {
  if (isMobileView) {
    return <HomeMobile />;
  }
  return <CollectionPage />;
};

Collection.getInitialProps = async ({ req }) => {
  const userAgent = req ? req.headers["user-agent"] : navigator.userAgent;
  const isMobileView = !!userAgent?.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  );
  return { isMobileView };
};

export default Collection;
