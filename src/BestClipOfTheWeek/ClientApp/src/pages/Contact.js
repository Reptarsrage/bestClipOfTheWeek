import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export function Contact() {
  return (
    <>
      <h2>Contact</h2>

      <address>
        <FontAwesomeIcon className="mr-2" icon={['fas', 'envelope']} />
        <strong>Email:</strong>{' '}
        <a className="mr-3" href="mailto:justinprobb@gmail.com">
          justinprobb@gmail.com
        </a>
        <br />
        <FontAwesomeIcon className="mr-2" icon={['fas', 'linkedin']} />
        <strong>LinkedIn:</strong>{' '}
        <a className="mr-3" href="https://www.linkedin.com/in/jurobb">
          https://www.linkedin.com/in/jurobb
        </a>
        <br />
        <FontAwesomeIcon className="mr-2" icon={['fas', 'github']} />
        <strong>Github:</strong>{' '}
        <a className="mr-3" href="https://github.com/Reptarsrage">
          https://github.com/Reptarsrage
        </a>
        <br />
      </address>
    </>
  )
}
