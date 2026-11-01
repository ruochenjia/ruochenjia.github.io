"use strict"; (function() {
	var _re = document.getElementById("re-body");
	var _egg = document.getElementById("egg-body");
	var _mbtn = document.getElementById("egg");

	_mbtn.onclick = function() {
		_mbtn.disabled = true;
		_egg.style.display = "block";

		if (document.fullscreenEnabled) {
			_egg.requestFullscreen({ navigationUI: "hide" }).then(() => {
				_mbtn.disabled = false;
			});
		} else _re.remove();
	};
	document.onfullscreenchange = function() {
		if (document.fullscreenElement == null)
			_egg.style.display = "none";
	};
})();
