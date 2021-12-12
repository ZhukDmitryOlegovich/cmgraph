import { clipToPaths, clipToPolyTree, } from './clipFunctions.js';
import { ClipperError } from './ClipperError.js';
import { hiRange } from './constants.js';
import { ClipType, EndType, JoinType, NativeClipperLibLoadedFormat, NativeClipperLibRequestedFormat, PointInPolygonResult, PolyFillType, } from './enums.js';
import * as functions from './functions.js';
import { offsetToPaths, offsetToPolyTree, } from './offsetFunctions.js';
import { PolyNode } from './PolyNode.js';
import { PolyTree } from './PolyTree.js';
import { init as initModule } from './wasm/clipper-wasm.js';
// export types
export { ClipperError, ClipType, EndType, JoinType, NativeClipperLibLoadedFormat, NativeClipperLibRequestedFormat, PointInPolygonResult, PolyFillType, PolyNode, PolyTree, };
let wasmModule;
let asmJsModule;
/**
 * A wrapper for the Native Clipper Library instance with all the operations available.
 */
export class ClipperLibWrapper {
    /**
     * Internal constructor. Use loadNativeClipperLibInstanceAsync instead.
     *
     * @param instance
     * @param format
     */
    constructor(instance, format) {
        this.format = format;
        this.instance = instance;
    }
    /**
     * Performs a polygon clipping (boolean) operation, returning the resulting Paths or throwing an error if failed.
     *
     * The solution parameter in this case is a Paths or PolyTree structure. The Paths structure is simpler than the PolyTree structure. Because of this it is
     * quicker to populate and hence clipping performance is a little better (it's roughly 10% faster). However, the PolyTree data structure provides more
     * information about the returned paths which may be important to users. Firstly, the PolyTree structure preserves nested parent-child polygon relationships
     * (ie outer polygons owning/containing holes and holes owning/containing other outer polygons etc). Also, only the PolyTree structure can differentiate
     * between open and closed paths since each PolyNode has an IsOpen property. (The Path structure has no member indicating whether it's open or closed.)
     * For this reason, when open paths are passed to a Clipper object, the user must use a PolyTree object as the solution parameter, otherwise an exception
     * will be raised.
     *
     * When a PolyTree object is used in a clipping operation on open paths, two ancilliary functions have been provided to quickly separate out open and
     * closed paths from the solution - OpenPathsFromPolyTree and ClosedPathsFromPolyTree. PolyTreeToPaths is also available to convert path data to a Paths
     * structure (irrespective of whether they're open or closed).
     *
     * There are several things to note about the solution paths returned:
     * - they aren't in any specific order
     * - they should never overlap or be self-intersecting (but see notes on rounding)
     * - holes will be oriented opposite outer polygons
     * - the solution fill type can be considered either EvenOdd or NonZero since it will comply with either filling rule
     * - polygons may rarely share a common edge (though this is now very rare as of version 6)
     *
     * @param params - clipping operation data
     * @return {Paths} - the resulting Paths.
     */
    clipToPaths(params) {
        return clipToPaths(this.instance, params);
    }
    /**
     * Performs a polygon clipping (boolean) operation, returning the resulting PolyTree or throwing an error if failed.
     *
     * The solution parameter in this case is a Paths or PolyTree structure. The Paths structure is simpler than the PolyTree structure. Because of this it is
     * quicker to populate and hence clipping performance is a little better (it's roughly 10% faster). However, the PolyTree data structure provides more
     * information about the returned paths which may be important to users. Firstly, the PolyTree structure preserves nested parent-child polygon relationships
     * (ie outer polygons owning/containing holes and holes owning/containing other outer polygons etc). Also, only the PolyTree structure can differentiate
     * between open and closed paths since each PolyNode has an IsOpen property. (The Path structure has no member indicating whether it's open or closed.)
     * For this reason, when open paths are passed to a Clipper object, the user must use a PolyTree object as the solution parameter, otherwise an exception
     * will be raised.
     *
     * When a PolyTree object is used in a clipping operation on open paths, two ancilliary functions have been provided to quickly separate out open and
     * closed paths from the solution - OpenPathsFromPolyTree and ClosedPathsFromPolyTree. PolyTreeToPaths is also available to convert path data to a Paths
     * structure (irrespective of whether they're open or closed).
     *
     * There are several things to note about the solution paths returned:
     * - they aren't in any specific order
     * - they should never overlap or be self-intersecting (but see notes on rounding)
     * - holes will be oriented opposite outer polygons
     * - the solution fill type can be considered either EvenOdd or NonZero since it will comply with either filling rule
     * - polygons may rarely share a common edge (though this is now very rare as of version 6)
     *
     * @param params - clipping operation data
     * @return {PolyTree} - the resulting PolyTree or undefined.
     */
    clipToPolyTree(params) {
        return clipToPolyTree(this.instance, params);
    }
    /**
     * Performs a polygon offset operation, returning the resulting Paths or undefined if failed.
     *
     * This method encapsulates the process of offsetting (inflating/deflating) both open and closed paths using a number of different join types
     * and end types.
     *
     * Preconditions for offsetting:
     * 1. The orientations of closed paths must be consistent such that outer polygons share the same orientation, and any holes have the opposite orientation
     * (ie non-zero filling). Open paths must be oriented with closed outer polygons.
     * 2. Polygons must not self-intersect.
     *
     * Limitations:
     * When offsetting, small artefacts may appear where polygons overlap. To avoid these artefacts, offset overlapping polygons separately.
     *
     * @param params - offset operation params
     * @return {Paths|undefined} - the resulting Paths or undefined if failed.
     */
    offsetToPaths(params) {
        return offsetToPaths(this.instance, params);
    }
    /**
     * Performs a polygon offset operation, returning the resulting PolyTree or undefined if failed.
     *
     * This method encapsulates the process of offsetting (inflating/deflating) both open and closed paths using a number of different join types
     * and end types.
     *
     * Preconditions for offsetting:
     * 1. The orientations of closed paths must be consistent such that outer polygons share the same orientation, and any holes have the opposite orientation
     * (ie non-zero filling). Open paths must be oriented with closed outer polygons.
     * 2. Polygons must not self-intersect.
     *
     * Limitations:
     * When offsetting, small artefacts may appear where polygons overlap. To avoid these artefacts, offset overlapping polygons separately.
     *
     * @param params - offset operation params
     * @return {PolyTree|undefined} - the resulting PolyTree or undefined if failed.
     */
    offsetToPolyTree(params) {
        return offsetToPolyTree(this.instance, params);
    }
    // noinspection JSMethodCanBeStatic
    /**
     * This function returns the area of the supplied polygon. It's assumed that the path is closed and does not self-intersect. Depending on orientation,
     * this value may be positive or negative. If Orientation is true, then the area will be positive and conversely, if Orientation is false, then the
     * area will be negative.
     *
     * @param path - The path
     * @return {number} - Area
     */
    area(path) {
        return functions.area(path);
    }
    /**
     * Removes vertices:
     * - that join co-linear edges, or join edges that are almost co-linear (such that if the vertex was moved no more than the specified distance the edges
     * would be co-linear)
     * - that are within the specified distance of an adjacent vertex
     * - that are within the specified distance of a semi-adjacent vertex together with their out-lying vertices
     *
     * Vertices are semi-adjacent when they are separated by a single (out-lying) vertex.
     *
     * The distance parameter's default value is approximately √2 so that a vertex will be removed when adjacent or semi-adjacent vertices having their
     * corresponding X and Y coordinates differing by no more than 1 unit. (If the egdes are semi-adjacent the out-lying vertex will be removed too.)
     *
     * @param path - The path to clean
     * @param distance - How close points need to be before they are cleaned
     * @return {Path} - The cleaned path
     */
    cleanPolygon(path, distance = 1.1415) {
        return functions.cleanPolygon(this.instance, path, distance);
    }
    /**
     * Removes vertices:
     * - that join co-linear edges, or join edges that are almost co-linear (such that if the vertex was moved no more than the specified distance the edges
     * would be co-linear)
     * - that are within the specified distance of an adjacent vertex
     * - that are within the specified distance of a semi-adjacent vertex together with their out-lying vertices
     *
     * Vertices are semi-adjacent when they are separated by a single (out-lying) vertex.
     *
     * The distance parameter's default value is approximately √2 so that a vertex will be removed when adjacent or semi-adjacent vertices having their
     * corresponding X and Y coordinates differing by no more than 1 unit. (If the egdes are semi-adjacent the out-lying vertex will be removed too.)
     *
     * @param paths - The paths to clean
     * @param distance - How close points need to be before they are cleaned
     * @return {Paths} - The cleaned paths
     */
    cleanPolygons(paths, distance = 1.1415) {
        return functions.cleanPolygons(this.instance, paths, distance);
    }
    // noinspection JSMethodCanBeStatic
    /**
     * This function filters out open paths from the PolyTree structure and returns only closed paths in a Paths structure.
     *
     * @param polyTree
     * @return {Paths}
     */
    closedPathsFromPolyTree(polyTree) {
        return functions.closedPathsFromPolyTree(polyTree);
    }
    /**
     *  Minkowski Difference is performed by subtracting each point in a polygon from the set of points in an open or closed path. A key feature of Minkowski
     *  Difference is that when it's applied to two polygons, the resulting polygon will contain the coordinate space origin whenever the two polygons touch or
     *  overlap. (This function is often used to determine when polygons collide.)
     *
     * @param poly1
     * @param poly2
     * @return {Paths}
     */
    minkowskiDiff(poly1, poly2) {
        return functions.minkowskiDiff(this.instance, poly1, poly2);
    }
    /**
     * Minkowski Addition is performed by adding each point in a polygon 'pattern' to the set of points in an open or closed path. The resulting polygon
     * (or polygons) defines the region that the 'pattern' would pass over in moving from the beginning to the end of the 'path'.
     *
     * @param pattern
     * @param path
     * @param pathIsClosed
     * @return {Paths}
     */
    minkowskiSumPath(pattern, path, pathIsClosed) {
        return functions.minkowskiSumPath(this.instance, pattern, path, pathIsClosed);
    }
    /**
     * Minkowski Addition is performed by adding each point in a polygon 'pattern' to the set of points in an open or closed path. The resulting polygon
     * (or polygons) defines the region that the 'pattern' would pass over in moving from the beginning to the end of the 'path'.
     *
     * @param pattern
     * @param paths
     * @param pathIsClosed
     * @return {Paths}
     */
    minkowskiSumPaths(pattern, paths, pathIsClosed) {
        return functions.minkowskiSumPaths(this.instance, pattern, paths, pathIsClosed);
    }
    // noinspection JSMethodCanBeStatic
    /**
     * This function filters out closed paths from the PolyTree structure and returns only open paths in a Paths structure.
     *
     * @param polyTree
     * @return {ReadonlyPath[]}
     */
    openPathsFromPolyTree(polyTree) {
        return functions.openPathsFromPolyTree(polyTree);
    }
    // noinspection JSMethodCanBeStatic
    /**
     * Orientation is only important to closed paths. Given that vertices are declared in a specific order, orientation refers to the direction (clockwise or
     * counter-clockwise) that these vertices progress around a closed path.
     *
     * Orientation is also dependent on axis direction:
     * - On Y-axis positive upward displays, orientation will return true if the polygon's orientation is counter-clockwise.
     * - On Y-axis positive downward displays, orientation will return true if the polygon's orientation is clockwise.
     *
     * Notes:
     * - Self-intersecting polygons have indeterminate orientations in which case this function won't return a meaningful value.
     * - The majority of 2D graphic display libraries (eg GDI, GDI+, XLib, Cairo, AGG, Graphics32) and even the SVG file format have their coordinate origins
     * at the top-left corner of their respective viewports with their Y axes increasing downward. However, some display libraries (eg Quartz, OpenGL) have their
     * coordinate origins undefined or in the classic bottom-left position with their Y axes increasing upward.
     * - For Non-Zero filled polygons, the orientation of holes must be opposite that of outer polygons.
     * - For closed paths (polygons) in the solution returned by the clip method, their orientations will always be true for outer polygons and false
     * for hole polygons (unless the reverseSolution property has been enabled).
     *
     * @param path - Path
     * @return {boolean}
     */
    orientation(path) {
        return functions.orientation(path);
    }
    // noinspection JSMethodCanBeStatic
    /**
     * Returns PointInPolygonResult.Outside when false, PointInPolygonResult.OnBoundary when point is on poly and PointInPolygonResult.Inside when point is in
     * poly.
     *
     * It's assumed that 'poly' is closed and does not self-intersect.
     *
     * @param point
     * @param path
     * @return {PointInPolygonResult}
     */
    pointInPolygon(point, path) {
        return functions.pointInPolygon(point, path);
    }
    // noinspection JSMethodCanBeStatic
    /**
     * This function converts a PolyTree structure into a Paths structure.
     *
     * @param polyTree
     * @return {Paths}
     */
    polyTreeToPaths(polyTree) {
        return functions.polyTreeToPaths(polyTree);
    }
    // noinspection JSMethodCanBeStatic
    /**
     * Reverses the vertex order (and hence orientation) in the specified path.
     *
     * @param path - Path to reverse, which gets overwritten rather than copied
     */
    reversePath(path) {
        functions.reversePath(path);
    }
    // noinspection JSMethodCanBeStatic
    /**
     * Reverses the vertex order (and hence orientation) in each contained path.
     *
     * @param paths - Paths to reverse, which get overwritten rather than copied
     */
    reversePaths(paths) {
        functions.reversePaths(paths);
    }
    /**
     * Removes self-intersections from the supplied polygon (by performing a boolean union operation using the nominated PolyFillType).
     * Polygons with non-contiguous duplicate vertices (ie 'touching') will be split into two polygons.
     *
     * Note: There's currently no guarantee that polygons will be strictly simple since 'simplifying' is still a work in progress.
     *
     * @param path
     * @param fillType
     * @return {Paths} - The solution
     */
    simplifyPolygon(path, fillType = PolyFillType.EvenOdd) {
        return functions.simplifyPolygon(this.instance, path, fillType);
    }
    /**
     * Removes self-intersections from the supplied polygons (by performing a boolean union operation using the nominated PolyFillType).
     * Polygons with non-contiguous duplicate vertices (ie 'vertices are touching') will be split into two polygons.
     *
     * Note: There's currently no guarantee that polygons will be strictly simple since 'simplifying' is still a work in progress.
     *
     * @param paths
     * @param fillType
     * @return {Paths} - The solution
     */
    simplifyPolygons(paths, fillType = PolyFillType.EvenOdd) {
        return functions.simplifyPolygons(this.instance, paths, fillType);
    }
    // noinspection JSMethodCanBeStatic
    /**
     * Scales a path by multiplying all its points by a number and then rounding them.
     *
     * @param path - Path to scale
     * @param scale - Scale multiplier
     * @return {Path} - The scaled path
     */
    scalePath(path, scale) {
        return functions.scalePath(path, scale);
    }
    // noinspection JSMethodCanBeStatic
    /**
     * Scales all inner paths by multiplying all its points by a number and then rounding them.
     *
     * @param paths - Paths to scale
     * @param scale - Scale multiplier
     * @return {Paths} - The scaled paths
     */
    scalePaths(paths, scale) {
        return functions.scalePaths(paths, scale);
    }
}
/**
 * Max coordinate value (both positive and negative).
 */
