/* eslint-env browser */
import PIXI from 'pixi.js';

import {
	Circle, GeneralisedCircle, LineThroughZero, NonZeroLine, SimpleComplex, SimpleFraction,
} from '@/math';

import { AnimationControl } from './AnimationControl';
import { Action, ActionType } from './AnimationFrame';
import { Color } from './color';
import { createFillStyle, createLineStyle } from './create';
import { GraphicsGeometryPP } from './pixipp';

// eslint-disable-next-line no-undef
declare const document: Document;

const app = new PIXI.Application({
	antialias: true, backgroundColor: 0xFFFFFF, width: 800, height: 800,
});

document.getElementById('draw-container')?.appendChild(app.view);
// document.body.appendChild(app.view);

const { width, height } = app.screen;
const emptyfillstyle = createFillStyle({ color: Color('gray') });
const greylinestyle = createLineStyle({ width: 1, color: Color('gray') });
const blacklinestyle = createLineStyle({ width: 1, color: Color('black'), alpha: 1 });

const pole = new PIXI.Graphics(new GraphicsGeometryPP(
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

// const Complex = (
// 	a: bigint,
// 	b: bigint | null,
// 	c: bigint,
// 	d: bigint | null,
// ) => new SimpleComplex(
// 	new SimpleFraction(a, b ?? undefined), new SimpleFraction(c, d ?? undefined),
// );

// const c1 = new Circle(
// 	Complex(0n, null, 0n, null),
// 	new SimpleFraction(1n),
// );

const ac = new AnimationControl(
	app,
	[
		// c1
	],
	[
		// ['move', Complex(2n, null, 0n, null)],
		// ['rotateAndScale', Complex(0n, null, 1n, null)],
		// ['move', Complex(0n, null, -1n, null)],
		// ['inverse'],
		// ['rotateAndScale', Complex(0n, null, 1n, null)],
		// ['move', Complex(-1n, 2n, 0n, null)],
		// ['rotateAndScale', Complex(3n, null, 1n, null)],
		// ['inverse'],
		// ['move', Complex(0n, null, -1n, null)],
		// ['inverse'],
		// ['inverse'],
	],
);
ac.state = 0;

// const left = document.getElementById('left') as HTMLButtonElement;
const stopStart = document.getElementById('stop-start') as HTMLButtonElement;
const speedButton = document.getElementById('speed') as HTMLInputElement;
// const right = document.getElementById('right') as HTMLButtonElement;

let speed = 0;
let isStart = false;

const ivent = (delay: number) => {
	const nextState = ac.lastState + speed * delay / (60 * 1 / 1);
	if (nextState < 0) {
		ac.state = 0;
	} else if (nextState > ac.maxState) {
		ac.state = ac.maxState;
	} else {
		// console.log({ nextState });
		ac.state = nextState;
	}
};

stopStart.addEventListener('click', (e) => {
	isStart = !isStart;
	console.log('click', { isStart });
	app.ticker[isStart ? 'add' : 'remove'](ivent);
});

speedButton.addEventListener('input', (e) => {
	speed = Number(speedButton.value);
});
speed = Number(speedButton.value);

const figures = document.getElementById('figures')!;

const templateFiguresBlock = document
	.createElement('template')
	.appendChild(figures.firstElementChild!) as HTMLElement;

templateFiguresBlock.style.display = 'block';

const figuresAdd = figures.getElementsByClassName('add-element')[0] as HTMLButtonElement;

figuresAdd.addEventListener('click', () => { figuresAdd.before(templateFiguresBlock.cloneNode(true)); });

const tranzit = document.getElementById('tranzit')!;

const templateTranzitBlock = document
	.createElement('template')
	.appendChild(tranzit.firstElementChild!) as HTMLElement;

templateTranzitBlock.style.display = 'block';

const tranzitAdd = tranzit.getElementsByClassName('add-element')[0] as HTMLButtonElement;

tranzitAdd.addEventListener('click', () => { tranzitAdd.before(templateTranzitBlock.cloneNode(true)); });

const GC = {
	Circle,
	NonZeroLine,
	LineThroughZero,
} as const;

const refreshAnimationControl = () => {
	ac.setData(
		[...figures.getElementsByClassName('block-info')]
			.map((e) => ({
				select: e.getElementsByTagName('select')[0].value as keyof typeof GC,
				input: [...e.getElementsByTagName('input')].map(({ value }) => +value),
			}))
			.map(({ select, input: [cr, ci, r2] }): GeneralisedCircle => (select === 'Circle'
				? new Circle(
					new SimpleComplex(SimpleFraction.fromNumber(cr), SimpleFraction.fromNumber(ci)),
					SimpleFraction.fromNumber(r2),
				)
				: new GC[select](
					new SimpleComplex(SimpleFraction.fromNumber(cr), SimpleFraction.fromNumber(ci)),
				))),
		[...tranzit.getElementsByClassName('block-info')]
			.map((e) => ({
				select: e.getElementsByTagName('select')[0].value as ActionType,
				input: new SimpleComplex(...(
				[...e.getElementsByTagName('input')]
					.map(
						({ value }) => SimpleFraction.fromNumber(+value),
					) as [SimpleFraction, SimpleFraction])),
			}))
			.map(({ select, input }): Action => (select === 'inverse' ? ['inverse'] : [select, input])),
	);

	// console.log(d, tranzit.getElementsByClassName('block-info'), tranzit);
};

document.getElementById('refresh')!.addEventListener('click', refreshAnimationControl);
refreshAnimationControl();
