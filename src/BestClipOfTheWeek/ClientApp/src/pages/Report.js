/* global $ */
import 'odometer/themes/odometer-theme-minimal.css'
import React, { Component } from 'react'
import Odometer from 'react-odometerjs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { withRouter } from 'react-router'

import LoadingButton from '../components/LoadingButton'
import SelectedVideoInfo from '../components/SelectedVideoInfo'
import PlaylistVideoList from '../components/PlaylistVideoList'
import PlaylistGraph from '../components/PlaylistGraph'
import TermList from '../components/TermList'
import VoteResultsGraph from '../components/VoteResultsGraph'
import VoteResultsList from '../components/VoteResultsList'
import VoteTabControl from '../components/VoteTabControl'
import YouTubeService from '../services/youtubeService'
import { getChannelPlaylistVideosAsync, getTermsAsync, processVotes } from '../services/reportProvider'
import authService from '../components/api-authorization/AuthorizeService'

class Report extends Component {
  constructor() {
    super()
    this.state = {
      isReady: false,
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
        fetching: false,
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
    }

    this.startParsingYouTubeCommentsAsync = this.startParsingYouTubeCommentsAsync.bind(this)
    this.fetchPlaylistVideosAsync = this.fetchPlaylistVideosAsync.bind(this)
    this.fetchTermsAsync = this.fetchTermsAsync.bind(this)
    this.changeSelectedVideo = this.changeSelectedVideo.bind(this)
    this.processUpdates = this.processUpdates.bind(this)
    this.checkAuth = this.checkAuth.bind(this)
  }

  changeSelectedVideo(video) {
    this.setState((prevState) => ({
      ...prevState,
      selectedVideo: { ...video },
    }))
  }

  componentDidMount() {
    this.checkAuth()
    this.fetchPlaylistVideosAsync()
    this.fetchTermsAsync()
  }

  async checkAuth() {
    const { history } = this.props
    const isAuthenticated = await authService.isAuthenticated()
    if (!isAuthenticated) {
      history.replace('/')
    }

    this.setState({ isReady: true })
  }

  async fetchPlaylistVideosAsync() {
    // Fetch playlist videos
    const { channelName, playlistName } = this.state
    const results = await getChannelPlaylistVideosAsync(channelName, playlistName)

    // Sort
    results.sort((a, b) => (a.publishedDate > b.publishedDate ? -1 : 1))

    // Set state
    this.setState((prevState) => ({
      ...prevState,
      playlistVideos: { ...prevState.playlistVideos, fetching: false, results },
    }))
  }

  async fetchTermsAsync() {
    // Fetch playlist terms
    const token = await authService.getAccessToken()
    const terms = await getTermsAsync(token)

    const votes = {}
    for (const term of terms) {
      if (term.enabled) {
        votes[term.name] = { ...term, votes: 0 }
      }
    }

    // Set state
    this.setState((prevState) => ({
      ...prevState,
      terms: {
        ...prevState.terms,
        fetching: false,
        terms,
      },
      votes: {
        ...prevState.votes,
        votes,
      },
    }))
  }

  async processUpdates(commentsBatchResults) {
    // Process Votes
    const { votes: votesState } = this.state
    const { votes, voters } = votesState
    const voteResults = await processVotes(commentsBatchResults, votes, voters)

    // Set state
    this.setState((prevState) => ({
      ...prevState,
      comments: {
        ...prevState.comments,
        count: prevState.comments.count + commentsBatchResults.length,
      },
      votes: {
        ...prevState.votes,
        ...voteResults,
      },
    }))
  }

  // TODO: try / catch error processing
  async startParsingYouTubeCommentsAsync() {
    const { selectedVideo, votes: votesState } = this.state
    const { votes } = votesState

    if (selectedVideo && selectedVideo.id) {
      const { id, commentCount } = selectedVideo

      // reset votes
      for (const key of Object.keys(votes)) {
        votes[key] = { ...votes[key], votes: 0 }
      }

      // Reset
      this.setState((prevState) => ({
        ...prevState,
        selectedVideo: {
          ...selectedVideo,
        },
        comments: {
          ...prevState.comments,
          count: 0,
          error: undefined,
          fetching: true,
          total: commentCount,
        },
        votes: {
          fetching: true,
          voters: {},
          votes,
        },
      }))

      // Collapse top
      const collapse = document.getElementById('topSectionCollapse')
      $(collapse).collapse('hide')

      // Start fetching comments
      const service = new YouTubeService()
      const token = await authService.getAccessToken()
      await service.getAllCommentsForVideo(id, 500, this.processUpdates, token)

      // Finish
      this.setState((prevState) => ({
        ...prevState,
        comments: {
          ...prevState.comments,
          fetching: false,
        },
        votes: {
          ...prevState.votes,
          fetching: false,
        },
      }))
    }
  }

