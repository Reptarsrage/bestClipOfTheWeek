import React, { Component } from 'react';

import Cell from './Cell';
import YouTubeService from '../services/youtubeService';
import authService from '../components/api-authorization/AuthorizeService'

export default class Grid extends Component {
  constructor() {
    super();

    this.state = {
      channelName: 'StoneMountain64',
      playlistName: "World's Best Clip of the Week",
      tints: ['#eef7fe', '#dbeefd', '#c8e5fc', '#b6dcfb', '#a3d4fa', '#91cbf9'],
      width: 120,
      height: 90,
      rows: [],
      minColumns: 4,
      videos: [],
    };

    this.nodeRef = React.createRef();
    this.handleResize = this.handleResize.bind(this);
    this.getVideoImages = this.getVideoImages.bind(this);
  }

  async componentDidMount() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);

    const { rows } = this.state;
    const videos = await this.getVideoImages();

    // Set all existing cell images
    for (const { columns } of rows) {
      for (const column of columns) {
        column.image = videos[Math.floor(Math.random() * videos.length)].imageMedium.url;
      }
    }

    this.setState(prevState => ({ ...prevState, videos }));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  async getVideoImages() {
    const { channelName, playlistName } = this.state;
    const service = new YouTubeService();
    const token = await authService.getAccessToken()

    // Get channel Id
    const channelId = await service.getChannelId(channelName, token);
    if (!channelId) {
      return [];
    }

    // Get playlist Id
    const playlistId = await service.getPlaylistId(channelId, playlistName, token);
    if (!playlistId) {
      return [];
    }

    // Get playlist video ids
    const videos = await service.getPlaylistVideos(playlistId, token);
    if (!videos) {
      return [];
    }

    // Get playlist videos
    return service.batchProcessVideos(videos.slice(0, 20), 20, undefined, token);
  }

  handleResize() {
    const node = this.nodeRef.current;
    const { width, height, rows, tints, minColumns, videos } = this.state;
    const { clientWidth, clientHeight } = node;

    const columnCount = Math.max(minColumns, Math.floor(clientWidth / width));
    let rowCount = Math.floor(clientHeight / height);

    // If we're at the min column count, we need to adjust row count to keep cell aspect ratios
    if (columnCount === minColumns) {
      const ratio = clientWidth / columnCount / width;
      const newHeight = ratio * height;
      rowCount = Math.floor(clientHeight / newHeight);
    }

    // Add rows if needed
    while (rowCount > rows.length) {
      rows.push({ key: rows.length, columns: [], shown: true });
    }

    // Hide/Show rows as needed
    for (let i = 0; i < rows.length; i += 1) {
      rows[i].shown = i < rowCount;
    }

    for (const { columns } of rows) {
      // Add columns to each row as needed
      while (columnCount > columns.length) {
        columns.push({
          key: columns.length,
          frontColor: tints[Math.floor(Math.random() * tints.length)],
          backColor: tints[Math.floor(Math.random() * tints.length)],
          shown: true,
          image: videos.length > 0 ? videos[Math.floor(Math.random() * videos.length)].imageMaxRes.url : undefined,
        });
      }

      // Hide/Show columns as needed
      for (let i = 0; i < columns.length; i += 1) {
        columns[i].shown = i < columnCount;
      }
    }

    this.setState(prevState => ({ ...prevState, rows }));
  }

  renderRows() {
    const { rows } = this.state;

    return rows.filter(({ shown }) => shown).map(({ key, columns }) => (
      <div key={key} className="d-flex flex-row align-items-stretch flex-full">
        {this.renderColumns(columns)}
      </div>
    ));
  }

  renderColumns(columns) {
    return columns.filter(({ shown }) => shown).map(({ key, frontColor, backColor, image }) => (
      <div key={key} className="d-flex flex-full" style={{ backgroundColor: backColor }}>
        <Cell key={key} frontColor={frontColor} backColor={backColor} image={image} />
      </div>
    ));
  }

  render() {
    return (
      <div className="d-flex flex-column flex-full" ref={this.nodeRef}>
        {this.renderRows()}
      </div>
    );
  }
}
