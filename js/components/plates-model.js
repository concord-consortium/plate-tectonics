import React, { PureComponent } from 'react';
import Slider from 'material-ui/Slider';
import Toggle from 'material-ui/Toggle';
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
      hotSpotsRendering: false,
    };
    this.rafCallback = this.rafCallback.bind(this);
    this.handleCrossSectionYChange = this.handleCrossSectionYChange.bind(this);
    this.handleRenderHotSpotsChange = this.handleRenderHotSpotsChange.bind(this);
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
    const { crossSectionY, hotSpotsRendering } = this.state;
    this.rafId = requestAnimationFrame(this.rafCallback);
    this.model.step();
    renderTopView(this.topView, this.model.maxHeight);
    if (hotSpotsRendering) {
      renderHotSpots(this.topView, this.model.hotSpots);
    }
    renderCrossSection(this.crossSectionView, this.model.points, HEIGHT - Math.round(crossSectionY));
  }

  handleCrossSectionYChange(event, value) {
    this.setState({ crossSectionY: Math.round(value) });
  }

  handleRenderHotSpotsChange(event, value) {
    this.setState({ hotSpotsRendering: value });
  }

  render() {
    const { crossSectionY, hotSpotsRendering } = this.state;
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
        <div>
          <Toggle
            label='"Hot spots" rendering' labelPosition="right"
            toggled={hotSpotsRendering} onToggle={this.handleRenderHotSpotsChange}
          />
        </div>
      </div>
    );
  }
}
