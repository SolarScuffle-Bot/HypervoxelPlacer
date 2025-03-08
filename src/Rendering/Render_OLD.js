import * as M5 from "../Math/Mat5D.js"
import * as M4 from "../Math/Mat4D.js"
import * as Canvas from "../Canvas.js"

const C = Canvas.c
const Device = Canvas.device
const GPU = Canvas.gpu
const Queue = Device.queue

/** @typedef {{position: Vector4, rgbau8: number}} TesseractInstance */

/** @type {TesseractInstance[]} */
const TRANSPARENT_TESSERACT_LIST = []
/** @type {TesseractInstance[]} */
const OPAQUE_TESSERACT_LIST = []

/**
 * @param {number} ru8
 * @param {number} gu8
 * @param {number} bu8
 * @param {number} au8
 */
function compress_color(ru8, gu8, bu8, au8) {
	return au8 << 24 + gu8 << 16 + bu8 << 8 + ru8
}

/**
 * @param {Vector4} position
 * @param {RGBA} rgba
*/
export function push_tesseract(position, rgba) {
	const [r, g, b, a] = rgba
	const au8 = Math.round(a * 255)
	if (au8 === 0) return undefined

	const bu8 = Math.round(b * 255)
	const gu8 = Math.round(g * 255)
	const ru8 = Math.round(r * 255)

	const rgbau8 = compress_color(ru8, gu8, bu8, au8)

	const instance = {
		position,
		rgbau8,
	}

	if (au8 === 255) {
		OPAQUE_TESSERACT_LIST.push(instance)
	} else {
		TRANSPARENT_TESSERACT_LIST.push(instance)
	}
}

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

const OPAQUE_TESSERACT_BUFFER = new_staticMeshInstanceBuffer(4 * I16 + 4 * U8, EXPECTED_MAX_TESSERACT_COUNT, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST)
const TRANSPARENT_TESSERACT_BUFFER = new_staticMeshInstanceBuffer(4 * I16 + 4 * U8, EXPECTED_MAX_TESSERACT_COUNT, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST)

export function commit_tesseracts() {
	for (const buffer of [OPAQUE_TESSERACT_BUFFER, TRANSPARENT_TESSERACT_BUFFER]) {
		const view = buffer.view
		for (let i = 0; i < OPAQUE_TESSERACT_LIST.length; i++) {
			const instance = OPAQUE_TESSERACT_LIST[i]
			const j = 12 * buffer.length++
			view.setInt16(j + 0, instance.position[0], true)
			view.setInt16(j + 2, instance.position[1], true)
			view.setInt16(j + 4, instance.position[2], true)
			view.setInt16(j + 6, instance.position[3], true)
			view.setUint32(j + 8, instance.rgbau8, true)
		}
	}
}

export function reset_tesseracts() {
	reset_buffer(OPAQUE_TESSERACT_BUFFER)
	reset_buffer(TRANSPARENT_TESSERACT_BUFFER)
}

const INDICES4 = [
	// -X Normal Cell (6 quads -> 12 triangles)
	// Quad (1,9,13,5) => Tri (1,9,13) , (1,13,5)
	1, 9, 13, 1, 13, 5,
	3, 7, 15, 3, 15, 11,
	9, 11, 15, 9, 15, 13,
	3, 1, 5, 3, 5, 7,
	7, 5, 13, 7, 13, 15,
	1, 3, 11, 1, 11, 9,

	// X Normal Cell
	0, 8, 12, 0, 12, 4,
	2, 6, 14, 2, 14, 10,
	8, 10, 14, 8, 14, 12,
	2, 0, 4, 2, 4, 6,
	6, 4, 12, 6, 12, 14,
	0, 2, 10, 0, 10, 8,

	// -Y Normal Cell
	6, 2, 10, 6, 10, 14,
	3, 7, 15, 3, 15, 11,
	10, 11, 15, 10, 15, 14,
	3, 2, 6, 3, 6, 7,
	7, 6, 14, 7, 14, 15,
	2, 3, 11, 2, 11, 10,

	// Y Normal Cell
	4, 0, 8, 4, 8, 12,
	1, 5, 13, 1, 13, 9,
	8, 9, 13, 8, 13, 12,
	1, 0, 4, 1, 4, 5,
	5, 4, 12, 5, 12, 13,
	0, 1, 9, 0, 9, 8,

	// -Z Normal Cell
	4, 5, 7, 4, 7, 6,
	13, 12, 14, 13, 14, 15,
	5, 4, 12, 5, 12, 13,
	6, 7, 15, 6, 15, 14,
	7, 5, 13, 7, 13, 15,
	4, 6, 14, 4, 14, 12,

	// Z Normal Cell
	0, 1, 3, 0, 3, 2,
	9, 8, 10, 9, 10, 11,
	1, 0, 8, 1, 8, 9,
	2, 3, 11, 2, 11, 10,
	3, 1, 9, 3, 9, 11,
	0, 2, 10, 0, 10, 8,

	// -W Normal Cell
	9, 8, 10, 9, 10, 11,
	12, 13, 15, 12, 15, 14,
	9, 11, 15, 9, 15, 13,
	10, 8, 12, 10, 12, 14,
	8, 9, 13, 8, 13, 12,
	11, 10, 14, 11, 14, 15,

	// W Normal Cell
	1, 0, 2, 1, 2, 3,
	4, 5, 7, 4, 7, 6,
	0, 1, 5, 0, 5, 4,
	3, 2, 6, 3, 6, 7,
	1, 3, 7, 1, 7, 5,
	2, 0, 4, 2, 4, 6,
]

