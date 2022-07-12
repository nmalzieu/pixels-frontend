import { CSSProperties } from "react";

import styles from "../styles/Window.module.scss";

type Props = {
  children: React.ReactNode;
  style?: CSSProperties;
};

const Window = ({ children, style }: Props) => (
  <div className={styles.window} style={style}>
    {children}
  </div>
);

export default Window;
