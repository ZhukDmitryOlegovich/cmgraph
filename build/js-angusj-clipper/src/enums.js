/**
 * By far the most widely used winding rules for polygon filling are EvenOdd & NonZero (GDI, GDI+, XLib, OpenGL, Cairo, AGG, Quartz, SVG, Gr32)
 * Others rules include Positive, Negative and ABS_GTR_EQ_TWO (only in OpenGL)
 * see http://glprogramming.com/red/chapter11.html
 */
export var PolyFillType;
(function (PolyFillType) {
    PolyFillType["EvenOdd"] = "evenOdd";
    PolyFillType["NonZero"] = "nonZero";
    PolyFillType["Positive"] = "positive";
    PolyFillType["Negative"] = "negative";
})(PolyFillType || (PolyFillType = {}));
export var ClipType;
(function (ClipType) {
    ClipType["Intersection"] = "intersection";
    ClipType["Union"] = "union";
    ClipType["Difference"] = "difference";
    ClipType["Xor"] = "xor";
})(ClipType || (ClipType = {}));
export var PolyType;
(function (PolyType) {
    PolyType["Subject"] = "subject";
    PolyType["Clip"] = "clip";
})(PolyType || (PolyType = {}));
export var JoinType;
(function (JoinType) {
    JoinType["Square"] = "square";
    JoinType["Round"] = "round";
    JoinType["Miter"] = "miter";
})(JoinType || (JoinType = {}));
export var EndType;
(function (EndType) {
    EndType["ClosedPolygon"] = "closedPolygon";
    EndType["ClosedLine"] = "closedLine";
    EndType["OpenButt"] = "openButt";
    EndType["OpenSquare"] = "openSquare";
    EndType["OpenRound"] = "openRound";
})(EndType || (EndType = {}));
export var PointInPolygonResult;
(function (PointInPolygonResult) {
    PointInPolygonResult[PointInPolygonResult["Outside"] = 0] = "Outside";
    PointInPolygonResult[PointInPolygonResult["Inside"] = 1] = "Inside";
    PointInPolygonResult[PointInPolygonResult["OnBoundary"] = -1] = "OnBoundary";
})(PointInPolygonResult || (PointInPolygonResult = {}));
/**
 * Format to use when loading the native library instance.
 */
export var NativeClipperLibRequestedFormat;
(function (NativeClipperLibRequestedFormat) {
    /**
     * Try to load the WebAssembly version, if it fails try to load the Asm.js version.
     */
    NativeClipperLibRequestedFormat["WasmWithAsmJsFallback"] = "wasmWithAsmJsFallback";
    /**
     * Load the WebAssembly version exclusively.
     */
    NativeClipperLibRequestedFormat["WasmOnly"] = "wasmOnly";
    /**
     * Load the Asm.js version exclusively.
     */
    NativeClipperLibRequestedFormat["AsmJsOnly"] = "asmJsOnly";
})(NativeClipperLibRequestedFormat || (NativeClipperLibRequestedFormat = {}));
/**
 * The format the native library being used is in.
 */
export var NativeClipperLibLoadedFormat;
(function (NativeClipperLibLoadedFormat) {
    /**
     * WebAssembly.
     */
    NativeClipperLibLoadedFormat["Wasm"] = "wasm";
    /**
     * Asm.js.
     */
    NativeClipperLibLoadedFormat["AsmJs"] = "asmJs";
})(NativeClipperLibLoadedFormat || (NativeClipperLibLoadedFormat = {}));
