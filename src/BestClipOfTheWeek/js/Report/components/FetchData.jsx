import React, { Component } from 'react';

export class FetchData extends Component {
  constructor(props) {
    super(props);
    this.state = { terms: [], loading: true };
  }

  componentDidMount() {
    fetch('/api/Terms')
      .then(response => response.json())
      .then(data => {
          this.setState({ terms: data, loading: false });
      });
  }

  static renderTermsTable(terms) {
    return (
      <table className='table'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Color</th>
            <th>Enabled</th>
          </tr>
        </thead>
        <tbody>
          {terms.map(term =>
            <tr key={term.termId}>
              <td>{term.Name}</td>
              <td>{term.color}</td>
              <td>{term.enabled}</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }

  render() {
    const contents = this.state.loading
      ? <p><em>Loading...</em></p>
      : FetchData.renderTermsTable(this.state.terms);

    return (
      <div>
        <h1>Configured Terms</h1>
        <p>This component demonstrates fetching data from the server.</p>
        {contents}
      </div>
    );
  }
}
