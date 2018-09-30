import React, { Component } from 'react';
import { GridLoader } from 'halogenium';
import { SketchPicker } from 'react-color';

import TermsService from '../../termsService';

export default class Index extends Component {
  constructor() {
    super();

    this.state = {
      primaryColor: '#2196F3',
      colorPickerState: {
        colorPickerColor: '#ececec',
        selectedTerm: {},
        colorPickerShown: false,
      },
      termsService: new TermsService(),
      termsState: {
        error: undefined,
        fetched: false,
        fetching: true,
        terms: [],
      },
      newTerm: {
        color: '#ececec',
        enabled: true,
        name: '',
        termId: -1,
      },
    };

    this.handleColorSwatchClick = this.handleColorSwatchClick.bind(this);
    this.handleColorPickerClose = this.handleColorPickerClose.bind(this);
    this.handleColorPickerChangeComplete = this.handleColorPickerChangeComplete.bind(this);
    this.handleTermChange = this.handleTermChange.bind(this);
    this.handleNewTermChange = this.handleNewTermChange.bind(this);
    this.handleNewTermCreate = this.handleNewTermCreate.bind(this);
    this.handleTermDelete = this.handleTermDelete.bind(this);
    this.getTermFromTarget = this.getTermFromTarget.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentWillMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  async componentDidMount() {
    const { termsService } = this.state;

    const termResults = await termsService.getTerms();

    this.setState(prevState => ({
      ...prevState,
      termsState: {
        ...prevState.termsState,
        fetching: false,
        fetched: true,
        terms: termResults,
      },
    }));
  }

  getTermFromTarget(e) {
    const { termsState } = this.state;
    const { terms } = termsState;
    const { dataset } = e.target;
    const { id } = dataset;
    const termId = parseInt(id, 10);
    return terms.find(t => t.termId === termId);
  }

  async handleKeyDown(event) {
    const { colorPickerState } = this.state;
    const { colorPickerShown } = colorPickerState;

    if (event.key === 'Escape') {
      if (colorPickerShown) {
        this.handleColorPickerClose();
      }
    }
  }

  async handleColorPickerChangeComplete(e) {
    const { newTerm, colorPickerState, termsState, termsService } = this.state;
    const { selectedTerm } = colorPickerState;
    const { terms } = termsState;

    if (newTerm.termId === selectedTerm.termId) {
      this.setState(prevState => ({
        ...prevState,
        newTerm: {
          ...prevState.newTerm,
          color: e.hex,
        },
      }));
    } else {
      const index = terms.findIndex(t => t.termId === selectedTerm.termId);
      terms[index] = { ...terms[index], color: e.hex };

      // Upddate server
      await termsService.updateTerm(terms[index]);
    }

    // Update UI
    this.setState(prevState => ({
      ...prevState,
      colorPickerState: {
        ...prevState.colorPickerState,
        colorPickerColor: e.hex,
      },
      termsState: {
        ...prevState.termsState,
        terms,
      },
    }));
  }

  handleColorPickerClose() {
    this.setState(prevState => ({
      ...prevState,
      colorPickerState: {
        ...prevState.colorPickerState,
        colorPickerColor: '#ececec',
        colorPickerShown: false,
        selectedTerm: {},
      },
    }));
  }

  async handleTermChange(e) {
    if (!e || !e.target) {
      return;
    }

    // Parse target term
    const term = this.getTermFromTarget(e);
    if (!term) {
      return;
    }

    // Update the term and force state update
    const { termsService } = this.state;
    if (e.target.name === 'name') {
      term.name = e.target.value;

      // Update UI
      this.forceUpdate();

      // Upddate server
      await termsService.updateTerm(term);
    } else if (e.target.name === 'enabled') {
      term.enabled = e.target.checked;

      // Update UI
      this.forceUpdate();

      // Upddate server
      await termsService.updateTerm(term);
    }
  }

  handleColorSwatchClick(e) {
    if (!e || !e.target) {
      return;
    }

    // Do nothing if already shown
    const { colorPickerState, newTerm } = this.state;
    const { colorPickerShown } = colorPickerState;
    if (colorPickerShown) {
      return;
    }

    // Parse the target term
    let term = this.getTermFromTarget(e);
    if (!term) {
      term = newTerm;
    }

    // Update state
    this.setState(prevState => ({
      ...prevState,
      colorPickerState: {
        ...prevState.colorPickerState,
        colorPickerColor: term.color,
        colorPickerShown: true,
        selectedTerm: term,
      },
    }));
  }

  async handleTermDelete(e) {
    if (!e || !e.target) {
      return;
    }

    // Parse the target term
    const term = this.getTermFromTarget(e);
    if (!term) {
      return;
    }

    // Remove target term
    const { termsState, termsService } = this.state;
    let { terms } = termsState;
    terms = terms.filter(({ termId }) => termId !== term.termId);

    // Update UI
    this.setState(prevState => ({
      ...prevState,
      termsState: {
        ...prevState.termsState,
        terms,
      },
    }));

    // Upddate server
    await termsService.deleteTerm(term.termId);
  }

  handleNewTermChange(e) {
    if (!e || !e.target) {
      return;
    }

    const { newTerm } = this.state;

    if (e.target.name === 'name') {
      newTerm.name = e.target.value;
    } else if (e.target.name === 'enabled') {
      newTerm.enabled = e.target.checked;
    }

    this.setState(prevState => ({
      ...prevState,
      newTerm: {
        ...prevState.newTerm,
        ...newTerm,
      },
    }));
  }

  async handleNewTermCreate(e) {
    if (!e || !e.target) {
      return;
    }

    const { termsState, newTerm, termsService } = this.state;
    const { terms } = termsState;

    // Upddate server
    const { termId } = await termsService.createTerm(newTerm);

    // Set id
    terms.push({ ...newTerm, termId });

    // Update UI
    this.setState(prevState => ({
      ...prevState,
      newTerm: {
        ...prevState.newTerm,
        color: '#ffffff',
        enabled: true,
        name: '',
      },
      termsState: {
        ...prevState.termsState,
        terms,
      },
    }));
  }

  render() {
    const { termsState, primaryColor, colorPickerState, newTerm } = this.state;
    const { fetching, fetched, terms } = termsState;
    const { colorPickerShown, selectedTerm, colorPickerColor } = colorPickerState;

    // Stop here if loading
    if (fetching || !fetched) {
      return <GridLoader className="flex-full flex-center" color={primaryColor} />;
    }

    // Build color picker and backdrop
    let colorPickerElt = null;
    if (colorPickerShown) {
      colorPickerElt = (
        <div className="popover">
          <div role="button" className="cover" onClick={this.handleColorPickerClose} onKeyDown={this.handleKeyDown} tabIndex="0" />
          <SketchPicker className="relative" color={colorPickerColor} onChangeComplete={this.handleColorPickerChangeComplete} />
        </div>
      );
    }

    // Build table rows from terms
    const selectedTermId = selectedTerm.termId;
    const termEltsList = terms.map(term => (
      <tr key={term.termId} className="ease">
        <td>
          <input data-id={term.termId} maxLength="50" name="name" onChange={this.handleTermChange} placeholder={term.name} type="text" value={term.name} />
        </td>
        <td>
          <div role="button" className="swatch" data-id={term.termId} onClick={this.handleColorSwatchClick} onKeyDown={this.handleKeyDown} tabIndex="0">
            <div className="swatch-color" data-id={term.termId} style={{ background: term.color }} />
            {selectedTermId === term.termId ? colorPickerElt : null}
          </div>
        </td>
        <td>
          <input checked={term.enabled} data-id={term.termId} name="enabled" onChange={this.handleTermChange} type="checkbox" />
        </td>
        <td>
          <button type="button" className="btn btn-danger" data-id={term.termId} onClick={this.handleTermDelete}>
            Delete
          </button>
        </td>
      </tr>
    ));

    return (
      <div className="container-fluid">
        <table className="table table-responsive-sm my-4">
          <thead className="text-light">
            <tr>
              <th className="bg-primary">Term</th>
              <th className="bg-primary">Color</th>
              <th className="bg-primary">Enabled</th>
              <th className="bg-primary">
                <span>Add</span>
                <span> / </span>
                <span>Delete</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input maxLength="50" name="name" onChange={this.handleNewTermChange} placeholder="Add a term" type="text" value={newTerm.name} />
              </td>
              <td>
                <div role="button" className="swatch" data-id={newTerm.termId} onClick={this.handleColorSwatchClick} onKeyDown={this.handleKeyDown} tabIndex="0">
                  <div className="swatch-color" data-id={newTerm.termId} style={{ background: newTerm.color }} />
                  {selectedTermId === newTerm.termId ? colorPickerElt : null}
                </div>
              </td>
              <td>
                <input checked={newTerm.enabled} name="enabled" onChange={this.handleNewTermChange} type="checkbox" />
              </td>
              <td>
                <button type="button" className="btn btn-success" onClick={this.handleNewTermCreate}>
                  Add
                </button>
              </td>
            </tr>
            {termEltsList}
          </tbody>
        </table>
      </div>
    );
  }
}
