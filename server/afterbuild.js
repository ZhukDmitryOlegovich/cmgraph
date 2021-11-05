"use strict";

const chalk = require('chalk');
const FileHound = require('filehound');
const fs = require('fs');
const path = require('path');
const { build } = require('./const');

const files = FileHound.create()
	.paths(build)
	.discard('node_modules')
	.ext('js')
	.find();

files.then((filePaths) => filePaths.forEach((filepath) => {
	fs.readFile(filepath, 'utf8', (err, data) => {
		if (!/(?:import|export) .* from/g.test(data)) {
			return;
		}

		console.log(chalk.gray('===>'), 'writing to', chalk.blue.bold(path.relative(build, filepath)));
		// let newData = data.replace(/((?:import|export) .* from\s+['"])(.*)(?=['"])/g, '$1$2.js')
		let newData = data.replace(/((?:import|export) .* from\s+['"])(.*)(['"];?)/g, (...args) => {
			// console.log(filepath, args.slice(0, -1));
			let isDir = false;
			try {
				isDir = fs.lstatSync(path.resolve(path.dirname(filepath), args[2])).isDirectory()
			} catch { }

			const ans = args[1] + args[2] + (isDir ? '/index' : '') + '.js' + args[3];
			console.log(
				chalk.gray(args[1])
				+ chalk.gray.bold(args[2])
				+ chalk.bold.green((isDir ? '/index' : '') + '.js')
				+ chalk.gray(args[3])
			);
			return ans;
		});

		if (err) throw err;

		fs.writeFile(filepath, newData, (err) => { if (err) throw err; });
	});
}));