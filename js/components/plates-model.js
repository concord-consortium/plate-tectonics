import React, { PureComponent } from 'react';
import Slider from 'material-ui/Slider';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import loadModel from '../plates-model/load-model';
import renderTopView from '../plates-model/render-top-view';
import renderHotSpots from '../plates-model/render-hot-spots';
import renderCrossSection from '../plates-model/render-cross-section';
import ModelWorker from 'worker-loader?inline!../plates-model/model.worker';
import { getURLParam } from '../utils';

import '../../css/plates-model.less';

export default class PlatesModel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modelWidth: 512,
      modelHeight: 512,
      crossSectionY: 10,
      hotSpotsRendering: false,
      platesRendering: false,
      plateBoundariesRendering: true,
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
    this.handleCanvasClick = this.handleCanvasClick.bind(this);
  }

  componentDidMount() {
    this.worker = new ModelWorker();
    this.worker.addEventListener('message', (event) => {
      console.log('msg');
      if (event.data.type === 'loaded') {
        this.modelLoaded(event.data);
      } else if (event.data.type === 'step') {
        this.worker.postMessage({ type: 'step' });
        this.renderPoints(event.data.points);
      }
    });

    loadModel(getURLParam('preset') || 'continentalCollision', (model) => {
      this.worker.postMessage({ type: 'load', model });
    });
  }

  modelLoaded(data) {
    this.setState({ modelWidth: data.width, modelHeight: data.height, crossSectionY: data.height * 0.5 }, () => {
      this.renderPoints(data.points);
    });
    this.worker.postMessage({ type: 'step' });
  }

  renderPoints(points) {
    const { modelHeight, crossSectionY, platesRendering, plateBoundariesRendering } = this.state;
    renderTopView(this.topView, points, platesRendering ? 'plates' : 'height', plateBoundariesRendering);
    const crossY = modelHeight - Math.round(crossSectionY);
    renderCrossSection(this.crossSectionView, points, crossY, platesRendering ? 'plates' : 'type');
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

  handleCanvasClick(event) {
    const x = event.pageX - event.target.offsetLeft;
    const y = event.pageY - event.target.offsetTop;
    console.log(this.model.getPointAt(x, y));
  }

  renderModel() {
    const { modelHeight, crossSectionY, hotSpotsRendering, platesRendering, plateBoundariesRendering } = this.state;
    renderTopView(this.topView, this.model.points, platesRendering ? 'plates' : 'height', plateBoundariesRendering);
    if (hotSpotsRendering) {
      renderHotSpots(this.topView, this.model.hotSpots);
    }
    const crossY = modelHeight - Math.round(crossSectionY);
    renderCrossSection(this.crossSectionView, this.model.points, crossY, platesRendering ? 'plates' : 'type');
  }

  render() {
    const { modelHeight, modelWidth, crossSectionY, simEnabled, hotSpotsRendering,
            platesRendering, plateBoundariesRendering } = this.state;
    return (
      <div className="plates-model">
        <div>
          <div>
            <canvas
              ref={(c) => { this.topView = c; }} width={modelWidth} height={modelHeight}
              onClick={this.handleCanvasClick}
            />
            <div className="slider">
              <Slider
                style={{ height: modelHeight }} axis="y" min={1} max={modelHeight} step={1}
                value={crossSectionY} onChange={this.handleCrossSectionYChange}
              />
            </div>
          </div>
        </div>
        <div>
          <div>
            <canvas ref={(c) => { this.crossSectionView = c; }} width={modelWidth} height={100} />
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
