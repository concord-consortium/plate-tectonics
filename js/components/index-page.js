import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import presets from '../plates-model/presets';

import '../../css/index-page.less';

const DOC = 'https://drive.google.com/open?id=0B4CijKAWlpBtVFpHVVRjQWh5LTQ';
const FROM_DOC = ['test1', 'test2', 'test3', 'test4'];
const OTHERS = Object.keys(presets).filter(name => FROM_DOC.indexOf(name) === -1);

const IndexPage = () => (
  <MuiThemeProvider>
    <div className="index-page">
      <div>
        Test cases described in <a href={DOC} target="_blank" rel="noopener noreferrer">this document</a>:
      </div>
      <table>
        <tbody>
          { FROM_DOC.map(name => <Preset key={name} name={name} img={presets[name].img} />) }
        </tbody>
      </table>
      <div>Other examples:</div>
      <table>
        <tbody>
          { OTHERS.map(name => <Preset key={name} name={name} img={presets[name].img} />) }
        </tbody>
      </table>
    </div>
  </MuiThemeProvider>
);


const Preset = props => (
  <tr>
    <td>
      <a
        href={`${window.location.pathname}?preset=${props.name}`} target="_blank" rel="noopener noreferrer"
      >{props.name}</a>
    </td>
    <td><img alt="data-img" src={props.img} /></td>
  </tr>
);

Preset.propTypes = {
  name: React.PropTypes.string,
  img: React.PropTypes.string,
};

export default IndexPage;
