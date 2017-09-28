class HorizontalPanoramicCamera {

	constructor (_$element){
		this.currentSliceIndex = 0;

		this.$element = _$element;
		this.$camera = this.$element.find("video.camera-video");
		this.$canvas = this.$element.find("canvas.camera-canvas");

		this.canvasContext = this.$canvas[0].getContext('2d');
	}

	requestFullscreen (_element){
		if(_element.requestFullscreen) {
			_element.requestFullscreen();
		} else if(_element.mozRequestFullScreen) {
			_element.mozRequestFullScreen();
		} else if(_element.webkitRequestFullscreen) {
			_element.webkitRequestFullscreen();
		} else if(_element.msRequestFullscreen) {
			_element.msRequestFullscreen();
		}
	}

	connectCameraToVideoElement (_camera){
		var self = _camera;
		// let constraints = { video: true, audio: false };		// Generic, Allow user to choose which device
		let constraints = { video: {facingMode: "environment"}, audio: false } // Test forcing rear camera
		navigator.mediaDevices.getUserMedia(constraints)
			.then((_stream) => {

				// Stream data from choosen webcam to Video Element input
		        self.$camera[0].srcObject = _stream;
		        self.$camera[0].play();

			})
			.catch(self.error);
	}

	captureStillImage (_camera){
		var self = _camera;

		// Create local-scoped shorthands
		let camera = self.$camera[0];
		let canvas = self.$canvas[0];
		let previousCanvasData = document.createElement('canvas');

		// Backup current canvas contents to bitmap for restore after resize
		if (self.currentSliceIndex != 0) {
			previousCanvasData.width = canvas.width;
			previousCanvasData.height = canvas.height;
			previousCanvasData.getContext('2d').drawImage(
				canvas,
				0, 0,
				previousCanvasData.width,
				previousCanvasData.height
			); // Bitmap data source, X, Y, W, H
		}

		// Do resizing of canvas (which wipes canvas content :( )
		canvas.width = camera.videoWidth *(self.currentSliceIndex +1);
		canvas.height = camera.videoHeight;

		// Ready index for next slice's position
		self.currentSliceIndex++;

		// Restore backed-up canvas content
		if (self.currentSliceIndex != 0) {
			self.canvasContext.drawImage(
				previousCanvasData,
				0, 0,
				previousCanvasData.width,
				previousCanvasData.height
			)
		}

		// Draw next slice image onto canvas
		self.canvasContext.drawImage(
			camera,
			camera.videoWidth *self.currentSliceIndex,
			0,
			camera.videoWidth,
			camera.videoHeight
		); // Bitmap data source, X, Y, W, H

	}

	error (_error){
		console.log("An error occured! " + _error);
	}

}



// =========================================================================
// =========================================================================



var camera;

$(document).ready(function(){

	camera = new HorizontalPanoramicCamera($(".camera-container"));

	$("button#camera-btn-connectcamera").click(() => {
		camera.connectCameraToVideoElement(camera);
	});
	$("button#camera-btn-reqfullscreen").click(() => {
		camera.requestFullscreen(document.documentElement);
	})
	$("button#camera-btn-capturestill").click(() => {
		camera.captureStillImage(camera);
	})

});