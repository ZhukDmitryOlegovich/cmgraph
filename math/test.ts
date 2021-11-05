/* eslint-disable no-console */
import { LineThroughZero, NonZeroLine, Сircle } from './medium';
import { SimpleComplex, SimpleFraction } from './simple';

console.time('test');
const length = 100;

console.time('NonZeroLine');
const nzls = Array(length).fill(0)
	.map(() => new NonZeroLine(new SimpleComplex(
		SimpleFraction.fromNumber(Math.random() * 10),
		SimpleFraction.fromNumber(Math.random() * 10),
	)))
	.map((c) => [c, c.inverse.inverse]);
const fnzls = nzls.filter(([c1, c2]) => !c1.eq(c2));
console.timeEnd('NonZeroLine');

console.log(
	'NonZeroLine:',
	Math.max(...nzls.map(([c1, c2]) => Math.abs(c1.c.length.sub(c2.c.length).valueOf()))),
	[nzls.length, fnzls.length, `${((100 * fnzls.length) / nzls.length).toFixed(2)}%`],
);

console.dir(
	fnzls.slice(0, 5),
	{ depth: null },
);

console.time('LineThroughZero');
const ltzs = Array(length).fill(0)
	.map(() => new LineThroughZero(new SimpleComplex(
		SimpleFraction.fromNumber(Math.random() * 10),
		SimpleFraction.fromNumber(Math.random() * 10),
	)))
	.map((c) => [c, c.inverse.inverse]);
const fltzs = ltzs.filter(([c1, c2]) => !c1.eq(c2)).map(([c1, c2]) => [
	c1.constructor,
	c1.c.normalize.toString(),
	c2.constructor,
	c2.c.normalize.toString(),
]);
console.timeEnd('LineThroughZero');

console.log(
	'LineThroughZero:',
	Math.max(...ltzs.map(([c1, c2]) => Math.abs(c1.c.length.sub(c2.c.length).valueOf()))),
	[ltzs.length, fltzs.length, `${((100 * fltzs.length) / ltzs.length).toFixed(2)}%`],
);
console.dir(
	fltzs.slice(0, 1),
	{ depth: null },
);

console.time('Сircle');
const cs = Array(length).fill(0)
	.map(() => new Сircle(new SimpleComplex(
		SimpleFraction.fromNumber(Math.random() * 10),
		SimpleFraction.fromNumber(Math.random() * 10),
	), SimpleFraction.fromNumber(Math.random() * 10)))
	.map((c) => [c, c.inverse.inverse] as Сircle[]);

const fcs = cs.filter(([c1, c2]) => !c1.eq(c2))
	.map(([c1, c2]) => [/* c1, c2, */
		c1.r.normalize.toString(),
		c2.r.normalize.toString(),
		c1.c.eq(c2.c),
		c1.eq(c2),
	]);
console.timeEnd('Сircle');

console.log(
	'Cicle:',
	Math.max(...cs.map(([c1, c2]) => Math.abs(c1.c.length.sub(c2.c.length).valueOf()))),
	Math.max(...cs.map(([c1, c2]) => Math.abs(c1.r.sub(c2.r).valueOf()))),
	[cs.length, fcs.length, `${((100 * fcs.length) / cs.length).toFixed(2)}%`],
);
console.dir(
	fcs.slice(0, 1),
	{ depth: null },
);

console.timeEnd('test');
