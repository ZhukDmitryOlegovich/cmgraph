import { PolyFillType } from "./enums.js";
import { polyFillTypeToNative } from "./native/nativeEnumConversion.js";
import { nativePathsToPaths, pathsToNativePaths } from "./native/PathsToNativePaths.js";
import { nativePathToPath, pathToNativePath } from "./native/PathToNativePath.js";
function tryDelete(...objs) {
    for (const obj of objs) {
        if (!obj.isDeleted()) {
            obj.delete();
        }
    }
}
export function area(path) {
    // we use JS since copying structures is slower than actually doing it
    const cnt = path.length;
    if (cnt < 3) {
        return 0;
    }
    let a = 0;
    for (let i = 0, j = cnt - 1; i < cnt; ++i) {
        a += (path[j].x + path[i].x) * (path[j].y - path[i].y);
        j = i;
    }
    return -a * 0.5;
}
export function cleanPolygon(nativeLib, path, distance = 1.1415) {
    const nativePath = pathToNativePath(nativeLib, path);
    try {
        nativeLib.cleanPolygon(nativePath, distance);
        return nativePathToPath(nativeLib, nativePath, true); // frees nativePath
    }
    finally {
        tryDelete(nativePath);
    }
}
export function cleanPolygons(nativeLib, paths, distance = 1.1415) {
    const nativePaths = pathsToNativePaths(nativeLib, paths);
    try {
        nativeLib.cleanPolygons(nativePaths, distance);
        return nativePathsToPaths(nativeLib, nativePaths, true); // frees nativePath
    }
    finally {
        tryDelete(nativePaths);
    }
}
function addPolyNodeToPaths(polynode, nt, paths) {
    let match = true;
    switch (nt) {
        case 1 /* Open */:
            return;
        case 2 /* Closed */:
            match = !polynode.isOpen;
            break;
        default:
            break;
    }
    if (polynode.contour.length > 0 && match) {
        paths.push(polynode.contour);
    }
    for (let ii = 0, max = polynode.childs.length; ii < max; ii++) {
        const pn = polynode.childs[ii];
        addPolyNodeToPaths(pn, nt, paths);
    }
}
export function closedPathsFromPolyTree(polyTree) {
    // we do this in JS since copying path is more expensive than just doing it
    const result = [];
    // result.Capacity = polytree.Total;
    addPolyNodeToPaths(polyTree, 2 /* Closed */, result);
    return result;
}
export function minkowskiDiff(nativeLib, poly1, poly2) {
    const nativePath1 = pathToNativePath(nativeLib, poly1);
    const nativePath2 = pathToNativePath(nativeLib, poly2);
    const outNativePaths = new nativeLib.Paths();
    try {
        nativeLib.minkowskiDiff(nativePath1, nativePath2, outNativePaths);
        tryDelete(nativePath1, nativePath2);
        return nativePathsToPaths(nativeLib, outNativePaths, true); // frees outNativePaths
    }
    finally {
        tryDelete(nativePath1, nativePath2, outNativePaths);
    }
}
export function minkowskiSumPath(nativeLib, pattern, path, pathIsClosed) {
    const patternNativePath = pathToNativePath(nativeLib, pattern);
    const nativePath = pathToNativePath(nativeLib, path);
    const outNativePaths = new nativeLib.Paths();
    try {
        nativeLib.minkowskiSumPath(patternNativePath, nativePath, outNativePaths, pathIsClosed);
        tryDelete(patternNativePath, nativePath);
        return nativePathsToPaths(nativeLib, outNativePaths, true); // frees outNativePaths
    }
    finally {
        tryDelete(patternNativePath, nativePath, outNativePaths);
    }
}
export function minkowskiSumPaths(nativeLib, pattern, paths, pathIsClosed) {
    // TODO: im not sure if for this method we can reuse the input/output path
    const patternNativePath = pathToNativePath(nativeLib, pattern);
    const nativePaths = pathsToNativePaths(nativeLib, paths);
    try {
        nativeLib.minkowskiSumPaths(patternNativePath, nativePaths, nativePaths, pathIsClosed);
        tryDelete(patternNativePath);
        return nativePathsToPaths(nativeLib, nativePaths, true); // frees nativePaths
    }
    finally {
        tryDelete(patternNativePath, nativePaths);
    }
}
export function openPathsFromPolyTree(polyTree) {
    // we do this in JS since copying path is more expensive than just doing it
    const result = [];
    const len = polyTree.childs.length;
    result.length = len;
    let resultLength = 0;
    for (let i = 0; i < len; i++) {
        if (polyTree.childs[i].isOpen) {
            result[resultLength++] = polyTree.childs[i].contour;
        }
    }
    result.length = resultLength;
    return result;
}
export function orientation(path) {
    return area(path) >= 0;
}
export function pointInPolygon(point, path) {
    // we do this in JS since copying path is more expensive than just doing it
    // returns 0 if false, +1 if true, -1 if pt ON polygon boundary
    // See "The Point in Polygon Problem for Arbitrary Polygons" by Hormann & Agathos
    // http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.88.5498&rep=rep1&type=pdf
    let result = 0;
    const cnt = path.length;
    if (cnt < 3) {
        return 0;
    }
    let ip = path[0];
    for (let i = 1; i <= cnt; ++i) {
        const ipNext = i === cnt ? path[0] : path[i];
        if (ipNext.y === point.y) {
            if (ipNext.x === point.x || (ip.y === point.y && ipNext.x > point.x === ip.x < point.x)) {
                return -1;
            }
        }
        if (ip.y < point.y !== ipNext.y < point.y) {
            if (ip.x >= point.x) {
                if (ipNext.x > point.x) {
                    result = 1 - result;
                }
                else {
                    const d = (ip.x - point.x) * (ipNext.y - point.y) - (ipNext.x - point.x) * (ip.y - point.y);
                    if (d === 0) {
                        return -1;
                    }
                    else if (d > 0 === ipNext.y > ip.y) {
                        result = 1 - result;
                    }
                }
            }
            else {
                if (ipNext.x > point.x) {
                    const d = (ip.x - point.x) * (ipNext.y - point.y) - (ipNext.x - point.x) * (ip.y - point.y);
                    if (d === 0) {
                        return -1;
                    }
                    else if (d > 0 === ipNext.y > ip.y) {
                        result = 1 - result;
                    }
                }
            }
        }
        ip = ipNext;
    }
    return result;
}
export function polyTreeToPaths(polyTree) {
    // we do this in JS since copying path is more expensive than just doing it
    const result = [];
    // result.Capacity = polytree.total;
    addPolyNodeToPaths(polyTree, 0 /* Any */, result);
    return result;
}
export function reversePath(path) {
    // we use JS since copying structures is slower than actually doing it
    path.reverse();
}
export function reversePaths(paths) {
    // we use JS since copying structures is slower than actually doing it
    for (let i = 0, max = paths.length; i < max; i++) {
        reversePath(paths[i]);
    }
}
export function simplifyPolygon(nativeLib, path, fillType = PolyFillType.EvenOdd) {
    const nativePath = pathToNativePath(nativeLib, path);
    const outNativePaths = new nativeLib.Paths();
    try {
        nativeLib.simplifyPolygon(nativePath, outNativePaths, polyFillTypeToNative(nativeLib, fillType));
        tryDelete(nativePath);
        return nativePathsToPaths(nativeLib, outNativePaths, true); // frees outNativePaths
    }
    finally {
        tryDelete(nativePath, outNativePaths);
    }
}
export function simplifyPolygons(nativeLib, paths, fillType = PolyFillType.EvenOdd) {
    const nativePaths = pathsToNativePaths(nativeLib, paths);
    try {
        nativeLib.simplifyPolygonsOverwrite(nativePaths, polyFillTypeToNative(nativeLib, fillType));
        return nativePathsToPaths(nativeLib, nativePaths, true); // frees nativePaths
    }
    finally {
        tryDelete(nativePaths);
    }
}
export function scalePath(path, scale) {
    const sol = [];
    let i = path.length;
    while (i--) {
        const p = path[i];
        sol.push({
            x: Math.round(p.x * scale),
            y: Math.round(p.y * scale)
        });
    }
    return sol;
}
/**
 * Scales all inner paths by multiplying all its coordinates by a number and then rounding them.
 *
 * @param paths - Paths to scale
 * @param scale - Scale multiplier
 * @return {Paths} - The scaled paths
 */
export function scalePaths(paths, scale) {
    if (scale === 0) {
        return [];
    }
    const sol = [];
    let i = paths.length;
    while (i--) {
        const p = paths[i];
        sol.push(scalePath(p, scale));
    }
    return sol;
}
