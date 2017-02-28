import $ from 'jquery';
import MapboxGL from 'mapbox-gl';
import MapboxClient from 'mapbox';
import { map } from './map';
import { KEY_CODES, MAPBOX, TYPEAHEAD } from './constants';
import { debounce, getRandomPoint } from './utils';

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

    // TODO: Turn map into a class and store these there instead?
    this._mapMarkers = [];

    this._getElements();
    this._initializeEventListeners();
  }

  /**
   * Get and set the HTML elements for this component.
   * @method _getElements
   * @return {undefined}
   */
  _getElements() {
    this._$typeahead = $(`.${TYPEAHEAD.INPUT_CLASS}`);
    this._$typeaheadResults = $(`.${TYPEAHEAD.RESULTS_CLASS}`);
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
    const isClickOutside = !($eventTarget.hasClass(TYPEAHEAD.INPUT_CLASS) ||
                             $eventTarget.hasClass(TYPEAHEAD.RESULT_CLASS));

    if (this._isResultsOpen && isClickOutside) {
      this._clearResults();
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

    switch (event.keyCode) {
      case KEY_CODES.ENTER:
        this._enterInput();
        break;
      case KEY_CODES.ESC:
        this._clearResults();
        break;
      case KEY_CODES.UP:
        this._highlightUp();
        break;
      case KEY_CODES.DOWN:
        this._highlightDown();
        break;
      default:
        break;
    }
  }

  /**
   * When the enter key is pressed while a result is highlighted,
   * simulate a click on that result and clear highlighting.
   * @method _enterInput
   * @return {undefined}
   */
  _enterInput() {
    if (this._highlightedIndex !== null) {
      this._$previousResults.eq(this._highlightedIndex).click();
      this._$previousResults
        .eq(this._highlightedIndex)
        .removeClass(TYPEAHEAD.RESULT_HIGHLIGHTED_CLASS);
      this._highlightedIndex = null;
    }
  }

  /**
   * Clear the list of results and mark the results list as closed.
   * @method _clearResults
   * @return {undefined}
   */
  _clearResults() {
    this._$typeaheadResults.empty();
    this._isResultsOpen = false;
  }

  /**
   * Highlight the result next up in the list and set the input to the value highlighted.
   * @method _highlightUp
   * @return {Boolean} Return false to prevent the cursor from moving in the input field
   */
  _highlightUp() {
    if (this._highlightedIndex === null) {
      this._highlightedIndex = this._$previousResults.length - 1;
      this._$previousResults
        .eq(this._highlightedIndex)
        .addClass(TYPEAHEAD.RESULT_HIGHLIGHTED_CLASS);
    } else if (this._highlightedIndex === 0) {
      this._$previousResults
        .eq(this._highlightedIndex)
        .removeClass(TYPEAHEAD.RESULT_HIGHLIGHTED_CLASS);
      this._highlightedIndex = null;
    } else {
      this._$previousResults
        .eq(this._highlightedIndex)
        .removeClass(TYPEAHEAD.RESULT_HIGHLIGHTED_CLASS);
      this._highlightedIndex -= 1;
      this._$previousResults
        .eq(this._highlightedIndex)
        .addClass(TYPEAHEAD.RESULT_HIGHLIGHTED_CLASS);
    }

    this._$typeahead.val(this._$previousResults.eq(this._highlightedIndex).text());
    return false;
  }

  /**
   * Highlight the result next down in the list and set the input to the value highlighted.
   * @method _highlightDown
   * @return {Boolean} Return false to prevent the cursor from moving in the input field
   */
  _highlightDown() {
    if (this._highlightedIndex === null) {
      this._highlightedIndex = 0;
      this._$previousResults
        .eq(this._highlightedIndex)
        .addClass(TYPEAHEAD.RESULT_HIGHLIGHTED_CLASS);
    } else if (this._highlightedIndex === this._$previousResults.length - 1) {
      this._$previousResults
        .eq(this._highlightedIndex)
        .removeClass(TYPEAHEAD.RESULT_HIGHLIGHTED_CLASS);
      this._highlightedIndex = null;
    } else {
      this._$previousResults
        .eq(this._highlightedIndex)
        .removeClass(TYPEAHEAD.RESULT_HIGHLIGHTED_CLASS);
      this._highlightedIndex += 1;
      this._$previousResults
        .eq(this._highlightedIndex)
        .addClass(TYPEAHEAD.RESULT_HIGHLIGHTED_CLASS);
    }

    this._$typeahead.val(this._$previousResults.eq(this._highlightedIndex).text());
    return false;
  }

  /**
   * Handles when text is inputted into the typeahead.
   * @method _handleInput
   * @param  {Event} evt The event
   * @return {undefined}
   */
  _handleInput(evt) {
    this._$typeaheadResults.empty();
    this._highlightedIndex = null;

    this._mapboxClient.geocodeForward(evt.target.value, (err, res) => {
      if (err) {
        return;
      }

      const locations = res.features;

      for (let i = 0, len = locations.length; i < len; i++) {
        const location = locations[i];
        const long = location.center[0];
        const lat = location.center[1];

        // Create and insert an element for each search result
        const searchResult = document.createElement('li');
        searchResult.className = TYPEAHEAD.RESULT_CLASS;
        searchResult.innerHTML = location.place_name;
        searchResult.setAttribute(TYPEAHEAD.COORDINATES_ATTRIBUTE, `${long},${lat}`);

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

    if (!$eventTarget.hasClass(TYPEAHEAD.RESULT_CLASS)) {
      return;
    }

    // Parse the coordinates from the selected result
    let longLat = $eventTarget.attr(TYPEAHEAD.COORDINATES_ATTRIBUTE).split(',');
    longLat = longLat.map((val) => parseFloat(val, 10));

    // Remove all markers from the map
    this._mapMarkers.map((mapMarker) => {
      mapMarker.remove();
    });
    this._mapMarkers.splice(0, this._mapMarkers.length);

    // Center the selected location on the map
    map.flyTo({
      center: longLat,
    });

    // TODO: Fetch garage sale data and display nearby points on map:
    // Up to 3 dates, start time, street, cross street, city, title, postal code

    // TODO: Turn this into a function on Map class
    Array(5).fill().map(() => {
      const randomPoint = getRandomPoint(longLat[0], longLat[1]);

      const popup = new MapboxGL.Popup({ offset: 20 })
        .setText(`[${randomPoint[0]}, ${randomPoint[1]}]`);

      const el = document.createElement('div');
      el.style.backgroundImage = 'url(https://placehold.it/40x40)';
      el.style.width = '40px';
      el.style.height = '40px';
      const mapMarker = new MapboxGL.Marker(el, { offset: [-20, -20] })
        .setLngLat(randomPoint)
        .setPopup(popup)
        .addTo(map);
      this._mapMarkers.push(mapMarker);
    });

    // Set the input text to the selected value and set
    // previous results to the value that was selected
    this._$typeahead.val($eventTarget.text());
    this._$previousResults = $eventTarget;

    this._clearResults();
  }
}

export default Typeahead;
