<template>
  <div>
    <h1>OpenSeadoragon + PIXI</h1>

    <div id="imageContainer" ref="imageContainer" />

    <input type="file" @change="onInputfileChange" />
    <button @click="onPanButtonClick">Pan</button>
  </div>
</template>

<script>
import OpenSeadragon from 'openseadragon'
import OpenSeadragonImagingHelper from '@openseadragon-imaging/openseadragon-imaginghelper';
import * as PIXI from 'pixi.js'
import probe from 'probe-image-size/sync';
import uriToBuffer from 'data-uri-to-buffer';

export default {
  data() {
    return {
      viewer: undefined,
      viewerImagingHelper: undefined,
      annotationCanvas: undefined,
      pixiApp: undefined,
      container: undefined,
      imageSize: undefined,
      mouseNavEnabled: false,
    };
  },
  mounted() {
    this.viewer = OpenSeadragon({
      element: this.$refs.imageContainer,
      showNavigationControl: false,
      mouseNavEnabled: this.mouseNavEnabled,
    });
    this.viewerImagingHelper = this.viewer.activateImagingHelper({
      onImageViewChanged: (event) => {
        const { zoomFactor, viewportOrigin } = event;
        this.container.scale.set(zoomFactor)

        const x = - viewportOrigin.x * event.zoomFactor * this.imageSize.width;
        const y = - viewportOrigin.y * event.zoomFactor * this.imageSize.height

        this.container.position.set(x, y)
      }
    });

    this.annotationCanvas = document.createElement('canvas');
    this.annotationCanvas.id = 'annotationCanvas'

    this.viewer.canvas.appendChild(this.annotationCanvas);

    this.pixiApp = new PIXI.Application({
      view: this.annotationCanvas,
      width: 800,
      height: 600,
      transparent: true,
      roundPixels: true,
      antialias: false,
      autoResize: false,
      resolution: 1,
    })
  },
  methods: {
    onInputfileChange(event) {
      const files = event.target.files;

      if (files.length === 0) {
        return
      }

      const reader = new FileReader()

      reader.addEventListener('load', () => {
        const url = reader.result

        this.viewer.open({
          type: 'image',
          url,
        })

        this.pixiApp.stage.removeChildren()
        this.container = undefined;

        const buffer = uriToBuffer(reader.result)
        const result = probe(buffer)

        this.imageSize = { width: result.width, height: result.height };

        this.container = new PIXI.Container()
        this.container.width = this.imageSize.width
        this.container.height = this.imageSize.height

        const graphics = new PIXI.Graphics()
        graphics.beginFill(0xff0000)
        graphics.drawCircle(result.width / 2, result.height / 2, 100)

        this.container.addChild(graphics)

        this.pixiApp.stage.addChild(this.container)
      });
      reader.readAsDataURL(files[0])
    },
    onPanButtonClick() {
      this.mouseNavEnabled = !this.mouseNavEnabled
      this.viewer.setMouseNavEnabled(this.mouseNavEnabled)
    }
  }
}
</script>

<style>

#imageContainer {
  width: 800px;
  height: 600px;
}

#annotationCanvas {
  position: absolute;
  top: 0;
  width: 800px;
  height: 600px;
}

</style>
