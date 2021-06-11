import React from 'react'
import { useHistory } from 'react-router'
import authService from '../components/api-authorization/AuthorizeService'

import Grid from '../components/Grid'

export function Home() {
  const history = useHistory()
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    checkAuth()
  })

  async function checkAuth() {
    const authenticated = await authService.isAuthenticated()
    if (authenticated) {
      history.replace('/report')
    }

    setReady(true)
  }

  if (!ready) {
    return null
  }

  return (
    <div className="d-flex flex-full relative splash">
      <Grid />

      <div className="absolute-center">
        <svg className="splash-logo" fill="#000" height={500} width={500}>
          <use height="100%" width="100%" xlinkHref="icons.svg#icon-logo" />
        </svg>
      </div>
    </div>
  )
}
