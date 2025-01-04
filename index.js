import * as M from "./JS/Math/Mat.js"
import * as Canvas from "./JS/Canvas.js"
import * as M5 from "./JS/Math/Mat5D.js"
import * as M4 from "./JS/Math/Mat4D.js"
import * as M3 from "./JS/Math/Mat3D.js"
import * as Vertices from "./JS/Vertices.js"
import * as Render from "./JS/Render.js"
import * as Spring from "./JS/Math/Spring.js"
import * as GameState from "./JS/GameState.js"
import * as Ui from "./JS/Ui.js"

const C = Canvas.c

// let CAMERA_5 = M.look_along_5([0, 0, 0, -10, 1], [0, 0, 0, 1, 1])
// const PROJECTION_5 = (() => {
// 	const FOV = Math.PI / 2
// 	const S = 1 / Math.tan(FOV / 2)
// 	const FAR = 20
// 	const NEAR = 10
// 	return [
// 		S, 0, 0, 0, 0,
// 		0, S, 0, 0, 0,
// 		0, 0, S, 0, 0,
// 		0, 0, 0, FAR / (FAR - NEAR), -1,
// 		0, 0, 0, FAR * NEAR / (NEAR - FAR), 0
// 	]
// })()

/**
 * 5×5 perspective for 4D -> "clip" with +W forward
 * @type {M.Matrix5}
*/
const PERSPECTIVE5 = (() => {
	const FOV = Math.PI / 2
	const FAR = 20, NEAR = 1
	const S = 1 / Math.tan(FOV / 2) // or just 1 if FOV=90

	// Choose a simple approach for w' = A*w + B*(1),
	// so near => w'=0, far => w' positive, etc.
	const A = FAR / (FAR - NEAR)         // ex: 20/10=2
	const B = FAR * NEAR / (NEAR - FAR) // ex: -200/10= -20

	return [
		S, 0, 0, 0, 0,
		0, S, 0, 0, 0,
		0, 0, S, 0, 0,
		0, 0, 0, A, 1,
		0, 0, 0, B, 0
	]
})()

/**
 * 4×4 perspective for 3D -> "clip" with +Z forward
 * @type {M.Matrix4}
*/
const PERSPECTIVE4 = (() => {
	const FOV = Math.PI / 2
	const FAR = 20, NEAR = 0.1
	const S = 1 / Math.tan(FOV / 2)

	// outZ= A*z + B*1, outW=z => near => z=1 => outZ=0 => clip-plane
	const A = FAR / (FAR - NEAR)         // 10/(9)=1.111...
	const B = FAR * NEAR / (NEAR - FAR) // -(10*1)/9= -1.111...

	return [
		S, 0, 0, 0,
		0, S, 0, 0,
		0, 0, A, 1,
		0, 0, B, 0,
	]
})()

/**
 * @type {M.Matrix4}
 */
const ORTHOGONAL4 = [
	1, 0, 0, 0,
	0, 1, 0, 0,
	Math.SQRT1_2, Math.SQRT1_2, 1, 0,
	0, 0, 0, 1,
]

/**
 * @type {M.Matrix5}
 */
const ORTHOGONAL5 = [
	1, 0, 0, 0, 0,
	0, 1, 0, 0, 0,
	0, 0, 1, 0, 0,
	Math.SQRT1_2, -Math.SQRT1_2, 0, 1, 0,
	0, 0, 0, 0, 1
]

let PROJECT_4D_TO_3D, PROJECT_3D_TO_2D
let CAMERA5, CAMERA4
let CAMERA5_INVERSE, CAMERA4_INVERSE

