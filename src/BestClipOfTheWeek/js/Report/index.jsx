import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// get app element
let rootElement = document.getElementById('react-app');
if (rootElement == null) {
    throw new Error("no 'react-app' element");
}

// Get base URL
const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');

// Define render
const renderApp = () => {
    ReactDOM.render(
        <BrowserRouter basename={baseUrl}>
            <App />
        </BrowserRouter>,
        rootElement);
};

// Call render
renderApp();

// Allow Hot Module Replacement
if (module.hot) {
    module.hot.accept('./App', () => {
        renderApp();
    });
}
