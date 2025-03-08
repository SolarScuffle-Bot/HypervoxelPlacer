import * as M5 from "../Math/Mat5D.js"
import * as M4 from "../Math/Mat4D.js"
import * as Canvas from "../Canvas.js"

const C = Canvas.c
const Device = Canvas.device
const GPU = Canvas.gpu

/**
 * @param {number} x
 */
function nextPowerOfTwo(x) {
	return Math.pow(2, Math.ceil(Math.log2(x)))
}

const VECTOR4_SIZE = 16 // 4 * 4 bytes
const VECTOR3_SIZE = 12

// --- Load Shader Modules ---

const cullShaderModule = Device.createShaderModule({
	code: await (await fetch('CullAndCollect.wgsl')).text(),
})

const bitonicShaderModule = Device.createShaderModule({
	code: await (await fetch('BitonicSort.wgsl')).text(),
})

const optimizeShaderModule = Device.createShaderModule({
	code: await (await fetch('OptimizeIndices.wgsl')).text(),
});

const organizeShaderModule = Device.createShaderModule({
	code: await (await fetch('Organize.wgsl')).text(),
});

// --- Create Compute Pipelines ---

const cullPipeline = Device.createComputePipeline({
	layout: 'auto',
	compute: { module: cullShaderModule, entryPoint: 'cull_cells_out_view' },
})

const bitonicPipeline = Device.createComputePipeline({
	layout: 'auto',
	compute: { module: bitonicShaderModule, entryPoint: 'main' },
})

const optimizePipeline = Device.createComputePipeline({
	layout: 'auto',
	compute: { module: optimizeShaderModule, entryPoint: 'main' },
});

const organizePipeline = Device.createComputePipeline({
	layout: 'auto',
	compute: { module: organizeShaderModule, entryPoint: 'main' },
});

// --- Create Buffers for Rendering ---

// Assume we have tesseractCount tesseracts.
const TESSERACT_COUNT = 10000

// Buffer with tesseract positions (input to culling).
const opaquePositionsBuffer = Device.createBuffer({
	size: TESSERACT_COUNT * VECTOR4_SIZE,
	usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
})

const opaqueColorsBuffer = Device.createBuffer({
	size: TESSERACT_COUNT * VECTOR4_SIZE,
	usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
})

const opaqueVertexBuffer = Device.createBuffer({
	size: 4 * 144 * 2 * TESSERACT_COUNT, // u8 * indexCount * (index + instance) * tesseractCount
	usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
})

const transparentPositionsBuffer = Device.createBuffer({
	size: TESSERACT_COUNT * VECTOR4_SIZE,
	usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
})

const transparentColorsBuffer = Device.createBuffer({
	size: TESSERACT_COUNT * VECTOR4_SIZE,
	usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
})

const transparentVertexBuffer = Device.createBuffer({
	size: 4 * 144 * 2 * TESSERACT_COUNT, // u8 * indexCount * (index + instance) * tesseractCount
	usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
})

// PROJECTION5
const projection4Buffer = Device.createBuffer({
	size: 4 * 3,
	usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
})
{
	const FOV = Math.PI / 2
	const FAR = 20, NEAR = 1
	Device.queue.writeBuffer(projection4Buffer, 0, new Float32Array([FOV, FAR, NEAR]))
}

// PROJECTION4
const projection3Buffer = Device.createBuffer({
	size: 4 * 3,
	usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
})
{
	const FOV = Math.PI / 2
	const FAR = 20, NEAR = 0.1
	Device.queue.writeBuffer(projection3Buffer, 0, new Float32Array([FOV, FAR, NEAR]))
}

// (Other uniform buffers for camera matrices, projection, and tesseract_count)
// For brevity, we assume these are created and filled.
const camera4Buffer = Device.createBuffer({
	size: VECTOR4_SIZE * 5,
	usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
})

const camera3Buffer = Device.createBuffer({
	size: VECTOR3_SIZE * 4,
	usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
})

const drawIndirectBuffer = Device.createBuffer({
	size: 4 * 5,
	usage: GPUBufferUsage.INDIRECT | GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
})

const opaquePipeline = Device.createRenderPipeline({
	layout: 'auto',
	vertex: {
		module: Device.createShaderModule({ code: await (await fetch('RenderVertex.wgsl')).text() }),
		entryPoint: 'vertex_main',
		buffers: [
			{
				arrayStride: 8, // one vec4<f32>
				stepMode: 'vertex',
				attributes: [
					{ shaderLocation: 0, offset: 0, format: 'uint32x2' },
				],
			},
		],
	},
	fragment: {
		module: Device.createShaderModule({ code: await (await fetch('RenderFragment.wgsl')).text() }),
		entryPoint: 'fragment_main',
		targets: [{
			format: GPU.getPreferredCanvasFormat(), // or your swap chain format
		}],
	},
	primitive: {
		topology: 'triangle-list',
	},
});

