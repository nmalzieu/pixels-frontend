import styles from "../styles/Input.module.scss";

type Props = {
  text?: string;
  placeholder?: string;
  number?: boolean;
  className?: string;
};

const Input = ({ text, placeholder, number, className }: Props) => {
  return (
    <input
      className={`${className || ""} ${styles.input}`}
      type={number ? "number" : "text"}
      value={text}
      placeholder={placeholder}
    />
  );
};

export default Input;
