import * as Canvas from "./Canvas.js"
import * as M5 from "./Math/Mat5D.js"
import * as M4 from "./Math/Mat4D.js"

const Device = Canvas.device

export const TESSERACT_QUAD_INDICES = new Uint8Array([
	// -X Normal Cell
	1, 9, 13, 5,
	3, 7, 15, 11,
	9, 11, 15, 13,
	3, 1, 5, 7,
	7, 5, 13, 15,
	1, 3, 11, 9,

	// X Normal Cell
	0, 8, 12, 4,
	2, 6, 14, 10,
	8, 10, 14, 12,
	2, 0, 4, 6,
	6, 4, 12, 14,
	0, 2, 10, 8,

	// -Y Normal Cell
	6, 2, 10, 14,
	3, 7, 15, 11,
	10, 11, 15, 14,
	3, 2, 6, 7,
	7, 6, 14, 15,
	2, 3, 11, 10,

	// Y Normal Cell
	4, 0, 8, 12,
	1, 5, 13, 9,
	8, 9, 13, 12,
	1, 0, 4, 5,
	5, 4, 12, 13,
	0, 1, 9, 8,

	// -Z Normal Cell
	4, 5, 7, 6,
	13, 12, 14, 15,
	5, 4, 12, 13,
	6, 7, 15, 14,
	7, 5, 13, 15,
	4, 6, 14, 12,

	// Z Normal Cell
	0, 1, 3, 2,
	9, 8, 10, 11,
	1, 0, 8, 9,
	2, 3, 11, 10,
	3, 1, 9, 11,
	0, 2, 10, 8,

	// -W Normal Cell
	9, 8, 10, 11,
	12, 13, 15, 14,
	9, 11, 15, 13,
	10, 8, 12, 14,
	8, 9, 13, 12,
	11, 10, 14, 15,

	// W Normal Cell
	1, 0, 2, 3,
	4, 5, 7, 6,
	0, 1, 5, 4,
	3, 2, 6, 7,
	1, 3, 7, 5,
	2, 0, 4, 6,
])

export const TESSERACT_QUAD_INDEXBUFFER = Device.createBuffer({
	size: TESSERACT_QUAD_INDICES.byteLength,
	usage: GPUBufferUsage.INDEX,
	mappedAtCreation: true,
})
new Uint8Array(TESSERACT_QUAD_INDEXBUFFER.getMappedRange()).set(TESSERACT_QUAD_INDICES)
TESSERACT_QUAD_INDEXBUFFER.unmap()

const TESSERACT_CELL_NORMALS = [
	-1, 0, 0, 0, 1,
	1, 0, 0, 0, 1,
	0, -1, 0, 0, 1,
	0, 1, 0, 0, 1,
	0, 0, -1, 0, 1,
	0, 0, 1, 0, 1,
	0, 0, 0, -1, 1,
	0, 0, 0, 1, 1,
]

export const TESSERACT_WIREFRAME_INDICES = new Uint8Array([
	0, 1,
	1, 3,
	3, 2,
	2, 0,

	0, 4,
	1, 5,
	3, 7,
	2, 6,

	4, 5,
	5, 7,
	7, 6,
	6, 4,

	0, 8,
	1, 9,
	3, 11,
	2, 10,

	8, 9,
	9, 12,
	11, 10,
	10, 8,

	8, 12,
	9, 13,
	11, 15,
	10, 14,

	12, 13,
	13, 15,
	15, 14,
	14, 12,
])
export const TESSERACT_WIREFRAME_INDEXBUFFER = Device.createBuffer({
	size: TESSERACT_WIREFRAME_INDICES.byteLength,
	usage: GPUBufferUsage.INDEX,
	mappedAtCreation: true,
})
new Uint8Array(TESSERACT_WIREFRAME_INDEXBUFFER.getMappedRange()).set(TESSERACT_WIREFRAME_INDICES)
TESSERACT_WIREFRAME_INDEXBUFFER.unmap()

/**
 * Intentionally left as 0 and 1 to easily store as
 */
