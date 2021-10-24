// numerator - числитель
// denominator - знаменатель

// eslint-disable-next-line import/prefer-default-export
export class Fraction {
	constructor(public n: bigint, public d = 1n) {
		if (d === 0n) throw new Error('Fraction: denominator cannot be zero');

		if (d < 0n) {
			this.n *= -1n;
			this.d *= -1n;
		}
	}

	equal({ n, d }: Fraction): boolean {
		return this.d * n === this.n * d;
	}

	valueOf(): number {
		let { n } = this;
		const { d } = this;
		let s = n < 0n ? '-' : '';
		n = n < 0n ? -n : n;
		s += `${(n / d).toString()}.`;
		n = (n % d) * 10n;

		while (s.length < 31 && n !== 0n) {
			s += (n / d).toString();
			n = (n % d) * 10n;
		}

		return Number(s);
	}

	toString(): string {
		return this.d === 1n ? `${this.n}` : `${this.n}/${this.d}`;
	}

	get equalZero(): boolean {
		return this.n === 0n;
	}

	add({ n, d }: Fraction): Fraction {
		return new Fraction(this.n * d + n * this.d, this.d * d);
	}

	addR(n: bigint): Fraction {
		return new Fraction(this.n + n * this.d, this.d);
	}

	sub({ n, d }: Fraction): Fraction {
		return new Fraction(this.n * d - n * this.d, this.d * d);
	}

	subR(n: bigint): Fraction {
		return new Fraction(this.n - n * this.d, this.d);
	}

	mul({ n, d }: Fraction): Fraction {
		return new Fraction(this.n * n, this.d * d);
	}

	mulR(n: bigint): Fraction {
		return new Fraction(this.n * n, this.d);
	}

	div({ n, d }: Fraction): Fraction {
		return new Fraction(this.n * d, this.d * n);
	}

	divR(n: bigint): Fraction {
		return new Fraction(this.n, this.d * n);
	}

	get inverse(): Fraction {
		return new Fraction(this.d, this.n);
	}

	get gcd(): bigint {
		let { n, d } = this;
		while (d) [n, d] = [d, n % d];
		return n;
	}

	get normalize(): Fraction {
		const { gcd } = this;
		return new Fraction(this.n / gcd, this.d / gcd);
	}
}
