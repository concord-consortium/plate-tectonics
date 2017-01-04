import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import App from './components/app';
import IndexPage from './components/index-page';
import { getURLParam } from './utils';

// Required by Material-UI library.
injectTapEventPlugin();

// Load model if there's ?preset= parameter defined, otherwise show index page with all the available examples.
const component = getURLParam('preset') ? <App /> : <IndexPage />;
render(component, document.getElementById('app'));