ClipperLibWrapper.hiRange = hiRange;
/**
 * Asynchronously tries to load a new native instance of the clipper library to be shared across all method invocations.
 *
 * @param format - Format to load, either WasmThenAsmJs, WasmOnly or AsmJsOnly.
 * @return {Promise<ClipperLibWrapper>} - Promise that resolves with the wrapper instance.
 */
export const loadNativeClipperLibInstanceAsync = async (format) => {
    // TODO: in the future use these methods instead https://github.com/jedisct1/libsodium.js/issues/94
    let tryWasm;
    let tryAsmJs;
    switch (format) {
        case NativeClipperLibRequestedFormat.WasmWithAsmJsFallback:
            tryWasm = true;
            tryAsmJs = true;
            break;
        case NativeClipperLibRequestedFormat.WasmOnly:
            tryWasm = true;
            tryAsmJs = false;
            break;
        case NativeClipperLibRequestedFormat.AsmJsOnly:
            tryWasm = false;
            tryAsmJs = true;
            break;
        default:
            throw new ClipperError('unknown native clipper format');
    }
    function getModuleAsync(initModule) {
        return new Promise((resolve, reject) => {
            let finalModule;
            // noinspection JSUnusedLocalSymbols
            const moduleOverrides = {
                noExitRuntime: true,
                preRun() {
                    if (finalModule) {
                        resolve(finalModule);
                    }
                    else {
                        setTimeout(() => {
                            resolve(finalModule);
                        }, 1);
                    }
                },
                quit(code, err) {
                    reject(err);
                },
            };
            finalModule = initModule(moduleOverrides);
        });
    }
    console.log({ tryWasm, tryAsmJs, wasmModule, asmJsModule });
    if (tryWasm) {
        if (wasmModule instanceof Error) {
            // skip
        }
        else if (wasmModule === undefined) {
            try {
                wasmModule = await getModuleAsync(initModule);
                return new ClipperLibWrapper(wasmModule, NativeClipperLibLoadedFormat.Wasm);
            }
            catch (err) {
                wasmModule = err;
            }
        }
        else {
            return new ClipperLibWrapper(wasmModule, NativeClipperLibLoadedFormat.Wasm);
        }
    }
    // if (tryAsmJs) {
    // 	if (asmJsModule instanceof Error) {
    // 		// skip
    // 	} else if (asmJsModule === undefined) {
    // 		try {
    // 			const initModule = require('./wasm/clipper').init;
    // 			asmJsModule = await getModuleAsync(initModule);
    // 			return new ClipperLibWrapper(asmJsModule, NativeClipperLibLoadedFormat.AsmJs);
    // 		} catch (err) {
    // 			asmJsModule = err as undefined;
    // 		}
    // 	} else {
    // 		return new ClipperLibWrapper(asmJsModule, NativeClipperLibLoadedFormat.AsmJs);
    // 	}
    // }
    throw new ClipperError('could not load native clipper in the desired format');
};