export const TESSERACT_VERTICES4 = [
	// Each vertex is defined by (x, y, z, w, 1) with all combinations of 0 and 1 for each dimension.
	0, 0, 0, 0,
	1, 0, 0, 0,
	0, 1, 0, 0,
	1, 1, 0, 0,
	0, 0, 1, 0,
	1, 0, 1, 0,
	0, 1, 1, 0,
	1, 1, 1, 0,
	0, 0, 0, 1,
	1, 0, 0, 1,
	0, 1, 0, 1,
	1, 1, 0, 1,
	0, 0, 1, 1,
	1, 0, 1, 1,
	0, 1, 1, 1,
	1, 1, 1, 1,
]

// export function filter_quad_indices(direction) {
// 	const visible = tesseract_visible_cells(direction)

// 	const indices = Array(96)

// 	for (let normal_i = 0; normal_i < 8; normal_i++) {
// 		const cell_i = visible[normal_i] * 24
// 		indices.push(
// 			TESSERACT_QUAD_INDICES[cell_i + 0],
// 			TESSERACT_QUAD_INDICES[cell_i + 1],
// 			TESSERACT_QUAD_INDICES[cell_i + 2],
// 			TESSERACT_QUAD_INDICES[cell_i + 3],
// 			TESSERACT_QUAD_INDICES[cell_i + 4],
// 			TESSERACT_QUAD_INDICES[cell_i + 5],
// 			TESSERACT_QUAD_INDICES[cell_i + 6],
// 			TESSERACT_QUAD_INDICES[cell_i + 7],
// 			TESSERACT_QUAD_INDICES[cell_i + 8],
// 			TESSERACT_QUAD_INDICES[cell_i + 9],
// 			TESSERACT_QUAD_INDICES[cell_i + 10],
// 			TESSERACT_QUAD_INDICES[cell_i + 11],
// 			TESSERACT_QUAD_INDICES[cell_i + 12],
// 			TESSERACT_QUAD_INDICES[cell_i + 13],
// 			TESSERACT_QUAD_INDICES[cell_i + 14],
// 			TESSERACT_QUAD_INDICES[cell_i + 15],
// 			TESSERACT_QUAD_INDICES[cell_i + 16],
// 			TESSERACT_QUAD_INDICES[cell_i + 17],
// 			TESSERACT_QUAD_INDICES[cell_i + 18],
// 			TESSERACT_QUAD_INDICES[cell_i + 19],
// 			TESSERACT_QUAD_INDICES[cell_i + 20],
// 			TESSERACT_QUAD_INDICES[cell_i + 21],
// 			TESSERACT_QUAD_INDICES[cell_i + 22],
// 			TESSERACT_QUAD_INDICES[cell_i + 23],
// 		)
// 	}

// 	return indices
// }

export const QUAD_VERTEX_COLORS = [
	// Each vertex is defined by (x, y, z, w) with all combinations of 0 and 1 for each dimension.
	'#0008',
	'#F008',
	'#0F08',
	'#FF08',
	'#00F8',
	'#F0F8',
	'#0FF8',
	'#FFF8',
	'#000F',
	'#F00F',
	'#0F0F',
	'#FF0F',
	'#00FF',
	'#F0FF',
	'#0FFF',
	'#FFFF',
]

export const WIREFRAME_LINE_COLORS = [
	// Each vertex is defined by (x, y, z, w) with all combinations of 0 and 1 for each dimension.
	'#0008',
	'#F008',
	'#0F08',
	'#FF08',
	'#00F8',
	'#F0F8',
	'#0FF8',
	'#FFF8',
	'#000F',
	'#F00F',
	'#0F0F',
	'#FF0F',
	'#00FF',
	'#F0FF',
	'#0FFF',
	'#FFFF',
]

// export function plane(subdivisions, xcolor, ycolor) {
// 	const CORNER_MIN = -1
// 	const CORNER_MAX = 1

// 	const vertices = []
// 	const indices = []
// 	const colors = []
// 	for (let i = 0; i <= subdivisions; i++) {
// 		const alpha = CORNER_MIN + (CORNER_MAX - CORNER_MIN) * i / subdivisions

// 		const j = 20 * i

// 		vertices[j + 0] = alpha
// 		vertices[j + 1] = CORNER_MIN
// 		vertices[j + 2] = 0
// 		vertices[j + 3] = 0
// 		vertices[j + 4] = 0

// 		vertices[j + 5] = alpha
// 		vertices[j + 6] = CORNER_MAX
// 		vertices[j + 7] = 0
// 		vertices[j + 8] = 0
// 		vertices[j + 9] = 0

