import * as Canvas from "./Canvas.js"
import * as Spring from "./Math/Spring.js"
import * as Sound from "./Sound.js"
import * as Input from "./Input.js"
import * as GameState from "./GameState.js"

const C = Canvas.c

export let cameraDisplaySizeSpring = Spring.create(0, 10, 0.5)

export let renderOriginAxes = true
export let render4DCursor = true
export let renderCoordinateLabels = false
export let renderUi = true

export const UI_SLIDER = 0

const TAU = 2 * Math.PI

/**
 * @typedef {UI_SLIDER} GuiType
 * @typedef {{
* 	minX: number,
* 	minY: number,
* 	maxX: number,
* 	maxY: number,
* 	alpha: number,
* 	width: number,
* 	diameter: number,
* 	stroke: number,
* 	steps: number,
* 	color: ((alpha: number) => string),
*   guitype: GuiType,
* }} Slider
 */

const gui = {
	/** @type {Slider[]} */
	sliders: [],
}

/**
 * @param {{
* 	minX: number,
* 	minY: number,
* 	maxX: number,
* 	maxY: number,
* 	alpha: number,
* 	width: number,
* 	diameter: number,
* 	stroke: number,
* 	steps: number,
* 	color: ((alpha: number) => string),
* }} slider
* @return {Slider}
*/
function new_slider(slider) {
	let newSlider = /** @type {any} */ (slider)
	newSlider.guitype = UI_SLIDER
	gui.sliders.push(newSlider)
	round_slider_alpha(newSlider)
	return newSlider
}

/**
 * @param {Slider} slider
 */
function remove_slider(slider) {
	const i = gui.sliders.lastIndexOf(slider)
	if (i === -1) return

	const j = gui.sliders.length
	gui.sliders[i] = gui.sliders[j]
	gui.sliders.pop()
}

const hueSteps = 15
const hueScale = 360 * (hueSteps - 1) / hueSteps
let sliderHue = 0
export const hue_slider = new_slider({
	minX: -Canvas.uw * 45,
	minY: Canvas.uh * 20,
	maxX: -Canvas.uw * 45,
	maxY: Canvas.uh * -20,
	alpha: 0,
	width: Canvas.umin * 2,
	diameter: Canvas.umin * 3,
	stroke: 2,
	steps: hueSteps,
	color: a => { return `hsl(${hueScale * a}, 50%, 50%)` }
})

let sliderSaturation = 0
export const saturation_slider = new_slider({
	minX: -Canvas.uw * 42.5,
	minY: Canvas.uh * 20,
	maxX: -Canvas.uw * 42.5,
	maxY: Canvas.uh * -20,
	alpha: 0.5,
	width: Canvas.umin * 2,
	diameter: Canvas.umin * 3,
	stroke: 2,
	steps: 6,
	color: a => { return `hsl(${sliderHue}, ${100 * a}%, 50%)` }
})

let sliderLightness = 0
export const lightness_slider = new_slider({
	minX: -Canvas.uw * 40,
	minY: Canvas.uh * 20,
	maxX: -Canvas.uw * 40,
	maxY: Canvas.uh * -20,
	alpha: 0.5,
	width: Canvas.umin * 2,
	diameter: Canvas.umin * 3,
	stroke: 2,
	steps: 8,
	color: a => { return `hsl(${sliderHue}, ${sliderSaturation}%, ${100 * a}%)` }
})

const alphaScale = 0.95
export const alpha_slider = new_slider({
	minX: -Canvas.uw * 37.5,
	minY: Canvas.uh * 20,
	maxX: -Canvas.uw * 37.5,
	maxY: Canvas.uh * -20,
	alpha: 0,
	width: Canvas.umin * 2,
	diameter: Canvas.umin * 3,
	stroke: 2,
	steps: 6,
	color: a => { return `hsla(${sliderHue}, ${sliderSaturation}%, ${sliderLightness}%, ${1 - alphaScale * a})` }
})

