const style = require('chalk');
const express = require('express');
const path = require('path');
const { build, root, port, static } = require('./const');

const app = express();

const getTime = () => new Date().toLocaleString('ru', {hour: '2-digit', minute: '2-digit', second: '2-digit'});

console.log("Let's start:", { root, build, static, port });

app.use(express.static(build));

app.use(express.static(static));

app.get('/', (req, res) => {
	console.log(style.grey(getTime()), style.green(req.url), req.query);
	res.sendFile(path.join(root, 'static', 'index.html'));
});

app.get('/node_modules/js-angusj-clipper/*', (req, res) => {
	const pathToFile = path.join(root, req.url);
	console.log(style.grey(getTime()), style.yellow(req.url));
	res.sendFile(pathToFile);
});

app.get('*', (req, res) => {
	console.log(style.grey(getTime()), style.red(req.url));
	res.sendStatus(404);
});

app.listen(port, () => {
	console.log(
		style.grey(getTime()),
		'Server listening', 
		style.green('http://localhost:' + port),
	);
});
