import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import App from './components/app';
import IndexPage from './components/index-page';

// Required by Material-UI library.
injectTapEventPlugin();

const component = window.location.search === '?index' ? <IndexPage /> : <App />;
render(component, document.getElementById('app'));
