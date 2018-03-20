Vintage Camera Filters

A React app that takes in data from the users video stream and swaps out the palette to emulate look of vintage video game systems.

I got the idea for this while watching a video by Wes Bos where he talked about video streams and challenged people to see what they could do with it.

After figuring out that the video source is a just a [typed array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays) with the rbga values for each pixel I realised it could be manipulated and painted on a canvas for visual effects.

 After doing some reading I created a few bits of code to test this out. I decided on doing some palette swaps to emulate old hardware.

 First off we would need the the rbg values of the new palette stored in an array. For example the values for the gameboy palette:

 ```javascript
const gameboy = [[15, 56, 15],[48, 98, 48],[139, 172, 15],[155, 188, 15]];
 ```

The simplest method to do a swap would be to go though each pixel in the frame and compare it's value to the gameboy palette and switch it with the [closest one](https://en.wikipedia.org/wiki/Color_difference). Most modern programs like photoshop use some complex math that I really didn't need just to emulate a simple palette so I just used the euclidiean distance. While this works as avertised it results in a really flat image with most of the deatil lost. Even my old gameboy looked better than this!

Turns out in the old days images were [dithered](https://en.wikipedia.org/wiki/Ordered_dithering) to make up for this. As per wikipedia doing something like this:

```javascript
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
``` 

actually results in decent picutres.

I'll play around with this a bit more in the future and see if I can improve.