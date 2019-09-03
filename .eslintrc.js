module.exports = {
  root: true,
  env: {
    node: true
  },
  parser: "vue-eslint-parser",
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "prettier/@typescript-eslint",
    "plugin:vue/essential",
    "@vue/prettier",
    "@vue/typescript"
  ],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "@typescript-eslint/no-unused-vars": ["error", {"args": "all", "argsIgnorePattern": "^_", "varsIgnorePattern": "^_"}]
  },
  plugins: ["@typescript-eslint", "prettier"],
  parserOptions: {
    parser: "@typescript-eslint/parser",
    tsconfigRootDir: "."
  },
  // overrides: [
  //   {
  //     files: ["**/__tests__/*.{j,t}s?(x)"],
  //     env: {
  //       jest: true
  //     }
  //   }
  // ]
};
