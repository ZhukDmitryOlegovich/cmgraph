import { ClipperError } from "./ClipperError.js";
import { ClipperOffset } from "./ClipperOffset.js";
const addPathOrPaths = (offset, inputDatas) => {
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
        // is it a path or paths?
        if (Array.isArray(pathOrPaths[0])) {
            // paths
            offset.addPaths(pathOrPaths, inputData.joinType, inputData.endType);
        }
        else {
            // path
            offset.addPath(pathOrPaths, inputData.joinType, inputData.endType);
        }
    }
};
function offsetToPathsOrPolyTree(polyTreeMode, nativeClipperLib, params) {
    const filledData = {
        arcTolerance: 0.25,
        miterLimit: 2,
        ...params
    };
    const offset = new ClipperOffset(nativeClipperLib, filledData.miterLimit, filledData.arcTolerance);
    //noinspection UnusedCatchParameterJS
    try {
        addPathOrPaths(offset, params.offsetInputs);
        if (!polyTreeMode) {
            return offset.executeToPaths(params.delta, params.cleanDistance);
        }
        else {
            if (params.cleanDistance !== undefined) {
                throw new ClipperError("cleaning is not available for poly tree results");
            }
            return offset.executeToPolyTree(params.delta);
        }
    }
    catch (err) {
        return undefined;
    }
    finally {
        offset.dispose();
    }
}
export function offsetToPaths(nativeClipperLib, params) {
    return offsetToPathsOrPolyTree(false, nativeClipperLib, params);
}
export function offsetToPolyTree(nativeClipperLib, params) {
    return offsetToPathsOrPolyTree(true, nativeClipperLib, params);
}
