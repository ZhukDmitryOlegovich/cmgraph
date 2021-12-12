import { Clipper } from "./Clipper.js";
import { ClipperError } from "./ClipperError.js";
import { PolyType } from "./enums.js";
const devMode = typeof process !== "undefined" && process.env && process.env.NODE_ENV !== "production";
const addPathOrPaths = (clipper, inputDatas, polyType) => {
    if (inputDatas === undefined) {
        return;
    }
    // add each input
    for (let i = 0, maxi = inputDatas.length; i < maxi; i++) {
        const inputData = inputDatas[i];
        // add the path/paths
        const pathOrPaths = inputData.data;
        if (!pathOrPaths || pathOrPaths.length <= 0) {
            continue;
        }
        const closed = inputData.closed === undefined ? true : inputData.closed;
        // is it a path or paths?
        if (Array.isArray(pathOrPaths[0])) {
            // paths
            if (!clipper.addPaths(pathOrPaths, polyType, closed)) {
                throw new ClipperError("invalid paths");
            }
        }
        else {
            // path
            if (!clipper.addPath(pathOrPaths, polyType, closed)) {
                throw new ClipperError("invalid path");
            }
        }
    }
};
export function clipToPathsOrPolyTree(polyTreeMode, nativeClipperLib, params) {
    if (devMode) {
        if (!polyTreeMode && params.subjectInputs && params.subjectInputs.some((si) => !si.closed)) {
            throw new Error("clip to a PolyTree (not to a Path) when using open paths");
        }
    }
    const clipper = new Clipper(nativeClipperLib, params);
    //noinspection UnusedCatchParameterJS
    try {
        addPathOrPaths(clipper, params.subjectInputs, PolyType.Subject);
        addPathOrPaths(clipper, params.clipInputs, PolyType.Clip);
        let result;
        const clipFillType = params.clipFillType === undefined ? params.subjectFillType : params.clipFillType;
        if (!polyTreeMode) {
            result = clipper.executeToPaths(params.clipType, params.subjectFillType, clipFillType, params.cleanDistance);
        }
        else {
            if (params.cleanDistance !== undefined) {
                throw new ClipperError("cleaning is not available for poly tree results");
            }
            result = clipper.executeToPolyTee(params.clipType, params.subjectFillType, clipFillType);
        }
        if (result === undefined) {
            throw new ClipperError("error while performing clipping task");
        }
        return result;
    }
    finally {
        clipper.dispose();
    }
}
export function clipToPaths(nativeClipperLib, params) {
    return clipToPathsOrPolyTree(false, nativeClipperLib, params);
}
export function clipToPolyTree(nativeClipperLib, params) {
    return clipToPathsOrPolyTree(true, nativeClipperLib, params);
}
