import PIXI from 'pixi.js';

import { Color } from './color';
import { createFillStyle, createLineStyle } from './create';
import PIXIPP from './pixipp';

// eslint-disable-next-line no-undef
declare const document: Document;

const app = new PIXI.Application({
	antialias: true, backgroundColor: 0xFFFFFF, width: 800, height: 800,
});
document.body.appendChild(app.view);

const c1 = new PIXI.GraphicsData(
	new PIXI.Circle(0, 0, 50),
	createFillStyle({ color: 0x0000FF }),
	createLineStyle({ width: 1 }),
);

const c2 = new PIXI.GraphicsData(
	new PIXI.Circle(100, 0, 50),
	createFillStyle({ color: 0x00FF00 }),
	c1.lineStyle,
);

const gg = new PIXIPP.GraphicsGeometryPP(c1, c2);

const g = new PIXI.Graphics(gg);

const emptyfillstyle = createFillStyle({ color: Color('gray') });
const greylinestyle = createLineStyle({ width: 2, color: Color('grey') });

const pole = new PIXI.Graphics((() => {
	const ans = new PIXI.GraphicsGeometry();
	const { width, height } = app.screen;

	console.log({ width, height });

	ans.graphicsData = Array(8).fill(0).map((_, i) => new PIXI.GraphicsData(
		new PIXI.Polygon([
			{ x: i * 100, y: 0 },
			{ x: i * 100, y: width },
		]),
		emptyfillstyle,
		greylinestyle,
	));
	ans.graphicsData.push(...Array(8).fill(0).map((_, i) => new PIXI.GraphicsData(
		new PIXI.Polygon([
			{ y: i * 100, x: 0 },
			{ y: i * 100, x: height },
		]),
		emptyfillstyle,
		greylinestyle,
	)));

	return ans;
})());

app.stage.addChild(pole, g);

// eslint-disable-next-line no-undef
const input = document.getElementById('range') as HTMLInputElement | null;

input?.addEventListener('input', (e) => {
	if (c2.shape instanceof PIXI.Circle) {
		c2.shape.x = Number(input.value);
		gg.rerender();
	}
});

console.log(
	[
		g.width,
		g.height,
	],
);

const { width, height } = app.screen;
g.position.copyFrom({ x: width / 2, y: height / 2 });

console.log(
	[
		g.pivot,
		g.position,
	],
);

let all = 0;
let count = 0;
console.time('delta');

const second = 60;
let speedRotate = 1;

// eslint-disable-next-line no-undef
const speed = document.getElementById('speed') as HTMLInputElement | null;

speed?.addEventListener('input', (e) => {
	if (c2.shape instanceof PIXI.Circle) {
		speedRotate = Number(speed.value);
	}
});

app.ticker.add((delta) => {
	all += delta;
	count += 1;
	if (all >= second) {
		console.timeEnd('delta');
		console.time('delta');
		console.log('count:', count);
		all -= second;
		count = 0;
	}
	g.angle += (delta / second) * (360 / 4) * speedRotate;
});

g.interactive = true;
g.buttonMode = true;

let status = 0;

console.log(g.width, g.height, g.children, g.geometry);

g.on('click', () => {
	status = (status + 1) % 4;
	const { y } = g.pivot;
	g.pivot.copyFrom({ x: 50 * (status % 2 === 1 ? 1 : status), y });
	console.log('click', { status, x: g.pivot.x });
	console.log(g.children, g.geometry);
});
