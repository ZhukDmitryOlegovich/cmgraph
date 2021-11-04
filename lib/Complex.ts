// eslint-disable-next-line import/prefer-default-export
export class Complex {
	// eslint-disable-next-line no-useless-constructor, no-empty-function
	constructor(public r: number, public i = 0) {}

	// todo: надо срочно переезжать на дроби
	static readonly MAX_PRECISION = 1e-10;

	equal(c: Complex): boolean {
		return this.sub(c).sqrlength < Complex.MAX_PRECISION ** 2;
	}

	get equalZero(): boolean {
		return this.sqrlength < Complex.MAX_PRECISION ** 2;
	}

	add({ r, i }: Complex): Complex {
		return new Complex(this.r + r, this.i + i);
	}

	sub({ r, i }: Complex): Complex {
		return new Complex(this.r - r, this.i - i);
	}

	mul({ r, i }: Complex): Complex {
		return new Complex(this.r * r - this.i * i, this.r * i + r * this.i);
	}

	mulR(r: number): Complex {
		return new Complex(this.r * r, this.i * r);
	}

	/**
	 * Сопряженное (a + b*i) => (a - b*i)
	 */
	get conjugate(): Complex {
		return new Complex(this.r, -this.i);
	}

	get sqrlength(): number {
		return this.i ** 2 + this.r ** 2;
	}

	get length(): number {
		return Math.sqrt(this.sqrlength);
	}

	div({ r, i, sqrlength }: Complex): Complex {
		return new Complex(
			(this.r * r + this.i * i) / sqrlength,
			(this.i * r - this.r * i) / sqrlength,
		);
	}

	divR(r: number): Complex {
		return new Complex(this.r / r, this.i / r);
	}

	get inverse(): Complex {
		const { sqrlength } = this;
		return new Complex(this.r / sqrlength, -this.i / sqrlength);
	}

	exp(): Complex {
		const er = Math.exp(this.r);
		return new Complex(er * Math.cos(this.i), er * Math.sin(this.i));
	}

	scalar({ r, i }: Complex): number {
		return this.r * r + this.i * i;
	}

	projection({ normalize }: Complex): Complex {
		return this.mulR(this.scalar(normalize));
	}

	get normalize(): Complex {
		return this.divR(this.length);
	}
}
