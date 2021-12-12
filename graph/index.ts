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
const greylinestyle = createLineStyle({ width: 1, color: Color('gray'), alpha: 1 });
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

const stopStart = document.getElementById('stop-start') as HTMLButtonElement;
const speedButton = document.getElementById('speed') as HTMLInputElement;
const left = document.getElementById('left') as HTMLButtonElement;
const right = document.getElementById('right') as HTMLButtonElement;

// stopStart.children

let speed = 0;
let isStart = false;

const spanStatus = document.getElementById('status') as HTMLSpanElement;

const setState = (nextState: number) => {
	if (nextState < 0) {
		ac.state = 0;
	} else if (nextState > ac.maxState) {
		ac.state = ac.maxState;
	} else {
		ac.state = nextState;
	}
	spanStatus.innerHTML = ac.state.toFixed(2);
};

const ivent = (delay: number) => {
	setState(ac.lastState + speed * delay / (60 * 1 / 1));
};

stopStart.addEventListener('click', () => {
	isStart = !isStart;
	console.log('click', { isStart });
	app.ticker[isStart ? 'add' : 'remove'](ivent);
	stopStart.innerHTML = isStart ? '&#9208;' : '&#9654;';
});
stopStart.innerHTML = isStart ? '&#9208;' : '&#9654;';

left.addEventListener('click', () => {
	if (isStart) stopStart.click();
	setState(Math.ceil(ac.state) - 1);
});

right.addEventListener('click', () => {
	if (isStart) stopStart.click();
	setState(Math.floor(ac.state) + 1);
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

const SimpleComplexToStrings = (c: SimpleComplex): [string, string] => {
	const [realpart, imagpart] = SimpleComplex.value(c);
	return [`${+realpart}`, `${+imagpart}`];
};

tranzitAdd.addEventListener('click', () => {
	tranzitAdd.before(templateTranzitBlock.cloneNode(true));

	const newElem = tranzitAdd.previousElementSibling as HTMLDivElement;
	const needMobius = newElem.querySelector('.need-mobius')!;
	const pC = newElem.querySelector('p.c')!;
	const allInputs = Array.from(
		// eslint-disable-next-line no-undef
		needMobius.getElementsByTagName('input') as HTMLCollectionOf<HTMLInputElement>,
	);
	const [ar, ai, br, bi, cr, ci, dr, di] = allInputs;
	const [m1r, m1i, rr, ri, m2r, m2i] = Array.from(
		// eslint-disable-next-line no-undef
		needMobius.getElementsByTagName('span') as HTMLCollectionOf<HTMLSpanElement>,
	);

	const recalcArgs = () => {
		const [a, b, c, d] = [[ar, ai], [br, bi], [cr, ci], [dr, di]]
			.map(([{ value: realpart }, { value: imagpart }]) => new SimpleComplex(
				SimpleFraction.fromNumber(+realpart), SimpleFraction.fromNumber(+imagpart),
			));

		if (c.eq(0n) || a.mul(d).eq(c.mul(b))) {
			pC.classList.add('fail-mobius');
			return;
		}

		pC.classList.remove('fail-mobius');

		[m1r.innerText, m1i.innerText] = SimpleComplexToStrings(d.div(c));
		[rr.innerText, ri.innerText] = SimpleComplexToStrings(b.mul(c).sub(a.mul(d)).div(c.mul(c)));
		[m2r.innerText, m2i.innerText] = SimpleComplexToStrings(a.div(c));
	};

	console.log({ allInputs, needMobius, newElem }, [m1r, m1i, rr, ri, m2r, m2i]);

	allInputs.forEach((input) => input.addEventListener('change', recalcArgs));
});

const GC = {
	Circle,
	NonZeroLine,
	LineThroughZero,
} as const;

const refreshAnimationControl = () => {
	ac.setData(
		(Array.from(figures.getElementsByClassName('block-info')) as HTMLDivElement[])
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
		(Array.from(tranzit.getElementsByClassName('block-info')) as HTMLDivElement[])
			.flatMap((e): { select: ActionType; input: SimpleComplex; }
				| { select: ActionType; input: SimpleComplex; }[] => {
				const selectValue = e.getElementsByTagName('select')[0].value as ActionType | 'Mobius';
				return selectValue === 'Mobius'
					? [
						{
							select: 'move',
							input: new SimpleComplex(...(
								[...e.getElementsByClassName('move1')[0]?.getElementsByTagName('span')]
									.map(
										({ textContent }) => SimpleFraction
											.fromNumber(+(textContent || '')),
									) as [SimpleFraction, SimpleFraction])),
						},
						{ select: 'inverse', input: new SimpleComplex(new SimpleFraction(0n)) },
						{
							select: 'rotateAndScale',
							input: new SimpleComplex(...(
							[...e.getElementsByClassName('rotateAndScale')[0]?.getElementsByTagName('span')]
								.map(
									({ textContent }) => SimpleFraction
										.fromNumber(+(textContent || '')),
								) as [SimpleFraction, SimpleFraction])),
						},
						{
							select: 'move',
							input: new SimpleComplex(...(
							[...e.getElementsByClassName('move2')[0]?.getElementsByTagName('span')]
								.map(
									({ textContent }) => SimpleFraction
										.fromNumber(+(textContent || '')),
								) as [SimpleFraction, SimpleFraction])),
						},
					]
					: {
						select: selectValue,
						input: new SimpleComplex(...(
							[...e.getElementsByTagName('input')]
								.map(
									({ value }) => SimpleFraction.fromNumber(+value),
								) as [SimpleFraction, SimpleFraction])),
					};
			})
			.map(({ select, input }): Action => (select === 'inverse' ? ['inverse'] : [select, input])),
	);

	// console.log(d, tranzit.getElementsByClassName('block-info'), tranzit);
};

document.getElementById('refresh')!.addEventListener('click', refreshAnimationControl);
refreshAnimationControl();
