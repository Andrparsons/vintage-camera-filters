import React from "react";
import "./camera.css";

export default class Camera extends React.Component {
  constructor() {
    super();
    this.state = {
      constraints: { audio: false, video: true },
      videoSrc: null,
      canvasWidth: 0,
      canvasHeight: 0,
      pixels: null,
      timerId: null,
      ctx: null,
      system: null
    };
  }

  componentDidMount() {
    navigator.mediaDevices
      .getUserMedia(this.state.constraints)
      .then(stream => {
        this.setState({ videoSrc: window.URL.createObjectURL(stream) });
        this.video.play();
      })
      .then(() => {
        let timerId = this.drawCanvas();
        console.log("Timer ID is:" + timerId);
        console.log(window.screen.width);
        this.setState({ timerId: timerId });
      })
      .catch(err => {
        console.error("No Access to camera", err);
      });
  }

  drawCanvas() {
    // keep this variable around to downscale
    let scale = 1;

    const ctx = this.canvas.getContext("2d");
    this.setState({ ctx: ctx });

    return setInterval(() => {
      // the natural dimensions do not load right away
      if (this.video.videoHeight !== 0) {
        if (this.video.videoHeight > this.video.videoWidth) {
          //try using window sizes instead
          this.setState({
            canvasWidth: this.video.videoWidth,
            canvasHeight: this.video.videoHeight
          });
          // this.setState({ canvasWidth: window.screen.width, canvasHeight: window.screen.height });
        } else {
          this.setState({
            canvasWidth: this.video.videoWidth,
            canvasHeight: this.video.videoHeight
          });
          // this.setState({ canvasWidth: window.screen.width, canvasHeight: window.screen.height });
        }

        ctx.imageSmoothingEnabled = false;

        ctx.drawImage(
          this.video,
          0,
          0,
          this.state.canvasWidth * scale,
          this.state.canvasHeight * scale
        );
        ctx.drawImage(
          this.canvas,
          0,
          0,
          this.state.canvasWidth * scale,
          this.state.canvasHeight * scale,
          0,
          0,
          this.state.canvasWidth,
          this.state.canvasHeight
        );
        let pixels = ctx.getImageData(
          0,
          0,
          this.state.canvasWidth,
          this.state.canvasHeight
        );

        //put data in state so other functions can use it
        this.setState({ pixels: pixels });
      }
    }, 1);
  }

  colourDifference(a, b) {
    //using euclidian method
    //simple and should be helpful with the retro feel
    return Math.sqrt(
      Math.pow(a[0] - b[0], 2) +
        Math.pow(a[1] - b[1], 2) +
        Math.pow(a[2] - b[2], 2)
    );
  }

  findColour(colour, system) {
    //recursive function
    let findPos = function(test, pixel, palette, start) {
      if (palette.length === 2) {
        if (test(pixel, start) <= test(pixel, palette[1])) {
          return start;
        } else {
          return palette[1];
        }
      } else {
        let chunk = palette.slice(1);
        if (test(pixel, start) <= test(pixel, palette[1])) {
          //start = start;
        } else {
          start = palette[1];
        }
        return findPos(test, pixel, chunk, start);
      }
    };
    var found = findPos(this.colourDifference, colour, system, system[0]);
    return found;
  }

  grabFrame() {
    //stop the video
    clearInterval(this.state.timerId);
    this.video.pause();
  }

  swapPalette() {
    const bnw = [[0, 0, 0], [255, 255, 255]];

    const gameboy = [
      [15, 56, 15],
      [48, 98, 48],
      [139, 172, 15],
      [155, 188, 15]
    ];

    const CGA0 = [[0, 0, 0], [0, 170, 0], [170, 0, 0], [170, 85, 0]];

    const CGA1 = [[0, 0, 0], [0, 170, 170], [170, 0, 170], [170, 170, 170]];

    const CGA16 = [
      [0, 0, 0],
      [0, 0, 170],
      [0, 170, 0],
      [0, 170, 170],
      [170, 0, 0],
      [170, 0, 170],
      [170, 85, 0],
      [170, 170, 170],
      [85, 85, 85],
      [85, 85, 255],
      [85, 255, 85],
      [85, 255, 255],
      [255, 85, 85],
      [255, 85, 255],
      [255, 255, 85],
      [255, 255, 255]
    ];

    const trueColour = [
      [8, 0, 0],
      [32, 26, 11],
      [67, 40, 23],
      [73, 41, 16],
      [35, 67, 9],
      [93, 79, 30],
      [156, 107, 32],
      [169, 34, 15],
      [43, 52, 124],
      [43, 116, 9],
      [208, 202, 64],
      [232, 160, 119],
      [106, 148, 171],
      [213, 196, 179],
      [252, 231, 110],
      [252, 250, 226]
    ];

    //this.changePalette(this.state.pixels, bnw);
    this.OrderedDither(this.state.pixels, gameboy);
  }

  changePalette(pixels, system) {
    // every 4 items in array is a diff part of the rgba values of the pixel

    let result, colour;

    for (let i = 0; i < pixels.data.length; i += 4) {
      colour = [pixels.data[i], pixels.data[i + 1], pixels.data[i + 2]];
      result = this.findColour(colour, system);

      //replace exising pixel colours with the palette that is closest
      pixels.data[i + 0] = result[0];
      pixels.data[i + 1] = result[1];
      pixels.data[i + 2] = result[2];
    }

    this.state.ctx.putImageData(pixels, 0, 0);
  }

  OrderedDither(pixels, system) {
    const orderedMatrix = [
      [1, 9, 3, 11],
      [13, 5, 15, 7],
      [4, 12, 2, 10],
      [16, 8, 14, 6]
    ];

    let i = 0;
    let result, colour;
    for (let y = 0; y < pixels.height; y++) {
      for (let x = 0; x < pixels.width; x++) {
        i = 4 * x + 4 * y * pixels.width;

        pixels.data[i + 0] += orderedMatrix[x % 4][y % 4] * 3;
        pixels.data[i + 1] += orderedMatrix[x % 4][y % 4] * 3;
        pixels.data[i + 2] += orderedMatrix[x % 4][y % 4] * 3;

        colour = [pixels.data[i], pixels.data[i + 1], pixels.data[i + 2]];
        result = this.findColour(colour, system);

        pixels.data[i + 0] = result[0];
        pixels.data[i + 1] = result[1];
        pixels.data[i + 2] = result[2];
      }
    }
    this.state.ctx.putImageData(pixels, 0, 0);
  }

  render() {
    return (
      <div>
        <div className="camera">
          <canvas
            height={this.state.canvasHeight}
            width={this.state.canvasWidth}
            ref={canvas => (this.canvas = canvas)}
            className="photo"
          />
          <video
            className="player"
            ref={video => (this.video = video)}
            src={this.state.videoSrc}
          />
        </div>
          <button onClick={this.grabFrame.bind(this)}>Snap photo</button>
          <button onClick={this.swapPalette.bind(this)}>Convert</button>
      </div>
    );
  }
}
