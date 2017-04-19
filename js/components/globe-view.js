import React, { PureComponent } from 'react';
import * as THREE from 'three';
import 'imports?THREE=three!three/examples/js/controls/OrbitControls';

export default class GlobeView extends PureComponent {
  setTexture(sourceCanvas) {
    const { width, height } = this.props;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setSize(width, height);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    this.camera.position.z = 500;
    this.scene.add(this.camera);

    this.texture = new THREE.Texture(sourceCanvas);
    const material = new THREE.MeshBasicMaterial({ map: this.texture });
    const geometry = new THREE.SphereGeometry(width * 0.4, 64, 64);
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enablePan = false;
    this.controls.rotateSpeed = 0.5;
    this.controls.zoomSpeed = 0.5;

    this.renderCanvas = this.renderCanvas.bind(this);
    this.renderCanvas();
  }

  renderCanvas() {
    window.requestAnimationFrame(this.renderCanvas);
    this.renderer.render(this.scene, this.camera);
  }

  // Expose that via API rather than React properties.
  update() {
    this.texture.needsUpdate = true;
  }

  render() {
    const { height, width } = this.props;
    return (
      <div ref={(d) => { this.container = d; }} className="globe-view" style={{ width, height }}>
        <canvas ref={(c) => { this.canvas = c; }} className="globe-view" width={width} height={height} />
      </div>
    );
  }
}

GlobeView.propTypes = {
  width: React.PropTypes.number,
  height: React.PropTypes.number,
};
