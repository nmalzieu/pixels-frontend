import styles from "../styles/Input.module.scss";

type Props = {
  text?: string | number;
  placeholder?: string;
  number?: boolean;
  className?: string;
  onChange?: any;
  maxLength?: number;
};

const Input = ({
  text,
  placeholder,
  number,
  className,
  onChange,
  maxLength,
}: Props) => {
  return (
    <input
      maxLength={maxLength}
      className={`${className || ""} ${styles.input}`}
      type={number ? "number" : "text"}
      value={text}
      placeholder={placeholder}
      onChange={(e) => {
        if (!onChange) return;
        onChange(e.target.value);
      }}
    />
  );
};

export default Input;
