import * as Comlink from "comlink";

importScripts(
    // tensorflow.js & bodypix
    "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"
    , "https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix"
);

let ctx: OffscreenCanvasRenderingContext2D | null = null;
let backgroundImage: ImageBitmap | null = null;

Comlink.expose({
    init: async (canvas: OffscreenCanvas, bitmap: ImageBitmap) => {
        ctx = canvas.getContext('2d');
        backgroundImage = bitmap;
    }
});