import * as Comlink from 'comlink';
import * as tf from '@tensorflow/tfjs';
import * as bodyPix  from '@tensorflow-models/body-pix';

let ctx: OffscreenCanvasRenderingContext2D | null = null;
let backgroundImage: ImageBitmap | null = null;

let net: bodyPix.BodyPix | null = null;
let bitmapCanvas: OffscreenCanvas | null = null;
let bitmapCanvasContext: OffscreenCanvasRenderingContext2D | null = null;
let maskCanvas: OffscreenCanvas | null = null;
let maskCanvasContext: OffscreenCanvasRenderingContext2D | null = null;
let width = 0;
let height = 0;

Comlink.expose({
    init: async (canvas: OffscreenCanvas, bitmap: ImageBitmap) => {
        ctx = canvas.getContext('2d');
        backgroundImage = bitmap;

        width = canvas.width;
        height = canvas.height;

        // video画像を描画するcanvas
        bitmapCanvas = new OffscreenCanvas(width, height);
        bitmapCanvasContext = bitmapCanvas.getContext('2d');

        // maskを描画するcanvas
        maskCanvas = new OffscreenCanvas(width, height);
        maskCanvasContext = maskCanvas.getContext('2d');

        // use WebGL
        await tf.setBackend("webgl");

        // load BodyPix
        net = await bodyPix.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            multiplier: 0.5,
            quantBytes: 2
        });
    },
    update: async (bitmap: ImageBitmap) => {
        if(net !== null){
            // bitmapを描画
            console.log(bitmap);
            if(
                bitmapCanvasContext !== null
                && maskCanvasContext !== null
                && ctx !== null
                && maskCanvas !== null
                && backgroundImage !== null
                && bitmapCanvas !== null
            ){
                bitmapCanvasContext.drawImage(bitmap, 0, 0);

                const segmentation = await net.segmentPerson(bitmapCanvasContext.getImageData(0, 0, width, height));
                const mask = bodyPix.toMask(segmentation);

                // maskを描画
                maskCanvasContext.putImageData(mask, 0, 0);

                bitmapCanvasContext.save();
                bitmapCanvasContext.globalCompositeOperation = "destination-out";
                bitmapCanvasContext.drawImage(maskCanvas, 0, 0, width, height);
                bitmapCanvasContext.restore();

                bitmapCanvasContext.save();
                bitmapCanvasContext.globalCompositeOperation = "destination-atop";
                bitmapCanvasContext.drawImage(backgroundImage, 0, 0, width, height);
                bitmapCanvasContext.restore();

                // bitmapCanvasの内容をoffscreenCanvas(画面表示してるcanvas)へコピー
                // 見えてるcanvasで合成を処理を行うとチカチカするため
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(bitmapCanvas, 0, 0);
            }

        }
    }
});