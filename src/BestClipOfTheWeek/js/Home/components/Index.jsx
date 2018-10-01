import React, { Component } from 'react';

import Grid from './Grid';

export default class Index extends Component {
  render() {
    return (
      <div className="d-flex flex-full relative splash">
        <Grid />
        <div className="absolute-center">
          <svg className="splash-logo" fill="#000" height={500} width={500}>
            <use height="100%" width="100%" xlinkHref="/dist/static/media/icons.svg#icon-logo" />
          </svg>
        </div>
      </div>
    );
  }
}
