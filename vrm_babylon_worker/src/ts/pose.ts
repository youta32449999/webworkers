class Vec {
    constructor(readonly x: number, readonly y: number, readonly z: number) {
    }
}

export const initPose = {
    leftShoulder: new Vec(0, 0, 0.2),
    rightShoulder: new Vec(0, 0,-0.2),
    leftUpperArm: new Vec(0, 0, 1.1),
    rightUpperArm: new Vec(0, 0, -1.1),
    leftLowerArm: new Vec(0, 0, 0.1),
    rightLowerArm: new Vec(0, 0, -0.1)
};