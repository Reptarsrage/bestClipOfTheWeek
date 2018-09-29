import React, { Component } from 'react';

export default class Grid extends Component {
  constructor() {
    super();

    this.state = {
      tints: ['#eef7fe', '#dbeefd', '#c8e5fc', '#b6dcfb', '#a3d4fa', '#91cbf9'],
      width: 120,
      height: 90,
      rows: [],
    };

    this.nodeRef = React.createRef();
    this.handleResize = this.handleResize.bind(this);
  }

  componentDidMount() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize() {
    const node = this.nodeRef.current;
    const { width, height, rows, tints } = this.state;
    const { clientWidth, clientHeight } = node;

    const columnCount = Math.floor(clientWidth / width);
    const rowCount = Math.floor(clientHeight / height);

    // Add rows if needed
    while (rowCount > rows.length) {
      rows.push({ key: rows.length, columns: [], shown: true });
    }

    // Hide/Show rows as needed
    for (let i = 0; i < rows.length; i += 1) {
      rows[i].shown = i < rowCount;
    }

    for (const { columns } of rows) {
      // Add columns to each row as needed
      while (columnCount > columns.length) {
        columns.push({ key: columns.length, color: tints[Math.floor(Math.random() * tints.length)], shown: true });
      }

      // Hide/Show columns as needed
      for (let i = 0; i < columns.length; i += 1) {
        columns[i].shown = i < columnCount;
      }
    }

    this.setState(prevState => ({ ...prevState, rows }));
  }

  renderRows() {
    const { rows } = this.state;

    return rows.filter(({ shown }) => shown).map(({ key, columns }) => (
      <div key={key} className="d-flex flex-row align-items-stretch flex-full">
        {this.renderColumns(columns)}
      </div>
    ));
  }

  renderColumns(columns) {
    return columns.filter(({ shown }) => shown).map(({ key, color }) => <div key={key} className="d-flex flex-full" style={{ backgroundColor: color }} />);
  }

  render() {
    return (
      <div className="w-100 h-100 d-flex flex-column" ref={this.nodeRef}>
        {this.renderRows()}
      </div>
    );
  }
}
