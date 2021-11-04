import { Addition } from './Addition';
import { Fraction } from './Fraction';
import { Multiplication } from './Multiplication';
import { Root } from './Root';

export type MathTypes = Fraction | Root | Addition | Multiplication | bigint;

export abstract class AbstractMathTypes {
	abstract equal(arg0: MathTypes): boolean;

	abstract valueOf(): number;

	abstract toString(): string;

	abstract add(arg0: MathTypes): AbstractMathTypes;

	abstract addR(n: bigint): AbstractMathTypes;

	abstract sub(arg0: MathTypes): AbstractMathTypes;

	abstract subR(n: bigint): AbstractMathTypes;

	abstract mul(arg0: MathTypes): AbstractMathTypes;

	abstract mulR(n: bigint): AbstractMathTypes;

	abstract div(arg0: MathTypes): AbstractMathTypes;

	abstract divR(n: bigint): AbstractMathTypes;
}
