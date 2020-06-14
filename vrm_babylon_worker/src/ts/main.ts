import * as BABYLON from '@babylonjs/core';
import 'babylon-vrm-loader';

async function main() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    // Get the canvas DOM element
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);
    // Load the 3D engine
    const engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
    const scene = await BABYLON.SceneLoader.LoadAsync(
        'http:',
        './assets/vrm/AliciaSolid.vrm',
        engine
    );
    const camera = new BABYLON.ArcRotateCamera('camera1', 0, 0, 3, new BABYLON.Vector3(0, 1, 0), scene);
    camera.setTarget(new BABYLON.Vector3(0, 1, 0));
    camera.setPosition(new BABYLON.Vector3(0, 1, -1.5));
    camera.minZ = 0.2;
    camera.wheelDeltaPercentage = 0.01;
    camera.attachControl(canvas, false);
    new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, -1), scene);
    const vrmManager = scene.metadata.vrmManagers[0];

    // Update secondary animation
    scene.onBeforeRenderObservable.add(() => {
        vrmManager.update(scene.getEngine().getDeltaTime());
    });
//
// // Model Transformation
//     vrmManager.rootMesh.translate(new BABYLON.Vector3(1, 0, 0), 1);
//
// // Work with HumanoidBone
//     vrmManager.humanoidBone.leftUpperArm.addRotation(0, 1, 0);
//
// //

    /*
        Work with BlendShape(MorphTarget)
        ・表情パターン
          Joy, Angry, Fun, Sorrow, Neutral(全部大文字でないので注意)
        ・口の形
          A, I, U, E, O
        ・目の開度
          Blink, Blink_L, Blink_R(1.0: 全閉, 0.0: 全開)
     */
    vrmManager.morphing('Sorrow', 1.0);

    engine.runRenderLoop(function () {
        scene.render();
    });
}

main();