export function get_all_gui_hovered_over() {
	const [mouseX, mouseY] = Input.mouse

	/** @type {(Slider)[]} */
	const hovered = []
	for (const slider of gui.sliders) {
		{
			const bx = (slider.maxX - slider.minX) * slider.alpha + slider.minX
			const by = (slider.maxY - slider.minY) * slider.alpha + slider.minY
			const mx = mouseX - bx
			const my = mouseY - by
			const distance = Math.hypot(mx, my)
			if (distance < slider.diameter * 0.5) {
				hovered.push(slider)
				continue
			}
		}

		{
			const mx = mouseX - slider.minX
			const my = mouseY - slider.minY
			const dx = slider.maxX - slider.minX
			const dy = slider.maxY - slider.minY
			const alpha = (mx * dx + my * dy) / (dx * dx + dy * dy)

			const tx = mx - dx * alpha
			const ty = my - dy * alpha
			const beta = Math.hypot(tx, ty)

			if (0 <= alpha && alpha <= 1 && 0 <= beta && beta <= slider.width * 0.5) {
				hovered.push(slider)
				continue
			}
		}
	}

	return hovered
}

/**
 * @param {?GuiType} guitype
 * @param {true} [behindOthers]
 */
export function get_guitype_hovered(guitype, behindOthers) {
	const hovered = get_all_gui_hovered_over()
	if (hovered.length === 0) return null
	if (guitype === null || hovered[0].guitype == guitype) return hovered[0]
	if (behindOthers === true) {
		for (let i = 1; i < hovered.length; i++) {
			if (hovered[i].guitype == guitype) return hovered[i]
		}
	}
	return null
}

/**
 * @param {Slider} slider
 * @param {number} targetX
 * @param {number} targetY
 */
function drag_slider(slider, targetX, targetY) {
	const deltaX = slider.maxX - slider.minX
	const deltaY = slider.maxY - slider.minY
	const offsetX = targetX - slider.minX
	const offsetY = targetY - slider.minY

	const dot = offsetX * deltaX + offsetY * deltaY
	const magsqr = 1 / (deltaX * deltaX + deltaY * deltaY)
	const projAlpha = Math.max(0, Math.min(1, dot * magsqr))
	slider.alpha = projAlpha
}
/**
 * @param {Slider} slider
 */
function round_slider_alpha(slider) {
	const steps = slider.steps
	const scaled = Math.floor(slider.alpha * steps)
	const clamped = Math.max(0, Math.min(steps - 1, scaled))
	const newAlpha = (clamped + 0.5) / steps
	slider.alpha = newAlpha
}

/**
 * @param {Slider} slider
 */
export function get_slider_color_alpha(slider) {
	const buttonColorAlpha = slider.steps === 1 ? 0 : (slider.alpha - 0.5) * slider.steps / (slider.steps - 1) + 0.5
	const clampedButtonColorAlpha = Math.max(0, Math.min(1, buttonColorAlpha))
	return clampedButtonColorAlpha
}

/**
 * @param {Slider} slider
 */
function render_slider(slider) {
	const sliderRadius = slider.width * 0.5
	const buttonRadius = slider.diameter * 0.5

	C.fillStyle = "#FFF"
	C.strokeStyle = "#FFF"
	C.lineWidth = slider.width + 2 * slider.stroke

	C.beginPath()
	C.ellipse(slider.minX, slider.minY, sliderRadius + slider.stroke, sliderRadius + slider.stroke, 0, 0, TAU)
	C.ellipse(slider.maxX, slider.maxY, sliderRadius + slider.stroke, sliderRadius + slider.stroke, 0, 0, TAU)
	C.fill()

	C.beginPath()
	C.moveTo(slider.minX, slider.minY)
	C.lineTo(slider.maxX, slider.maxY)
	C.stroke()

	const minColor = slider.color(0)
	C.fillStyle = minColor
	C.beginPath()
	C.ellipse(slider.minX, slider.minY, sliderRadius, sliderRadius, 0, 0, TAU)
	C.fill()

	if (slider.steps === 1) {
		C.beginPath()
		C.ellipse(slider.maxX, slider.maxY, sliderRadius, sliderRadius, 0, 0, TAU)
		C.fill()

		C.strokeStyle = minColor
		C.beginPath()
		C.moveTo(slider.minX, slider.minY)
		C.lineTo(slider.maxX, slider.maxY)
		C.stroke()

	} else {
		const maxColor = slider.color(1)
		C.fillStyle = maxColor
		C.beginPath()
		C.ellipse(slider.maxX, slider.maxY, sliderRadius, sliderRadius, 0, 0, TAU)
		C.fill()

		C.lineWidth = slider.width
		for (let i = 0; i < slider.steps; i++) {
			const lastAlpha = i / slider.steps
			const nextAlpha = (i + 1) / slider.steps
			const lastX = (slider.maxX - slider.minX) * lastAlpha + slider.minX
			const lastY = (slider.maxY - slider.minY) * lastAlpha + slider.minY
			const nextX = (slider.maxX - slider.minX) * nextAlpha + slider.minX
			const nextY = (slider.maxY - slider.minY) * nextAlpha + slider.minY

			const colorAlpha = i / (slider.steps - 1)
			const stepColor = slider.color(colorAlpha)
			C.strokeStyle = stepColor

			C.beginPath()
			C.moveTo(lastX, lastY)
			C.lineTo(nextX, nextY)
			C.stroke()
		}
	}

	const buttonX = (slider.maxX - slider.minX) * slider.alpha + slider.minX
	const buttonY = (slider.maxY - slider.minY) * slider.alpha + slider.minY

	C.fillStyle = "#FFF"
	C.beginPath()
	C.ellipse(buttonX, buttonY, buttonRadius + slider.stroke, buttonRadius + slider.stroke, 0, 0, TAU)
	C.fill()

	const buttonAlpha = get_slider_color_alpha(slider)
	const buttonColor = slider.color(buttonAlpha)
	C.fillStyle = buttonColor
	C.beginPath()
	C.ellipse(buttonX, buttonY, buttonRadius, buttonRadius, 0, 0, TAU)
	C.fill()
}

