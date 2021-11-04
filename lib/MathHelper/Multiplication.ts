import {
	AbstractMathTypes, Addition, Fraction, MathTypes, Root,
} from '.';

// eslint-disable-next-line import/prefer-default-export
export class Multiplication extends AbstractMathTypes {
	public fraction: Fraction = new Fraction(1n);

	public root: Root = new Root(1n);

	public additions: Addition[] = [];

	constructor(args: MathTypes[]) {
		super();
		args.forEach((value) => {
			if (value instanceof Fraction) {
				this.fraction = this.fraction.add(value);
			} else if (value instanceof Root) {
				this.roots.push(value);
			} else {
				this.fraction.add(value.fraction);
				this.roots.push(...value.roots);
			}
		});
		this.roots.sort(Root.compare);
	}

	equal({ fraction, roots }: Multiplication): boolean {
		return this.fraction.equal(fraction)
			&& this.roots.length === roots.length
			&& roots.every((_, i) => this.roots[i].equal(roots[i]));
	}

	valueOf(): number {
		return this.roots.reduce(
			(sum, r) => sum + r.valueOf(), this.fraction.valueOf(),
		);
	}

	toString(): string {
		return `${this.fraction.toString()}+${this.roots.join('+')}`;
	}

	add(...args: (Fraction | Root | Multiplication)[]): Multiplication {
		return new Multiplication(this.fraction, ...this.roots, ...args);
	}

	addR(n: bigint): Multiplication {
		return new Multiplication(this.fraction.addR(n), ...this.roots);
	}

	// sub({ n, d }: Sum): Sum {
	// 	return new Sum(this.n * d - n * this.d, this.d * d);
	// }

	// subR(n: bigint): Sum {
	// 	return new Sum(this.n - n * this.d, this.d);
	// }

	// mul({ n, d }: Sum): Sum {
	// 	return new Sum(this.n * n, this.d * d);
	// }

	// mulR(n: bigint): Sum {
	// 	return new Sum(this.n * n, this.d);
	// }

	// div({ n, d }: Sum): Sum {
	// 	return new Sum(this.n * d, this.d * n);
	// }

	// divR(n: bigint): Sum {
	// 	return new Sum(this.n, this.d * n);
	// }

	// powR(p: bigint): Sum {
	// 	return new Sum(this.n ** p, this.d ** p);
	// }

	// get inverse(): Sum {
	// 	return new Sum(this.d, this.n);
	// }

	// get gcd(): bigint {
	// 	let { n, d } = this;
	// 	while (d) [n, d] = [d, n % d];
	// 	return n;
	// }

	get normalize(): Multiplication {
		return new Multiplication(this.fraction.normalize, ...this.roots);
	}
}
