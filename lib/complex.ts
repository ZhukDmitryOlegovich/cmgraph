// eslint-disable-next-line import/prefer-default-export
export class Complex {
	// eslint-disable-next-line no-useless-constructor, no-empty-function
	constructor(public r: number, public i = 0) {}

	equals({ r, i }: Complex): boolean {
		return this.r === r && this.i === i;
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

	div({ r, i }: Complex): Complex {
		const sqr = r * r + i * i;
		return new Complex((this.r * r + this.i * i) / sqr, (this.i * r - this.r * i) / sqr);
	}

	exp(): Complex {
		const er = Math.exp(this.r);
		return new Complex(er * Math.cos(this.i), er * Math.sin(this.i));
	}

	get length(): number {
		return this.i * this.i + this.r * this.r;
	}

	get normalize(): Complex {
		return this.div(new Complex(this.length));
	}
}
