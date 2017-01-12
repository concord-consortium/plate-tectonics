import React, { PureComponent } from 'react';
import renderHotSpots from '../plates-model/render-hot-spots';

import '../../css/top-view.less';

export default class TopView extends PureComponent {
  constructor(props) {
    super(props);
    this.handleTopViewMouseDown = this.handleTopViewMouseDown.bind(this);
    this.handleTopViewMouseMove = this.handleTopViewMouseMove.bind(this);
    this.handleTopViewMouseUp = this.handleTopViewMouseUp.bind(this);
  }

  getCursorsCoords(event) {
    return { x: event.pageX - this.container.offsetLeft, y: event.pageY - this.container.offsetTop };
  }

  handleTopViewMouseDown(event) {
    this._drawingCrossSection = true;
    this._point1 = this.getCursorsCoords(event);
  }

  handleTopViewMouseMove(event) {
    if (this._drawingCrossSection) {
      this.notifyCrossSectionChanged(this._point1, this.getCursorsCoords(event));
    }
  }

  handleTopViewMouseUp() {
    this._drawingCrossSection = false;
  }

  notifyCrossSectionChanged(p1, p2) {
    const { onCrossSectionPointsChange } = this.props;
    onCrossSectionPointsChange(p1, p2);
  }

  // Expose that via API rather than React properties. It's using purely Canvas API.
  renderCanvas(imageData, hotSpots) {
    // Base image.
    if (!imageData) return;
    const ctx = this.canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    if (hotSpots) {
      renderHotSpots(this.canvas, hotSpots);
    }
  }

  render() {
    const { height, width, crossSectionPoint1, crossSectionPoint2 } = this.props;
    const p1 = crossSectionPoint1;
    const p2 = crossSectionPoint2;
    return (
      <div
        ref={(d) => { this.container = d; }} className="top-view" style={{ width, height }}
        onMouseDown={this.handleTopViewMouseDown} onMouseMove={this.handleTopViewMouseMove}
        onMouseUp={this.handleTopViewMouseUp}
      >
        <canvas ref={(c) => { this.canvas = c; }} className="top-view" width={width} height={height} />
        <svg width={width} height={height}>
          { p1 && p2 &&
            <g>
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} strokeWidth="2" stroke="#fff" />
              <circle cx={p1.x} cy={p1.y} r={10} fill="#fff" strokeWidth="0.5" stroke="#666" />
              <text x={p1.x} y={p1.y} textAnchor="middle" fill="#333" dy=".3em">P1</text>
              <circle cx={p2.x} cy={p2.y} r={10} fill="#fff" strokeWidth="0.5" stroke="#666" />
              <text x={p2.x} y={p2.y} textAnchor="middle" fill="#333" dy=".3em">P2</text>
            </g>
          }
        </svg>
      </div>
    );
  }
}

TopView.propTypes = {
  width: React.PropTypes.number,
  height: React.PropTypes.number,
  onCrossSectionPointsChange: React.PropTypes.func,
  crossSectionPoint1: React.PropTypes.object,
  crossSectionPoint2: React.PropTypes.object,
};
