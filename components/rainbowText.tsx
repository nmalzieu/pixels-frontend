import styles from "../styles/RainbowText.module.scss";

type Props = {
  text: string;
};

const RainbowText = ({ text }: Props) => (
  <div className={styles.rainbowText}>{text}</div>
);

export default RainbowText;
