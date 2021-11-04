import nerdamer, { Expression } from 'nerdamer';

export type allExpressionParam = ExpressionPP | string | number;

export type ExpressionPP = {
	evaluate(symbols: Record<string, allExpressionParam>): ExpressionPP;
	expand(): ExpressionPP;
} & Expression;

export type NerdamerPP = ((
		expression: allExpressionParam,
		subs?: { [name: string]: string },
		option?: keyof nerdamer.Options | (keyof nerdamer.Options)[],
		location?: nerdamer.int) => ExpressionPP)
	& typeof nerdamer
	& {
		realpart(symbol: allExpressionParam): ExpressionPP;
		imagpart(symbol: allExpressionParam): ExpressionPP;
		sqrt(symbol: allExpressionParam): ExpressionPP;
		abs(symbol: allExpressionParam): ExpressionPP;
		max(...symbols: allExpressionParam[]): ExpressionPP;
	};

export const nerdamerpp = (nerdamer as NerdamerPP);

export class Complex {
	public static inverse(e: allExpressionParam) {
		const realpart = nerdamerpp.realpart(e);
		const imagpart = nerdamerpp.imagpart(e);

		return nerdamerpp(`${realpart}-i*${imagpart}`).divide(realpart.pow(2).add(imagpart.pow(2)));
	}

	public static sqrlen(e: allExpressionParam) {
		const realpart = nerdamerpp.realpart(e);
		const imagpart = nerdamerpp.imagpart(e);

		return realpart.pow(2).add(imagpart.pow(2));
	}

	public static len(e: allExpressionParam) {
		return Complex.sqrlen(e).pow(1 / 2);
	}

	public static normalize(e: ExpressionPP) {
		return e.divide(Complex.len(e));
	}

	public static dotProduct(e: allExpressionParam, other: allExpressionParam) {
		const realparte = nerdamerpp.realpart(e);
		const imagparte = nerdamerpp.imagpart(e);
		const realparto = nerdamerpp.realpart(other);
		const imagparto = nerdamerpp.imagpart(other);

		return realparte.multiply(realparto).add(imagparte.multiply(imagparto));
	}

	public static projection(e: allExpressionParam, other: allExpressionParam) {
		return Complex.dotProduct(e, other).divide(Complex.len(other));
	}
}

export class Root {
	public static inverse(e: allExpressionParam) {
		return nerdamerpp(e).pow(1 / 2).divide(e);
	}
}
