import sharp from 'sharp'
import fs from 'fs';
import path from 'path';

const inputFolder = './src/assets/images'; // Specify your input folder
const outputFolder = './dist/assets/images'; // Specify your output folder

// Create the output folder if it doesn't exist
if (!fs.existsSync(outputFolder)) {
	fs.mkdirSync(outputFolder);
}

fs.readdir(inputFolder, (err, files) => {
	if (err) {
		console.error('Error reading input folder:', err);
		return;
	}	

	files.forEach(file => {
		const inputFile = path.join(inputFolder, file);
		const outputFile = path.join(outputFolder, file);
		const fileExtension = path.extname(file).toLowerCase();

		// Process only common image formats (you can add more)
		if (['.jpg', '.jpeg', '.png', '.webp'].includes(fileExtension)) {
			sharp(inputFile)
			.jpeg({ mozjpeg: true }) // Adjust quality for JPEG
			.png({ quality: 50, palette: true }) // Adjust quality for PNG
			.toFile(outputFile, (err, info) => {
				if (err) {
					console.error(`Error processing ${file}:`, err);
				} else {
					fs.stat(inputFile, (err, stats) => {
						console.log(`reduced [${outputFile}] from ${stats.size} bytes to ${info.size} bytes`);
					});
				}
			});
		} else {
			console.log(`Skipping non-image file: ${file}`);
		}
	});
});
