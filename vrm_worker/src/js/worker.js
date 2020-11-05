importScripts(
    // three.js & three-vrm
    "/lib/three.js"
    , "/lib/GLTFloader.js"
    , "https://unpkg.com/@pixiv/three-vrm@0.1/lib/three-vrm.js"
    , "https://cdn.jsdelivr.net/npm/comlink@4.3.0/dist/umd/comlink.min.js"
);

const modelPath = '/assets/vrm//AliciaSolid.vrm';

let offscreenCanvas = null;
let offscreenCtx = null;
let backgroundImage = null;
let vrmCanvas = null;
let offscreenRenderingCanvas = null;
let offscreenRenderingContext = null;
let currentVRM = null;
let clock = null;
let width = 0;
let height = 0;


Comlink.expose({
    init: async (canvas, bitmap) => {
        // 画面へ描画するcanvas
        offscreenCanvas = canvas;
        offscreenCtx = canvas.getContext('2d');

        width = offscreenCanvas.width;
        height = offscreenCanvas.height;

        // 背景画像
        backgroundImage = bitmap;

        // VRMモデルをレンダリングするoffscreenCanvas
        vrmCanvas = new OffscreenCanvas(width, height);
        vrmCanvas.style = {width: 0, height: 0}; // three.jsではこの指定が必要

        // rendererの作成
        const renderer = new THREE.WebGLRenderer({
            canvas: vrmCanvas,
            alpha: true,
            antialias: true,
            precision: "highp"
        });

        renderer.setSize(width, height);
        // 背景を透過する
        renderer.setClearColor(0x000000, 0);

        // cameraの作成
        const camera = new THREE.PerspectiveCamera(30.0, width / height, 0.01, 20.0);
        camera.position.set(0.0, 0.0, 5.0);

        // sceneの作成
        const scene = new THREE.Scene();

        // VRMモデルの読み込み
        function initVRM(gltf) {
            THREE.VRM.from(gltf).then((vrm) => {
                scene.add(vrm.scene);
                currentVRM = vrm;

                const hips = vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Hips); // Hipsボーンを取得
                hips.rotation.y = Math.PI; // Hipsボーンを180度回転、正面を向かせる

                vrm.humanoid.setPose({
                    [THREE.VRMSchema.HumanoidBoneName.LeftShoulder]: {
                        rotation: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.0, 0.0, 0.2)).toArray()
                    },
                    [THREE.VRMSchema.HumanoidBoneName.RightShoulder]: {
                        rotation: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.0, 0.0, -0.2)).toArray()
                    },
                    [THREE.VRMSchema.HumanoidBoneName.LeftUpperArm]: {
                        rotation: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.0, 0.0, 1.1)).toArray()
                    },
                    [THREE.VRMSchema.HumanoidBoneName.RightUpperArm]: {
                        rotation: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.0, 0.0, -1.1)).toArray()
                    },
                    [THREE.VRMSchema.HumanoidBoneName.LeftLowerArm]: {
                        rotation: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.0, 0.0, 0.1)).toArray()
                    },
                    [THREE.VRMSchema.HumanoidBoneName.RightLowerArm]: {
                        rotation: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.0, 0.0, -0.1)).toArray()
                    },
                });

                const head = vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Head);
                camera.position.set(0.0, head.getWorldPosition(new THREE.Vector3()).y, 2.0);

                vrm.lookAt.target = camera; // 常にカメラ方向を向く
            });
        }

        const loader = new THREE.GLTFLoader(); // vrmをGLTFLoaderで読み込む
        loader.load( // モデルを読み込む
            modelPath, // モデルデータのURL
            (gltf) => {
                initVRM(gltf);
            }, // モデルが読み込まれたあとの処理
            (progress) => {
                console.info((100.0 * progress.loaded / progress.total).toFixed(2) + '% loaded');
            }, // モデル読み込みの進捗を表示
            (error) => {
                console.error(error);
            } // モデル読み込み時のエラーを表示
        );

        // lightの作成
        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1.0, 1.0, 1.0).normalize();
        scene.add(light);

        // 表示用canvasへ転写するための絵を作成するcanvas
        offscreenRenderingCanvas = new OffscreenCanvas(width, height);
        offscreenRenderingContext = offscreenRenderingCanvas.getContext('2d');

        // 画面の更新処理(アニメーションなど)
        clock = new THREE.Clock();
        clock.start();

        // アニメーション開始
        update();

        function update() {
            requestAnimationFrame(update);

            const delta = clock.getDelta();

            if (currentVRM) { // VRMが読み込まれていれば
                // currentVRM.scene.rotation.y = Math.PI * Math.sin( clock.getElapsedTime() ); // VRMを回転する
                // const sin = Math.sin(Math.PI * clock.elapsedTime);

                // まばたきを実行
                executeBlink(currentVRM);

                // ポーズの変更
                // moveModelHead(currentVRM, poseState.rx, poseState.ry, poseState.rz);

                // 口パク
                // currentVRM.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.A, Math.random() * 2);

                currentVRM.update(delta); // VRMの各コンポーネントを更新

                renderer.render(scene, camera);

                // vrmの描画
                copyCanvas(vrmCanvas, offscreenRenderingCanvas, true);

                // 背景の合成
                offscreenRenderingContext.save();
                offscreenRenderingContext.globalCompositeOperation = "destination-atop";
                offscreenRenderingContext.drawImage(backgroundImage, 0, 0, width, height);
                offscreenRenderingContext.restore();

                // 作成した映像を表示してるcanvasへコピー
                copyCanvas(offscreenRenderingCanvas, offscreenCanvas);
            }
        };
    }
});

/**
 * まばたきの実装
 */
function executeBlink(vrm) {
    const random = Math.random();
    const isBlink = random < 0.005; // 確率でまばたきを実行
    if (isBlink) {
        // 目を閉じる
        vrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.Blink, 1);
        setTimeout(() => {
            // 目を開ける
            vrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.Blink, 0); // まばたきのウェイトを制御する
        }, 100); // まばたきの時間は0.1秒
    }
}

/**
 * 顔認識の結果をモデルに反映する
 */
function moveModelHead(vrm, rx, ry, rz) {
    vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Head).rotation.x = -rx * 1.2;
    vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Spine).rotation.x = -rx * 0.5;

    vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Head).rotation.y = -ry;
    vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Neck).rotation.y = -ry * 0.8;
    vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Spine).rotation.y = -ry * 0.5;

    vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Head).rotation.z = rz;
    vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Neck).rotation.z = rz;
    vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Spine).rotation.z = rz * 0.6;
}

/**
 * Canvasの内容をコピーする
 * @param srcCanvas コピー元
 * @param destCanvas コピー先
 * @param isDestClear コピー先のcanvasをclearしてからコピーするか
 */
function copyCanvas(srcCanvas, destCanvas, isDestClear = false) {
    if (isDestClear) {
        destCanvas.getContext('2d').clearRect(0, 0, destCanvas.width, destCanvas.height);
    }
    destCanvas.getContext('2d').drawImage(srcCanvas, 0, 0);
}
