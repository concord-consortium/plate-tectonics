import React, { PureComponent } from 'react';
import Slider from 'material-ui/Slider';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import Model from '../plates-model/model';
import renderTopView from '../plates-model/render-top-view';
import renderHotSpots from '../plates-model/render-hot-spots';
import renderCrossSection from '../plates-model/render-cross-section';
import { getURLParam } from '../utils';

import '../../css/plates-model.less';

const WIDTH = 512;
const HEIGHT = 512;

export default class PlatesModel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      crossSectionY: HEIGHT * 0.5,
      hotSpotsRendering: false,
      platesRendering: false,
      plateBoundariesRendering: false,
      simEnabled: true,
    };
    this.rafCallback = this.rafCallback.bind(this);
    this.step = this.step.bind(this);
    this.renderModel = this.renderModel.bind(this);
    this.handleCrossSectionYChange = this.handleCrossSectionYChange.bind(this);
    this.handleHotSpotsRenderingChange = this.handleHotSpotsRenderingChange.bind(this);
    this.handlePlatesRenderingChange = this.handlePlatesRenderingChange.bind(this);
    this.handlePlateBoundariesRenderingChange = this.handlePlateBoundariesRenderingChange.bind(this);
    this.handleSimEnabledChange = this.handleSimEnabledChange.bind(this);
  }

  componentDidMount() {
    const { simEnabled } = this.state;
    this.model = new Model({
      width: WIDTH,
      height: HEIGHT,
      preset: getURLParam('preset') || 'continentalCollision',
    });
    window.model = this.model;
    window.mComp = this;
    if (simEnabled) {
      this.startSimulation();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { simEnabled } = this.state;
    if (simEnabled && !prevState.simEnabled) {
      this.startSimulation();
    }
  }

  componentWillUnmount() {
    this.stopSimulation();
  }

  startSimulation() {
    this.rafCallback();
  }

  stopSimulation() {
    cancelAnimationFrame(this.rafId);
  }

  rafCallback() {
    const { simEnabled } = this.state;
    if (simEnabled) {
      this.rafId = requestAnimationFrame(this.rafCallback);
      this.step();
    }
  }

  step() {
    this.model.step();
    this.renderModel();
  }

  handleSimEnabledChange(event, value) {
    this.setState({ simEnabled: value });
  }

  handleCrossSectionYChange(event, value) {
    this.setState({ crossSectionY: Math.round(value) }, this.renderModel);
  }

  handleHotSpotsRenderingChange(event, value) {
    this.setState({ hotSpotsRendering: value }, this.renderModel);
  }

  handlePlatesRenderingChange(event, value) {
    this.setState({ platesRendering: value }, this.renderModel);
  }

  handlePlateBoundariesRenderingChange(event, value) {
    this.setState({ plateBoundariesRendering: value }, this.renderModel);
  }

  renderModel() {
    const { crossSectionY, hotSpotsRendering, platesRendering, plateBoundariesRendering } = this.state;
    renderTopView(this.topView, this.model.points, platesRendering ? 'plates' : 'height', plateBoundariesRendering);
    if (hotSpotsRendering) {
      renderHotSpots(this.topView, this.model.hotSpots);
    }
    const crossY = HEIGHT - Math.round(crossSectionY);
    renderCrossSection(this.crossSectionView, this.model.points, crossY, platesRendering ? 'plates' : 'type');
  }

  render() {
    const { crossSectionY, simEnabled, hotSpotsRendering, platesRendering, plateBoundariesRendering } = this.state;
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
            label="Simulation" labelPosition="right"
            toggled={simEnabled} onToggle={this.handleSimEnabledChange}
          />
          <RaisedButton label="Simulation step" disabled={simEnabled} onClick={this.step} style={{ margin: '5px 0' }} />
          <Toggle
            label='"Hot spots" rendering' labelPosition="right"
            toggled={hotSpotsRendering} onToggle={this.handleHotSpotsRenderingChange}
          />
          <Toggle
            label="Plates rendering" labelPosition="right"
            toggled={platesRendering} onToggle={this.handlePlatesRenderingChange}
          />
          <Toggle
            label="Plate boundaries rendering" labelPosition="right"
            toggled={plateBoundariesRendering} onToggle={this.handlePlateBoundariesRenderingChange}
          />
        </div>
      </div>
    );
  }
}
