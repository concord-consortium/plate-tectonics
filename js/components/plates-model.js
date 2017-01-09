import React, { PureComponent } from 'react';
import Slider from 'material-ui/Slider';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import { getURLParam } from '../utils';
import getImgData from '../get-img-data';
import presets from '../plates-model/presets';
import renderHotSpots from '../plates-model/render-hot-spots';

import '../../css/plates-model.less';

export default class PlatesModel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modelWidth: 512,
      modelHeight: 512,
      modelInput: {
        crossSectionY: 256,
        hotSpotsRendering: false,
        platesRendering: false,
        plateBoundariesRendering: true,
        simEnabled: true,
      },
    };
    this.handleCrossSectionYChange = this.handleCrossSectionYChange.bind(this);
    this.handleHotSpotsRenderingChange = this.handleHotSpotsRenderingChange.bind(this);
    this.handlePlatesRenderingChange = this.handlePlatesRenderingChange.bind(this);
    this.handlePlateBoundariesRenderingChange = this.handlePlateBoundariesRenderingChange.bind(this);
    this.handleSimEnabledChange = this.handleSimEnabledChange.bind(this);
    this.renderModel = this.renderModel.bind(this);

    // We don't need to keep it in react state. Model output affects model rendering which is done outside React.
    this.modelOutput = null;
  }

  componentDidMount() {
    // modelWorker.js is defined in model.worker.js and build by webpack.
    // There's worker-loader available, but it doesn't seem to work reliably and be well maintained.
    // Pass search part of the URL, so worker can read the URL configuration.
    this.modelWorker = new Worker(`modelWorker.js${window.location.search}`);
    this.modelWorker.addEventListener('message', (event) => {
      const type = event.data.type;
      if (type === 'output') {
        this.handleModelOutput(event.data.output);
      }
    });

    const presetName = getURLParam('preset') || 'continentalCollision';
    const modelImgSrc = presets[presetName].img;
    getImgData(modelImgSrc, (imageData) => {
      const modelWidth = imageData.width;
      const modelHeight = imageData.height;
      this.setState({ modelWidth, modelHeight }, () => {
        // Warning: try to start model only when width and height is already set. Otherwise, renderers might fail.
        const topViewCtx = this.topView.getContext('2d');
        const crossSectionCtx = this.topView.getContext('2d');
        const topViewImgData = topViewCtx.createImageData(this.topView.width, this.topView.height);
        const crossSectionImgData = crossSectionCtx.createImageData(this.crossSection.width, this.crossSection.height);
        this.modelWorker.postMessage({
          type: 'load',
          imageData,
          presetName,
          topViewImgData,
          crossSectionImgData,
          input: this.modelInput,
        });
      });
    });
  }

  setModelInput(newInput) {
    const { modelInput } = this.state;
    this.setState({ modelInput: Object.assign({}, modelInput, newInput) }, () => {
      this.modelWorker.postMessage({ type: 'input', input: this.modelInput });
    });
  }

  get modelInput() {
    const { modelHeight } = this.state;
    const { crossSectionY } = this.state.modelInput;
    const crossY = modelHeight - Math.round(crossSectionY);
    return Object.assign({}, this.state.modelInput, { crossY });
  }

  handleSimEnabledChange(event, value) {
    this.setModelInput({ simEnabled: value });
  }

  handleCrossSectionYChange(event, value) {
    this.setModelInput({ crossSectionY: Math.round(value) });
  }

  handleHotSpotsRenderingChange(event, value) {
    this.setModelInput({ hotSpotsRendering: value });
  }

  handlePlatesRenderingChange(event, value) {
    this.setModelInput({ platesRendering: value });
  }

  handlePlateBoundariesRenderingChange(event, value) {
    this.setModelInput({ plateBoundariesRendering: value });
  }

  handleModelOutput(output) {
    this.modelOutput = output;
    this.renderModel();
  }

  renderTopView() {
    const { topViewImgData } = this.modelOutput;
    if (!topViewImgData) return;
    const ctx = this.topView.getContext('2d');
    ctx.putImageData(topViewImgData, 0, 0);
  }

  renderCrossSection() {
    const { crossSectionImgData } = this.modelOutput;
    if (!crossSectionImgData) return;
    const ctx = this.crossSection.getContext('2d');
    ctx.putImageData(crossSectionImgData, 0, 0);
  }

  renderHotSpots() {
    const { hotSpots } = this.modelOutput;
    if (!hotSpots) return;
    renderHotSpots(this.topView, hotSpots);
  }

  renderModel() {
    this.renderTopView();
    this.renderHotSpots();
    this.renderCrossSection();
  }

  render() {
    const { modelHeight, modelWidth } = this.state;
    const { crossSectionY, simEnabled, hotSpotsRendering,
      platesRendering, plateBoundariesRendering } = this.state.modelInput;
    return (
      <div className="plates-model">
        <div>
          <div>
            <canvas
              ref={(c) => { this.topView = c; }} width={modelWidth} height={modelHeight}
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
