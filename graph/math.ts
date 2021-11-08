import PIXI from 'pixi.js';

import {
	Circle, LineThroughZero, NonZeroLine, SimpleComplex, SimpleFraction,
} from '@/math';

export const createCircle = ({ c, r2 }: Circle) => new PIXI.Circle(
	...SimpleComplex.value(c).map((e, i) => (i === 0 ? 1 : -1) * e.valueOf() * 100),
	Math.sqrt(r2.valueOf()) * 100,
);

export const createLineThroughZero = ({ c }: LineThroughZero) => {
	const [realpart, imagpart] = SimpleComplex.value(c);
	const x = -imagpart.valueOf();
	const y = realpart.valueOf();

	const left = 400 / (Math.abs(x) > Math.abs(y) ? y : x);
	const right = -400 / (Math.abs(x) > Math.abs(y) ? y : x);

	return new PIXI.Polygon(
		{ x: x * left, y: -y * left },
		{ x: x * right, y: -y * right },
	);
};

export const createNonZeroLine = ({ c }: NonZeroLine) => {
	const ans = createLineThroughZero(new LineThroughZero(c));
	const [x, y] = SimpleComplex.value(c).map((e, i) => (i === 0 ? 1 : -1) * e.valueOf() * 100);

	ans.points[0] += x;
	ans.points[1] += y;
	ans.points[2] += x;
	ans.points[3] += y;

	return ans;
};

export const AnimCircle = {
	rotateAndScale: (c: Circle, s: SimpleComplex, max = 100) => {
		const one = new SimpleComplex(new SimpleFraction(1n));
		const bmax = BigInt(max);
		return (proc: number) => {
			proc = Math.max(Math.min(max, proc), 0);
			return createCircle(
				c.rotateAndScale(
					one.mul(BigInt(max - proc))
						.add(s.mul(BigInt(proc)))
						.div(bmax),
				),
			);
		};
	},
	move: (c: Circle, s: SimpleComplex, max = 100) => {
		const zero = new SimpleComplex(new SimpleFraction(0n));
		const bmax = BigInt(max);
		return (proc: number) => {
			proc = Math.max(Math.min(max, proc), 0);
			return createCircle(
				c.move(
					zero.mul(BigInt(max - proc))
						.add(s.mul(BigInt(proc)))
						.div(bmax),
				),
			);
		};
	},
};
