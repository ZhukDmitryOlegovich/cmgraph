import { ClipType, EndType, JoinType, PolyFillType, PolyType } from "../enums.js";
export function polyFillTypeToNative(nativeLib, polyFillType) {
    switch (polyFillType) {
        case PolyFillType.EvenOdd:
            return nativeLib.PolyFillType.EvenOdd;
        case PolyFillType.NonZero:
            return nativeLib.PolyFillType.NonZero;
        case PolyFillType.Positive:
            return nativeLib.PolyFillType.Positive;
        case PolyFillType.Negative:
            return nativeLib.PolyFillType.Negative;
        default:
            throw new Error("unknown poly fill type");
    }
}
export function clipTypeToNative(nativeLib, clipType) {
    switch (clipType) {
        case ClipType.Intersection:
            return nativeLib.ClipType.Intersection;
        case ClipType.Union:
            return nativeLib.ClipType.Union;
        case ClipType.Difference:
            return nativeLib.ClipType.Difference;
        case ClipType.Xor:
            return nativeLib.ClipType.Xor;
        default:
            throw new Error("unknown clip type");
    }
}
export function polyTypeToNative(nativeLib, polyType) {
    switch (polyType) {
        case PolyType.Subject:
            return nativeLib.PolyType.Subject;
        case PolyType.Clip:
            return nativeLib.PolyType.Clip;
        default:
            throw new Error("unknown poly type");
    }
}
export function joinTypeToNative(nativeLib, joinType) {
    switch (joinType) {
        case JoinType.Square:
            return nativeLib.JoinType.Square;
        case JoinType.Round:
            return nativeLib.JoinType.Round;
        case JoinType.Miter:
            return nativeLib.JoinType.Miter;
        default:
            throw new Error("unknown join type");
    }
}
export function endTypeToNative(nativeLib, endType) {
    switch (endType) {
        case EndType.ClosedPolygon:
            return nativeLib.EndType.ClosedPolygon;
        case EndType.ClosedLine:
            return nativeLib.EndType.ClosedLine;
        case EndType.OpenButt:
            return nativeLib.EndType.OpenButt;
        case EndType.OpenSquare:
            return nativeLib.EndType.OpenSquare;
        case EndType.OpenRound:
            return nativeLib.EndType.OpenRound;
        default:
            throw new Error("unknown end type");
    }
}
