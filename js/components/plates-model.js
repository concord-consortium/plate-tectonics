import React, { PureComponent } from 'react';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import { getURLParam } from '../utils';
import getImgData from '../get-img-data';
import presets from '../plates-model/presets';
import TopView from './top-view';

import '../../css/plates-model.less';

export default class PlatesModel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modelWidth: 512,
      modelHeight: 512,
      modelInput: {
        targetStepIdx: Infinity, // it means that simulation will be running
        hotSpotsRendering: false,
        platesRendering: false,
        plateBoundariesRendering: true,
        // Defines rendering of cross section.
        crossSectionPoint1: null,
        crossSectionPoint2: null,
      },
    };
    // We don't need to keep it in react state. Model output affects model rendering which is done outside React.
    this.modelOutput = {};

    this.handleCrossSectionYChange = this.handleCrossSectionYChange.bind(this);
    this.handleHotSpotsRenderingChange = this.handleHotSpotsRenderingChange.bind(this);
    this.handlePlatesRenderingChange = this.handlePlatesRenderingChange.bind(this);
    this.handlePlateBoundariesRenderingChange = this.handlePlateBoundariesRenderingChange.bind(this);
    this.handleSimEnabledChange = this.handleSimEnabledChange.bind(this);
    this.handleCrossSectionPointsChange = this.handleCrossSectionPointsChange.bind(this);
    this.handleStepClicked = this.handleStepClicked.bind(this);
    this.renderModel = this.renderModel.bind(this);
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
      const crossSectionPoint1 = { x: modelWidth * 0.03, y: modelHeight * 0.5 };
      const crossSectionPoint2 = { x: modelWidth * 0.97, y: modelHeight * 0.5 };
      const newInput = Object.assign({}, this.state.modelInput, { crossSectionPoint1, crossSectionPoint2 });
      this.setState({ modelWidth, modelHeight, modelInput: newInput }, () => {
        // Warning: try to start model only when width and height is already set. Otherwise, renderers might fail.
        const { modelInput } = this.state;
        this.modelWorker.postMessage({
          type: 'load',
          imageData,
          presetName,
          input: modelInput,
        });
      });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { modelInput } = this.state;
    if (prevState.modelInput !== modelInput) {
      this.modelWorker.postMessage({ type: 'input', input: modelInput });
    }
  }

  setModelInput(newInput, callback) {
    const { modelInput } = this.state;
    this.setState({ modelInput: Object.assign({}, modelInput, newInput) }, callback);
  }

  handleSimEnabledChange(event, value) {
    this.setModelInput({ targetStepIdx: value ? Infinity : this.modelOutput.stepIdx });
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

  handleCrossSectionPointsChange(crossSectionPoint1, crossSectionPoint2) {
    this.setModelInput({ crossSectionPoint1, crossSectionPoint2 });
  }

  handleStepClicked() {
    const { targetStepIdx } = this.state.modelInput;
    this.setModelInput({ targetStepIdx: Math.max(targetStepIdx + 1, this.modelOutput.stepIdx + 1) });
  }

  handleModelOutput(output) {
    this.modelOutput = output;
    this.renderModel();
  }

  renderTopView() {
    const { topViewImgData, hotSpots } = this.modelOutput;
    this.topView.renderCanvas(topViewImgData, hotSpots);
  }

  renderCrossSection() {
    const { crossSectionImgData } = this.modelOutput;
    if (!crossSectionImgData) return;
    if (crossSectionImgData.width !== this.crossSection.width) {
      this.crossSection.width = crossSectionImgData.width;
    }
    if (crossSectionImgData.height !== this.crossSection.height) {
      this.crossSection.height = crossSectionImgData.height;
    }
    const ctx = this.crossSection.getContext('2d');
    ctx.putImageData(crossSectionImgData, 0, 0);
  }

  renderModel() {
    this.renderTopView();
    this.renderCrossSection();
  }

  render() {
    const { modelHeight, modelWidth } = this.state;
    const { targetStepIdx, hotSpotsRendering, platesRendering, plateBoundariesRendering,
            crossSectionPoint1, crossSectionPoint2 } = this.state.modelInput;
    const simRunning = targetStepIdx === Infinity;
    return (
      <div className="plates-model">
        <div>
          <div>
            <TopView
              ref={(c) => { this.topView = c; }} width={modelWidth} height={modelHeight}
              crossSectionPoint1={crossSectionPoint1} crossSectionPoint2={crossSectionPoint2}
              onCrossSectionPointsChange={this.handleCrossSectionPointsChange}
            />
          </div>
        </div>
        <div>
          <div>
            Cross section view defined by points P1 and P2:
            <br /><br />
            <canvas ref={(c) => { this.crossSection = c; }} />
          </div>
        </div>
        <div>
          <Toggle
            label="Simulation" labelPosition="right"
            toggled={simRunning} onToggle={this.handleSimEnabledChange}
          />
          <RaisedButton
            label="Simulation step" disabled={simRunning} onClick={this.handleStepClicked} style={{ margin: '5px 0' }}
          />
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
