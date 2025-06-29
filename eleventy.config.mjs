import { open } from "out-url";
import path from "node:path";
import * as sass from "sass";

const PORT = 1234;

let opened = false;

export default function(eleventyConfig) {

  eleventyConfig.addPassthroughCopy({
    './node_modules/alpinejs/dist/cdn.js': '/assets/js/alpine.js',
  });

	eleventyConfig.addPassthroughCopy({
		"./public/": "/"
	})
	eleventyConfig.addWatchTarget("./public/");

	eleventyConfig.addPassthroughCopy({
		"src/assets/images": "/assets/images"
	});
	eleventyConfig.addPassthroughCopy({
		"src/assets/js": "/assets/js"
	});

	eleventyConfig.addWatchTarget("./src/assets/");

	eleventyConfig.addTemplateFormats('scss');

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

	eleventyConfig.setBrowserSyncConfig({
    open: true,
  });

 	// eleventyConfig.setServerOptions({
	// 	port: PORT,
	// 	ready: () => {
	// 		if(!opened){
	// 			opened = true;
	// 			open(`http://localhost:${PORT}`);
	// 		}
	// 	}
	// });
	// eleventyConfig.addLayoutAlias('layout', 'src/layouts/layout.njk');

  return {
		passthroughFileCopy: true,
    dir: {
		 	input: "src",
			includes: "components",
			layouts: "layouts",
			data: "data",
			output: "dist",
    },
		dataTemplateEngine: "njk",
		htmlTemplateEngine: "njk",
  }
};