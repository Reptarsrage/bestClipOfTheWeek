/* global $ */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { GridLoader } from 'halogenium';

import LoadingButton from './LoadingButton';
import { parseComments, sortComments } from '../reportProvider';
import YouTubeService from '../../youtubeService';

export default class CommentsPager extends Component {
  static expandTop() {
    const btn = document.getElementById('topSectionCollapse');
    $(btn).collapse('show');
  }

  constructor() {
    super();

    this.state = {
      commentsPager: {
        comments: [],
        fetching: false,
        nextPageToken: undefined,
        error: undefined,
      },
    };

    this.getComments = this.getComments.bind(this);
    this.getPager = this.getPager.bind(this);
    this.loadMore = this.loadMore.bind(this);
  }

  async componentDidMount() {
    await this.loadMore(true);
  }

  async componentDidUpdate(prevProps) {
    const { selectedVideo } = this.props;

    if (!selectedVideo || !prevProps.selectedVideo || selectedVideo.id !== prevProps.selectedVideo.id) {
      await this.loadMore(true);
    }
  }

  async loadMore(startOver = false) {
    const { commentsPager } = this.state;
    const { selectedVideo, terms: termsState } = this.props;
    const { terms } = termsState;
    let { nextPageToken } = commentsPager;

    if (!selectedVideo || !selectedVideo.id) {
      return;
    }

    // Set fetching
    this.setState(prevState => ({
      ...prevState,
      commentsPager: {
        ...prevState.commentsPager,
        fetching: true,
        comments: startOver ? [] : prevState.commentsPager.comments,
        nextPageToken: startOver ? undefined : prevState.commentsPager.nextPageToken,
      },
    }));

    // Get comments
    const service = new YouTubeService();
    const results = await service.getCommentPageForVideo(selectedVideo.id, 25, startOver ? undefined : nextPageToken);

    // Parse results
    let { comments } = results;
    ({ nextPageToken } = results);
    comments = sortComments(comments);
    comments = parseComments(comments, terms);
    const parsedComments = startOver ? comments : commentsPager.comments.concat(comments);

    // Update state
    this.setState(prevState => ({
      ...prevState,
      commentsPager: {
        ...prevState.commentsPager,
        comments: parsedComments,
        fetching: false,
        nextPageToken,
      },
    }));
  }

  getComments() {
    const { commentsPager } = this.state;
    const { comments } = commentsPager;
    const { primaryColor } = this.props;

    if (!comments || comments.length === 0) {
      return <GridLoader className="min-height-short flex-center" color={primaryColor} />;
    }

    return comments.map(comment => {
      const { author, id, parentId, pieces, publishedDate } = comment;
      const classes = parentId ? 'comment-border-secondary ml-4 pl-2' : 'comment-border-primary pl-2';
      const text = pieces.map(piece => {
        if (piece.isTerm) {
          return (
            <b key={`${id}-${piece.id}`} style={{ color: piece.color }}>
              {piece.text}
            </b>
          );
        }

        return piece.text;
      });

      return (
        <div className={classes} key={id}>
          <div>
            <strong>{author}</strong>
            <small className="text-muted ml-2">{publishedDate.toLocaleString()}</small>
            <p>{text}</p>
          </div>
        </div>
      );
    });
  }

  getPager() {
    const { commentsPager } = this.state;
    const { nextPageToken, fetching } = commentsPager;
    const loadMoreShown = nextPageToken && nextPageToken.length > 0;

    if (!loadMoreShown) {
      return null;
    }

    return (
      <footer className="d-flex">
        <LoadingButton className="mx-auto" handleClick={this.loadMore} icon="ellipsis-h" loading={fetching} title="Load More" />
      </footer>
    );
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

    return (
      <section className="container-fluid">
        {this.getComments()}
        {this.getPager()}
      </section>
    );
  }
}

CommentsPager.propTypes = {
  primaryColor: PropTypes.string,
  selectedVideo: PropTypes.any,
  terms: PropTypes.any,
};
