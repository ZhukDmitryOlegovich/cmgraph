import { BigIntPP, SimpleFraction } from '.';

export type SimpleComplexValue = [SimpleFraction, SimpleFraction];

// eslint-disable-next-line import/prefer-default-export
export class SimpleComplex {
	// eslint-disable-next-line no-useless-constructor
	constructor(
		private realpart: SimpleFraction,
		private imagpart: SimpleFraction,
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

	div(value: SimpleComplex | SimpleFraction | BigIntPP | bigint): SimpleComplex {
		const { sqrlength, realpart, imagpart } = new SimpleComplex(...SimpleComplex.value(value));
		return new SimpleComplex(
			this.realpart.mul(realpart).add(this.imagpart.mul(imagpart)).div(sqrlength),
			this.imagpart.mul(realpart).sub(this.realpart.mul(imagpart)).div(sqrlength),
		);
	}

	get inverse(): SimpleComplex {
		const { sqrlength: { normalize } } = this;
		return new SimpleComplex(
			this.realpart.div(normalize),
			this.imagpart.mul(-1n).div(normalize),
		);
	}

	// exp(): SimpleComplex {
	// 	const er = Math.exp(this.realpart);
	// 	return new SimpleComplex(er * Math.cos(this.imagpart), er * Math.sin(this.imagpart));
	// }

	scalar({ realpart, imagpart }: SimpleComplex): SimpleFraction {
		return this.realpart.mul(realpart).add(this.imagpart.mul(imagpart));
	}

	projection({ normalize }: SimpleComplex): SimpleComplex {
		return this.mul(this.scalar(normalize));
	}

	get normalize(): SimpleComplex {
		return this.div(this.length);
	}

	сollinearity({ realpart, imagpart }: SimpleComplex): boolean {
		return this.realpart.mul(imagpart).eq(this.imagpart.mul(realpart));
	}
}
