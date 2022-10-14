import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";

import GridLoader from "./gridLoader";

type Props = {
  pxlId: number;
};

const AspectPxlImage = ({ pxlId }: Props) => {
  const [imageUri, setImageUri] = useState();
  useEffect(() => {
    const fetch = async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_ASPECT_API}/asset/${process.env.NEXT_PUBLIC_PXL_ERC721_ADDRESS}/${pxlId}`
      );
      setImageUri(data.image_uri);
    };
    fetch();
  }, []);
  if (!imageUri) {
    return <GridLoader />;
  }
  return <Image src={imageUri} width={400} height={400} alt="Pxl" />;
};

export default AspectPxlImage;
