import * as M from "./Math/Mat.js"
import * as Canvas from "./Canvas.js"

const C = Canvas.c
const Device = Canvas.device
const GPU = Canvas.gpu
const Queue = Device.queue

const EXPECTED_MAX_TESSERACT_COUNT = 1e4
const U8 = 1
const I16 = 2

/**
 * @param {number} instanceBytes
 * @param {number} maxCount
 * @param {number} usage
 */
function new_staticMeshInstanceBuffer(instanceBytes, maxCount, usage) {
	const maxBytes = maxCount * instanceBytes
	const gpuBuffer = Device.createBuffer({
		size: maxBytes,
		usage: usage,
	})
	const buffer = new ArrayBuffer(maxCount * instanceBytes)
	const view = new DataView(buffer)
	return {
		gpuBuffer,
		buffer,
		view,
		length: 0,
	}
}

/**
 * @typedef {ReturnType<new_staticMeshInstanceBuffer>} StaticMeshInstanceBuffer
 */

/**
 * @param {StaticMeshInstanceBuffer} buffer
 */
function commit_buffer(buffer) {
	Queue.writeBuffer(buffer.gpuBuffer, 0, buffer.buffer, 0, buffer.buffer.byteLength)
}

/**
 * @param {StaticMeshInstanceBuffer} buffer
 */
function reset_buffer(buffer) {
	buffer.length = 0
}

const TESSERACT_COLOR = new_staticMeshInstanceBuffer(4 * U8, EXPECTED_MAX_TESSERACT_COUNT, GPUBufferUsage.VERTEX)
const TESSERACT_OPAQUE = new_staticMeshInstanceBuffer(4 * I16, EXPECTED_MAX_TESSERACT_COUNT, GPUBufferUsage.VERTEX)
const TESSERACT_OPAQUE_INDICES = new_staticMeshInstanceBuffer(288 * U8, EXPECTED_MAX_TESSERACT_COUNT, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST)

const TESSERACT_TRANSPARENT = new_staticMeshInstanceBuffer(4 * I16, EXPECTED_MAX_TESSERACT_COUNT, GPUBufferUsage.VERTEX)

export function reset_tesseracts() {
	reset_buffer(TESSERACT_COLOR)
	reset_buffer(TESSERACT_OPAQUE)
	reset_buffer(TESSERACT_TRANSPARENT)
}

export function commit_tesseracts() {
	commit_buffer(TESSERACT_OPAQUE)
	commit_buffer(TESSERACT_OPAQUE)
	commit_buffer(TESSERACT_TRANSPARENT)
}

/**
 * @param {M.Vector4} position
 * @param {M.Vector4} color
 */
export function push_tesseract(position, color) {
	const alpha = color[3]
	if (alpha == 0) return

	{
		const view = TESSERACT_COLOR.view
		const i = 4 * TESSERACT_COLOR.length++
		view.setUint8(i + 0, color[0])
		view.setUint8(i + 1, color[1])
		view.setUint8(i + 2, color[2])
		view.setUint8(i + 3, alpha)
	}
	{
		const buffer = alpha == 1 ? TESSERACT_OPAQUE : TESSERACT_TRANSPARENT
		const view = buffer.view
		const i = 8 * buffer.length++
		view.setInt16(i + 0, position[0], true)
		view.setInt16(i + 2, position[1], true)
		view.setInt16(i + 4, position[2], true)
		view.setInt16(i + 6, position[3], true)
	}
}

// Device.queue.submit([commandBuffer])
// 2. Load/compile WGSL:
const vertexShaderModule = Device.createShaderModule({
	code: await fetch('../Shaders/Tesseract.wgsl').then(res => res.text())
})

// 3. Create a pipeline:
const opaquePipeline = Device.createRenderPipeline({
	layout: "auto", // or create a pipeline layout if you have uniforms
	vertex: {
		module: vertexShaderModule,
		entryPoint: "vertex_main",
		buffers: [
			{
				arrayStride: 4 * U8,
				stepMode: "instance",
				attributes: [
					// 4 i16 (8 bytes)
					{
						shaderLocation: 0,
						offset: 0,
						// "snorm16x4", "sint16x4", or something depending on how you interpret them in the shader
						format: "unorm8x4",
					},
				],
			},
			{
				arrayStride: 4 * I16,
				stepMode: "instance",
				attributes: [
					// 4 i16 (8 bytes)
					{
						shaderLocation: 1,
						offset: 0,
						// "snorm16x4", "sint16x4", or something depending on how you interpret them in the shader
						format: "sint16x4"
					},
				],
			},
		],
	},
	fragment: {
		module: vertexShaderModule,   // or a separate fragment shader
		entryPoint: "fragment_main",  // if you have a separate function
		targets: [{
			format: GPU.getPreferredCanvasFormat(),
		}],
	},
	primitive: {
		topology: "triangle-list",
	},
})

