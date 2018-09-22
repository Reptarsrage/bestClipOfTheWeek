import React, { Component } from 'react';
import { NavLink  } from 'react-router-dom';

export class NavMenu extends Component {
  render() {
    return (
        <ul className="nav nav-pills flex-column">
            <li className="nav-item">
                <NavLink to={'/'} exact={true} activeClassName='active' className="nav-link">Home</NavLink>
            </li>
            <li className="nav-item">
                <NavLink to={'/counter'} activeClassName='active' className="nav-link">Counter</NavLink>
            </li>
            <li className="nav-item">
                <NavLink to={'/fetchdata'} activeClassName='active' className="nav-link">Fetch data</NavLink>
            </li>
        </ul>);
  }
}
