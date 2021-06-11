import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default class LoadingButton extends Component {
  constructor() {
    super()

    this.handleClick = this.handleClick.bind(this)
    this.getIcon = this.getIcon.bind(this)
  }

  handleClick() {
    const { loading, handleClick } = this.props

    if (!loading) {
      handleClick()
    }
  }

  getIcon() {
    const { loading, icon } = this.props

    if (loading) {
      return <FontAwesomeIcon className="animate-spin mr-2" icon={['fas', 'spinner']} />
    }

    return <FontAwesomeIcon className="mr-2" icon={['fas', icon]} />
  }

  render() {
    const { title, loading, className } = this.props
    const icon = this.getIcon()
    const classString = className ? `btn btn-lg btn-primary ${className}` : 'btn btn-lg btn-primary'

    return (
      <button className={classString} disabled={loading} onClick={this.handleClick} type="button">
        {icon}
        {title}
      </button>
    )
  }
}

LoadingButton.propTypes = {
  loading: PropTypes.bool,
  icon: PropTypes.string,
  title: PropTypes.string,
  className: PropTypes.string,
  handleClick: PropTypes.func,
}