function render_filled_tesseract(position4, color) {
	const TRANSLATE = M5.translate(position4)
	const TESSERACT_INDICES = Vertices.TESSERACT_QUAD_INDICES
	const TESSERACT_VERTICES = M5.mul_5x5_5xn(TRANSLATE, Vertices.TESSERACT_VERTICES5)
	const SHOWING_INDICES = Vertices.filter_cell_indices(TESSERACT_INDICES, TRANSLATE, CAMERA5_INVERSE)
	const VERTICES_5D = M5.mul_5x5_5xn(PROJECT_4D_TO_3D, TESSERACT_VERTICES)
	const VERTICES_4D = M4.mul_4x4_4xn(PROJECT_3D_TO_2D, M5.trim_5xn_4xn(VERTICES_5D))
	const VERTICES_3D = M4.trim_4xn_3xn(VERTICES_4D)
	const sortedIndices = Vertices.sort_indices_by_depth(SHOWING_INDICES, VERTICES_3D)
	Render.render_tesseract_quads_perspective(VERTICES_3D, sortedIndices, color)
}

/**
 * @param {M.Vector4} position4
 */
function draw_axes4(position4, axisLength = 1) {
	const [x, y, z, w] = position4

	const AXIS_VERTICES = [
		x + 0, y + 0, z + 0, w + 0, 1,

		x + axisLength, y + 0, z + 0, w + 0, 1,
		x + 0, y + axisLength, z + 0, w + 0, 1,
		x + 0, y + 0, z + axisLength, w + 0, 1,
		x + 0, y + 0, z + 0, w + axisLength, 1,

		x + axisLength, y + 0.1, z + 0, w + 0, 1,
		x + axisLength, y + 0, z + 0.1, w + 0, 1,
		x + axisLength, y + 0, z + 0, w + 0.1, 1,

		x + 0.1, y + axisLength, z + 0, w + 0, 1,
		x + 0, y + axisLength, z + 0.1, w + 0, 1,
		x + 0, y + axisLength, z + 0, w + 0.1, 1,

		x + 0.1, y + 0, z + axisLength, w + 0, 1,
		x + 0, y + 0.1, z + axisLength, w + 0, 1,
		x + 0, y + 0, z + axisLength, w + 0.1, 1,

		x + 0.1, y + 0, z + 0, w + axisLength, 1,
		x + 0, y + 0.1, z + 0, w + axisLength, 1,
		x + 0, y + 0, z + 0.1, w + axisLength, 1,
	]

	const AXIS_INDICES = [
		0, 1,
		0, 2,
		0, 3,
		0, 4,

		1, 5,
		1, 6,
		1, 7,

		2, 8,
		2, 9,
		2, 10,

		3, 11,
		3, 12,
		3, 13,
	]

	const AXIS_LINE_COLORS = [
		"#F00",
		"#0F0",
		"#00F",
		"#FF0",

		"#0F0",
		"#00F",
		"#FF0",

		"#F00",
		"#00F",
		"#FF0",

		"#F00",
		"#0F0",
		"#FF0",

		"#F00",
		"#0F0",
		"#00F",
	]

	const axes4d = M5.trim_5xn_4xn(M5.mul_5x5_5xn(PROJECT_4D_TO_3D, AXIS_VERTICES))
	const axes3d = M4.trim_4xn_3xn(M4.mul_4x4_4xn(PROJECT_3D_TO_2D, axes4d))
	const sortedIndices = Vertices.sort_indices_by_depth(AXIS_INDICES, axes3d)
	Render.render_lines(axes3d, sortedIndices, AXIS_LINE_COLORS)

	if (Ui.renderCoordinateLabels) {
		Render.render_spatial_text("X", [axes3d[3], axes3d[4], axes3d[5]], 24, "#F00", "center", "bottom")
		Render.render_spatial_text("Y", [axes3d[6], axes3d[7], axes3d[8]], 24, "#0F0", "center", "bottom")
		Render.render_spatial_text("Z", [axes3d[9], axes3d[10], axes3d[11]], 24, "#00F", "center", "bottom")
		Render.render_spatial_text("W", [axes3d[12], axes3d[13], axes3d[14]], 24, "#FF0", "center", "bottom")
	}
}

let t = 0
/**
 * @param {number} dt
 */
