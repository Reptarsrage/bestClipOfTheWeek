import React from 'react'
import { Collapse, Container, Navbar, NavbarToggler, NavItem, NavLink, Nav } from 'reactstrap'
import { Link, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { LoginMenu } from './api-authorization/LoginMenu'
import authService from './api-authorization/AuthorizeService'
import './NavMenu.css'

export function NavMenu() {
  const location = useLocation()
  const [collapsed, setCollapsed] = React.useState(true)
  const [isReady, setIsReady] = React.useState(false)
  const [authenticated, setAuthenticated] = React.useState(false)

  React.useEffect(() => {
    populateAuthenticationState()
  })

  const isActive = React.useCallback(
    (path) => {
      return path === location.pathname
    },
    [location.pathname]
  )

  async function populateAuthenticationState() {
    const authenticated = await authService.isAuthenticated()
    setIsReady(true)
    setAuthenticated(authenticated)
  }

  function toggleNavbar() {
    setCollapsed((prevValue) => !prevValue)
  }

  if (!isReady) {
    return null
  }

  return (
    <header>
      <Navbar color="primary" dark expand="md">
        <Container>
          <NavbarToggler onClick={toggleNavbar} className="mr-2" />
          <Collapse isOpen={!collapsed} navbar>
            <Nav className="mr-auto" navbar>
              {!authenticated && (
                <NavItem>
                  <NavLink tag={Link} to="/" active={isActive('/')}>
                    <FontAwesomeIcon className="mr-2" icon={['fas', 'home']} />
                    Home
                  </NavLink>
                </NavItem>
              )}

              {authenticated && (
                <NavItem>
                  <NavLink tag={Link} to="/report" active={isActive('/report')}>
                    <FontAwesomeIcon className="mr-2" icon={['fas', 'home']} />
                    Report
                  </NavLink>
                </NavItem>
              )}

              {authenticated && (
                <NavItem>
                  <NavLink tag={Link} to="/terms" active={isActive('/terms')}>
                    <FontAwesomeIcon className="mr-2" icon={['fas', 'edit']} />
                    Edit Terms
                  </NavLink>
                </NavItem>
              )}

              <NavItem>
                <NavLink tag={Link} to="/about" active={isActive('/about')}>
                  <FontAwesomeIcon className="mr-2" icon={['fas', 'info']} />
                  About
                </NavLink>
              </NavItem>

              <NavItem className="mr-auto">
                <NavLink tag={Link} to="/contact" active={isActive('/contact')}>
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
