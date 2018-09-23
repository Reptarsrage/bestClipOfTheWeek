import React, { Component } from 'react';
import { Bar, BarChart, Line, LineChart, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { saveSvgAsPng } from 'save-svg-as-png';
import { GridLoader } from 'halogenium';
import { format } from 'd3';
import PropTypes from 'prop-types';

import CustomTooltip from './CustomTooltip';

export default class PlaylistGraph extends Component {
  static convertPlaylistData(videos) {
    // sort by date
    videos.sort((a, b) => (a.publishedDate > b.publishedDate ? 1 : -1));

    return videos.map(video => ({
      d1: video.viewCount,
      d2: video.likeCount,
      d3: video.dislikeCount,
      d4: video.commentCount,
      name: `${video.title}<br/>${video.publishedDate.toLocaleDateString()}`,
    }));
  }

  constructor() {
    super();

    this.state = {
      choices: [5, 10, 25, 50, 100, 'All'],
      data: [],
      dimensions: [{ align: 'right', color: '#3498DB', enabled: true, icon: 'eye', key: 'd1', name: 'Views' }, { align: 'left', color: '#2ECC71', enabled: true, icon: 'thumbs-up', key: 'd2', name: 'Likes' }, { align: 'left', color: '#E74C3C', enabled: false, icon: 'thumbs-down', key: 'd3', name: 'Dislikes' }, { align: 'left', color: '#8E44AD', enabled: true, icon: 'comments', key: 'd4', name: 'Comments' }],
      max: 5,
      showAdvanced: false,
    };

    this.changeMax = this.changeMax.bind(this);
    this.enableValue = this.enableValue.bind(this);
    this.toggleAdvancedToolbars = this.toggleAdvancedToolbars.bind(this);
    this.saveSvgAsPng = this.saveSvgAsPng.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { playlistVideos } = this.props;

    if (playlistVideos !== prevProps.playlistVideos) {
      const { results } = playlistVideos;
      const data = this.constructor.convertPlaylistData(results.slice()); // Important: Slice array so as to not modify the original
      this.setState(prevState => ({ ...prevState, data })); // eslint-disable-line react/no-did-update-set-state
    }
  }

  changeMax(e) {
    const maxString = e.target.value;
    const max = maxString === 'All' ? 0 : parseInt(maxString, 10);

    this.setState(prevState => ({ ...prevState, max }));
  }

  enableValue(e) {
    let { dimensions } = this.state;
    const enabled = e.target.checked;
    const { key } = e.target.dataset;

    dimensions = dimensions.map(dim => {
      if (dim.key === key) {
        return { ...dim, enabled };
      }
      return dim;
    });

    this.setState(prevState => ({ ...prevState, dimensions }));
  }

  toggleAdvancedToolbars() {
    this.setState(prevState => ({ ...prevState, showAdvanced: !prevState.showAdvanced }));
  }

  saveSvgAsPng() {
    const element = document.querySelector('.js-playlist-graph svg.recharts-surface');
    saveSvgAsPng(element, 'graph.png');
  }

  getFilterToolbar() {
    const { max, choices, showAdvanced } = this.state;

    if (!showAdvanced) {
      return null;
    }

    // create filter buttons
    const buttons = choices.map(choice => {
      const classes = max === choice || (choice === 'All' && max === 0) ? 'btn btn-primary active' : 'btn btn-default';
      return <input className={classes} key={choice} onClick={this.changeMax} type="button" value={choice} />;
    });

    return (
      <div className="col-8 text-left d-none d-sm-block">
        <span className="mr-2">Show Top:</span>
        <div className="btn-group btn-group-sm">{buttons}</div>
      </div>
    );
  }

  getViewToolbar() {
    const { dimensions, showAdvanced } = this.state;

    if (!showAdvanced) {
      return null;
    }

    // create dimension checkboxes
    const inputs = dimensions.map(dim => {
      const { name, key, color, enabled, icon } = dim;
      const style = { color };
      const iconElt = <i className={`mr-2 fas fa-${icon}`} />;
      return (
        <label htmlFor={key} className="checkbox-inline mr-3 mt-1 pointer" key={key} style={style}>
          <input id={key} checked={enabled} className="mr-2" data-key={key} onChange={this.enableValue} type="checkbox" />
          {iconElt}
          {name}
        </label>
      );
    });

    return (
      <div className="row">
        <div className="col-12 text-left d-none d-md-block">
          <div className="input-group">{inputs}</div>
        </div>
      </div>
    );
  }

  getGraph() {
    const { dimensions } = this.state;
    let { data, max } = this.state;
    const { primaryColor } = this.props;

    if (data.length === 0) {
      return <GridLoader className="flex-center full" color={primaryColor} />;
    }

    // ensure max is valid and take the last {max} values from data
    max = max !== 0 ? max : data.length;
    max = Math.min(max, data.length);
    if (max !== data.length) {
      data = data.slice(data.length - max);
    }

    // if we have a large number of data points, show a line chart
    if (max > 10) {
      let lines = dimensions.filter(dim => dim.enabled);
      lines = lines && lines.map(dim => <Line dataKey={dim.key} dot={false} key={dim.key} name={dim.name} stroke={dim.color} type="monotone" yAxisId={dim.align} />);
      return (
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={data}>
            <XAxis dataKey="name" tick={false} />
            <YAxis yAxisId="left" tickFormatter={format('.2s')} />
            <YAxis orientation="right" yAxisId="right" tickFormatter={format('.2s')} />
            <Tooltip content={<CustomTooltip dimensions={dimensions} />} />
            {lines}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // else show a bar chart
    let bars = dimensions.filter(dim => dim.enabled);
    bars = bars && bars.map(dim => <Bar dataKey={dim.key} fill={dim.color} key={dim.key} name={dim.name} yAxisId={dim.align} />);
    return (
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" tick={false} />
          <YAxis yAxisId="left" tickFormatter={format('.2s')} />
          <YAxis orientation="right" yAxisId="right" tickFormatter={format('.2s')} />
          <Tooltip content={<CustomTooltip dimensions={dimensions} />} />
          {bars}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  getGraphControls() {
    const { data, showAdvanced } = this.state;

    if (data.length === 0) {
      return null;
    }

    // show advanced button
    const showAdvancedButton = showAdvanced ? null : (
      <div className="col-12 col-sm-8 text-left">
        <button type="button" className="btn btn-outline-danger" onClick={this.toggleAdvancedToolbars}>
          <i className="mr-2 fas fa-filter" />
          &nbsp;Advanced
        </button>
      </div>
    );
    const filterToolbar = this.getFilterToolbar();
    const viewToolbar = this.getViewToolbar();

    // create footer tool bar in all it's raw glory
    return (
      <footer className="d-none d-sm-block p-2 card-footer">
        <div className="row">
          {showAdvancedButton}
          {filterToolbar}
          <div className="col-sm-4 text-right d-none d-sm-block">
            <button type="button" className="btn btn-success" onClick={this.saveSvgAsPng}>
              <i className="mr-2 fas fa-download" />
              &nbsp;Download
            </button>
          </div>
        </div>
        {viewToolbar}
      </footer>
    );
  }

  render() {
    const graph = this.getGraph();
    const controls = this.getGraphControls();
    const { channelName, playlistName } = this.props;

    return (
      <section className="full d-flex flex-column">
        <header className="d-none d-md-block p-2 card-header">
          <h5 className="text-nowrap text-truncate mb-0">{`${playlistName} by ${channelName}`}</h5>
        </header>

        <div className="flex-1 min-height-short js-playlist-graph">{graph}</div>

        {controls}
      </section>
    );
  }
}

PlaylistGraph.propTypes = {
  channelName: PropTypes.string,
  playlistName: PropTypes.string,
  primaryColor: PropTypes.string,
  playlistVideos: PropTypes.any,
};