function frame(dt) {
	{
		const distance4d = -GameState.distance4.position
		if (GameState.use_hopf_coordinates) {
			const etaPosition = GameState.eta.position
			CAMERA5 = M5.lookAt([
				distance4d * Math.cos(GameState.zeta1) * Math.sin(etaPosition),
				distance4d * Math.sin(GameState.zeta1) * Math.sin(etaPosition),
				distance4d * Math.cos(GameState.zeta2) * Math.cos(etaPosition),
				distance4d * Math.sin(GameState.zeta2) * Math.cos(etaPosition),
			], M4.ZERO)
		} else {
			CAMERA5 = M5.mul_5x5s(
				M5.translate(GameState.focus4.position),
				M5.rotate_xy(GameState.xy4.position),
				M5.rotate_yz(GameState.yz4.position),
				M5.rotate_zx(GameState.zx4.position),
				M5.rotate_wz(GameState.wz4.position),
				M5.rotate_wy(GameState.wy4.position),
				M5.rotate_wx(GameState.wx4.position),
				M5.lookAt([distance4d, distance4d, distance4d, distance4d], M4.ZERO)
			)
		}

		const distance3d = GameState.distance3.position
		CAMERA4 = M4.mul_4x4s(
			M4.rotate_xy(GameState.xy3.position),
			M4.rotate_yz(GameState.yz3.position),
			M4.lookAt([0, 0, distance3d], M3.ZERO)
		)

		CAMERA5_INVERSE = M5.inverse(CAMERA5)
		CAMERA4_INVERSE = M4.inverse(CAMERA4)

		PROJECT_3D_TO_2D = M4.mul_4x4(GameState.currentProjection4 == GameState.CURRENT_PROJECTION_PERSPECTIVE ? PERSPECTIVE4 : ORTHOGONAL4, CAMERA4_INVERSE)
		PROJECT_4D_TO_3D = M5.mul_5x5(GameState.currentProjection5 == GameState.CURRENT_PROJECTION_PERSPECTIVE ? PERSPECTIVE5 : ORTHOGONAL5, CAMERA5_INVERSE)
	}

	if (Ui.renderOriginAxes) {
		const AXIS_LENGTH = 1
		const AXIS_VERTICES = [
			0, 0, 0, 1,

			AXIS_LENGTH, 0, 0, 1,
			AXIS_LENGTH, 0.1, 0, 1,
			AXIS_LENGTH, 0, 0.1, 1,

			0, AXIS_LENGTH, 0, 1,
			0.1, AXIS_LENGTH, 0, 1,
			0, AXIS_LENGTH, 0.1, 1,

			0, 0, AXIS_LENGTH, 1,
			0.1, 0, AXIS_LENGTH, 1,
			0, 0.1, AXIS_LENGTH, 1,
		]

		const AXIS_INDICES = [
			0, 1,
			1, 2,
			1, 3,

			0, 4,
			4, 5,
			4, 6,

			0, 7,
			7, 8,
			7, 9,
		]

		const AXIS_LINE_COLORS = [
			"#F00",
			"#F00",
			"#F00",
			"#0F0",
			"#0F0",
			"#0F0",
			"#00F",
			"#00F",
			"#00F",
		]

		const projectedAxes = M4.trim_4xn_3xn(M4.mul_4x4_4xns(PROJECT_3D_TO_2D, M4.translate([-1, -1, 0]), AXIS_VERTICES))
		const sortedIndices = Vertices.sort_indices_by_depth(AXIS_INDICES, projectedAxes)
		Render.render_lines(projectedAxes, sortedIndices, AXIS_LINE_COLORS)

		draw_axes4(M4.ZERO, 1)
	}


	if (Ui.render4DCursor) {
		const AXIS_VERTICES = [
			+0.5, +0, +0, +0, 1,
			-0.5, +0, +0, +0, 1,

			+0, +0.5, +0, +0, 1,
			+0, -0.5, +0, +0, 1,

			+0, +0, +0.5, +0, 1,
			+0, +0, -0.5, +0, 1,

			+0, +0, +0, +0.5, 1,
			+0, +0, +0, -0.5, 1,
		]

		const AXIS_INDICES = [
			0, 1,
			2, 3,
			4, 5,
			6, 7,
		]

		const LINE_COLORS = [
			"#F99",
			"#9F9",
			"#99F",
			"#FF9",
		]

		const axes4d = M5.trim_5xn_4xn(M5.mul_5x5_5xns(PROJECT_4D_TO_3D, M5.translate(GameState.focus4.target), AXIS_VERTICES))
		const axes3d = M4.trim_4xn_3xn(M4.mul_4x4_4xn(PROJECT_3D_TO_2D, axes4d))
		const sortedIndices = Vertices.sort_indices_by_depth(AXIS_INDICES, axes3d)
		Render.render_lines(axes3d, sortedIndices, LINE_COLORS)
	} else {
		draw_axes4(GameState.focus4.target, 10)
	}

	// TODO: We have reached the point where individual pixels need to be Z-indexed, which is currently not possible with Canvas.
	// This means we need to properly move to using WebGPU now, which means the giant rewrite we were trying to avoid is here.
	// That said, it will be nice to finally get it out of the way, but this will take the entire weekend or longer since we are newbies.
	for (const [hash, data] of GameState.hypervoxels) {
		render_filled_tesseract(data.position, data.color)
	}

	if (Ui.renderUi) {
		Ui.renderAll()
	}

	t += dt
}