const transparentPipeline = Device.createRenderPipeline({
	layout: "auto", // or create a pipeline layout if you have uniforms
	depthStencil: {
		format: "depth24plus",
		depthWriteEnabled: false, // <--- important for transparency
		depthCompare: "less",
	},
	vertex: {
		module: vertexShaderModule,
		entryPoint: "vertex_main",
		buffers: [{
			arrayStride: BYTES_PER_TESSERACT, // 12 bytes per instance
			stepMode: "instance",
			attributes: [
				// 4 i16 (8 bytes)
				{
					shaderLocation: 0,
					offset: 0,
					// "snorm16x4", "sint16x4", or something depending on how you interpret them in the shader
					format: "sint16x4",
				},
				// 4 u8 (4 bytes)
				{
					shaderLocation: 1,
					offset: 8,
					format: "unorm8x4", // or "uint8x4", etc.
				},
			]
		}],
	},
	fragment: {
		module: vertexShaderModule,   // or a separate fragment shader
		entryPoint: "fragment_main",  // if you have a separate function
		targets: [{
			format: GPU.getPreferredCanvasFormat(), // or your swap chain format
			blend: {
				color: {
					srcFactor: "src-alpha",
					dstFactor: "one-minus-src-alpha",
					operation: "add",
				},
				alpha: {
					srcFactor: "one",
					dstFactor: "one-minus-src-alpha",
					operation: "add",
				},
			},
		}],
	},
	primitive: {
		topology: "triangle-list",
	},
})

export function render() {
	const encoder = Device.createCommandEncoder();
	const currentTexture = C.getCurrentTexture();

	encoder.beginComputePass({

	})
	const renderPass = encoder.beginRenderPass({
		colorAttachments: [{
			view: currentTexture.createView(),
			clearValue: [17 / 255, 17 / 255, 34 / 255, 1],
			loadOp: "clear",
			storeOp: "store",
		}],
	})

	renderPass.setPipeline(opaquePipeline)
	renderPass.setVertexBuffer(0, );
	renderPass.draw(288 * TESSERACT_OPAQUE.length, 1, 0, 0)

	renderPass.setPipeline(transparentPipeline)
	renderPass.draw(288 * TESSERACT_TRANSPARENT.length, 1, 0, 0)

	renderPass.end()

	Device.queue.submit([encoder.finish()])
}

// export function render_tesseract_quads_orthographic(style, vertices4, indices) {
// 	const U = Canvas.min * 0.1

// 	C.fillStyle = style

// 	for (let i = 0; i < indices.length; i += 4) {
// 		const ai = 4 * indices[i + 0]
// 		const bi = 4 * indices[i + 1]
// 		const ci = 4 * indices[i + 2]

// 		const az = vertices4[ai + 2]
// 		const ay = vertices4[ai + 1]
// 		const ax = vertices4[ai + 0]

// 		const bz = vertices4[bi + 2]
// 		const by = vertices4[bi + 1]
// 		const bx = vertices4[bi + 0]

// 		const cz = vertices4[ci + 2]
// 		const cy = vertices4[ci + 1]
// 		const cx = vertices4[ci + 0]

// 		if ((bx - ax) * (cy - ay) - (cx - ax) * (by - ay) <= 0)
// 			continue

// 		const di = 5 * indices[i + 3]
// 		const dz = vertices4[di + 2]
// 		const dy = vertices4[di + 1]
// 		const dx = vertices4[di + 0]

// 		// if (az <= -1 || bz <= -1 || cz <= -1 || dz <= -1)
// 		// 	continue

// 		C.beginPath()
// 		C.moveTo(U * ax, -U * ay)
// 		C.lineTo(U * bx, -U * by)
// 		C.lineTo(U * cx, -U * cy)
// 		C.lineTo(U * dx, -U * dy)

