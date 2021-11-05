const style = require('chalk');
const express = require('express');
const path = require('path');
const { build, root } = require('./const');

const app = express();

console.log({build});
app.use(express.static(build));

app.get('*', (req, res) => {
	res.sendFile(path.join(root, 'index.html'));
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
	// eslint-disable-next-line no-console
	console.log('Server listening', style.green(`http://localhost:${port}`));
});
