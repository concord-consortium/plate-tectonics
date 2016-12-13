import React, { PureComponent } from 'react';
import Slider from 'material-ui/Slider';
import Model from '../plates-model/model';
import renderTopView from '../plates-model/render-top-view';
import renderHotSpots from '../plates-model/render-hot-spots';
import renderCrossSection from '../plates-model/render-cross-section';

import '../../css/plates-model.less';

const WIDTH = 512;
const HEIGHT = 512;

export default class PlatesModel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      crossSectionY: HEIGHT * 0.5,
    };
    this.rafCallback = this.rafCallback.bind(this);
    this.handleCrossSectionYChange = this.handleCrossSectionYChange.bind(this);
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
    const { crossSectionY } = this.state;
    this.rafId = requestAnimationFrame(this.rafCallback);
    this.model.step();
    renderTopView(this.topView, this.model.maxHeight);
    //renderHotSpots(this.topView, this.model.hotSpots);
    renderCrossSection(this.crossSectionView, this.model.points, HEIGHT - Math.round(crossSectionY));
  }

  handleCrossSectionYChange(event, value) {
    this.setState({ crossSectionY: Math.round(value) });
  }

  render() {
    const { crossSectionY } = this.state;
    return (
      <div className="plates-model">
        <div>
          <div>
            <canvas ref={(c) => { this.topView = c; }} width={WIDTH} height={HEIGHT} />
            <div className="slider">
              <Slider
                style={{ height: HEIGHT }} axis="y" min={1} max={HEIGHT} step={1}
                value={crossSectionY} onChange={this.handleCrossSectionYChange}
              />
            </div>
          </div>
        </div>
        <div>
          <div>
            <canvas ref={(c) => { this.crossSectionView = c; }} width={WIDTH} height={100} />
          </div>
        </div>
      </div>
    );
  }
}