Input.connect_keydownonce(e => {
    cameraDisplaySizeSpring.velocity = 50
}, "KeyZ")

Input.connect_keydownonce(e => {
    renderUi = !renderUi
    Sound.SOFT_CLICK_SOUND.play()
}, "Digit1")

Input.connect_keydownonce(e => {
    renderOriginAxes = !renderOriginAxes
    Sound.SOFT_CLICK_SOUND.play()
}, "Digit2")

Input.connect_keydownonce(e => {
    render4DCursor = !render4DCursor
    Sound.SOFT_CLICK_SOUND.play()
}, "Digit3")

Input.connect_keydownonce(e => {
    renderCoordinateLabels = !renderCoordinateLabels
    Sound.SOFT_CLICK_SOUND.play()
}, "Digit4")

/** @type {null | (() => void)} */
let dragging = null
/** @type {null | Slider} */
let dragged = null
function disconnect_dragging() {
	if (dragging === null) return

	dragging()
	dragging = null

	switch (dragged.guitype) {
		case UI_SLIDER:
			round_slider_alpha(dragged)
			break
	}

	dragged = null
}

Input.connect_mousedown(e => {
    Canvas.canvas.style.cursor = "all-scroll"

	disconnect_dragging()
	const gui = get_guitype_hovered(null)
	if (gui === null) return

	switch (gui.guitype) {
		case UI_SLIDER:
			dragging = Input.connect_mousemove(e => {
				drag_slider(gui, ...Input.mouse)
			})
			drag_slider(gui, ...Input.mouse)
			break
	}

	dragged = gui
}, "left")

Input.connect_mouseup(e => {
    Canvas.canvas.style.cursor = "default"

	disconnect_dragging()
}, "left")

