import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { GridLoader } from 'halogenium'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { saveSvgAsPng } from 'save-svg-as-png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default class VoteResultsGraph extends Component {
  constructor() {
    super()

    this.saveSvgAsPng = this.saveSvgAsPng.bind(this)
  }

  saveSvgAsPng() {
    const element = document.querySelector('.js-vote-results-graph svg.recharts-surface')
    saveSvgAsPng(element, 'voteResultsChart.png', { scale: 2 })
  }

  getGraph() {
    const { votes: votesState, primaryColor } = this.props
    const { votes } = votesState

    if (Object.keys(votes).length === 0) {
      return <GridLoader className="h-100 w-100 flex-center min-height-short" color={primaryColor} />
    }

    const data = Object.keys(votes)
      .filter((key) => votes[key].votes > 0)
      .map((key) => ({ ...votes[key] }))
    const cells = data.map((term) => <Cell fill={term.color} key={term.termId} />)

    // NOTE: isAnimationActive needed
    // See here for more info: https://github.com/recharts/recharts/issues/1083
    return (
      <ResponsiveContainer height="100%" width="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="votes"
            nameKey="text"
            label={(term) => `${term.name}: ${term.votes}`}
            isAnimationActive={false}
          >
            {cells}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    )
  }

  render() {
    const title = 'Vote Results'

    return (
      <section className="h-100 w-100 d-flex flex-column results-graph" title={title}>
        <header className="d-none d-md-block p-2 card-header">
          <h5 className="text-nowrap text-truncate mb-0">{title}</h5>
        </header>
        <div className="flex-full js-vote-results-graph">{this.getGraph()}</div>
        <footer className="d-none d-sm-block p-2 card-footer">
          <div className="row">
            <div className="col-sm-8 text-right d-none d-sm-block" />
            <div className="col-sm-4 text-right d-none d-sm-block">
              <button type="button" className="btn btn-success" onClick={this.saveSvgAsPng}>
                <FontAwesomeIcon className="mr-2" icon={['fas', 'download']} />
                Download
              </button>
            </div>
          </div>
        </footer>
      </section>
    )
  }
}

VoteResultsGraph.propTypes = {
  votes: PropTypes.any,
  primaryColor: PropTypes.string,
}
