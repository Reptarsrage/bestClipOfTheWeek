import React, { Component } from 'react'
import { Collapse, Container, Navbar, NavbarToggler, NavItem, NavLink, Nav } from 'reactstrap'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { LoginMenu } from './api-authorization/LoginMenu'
import authService from './api-authorization/AuthorizeService'
import './NavMenu.css'

export class NavMenu extends Component {
  static displayName = NavMenu.name

  constructor(props) {
    super(props)

    this.toggleNavbar = this.toggleNavbar.bind(this)
    this.state = {
      collapsed: true,
      isReady: false,
      authenticated: false,
    }
  }

  componentDidMount() {
    this.populateAuthenticationState()
  }

  async populateAuthenticationState() {
    const authenticated = await authService.isAuthenticated()
    this.setState({ isReady: true, authenticated })
  }

  toggleNavbar() {
    this.setState({
      collapsed: !this.state.collapsed,
    })
  }

  render() {
    const { isReady, authenticated } = this.state

    if (!isReady) {
      return <header></header>
    }

    return (
      <header>
        <Navbar color="primary" dark expand="md">
          <Container>
            <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
            <Collapse isOpen={!this.state.collapsed} navbar>
              <Nav className="mr-auto" navbar>
                {!authenticated && (
                  <NavItem>
                    <NavLink tag={Link} to="/" activeClassName="active">
                      <FontAwesomeIcon className="mr-2" icon={['fas', 'home']} />
                      Home
                    </NavLink>
                  </NavItem>
                )}

                {authenticated && (
                  <NavItem>
                    <NavLink tag={Link} to="/report" activeClassName="active">
                      <FontAwesomeIcon className="mr-2" icon={['fas', 'home']} />
                      Report
                    </NavLink>
                  </NavItem>
                )}

                {authenticated && (
                  <NavItem>
                    <NavLink tag={Link} to="/terms" activeClassName="active">
                      <FontAwesomeIcon className="mr-2" icon={['fas', 'edit']} />
                      Edit Terms
                    </NavLink>
                  </NavItem>
                )}

                <NavItem>
                  <NavLink tag={Link} to="/about" activeClassName="active">
                    <FontAwesomeIcon className="mr-2" icon={['fas', 'info']} />
                    About
                  </NavLink>
                </NavItem>

                <NavItem className="mr-auto">
                  <NavLink tag={Link} to="/contact" activeClassName="active">
                    <FontAwesomeIcon className="mr-2" icon={['fas', 'envelope-open']} />
                    Contact
                  </NavLink>
                </NavItem>
              </Nav>
              <Nav navbar>
                <LoginMenu />
              </Nav>
            </Collapse>
          </Container>
        </Navbar>
      </header>
    )
  }
}
