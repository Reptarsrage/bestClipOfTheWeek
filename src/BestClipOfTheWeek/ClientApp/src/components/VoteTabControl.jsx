import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink, Route, Switch } from 'react-router-dom';

import CommentsPager from './CommentsPager';
import Voters from './Voters';

export default class VoteTabControl extends Component {
  render() {
    const { match } = this.props;
    const { path } = match;

    return (
      <section className="container-fluid" id="commentTabs">
        <header>
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <NavLink activeClassName="active" className="nav-link" exact to={`${path}`}>
                Comments
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink activeClassName="active" className="nav-link" to={`${path}/voters`}>
                Voters
              </NavLink>
            </li>
          </ul>
        </header>
        <Switch>
          <Route render={() => <CommentsPager {...this.props} />} exact path={`${path}`} />
          <Route render={() => <Voters {...this.props} />} path={`${path}/voters`} />
        </Switch>
      </section>
    );
  }
}

VoteTabControl.propTypes = {
  primaryColor: PropTypes.string,
  selectedVideo: PropTypes.any,
  votes: PropTypes.any,
  terms: PropTypes.any,
};
