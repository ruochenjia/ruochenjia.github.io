
/**
 * @param {BaseRandom} rand 
 */
function RandomCharCodeGenerator(rand) {
	/**
	 * @type {number}
	 */
	this.number = null;

	/**
	 * @type {number}
	 */
	this.lowerCaseAlpha = null;

	/**
	 * @type {number}
	 */
	this.upperCaseAlpha = null;

	/**
	 * @type {number}
	 */
	this.alpha = null;

	/**
	 * @type {number}
	 */
	this.chinese = null;

	/**
	 * @type {number}
	 */
	this.random = null;

	//////////////////////////
	// Implementations
	//////////////////////////

	Object.defineProperty(this, "number", {
		get: () => rand.randInt(0x30, 0x39)
	});
	Object.defineProperty(this, "lowerCaseAlpha", {
		get: () => rand.randInt(0x61, 0x7a)
	});
	Object.defineProperty(this, "upperCaseAlpha", {
		get: () => rand.randInt(0x41, 0x5a)
	});
	Object.defineProperty(this, "alpha", {
		get: () => rand.randBoolean() ? this.lowerCaseAlpha : this.upperCaseAlpha
	});
	Object.defineProperty(this, "chinese", {
		get: () => rand.randInt(0x4e00, 0x9fff)
	});
	Object.defineProperty(this, "random", {
		get: () => {
			const r = rand.rand();
			if (r > 0.75) {
				return this.number;
			} else if (r > 0.5) {
				return this.lowerCaseAlpha;
			} else if (r > 0.25) {
				return this.upperCaseAlpha;
			} else {
				return this.chinese;
			}
		}
	});
}

/**
 * @param {RandomCharCodeGenerator} gen 
 */
function RandomCharacterGenerator(gen) {
	/**
	 * @type {string}
	 */
	this.number = null;

	/**
	 * @type {string}
	 */
	this.lowerCaseAlpha = null;

	/**
	 * @type {string}
	 */
	this.upperCaseAlpha = null;

	/**
	 * @type {string}
	 */
	this.alpha = null;

	/**
	 * @type {string}
	 */
	this.chinese = null;

	/**
	 * @type {string}
	 */
	this.random = null;
 
	//////////////////////////
	// Implementations
	//////////////////////////
 
	Object.defineProperty(this, "number", {
		get: () => String.fromCharCode(gen.number)
	});
	Object.defineProperty(this, "lowerCaseAlpha", {
		get: () => String.fromCharCode(gen.lowerCaseAlpha)
	});
	Object.defineProperty(this, "upperCaseAlpha", {
		get: () => String.fromCharCode(gen.upperCaseAlpha)
	});
	Object.defineProperty(this, "alpha", {
		get: () => String.fromCharCode(gen.alpha)
	});
	Object.defineProperty(this, "chinese", {
		get: () => String.fromCharCode(gen.chinese)
	});
	Object.defineProperty(this, "random", {
		get: () => String.fromCharCode(gen.random)
	});
}

class BaseRandom {
	constructor() {
		const rccg = new RandomCharCodeGenerator(this);
		this.charCodes = rccg;
		this.chars = new RandomCharacterGenerator(rccg);
	}

	/**
	 * A random generated number between 0 and 1
	 */
	get random() {
		return this.rand();
	}

	/**
	 * @abstract Must be implemented in subclasses (or before using)
	 * @returns {number} A random decimal number between 0 and 1
	 */
	rand() {
		throw new Error("Function not implemented");
	}

	/**
	 * @param {number} min minimum value, must be an integer
	 * @param {number} max maximum value, must be an integer
	 * @returns A random integer in range
	 */
	randInt(min, max) {
		return min + Math.round(this.rand() * (max - min));
	}

	/**
	 * @param {number} min minimum value
	 * @param {number} max maximum value
	 * @returns A random decimal in range
	 */
	randDouble(min, max) {
		return min + this.rand() * (max - min);
	}

	/**
	 * @returns A random boolean value
	 */
	randBoolean() {
		return this.rand() > 0.5;
	}

	/**
	 * @param {ArrayLike<any>} arr the array object
	 * @returns A random value picked from the array
	 */
	randArrayItem(arr) {
		return arr[this.randInt(0, arr.length - 1)];
	}

	/**
	 * @param {ArrayBufferLike | ArrayLike<number> | number} buf the ArrayBuffer object or the length for creating a new ArrayBuffer
	 * @returns {ArrayBufferLike} The ArrayBuffer provided (or created) with random values generated
	 */
	randBuf(buf) {
		const arr = new Uint8Array(buf);
		for (let i = 0; i < arr.length; i++)
			arr[i] = this.randInt(0, 0xff);
		return arr.buffer;
	}
}

class Random extends BaseRandom {
	constructor() {
		super();
		this.rand = Math.random;
	}
}

class SecureRandom extends BaseRandom {
	constructor() {
		super();
		const buffer = new Uint32Array(256);
		crypto.getRandomValues(buffer);
		let index = 0;

		/**
		 * @returns {number} A random 32-bit integer value
		 */
		this.nextInt = () => {
			if (index >= buffer.length) {
				crypto.getRandomValues(buffer);
				index = 0;
			}
			const it = buffer[index++];
			if (it == null || isNaN(it))
				throw [index, it];
			return it;
		};
	}

	/**
	 * @override
	 */
	rand() {
		return this.nextInt() * Math.pow(2, -32);
	}

	/**
	 * @param {ArrayBufferLike | ArrayLike<number> | number} buf 
	 * @override
	 */
	randBuf(buf) {
		const arr = new Uint8Array(buf);
		crypto.getRandomValues(arr);
		return arr.buffer;
	}
}

// Object.defineProperty(window, "random", {
// 	value: Random,
// 	writable: false,
// 	enumerable: false,
// 	configurable: false
// });
// Object.defineProperty(window, "securerandom", {
// 	value: SecureRandom,
// 	writable: false,
// 	enumerable: false,
// 	configurable: false
// });

/**
 * @param {HTMLCanvasElement} elem 
 * @param {{ readonly fontSize?: number; readonly color?: string; readonly frameDelay?: number; secureRandom?: boolean; } | undefined} init 
 */
function matrixrain(elem, init = {}) {
	const context = elem.getContext("2d", {
		colorSpace: "srgb",
		alpha: false,
		desynchronized: false
	});

	const random = init.secureRandom ? new SecureRandom() : new Random();
	const fontSize = init.fontSize || 14;
	const color = init.color || "#00ff00";
	const frameDelay = init.frameDelay || 30;
	const drops = [];

	let width = 0;
	let height = 0;
	let columns = 0;
	function resize() {
		width = elem.clientWidth;
		height = elem.clientHeight;
		elem.width = width;
		elem.height = height;
		columns = Math.floor(width / fontSize);
		for (let i = 0; i < columns; i++)
			drops[i] = 1;
	}
	resize();
	window.addEventListener("resize", resize, { passive: true });

	async function loop() {
		// background
		context.fillStyle = "rgba(0, 0, 0, 0.05)";
		context.fillRect(0, 0, width, height);

		context.fillStyle = color;
		context.font = fontSize + "px monospace";

		for (let i = 0; i < columns; i++) {
			const y = drops[i] * fontSize;
			if (y > height) {
				if (random.random > 0.98) {
					drops[i] = 0;
				}
			} else {
				const ch = random.chars.random;
				context.fillText(ch, i * fontSize, y);
			}

			drops[i]++;
		}

		await new Promise(resolve => setTimeout(resolve, frameDelay));
		requestAnimationFrame(loop);
	}
	loop();
}

export default matrixrain;
