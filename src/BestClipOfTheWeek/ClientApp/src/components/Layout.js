import React from 'react'
import { Container } from 'reactstrap'
import { NavMenu } from './NavMenu'

export function Layout({ children }) {
  return (
    <>
      <NavMenu />

      <Container className="bg-white py-2 py-lg-3 py-xl-4 d-flex flex-column flex-full">{children}</Container>

      <footer className="container bg-white py-2 py-lg-3 py-xl-4 text-center">
        <div className="row">
          <span className="col-12">
            Website made by: <b>Justin Robb</b>
          </span>
          <br />
        </div>
        <div className="row">
          <div className="col-12">
            <a className="mr-3" href="mailto:justinprobb@gmail.com">
              <small>Contact me</small>
            </a>
            <a className="mr-3" href="https://www.linkedin.com/in/jurobb">
              <small>LinkedIn</small>
            </a>
            <a href="https://github.com/Reptarsrage">
              <small>Github</small>
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}
