"use strict";

const chalk = require('chalk');
const FileHound = require('filehound');
const fs = require('fs');
const path = require('path');
const { build, paths } = require('./const');

const files = FileHound.create()
	.paths(build)
	.discard('node_modules')
	.ext('js')
	.find();

const deleteName = ['pixi.js'];

files.then((filePaths) => filePaths.forEach((filepath) => {
	fs.readFile(filepath, 'utf8', (err, data) => {
		if (!/(?:import|export) .* from/g.test(data)) {
			return;
		}

		console.log(chalk.gray('===>'), 'writing to', chalk.blue.bold(path.relative(build, filepath)));
		// let newData = data.replace(/((?:import|export) .* from\s+['"])(.*)(?=['"])/g, '$1$2.js')
		let newData = data.replace(
			/((?:import|export) .* from\s+['"])(.*)(['"];?)/g,
			/**
			 * @param {string} full 
			 * @param {string} type 
			 * @param {string} name 
			 * @param {string} final 
			 */
			(full, type, name, final) => {
				if (deleteName.includes(name)) {
					console.log(
						chalk.gray(type)
						+ chalk.magenta.bold(name)
						+ chalk.gray(final),
						chalk.magenta.bold('[[ delete ]]'),
					);

					return `/* ${full} */`;
				}

				if (name.startsWith('@/')) {
					let newName = path.relative(
						path.dirname(filepath), path.resolve(build, '.' + name.slice(1)),
					);

					if (!newName.startsWith('.')) {
						newName = './' + newName;
					}

					console.log(
						chalk.magenta.bold('[['),
						chalk.grey(name),
						chalk.magenta.bold('=>'),
						chalk.grey(newName),
						chalk.magenta.bold(']]'),
					);

					name = newName;
				}

				if (name.startsWith('.')) {
					// console.log(filepath, args.slice(0, -1));
					let isDir = false;
					try {
						isDir = fs.lstatSync(path.resolve(path.dirname(filepath), name)).isDirectory()
					} catch { }

					const ans = type + name + (isDir ? '/index' : '') + '.js' + final;
					console.log(
						chalk.gray(type)
						+ chalk.gray.bold(name)
						+ chalk.bold.green((isDir ? '/index' : '') + '.js')
						+ chalk.gray(final)
					);
					return ans;
				}

				console.log(chalk.red(type + chalk.bold(name) + final));
				return full;
			});

		if (err) throw err;

		fs.writeFile(filepath, newData, (err) => { if (err) throw err; });
	});
}));