const LOOP = true

let delta_time = 1 / 60
if (LOOP) {
	let last_time = performance.now()
	function game_loop() {
		// console.clear()

		Canvas.update(Canvas.DEFAULT_COLOR)

		frame(delta_time)
		Spring.updateAllSprings(delta_time)

		const now_time = performance.now()
		delta_time = (now_time - last_time) / 1000.0
		last_time = now_time

		window.requestAnimationFrame(game_loop)
	}
	window.requestAnimationFrame(game_loop)
} else {
	// console.clear()
	Canvas.update("#111122")
	frame(delta_time)
}

// let lastMouse = [0, 0]

// let dragging = false
// document.addEventListener('mousedown', e => {
// 	dragging = true
// })
// document.addEventListener('mouseup', e => {
// 	dragging = false
// })

// const KEYS_DOWN = new Set()

// let shiftedAlready = false
// let zAlready = false
// document.addEventListener('keydown', e => {
// 	if (e.code == "KeyZ") {
// 		if (!zAlready) {
// 			zAlready = true
// 			GameState.currentCamera = GameState.currentCamera == GameState.CURRENT_CAMERA_4 ? GameState.CURRENT_CAMERA_5 : GameState.CURRENT_CAMERA_4
// 			SUCCESS_SOUND.play()
// 			cameraDisplaySizeSpring.velocity = 50

// 			if (shiftedAlready && currentCamera == CURRENT_CAMERA_4) {
// 				CLICK_SOUNDS[0].play()
// 			}

// 			if (shiftedAlready && currentCamera == CURRENT_CAMERA_5) {
// 				shiftedAlready = true
// 				CLICK_SOUNDS[0].play()
// 			}
// 		}
// 	} else if (e.code == "KeyH") {
// 		use_hopf_coordinates = !use_hopf_coordinates
// 	} else if (e.code == "KeyD") {
// 		focus4.target = M4.add(focus4.target, [1, 0, 0, 0])
// 		playRandomSoundFrom(MOVE_SOUNDS)
// 	} else if (e.code == "KeyA") {
// 		focus4.target = M4.add(focus4.target, [-1, 0, 0, 0])
// 		playRandomSoundFrom(MOVE_SOUNDS)
// 	} else if (e.code == "KeyW") {
// 		focus4.target = M4.add(focus4.target, [0, 1, 0, 0])
// 		playRandomSoundFrom(MOVE_SOUNDS)
// 	} else if (e.code == "KeyS") {
// 		focus4.target = M4.add(focus4.target, [0, -1, 0, 0])
// 		playRandomSoundFrom(MOVE_SOUNDS)
// 	} else if (e.code == "KeyE") {
// 		focus4.target = M4.add(focus4.target, [0, 0, 1, 0])
// 		playRandomSoundFrom(MOVE_SOUNDS)
// 	} else if (e.code == "KeyQ") {
// 		focus4.target = M4.add(focus4.target, [0, 0, -1, 0])
// 		playRandomSoundFrom(MOVE_SOUNDS)
// 	} else if (e.code == "KeyR") {
// 		focus4.target = M4.add(focus4.target, [0, 0, 0, 1])
// 		playRandomSoundFrom(MOVE_SOUNDS)
// 	} else if (e.code == "KeyF") {
// 		focus4.target = M4.add(focus4.target, [0, 0, 0, -1])
// 		playRandomSoundFrom(MOVE_SOUNDS)
// 		// } else if (e.code == "KeyT") {
// 		// 	currentProjection5 = currentProjection5 == CURRENT_PROJECTION_PERSPECTIVE ? CURRENT_PROJECTION_ORTHOGONAL : CURRENT_PROJECTION_PERSPECTIVE
// 		// } else if (e.code == "KeyG") {
// 		// 	currentProjection4 = currentProjection4 == CURRENT_PROJECTION_PERSPECTIVE ? CURRENT_PROJECTION_ORTHOGONAL : CURRENT_PROJECTION_PERSPECTIVE
// 	} else if (e.code == "ArrowUp") {
// 		const offset = -1
// 		const DISTANCE = 1.1
// 		distance4.target *= DISTANCE ** offset

