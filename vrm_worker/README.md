## vrmをWebWorkerで描画させる為の変更点
```js
// three.jsのImageLoaderをImageBitmapLoaderに変更
// WebWorker内ではImageオブジェクト(DOM)は使えないのでImageBitmapを使用する
- var loader = new ImageLoader( this.manager );
+ var loader = new ImageBitmapLoader( this.manager );
```