import * as BABYLON from '@babylonjs/core';
import 'babylon-vrm-loader';

import {initPose} from './pose';
import {TransformNode} from "@babylonjs/core/Meshes/transformNode";
import {Vector3} from "@babylonjs/core";

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
    new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, -1), scene);
    const vrmManager = scene.metadata.vrmManagers[0];

    // Update secondary animation
    scene.onBeforeRenderObservable.add(() => {
        vrmManager.update(scene.getEngine().getDeltaTime());
    });
//
// // Model Transformation
//     vrmManager.rootMesh.translate(new BABYLON.Vector3(1, 0, 0), 1);

    // 初期ポーズ
    vrmManager.humanoidBone.leftShoulder.rotation = new BABYLON.Vector3(initPose.leftShoulder.x, initPose.leftShoulder.y, initPose.leftShoulder.z);
    vrmManager.humanoidBone.rightShoulder.rotation = new BABYLON.Vector3(initPose.rightShoulder.x, initPose.rightShoulder.y, initPose.rightShoulder.z);
    vrmManager.humanoidBone.leftUpperArm.rotation = new BABYLON.Vector3(initPose.leftUpperArm.x, initPose.leftUpperArm.y, initPose.leftUpperArm.z);
    vrmManager.humanoidBone.rightUpperArm.rotation = new BABYLON.Vector3(initPose.rightUpperArm.x, initPose.rightUpperArm.y, initPose.rightUpperArm.z);
    vrmManager.humanoidBone.leftLowerArm.rotation = new BABYLON.Vector3(initPose.leftLowerArm.x, initPose.leftLowerArm.y, initPose.leftLowerArm.z);
    vrmManager.humanoidBone.rightLowerArm.rotation = new BABYLON.Vector3(initPose.rightLowerArm.x, initPose.rightLowerArm.y, initPose.rightLowerArm.z);

    engine.runRenderLoop(function () {
        scene.render();
    });
}

main();
