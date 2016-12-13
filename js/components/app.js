import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import PlatesModel from './plates-model';

import '../../css/app.less';

// Required by Material-UI library.
injectTapEventPlugin();

const App = () => (
  <MuiThemeProvider>
    <div className="app">
      <PlatesModel />
    </div>
  </MuiThemeProvider>
);

export default App;
