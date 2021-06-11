/* global $ */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { format } from 'd3-format';

export default class SelectedVideoInfo extends Component {
  static expandTop() {
    const btn = document.getElementById('topSectionCollapse');
    $(btn).collapse('show');
  }

  render() {
    const { selectedVideo } = this.props;

    if (!selectedVideo || !selectedVideo.id) {
      return (
        <div className="flex-center h-100 flex-column">
          <span>No video selected</span>
          <button className="btn btn-link btn-sm" type="button" onClick={this.constructor.expandTop}>
            Select a video
          </button>
        </div>
      );
    }

    const { title, id, imageMaxRes: image, imageMedium: smallImage, viewCount, likeCount, dislikeCount, commentCount } = selectedVideo;
    const url = `https://www.youtube.com/watch?v=${id}`;
    const imageUrl = (image && image.url) || '';
    const bgImageUrl = (smallImage && smallImage.url) || '';
    const formatter = format(',');

    return (
      <section className="h-100 w-100 d-flex flex-column" title={title}>
        <header className="d-none d-md-block p-2 card-header">
          <h5 className="text-nowrap text-truncate mb-0">
            <a href={url}>{title}</a>
          </h5>
        </header>

        <div className="flex-full min-height-short">
          <div className="relative h-100 w-100 overflow-hidden">
            <div className="background-blur fill-absolute" style={{ backgroundImage: `url("${bgImageUrl}")` }} />
            <img alt={title} className="ease img-fill fill-absolute" src={imageUrl} />
          </div>
        </div>

        <footer className="d-flex flex-row align-items-start p-2 card-footer">
          <div className="flex-column align-items-start">
            <span>
              Views: <em>{formatter(viewCount)}</em>
            </span>
            <br />
            <span>
              Comments: <em>{formatter(commentCount)}</em>
            </span>
          </div>
          <div className="flex-column align-items-start pl-4">
            <span>
              Likes: <em>{formatter(likeCount)}</em>
            </span>
            <br />
            <span>
              Dislikes: <em>{formatter(dislikeCount)}</em>
            </span>
          </div>
        </footer>
      </section>
    );
  }
}

SelectedVideoInfo.propTypes = {
  selectedVideo: PropTypes.any,
};
