const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    plugins: {
      "react-native": require("eslint-plugin-react-native"),
    },
    rules: {
      "react-native/no-raw-text": "error",
    },
  },
]);
