import { freeTypedArray, mallocDoubleArray } from "./mem.js";
import { doubleArrayToPath, getNofItemsForPath, writePathToDoubleArray } from "./PathToNativePath.js";
// js to c++
export function pathsToDoubleArray(nativeClipperLib, myPaths) {
    const nofPaths = myPaths.length;
    // first calculate nof items required
    let nofItems = 1; // for path count
    for (let i = 0; i < nofPaths; i++) {
        nofItems += getNofItemsForPath(myPaths[i]);
    }
    const heapBytes = mallocDoubleArray(nativeClipperLib, nofItems);
    heapBytes[0] = nofPaths;
    let ptr = 1;
    for (let i = 0; i < nofPaths; i++) {
        const path = myPaths[i];
        ptr = writePathToDoubleArray(path, heapBytes, ptr);
    }
    return heapBytes;
}
export function doubleArrayToNativePaths(nativeClipperLib, array, freeArray) {
    const p = new nativeClipperLib.Paths();
    nativeClipperLib.toPaths(p, array.byteOffset);
    if (freeArray) {
        freeTypedArray(nativeClipperLib, array);
    }
    return p;
}
export function pathsToNativePaths(nativeClipperLib, paths) {
    const array = pathsToDoubleArray(nativeClipperLib, paths);
    return doubleArrayToNativePaths(nativeClipperLib, array, true);
}
// c++ to js
export function nativePathsToDoubleArray(nativeClipperLib, nativePaths, freeNativePaths) {
    const array = nativeClipperLib.fromPaths(nativePaths);
    if (freeNativePaths) {
        nativePaths.delete();
    }
    return array;
}
export function doubleArrayToPaths(nativeClipperLib, array, _freeDoubleArray) {
    const len = array[0];
    const paths = [];
    paths.length = len;
    let arrayI = 1;
    for (let i = 0; i < len; i++) {
        const result = doubleArrayToPath(nativeClipperLib, array, false, arrayI);
        paths[i] = result.path;
        arrayI = result.ptrEnd;
    }
    if (_freeDoubleArray) {
        freeTypedArray(nativeClipperLib, array);
    }
    return paths;
}
export function nativePathsToPaths(nativeClipperLib, nativePaths, freeNativePaths) {
    const array = nativePathsToDoubleArray(nativeClipperLib, nativePaths, freeNativePaths);
    return doubleArrayToPaths(nativeClipperLib, array, true);
}