// 		C.fill()
// 	}

// 	// for (let i = 0; i < vertices5.length / 5; i++) {
// 	// 	const w = vertices5[i * 5 + 3]
// 	// 	const z = vertices5[i * 5 + 2]
// 	// 	const y = vertices5[i * 5 + 1] / z
// 	// 	const x = vertices5[i * 5 + 0] / z
// 	// 	C.fillStyle = INDEX_COLORS[i]

// 	// 	C.fillRect(U * x, -U * y, 3, -3)
// 	// 	C.fillText(i, U * x, -U * y - 0.1)
// 	// }
// }

// /**
//  * @param {string} text
//  * @param {M.Vector3} position3
//  * @param {number} size
//  * @param {string} color
//  * @param {CanvasTextAlign} textAlign
//  * @param {CanvasTextBaseline} textBaseline
//  */
// export function render_spatial_text(text, position3, size, color, textAlign, textBaseline) {
// 	const [x, y, z] = position3
// 	if (z <= 0) return

// 	const U = Canvas.min

// 	C.font = `${size}px arial`
// 	C.fillStyle = "#FFF"
// 	C.strokeStyle = Canvas.DEFAULT_COLOR
// 	C.lineWidth = 0.21 * size

// 	const az = 1 / Math.abs(z)
// 	C.textAlign = textAlign
// 	C.textBaseline = textBaseline

// 	C.fillStyle = color
// 	C.strokeStyle = Canvas.DEFAULT_COLOR
// 	C.strokeText(text, U * x * az, -U * y * az)
// 	C.fillText(text, U * x * az, -U * y * az)
// }

// /**
//  * @param {number[]} vertices3
//  * @param {number[]} indices
//  */
// export function render_tesseract_quads_perspective(vertices3, indices, color) {
// 	const U = Canvas.min

// 	for (let i = 0; i < indices.length / 4; i++) {
// 		const j = i * 4

// 		const ai = 3 * indices[j + 0]
// 		const bi = 3 * indices[j + 1]
// 		const ci = 3 * indices[j + 2]
// 		const di = 3 * indices[j + 3]

// 		const az = vertices3[ai + 2]
// 		const bz = vertices3[bi + 2]
// 		const cz = vertices3[ci + 2]
// 		const dz = vertices3[di + 2]
// 		if (az <= 0 && bz <= 0 && cz <= 0 && dz <= 0)
// 			continue

// 		const aaz = 1 / Math.abs(az)
// 		const ay = vertices3[ai + 1] * aaz
// 		const ax = vertices3[ai + 0] * aaz

// 		const abz = 1 / Math.abs(bz)
// 		const by = vertices3[bi + 1] * abz
// 		const bx = vertices3[bi + 0] * abz

// 		const acz = 1 / Math.abs(cz)
// 		const cy = vertices3[ci + 1] * acz
// 		const cx = vertices3[ci + 0] * acz

// 		if ((bx - ax) * (cy - ay) - (cx - ax) * (by - ay) <= 0)
// 			continue

// 		const adz = 1 / Math.abs(dz)
// 		const dy = vertices3[di + 1] * adz
// 		const dx = vertices3[di + 0] * adz

// 		if ((cx - bx) * (dy - by) - (dx - bx) * (cy - by) <= 0)
// 			continue

// 		// if (az > aw || bz > bw || cz > cw || dz > dw)
// 		// 	continue

// 		C.fillStyle = color

// 		C.beginPath()
// 		C.moveTo(U * ax, -U * ay)
// 		C.lineTo(U * bx, -U * by)
// 		C.lineTo(U * cx, -U * cy)
// 		C.lineTo(U * dx, -U * dy)
// 		C.fill()
// 	}
// }

// /**
//  * @param {number[]} vertices3
//  * @param {number[]} indices
//  * @param {string[]} colors
//  */
// export function render_lines(vertices3, indices, colors) {
// 	const U = Canvas.min * 1

// 	C.lineWidth = 1

// 	for (let i = 0; i < indices.length / 2; i++) {
// 		const j = i * 2

// 		const ai = 3 * indices[j + 0]
// 		const bi = 3 * indices[j + 1]