  render() {
    const { isReady, selectedVideo, comments, playlistVideos, primaryColor, terms, channelName, playlistName, votes } =
      this.state
    const { fetching, total, count } = comments
    const title = fetching ? 'Loading...' : 'Start'
    const id = (selectedVideo && selectedVideo.id) || ''
    const showResults = fetching || count > 0

    if (!isReady) {
      return null
    }

    return (
      <div className="container-fluid">
        <div className="collapse container-fluid bg-light mb-0 show" id="topSectionCollapse">
          <div className="row">
            <div className="col-lg-12 my-2">
              <h4>Choose a video</h4>
              <div className="input-group">
                <input className="form-control" placeholder="Video Id" readOnly type="text" value={id} />
                <div className="input-group-append">
                  <LoadingButton
                    handleClick={this.startParsingYouTubeCommentsAsync}
                    icon="play"
                    loading={fetching}
                    title={title}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-8 mb-4">
              <div className="h-100 w-100 card ease">
                <PlaylistVideoList
                  changeSelectedVideo={this.changeSelectedVideo}
                  selectedVideo={{ ...selectedVideo }}
                  playlistVideos={{ ...playlistVideos }}
                  primaryColor={primaryColor}
                />
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="h-100 w-100 card ease">
                <TermList primaryColor={primaryColor} terms={{ ...terms }} />
              </div>
            </div>
          </div>
        </div>
        
        <button
          type="button"
          aria-controls="topSectionCollapse"
          aria-expanded="true"
          className="collapse-toggle bg-primary text-white pointer flex-center mb-4"
          data-target="#topSectionCollapse"
          data-toggle="collapse"
          id="topSectionCollapseBtn"
        >
          <FontAwesomeIcon icon={['fas', 'caret-up']} />
        </button>

        <div className="row">
          <div className="col-lg-6 mb-4">
            <div className="h-100 w-100 card ease">
              <SelectedVideoInfo selectedVideo={{ ...selectedVideo }} primaryColor={primaryColor} />
            </div>
          </div>
          <div className="col-lg-6 mb-4">
            <div className="h-100 w-100 card ease">
              <PlaylistGraph
                channelName={channelName}
                playlistName={playlistName}
                primaryColor={primaryColor}
                playlistVideos={{ ...playlistVideos }}
              />
            </div>
          </div>
        </div>

        <div className={showResults ? 'row ease' : 'd-none ease'}>
          <div className="col mb-4">
            <h2>
              <Odometer format="(,ddd)" value={count} /> of <Odometer format="(,ddd)" value={total} /> Comments loaded
            </h2>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-5 col-xl-3 mb-4">
            <div className={showResults ? 'h-100 w-100 card ease' : 'd-none ease'}>
              <VoteResultsList votes={{ ...votes }} primaryColor={primaryColor} />
            </div>
          </div>
          <div className="col-lg-7 col-xl-9 mb-4">
            <div className={showResults ? 'h-100 w-100 card ease' : 'd-none ease'}>
              <VoteResultsGraph votes={{ ...votes }} primaryColor={primaryColor} />
            </div>
          </div>
        </div>

        <div className="row">
          <div className={showResults ? 'col-lg-12 mb-4 ease' : 'col-lg-12 mb-4 ease'}>
            <VoteTabControl
              votes={{ ...votes }}
              primaryColor={primaryColor}
              selectedVideo={{ ...selectedVideo }}
              terms={{ ...terms }}
              {...this.props}
            />
          </div>
        </div>
      </div>
    )
  }
}

export const ReportWithRouter = withRouter(Report)
