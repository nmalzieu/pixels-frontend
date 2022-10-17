import { useEffect, useState } from "react";

type Props = {
  className: any;
};

const Loading = ({ className }: Props) => {
  const [showIndex, setShowIndex] = useState(3);
  useEffect(() => {
    const interval = setInterval(() => {
      setShowIndex((showIndex + 1) % 4);
    }, 1000);
    return () => clearInterval(interval);
  }, [showIndex]);

  return (
    <div className={className}>
      <img src="/loading-collection.png" />
      {showIndex > 0 && (
        <div
          style={{
            width: 20,
            height: 20,
            backgroundColor: "#FF80E3",
            position: "absolute",
            left: 66,
            bottom: 33,
          }}
        />
      )}
      {showIndex > 1 && (
        <div
          style={{
            width: 20,
            height: 20,
            backgroundColor: "#FF80E3",
            position: "absolute",
            left: 106,
            bottom: 33,
          }}
        />
      )}
      {showIndex > 2 && (
        <div
          style={{
            width: 20,
            height: 20,
            backgroundColor: "#FF80E3",
            position: "absolute",
            left: 146,
            bottom: 33,
          }}
        />
      )}
    </div>
  );
};

export default Loading;
