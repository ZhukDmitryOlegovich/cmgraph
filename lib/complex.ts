// eslint-disable-next-line import/prefer-default-export
export class Complex {
	// eslint-disable-next-line no-useless-constructor, no-empty-function
	constructor(public r: number, public i = 0) {}

	equals(c: Complex): boolean {
		return this.sub(c).sqrlength < 1e-28;
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

	get conjugate(): Complex {
		return new Complex(this.r, -this.i);
	}

	get sqrlength(): number {
		return this.i * this.i + this.r * this.r;
	}

	get length(): number {
		return Math.sqrt(this.sqrlength);
	}

	div({ conjugate, sqrlength }: Complex): Complex {
		const res = this.mul(conjugate);
		res.i /= sqrlength; res.r /= sqrlength;
		return res;
	}

	get inverse(): Complex {
		return Complex.ONE.div(this);
	}

	exp(): Complex {
		const er = Math.exp(this.r);
		return new Complex(er * Math.cos(this.i), er * Math.sin(this.i));
	}

	get normalize(): Complex {
		return this.div(new Complex(this.length));
	}

	static get ONE(): Complex {
		return new Complex(1);
	}

	static get I(): Complex {
		return new Complex(0, 1);
	}

	static get MONE(): Complex {
		return new Complex(-1);
	}

	static get MI(): Complex {
		return new Complex(0, -1);
	}
}
