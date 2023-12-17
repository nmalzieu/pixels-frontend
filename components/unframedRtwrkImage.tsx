import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";

import GridLoader from "./gridLoader";

type Props = {
  rtwrkId: number;
  transparentLoader?: boolean;
};

const UnframedRtwrkImage = ({ rtwrkId, transparentLoader }: Props) => {
  const [imageUri, setImageUri] = useState();
  useEffect(() => {
    const fetch = async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_UNFRAMED_API}/${process.env.NEXT_PUBLIC_RTWRK_ERC721_ADDRESS}/${rtwrkId}`
      );
      setImageUri(data.imageUrls.full);
    };
    fetch();
  }, [rtwrkId]);
  if (!imageUri) {
    return <GridLoader transparent={transparentLoader} />;
  }
  return <Image src={imageUri} width={400} height={400} alt="Rtwrk" />;
};

export default UnframedRtwrkImage;
