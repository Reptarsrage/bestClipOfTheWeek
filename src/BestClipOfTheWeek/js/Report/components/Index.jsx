/* global $ */
import React, { Component } from 'react';

import LoadingButton from './LoadingButton';
import SelectedVideoInfo from './SelectedVideoInfo';
import PlaylistVideoList from './PlaylistVideoList';
import PlaylistGraph from './PlaylistGraph';
import TermList from './TermList';
import YouTubeService from '../youtubeService';
import { getChannelPlaylistVideosAsync, getTermsAsync, processVotes } from '../reportProvider';

export default class Index extends Component {
  constructor() {
    super();
    this.state = {
      channelName: 'StoneMountain64',
      playlistName: "World's Best Clip of the Week",
      primaryColor: '#2196F3',
      selectedVideo: undefined,
      playlistVideos: {
        error: undefined,
        fetching: true,
        results: [],
      },
      comments: {
        count: 0,
        error: undefined,
        fetching: true,
        total: 0,
      },
      votes: {
        error: undefined,
        fetching: true,
        voters: {},
        votes: {},
      },
      terms: {
        error: undefined,
        fetched: false,
        fetching: true,
        terms: [],
      },
    };

    this.startParsingYouTubeCommentsAsync = this.startParsingYouTubeCommentsAsync.bind(this);
    this.fetchPlaylistVideosAsync = this.fetchPlaylistVideosAsync.bind(this);
    this.fetchTermsAsync = this.fetchTermsAsync.bind(this);
    this.changeSelectedVideo = this.changeSelectedVideo.bind(this);
  }

  changeSelectedVideo(video) {
    this.setState(prevState => ({ ...prevState, selectedVideo: { ...video } }));
  }

  async componentDidMount() {
    // Init bootstrap elements
    const btn = document.getElementById('topSectionCollapseBtn');
    $(btn).collapse();

    await this.fetchPlaylistVideosAsync();
    await this.fetchTermsAsync();
  }

  async fetchPlaylistVideosAsync() {
    // Fetch playlist videos
    const { channelName, playlistName } = this.state;
    const results = await getChannelPlaylistVideosAsync(channelName, playlistName);

    // Sort
    results.sort((a, b) => (a.publishedDate > b.publishedDate ? -1 : 1));

    // Set state
    this.setState(prevState => ({ ...prevState, playlistVideos: { ...prevState.playlistVideos, fetching: false, results } }));
  }

  async fetchTermsAsync() {
    // Fetch playlist terms
    const terms = await getTermsAsync();

    // Set state
    this.setState(prevState => ({ ...prevState, terms: { ...prevState.terms, fetching: false, terms } }));
  }

  // TODO: try / catch error processing
  async startParsingYouTubeCommentsAsync() {
    const { selectedVideo, comments, votes: votesState } = this.state;

    if (selectedVideo && selectedVideo.id) {
      const { id, commentCount } = selectedVideo;

      // Reset
      this.setState(prevState => ({
        ...prevState,
        selectedVideo: {
          ...selectedVideo,
          total: commentCount,
        },
        comments: {
          ...prevState.comments,
          comments: [],
          error: undefined,
          fetching: false,
          nextPageToken: '',
        },
      }));

      // Collapse top
      const btn = document.getElementById('topSectionCollapseBtn');
      $(btn).collapse('hide');

      // Start fetching comments
      const service = new YouTubeService();
      await service.getAllCommentsForVideo(id, 500, commentsBatchResults => {
        // Process comment count
        const count = comments.count + commentsBatchResults.length;

        // Process Votes
        const { votes, voters } = votesState;
        const voteResults = processVotes(commentsBatchResults, votes, voters);

        // Set state
        this.setState(prevState => ({
          ...prevState,
          comments: {
            ...prevState.comments,
            fetching: true,
            count,
          },
          votes: {
            ...prevState.votes,
            ...voteResults,
            fetching: true,
          },
        }));
      });
    }
  }

  render() {
    const { selectedVideo, comments, playlistVideos, primaryColor, terms, channelName, playlistName } = this.state;
    const { fetching } = comments;
    const title = fetching ? 'Loading...' : 'Start';
    const id = (selectedVideo && selectedVideo.id) || '';

    return (
      <div>
        <div className="collapse container-fluid bg-light mb-0 show" id="topSectionCollapse">
          <div className="row">
            <div className="col-lg-12 my-2">
              <h4>Choose a video</h4>
              <div className="input-group">
                <input className="form-control" placeholder="Video Id" readOnly type="text" value={id} />
                <div className="input-group-append">
                  <LoadingButton handleClick={this.startParsingYouTubeCommentsAsync} icon="fa-play" loading={fetching} title={title} />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-8 mb-4">
              <div className="full card ease">
                <PlaylistVideoList changeSelectedVideo={this.changeSelectedVideo} selectedVideo={{ ...selectedVideo }} playlistVideos={{ ...playlistVideos }} primaryColor={primaryColor} />
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="full card ease">
                <TermList primaryColor={primaryColor} terms={{ ...terms }} />
              </div>
            </div>
          </div>
        </div>
        <button type="button" aria-controls="topSectionCollapse" aria-expanded="true" className="collapse-toggle bg-primary text-white pointer flex-center mb-4" data-target="#topSectionCollapse" data-toggle="collapse" id="topSectionCollapseBtn">
          <i className="fas fa-caret-up" />
        </button>

        <div className="row">
          <div className="col-lg-6 mb-4">
            <div className="full card ease">
              <SelectedVideoInfo selectedVideo={{ ...selectedVideo }} primaryColor={primaryColor} />
            </div>
          </div>
          <div className="col-lg-6 mb-4">
            <div className="full card ease">
              <PlaylistGraph channelName={channelName} playlistName={playlistName} primaryColor={primaryColor} playlistVideos={{ ...playlistVideos }} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