// 		vertices[j + 10] = CORNER_MIN
// 		vertices[j + 11] = alpha
// 		vertices[j + 12] = 0
// 		vertices[j + 13] = 0
// 		vertices[j + 14] = 0

// 		vertices[j + 15] = CORNER_MAX
// 		vertices[j + 16] = alpha
// 		vertices[j + 17] = 0
// 		vertices[j + 18] = 0
// 		vertices[j + 19] = 0

// 		const k = 4 * i

// 		indices[k + 0] = i + 0
// 		indices[k + 1] = i + 1
// 		indices[k + 2] = i + 2
// 		indices[k + 3] = i + 3

// 		const l = 2 * i

// 		colors[l + 0] = xcolor
// 		colors[l + 1] = ycolor
// 	}


// 	return [vertices, indices, colors]
// }


// export function sort_indices_by_depth(indices, vertices3) {
// 	const pairs = Array(indices.length / 2)
// 	for (let i = 0; i < pairs.length; i++) {
// 		pairs[i] = [
// 			indices[2 * i + 0],
// 			indices[2 * i + 1],
// 		]
// 	}

// 	pairs.filter(x => {
// 		return vertices3[x[0] + 2] > 0 || vertices3[x[1] + 2] > 0
// 	})

// 	pairs.sort((a, b) => {
// 		return Math.min(vertices3[a[0] + 2], vertices3[a[1] + 2]) < Math.min(vertices3[b[0] + 2], vertices3[b[1] + 2])
// 	})

// 	const sorted = Array(indices.length)
// 	for (let i = 0; i < pairs.length; i++) {
// 		sorted[2 * i + 0] = pairs[i][0]
// 		sorted[2 * i + 1] = pairs[i][1]
// 	}

// 	return sorted
// }

// function get_normal(v1, v2, v3) {
// 	const [v_11, v_12, v_13, v_14] = v1
// 	const [v_21, v_22, v_23, v_24] = v2
// 	const [v_31, v_32, v_33, v_34] = v3

// 	return [
// 		-v_14*v_23*v_32+v_13*v_24*v_32+v_14*v_22*v_33-v_12*v_24*v_33-v_13*v_22*v_34+v_12*v_23*v_34,
// 		-(-v_14*v_23*v_31+v_13*v_24*v_31+v_14*v_21*v_33-v_11*v_24*v_33-v_13*v_21*v_34+v_11*v_23*v_34),
// 		-v_14*v_22*v_31+v_12*v_24*v_31+v_14*v_21*v_32-v_11*v_24*v_32-v_12*v_21*v_34+v_11*v_22*v_34,
// 		-(-v_13*v_22*v_31+v_12*v_23*v_31+v_13*v_21*v_32-v_11*v_23*v_32-v_12*v_21*v_33+v_11*v_22*v_33),
// 	]
// }

// export function filter_cell_indices(indices, transform5, camera_inverse) {
// 	const worldspace_normals = M5.mul_5x5_5xns(camera_inverse, transform5, TESSERACT_CELL_NORMALS)
// 	const look = [0, 0, 0, -1]

// 	const filtered_cell_indices = []

// 	for (let i = 0; i < indices.length / 24; i++) {
// 		const n = 5 * i
// 		const normal = [
// 			worldspace_normals[n + 0],
// 			worldspace_normals[n + 1],
// 			worldspace_normals[n + 2],
// 			worldspace_normals[n + 3],
// 		]

// 		if (M4.dot(look, normal) <= 0) {
// 			const j = 24 * i
// 			filtered_cell_indices.push(
// 				indices[j + 0],
// 				indices[j + 1],
// 				indices[j + 2],
// 				indices[j + 3],
// 				indices[j + 4],
// 				indices[j + 5],
// 				indices[j + 6],
// 				indices[j + 7],
// 				indices[j + 8],
// 				indices[j + 9],
// 				indices[j + 10],
// 				indices[j + 11],
// 				indices[j + 12],
// 				indices[j + 13],
// 				indices[j + 14],
// 				indices[j + 15],
// 				indices[j + 16],
// 				indices[j + 17],
// 				indices[j + 18],
// 				indices[j + 19],
// 				indices[j + 20],
// 				indices[j + 21],
// 				indices[j + 22],
// 				indices[j + 23],
// 			)
// 		}
// 	}
// 	return filtered_cell_indices
// }