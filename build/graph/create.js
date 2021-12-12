/* import PIXI from 'pixi.js'; */
export const createFillStyle = (opt = {}) => {
    const ans = new PIXI.FillStyle();
    ans.visible = true;
    // @ts-ignore
    Object.entries(opt).forEach(([type, val]) => { if (val)
        ans[type] = val; });
    return ans;
};
export const createLineStyle = (opt = {}) => {
    const ans = new PIXI.LineStyle();
    ans.visible = true;
    // @ts-ignore
    Object.entries(opt).forEach(([type, val]) => { if (val)
        ans[type] = val; });
    return ans;
};
