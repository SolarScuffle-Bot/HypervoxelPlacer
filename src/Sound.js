export class Sound {
	/**
	 * @param {string} path
	 */
	constructor(path, replayTime = 0) {
		this.audio = new Audio(path)
		this.replayTime = replayTime
	}

	play() {
		if (!this.audio.paused) {
			this.audio.currentTime = this.replayTime
		} else {
			this.audio.play()
		}
	}

	stop() {
		this.audio.pause()
		this.audio.currentTime = 0
	}
}

export const SOFT_CLICK_SOUND = new Sound("./Assets/opera-gx-click6.mp3")
export const HARD_CLICK_SOUND = new Sound("./Assets/opera-gx-click5.mp3")
export const ZOOM_SOUND = new Sound("./Assets/scroll.mp3", 0.0)
export const DADA_SOUND = new Sound("./Assets/da-da.mp3")
export const DADA_REVERSED_SOUND = new Sound("./Assets/da-da-reversed.mp3")
export const SUCCESS_SOUND = new Sound("./Assets/success.mp3")
export const TAP_SOUNDS = [
	new Sound("./Assets/opera-gx-click1.mp3"),
	new Sound("./Assets/opera-gx-click2.mp3"),
	new Sound("./Assets/opera-gx-click3.mp3"),
	new Sound("./Assets/opera-gx-click4.mp3"),
]
export const MOVE_SOUNDS = [
	new Sound("./Assets/tap-glass.mp3", 0.005),
]
export const RESET_MOVE_SOUNDS = [
	new Sound("./Assets/tap-glass-reverb.mp3", 0.027),
]

/**
 * @param {Sound[]} sounds
 */
export function playRandomSoundFrom(sounds) {
	const index = Math.floor(sounds.length * Math.random())
	const sound = sounds[index]
	sound.play()
}