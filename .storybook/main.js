const Solid = require("vite-plugin-solid")

module.exports = {

  core: {
    builder: "@storybook/builder-vite"
  },

  framework: "@storybook/html",

  stories: [
    "../src/**/*.stories.ts",
  ],

  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],

  async viteFinal(config, {configType}){
		config.plugins.unshift(
      //@ts-ignore
			Solid({hot:false}),
		)

    return config
  },

}
