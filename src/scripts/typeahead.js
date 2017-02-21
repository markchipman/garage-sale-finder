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
    this._previousResults = [];
    this._isResultsOpen = false;

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

    // TODO: Clicking back into the typeahead should show the previous set of results
    if (this._isResultsOpen && isClickOutside) {
      $('.typeahead__results').empty();
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

    if (this._isResultsOpen) {
      switch (event.keyCode) {
        case KEY_CODES.ENTER:
          // TODO: Select typeahead result
          break;
        case KEY_CODES.UP:
          // TODO: Move up typeahead result
          break;
        case KEY_CODES.DOWN:
          // TODO: Move down typeahead result
          break;
        default:
          break;
      }
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

        const searchResult = document.createElement('li');
        searchResult.className = 'typeahead__result';
        searchResult.innerHTML = location.place_name;
        searchResult.setAttribute('data-center', `${long},${lat}`);

        this._$typeaheadResults.append(searchResult);
        this._isResultsOpen = true;
      }
    });
  }

  /**
   * Handles when a typeahead result is clicked.
   * @method _handleResultsClick
   * @param  {Event} evt The event
   * @return {undefined}
   */
  _handleResultsClick(evt) {
    const $eventTarget = $(evt.target);

    if ($eventTarget.hasClass('typeahead__result')) {
      let longLat = $eventTarget.attr('data-center').split(',');

      longLat = longLat.map((val) => {
        return parseFloat(val, 10);
      });

      // TODO: Zoom in and fly to long/lat coordinates on the map

      this._$typeaheadResults.empty();
      this._isResultsOpen = false;
    }
  }
}

export default Typeahead;
