import path from "node:path";
import * as sass from "sass";
import pluginWebc from "@11ty/eleventy-plugin-webc";
import { EleventyRenderPlugin } from "@11ty/eleventy";
import { minify } from "terser";
import fs from "fs";



export default function(eleventyConfig) {

	// eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
	// 	urlPath: "/assets/images/",
	// 	outputDir: "/dist/assets/images"
	// });
	eleventyConfig.addFilter("jsmin", async function (code, callback) {
		try {
			const minified = await minify(code);
			callback(null, minified.code);
		} catch (err) {
			console.error("Terser error: ", err);
			// Fail gracefully.
			callback(null, code);
		}
	});

	eleventyConfig.addPlugin(pluginWebc, {
		components: "src/components/**/*.webc"
	});
	eleventyConfig.addPlugin(EleventyRenderPlugin);

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

	// eleventyConfig.addPassthroughCopy(
	// 	{ "src/assets/js": "/assets/js" },
  //   {
  //     transform: () =>
	// 		new TransformStream((stream, chunk, done) =>
	// 			esbuild.transform(chunk.toString(), { minify: true })
	// 			.then((result) => done(null, result.code))
	// 		),
  //   }
	// );

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

	eleventyConfig.setServerOptions({
    module: "@11ty/eleventy-server-browsersync",
		open: true
  });


	eleventyConfig.on("afterBuild", () => {

// "src/assets/js": "/assets/js"

    const srcDir = "./src/assets/js";
    const publicDir = "./dist/assets/js";

    const minifyFilesInDirectory = (srcDir, publicDir) => {
      fs.readdirSync(srcDir).forEach(file => {
        const srcFilePath = path.join(srcDir, file);
        const publicFilePath = path.join(publicDir, file);

        // If the file is a directory, recursively minify files inside it
        if (fs.statSync(srcFilePath).isDirectory()) {
          fs.mkdirSync(publicFilePath, { recursive: true });
          minifyFilesInDirectory(srcFilePath, publicFilePath);
        } else if (path.extname(file) === ".js") {
          // Only process files with .js extension
          const code = fs.readFileSync(srcFilePath, "utf-8");

          minify(code).then(minified => {
            fs.writeFileSync(publicFilePath, minified.code, "utf-8");
          }).catch(err => {
            console.error(`Terser error in file ${file}: `, err);
          });
        } else {
          console.log(`Skipping non-JS file: ${file}`);
        }
      });
    };

    // Minify files starting from the src/scripts directory, placing them in public/scripts
    minifyFilesInDirectory(srcDir, publicDir);
  });




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


