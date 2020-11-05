async function main() {
    if (window.Worker) {
        const width = 1000;
        const height = 800;

        // 背景画像を読み込み
        const backgroundImage = new Image();
        backgroundImage.src = '/assets/image/sabanna.jpg';
        await backgroundImage.decode();

        // 背景画像をImageBitmapに変換するoffscreenCanvasを定義&Bitmapを取得
        const backgroundImageToBitmapCanvas = new OffscreenCanvas(width, height);
        const backgroundImageToBitmapContext = backgroundImageToBitmapCanvas.getContext('2d');
        if (backgroundImageToBitmapContext !== null) {
            backgroundImageToBitmapContext.drawImage(backgroundImage, 0, 0, width, height);
        }
        const backgroundImageBitmap = backgroundImageToBitmapCanvas.transferToImageBitmap();

        // 画面表示に使用し、offscreenCanvasにtransferしてworkerへ渡すCanvasを定義
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        document.body.appendChild(canvas);
        const offscreenCanvas = canvas.transferControlToOffscreen();

        // workerの定義
        const worker = new Worker('/src/js/worker.js');
        const workerApi = await Comlink.wrap(worker);

        // workerへ描画用offscreenCanvasと背景画像のImageBitmapを送信
        await workerApi.init(
            Comlink.transfer(offscreenCanvas, [offscreenCanvas])
            , Comlink.transfer(backgroundImageBitmap, [backgroundImageBitmap])
        );
    }
}

main();