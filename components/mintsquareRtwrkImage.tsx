import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";

import GridLoader from "./gridLoader";

type Props = {
  rtwrkId: number;
};

const MintsquareRtwrkImage = ({ rtwrkId }: Props) => {
  const [imageUri, setImageUri] = useState();
  useEffect(() => {
    const fetch = async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_ASPECT_API}/asset/${process.env.NEXT_PUBLIC_RTWRK_ERC721_ADDRESS}/${rtwrkId}`
      );
      setImageUri(data.image_uri);
    };
    fetch();
  }, []);
  if (!imageUri) {
    return <GridLoader />;
  }
  return <Image src={imageUri} width={400} height={400} alt="Rtwrk" />;
};

export default MintsquareRtwrkImage;
