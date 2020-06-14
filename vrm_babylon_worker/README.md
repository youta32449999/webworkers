## 各Boneの回転
```typescript
    /*
        x: 回転軸が画面水平方向の回転(前後に振る)
        y: 回転軸が画面垂直方向の回転(左右の回転)
        z: 回転軸が画面と垂直方向(画面から突き出る方向)の回転(左右に首を傾げる)
     */
    const rotationVec = new BABYLON.Vector3(0, 0.2, 0.2);
    vrmManager.humanoidBone.head.rotation = rotationVec;
    vrmManager.humanoidBone.neck.rotation = rotationVec;

    /*
        axis: new BABYLON.Vector(1, 0, 0) -> x軸方向にamount回転
        axis: new BABYLON.Vector(1, 1, 0) -> x, y軸それぞれamount回転
     */
    vrmManager.humanoidBone.head.rotate(new BABYLON.Vector3(0, 1, 0), 0.2);
```

## 表情パターン
```typescript
    /*
        Work with BlendShape(MorphTarget)
        ・表情パターン
          Joy, Angry, Fun, Sorrow, Neutral(全部大文字でないので注意)
        ・口の形
          A, I, U, E, O
        ・目の開度
          Blink, Blink_L, Blink_R(1.0: 全閉, 0.0: 全開)
     */
    vrmManager.morphing('Joy', 1.0);
```