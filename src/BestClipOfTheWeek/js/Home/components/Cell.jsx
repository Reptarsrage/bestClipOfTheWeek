import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactCardFlip from 'react-card-flip';

export default class Cell extends Component {
  constructor() {
    super();
    this.state = {
      isFlipped: false,
      intervalId: undefined,
    };

    this.flip = this.flip.bind(this);
  }

  componentDidMount() {
    let { intervalId } = this.state;

    if (!intervalId) {
      intervalId = window.setInterval(this.flip, Math.floor(5000 + Math.random() * 10000));
      this.setState(prevState => ({ ...prevState, intervalId }));
    }
  }

  componentWillUnmount() {
    const { intervalId } = this.state;
    window.clearInterval(intervalId);

    this.setState(prevState => ({ ...prevState, intervalId: undefined }));
  }

  flip() {
    this.setState(prevState => ({ ...prevState, isFlipped: !prevState.isFlipped }));
  }

  render() {
    const { frontColor, backColor } = this.props;
    const { isFlipped } = this.state;

    return (
      <ReactCardFlip className="h-100 w-100" isFlipped={isFlipped} infinite flipSpeedFrontToBack={2} flipSpeedBackToFront={2}>
        <div key="front" className="h-100 w-100" style={{ backgroundColor: frontColor }} />
        <div key="back" className="h-100 w-100" style={{ backgroundColor: backColor }} />
      </ReactCardFlip>
    );
  }
}

Cell.propTypes = {
  frontColor: PropTypes.string,
  backColor: PropTypes.string,
};
