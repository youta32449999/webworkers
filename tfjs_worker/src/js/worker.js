importScripts(
    // tensorflow.js & bodypix
    "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"
    , "https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix"
    , "https://cdn.jsdelivr.net/npm/comlink@4.3.0/dist/umd/comlink.min.js"
);

/*
    初期化時に定義するもの
 */
let ctx = null; // 画面に描画するCanvas
let backgroundImage = null; // 背景画像
let net = undefined;
let bitmapCanvas = undefined;
let bitmapCanvasContext = undefined;
let maskCanvas = undefined;
let maskCanvasContext = undefined;
let width = 0;
let height = 0;

Comlink.expose({
    init: async (canvas, bitmap) => {
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
    update: async (bitmap) => {
        if(net !== null){
            // bitmapを描画
            console.log(bitmap);
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
});