import {
	AbstractMathTypes, Fraction, MathTypes, Multiplication, Root,
} from '.';

// eslint-disable-next-line import/prefer-default-export
export class Addition extends AbstractMathTypes {
	public fraction: Fraction;

	private roots: Root[];

	private multiplications: Multiplication[];

	get allArgs(): MathTypes[] {
		return [this.fraction, ...this.roots, ...this.multiplications];
	}

	constructor(
		args: MathTypes[],
		{
			fraction = new Fraction(0n),
			roots = [],
			multiplications = [],
		}: {
			fraction?: Fraction,
			roots?: Root[],
			multiplications?: Multiplication[],
		} = {},
	) {
		super();
		this.fraction = fraction;
		this.roots = roots;
		this.multiplications = multiplications;

		args.forEach((value) => {
			if (value instanceof Fraction) {
				this.fraction = this.fraction.add(value);
			} else if (value instanceof Root) {
				this.roots.push(value);
			} else if (value instanceof Addition) {
				this.fraction.add(value.fraction);
				this.roots.push(...value.roots);
			} else if (value instanceof Multiplication) {
				this.multiplications.push(value);
			} else {
				this.fraction = this.fraction.addR(value);
			}
		});

		this.fraction = this.fraction.normalize;
		this.roots.sort(Root.compare);
	}

	equal({ fraction, roots, multiplications }: Addition): boolean {
		return this.roots.length === roots.length
			&& this.multiplications.length === multiplications.length
			&& this.fraction.equal(fraction)
			&& roots.every((_, i) => this.roots[i].equal(roots[i]))
			&& multiplications.every((_, i) => this.multiplications[i].equal(multiplications[i]));
	}

	valueOf(): number {
		return this.roots.reduce(
			(sum, r) => sum + r.valueOf(), this.fraction.valueOf(),
		) + this.multiplications.reduce(
			(sum, m) => sum + m.valueOf(), 0,
		);
	}

	toString(): string {
		return `${this.fraction.toString()}${
			this.roots.length === 0
				? ''
				: `+${this.roots.join('+')}`
		}${
			this.multiplications.length === 0
				? ''
				: `+${this.multiplications.join('+').replace(/\+-/, '-')}`
		}`;
	}

	add(args: MathTypes[], {}: {fraction: Fraction}): Addition {
		return new Addition(...this.allArgs, ...args);
	}

	addR(n: bigint): Addition {
		return new Addition(this.fraction.addR(n), ...this.roots, ...this.multiplications);
	}

	sub(...args: MathTypes[]): Addition {
		return new Addition(...this.allArgs, new Multiplication(-1n, ...args));
	}

	subR(n: bigint): Addition {
		return new Addition(this.fraction.subR(n), ...this.roots, ...this.multiplications);
	}

	mul(...args: MathTypes[]): Multiplication {
		return new Multiplication(...this.allArgs, ...args);
	}

	mulR(n: bigint): Multiplication {
		return new Multiplication(n, ...this.allArgs);
	}

	div(...args: MathTypes[]): Multiplication {
		return new Fraction(this.allArgs, args);
	}

	divR(n: bigint): Multiplication {
		return new Multiplication(this.fraction.subR(n), ...this.roots, ...this.multiplications);
	}
}
