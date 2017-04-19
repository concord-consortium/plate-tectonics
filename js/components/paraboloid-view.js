import React, {PureComponent} from 'react';
import * as THREE from 'three';
import 'imports?THREE=three!three/examples/js/controls/OrbitControls';

export default class ParaboloidView extends PureComponent {
  constructor(props) {
    super(props);

    this.renderCanvas = this.renderCanvas.bind(this);
    this.handleMouseDown = this.handleMoseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }
  setTexture(sourceCanvas) {
    const { width, height } = this.props;

    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
    this.renderer.setSize(width, height);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(20, width / height, 1, 1000);
    this.camera.position.z = 500;
    this.camera.position.y = -150;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    const segments = 100;
    const plane = new THREE.PlaneGeometry(400, 400, segments, segments);
    for (let i = 0; i < plane.vertices.length; i += 1) {
      const x = plane.vertices[i].x;
      const y = plane.vertices[i].y;
      plane.vertices[i].z = -(x * x + y * y) / 150;
    }

    this.texture = new THREE.Texture(sourceCanvas);
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.wrapT = THREE.RepeatWrapping;
    const material = new THREE.MeshBasicMaterial({map: this.texture});
    const mesh = new THREE.Mesh(plane, material);
    this.scene.add(mesh);

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

  getCursorsCoords(event) {
    return { x: event.pageX - this.container.offsetLeft, y: event.pageY - this.container.offsetTop };
  }

  handleMoseDown() {
    this._mouseDown = true;
    this._prevPos = null;
  }

  handleMouseMove(event) {
    if (!this._mouseDown) return;
    const pos = this.getCursorsCoords(event);
    if (this._prevPos) {
      const xDiff = this._prevPos.x - pos.x;
      const yDiff = pos.y - this._prevPos.y;
      this.texture.offset.x += xDiff / 200;
      this.texture.offset.y += yDiff / 200;
    }
    this._prevPos = pos;
  }

  handleMouseUp() {
    this._mouseDown = false;
  }

  render() {
    const { height, width } = this.props;
    return (
      <div
        ref={(d) => { this.container = d; }} className="paraboloid-view" style={{width, height}}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
      >
        <canvas ref={(c) => { this.canvas = c; }} className="paraboloid-view" width={width} height={height} />
      </div>
    );
  }
}

ParaboloidView.propTypes = {
  width: React.PropTypes.number,
  height: React.PropTypes.number,
};
