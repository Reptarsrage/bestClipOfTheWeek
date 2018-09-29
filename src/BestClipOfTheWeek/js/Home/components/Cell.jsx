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
    const { frontColor, backColor, image } = this.props;
    const { isFlipped } = this.state;

    const imageElt = image ? <img style={{ width: '100%', height: '100%', opacity: 0.3 }} src={image} alt="" /> : null;

    return (
      <ReactCardFlip className="h-100 w-100" isFlipped={isFlipped} infinite flipSpeedFrontToBack={2} flipSpeedBackToFront={2}>
        <div key="front" className="h-100 w-100" style={{ backgroundColor: frontColor }}>
          {imageElt}
        </div>
        <div key="back" className="h-100 w-100" style={{ backgroundColor: backColor }}>
          {imageElt}
        </div>
      </ReactCardFlip>
    );
  }
}

Cell.propTypes = {
  frontColor: PropTypes.string,
  backColor: PropTypes.string,
  image: PropTypes.string,
};