// 		if (!ZOOM_SOUND.audio.loop) {
// 			ZOOM_SOUND.audio.loop = true
// 			ZOOM_SOUND.play()
// 		}
// 	} else if (e.code == "ArrowDown") {
// 		const offset = 1
// 		const DISTANCE = 1.1
// 		distance4.target *= DISTANCE ** offset

// 		if (!ZOOM_SOUND.audio.loop) {
// 			ZOOM_SOUND.audio.loop = true
// 			ZOOM_SOUND.play()
// 		}
// 	} else if (e.code == "Space") {
// 		const hash = focus4.target.toString()
// 		if (hypervoxels.has(hash)) {
// 			hypervoxels.delete(hash)
// 		} else {
// 			hypervoxels.set(hash, focus4.target)
// 		}
// 		CLICK_SOUNDS[1].play()
// 	} else if (e.code == "ControlLeft") {
// 		xy4.target = 0
// 		yz4.target = 0
// 		zx4.target = 0
// 		wx4.target = 0
// 		wy4.target = 0
// 		wz4.target = 0

// 		distance4.target = 2

// 		zeta1 = 0
// 		zeta2 = 0
// 		eta.target = Math.PI / 4

// 		playRandomSoundFrom(RESET_MOVE_SOUNDS)
// 	} else if (e.code == "ControlRight") {
// 		focus4.target = M4.ZERO
// 		playRandomSoundFrom(RESET_MOVE_SOUNDS)
// 	} else if (e.code == "ShiftLeft") {
// 		if (!shiftedAlready) {
// 			shiftedAlready = true

// 			if (currentCamera == CURRENT_CAMERA_5)
// 				CLICK_SOUNDS[0].play()
// 		}
// 	} else if (e.code == "Digit9") {
// 		const snapshot = {
// 			xy4: xy4.target,
// 			yz4: yz4.target,
// 			zx4: zx4.target,
// 			wx4: wx4.target,
// 			wy4: wy4.target,
// 			wz4: wz4.target,

// 			focus4: focus4.target,
// 			distance4: distance4.target,

// 			zeta1,
// 			zeta2,
// 			eta: eta.target,

// 			hypervoxels: Array.from(hypervoxels.values()),
// 		}

// 		const link = document.createElement("a");
// 		const file = new Blob([JSON.stringify(snapshot)], { type: "application/json" });
// 		link.href = URL.createObjectURL(file);
// 		link.download = "hypervoxel_build.json";
// 		link.click();
// 		URL.revokeObjectURL(link.href);
// 	} else if (e.code == "Digit0") {
// 		let input = document.createElement("input");
// 		input.type = "file";
// 		input.multiple = false;
// 		input.accept = "application/json";

// 		input.onchange = e => {
// 			// getting a hold of the file reference
// 			const file = input.files[0];

// 			// setting up the reader
// 			const reader = new FileReader();
// 			// here we tell the reader what to do when it's done reading...
// 			reader.onload = readerEvent => {
// 				const json = readerEvent.target.result; // this is the content!
// 				if (typeof(json) !== "string")
// 					throw new Error("Expected JSON")

// 				const snapshot = JSON.parse(json)

