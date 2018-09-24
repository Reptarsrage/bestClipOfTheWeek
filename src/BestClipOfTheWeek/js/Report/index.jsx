import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter, Route } from 'react-router-dom';

import Index from './components/Index';

// get app element
const rootElement = document.getElementById('react-app');
if (rootElement == null) {
  throw new Error("no 'react-app' element");
}

// Get base URL
const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');

// Define render
const renderApp = () => {
  ReactDOM.render(
    <MemoryRouter basename={baseUrl}>
      <Route path="/" component={Index} />
    </MemoryRouter>,
    rootElement,
  );
};

// Call render
renderApp();

// Allow Hot Module Replacement
if (module.hot) {
  module.hot.accept('./components/Index', () => {
    renderApp();
  });
}
