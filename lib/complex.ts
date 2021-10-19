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
}
