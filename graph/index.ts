import PIXI from 'pixi.js';

import {
	Circle, SimpleComplex, SimpleFraction,
} from '@/math';

import { Color } from './color';
import { createFillStyle, createLineStyle } from './create';
import { AnimCircle } from './math';
import PIXIPP from './pixipp';

// eslint-disable-next-line no-undef
declare const document: Document;

const app = new PIXI.Application({
	antialias: true, backgroundColor: 0xFFFFFF, width: 800, height: 800,
});

document.body.appendChild(app.view);

const { width, height } = app.screen;
const emptyfillstyle = createFillStyle({ color: Color('gray') });
const greylinestyle = createLineStyle({ width: 1, color: Color('gray') });
const blacklinestyle = createLineStyle({ width: 1, color: Color('black'), alpha: 1 });

const pole = new PIXI.Graphics(new PIXIPP.GraphicsGeometryPP(
	...Array(8).fill(0).map((_, i) => new PIXI.GraphicsData(
		new PIXI.Polygon([
			{ x: i * 100, y: 0 },
			{ x: i * 100, y: width },
		]),
		emptyfillstyle,
		greylinestyle,
	)),
	...Array(8).fill(0).map((_, i) => new PIXI.GraphicsData(
		new PIXI.Polygon([
			{ y: i * 100, x: 0 },
			{ y: i * 100, x: height },
		]),
		emptyfillstyle,
		greylinestyle,
	)),
	new PIXI.GraphicsData(
		new PIXI.Polygon([
			{ x: 400, y: 0 },
			{ x: 400, y: height },
		]),
		emptyfillstyle,
		blacklinestyle,
	),
	new PIXI.GraphicsData(
		new PIXI.Polygon([
			{ y: 400, x: 0 },
			{ y: 400, x: height },
		]),
		emptyfillstyle,
		blacklinestyle,
	),
));

app.stage.addChild(pole);

const c1 = new Circle(
	new SimpleComplex(new SimpleFraction(1n), new SimpleFraction(0n)),
	new SimpleFraction(1n),
);

const gd1 = new PIXI.GraphicsData(
	new PIXI.Circle(
		...SimpleComplex.value(c1.c).map((e, i) => (i === 0 ? 1 : -1) * e.valueOf() * 100),
		Math.sqrt(c1.r2.valueOf()) * 100,
	),
	createFillStyle({ color: Color('magenta'), alpha: 0.5 }),
	createLineStyle({ width: 2, color: Color('black') }),
);

const gg = new PIXIPP.GraphicsGeometryPP(gd1);
const fig = new PIXI.Graphics(gg);
fig.position.copyFrom({ x: width / 2, y: height / 2 });

app.stage.addChild(fig);

const speed = 1 * 60 * 1000;
let time = 0;

const anim1 = (delay: number) => {
	time += delay * 1000;
	if (time > speed) time = speed;
	gd1.shape = AnimCircle.move(
		c1, new SimpleComplex(new SimpleFraction(1n), new SimpleFraction(1n)), speed,
	)(Math.round(time));

	gg.rerender();

	if (time === speed) {
		time = 0;
		console.timeEnd('anim1');
		app.ticker.remove(anim1);
		if (right) right.disabled = false;
		if (left) left.disabled = false;
	}
};

const anim2 = (delay: number) => {
	time += delay * 1000;
	if (time > speed) time = speed;
	gd1.shape = AnimCircle.move(
		c1, new SimpleComplex(new SimpleFraction(1n), new SimpleFraction(1n)), speed,
	)(speed - Math.round(time));

	gg.rerender();

	if (time === speed) {
		time = 0;
		console.timeEnd('anim2');
		app.ticker.remove(anim2);
		if (right) right.disabled = false;
		if (left) left.disabled = false;
	}
};

// eslint-disable-next-line no-undef
const right = document.getElementById('right') as HTMLButtonElement | null;
// eslint-disable-next-line no-undef
const left = document.getElementById('left') as HTMLButtonElement | null;

right?.addEventListener('click', (e) => {
	console.time('anim1');
	app.ticker.add(anim1);
	right.disabled = true;
	if (left) left.disabled = true;
});

left?.addEventListener('click', (e) => {
	console.time('anim2');
	app.ticker.add(anim2);
	if (right) right.disabled = true;
	left.disabled = true;
});
