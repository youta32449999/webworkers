/* global THREE */
importScripts(
    // tensorflow.js & bodypix
     "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"
    , "https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix"
);

// 初期化時にセットする項目
let net = undefined;
let offscreenCanvas = undefined;
let offscreenCanvasContext = undefined;
let bitmapCanvas = undefined;
let bitmapCanvasContext = undefined;
let maskCanvas = undefined;
let maskCanvasContext = undefined;
let backgroundImage = undefined;
let width = 0;
let height = 0;

// 初期化
(async function init() {
    // show version
    console.log(tf.version);
    console.log(bodyPix.version);
})();

// メッセージ処理
onmessage = async function (e) {
    // 最初にoffscreenCanvasを受け取る
    if (offscreenCanvas === undefined) {
        offscreenCanvas = e.data.canvas;
        offscreenCanvasContext = offscreenCanvas.getContext('2d');

        // 合成用背景画像
        backgroundImage = e.data.background;

        // offscreenCanvasの値を使いまわすので保持しておく
        width = offscreenCanvas.width;
        height = offscreenCanvas.height;

        // bitmap描画用offscreenCanvasを用意
        bitmapCanvas = new OffscreenCanvas(width, height);
        bitmapCanvasContext = bitmapCanvas.getContext('2d');

        // mask&背景合成用のoffscreenCanvasを用意
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

        return true;
    }

    // 受信したbitmapをoffscreenCanvasに描画する
    if (e.data instanceof ImageBitmap && net !== undefined) {
        // bitmapを描画
        const bitmap = e.data;
        bitmapCanvasContext.drawImage(bitmap, 0, 0);

        const segmentation = await net.segmentPerson(bitmapCanvasContext.getImageData(0, 0, width, height));
        const mask = bodyPix.toMask(segmentation);
        console.log(mask);

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
        offscreenCanvasContext.clearRect(0, 0, width, height);
        offscreenCanvasContext.drawImage(bitmapCanvas, 0, 0);
    }

    // メインスレッドへ次のメッセージを要求
    postMessage('please next');
};