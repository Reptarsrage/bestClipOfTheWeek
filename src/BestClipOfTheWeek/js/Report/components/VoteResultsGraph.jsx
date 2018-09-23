import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { GridLoader } from 'halogenium';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

export default class VoteResultsGraph extends Component {
  getGraph() {
    const { votes: votesState, primaryColor } = this.props;
    const { votes } = votesState;

    if (Object.keys(votes).length === 0) {
      return <GridLoader className="full flex-center min-height-short" color={primaryColor} />;
    }

    const data = Object.keys(votes).map(key => votes[key]);
    const cells = Object.keys(votes).map(key => <Cell fill={votes[key].color} key={votes[key].termId} />);

    return (
      <ResponsiveContainer height="100%" width="100%">
        <PieChart>
          <Pie data={data} dataKey="votes" nameKey="text">
            {cells}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  render() {
    const title = 'Vote Results';

    return (
      <section className="full d-flex flex-column" title={title}>
        <header className="d-none d-md-block p-2 card-header">
          <h5 className="text-nowrap text-truncate mb-0">{title}</h5>
        </header>
        <div className="flex-1">{this.getGraph()}</div>
      </section>
    );
  }
}

VoteResultsGraph.propTypes = {
  votes: PropTypes.any,
  primaryColor: PropTypes.string,
};
