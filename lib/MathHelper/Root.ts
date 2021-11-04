import { MathBigInt } from '.';
import { IMathTypes } from './AbstractMathTypes';
import { Fraction } from './Fraction';

// eslint-disable-next-line import/prefer-default-export
export class Root implements IMathTypes {
	public static readonly compare = (
		{ base: an, exponent: ar }: Root, { base: bn, exponent: br }: Root,
	): number => Number(MathBigInt.sign(ar - br) || MathBigInt.sign(an - bn));

	constructor(public base: bigint, public exponent = 2n) {
		if (base < 0n) throw new Error('Root: base cannot be less zero');
		if (exponent < 1n) throw new Error('Root: exponent cannot be less one');
	}

	equal({ base: n, exponent: r }: Root): boolean {
		return n ** this.exponent === this.base ** r;
	}

	valueOf(): number {
		const { base: n, exponent: r } = this;
		const A = Number(n);
		const N = Number(r);
		// let a = 0;
		// let b = 1;

		// do {
		// 	[a, b] = [b, ((N - 1) * b + A / b ** (N - 1)) / N];
		// } while (a !== b);

		return A ** (1 / N);
	}

	toString(): string {
		return `${
			this.base < 0n ? `(${this.base})` : this.base
		}${this.exponent === 1n ? '' : `**(1/${this.exponent})`}`;
	}

	// add({ n, d }: Root): Root {
	// 	return new Root(this.n * d + n * this.d, this.d * d);
	// }

	// addR(n: bigint): Root {
	// 	return new Root(this.n + n * this.d, this.d);
	// }

	// sub({ n, d }: Root): Root {
	// 	return new Root(this.n * d - n * this.d, this.d * d);
	// }

	// subR(n: bigint): Root {
	// 	return new Root(this.n - n * this.d, this.d);
	// }

	mul({ base: n, exponent: r }: Root): Root {
		const { n: mr, d: mthisr } = new Fraction(this.exponent, r).normalize;
		return new Root(this.base ** mthisr * n ** mr, r * mr);
	}

	mulR(n: bigint): Root {
		return new Root(this.base * (n ** this.exponent), this.exponent);
	}

	get supValue(): bigint {
		let l = 0n;
		let r = this.base + 1n;

		while (r - l > 1n) {
			const m = (l + r) / 2n;

			if (m ** this.exponent <= this.base) {
				l = m;
			} else {
				r = m;
			}
		}

		return l;
	}

	// div({ n, d }: Root): Root {
	// 	return new Root(this.n * d, this.d * n);
	// }

	// divR(n: bigint): Root {
	// 	return new Root(this.n, this.d * n);
	// }

	// get inverse(): Root {
	// 	return new Root(this.d, this.n);
	// }

	// get normalize(): Root {
	// 	const { gcd } = this;
	// 	return new Root(this.n / gcd, this.d / gcd);
	// }
}
