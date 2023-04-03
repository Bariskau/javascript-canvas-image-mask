# javascript-canvas-image-mask
This is a simple JavaScript application that masks images using an alpha mask. An alpha mask is a transparency map that can be used to hide a specific region of images or highlight a specific region. With the tool you can mask a photo in the html canvas. The web interface has a rudimentary set of customizations for the brush, similar to photoshop, such as opacity, hardness and size. The interface was developed as a __demo__ just to give you an idea. Take care to redevelop it to suit your needs.

# Demo
# [Try](https://bariskau.github.io/javascript-canvas-image-mask)
![](https://github.com/Bariskau/javascript-canvas-image-mask/raw/main/assets/images/demo.gif)

## How it works?
#### This piece of code takes the pixel data of a drawing canvas named "canvases.drawing" and processes it with an alpha mask.

```javascript
function applyMask() {
    // Get the image data for the drawing canvas.
    const idata = canvases.drawing.ctx.getImageData(0, 0, options.width, options.height);

    // [1] Create a 32-bit array from the image data buffer.
    const data32 = new Uint32Array(idata.data.buffer);

    // [2] Apply a left shift of 8 bits to each 32-bit value in the array.
    let i = 0, len = data32.length;
    while (i < len) data32[i] = data32[i++] << 8;

    // [3] Update the preview canvas with the masked image data.
    canvases.preview.ctx.putImageData(idata, 0, 0);

    // [4] Set the global composite operation to "source-in".
    canvases.preview.ctx.globalCompositeOperation = "source-in";

    // [5] Draw the image on the preview canvas with the applied mask.
    canvases.preview.ctx.drawImage(elements.image, 0, 0);
}
```

 - __1:__ The pixel data stored in the idata variable is converted to a 32-bit integer array. The benefit of converting to a 32-bit integer array is that it allows the data to be processed faster. The pixel data consists of four 8-bit (RGBA) components of 4 bytes each. To process this data, 32-bit integers are more efficient because a 32-bit integer can contain four 8-bit components. Thus, accessing pixel data using 32-bit integers is faster and more efficient than accessing 8-bit data. Furthermore, 32-bit integers are the type of data that modern processors natively support, and they can be efficiently processed for many processors. Therefore, by converting pixel data into a 32-bit integer array, the processor can process the data more efficiently.

 - __2:__ Each 32-bit value is shifted 8 bits to the left. Pixel data defines all colors and transparency of an image. For each pixel, four values (RGBA) are used: red (R), green (G), blue (B) and alpha (A) channels. The alpha channel is a numeric value that determines how transparent or opaque a pixel is. When the alpha value is 0 the pixel is completely transparent and there is no imaging, when the alpha value is 255 the pixel is completely opaque and is imaged. In the code above, the original value of the alpha value is shifted 8 bits (one byte) to the left.

 - __3:__ It places the rendered pixel data into another canvas named "canvases.preview".

 - __4:__ global compositing operation mode is set to "source-in". When the value of this property is set to "source-in", the new drawing operation is shown only in areas that overlap with the previous drawing operation.

- __5:__ Finally, the original image is drawn on the canvas "canvases.preview" with the mask applied at the specified position.

## Installation
The project is developed with vanilla javascript. You can try it by opening the index.html file on your browser

## Licence
[MIT](https://choosealicense.com/licenses/mit/)