const transparentPipeline = Device.createRenderPipeline({
	layout: 'auto',
	depthStencil: {
		format: "depth24plus",
		depthWriteEnabled: false, // <--- important for transparency
		depthCompare: "less",
	},
	vertex: {
		module: Device.createShaderModule({ code: await (await fetch('RenderVertex.wgsl')).text() }),
		entryPoint: 'vertex_main',
		buffers: [
			{
				arrayStride: 8,
				stepMode: 'vertex',
				attributes: [
					{ shaderLocation: 0, offset: 0, format: 'uint32x2' },
				],
			},
		],
	},
	fragment: {
		module: Device.createShaderModule({ code: await (await fetch('RenderFragment.wgsl')).text() }),
		entryPoint: 'fragment_main',
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
		topology: 'triangle-list',
	},
});

// --- Create Buffers For Culling ---

// Buffer for positions computed in the culling pass.
const positionsInfrontCam4Buffer = Device.createBuffer({
	size: TESSERACT_COUNT * VECTOR4_SIZE,
	usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
})

const positionsInfrontCam3Buffer = Device.createBuffer({
	size: TESSERACT_COUNT * VECTOR4_SIZE,
	usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
})

// Buffer for indices we reserve space for an atomic counter (first 4 bytes)
// plus tesseractCount u32 indices.
const indicesBufferSize = (1 + TESSERACT_COUNT) * 4
const indicesInViewBuffer = Device.createBuffer({
	size: indicesBufferSize,
	usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
})
// Initialize the atomic counter to 0 (you can do this via a buffer write).
Device.queue.writeBuffer(indicesInViewBuffer, 0, new Uint32Array([0]))

const tesseractCountBuffer = Device.createBuffer({
	size: 4,
	usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
})
Device.queue.writeBuffer(tesseractCountBuffer, 0, new Uint32Array([TESSERACT_COUNT]))

const cullBindGroup = Device.createBindGroup({
	layout: cullPipeline.getBindGroupLayout(0),
	entries: [
		{ binding: 0, resource: { buffer: camera4Buffer } },
		{ binding: 1, resource: { buffer: camera3Buffer } },
		{ binding: 2, resource: { buffer: projection4Buffer } },
		{ binding: 3, resource: { buffer: projection3Buffer } },
		{ binding: 4, resource: { buffer: tesseractCountBuffer } },
		{ binding: 5, resource: { buffer: transparentPositionsBuffer } },
		{ binding: 6, resource: { buffer: positionsInfrontCam4Buffer } },
		{ binding: 7, resource: { buffer: positionsInfrontCam3Buffer } },
		{ binding: 8, resource: { buffer: indicesInViewBuffer } },
	],
})

// --- Create Buffers For Bitonic Sorting ---

// We will sort the indices. For simplicity, we copy the indices (ignoring the atomic counter)
// into a separate buffer. In practice you may do this copy via a compute shader.
const sortedIndicesBuffer = Device.createBuffer({
	size: TESSERACT_COUNT * 4,
	usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
})

// Uniform buffer for bitonic sort parameters.
const bitonicUniformBuffer = Device.createBuffer({
	size: 12, // 3 u32 values
	usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
})

const bitonicBindGroup = Device.createBindGroup({
	layout: bitonicPipeline.getBindGroupLayout(0),
	entries: [
		{ binding: 0, resource: { buffer: bitonicUniformBuffer } },
		{ binding: 1, resource: { buffer: sortedIndicesBuffer } },
		{ binding: 2, resource: { buffer: positionsInfrontCam3Buffer } },
		{ binding: 3, resource: { buffer: indicesInViewBuffer } },
	],
})

// --- Create Buffers For Optimize Indices ---

const culledIndicesBuffer = Device.createBuffer({
	size: 4 * 145 * TESSERACT_COUNT,
	usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
})

// Create a new bind group for the optimization pass that re-uses the recycled buffers.
// Note: The binding numbers must match those in the shader.
const optimizeBindGroup = Device.createBindGroup({
	layout: optimizePipeline.getBindGroupLayout(0),
	entries: [
		{ binding: 0, resource: { buffer: transparentPositionsBuffer } },
		{ binding: 1, resource: { buffer: camera4Buffer } },
		{ binding: 2, resource: { buffer: indicesInViewBuffer } },
		{ binding: 3, resource: { buffer: culledIndicesBuffer } },
	],
});

// --- Create Buffers For Organize ---

const organizeBindGroup = Device.createBindGroup({
	layout: organizePipeline.getBindGroupLayout(0),
	entries: [
		{ binding: 0, resource: { buffer: culledIndicesBuffer } },
		{ binding: 1, resource: { buffer: transparentVertexBuffer } },
		{ binding: 2, resource: { buffer: drawIndirectBuffer } },
	],
});

/**
 * @param {Matrix5} camera5
 * @param {Matrix4} camera4
 * @param {{position: Vector4, color: RGBA}[]} tesseracts
 */
