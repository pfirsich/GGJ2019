module.exports = {
  env: {
    node: true
  },
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    "no-console": "off"
  }
};
