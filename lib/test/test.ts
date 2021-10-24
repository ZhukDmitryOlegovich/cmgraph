/* eslint-disable no-console */
import { Complex } from '../Complex';
import { Сircle, LineThroughZero, NonZeroLine } from '../GeneralisedCircle';

const nzls = Array(10000).fill(0)
	.map(() => new NonZeroLine(new Complex(
		Math.random() * 10, Math.random() * 10,
	)))
	.map((c) => [c, c.inverse.inverse]);

console.log('NonZeroLine:', Math.max(...nzls.map(([c1, c2]) => Math.abs(c1.c.length - c2.c.length))));
console.dir(
	nzls.filter(([c1, c2]) => !c1.equal(c2))
		.slice(0, 5),
	{ depth: null },
);

const ltzs = Array(10000).fill(0)
	.map(() => new LineThroughZero(new Complex(
		Math.random() * 10, Math.random() * 10,
	)))
	.map((c) => [c, c.inverse.inverse]);

console.log('LineThroughZero:', Math.max(...ltzs.map(([c1, c2]) => Math.abs(c1.c.length - c2.c.length))));
console.dir(
	ltzs.filter(([c1, c2]) => !c1.equal(c2))
		.slice(0, 5),
	{ depth: null },
);

const cs = Array(10000).fill(0)
	.map(() => new Сircle(new Complex(
		Math.random() * 10, Math.random() * 10,
	), Math.random() * 10))
	.map((c) => [c, c.inverse.inverse] as Сircle[]);

console.log(
	'Cicle:',
	Math.max(...cs.map(([c1, c2]) => Math.abs(c1.c.length - c2.c.length))),
	Math.max(...cs.map(([c1, c2]) => Math.abs(c1.r - c2.r))),
);
console.dir(
	cs.filter(([c1, c2]) => !c1.equal(c2))
		.map(([c1, c2]) => [c1, c2, c1.r - c2.r, c1.c.equal(c2.c)])
		.slice(0, 5),
	{ depth: null },
);
