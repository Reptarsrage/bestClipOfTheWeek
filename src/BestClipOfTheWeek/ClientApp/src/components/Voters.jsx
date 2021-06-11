import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Voters extends Component {
  render() {
    const { votes } = this.props;
    const { voters } = votes;

    if (!voters || Object.keys(voters).length === 0) {
      return (
        <main className="flex-center h-100 flex-column">
          <span>No Results</span>
        </main>
      );
    }

    const rows = Object.keys(voters).map(key => (
      <tr key={key}>
        <td>{key}</td>
        <td>{voters[key]}</td>
      </tr>
    ));

    return (
      <table className="table table-sm table-responsive-md">
        <thead>
          <tr>
            <td>Author</td>
            <td>Votes</td>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
}

Voters.propTypes = {
  votes: PropTypes.any,
};
