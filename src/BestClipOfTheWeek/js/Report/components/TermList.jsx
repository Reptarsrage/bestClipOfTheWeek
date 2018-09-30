import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { GridLoader } from 'halogenium';

export default class TermList extends Component {
  render() {
    const { terms: termsState, primaryColor } = this.props;
    const { fetching, terms } = termsState;

    if (fetching) {
      return <GridLoader className="min-height-short flex-center" color={primaryColor} />;
    }

    if (terms.length === 0) {
      return (
        <div className="flex-center h-100 flex-column">
          <span>No terms configured</span>
          <a href="/Terms">
            Configure terms <i className="fas fa-external-link-alt" />
          </a>
        </div>
      );
    }

    const items = terms.map(term => {
      const { name, color, termId } = term;
      const style = { color };
      return (
        <div className="list-group-item border-0" key={termId} style={style} title={name}>
          <span className="lead">{name}</span>
          <hr className="p-0 m-0" />
        </div>
      );
    });

    return (
      <section className="h-100 w-100 d-flex flex-column">
        <header className="d-none d-md-block p-2 card-header">
          <h5 className="text-nowrap text-truncate mb-0">Terms</h5>
        </header>
        <div className="list-group short-list min-height-short">{items}</div>
      </section>
    );
  }
}

TermList.propTypes = {
  terms: PropTypes.any,
  primaryColor: PropTypes.string,
};
