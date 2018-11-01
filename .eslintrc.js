module.exports = {
  "extends": "airbnb",
  "parser": "babel-eslint",
  "plugins": [
    "import"
  ],
  "rules": {
    "semi": [2, "never"],
    "no-undef": 0,
    "no-unused-vars": 0,
    "jsx-a11y/anchor-is-valid": 0,
    "comma-dangle": 0,
    "no-console": 0,
    "no-unused-expressions": 0,
    "max-len": 0,
    "jsx-a11y/no-noninteractive-element-interactions": 0,
    "jsx-a11y/alt-text": 0,
    "object-curly-newline": 0,
    "class-methods-use-this": 0,
    "jsx-a11y/click-events-have-key-events": 0,
    "jsx-a11y/no-static-element-interactions": 0,
    "jsx-a11y/media-has-caption": 0,
    "no-nested-ternary": 0,
    "no-return-assign": 0,
    "no-await-in-loop": 0
  },
  "env": {
    "browser": true,
    "node": true
  },
  "settings": {
    "import/resolver": {
      "webpack": {
        "config": "config/webpack.config.dev.js"
      }
    }
  }
};
