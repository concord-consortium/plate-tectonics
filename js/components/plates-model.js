import React, { PureComponent } from 'react';
import Toggle from 'material-ui/Toggle';
import { getURLParam } from '../utils';
import getImgData from '../get-img-data';
import presets from '../plates-model/presets';
import renderHotSpots from '../plates-model/render-hot-spots';

import '../../css/plates-model.less';

function getCursorsCoords(event) {
  const el = event.target;
  return { x: event.pageX - el.offsetLeft, y: event.pageY - el.offsetTop };
}

export default class PlatesModel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modelWidth: 512,
      modelHeight: 512,
      modelInput: {
        hotSpotsRendering: false,
        platesRendering: false,
        plateBoundariesRendering: true,
        simEnabled: true,
        // Defines rendering of cross section.
        crossSectionPoint1: null,
        crossSectionPoint2: null,
      },
    };
    // We don't need to keep it in react state. Model output affects model rendering which is done outside React.
    this.modelOutput = {};
    // Defines rendering of cross section line in the top view. We don't need to keep it in react state.
    this.crossSectionLinePoint1 = null;
    this.crossSectionLinePoint2 = null;

    this.handleCrossSectionYChange = this.handleCrossSectionYChange.bind(this);
    this.handleHotSpotsRenderingChange = this.handleHotSpotsRenderingChange.bind(this);
    this.handlePlatesRenderingChange = this.handlePlatesRenderingChange.bind(this);
    this.handlePlateBoundariesRenderingChange = this.handlePlateBoundariesRenderingChange.bind(this);
    this.handleSimEnabledChange = this.handleSimEnabledChange.bind(this);
    this.handleTopViewMouseDown = this.handleTopViewMouseDown.bind(this);
    this.handleTopViewMouseMove = this.handleTopViewMouseMove.bind(this);
    this.handleTopViewMouseUp = this.handleTopViewMouseUp.bind(this);
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
      this.setState({ modelWidth, modelHeight }, () => {
        // Warning: try to start model only when width and height is already set. Otherwise, renderers might fail.
        const { modelInput } = this.state;
        const topViewCtx = this.topView.getContext('2d');
        const topViewImgData = topViewCtx.createImageData(this.topView.width, this.topView.height);
        this.modelWorker.postMessage({
          type: 'load',
          imageData,
          presetName,
          topViewImgData,
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

  handleTopViewMouseDown(event) {
    this._drawingCrossSection = true;
    this.crossSectionLinePoint1 = getCursorsCoords(event);
    this.crossSectionLinePoint2 = null;
  }

  handleTopViewMouseMove(event) {
    if (this._drawingCrossSection) {
      this.crossSectionLinePoint2 = getCursorsCoords(event);
      this.setModelInput({
        crossSectionPoint1: this.crossSectionLinePoint1,
        crossSectionPoint2: this.crossSectionLinePoint2,
      });
      this.renderTopView();
    }
  }

  handleTopViewMouseUp() {
    this._drawingCrossSection = false;
    this.setModelInput({
      crossSectionPoint1: this.crossSectionLinePoint1,
      crossSectionPoint2: this.crossSectionLinePoint2,
    });
  }

  handleModelOutput(output) {
    this.modelOutput = output;
    this.renderModel();
  }

  renderTopView() {
    // Base image.
    const { topViewImgData } = this.modelOutput;
    if (!topViewImgData) return;
    const ctx = this.topView.getContext('2d');
    ctx.putImageData(topViewImgData, 0, 0);
    // Cross section line.
    const p1 = this.crossSectionLinePoint1;
    const p2 = this.crossSectionLinePoint2;
    if (p1 && p2) {
      ctx.strokeStyle = '#eee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
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
    const { simEnabled, hotSpotsRendering, platesRendering, plateBoundariesRendering } = this.state.modelInput;
    return (
      <div className="plates-model">
        <div>
          <div>
            <canvas
              ref={(c) => { this.topView = c; }} className="top-view" width={modelWidth} height={modelHeight}
              onMouseDown={this.handleTopViewMouseDown} onMouseMove={this.handleTopViewMouseMove}
              onMouseUp={this.handleTopViewMouseUp}
            />
          </div>
        </div>
        <div>
          <div>
            <canvas ref={(c) => { this.crossSection = c; }} />
          </div>
        </div>
        <div>
          <Toggle
            label="Simulation" labelPosition="right"
            toggled={simEnabled} onToggle={this.handleSimEnabledChange}
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
