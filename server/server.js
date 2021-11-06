const style = require('chalk');
const express = require('express');
const path = require('path');
const { build, root, port, static } = require('./const');

const app = express();

console.log("Let's start:", { root, build, static, port });

app.use(express.static(build));

app.use(express.static(static));

app.get('/', (req, res) => {
	console.log(style.green(req.url), req.query);
	res.sendFile(path.join(root, 'static', 'index.html'));
});

app.get('*', (req, res) => {
	console.log(style.red(req.url));
	res.sendStatus(404);
});

app.listen(port, () => {
	console.log(
		'Server listening', 
		style.green('http://localhost:' + port),
	);
});
