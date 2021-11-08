import PIXI from 'pixi.js';

export const createFillStyle = (
	opt: PIXI.IFillStyleOptions & { visible?: boolean } = {},
): PIXI.FillStyle => {
	const ans = new PIXI.FillStyle();
	ans.visible = true;

	// @ts-ignore
	Object.entries(opt).forEach(([type, val]) => { if (val) ans[type] = val; });

	return ans;
};

export const createLineStyle = (
	opt: PIXI.ILineStyleOptions & { visible?: boolean } = {},
): PIXI.LineStyle => {
	const ans = new PIXI.LineStyle();
	ans.visible = true;

	// @ts-ignore
	Object.entries(opt).forEach(([type, val]) => { if (val) ans[type] = val; });

	return ans;
};
