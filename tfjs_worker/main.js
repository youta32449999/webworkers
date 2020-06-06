(async function start() {
    if (window.Worker) {
        // Workerの作成&Workerからのメッセージを受け取る処理を記述
        const worker = new Worker('worker.js');

        /*
            カメラの映像をoffscreenCanvasに描画して、offscreenCanvasになったcanvasからcaptureStreamでstreamを取得して
            それをvideoタグで再生する
         */
        const width = 400;
        const height = 300;

        // canvasを作成、document.bodyに追加&streamを取得
        // canvasをoffscreenCanvasに変換してworkerへ送信
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        // canvas.setAttribute('id', 'offscreenCanvas');
        const offscreenCanvasStream = canvas.captureStream();
        document.body.appendChild(canvas);
        const offscreenCanvas = canvas.transferControlToOffscreen();

        // 背景の画像を読み込んでworker用にbitmapへ変換
        const background = new Image();
        background.src = './assets/image/sabanna.jpg';
        background.onload = async () => {
            const backgroundImageCanvas = document.createElement('canvas');
            backgroundImageCanvas.width = width;
            backgroundImageCanvas.height = height;
            const backgroundImageCanvasContext = backgroundImageCanvas.getContext('2d');
            backgroundImageCanvasContext.drawImage(background, 0, 0, width, height);
            const backgroundImage = backgroundImageCanvasContext.getImageData(0, 0, width, height);
            const backgroundImageBitmap = await createImageBitmap(backgroundImage);

            worker.postMessage({canvas: offscreenCanvas, background: backgroundImageBitmap}, [offscreenCanvas]);
        };

        // offscreenCanvasのstreamをvideoで描画
        const offscreenCanvasVideo = document.createElement('video');
        offscreenCanvasVideo.videoWidth = width;
        offscreenCanvasVideo.videoHeight = height;
        offscreenCanvasVideo.setAttribute('autoplay', 'autoplay');
        offscreenCanvasVideo.srcObject = offscreenCanvasStream;
        await document.body.appendChild(offscreenCanvasVideo);

        // カメラのstreamを取得してstreamを再生
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
        const video = document.createElement('video');
        video.srcObject = stream;
        document.body.appendChild(video);
        await video.play();

        // videoからbitmapを作成するcanvasを作成
        const videoToBitmapCanvas = document.createElement('canvas');
        videoToBitmapCanvas.width = width;
        videoToBitmapCanvas.height = height;
        const videoToBitmapContext = videoToBitmapCanvas.getContext('2d');

        async function update() {
            // requestAnimationFrame(update);

            videoToBitmapContext.drawImage(video, 0, 0, width, height);
            const imageData = videoToBitmapContext.getImageData(0, 0, width, height);
            const imageBitmap = await createImageBitmap(imageData);

            // Workerへデータを送信
            worker.postMessage(imageBitmap, [imageBitmap]);
        }

        await update();

        // mask処理が終わる度に次に処理するのフレームを送信
        worker.onmessage = async function (e) {
            await update();
        };
    }
})();

