import { BigIntPP, SimpleFraction } from '.';

export type SimpleComplexValue = [SimpleFraction, SimpleFraction];

// eslint-disable-next-line import/prefer-default-export
export class SimpleComplex {
	// eslint-disable-next-line no-useless-constructor
	constructor(
		private realpart: SimpleFraction,
		private imagpart: SimpleFraction = new SimpleFraction(0n),
	) { /**/ }

	// static create(realpart: BigIntPP, imagpart: BigIntPP): SimpleComplex | SimpleFraction | BigIntPP {
	// 	const c = new SimpleComplex(realpart, imagpart);
	// 	return Simple.eq(c.imagpart, new BigIntPP(0n))
	// 		? Simple.create(c.realpart)
	// 		: c;
	// }

	static realpart(c: SimpleComplex) { return c.realpart; }

	static imagpart(c: SimpleComplex) { return c.imagpart; }

	static value = (
		value: SimpleComplex | SimpleFraction | BigIntPP | bigint,
	): SimpleComplexValue => (
		value instanceof SimpleComplex
			? [value.realpart, value.imagpart]
			: [new SimpleFraction(...SimpleFraction.value(value)), new SimpleFraction(0n)]
	)

	eq(value: SimpleComplex | SimpleFraction | BigIntPP | bigint): boolean {
		const [realpart, imagpart] = SimpleComplex.value(value);
		return this.realpart.eq(realpart) && this.imagpart.eq(imagpart);
	}

	toString(): string { return `${this.realpart}+i*${this.imagpart}`.replace('+i*-', '-i*'); }

	add(value: SimpleComplex | SimpleFraction | BigIntPP | bigint): SimpleComplex {
		const [realpart, imagpart] = SimpleComplex.value(value);
		return new SimpleComplex(this.realpart.add(realpart), this.imagpart.add(imagpart));
	}

	sub(value: SimpleComplex | SimpleFraction | BigIntPP | bigint): SimpleComplex {
		const [realpart, imagpart] = SimpleComplex.value(value);
		return new SimpleComplex(this.realpart.sub(realpart), this.imagpart.sub(imagpart));
	}

	mul(value: SimpleComplex | SimpleFraction | BigIntPP | bigint): SimpleComplex {
		const [realpart, imagpart] = SimpleComplex.value(value);
		return new SimpleComplex(
			this.realpart.mul(realpart).sub(this.imagpart.mul(imagpart)),
			this.realpart.mul(imagpart).add(this.imagpart.mul(realpart)),
		);
	}

	/**
	 * Сопряженное (a + b*i) => (a - b*i)
	 */
	get conjugate(): SimpleComplex {
		return new SimpleComplex(this.realpart, this.imagpart.mul(-1n));
	}

	get sqrlength(): SimpleFraction {
		return this.imagpart.pow(2n).add(this.realpart.pow(2n));
	}

	// todo: root
	get length(): SimpleFraction {
		return SimpleFraction.fromNumber(Math.sqrt(this.sqrlength.valueOf()));
	}

	// get arg(): number {
	// 	let x = this.realpart.valueOf();
	// 	let y = this.imagpart.valueOf();
	// 	const length = Math.sqrt(x ** 2 + y ** 2);
	// 	x /= length;
	// 	return Math.a
	// }

	div(value: SimpleComplex | SimpleFraction | BigIntPP | bigint): SimpleComplex {
		const { sqrlength, realpart, imagpart } = new SimpleComplex(...SimpleComplex.value(value));
		return new SimpleComplex(
			this.realpart.mul(realpart).add(this.imagpart.mul(imagpart)).div(sqrlength),
			this.imagpart.mul(realpart).sub(this.realpart.mul(imagpart)).div(sqrlength),
		);
	}

	get inverse(): SimpleComplex {
		const { sqrlength } = this;
		return new SimpleComplex(
			this.realpart.div(sqrlength).simplification,
			this.imagpart.mul(-1n).div(sqrlength).simplification,
		);
	}

	// exp(): SimpleComplex {
	// 	const er = Math.exp(this.realpart);
	// 	return new SimpleComplex(er * Math.cos(this.imagpart), er * Math.sin(this.imagpart));
	// }

	scalar({ realpart, imagpart }: SimpleComplex): SimpleFraction {
		return this.realpart.mul(realpart).add(this.imagpart.mul(imagpart));
	}

	projection(other: SimpleComplex): SimpleComplex {
		// return this.mul(this.normalize.scalar(normalize)).simplification;
		return other.mul(this.scalar(other)).div(other.sqrlength).simplification;
	}

	get normalize(): SimpleComplex {
		const { length } = this;
		return this.div(length.eq(0n) ? 1n : length).simplification;
	}

	get simplification() {
		return new SimpleComplex(this.realpart.simplification, this.imagpart.simplification);
	}

	сollinearity({ realpart, imagpart }: SimpleComplex): boolean {
		return this.realpart.mul(imagpart).eq(this.imagpart.mul(realpart));
	}
}
