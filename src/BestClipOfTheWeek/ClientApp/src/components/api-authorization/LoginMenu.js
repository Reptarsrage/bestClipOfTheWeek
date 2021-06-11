import React, { Component, Fragment } from 'react'
import { NavItem, NavLink, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import authService from './AuthorizeService'
import { ApplicationPaths } from './ApiAuthorizationConstants'

export class LoginMenu extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isAuthenticated: false,
      userName: null,
    }
  }

  componentDidMount() {
    this._subscription = authService.subscribe(() => this.populateState())
    this.populateState()
  }

  componentWillUnmount() {
    authService.unsubscribe(this._subscription)
  }

  async populateState() {
    const [isAuthenticated, user] = await Promise.all([authService.isAuthenticated(), authService.getUser()])
    this.setState({
      isAuthenticated,
      userName: user && user.name,
    })
  }

  render() {
    const { isAuthenticated, userName } = this.state
    if (!isAuthenticated) {
      const registerPath = `${ApplicationPaths.Register}`
      const loginPath = `${ApplicationPaths.Login}`
      return this.anonymousView(registerPath, loginPath)
    } else {
      const profilePath = `${ApplicationPaths.Profile}`
      const logoutPath = { pathname: `${ApplicationPaths.LogOut}`, state: { local: true } }
      return this.authenticatedView(userName, profilePath, logoutPath)
    }
  }

  authenticatedView(userName, profilePath, logoutPath) {
    return (
      <Fragment>
        <UncontrolledDropdown nav inNavbar>
          <DropdownToggle nav caret>
            {userName}
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem>
              <NavLink tag={Link} className="text-dark" to={profilePath}>
                <FontAwesomeIcon className="mr-2" icon={['fas', 'cog']} />
                Manage Account
              </NavLink>
            </DropdownItem>
            <DropdownItem divider />
            <DropdownItem>
              <NavLink tag={Link} className="text-dark" to={logoutPath}>
                <FontAwesomeIcon className="mr-2" icon={['fas', 'sign-out-alt']} />
                Logout
              </NavLink>
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </Fragment>
    )
  }

  anonymousView(registerPath, loginPath) {
    return (
      <Fragment>
        <NavItem>
          <NavLink tag={Link} to={registerPath}>
            <FontAwesomeIcon className="mr-2" icon={['fas', 'user-plus']} />
            Register
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={Link} to={loginPath}>
            <FontAwesomeIcon className="mr-2" icon={['fas', 'user']} />
            Login
          </NavLink>
        </NavItem>
      </Fragment>
    )
  }
}
