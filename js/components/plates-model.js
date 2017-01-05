import React, { PureComponent } from 'react';
import Slider from 'material-ui/Slider';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import { getURLParam } from '../utils';
import getImgData from '../get-img-data';
import presets from '../plates-model/presets';

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
    this.step = this.step.bind(this);
    this.handleCrossSectionYChange = this.handleCrossSectionYChange.bind(this);
    this.handleHotSpotsRenderingChange = this.handleHotSpotsRenderingChange.bind(this);
    this.handlePlatesRenderingChange = this.handlePlatesRenderingChange.bind(this);
    this.handlePlateBoundariesRenderingChange = this.handlePlateBoundariesRenderingChange.bind(this);
    this.handleSimEnabledChange = this.handleSimEnabledChange.bind(this);
    this.handleCanvasClick = this.handleCanvasClick.bind(this);
  }

  componentDidMount() {
    // modelWorker.js is defined in model.worker.js and build by webpack.
    this.modelWorker = new Worker('modelWorker.js');
    this.modelWorker.addEventListener('message', (event) => {
      const type = event.data.type;
      if (type === 'topViewImgData') {
        this.handleTopViewImgData(event.data.imgData);
      } else if (type === 'crossSectionImgData') {
        this.handleCrossSectionImgData(event.data.imgData);
      } else if (type === 'stepDone') {
        this.handleStepDone();
      }
    });

    const presetName = getURLParam('preset') || 'continentalCollision';
    const modelImgSrc = presets[presetName].img;
    getImgData(modelImgSrc, (imageData) => {
      const modelWidth = imageData.width;
      const modelHeight = imageData.height;
      this.setState({ modelWidth, modelHeight, crossSectionY: modelHeight * 0.5 }, () => {
        // Warning: try to start model only when width and height is already set. Otherwise, renderers might fail.
        const topViewCtx = this.topView.getContext('2d');
        const crossSectionCtx = this.topView.getContext('2d');
        const topViewImgData = topViewCtx.createImageData(this.topView.width, this.topView.height);
        const crossSectionImgData = crossSectionCtx.createImageData(this.crossSection.width, this.crossSection.height);
        this.modelWorker.postMessage({ type: 'load', imageData, presetName, topViewImgData, crossSectionImgData });
        this.renderModel();

        const { simEnabled } = this.state;
        if (simEnabled) {
          this.startSimulation();
        }
      });
    });
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
    this.step();
  }

  stopSimulation() {
  }

  step() {
    this.modelWorker.postMessage({ type: 'step' });
    this.renderModel();
  }

  handleStepDone() {
    const { simEnabled } = this.state;
    if (simEnabled) {
      this.step();
    }
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

  handleTopViewImgData(imgData) {
    const ctx = this.topView.getContext('2d');
    ctx.putImageData(imgData, 0, 0);
  }

  handleCrossSectionImgData(imgData) {
    const ctx = this.crossSection.getContext('2d');
    ctx.putImageData(imgData, 0, 0);
  }

  renderModel() {
    this.renderTopView();
    this.renderCrossSection();
  }

  renderTopView() {
    // Posts messages to worker. Worker will respond with updated / rendered image data
    // and #handleTopViewImgData will be called.
    const { hotSpotsRendering, platesRendering, plateBoundariesRendering } = this.state;
    this.modelWorker.postMessage({
      type: 'renderTopView',
      platesRendering,
      plateBoundariesRendering,
      hotSpotsRendering,
    });
  }

  renderCrossSection() {
    // Posts messages to worker. Worker will respond with updated / rendered image data
    // and #handleCrossSectionImgData will be called.
    const { modelHeight, crossSectionY, platesRendering } = this.state;
    const crossY = modelHeight - Math.round(crossSectionY);
    this.modelWorker.postMessage({
      type: 'renderCrossSection',
      platesRendering,
      crossY,
    });
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
            <canvas ref={(c) => { this.crossSection = c; }} width={modelWidth} height={100} />
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
