import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";

import GridLoader from "./gridLoader";

type Props = {
  pxlId: number;
};

const UnframedPxlImage = ({ pxlId }: Props) => {
  const [imageUri, setImageUri] = useState();
  useEffect(() => {
    const fetch = async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_UNFRAMED_API}/${process.env.NEXT_PUBLIC_PXL_ERC721_ADDRESS}/${pxlId}`
      );
      setImageUri(data.imageUrls.full);
    };
    fetch();
  }, [pxlId]);
  if (!imageUri) {
    return <GridLoader />;
  }
  return <Image src={imageUri} width={400} height={400} alt="Pxl" />;
};

export default UnframedPxlImage;
