import styles from "../styles/Button.module.scss";

type Props = {
  text: string;
  action?: any;
  disabled?: boolean;
};

const Button = ({ text, action, disabled }: Props) => (
  <div
    className={`${styles.button} ${disabled ? styles.disabled : ""}`}
    onClick={action}
  >
    {text}
  </div>
);

export default Button;
