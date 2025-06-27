import { open } from "out-url";
import path from "node:path";
import * as sass from "sass";

const PORT = 1234;

let opened = false;

export default function(eleventyConfig) {

	// eleventyConfig.addPassthroughCopy(".src/public");

	eleventyConfig.addPassthroughCopy({
		"./src/public/": "/"
	})


	eleventyConfig.addWatchTarget("./src/public/");
	eleventyConfig.addPassthroughCopy("src/assets/images");
	eleventyConfig.addWatchTarget("./src/assets/");

	eleventyConfig.addTemplateFormats('scss');

	eleventyConfig.addLayoutAlias('layout', 'Layout.njk');

	eleventyConfig.addGlobalData("meta", {
		title: "Eleventy Starter",
		url: "https://example.com/",
		language: "en",
		description: "DEFAULT DESCRIPTION",
		author: {
			name: "Your Name Here",
			email: "youremailaddress@example.com",
			url: "https://example.com/about-me/"
		}
	});



	eleventyConfig.addExtension("scss", {
		outputFileExtension: "css",

		// opt-out of Eleventy Layouts
		useLayouts: false,

		compile: async function (inputContent, inputPath) {
			let parsed = path.parse(inputPath);
			// Don’t compile file names that start with an underscore
			if(parsed.name.startsWith("_")) {
				return;
			}

			let result = sass.compileString(inputContent, {
				loadPaths: [
					parsed.dir || ".",
					this.config.dir.includes,
				]
			});

			// Map dependencies for incremental builds
			this.addDependencies(inputPath, result.loadedUrls);

			return async (data) => {
				return result.css;
			};
		},
	});


 	eleventyConfig.setServerOptions({
		port: PORT,
		ready: () => {
			if(!opened){
				opened = true;
				open(`http://localhost:${PORT}`);
			}
		}
	});

  return {
    dir: {
		 	input: "src",
			includes: "components",
		 	layouts: "layouts",
			output: "dist",
			data: "data"
    },
		templateFormats: [
			"njk",
			"html"
		],
		htmlTemplateEngine: "njk",
  }

};