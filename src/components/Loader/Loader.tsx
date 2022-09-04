import React from "react";

import classNames from "classnames";

import styles from "./Loader.module.scss";

export enum LoaderSize {
  s = "s",
  m = "m",
  l = "l",
}

export enum LoaderColor {
  primary = "primary",
  secondary = "secondary",
}

type LoaderProps = {
  loading?: boolean;
  size?: LoaderSize;
  className?: string;
  color?: LoaderColor;
};

const Loader: React.FC<LoaderProps> = ({ loading, size, className, color }) => {
  if (loading !== undefined)
    return (
      <>
        {loading && (
          <div
            className={classNames(
              styles.loader,
              size ? styles[size] : styles.m,
              className
            )}
          />
        )}
      </>
    );

  return (
    <div
      className={classNames(
        styles.loader,
        size ? styles[size] : styles.m,
        className
      )}
    />
  );
};

export default Loader;
