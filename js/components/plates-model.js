import React, { PureComponent } from 'react';
import Model from '../plates-model/model';
import renderTopView from '../plates-model/render-top-view';
import renderHotSpots from '../plates-model/render-hot-spots';
import renderCrossSection from '../plates-model/render-cross-section';

const WIDTH = 512;
const HEIGHT = 512;

export default class PlatesModel extends PureComponent {
  constructor(props) {
    super(props);
    this.rafCallback = this.rafCallback.bind(this);
  }

  componentDidMount() {
    this.model = new Model({
      width: WIDTH,
      height: HEIGHT,
    });
    window.model = this.model;
    window.mComp = this;
    this.rafCallback();
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.rafId);
  }

  rafCallback() {
    this.rafId = requestAnimationFrame(this.rafCallback);
    this.model.step();
    renderTopView(this.topView, this.model.maxHeight);
    //renderHotSpots(this.topView, this.model.hotSpots);
    renderCrossSection(this.crossSectionView, this.model.points, HEIGHT * 0.5);
  }

  render() {
    return (
      <div>
        <div>
          Top view:
          <canvas ref={(c) => { this.topView = c; }} width={WIDTH} height={HEIGHT} />
        </div>
        <div>
          Cross section:
          <canvas ref={(c) => { this.crossSectionView = c; }} width={WIDTH} height={100} />
        </div>
      </div>
    );
  }
}
