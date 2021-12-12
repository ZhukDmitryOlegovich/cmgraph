export function mallocDoubleArray(nativeClipperLib, len) {
    const nofBytes = len * Float64Array.BYTES_PER_ELEMENT;
    const ptr = nativeClipperLib._malloc(nofBytes);
    return new Float64Array(nativeClipperLib.HEAPF64.buffer, ptr, len);
}
export function freeTypedArray(nativeClipperLib, array) {
    nativeClipperLib._free(array.byteOffset);
}