// 		const az = vertices3[ai + 2]
// 		const bz = vertices3[bi + 2]
// 		if (az <= 0 && bz <= 0) continue

// 		const aaz = Math.abs(az)
// 		const ay = U * vertices3[ai + 1] / aaz
// 		const ax = U * vertices3[ai + 0] / aaz

// 		const abz = Math.abs(bz)
// 		const by = U * vertices3[bi + 1] / abz
// 		const bx = U * vertices3[bi + 0] / abz

// 		const clipped = cohenSutherlandClip(ax, ay, bx, by)
// 		if (clipped === null) continue

// 		const [cx, cy, dx, dy] = clipped

// 		const style = colors[i]
// 		C.strokeStyle = style

// 		C.beginPath()
// 		C.moveTo(cx, -cy)
// 		C.lineTo(dx, -dy)
// 		C.stroke()
// 	}
// }

// // JavaScript program to implement Cohen Sutherland algorithm
// // for line clipping.

// // Defining region codes
// const INSIDE = 0 // 0000
// const LEFT = 1 // 0001
// const RIGHT = 2 // 0010
// const BOTTOM = 4 // 0100
// const TOP = 8 // 1000

// // Function to compute region code for a point(x, y)
// /**
//  * @param {number} x
//  * @param {number} y
//  */
// function computeCode(x, y) {
// 	// initialized as being inside
// 	let code = INSIDE

// 	if (x < Canvas.left) // to the left of rectangle
// 		code |= LEFT
// 	else if (x > Canvas.right) // to the right of rectangle
// 		code |= RIGHT

// 	if (y < Canvas.bottom) // below the rectangle
// 		code |= BOTTOM
// 	else if (y > Canvas.top) // above the rectangle
// 		code |= TOP

// 	return code
// }

// // Implementing Cohen-Sutherland algorithm
// // Clipping a line from P1 = (x2, y2) to P2 = (x2, y2)
// /**
//  * @param {number} x1
//  * @param {number} y1
//  * @param {number} x2
//  * @param {number} y2
//  * @returns {?M.Vector4}
//  */
// function cohenSutherlandClip(x1, y1, x2, y2) {
// 	// Compute region codes for P1, P2
// 	let code1 = computeCode(x1, y1)
// 	let code2 = computeCode(x2, y2)

// 	for (let _ = 0; _ < 8; _++) {
// 		if ((code1 === 0) && (code2 === 0)) {
// 			// If both endpoints lie within rectangle
// 			return [x1, y1, x2, y2]
// 		}
// 		else if (code1 & code2) {
// 			// If both endpoints are outside rectangle,
// 			// in same region
// 			return null
// 		}
// 		else {
// 			// Some segment of line lies within the
// 			// rectangle
// 			let code_out, x, y

// 			// At least one endpoint is outside the
// 			// rectangle, pick it.
// 			if (code1 !== 0)
// 				code_out = code1
// 			else
// 				code_out = code2

// 			// Find intersection point
// 			// using formulas y = y1 + slope * (x - x1),
// 			// x = x1 + (1 / slope) * (y - y1)
// 			if (code_out & TOP) {
// 				// point is above the clip rectangle
// 				x = x1 + (x2 - x1) * (Canvas.top - y1) / (y2 - y1)
// 				y = Canvas.top
// 			}
// 			else if (code_out & BOTTOM) {
// 				// point is below the rectangle
// 				x = x1 + (x2 - x1) * (Canvas.bottom - y1) / (y2 - y1)
// 				y = Canvas.bottom
// 			}
// 			else if (code_out & RIGHT) {
// 				// point is to the right of rectangle
// 				y = y1 + (y2 - y1) * (Canvas.right - x1) / (x2 - x1)
// 				x = Canvas.right
// 			}
// 			else if (code_out & LEFT) {
// 				// point is to the left of rectangle
// 				y = y1 + (y2 - y1) * (Canvas.left - x1) / (x2 - x1)
// 				x = Canvas.left
// 			}

// 			// Now intersection point x, y is found
// 			// We replace point outside rectangle
// 			// by intersection point
// 			if (code_out === code1) {
// 				x1 = x
// 				y1 = y
// 				code1 = computeCode(x1, y1)
// 			}
// 			else {
// 				x2 = x
// 				y2 = y
// 				code2 = computeCode(x2, y2)
// 			}
// 		}
// 	}
// }