import { nativePathToPath } from "./native/PathToNativePath.js";
/**
 * PolyNodes are encapsulated within a PolyTree container, and together provide a data structure representing the parent-child relationships of polygon
 * contours returned by clipping/ofsetting methods.
 *
 * A PolyNode object represents a single polygon. It's isHole property indicates whether it's an outer or a hole. PolyNodes may own any number of PolyNode
 * children (childs), where children of outer polygons are holes, and children of holes are (nested) outer polygons.
 */
export class PolyNode {
    constructor() {
        this._childs = [];
        this._contour = [];
        this._isOpen = false;
        this._index = 0;
    }
    /**
     * Returns the parent PolyNode.
     *
     * The PolyTree object (which is also a PolyNode) does not have a parent and will return undefined.
     */
    get parent() {
        return this._parent;
    }
    /**
     * A read-only list of PolyNode.
     * Outer PolyNode childs contain hole PolyNodes, and hole PolyNode childs contain nested outer PolyNodes.
     */
    get childs() {
        return this._childs;
    }
    /**
     * Returns a path list which contains any number of vertices.
     */
    get contour() {
        return this._contour;
    }
    /**
     * Returns true when the PolyNode's Contour results from a clipping operation on an open contour (path). Only top-level PolyNodes can contain open contours.
     */
    get isOpen() {
        return this._isOpen;
    }
    /**
     * Index in the parent's child list, or 0 if no parent.
     */
    get index() {
        return this._index;
    }
    /**
     * Returns true when the PolyNode's polygon (Contour) is a hole.
     *
     * Children of outer polygons are always holes, and children of holes are always (nested) outer polygons.
     * The isHole property of a PolyTree object is undefined but its children are always top-level outer polygons.
     *
     * @return {boolean}
     */
    get isHole() {
        if (this._isHole === undefined) {
            let result = true;
            let node = this._parent;
            while (node !== undefined) {
                result = !result;
                node = node._parent;
            }
            this._isHole = result;
        }
        return this._isHole;
    }
    /**
     * The returned PolyNode will be the first child if any, otherwise the next sibling, otherwise the next sibling of the Parent etc.
     *
     * A PolyTree can be traversed very easily by calling GetFirst() followed by GetNext() in a loop until the returned object is undefined.
     *
     * @return {PolyNode | undefined}
     */
    getNext() {
        if (this._childs.length > 0) {
            return this._childs[0];
        }
        else {
            return this.getNextSiblingUp();
        }
    }
    getNextSiblingUp() {
        if (this._parent === undefined) {
            return undefined;
        }
        else if (this._index === this._parent._childs.length - 1) {
            //noinspection TailRecursionJS
            return this._parent.getNextSiblingUp();
        }
        else {
            return this._parent._childs[this._index + 1];
        }
    }
    static fillFromNativePolyNode(pn, nativeLib, nativePolyNode, parent, childIndex, freeNativePolyNode) {
        pn._parent = parent;
        const childs = nativePolyNode.childs;
        for (let i = 0, max = childs.size(); i < max; i++) {
            const newChild = PolyNode.fromNativePolyNode(nativeLib, childs.get(i), pn, i, freeNativePolyNode);
            pn._childs.push(newChild);
        }
        // do we need to clear the object ourselves? for now let's assume so (seems to work)
        pn._contour = nativePathToPath(nativeLib, nativePolyNode.contour, true);
        pn._isOpen = nativePolyNode.isOpen();
        pn._index = childIndex;
        if (freeNativePolyNode) {
            nativePolyNode.delete();
        }
    }
    static fromNativePolyNode(nativeLib, nativePolyNode, parent, childIndex, freeNativePolyNode) {
        const pn = new PolyNode();
        PolyNode.fillFromNativePolyNode(pn, nativeLib, nativePolyNode, parent, childIndex, freeNativePolyNode);
        return pn;
    }
}
