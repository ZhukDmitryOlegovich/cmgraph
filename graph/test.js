const acgraph = require('./graph.min.js');
// import acgraph from './graphics.min.js';

// create a stage
const stage = acgraph.create('stage-container');

// draw the frame
const frame = stage.rect(25, 50, 350, 300);

// draw the house
const walls = stage.rect(50, 250, 200, 100);
const roof = stage.path()
	.moveTo(50, 250)
	.lineTo(150, 180)
	.lineTo(250, 250)
	.close();

// draw a man
const head = stage.circle(330, 280, 10);
const neck = stage.path().moveTo(330, 290).lineTo(330, 300);
const kilt = stage.triangleUp(330, 320, 20);
const rightLeg = stage.path().moveTo(320, 330).lineTo(320, 340);
const leftLeg = stage.path().moveTo(340, 330).lineTo(340, 340);

console.log({
	head,
	neck,
	kilt,
	rightLeg,
	leftLeg,
});

// color the picture
// fancy frame
frame.stroke(['red', 'green', 'blue'], 2, '2 2 2');
// brick walls
walls.fill(acgraph.hatchFill('horizontalbrick'));
// straw roof
roof.fill('#e4d96f');
// plaid kilt
kilt.fill(acgraph.hatchFill('plaid'));

// copyright everything
// 169 is a char code of copyright symbol
const text = acgraph.text().text(String.fromCharCode(169)).opacity(0.2);
const pattern_font = stage.pattern(text.getBounds());
pattern_font.addChild(text);
// fill the whole image with the pattern
frame.fill(pattern_font);
