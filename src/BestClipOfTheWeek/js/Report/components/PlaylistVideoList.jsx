import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { GridLoader } from 'halogenium';

import PlaylistVideoItem from './PlaylistVideoItem';

export default class PlaylistVideoList extends Component {
  constructor() {
    super();

    this.state = {
      loadMore: false,
    };

    this.videoSelect = this.videoSelect.bind(this);
    this.handleLoadMoreClick = this.handleLoadMoreClick.bind(this);
  }

  videoSelect(id) {
    const { playlistVideos, changeSelectedVideo } = this.props;

    if (playlistVideos && playlistVideos.results) {
      const video = playlistVideos.results.find(item => item.id === id);
      changeSelectedVideo(video);
    }
  }

  handleLoadMoreClick() {
    this.setState(prevState => ({ ...prevState, loadMore: true }));
  }

  render() {
    const { playlistVideos, selectedVideo, primaryColor } = this.props;
    const { loadMore } = this.state;
    const { fetching, results } = playlistVideos;

    if (fetching && results.length === 0) {
      return <GridLoader className="min-height-short flex-center" color={primaryColor} />;
    }

    if (results.length === 0) {
      return null;
    }

    let filteredResults = results;
    if (!loadMore) {
      filteredResults = results.slice(0, Math.min(50, results.length));
    }

    const items = filteredResults.map(video => {
      const { id, title, publishedDate, imageMedium } = video;
      const subtitle = publishedDate.toLocaleString();
      const selectedId = selectedVideo && selectedVideo.id;
      const active = id === selectedId;

      return <PlaylistVideoItem active={active} id={id} key={id} onClick={this.videoSelect} subtitle={subtitle} thumb={imageMedium} title={title} />;
    });

    const loadMoreButton = loadMore ? null : (
      <div className="list-group-item list-group-item-action border-0 pointer ease text-center">
        <button className="btn btn-lg btn-primary mx-auto" type="button" onClick={this.handleLoadMoreClick}>
          <i className="mr-2 fas fa-ellipsis-h" />
          Load More
        </button>
      </div>
    );

    return (
      <section className="h-100 w-100 d-flex flex-column">
        <header className="d-none d-md-block p-2 card-header">
          <h5 className="text-nowrap text-truncate mb-0">Reccomended</h5>
        </header>
        <div className="list-group short-list playlist-videos min-height-short">
          {items}
          {loadMoreButton}
        </div>
      </section>
    );
  }
}

PlaylistVideoList.propTypes = {
  playlistVideos: PropTypes.any,
  changeSelectedVideo: PropTypes.any,
  selectedVideo: PropTypes.any,
  primaryColor: PropTypes.string,
};
