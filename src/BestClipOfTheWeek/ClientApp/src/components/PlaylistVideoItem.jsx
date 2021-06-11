import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';

export default class PlaylistVideoItem extends Component {
  constructor() {
    super();
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    const { onClick, id } = this.props;

    if (onClick) {
      onClick(id);
    }
  }

  render() {
    const { title, subtitle, thumb, active } = this.props;

    const img = (thumb && thumb.url && <img alt="" className="img-fluid rounded d-none d-md-block w-20 mr-3 ease" src={thumb.url} />) || null;
    let classString = 'list-group-item list-group-item-action border-0 pointer ease';
    classString = active ? `${classString} active` : classString;

    return (
      <div className={classString} onClick={this.onClick} role="button" title={title} tabIndex={0} onKeyPress={() => {}}>
        <div className="media">
          {img}
          <div className="media-body text-truncate">
            <p className="text-nowrap text-truncate mb-0">{title}</p>
            <small className="text-nowrap text-truncate text-default mt-0">{DateTime.fromISO(subtitle).toFormat('MMMM Do YYYY')}</small>
          </div>
        </div>
      </div>
    );
  }
}

PlaylistVideoItem.propTypes = {
  onClick: PropTypes.func,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  thumb: PropTypes.any,
  active: PropTypes.bool,
  id: PropTypes.string || PropTypes.number,
};
