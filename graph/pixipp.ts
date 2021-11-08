import PIXI from 'pixi.js';

class GraphicsGeometryPP extends PIXI.GraphicsGeometry {
	constructor(...graphicsData: PIXI.GraphicsData[]) {
		super();
		this.graphicsData = graphicsData;
	}

	/**
	 * Call if you changed graphicsData manually. Empties all batch buffers. Equal invalidate.
	 */
	rerender() { this.invalidate(); }
}

export default { GraphicsGeometryPP };
