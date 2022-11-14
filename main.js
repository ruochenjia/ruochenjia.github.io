import matrixrain from "./matrixrain.js";

document.oncontextmenu = (e) => {
	e.preventDefault();
	e.stopPropagation();
};

document.onkeydown = (e) => {
	function checkKey() {
		const ctrl = e.ctrlKey || e.metaKey;
		const shift = e.shiftKey;
		const code = e.keyCode;

		if (ctrl) {
			if (shift) {
				switch (code) {
					case 73: // ctrl+shift+i
					case 74: // ctrl+shift+j
						return true;
				}
			}

			switch (code) {
				case 83: // ctrl+s
				case 85: // ctrl+u
					return true;
			}
		}

		switch (code) {
			case 123: // f12
				return true;
			default:
				return false;
		}
	}

	if (checkKey()) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	return true;
};

matrixrain(document.getElementById("bg"), {
    secureRandom: true,
});