{
	// Assume the following variables are defined and available:
	//   device         : the GPU device
	//   dataBuffer     : GPUBuffer containing our padded data (length m)
	//   m              : total padded length (a power of two)
	//   blockSize      : size of each block (e.g. 1024)
	//   blockSortModule: compiled WGSL module from blockSort.wgsl
	//   mergeModule    : compiled WGSL module from merge.wgsl
	//   pipelineLayout : the pipeline layout that matches the bind groups used in both shaders
	//
	// We assume uniform buffers are created for each stage (and can be updated via mapped ranges).

	const blockSortModule = Device.createShaderModule({
		code: await fetch('./BlockSort.wgsl').then(res => res.text())
	})

	const mergeModule = Device.createShaderModule({
		code: await fetch('./BlockSort.wgsl').then(res => res.text())
	})

	// Create compute pipelines.
	const blockSortPipeline = Device.createComputePipeline({
		layout: pipelineLayout,
		compute: { module: blockSortModule, entryPoint: "main" },
	});
	const mergePipeline = Device.createComputePipeline({
		layout: pipelineLayout,
		compute: { module: mergeModule, entryPoint: "main" },
	});

	// Create uniform buffers for block sort and merge stages.
	// (Uniform buffers must have appropriate size and usage flags.)
	const blockParamsBuffer = Device.createBuffer({
		size: 8, // two u32 values (blockOffset, blockSize)
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	});
	const mergeParamsBuffer = Device.createBuffer({
		size: 8, // two u32 values (regionSize, m)
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	});

	// Create bind groups (assuming binding group 0 is used in both shaders).
	const blockSortBindGroup = Device.createBindGroup({
		layout: blockSortPipeline.getBindGroupLayout(0),
		entries: [
			{ binding: 0, resource: { buffer: dataBuffer } },
			{ binding: 1, resource: { buffer: blockParamsBuffer } },
		],
	});
	const mergeBindGroup = Device.createBindGroup({
		layout: mergePipeline.getBindGroupLayout(0),
		entries: [
			{ binding: 0, resource: { buffer: dataBuffer } },
			{ binding: 1, resource: { buffer: mergeParamsBuffer } },
		],
	});

	// Command encoder for the entire sort.
	const commandEncoder = Device.createCommandEncoder();

	// --- Phase 1: Block-Level Sort ---
	// Process each block independently. You can either dispatch one workgroup per block
	// in separate passes or combine multiple blocks into a single dispatch if they share a workgroup.
	// Here we dispatch one compute pass per block.
	const numBlocks = m / blockSize;
	for (let blockIndex = 0; blockIndex < numBlocks; blockIndex++) {
		// Update the block uniform buffer with the starting offset and block size.
		// (Assume updateBuffer is a helper that writes a Uint32Array to the GPU buffer.)
		updateBuffer(Device, blockParamsBuffer, new Uint32Array([blockIndex * blockSize, blockSize]));

		const passEncoder = commandEncoder.beginComputePass();
		passEncoder.setPipeline(blockSortPipeline);
		passEncoder.setBindGroup(0, blockSortBindGroup);
		// Each pass handles one block; workgroup size is BLOCK_SIZE so we dispatch one workgroup.
		passEncoder.dispatchWorkgroups(1);
		passEncoder.end();
	}

	// --- Phase 2: Global Merge ---
	// In the first merge pass, we merge pairs of sorted blocks so that the region size is blockSize * 2.
	// In subsequent passes the region size doubles until it reaches m.
	let regionSize = blockSize * 2;
	while (regionSize <= m) {
		const numRegions = m / regionSize;
		// Update the merge uniform buffer.
		updateBuffer(Device, mergeParamsBuffer, new Uint32Array([regionSize, m]));

		const passEncoder = commandEncoder.beginComputePass();
		passEncoder.setPipeline(mergePipeline);
		passEncoder.setBindGroup(0, mergeBindGroup);
		// Dispatch one workgroup per merge region.
		// The merge shader’s workgroup_size is set to MAX_REGION_SIZE; adjust if needed.
		passEncoder.dispatchWorkgroups(numRegions);
		passEncoder.end();

		regionSize *= 2;
	}

	// Submit the command buffer. After this, the sorted data remains in dataBuffer.
	Device.queue.submit([commandEncoder.finish()]);

}

// Device.queue.submit([commandBuffer])
// 2. Load/compile WGSL:
const vertexShaderModule = Device.createShaderModule({
	code: await fetch('./Tesseract.wgsl').then(res => res.text())
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
	renderPass.setVertexBuffer(0,);
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
//  * @param {Vector3} position3
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
//  * @returns {?Vector4}
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