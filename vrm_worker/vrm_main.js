(async function start() {
    if (window.Worker) {
        // Workerの作成&Workerからのメッセージを受け取る処理を記述
        const worker = new Worker('vrm_worker.js');

        const width = 500;
        const height = 600;

        // canvasを作成、document.bodyに追加&streamを取得
        // canvasをoffscreenCanvasに変換してworkerへ送信
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const offscreenCanvasStream = canvas.captureStream();
        document.body.appendChild(canvas);
        const offscreenCanvas = canvas.transferControlToOffscreen();

        // 背景の画像を読み込んでworker用にbitmapへ変換
        const background = new Image();
        background.src = './sabanna.jpg';
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
        document.querySelector('#video').srcObject = offscreenCanvasStream;

        // /*
        //     顔認識処理
        //  */
        // // カメラのストリームを取得&バックグラウンドで再生
        // const stream = await getVideoStream();
        // const videoInput = document.createElement('video');
        // videoInput.srcObject = stream;
        // await videoInput.play();
        //
        // // 顔認識処理用のcanvasを作成
        // const faceRecognizeCanvas = document.createElement('canvas');
        // faceRecognizeCanvas.setAttribute('id', 'faceRecognize');
        // faceRecognizeCanvas.style.display = 'none';
        // document.body.appendChild(faceRecognizeCanvas);
        //
        // /**
        //  * 顔認識の準備が完了した時に実行する
        //  * @param errCode
        //  * @param spec
        //  */
        // function onReady(errCode, spec) {
        //     if (errCode) {
        //         console.log('AN ERROR HAPPENS. ERROR CODE =', errCode);
        //         return;
        //     }
        //     console.log('onReady');
        //     document.querySelector('#video').srcObject = offscreenCanvasStream;
        // }
        //
        // /**
        //  * 顔認識が完了するたびに実行する
        //  */
        // async function onDetect(detectState) {
        //     // console.log(detectState);
        //     // worker.postMessage({rx: detectState.rx, ry: detectState.ry, rz: detectState.rz});
        // }
        //
        //
        // // 顔認識の設定&開始
        // JEEFACEFILTERAPI.init({
        //     canvasId: 'faceRecognize',
        //     videoSettings: {videoElement: videoInput},
        //     NNCpath: './lib/', // ニューラルネットワークのモデルのJSONのPATH (NNC.json by default)
        //     followZRot: true, //　z軸の検出を行う
        //     maxFacesDetected: 1, // 顔検出は1つまで
        //     // 顔認識の準備が完了した時に実行する処理
        //     callbackReady: onReady,
        //     // 顔認識が完了するたびに呼び出される処理
        //     callbackTrack: onDetect
        // });
        //
        // /**
        //  * videoストリームを取得する
        //  * @returns {Promise<MediaStream>}
        //  */
        // async function getVideoStream() {
        //     // カメラのストリームを取得
        //     const stream = await navigator.mediaDevices.getUserMedia({
        //         video: true,
        //         audio: false
        //     });
        //     return stream;
        // }
    }
})();

