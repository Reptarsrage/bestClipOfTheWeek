/* global $ */
import React, { Component } from 'react'
import { GridLoader } from 'halogenium'
import { SketchPicker } from 'react-color'
import Switch from 'react-switch'

import TermsService from '../services/termsService'
import authService from '../components/api-authorization/AuthorizeService'

export class Terms extends Component {
  constructor() {
    super()

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
    }

    this.handleColorSwatchClick = this.handleColorSwatchClick.bind(this)
    this.handleColorPickerClose = this.handleColorPickerClose.bind(this)
    this.handleColorPickerChangeComplete = this.handleColorPickerChangeComplete.bind(this)
    this.handleTermNameChange = this.handleTermNameChange.bind(this)
    this.handleTermEnabled = this.handleTermEnabled.bind(this)
    this.handleNewTermEnabled = this.handleNewTermEnabled.bind(this)
    this.handleNewTermNameChange = this.handleNewTermNameChange.bind(this)
    this.handleNewTermCreate = this.handleNewTermCreate.bind(this)
    this.handleTermDelete = this.handleTermDelete.bind(this)
    this.getTermFromTarget = this.getTermFromTarget.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  componentWillMount() {
    document.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  async componentDidMount() {
    // Fetch all terms
    const { termsService } = this.state

    const token = await authService.getAccessToken()
    const termResults = await termsService.getTerms(token)

    // Save them in state
    this.setState((prevState) => ({
      ...prevState,
      termsState: {
        ...prevState.termsState,
        fetching: false,
        fetched: true,
        terms: termResults,
      },
    }))
  }

  getTermFromTarget(e) {
    // Get id from closest row to target
    const { target } = e
    const id = $(target).closest('.term-form-row').data('id')
    const termId = parseInt(id, 10)

    // Find term in list
    const { termsState } = this.state
    const { terms } = termsState
    return terms.find((t) => t.termId === termId)
  }

  async handleKeyDown(event) {
    const { colorPickerState } = this.state
    const { colorPickerShown } = colorPickerState

    if (event.key === 'Escape') {
      if (colorPickerShown) {
        this.handleColorPickerClose()
      }
    }
  }

  async handleColorPickerChangeComplete(e) {
    const { newTerm, colorPickerState, termsState, termsService } = this.state
    const { selectedTerm } = colorPickerState
    const { terms } = termsState

    if (newTerm.termId === selectedTerm.termId) {
      this.setState((prevState) => ({
        ...prevState,
        newTerm: {
          ...prevState.newTerm,
          color: e.hex,
        },
      }))
    } else {
      const index = terms.findIndex((t) => t.termId === selectedTerm.termId)
      terms[index] = { ...terms[index], color: e.hex }

      // Upddate server
      const token = await authService.getAccessToken()
      await termsService.updateTerm(terms[index], token)
    }

    // Update UI
    this.setState((prevState) => ({
      ...prevState,
      colorPickerState: {
        ...prevState.colorPickerState,
        colorPickerColor: e.hex,
      },
      termsState: {
        ...prevState.termsState,
        terms,
      },
    }))
  }

  handleColorPickerClose() {
    this.setState((prevState) => ({
      ...prevState,
      colorPickerState: {
        ...prevState.colorPickerState,
        colorPickerColor: '#ececec',
        colorPickerShown: false,
        selectedTerm: {},
      },
    }))
  }

  async handleTermEnabled(checked, event) {
    if (!event || !event.target) {
      return
    }

    // Parse target term
    const term = this.getTermFromTarget(event)
    if (!term) {
      return
    }

    // Update the term and force state update
    const { termsService } = this.state
    term.enabled = checked

    // Update UI
    this.forceUpdate()

    // Upddate server
    const token = await authService.getAccessToken()
    await termsService.updateTerm(term, token)
  }

  async handleTermNameChange(e) {
    if (!e || !e.target) {
      return
    }

    // Parse target term
    const term = this.getTermFromTarget(e)
    if (!term) {
      return
    }

    // Update the term and force state update
    const { termsService } = this.state
    term.name = e.target.value

    // Update UI
    this.forceUpdate()

    // Upddate server
    const token = await authService.getAccessToken()
    await termsService.updateTerm(term, token)
  }

  handleColorSwatchClick(e) {
    if (!e || !e.target) {
      return
    }

    // Do nothing if already shown
    const { colorPickerState, newTerm } = this.state
    const { colorPickerShown } = colorPickerState
    if (colorPickerShown) {
      return
    }

    // Parse the target term
    let term = this.getTermFromTarget(e)
    if (!term) {
      term = newTerm
    }

    // Update state
    this.setState((prevState) => ({
      ...prevState,
      colorPickerState: {
        ...prevState.colorPickerState,
        colorPickerColor: term.color,
        colorPickerShown: true,
        selectedTerm: term,
      },
    }))
  }

  async handleTermDelete(event) {
    if (!event || !event.target) {
      return
    }

    // Parse the target term
    const term = this.getTermFromTarget(event)
    if (!term) {
      return
    }

    // Remove target term
    const { termsState, termsService } = this.state
    let { terms } = termsState
    terms = terms.filter(({ termId }) => termId !== term.termId)

    // Update state
    this.setState((prevState) => ({
      ...prevState,
      termsState: {
        ...prevState.termsState,
        terms,
      },
    }))

    // Update server
    const token = await authService.getAccessToken()
    await termsService.deleteTerm(term.termId, token)
  }

  handleNewTermEnabled(checked) {
    this.setState((prevState) => ({
      ...prevState,
      newTerm: {
        ...prevState.newTerm,
        enabled: checked,
      },
    }))
  }

  handleNewTermNameChange(event) {
    if (!event || !event.target) {
      return
    }

    const { target } = event
    this.setState((prevState) => ({
      ...prevState,
      newTerm: {
        ...prevState.newTerm,
        name: target.value,
      },
    }))
  }

  async handleNewTermCreate(e) {
    if (!e || !e.target) {
      return
    }

    const { termsState, newTerm, termsService } = this.state
    const { terms } = termsState

    // Upddate server
    const token = await authService.getAccessToken()
    const { termId } = await termsService.createTerm(newTerm, token)

    // Set id
    terms.push({ ...newTerm, termId })

    // Update UI
    this.setState((prevState) => ({
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
    }))
  }

  render() {
    const { termsState, primaryColor, colorPickerState, newTerm } = this.state
    const { fetching, fetched, terms } = termsState
    const { colorPickerShown, selectedTerm, colorPickerColor } = colorPickerState

    // Stop here if loading
    if (fetching || !fetched) {
      return <GridLoader className="flex-full flex-center" color={primaryColor} />
    }

    // Build color picker and backdrop
    let colorPickerElt = null
    if (colorPickerShown) {
      colorPickerElt = (
        <div className="popover">
          <div
            role="button"
            className="cover"
            onClick={this.handleColorPickerClose}
            onKeyDown={this.handleKeyDown}
            tabIndex="0"
          />
          <SketchPicker
            className="relative"
            color={colorPickerColor}
            onChangeComplete={this.handleColorPickerChangeComplete}
            disableAlpha
          />
        </div>
      )
    }

    // Build table rows from terms
    const selectedTermId = selectedTerm.termId
    const termEltsList = terms.map((term) => (
      <div key={term.termId} className="form-row term-form-row ease" data-id={term.termId}>
        <div className="form-group d-flex">
          <input
            className="form-control"
            maxLength="50"
            onChange={this.handleTermNameChange}
            placeholder={term.name}
            type="text"
            value={term.name}
          />
        </div>
        <div className="form-group d-flex">
          <div
            role="button"
            className="swatch"
            onClick={this.handleColorSwatchClick}
            onKeyDown={this.handleKeyDown}
            tabIndex="0"
          >
            <div className="swatch-color" style={{ background: term.color }} />
            {selectedTermId === term.termId ? colorPickerElt : null}
          </div>
        </div>
        <div className="form-group d-flex">
          <Switch onChange={this.handleTermEnabled} checked={term.enabled} />
        </div>
        <div className="form-group d-flex">
          <button type="button" className="btn btn-danger term-form-button" onClick={this.handleTermDelete}>
            Delete
          </button>
        </div>
      </div>
    ))

    return (
      <div className="container-fluid">
        <div className="form-row term-form-row ease bg-primary text-white py-2 mb-2">
          <strong className="d-flex">Name</strong>
          <strong className="d-flex">Color</strong>
          <strong className="d-flex">Enabled</strong>
          <strong className="d-flex">&nbsp;</strong>
        </div>
        <div className="form-row term-form-row ease" data-id={newTerm.termId}>
          <div className="form-group d-flex">
            <input
              className="form-control"
              maxLength="50"
              onChange={this.handleNewTermNameChange}
              placeholder="Add a term"
              type="text"
              value={newTerm.name}
            />
          </div>
          <div className="form-group d-flex">
            <div
              role="button"
              className="swatch"
              onClick={this.handleColorSwatchClick}
              onKeyDown={this.handleKeyDown}
              tabIndex="0"
            >
              <div className="swatch-color" style={{ background: newTerm.color }} />
              {selectedTermId === newTerm.termId ? colorPickerElt : null}
            </div>
          </div>
          <div className="form-group d-flex">
            <Switch onChange={this.handleNewTermEnabled} checked={newTerm.enabled} />
          </div>
          <div className="form-group d-flex">
            <button type="button" className="btn btn-success term-form-button" onClick={this.handleNewTermCreate}>
              Add
            </button>
          </div>
        </div>
        {termEltsList}
      </div>
    )
  }
}