async function runPipeline(camera5, camera4, tesseracts) {
	// --- Populate Buffers ---

	// CAMERA5
	{
		const position = M5.getPosition4(camera5)
		const right = M5.getRight4(camera5)
		const up = M5.getUp4(camera5)
		const forward = M5.getForward4(camera5)
		const ana = M5.getAna4(camera5)
		Device.queue.writeBuffer(camera4Buffer, 0, new Float32Array([...position, ...right, ...up, ...forward, ...ana]))
	}

	// CAMERA4
	{
		const position = M4.getPosition3(camera4)
		const right = M4.getRight3(camera4)
		const up = M4.getUp3(camera4)
		const forward = M4.getForward3(camera4)
		Device.queue.writeBuffer(camera4Buffer, 0, new Float32Array([...position, ...right, ...up, ...forward]))
	}

	// TESSERACTS
	{
		/** @type {number[]} */
		const opaquePositions = []

		/** @type {number[]} */
		const opaqueColors = []

		/** @type {number[]} */
		const transparentPositions = []

		/** @type {number[]} */
		const transparentColors = []

		for (const tesseract of tesseracts) {
			const [r, g, b, a] = tesseract.color
			const [x, y, z, w] = tesseract.position
			const positions = a === 1 ? opaquePositions : transparentPositions
			const colors = a === 1 ? opaqueColors : transparentColors
			positions.push(x, y, z, w)
			colors.push(r, g, b, a)
		}

		Device.queue.writeBuffer(opaquePositionsBuffer, 0, new Float32Array(opaquePositions))
		Device.queue.writeBuffer(opaqueColorsBuffer, 0, new Float32Array(opaqueColors))
		Device.queue.writeBuffer(transparentPositionsBuffer, 0, new Float32Array(transparentPositions))
		Device.queue.writeBuffer(transparentColorsBuffer, 0, new Float32Array(transparentColors))
	}

	// --- Record Commands ---

	const commandEncoder = Device.createCommandEncoder()

	// (A) Dispatch the culling pass.
	{
		const passEncoder = commandEncoder.beginComputePass()
		passEncoder.setPipeline(cullPipeline)
		passEncoder.setBindGroup(0, cullBindGroup)
		const workgroupCount = Math.ceil(tesseracts.length / 64)
		passEncoder.dispatchWorkgroups(workgroupCount)
		passEncoder.end()
	}

	{
		// (B) Assume a copy pass that extracts the indices and clip positions from the culling pass.
		// In a real application, you could write a small compute shader or use copyBuffer commands.
		// For this example, we assume the sortedIndicesBuffer and positionsClipBuffer are now filled.
		// (A proper solution would issue additional dispatches to copy indices_in_view.buffer[1..] into sortedIndicesBuffer
		// and copy positions_infront_cam3Buffer into positionsClipBuffer.)

		// For demonstration, we’ll pretend that the number of indices n is known.
		// In practice, you might read back the atomic counter.
		const n = tesseracts.length
		const m = nextPowerOfTwo(n)

		// (C) Dispatch the bitonic sort passes.
		// We update the uniform for each stage (for k = 2, 4, 8, …, m)
		for (let k = 2; k <= m; k *= 2) {
			// Write the uniform data: [n, k, ascending]
			const uniformData = new Uint32Array([n, k, 1])
			Device.queue.writeBuffer(bitonicUniformBuffer, 0, uniformData.buffer)
			const passEncoder = commandEncoder.beginComputePass()
			passEncoder.setPipeline(bitonicPipeline)
			passEncoder.setBindGroup(0, bitonicBindGroup)
			const numWorkgroups = Math.ceil(m / 64)
			passEncoder.dispatchWorkgroups(numWorkgroups)
			passEncoder.end()
		}
	}

	{
		const passEncoder = commandEncoder.beginComputePass()
		passEncoder.setPipeline(optimizePipeline)
		passEncoder.setBindGroup(0, optimizeBindGroup)
		const workgroupCount = Math.ceil(tesseracts.length / 64)
		passEncoder.dispatchWorkgroups(workgroupCount)
		passEncoder.end()
	}

	{
		const passEncoder = commandEncoder.beginComputePass()
		passEncoder.setPipeline(organizePipeline)
		passEncoder.setBindGroup(0, organizeBindGroup)
		const workgroupCount = Math.ceil(tesseracts.length / 64)
		passEncoder.dispatchWorkgroups(workgroupCount)
		passEncoder.end()
	}

	{
		const passEncoder = commandEncoder.beginRenderPass({
			colorAttachments: [{
				view: C.getCurrentTexture().createView(),
				clearValue: { r: 0, g: 0, b: 0, a: 1 },
				loadOp: 'clear',
				storeOp: 'store',
			}],
		})
		passEncoder.setPipeline(transparentPipeline)
		passEncoder.setVertexBuffer(0, transparentVertexBuffer)
		passEncoder.drawIndirect(drawIndirectBuffer, 0)
		passEncoder.end()
	}

	// Submit all commands.
	Device.queue.submit([commandEncoder.finish()])

	// After submission, the sortedIndicesBuffer now holds the indices in sorted order (by depth).
	// Your subsequent render pass can use this buffer to draw transparent tesseracts in a single draw call.
}
