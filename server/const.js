const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const build = path.resolve(
	root, 
	JSON.parse(
		fs.readFileSync(path.resolve(root, 'tsconfig.json'))
			.toString()
			.replace(/\/\/.*|\/\*.*?\*\//g, '')
	)
		.compilerOptions
		.outDir || '.'
	);

module.exports = {root, build};
