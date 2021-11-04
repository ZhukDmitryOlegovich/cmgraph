import { BigIntPP } from './BigIntPP';

// numerator - числитель
// denominator - знаменатель

// eslint-disable-next-line import/prefer-default-export
export class Fraction {
	private numerator: BigIntPP;
	private denominator: BigIntPP;

	constructor(
		numerator: BigIntPP | bigint,
		denominator: BigIntPP | bigint = 1n,
	) {
		this.numerator = BigIntPP.create(numerator);
		this.denominator = BigIntPP.create(denominator);

		if (denominator.eq(0n)) throw new Error('Fraction.constructor: denominator cannot be zero');

		if (denominator.lt(0n)) {
			this.numerator = this.numerator.mul(-1n);
			this.denominator = this.denominator.mul(-1n);
		}
	}

	static numerator = (f: Fraction) => f.numerator;

	static denominator = (f: Fraction) => f.denominator;

	static create(numerator: BigIntPP, denominator: BigIntPP): Fraction | BigIntPP {
		const f = new Fraction(numerator, denominator);
		return f.denominator.eq(1n) ? f.numerator : f;
	}

	eq = (
		{ numerator, denominator }: Fraction,
	): boolean => this.denominator.mul(numerator).eq(this.numerator.mul(denominator));

	valueOf(): number {
		let n = BigIntPP.value(Fraction.numerator(this));
		const d = BigIntPP.value(Fraction.denominator(this));

		let s = n < 0n ? '-' : '';

		n = n < 0n ? -n : n;
		s += `${n / d}.`;
		n = (n % d) * 10n;

		// todo: fix s.length
		while (s.length < 31 && n !== 0n) {
			s += `${n / d}`;
			n = (n % d) * 10n;
		}

		return Number(s);
	}

	toString = (): string => (
		this.denominator.eq(1n) ? `${this.numerator}` : `${this.numerator}/${this.denominator}`
	);

	add = (
		{ numerator, denominator }: Fraction,
	) => new Fraction(
		this.numerator.mul(denominator).add(numerator.mul(this.denominator)),
		this.denominator.mul(denominator),
	);

	sub = (
		{ numerator, denominator }: Fraction,
	) => new Fraction(
		this.numerator.mul(denominator).sub(numerator.mul(this.denominator)),
		this.denominator.mul(denominator),
	);

	mul = (
		{ numerator, denominator }: Fraction,
	) => new Fraction(this.numerator.mul(numerator), this.denominator.mul(denominator));

	div = (
		{ numerator, denominator }: Fraction,
	) => new Fraction(this.numerator.mul(denominator), this.denominator.mul(numerator));

	// get inverse() {
	// 	return new Fraction(this.denominator, this.numerator);
	// }

	// get normalize() {
	// 	let gcd = BigIntPP.value(Fraction.numerator(this));
	// 	let d = BigIntPP.value(Fraction.denominator(this));
	// 	while (d) [gcd, d] = [d, gcd % d];

	// 	const numerator = this.numerator.div(gcd);
	// 	const denominator = this.denominator.div(gcd);

	// 	if (numerator instanceof Fraction || denominator instanceof Fraction) {
	// 		throw new Error('Fraction.normalize: gcd-fail');
	// 	}

	// 	return Fraction.create(numerator, denominator);
	// }
}
