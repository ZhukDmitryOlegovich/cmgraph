import { freeTypedArray, mallocDoubleArray } from "./mem.js";
const coordsPerPoint = 2;
export function getNofItemsForPath(path) {
    return 1 + path.length * coordsPerPoint;
}
// js to c++
export function writePathToDoubleArray(path, heapBytes, startPtr) {
    const len = path.length;
    heapBytes[startPtr] = len;
    let arrayI = 1 + startPtr;
    for (let i = 0; i < len; i++) {
        heapBytes[arrayI++] = path[i].x;
        heapBytes[arrayI++] = path[i].y;
    }
    return arrayI;
}
export function pathToDoubleArray(nativeClipperLib, path) {
    const nofItems = getNofItemsForPath(path);
    const heapBytes = mallocDoubleArray(nativeClipperLib, nofItems);
    writePathToDoubleArray(path, heapBytes, 0);
    return heapBytes;
}
export function doubleArrayToNativePath(nativeClipperLib, array, freeArray) {
    const p = new nativeClipperLib.Path();
    nativeClipperLib.toPath(p, array.byteOffset);
    if (freeArray) {
        freeTypedArray(nativeClipperLib, array);
    }
    return p;
}
export function pathToNativePath(nativeClipperLib, path) {
    const array = pathToDoubleArray(nativeClipperLib, path);
    return doubleArrayToNativePath(nativeClipperLib, array, true);
}
// c++ to js
export function nativePathToDoubleArray(nativeClipperLib, nativePath, freeNativePath) {
    const array = nativeClipperLib.fromPath(nativePath);
    if (freeNativePath) {
        nativePath.delete();
    }
    return array;
}
export function doubleArrayToPath(nativeClipperLib, array, _freeDoubleArray, startPtr) {
    const len = array[startPtr];
    const path = [];
    path.length = len;
    let arrayI = 1 + startPtr;
    for (let i = 0; i < len; i++) {
        path[i] = {
            x: array[arrayI++],
            y: array[arrayI++]
        };
    }
    if (_freeDoubleArray) {
        freeTypedArray(nativeClipperLib, array);
    }
    return {
        path: path,
        ptrEnd: arrayI
    };
}
export function nativePathToPath(nativeClipperLib, nativePath, freeNativePath) {
    const array = nativePathToDoubleArray(nativeClipperLib, nativePath, freeNativePath);
    return doubleArrayToPath(nativeClipperLib, array, true, 0).path;
}
