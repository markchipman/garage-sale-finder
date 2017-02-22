import $ from 'jquery';
import MapboxClient from 'mapbox';
import { KEY_CODES, MAPBOX } from './constants';
import { debounce } from './utils';

/**
 * @class Typeahead
 */
class Typeahead {

  /**
   * Creates a new Typeahead.
   * @return {Typeahead}
   */
  constructor() {
    this._mapboxClient = new MapboxClient(MAPBOX.ACCESS_TOKEN);
    this._isResultsOpen = false;
    this._highlightedIndex = null;

    this._getElements();
    this._initializeEventListeners();
  }

  /**
   * Get and set the HTML elements for this component.
   * @method _getElements
   * @return {undefined}
   */
  _getElements() {
    this._$typeahead = $('.typeahead__input');
    this._$typeaheadResults = $('.typeahead__results');
    this._$previousResults = this._$typeaheadResults.children();
  }

  /**
   * Set up event listeners for this component.
   * @method _initializeEventListeners
   * @return {undefined}
   */
  _initializeEventListeners() {
    $(window).on('click', (evt) => this._handleWindowClick(evt));
    $(window).on('keydown', (evt) => this._handleKeyDown(evt));

    this._$typeahead.on('input', debounce(this._handleInput, 250, this));
    this._$typeahead.on('click', (evt) => this._handleInputClick(evt));
    this._$typeaheadResults.on('click', (evt) => this._handleResultsClick(evt));
  }

  /**
   * Handles when the `window` is clicked to hide the typeahead results, if open.
   * @method _initializeEventListeners
   * @param  {Event} evt The event
   * @return {undefined}
   */
  _handleWindowClick(evt) {
    const $eventTarget = $(evt.target);
    const isClickOutside = !($eventTarget.hasClass('typeahead__input') ||
                             $eventTarget.hasClass('typeahead__result'));

    if (this._isResultsOpen && isClickOutside) {
      this._$typeaheadResults.empty();
      this._isResultsOpen = false;
    }
  }

  /**
   * Handles when a key is pressed by the user.
   * Key presses are used to navigate typeahead results.
   * @method _handleKeyDown
   * @param  {Event} evt The event
   * @return {undefined}
   */
  _handleKeyDown(evt) {
    const event = evt || window.event;

    // If the search results aren't currenty visible, do nothing
    if (!this._isResultsOpen) {
      return;
    }

    // TODO: Break switch cases out into separate functions
    // TODO: Set input text to highlighted suggestion
    switch (event.keyCode) {
      case KEY_CODES.ENTER:
        if (this._highlightedIndex !== null) {
          this._$previousResults.eq(this._highlightedIndex).click();
          this._$previousResults.eq(this._highlightedIndex).removeClass('typeahead__result--highlighted');
          this._highlightedIndex = null;
        }
        break;
      case KEY_CODES.ESC:
        this._$typeaheadResults.empty();
        this._isResultsOpen = false;
        break;
      case KEY_CODES.UP:
        if (this._highlightedIndex === null) {
          this._highlightedIndex = this._$previousResults.length - 1;
          this._$previousResults.eq(this._highlightedIndex).addClass('typeahead__result--highlighted');
        } else if (this._highlightedIndex === 0) {
          this._$previousResults.eq(this._highlightedIndex).removeClass('typeahead__result--highlighted');
          this._highlightedIndex = null;
        } else {
          this._$previousResults.eq(this._highlightedIndex).removeClass('typeahead__result--highlighted');
          this._highlightedIndex -= 1;
          this._$previousResults.eq(this._highlightedIndex).addClass('typeahead__result--highlighted');
        }
        return false;
        break;
      case KEY_CODES.DOWN:
        if (this._highlightedIndex === null) {
          this._highlightedIndex = 0;
          this._$previousResults.eq(this._highlightedIndex).addClass('typeahead__result--highlighted');
        } else if (this._highlightedIndex === this._$previousResults.length - 1) {
          this._$previousResults.eq(this._highlightedIndex).removeClass('typeahead__result--highlighted');
          this._highlightedIndex = null;
        } else {
          this._$previousResults.eq(this._highlightedIndex).removeClass('typeahead__result--highlighted');
          this._highlightedIndex += 1;
          this._$previousResults.eq(this._highlightedIndex).addClass('typeahead__result--highlighted');
        }
        return false;
        break;
      default:
        break;
    }
  }

  /**
   * Handles when text is inputted into the typeahead.
   * @method _handleInput
   * @param  {Event} evt The event
   * @return {undefined}
   */
  _handleInput(evt) {
    this._mapboxClient.geocodeForward(evt.target.value, (err, res) => {
      if (err) {
        return;
      }

      const locations = res.features;
      this._$typeaheadResults.empty();

      for (let i = 0, len = locations.length; i < len; i++) {
        const location = locations[i];
        const long = location.center[0];
        const lat = location.center[1];

        // Create and insert an element for each search result
        const searchResult = document.createElement('li');
        searchResult.className = 'typeahead__result';
        searchResult.innerHTML = location.place_name;
        searchResult.setAttribute('data-center', `${long},${lat}`);

        this._$typeaheadResults.append(searchResult);
        this._isResultsOpen = true;
      }

      // Save the results so they can be re-displayed later
      this._$previousResults = this._$typeaheadResults.children();
    });
  }

  /**
   * Handles when the typeahead is clicked. If there are previous results and the
   * typeahead results are not currently visible, we want to show them again.
   * @method _handleInputClick
   * @param  {Event} evt The event
   * @return {undefined}
   */
  _handleInputClick(evt) {
    const numPrevResults = this._$previousResults.length;

    // If results are already showing or there are no previious results, do nothing
    if (this._isResultsOpen || numPrevResults === 0) {
      return;
    }

    // Insert each previous result back into the list of results
    for (let i = 0; i < numPrevResults; i++) {
      this._$typeaheadResults.append(this._$previousResults[i]);
    }
    this._isResultsOpen = true;
  }

  /**
   * Handles when a typeahead result is clicked.
   * @method _handleResultsClick
   * @param  {Event} evt The event
   * @return {undefined}
   */
  _handleResultsClick(evt) {
    const $eventTarget = $(evt.target);

    if (!$eventTarget.hasClass('typeahead__result')) {
      return;
    }

    let longLat = $eventTarget.attr('data-center').split(',');

    longLat = longLat.map((val) => {
      return parseFloat(val, 10);
    });

    // TODO: Zoom in and fly to long/lat coordinates on the map

    // Set the input text to the selected value
    this._$typeahead.val($eventTarget.text());

    // Set the previous results to the result that was selected
    this._$previousResults = $eventTarget;

    // Hide and clear the list of results
    this._$typeaheadResults.empty();
    this._isResultsOpen = false;
  }
}

export default Typeahead;
