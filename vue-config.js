export const publicPath =
  process.env.NODE_ENV === "production" ? "/short-missions/" : "/";

export const configureWebpack = {
  devtool: "source-map"
};
