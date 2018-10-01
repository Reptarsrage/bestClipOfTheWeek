import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { format } from 'd3';
import moment from 'moment';

export default class CustomTooltip extends Component {
  static defaultProps = {
    active: false,
    dimensions: [],
    label: '',
    payload: [],
  };

  render() {
    const { active } = this.props;
    const formatter = format('.2s');

    if (active) {
      const { payload, label, dimensions } = this.props;
      const [title, date] = label.split('<br/>');
      const datapints = payload.map(point => {
        const style = { color: point.color };
        const { unit } = point;
        const name = point.name ? point.name : point.dataKey;
        const dim = dimensions.filter(d => d.name === name);
        const icon = dim && dim.length > 0 && dim[0].icon ? <i className={`mr-2 fas fa-${dim[0].icon}`} /> : null;
        const separator = point.separator ? point.separator : ' : ';
        return (
          <li className="recharts-tooltip-item my-0" key={point.dataKey} style={style}>
            {icon}
            {name}
            {separator}
            {formatter(point.value)}
            {unit}
          </li>
        );
      });

      return (
        <div className="card custom-tooltip">
          <div className="card-block text-nowrap px-2">
            <p className="my-0 text-nowrap text-truncate">{title}</p>
            <small className="my-0">{moment(new Date(date)).format('MMMM Do YYYY')}</small>
          </div>
          <ul className="list-unstyled my-0 pl-2">{datapints}</ul>
        </div>
      );
    }

    return null;
  }
}

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  dimensions: PropTypes.array,
  label: PropTypes.string,
  payload: PropTypes.array,
};
