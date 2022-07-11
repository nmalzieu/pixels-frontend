import { NextPage } from "next";
import { useEffect, useState } from "react";
import HomeDesktop from "../components/homeDesktop";
import HomeMobile from "../components/homeMobile";

const Home: NextPage = () => {
  const [showMobile, setShowMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResizeWindow = () => {
        setShowMobile(window.innerWidth < 550);
      };
      // subscribe to window resize event "onComponentDidMount"
      window.addEventListener("resize", handleResizeWindow);
      handleResizeWindow();
      return () => {
        // unsubscribe "onComponentDestroy"
        window.removeEventListener("resize", handleResizeWindow);
      };
    }
  }, []);
  if (showMobile) {
    return <HomeMobile />;
  }
  return <HomeDesktop />;
};

export default Home;
