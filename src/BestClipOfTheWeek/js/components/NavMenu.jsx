import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './NavMenu.css';

export class NavMenu extends Component {
  render() {
    return (
        <ul className="nav nav-pills flex-column">
            <li className="nav-item">
                <Link to={'/'} className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
                <Link to={'/counter'} className="nav-link">Counter</Link>
            </li>
            <li className="nav-item">
                <Link to={'/fetchdata'} className="nav-link">Fetch data</Link>
            </li>
        </ul>);
  }
}
