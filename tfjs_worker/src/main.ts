import * as Comlink from "comlink";

async function main(){
    if(window.Worker){
        // 設定値
        const width = 400;
        const height = 300;

        // カメラから映像を取得してvideo要素をバックグラウンドで再生
        const cameraStream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
        const video = document.createElement('video') as HTMLVideoElement;
        video.srcObject = cameraStream;
        await video.play();

        // video要素をImageBitmapに変換するoffscreenCanvasを定義
        const videoToBitmapCanvas = new OffscreenCanvas(width, height);
        const videoToBitmapContext = videoToBitmapCanvas.getContext('2d');

        // 背景画像を読み込み
        const backgroundImage = new Image();
        backgroundImage.src = '/assets/image/sabanna.jpg';
        await backgroundImage.decode();

        // 背景画像をImageBitmapに変換するoffscreenCanvasを定義&Bitmapを取得
        const backgroundImageToBitmapCanvas = new OffscreenCanvas(width, height);
        const backgroundImageToBitmapContext = backgroundImageToBitmapCanvas.getContext('2d');
        if(backgroundImageToBitmapContext !== null){
            backgroundImageToBitmapContext.drawImage(backgroundImage, 0, 0);
        }
        const backgroundImageBitmap = backgroundImageToBitmapCanvas.transferToImageBitmap();

        // 画面表示に使用し、offscreenCanvasにtransferしてworkerへ渡すCanvasを定義
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        document.body.appendChild(canvas);
        const offscreenCanvas: OffscreenCanvas = canvas.transferControlToOffscreen();

        // workerの定義
        const worker = new Worker('worker.ts');
        // const workerApi = Comlink.wrap(worker);

        // workerへ描画用offscreenCanvasと背景画像のImageBitmapを送信

        // videoをImageBitmapへ変換してworkerへ送り続けるアニメーションループ関数を定義
        // アニメーションループ関数を実行
    }
}