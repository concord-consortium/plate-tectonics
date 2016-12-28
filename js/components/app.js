import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import PlatesModel from './plates-model';

import '../../css/app.less';

const App = () => (
  <MuiThemeProvider>
    <div className="app">
      <PlatesModel />
    </div>
  </MuiThemeProvider>
);

export default App;
