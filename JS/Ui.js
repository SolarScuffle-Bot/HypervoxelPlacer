import * as Canvas from "./Canvas.js"

const C = Canvas.c

const ABSX = 0
const ABSY = 1
const ABSWIDTH = 2
const ABSHEIGHT = 3

/**
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {any} color
 */
export function drawRect(x, y, width, height, color, pivotX = 0, pivotY = 0) {
    const adjustedX = x - width * pivotX
    const adjustedY = Canvas.ch - y - height * pivotY // Flip Y-axis in drawing
    C.fillStyle = color
    C.fillRect(adjustedX, adjustedY, width, height)
}

/**
 * @param {number} x
 * @param {number} y
 * @param {any} text
 * @param {any} font
 * @param {any} color
 */
export function drawText(x, y, text, font, color, pivotX = 0, pivotY = 0) {
    const adjustedX = x - pivotX * Canvas.cw
    const adjustedY = Canvas.ch - y - pivotY * Canvas.ch // Flip Y-axis in drawing
    C.font = font
    C.fillStyle = color
    C.textAlign = "start"
    C.textBaseline = "top"
    C.fillText(text, adjustedX, adjustedY)
}

/**
 * @param {CanvasImageSource} image
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
export function drawImage(image, x, y, width, height, pivotX = 0, pivotY = 0) {
    const adjustedX = x - width * pivotX
    const adjustedY = Canvas.ch - y - height * pivotY // Flip Y-axis in drawing
    C.drawImage(image, adjustedX, adjustedY, width, height)
}

// /**
//  * @param {[number, number, number, number]} position
//  * @param {[number, number, number, number]} size
//  * @param { { absolute: [number, number, number, number] } | null } parent
//  */
// function getAbsolute(position, size, parent) {
// 	const screenAbsolute = [0, 0, Canvas.cw, Canvas.ch]
// 	const [parentX, parentY, parentWidth, parentHeight] = !!parent ? parent.absolute : screenAbsolute
// 	const [xpercent, xpixels, ypercent, ypixels] = position
// 	const [widthpercent, widthpixels, heightpercent, heightpixels] = size

// 	return [
// 		parentX + xpercent * parentWidth + xpixels,
// 		parentY + ypercent * parentHeight + ypixels,
// 		parentX + widthpercent * parentWidth + widthpixels,
// 		parentY + heightpercent * parentHeight + heightpixels,
// 	]
// }

// /**
//  * @param {[number, number, number, number]} position
//  * @param {[number, number, number, number]} size
//  * @param {string} color
//  * @param { { absolute: [number, number, number, number] } | null } parent
//  */
// export function defineRect(position, size, color, pivotX = 0, pivotY = 0, parent = null) {
//     return {
// 		absolute: getAbsolute(position, size, parent),
//         position: position,
//         size: size,
//         color,
//         pivotX,
//         pivotY
//     }
// }

// /**
//  * @param {[number, number, number, number]} position
//  * @param {string} text
//  * @param {string} font
//  * @param {string} color
//  * @param { { absolute: [number, number, number, number] } | null } parent
//  */
// export function defineText(position, text, font, color, pivotX = 0, pivotY = 0, parent = null) {
//     C.font = font
//     const textMetrics = C.measureText(text)
//     const textWidth = textMetrics.width
//     const textHeight = parseInt(font, 10) // Approximate height
// 	const size = [0, textWidth, 0, textHeight]
//     return {
// 		absolute: getAbsolute(position, size, parent),
// 		position,
//         text,
//         font,
//         color,
//         width: textWidth,
//         height: textHeight,
//         pivotX,
//         pivotY
//     }
// }

// /**
//  * @param {[number, number, number, number]} position
//  * @param {[number, number, number, number]} size
//  * @param {CanvasImageSource} image
//  * @param { { absolute: [number, number, number, number] } | null } parent
//  */
// export function defineImage(position, size, image, pivotX = 0, pivotY = 0, parent = null) {
//     return {
// 		absolute: getAbsolute(position, size, parent),
//         position,
//         size,
//         image,
//         pivotX,
//         pivotY
//     }
// }

// export function createListLayout(position, size, pivotX = 0, pivotY = 0, direction = "bottom", spacing = 10, positionAncestor = null, sizeAncestor = null) {
//     return {
//         position,
//         size,
//         pivotX,
//         pivotY,
//         direction,
//         spacing,
//         currentPosition: [...position],
//         positionAncestor,
//         sizeAncestor
//     }
// }

// export function addRectToLayout(layout, rectData) {
//     const [resolvedX, resolvedY] = resolvePosition(layout.currentPosition, layout.positionAncestor)
//     const [resolvedWidth, resolvedHeight] = resolveSize([rectData.width, rectData.height], layout.sizeAncestor)

//     rectData.x = resolvedX
//     rectData.y = resolvedY
//     rectData.width = resolvedWidth
//     rectData.height = resolvedHeight

//     updateListPosition(layout, [rectData.width, rectData.height])
// }

// export function addTextToLayout(layout, textData) {
//     const [resolvedX, resolvedY] = resolvePosition(layout.currentPosition, layout.positionAncestor)

//     C.font = textData.font
//     const textMetrics = C.measureText(textData.text)
//     const textWidth = textMetrics.width
//     const textHeight = parseInt(textData.font, 10) // Approximate height

//     textData.x = resolvedX
//     textData.y = resolvedY
//     textData.width = textWidth
//     textData.height = textHeight

//     updateListPosition(layout, [textWidth, textHeight])
// }

// export function addImageToLayout(layout, imageData) {
//     const [resolvedX, resolvedY] = resolvePosition(layout.currentPosition, layout.positionAncestor)
//     const [resolvedWidth, resolvedHeight] = resolveSize([imageData.width, imageData.height], layout.sizeAncestor)

//     imageData.x = resolvedX
//     imageData.y = resolvedY
//     imageData.width = resolvedWidth
//     imageData.height = resolvedHeight

//     updateListPosition(layout, [imageData.width, imageData.height])
// }

// export function updateListPosition(layout, size) {
//     switch (layout.direction) {
// 		case "top":
// 			layout.currentPosition[3] += size[1] + layout.spacing
// 			break
//         case "bottom":
//             layout.currentPosition[3] -= size[1] + layout.spacing
//             break
//         case "right":
//             layout.currentPosition[1] += size[0] + layout.spacing
//             break
//         case "left":
//             layout.currentPosition[1] -= size[0] + layout.spacing
//             break
//     }
// }

// export function renderRect(data) {
//     drawRect(data.x, data.y, data.width, data.height, data.color, data.pivotX, data.pivotY)
// }

// export function renderText(data) {
//     drawText(data.x, data.y, data.text, data.font, data.color, data.pivotX, data.pivotY)
// }

// export function renderImage(data) {
//     drawImage(data.image, data.x, data.y, data.width, data.height, data.pivotX, data.pivotY)
// }
