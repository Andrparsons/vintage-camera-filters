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
      moddedPixels: null
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
        console.log('Timer ID is:' + timerId);
        this.setState({timerId: timerId}); 
      })
      .catch(err => {
        console.error("No Access to camera", err);
      });
  }

  drawCanvas() {
    let dimension;
    let offSetX = 0;
    let offSetY = 0;
    let scale = 20 * 0.01;
    scale = 1;

    const ctx = this.canvas.getContext("2d");
    this.setState({ctx: ctx});

    return setInterval(() => {
      // the natural dimensions do not load right away
      if (this.video.videoHeight !== 0) {
        if (this.video.videoHeight > this.video.videoWidth) {
          offSetY = this.video.videoHeight - this.video.videoWidth;
          dimension = this.video.videoWidth;
          this.setState({ canvasWidth: this.video.videoWidth, canvasHeight: this.video.videoHeight });
        } else {
          offSetX = this.video.videoWidth - this.video.videoHeight;
          dimension = this.video.videoHeight;
          this.setState({ canvasWidth: this.video.videoWidth, canvasHeight: this.video.videoHeight });
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
        /*
        ctx.drawImage(
          this.video,
          offSetX,
          offSetY,
          dimension,
          dimension,
          0,
          0,
          dimension,
          dimension
        );
        */
        let pixels = ctx.getImageData(
          0,
          0,
          this.state.canvasWidth,
          this.state.canvasHeight
        );

        //put data in state so other functions can use it
        this.setState({pixels: pixels});

        //do this to stills
        //this.changePalette(pixels, this.state.system);
        //ctx.putImageData(pixels, 0, 0);
      }
    }, 1);
  }

  colourDifference(a,b) {
    //using euclidian method
    //simple and should be helpful with the retro feel
    return Math.sqrt(
            Math.pow(a[0] - b[0], 2) +
            Math.pow(a[1] - b[1], 2) +
            Math.pow(a[2] - b[2], 2)
          );
  }

  grabFrame() {
    //stop the video
    clearInterval(this.state.timerId);
    this.video.pause();
    console.log(this.state.pixels);
  }

  swapPalette() {
    const bnw =[
      [0,0,0],
      [255,255,255]
    ]

    const gameboy = [
      15,56,15,
      48,98,48,
      139,172,15,
      155,188,15
    ];

    const CGA0 = [
      0,0,0,
      0,170,0,
      170,0,0,
      170,85,0
    ]

    const CGA1 = [
      0,0,0,
      0,170,170,
      170,0,170,
      170,170,170
    ];

    const CGA16 = [
      0,0,0,
      0,0,170,
      0,170,0,
      0,170,170,
      170,0,0,
      170,0,170,
      170,85,0,
      170,170,170,
      85,85,85,
      85,85,170,
      85,170,85,
      85,170,170,
      170,85,85,
      170,85,170,
      170,170,85,
      170,170,170
    ];

    const trueColour = [ 
      8,0,0,
      32,26,11,
      67,40,23,
      73,41,16,
      35,67,9,
      93,79,30,
      156,107,32,
      169,34,15,
      43,52,124,
      43,116,9,
      208,202,64,
      232,160,119,
      106,148,171,
      213,196,179,
      252,231,110,
      252,250,226

    ]

    const nes = [
      124,124,124,
      0,0,252,
      0,0,188,
      68,40,188,
      148,0,132,
      168,0,32,
      168,16,0,
      136,20,0,
      80,48,0,
      0,120,0,
      0,104,0,
      0,88,0,
      0,64,88,
      0,0,0,
      188,188,188,
      0,120,248,
      0,88,248,
      104,68,252,
      216,0,204,
      228,0,88,
      248,56,0,
      228,92,16,
      172,124,0,
      0,184,0,
      0,168,0,
      0,168,68,
      0,136,136,
      248,248,248,
      60,188,252,
      104,136,252,
      152,120,248,
      248,120,248,
      248,88,152,
      248,120,88,
      252,160,68,
      248,184,0,
      184,248,24,
      88,216,84,
      88,248,152,
      0,232,216,
      120,120,120,
      252,252,252,
      164,228,252,
      184,184,248,
      216,184,248,
      248,184,248,
      248,164,192,
      240,208,176,
      252,224,168,
      248,216,120,
      216,248,120,
      184,248,184,
      184,248,216,
      0,252,252,
      248,216,248
    ]

    this.changePalette(this.state.pixels,bnw);
  }

  changePalette(pixels, system) {
    // every 4 items in array is a diff part of the rgba values of the pixel

    let result = [];
    let pos;

    //colour diff -> euclidian method
    //sqaure root of the difference of the sum of the squares of each value
    //lowest *should* be the closest match
    for (let i = 0; i < pixels.data.length; i += 4) {
      for (let x = 0; x < system.length; x += 3) {
      result.push(
        Math.sqrt(
          Math.pow(pixels.data[i + 0] - system[x+ 0], 2) +
            Math.pow(pixels.data[i + 1] - system[x+ 1], 2) +
            Math.pow(pixels.data[i + 2] - system[x+ 2], 2)
        ))
      }
      
      //replace exising pixel colours with the palette that is closest
      pos = result.indexOf(Math.min.apply(null, result));
      pixels.data[i + 0] = system[(pos * 3) + 0];
      pixels.data[i + 1] = system[(pos * 3) + 1];
      pixels.data[i + 2] = system[(pos * 3) + 2];
      
      result = [];
    }
    
    this.state.ctx.putImageData(pixels, 0, 0);
    this.setState({moddedPixels: pixels});
  }

  render() {
    return (
      <div>
        <button onClick={this.swapPalette.bind(this)}>Convert</button>
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
          <div className="strip" />
          <button onClick={this.grabFrame.bind(this)}>Snap photo</button>
        </div>
      </div>
    );
  }
}
