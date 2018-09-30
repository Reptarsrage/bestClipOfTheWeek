/* global $ */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactCardFlip from 'react-card-flip';

export default class Cell extends Component {
  constructor() {
    super();
    this.state = {
      isFlipped: false,
      intervalId: undefined,
      frontImage: undefined,
      backImage: undefined,
      active: true,
    };

    this.flip = this.flip.bind(this);
    this.setActive = this.setActive.bind(this);
    this.setInactive = this.setInactive.bind(this);
  }

  componentDidMount() {
    let { intervalId } = this.state;

    if (!intervalId) {
      intervalId = window.setInterval(this.flip, Math.floor(5000 + Math.random() * 10000));
      this.setState(prevState => ({ ...prevState, intervalId }));
    }

    $(window).on('blur', this.setInactive);
    $(window).on('focus', this.setActive);
  }

  componentWillUnmount() {
    const { intervalId } = this.state;
    window.clearInterval(intervalId);

    this.setState(prevState => ({ ...prevState, intervalId: undefined }));
    $(window).off('blur', this.setInactive);
    $(window).off('focus', this.setActive);
  }

  setActive() {
    this.setState(prevState => ({ ...prevState, active: true }));
  }

  setInactive() {
    this.setState(prevState => ({ ...prevState, active: false }));
  }

  flip() {
    const { image } = this.props;
    const { isFlipped, active } = this.state;
    let { frontImage, backImage } = this.state;

    if (!active) {
      return;
    }

    if (isFlipped && !frontImage) {
      frontImage = image;
    } else if (!isFlipped && !backImage) {
      backImage = image;
    }

    this.setState(prevState => ({
      ...prevState,
      isFlipped: !prevState.isFlipped,
      frontImage,
      backImage,
    }));
  }

  render() {
    const { frontColor, backColor } = this.props;
    const { isFlipped, frontImage, backImage } = this.state;

    const frontImageElt = frontImage ? <img className="splash-cell-img" src={frontImage} alt="" /> : null;
    const backImageElt = backImage ? <img className="splash-cell-img" src={backImage} alt="" /> : null;

    return (
      <ReactCardFlip className="h-100 w-100" isFlipped={isFlipped} infinite flipSpeedFrontToBack={2} flipSpeedBackToFront={2}>
        <div key="front" className="h-100 w-100" style={{ backgroundColor: frontColor }}>
          {frontImageElt}
        </div>
        <div key="back" className="h-100 w-100" style={{ backgroundColor: backColor }}>
          {backImageElt}
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
