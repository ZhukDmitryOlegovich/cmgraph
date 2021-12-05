// import * as clipperLib from './js-angusj-clipper';
import * as clipperLib from '@/js-angusj-clipper/src/index';

async function mainAsync() {
	// create an instance of the library (usually only do this once in your app)
	const clipper = await clipperLib.loadNativeClipperLibInstanceAsync(
		// let it autodetect which one to use, but also available WasmOnly and AsmJsOnly
		clipperLib.NativeClipperLibRequestedFormat.WasmWithAsmJsFallback,
	);

	// create some polygons (note that they MUST be integer coordinates)
	const poly1 = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }];

	const poly2 = [{ x: 10, y: 10 }, { x: 20, y: 10 }, { x: 20, y: 20 }, { x: 10, y: 20 }];

	// get their union
	const polyIntersection = clipper.clipToPaths({
		clipType: clipperLib.ClipType.Intersection,

		subjectInputs: [{ data: poly1, closed: true }],

		clipInputs: [{ data: poly2 }],

		subjectFillType: clipperLib.PolyFillType.EvenOdd,
	});

	const polyDifference = clipper.clipToPaths({
		clipType: clipperLib.ClipType.Difference,

		subjectInputs: [{ data: poly1, closed: true }],

		clipInputs: [{ data: poly2 }],

		subjectFillType: clipperLib.PolyFillType.EvenOdd,
	});

	const polyXor = clipper.clipToPaths({
		clipType: clipperLib.ClipType.Xor,

		subjectInputs: [{ data: poly1, closed: true }],

		clipInputs: [{ data: poly2 }],

		subjectFillType: clipperLib.PolyFillType.EvenOdd,
	});

	const polyUnion = clipper.clipToPaths({
		clipType: clipperLib.ClipType.Union,

		subjectInputs: [{ data: poly1, closed: true }],

		clipInputs: [{ data: poly2 }],

		subjectFillType: clipperLib.PolyFillType.EvenOdd,
	});

	console.log({
		polyIntersection, polyDifference, polyXor, polyUnion,
	});

	/* polyResult will be:
			[
			  [
				{x: 10, y: 10}
				{x: 0, y: 10}
				{x: 0, y: 0}
				{x: 10, y: 0}
			  ]
			]
		   */
}

mainAsync();