export function renderAll() {
	C.fillStyle = "#FFF"
	C.strokeStyle = Canvas.DEFAULT_COLOR
	C.lineWidth = 10

	const PADDING = 45

	C.textBaseline = "top"
	C.textAlign = "left"

	{
		const fontSize = Math.round(0.048 * Canvas.min) + cameraDisplaySizeSpring.position
		C.font = (GameState.currentCamera == GameState.CURRENT_CAMERA_5 ? "italic " : "") + `${fontSize}px cambria`

		const text = `${GameState.currentCamera == GameState.CURRENT_CAMERA_4 ? "3D Camera" : "4D Camera"}`
		const x = -Canvas.uw * PADDING
		const y = -Canvas.uh * (PADDING)
		C.strokeText(text, x, y)
		C.fillText(text, x, y)
	}

	C.font = `${0.024 * Canvas.min}px cambria`
	C.textAlign = "right"

	let topRightListOffset = 0

	{
		const text = `Toggle UI [1]`
		const x = Canvas.uw * PADDING
		const y = -Canvas.uh * (PADDING - topRightListOffset)
		C.strokeText(text, x, y)
		C.fillText(text, x, y)
		topRightListOffset += 5
	}

	{
		const text = `Toggle Origin Axes [2]`
		const x = Canvas.uw * PADDING
		const y = -Canvas.uh * (PADDING - topRightListOffset)
		C.strokeText(text, x, y)
		C.fillText(text, x, y)
		topRightListOffset += 5
	}

	{
		const text = `Toggle Cursor [3]`
		const x = Canvas.uw * PADDING
		const y = -Canvas.uh * (PADDING - topRightListOffset)
		C.strokeText(text, x, y)
		C.fillText(text, x, y)
		topRightListOffset += 5
	}

	{
		const text = `Show Axis Labels [4]`
		const x = Canvas.uw * PADDING
		const y = -Canvas.uh * (PADDING - topRightListOffset)
		C.strokeText(text, x, y)
		C.fillText(text, x, y)
		topRightListOffset += 5
	}

	{
		const text = `Save [9]`
		const x = Canvas.uw * PADDING
		const y = -Canvas.uh * (PADDING - topRightListOffset)
		C.strokeText(text, x, y)
		C.fillText(text, x, y)
		topRightListOffset += 5
	}

	{
		const text = `Load [0]`
		const x = Canvas.uw * PADDING
		const y = -Canvas.uh * (PADDING - topRightListOffset)
		C.strokeText(text, x, y)
		C.fillText(text, x, y)
		topRightListOffset += 5
	}

	C.font = `${Math.round(0.036 * Canvas.min)}px cambria`
	C.textBaseline = "bottom"
	C.textAlign = "left"

	let leftListOffset = 0

	{
		const text = `[LeftCtrl] Reorient 4D`
		const x = -Canvas.uw * PADDING
		const y = Canvas.uh * (PADDING - leftListOffset)
		C.strokeText(text, x, y)
		C.fillText(text, x, y)
		leftListOffset += 5
	}

	if (GameState.currentCamera == GameState.CURRENT_CAMERA_5) {
		const text = `[Shift] Change Rotations`
		const x = -Canvas.uw * PADDING
		const y = Canvas.uh * (PADDING - leftListOffset)
		C.strokeText(text, x, y)
		C.fillText(text, x, y)
		leftListOffset += 5
	}

	{
		const text = `[Space] ${GameState.hypervoxels.get(GameState.focus4.target.toString()) ? "Delete" : "Place"}`
		const x = -Canvas.uw * PADDING
		const y = Canvas.uh * (PADDING - leftListOffset)
		C.strokeText(text, x, y)
		C.fillText(text, x, y)
		leftListOffset += 5
	}

	{
		const text = `[Z] Switch Camera`
		const x = -Canvas.uw * PADDING
		const y = Canvas.uh * (PADDING - leftListOffset)
		C.strokeText(text, x, y)
		C.fillText(text, x, y)
		leftListOffset += 5
	}

	C.textAlign = "center"

	{
		C.font = `${Math.round(0.048 * Canvas.min)}px cambria`
		C.textAlign = "center"
		C.textBaseline = "bottom"

		const text = `(${GameState.focus4.target[0]}, ${GameState.focus4.target[1]}, ${GameState.focus4.target[2]}, ${GameState.focus4.target[3]})`
		const x = 0
		const y = Canvas.uh * PADDING
		C.strokeText(text, x, y);
		C.fillText(text, x, y)
	}

	{
		C.font = `${Math.round(0.036 * Canvas.min)}px cambria`

		const text = `${(Math.round(GameState.distance4.position * 1000) / 1000).toFixed(3)}`
		const x = 0
		const y = Canvas.uh * (PADDING - 5)
		C.strokeText(text, x, y)
		C.fillText(text, x, y)
	}

	C.textAlign = "right"

	let rightListOffset = 0

	{
		const text = `Recenter [RightCtrl]`
		const x = Canvas.uw * PADDING
		const y = Canvas.uh * (PADDING - rightListOffset)
		C.strokeText(text, x, y)
		C.fillText(text, x, y)
		rightListOffset += 5
	}

	{
		const text = `Move [DAWSEQRF]`
		const x = Canvas.uw * PADDING
		const y = Canvas.uh * (PADDING - rightListOffset)
		C.strokeText(text, x, y)
		C.fillText(text, x, y)
		rightListOffset += 5
	}

	{
		const text = `Zoom 4D [↑↓]`
		const x = Canvas.uw * PADDING
		const y = Canvas.uh * (PADDING - rightListOffset)
		C.strokeText(text, x, y)
		C.fillText(text, x, y)
		rightListOffset += 5
	}

	const hueAlpha = get_slider_color_alpha(hue_slider)
	sliderHue = hueScale * hueAlpha

	const saturationAlpha = get_slider_color_alpha(saturation_slider)
	sliderSaturation = 100 * saturationAlpha

	const lightnessAlpha = get_slider_color_alpha(lightness_slider)
	sliderLightness = 100 * lightnessAlpha

	for (const slider of gui.sliders)
		render_slider(slider)
}