// 				xy4.target = snapshot.xy4
// 				yz4.target = snapshot.yz4
// 				zx4.target = snapshot.zx4
// 				wx4.target = snapshot.wx4
// 				wy4.target = snapshot.wy4
// 				wz4.target = snapshot.wz4

// 				focus4.target = snapshot.focus4
// 				distance4.target = snapshot.distance4

// 				zeta1 = snapshot.zeta1
// 				zeta2 = snapshot.zeta2
// 				eta.target = snapshot.eta

// 				hypervoxels.clear()
// 				for (let i in snapshot.hypervoxels) {
// 					const position = snapshot.hypervoxels[i]
// 					hypervoxels.set(position.toString(), position)
// 				}
// 			}
// 			reader.readAsText(file, 'UTF-8');
// 		}
// 		input.click();
// 	}

// 	KEYS_DOWN.add(e.code)
// })

// document.addEventListener('keyup', e => {
// 	ZOOM_SOUND.audio.loop = false

// 	if (e.code == "KeyZ") {
// 		zAlready = false
// 	} else if (e.code == "ShiftLeft") {
// 		shiftedAlready = false

// 		if (currentCamera == CURRENT_CAMERA_5)
// 			CLICK_SOUNDS[0].play()
// 	}

// 	KEYS_DOWN.delete(e.code)
// })

// document.addEventListener('mousemove', e => {
// 	const newX = (e.offsetX - Canvas.cw / 2)
// 	const newY = (e.offsetY - Canvas.ch / 2)

// 	const dx = newX - lastMouse[0]
// 	const dy = newY - lastMouse[1]

// 	lastMouse[0] = mouse[0]
// 	lastMouse[1] = mouse[1]

// 	mouse[0] = newX
// 	mouse[1] = newY

// 	if (dragging) {
// 		const SPEED = 1
// 		if (currentCamera == CURRENT_CAMERA_4) {
// 			xy3.target += SPEED * dx / Canvas.min
// 			yz3.target += SPEED * -dy / Canvas.min

// 			// xy3.target %= 2 * Math.PI
// 			yz3.target = Math.max(Math.min(yz3.target, Math.PI), 0)
// 		} else {
// 			if (KEYS_DOWN.has("ShiftLeft")) {
// 				wx4.target += SPEED * dx / Canvas.min
// 				wy4.target += SPEED * -dy / Canvas.min
// 				// wx4.target %= 2 * Math.PI
// 				// wy4.target %= 2 * Math.PI
// 			} else {
// 				xy4.target += SPEED * dx / Canvas.min
// 				yz4.target -= SPEED * -dy / Canvas.min
// 				// xy4.target %= 2 * Math.PI
// 				// yz4.target %= 2 * Math.PI
// 			}

// 			zeta1 += SPEED * dx / Canvas.min
// 			zeta2 += SPEED * -dy / Canvas.min
// 			// zeta1 %= 2 * Math.PI
// 			// zeta2 %= 2 * Math.PI
// 		}
// 	}
// })

// document.addEventListener('wheel', e => {
// 	const offset = Math.sign(e.deltaY)

// 	if (currentCamera == CURRENT_CAMERA_4) {
// 		const DISTANCE = 1.1
// 		distance3.target *= DISTANCE ** offset
// 	} else {
// 		const SPEED1 = Math.PI / 16
// 		if (KEYS_DOWN.has("ShiftLeft")) {
// 			wz4.target += SPEED1 * offset
// 			// wz4.target = Math.max(Math.min(wz4.target, Math.PI), 0)
// 		} else {
// 			zx4.target += SPEED1 * offset
// 			// zx4.target = Math.max(Math.min(zx4.target, Math.PI), 0)
// 		}

// 		const SPEED2 = Math.PI / 32
// 		eta.target += SPEED2 * offset
// 		eta.target = Math.max(Math.min(eta.target, Math.PI / 2), 0)
// 	}
// })

// document.addEventListener('mousedown', e => {
// 	Canvas.canvas.style.cursor = "all-scroll"
// })

// document.addEventListener('mouseup', e => {
// 	Canvas.canvas.style.cursor = "default"
// })