/**
 * constants.js
 */

/**
 * Key codes for specific keys
 * @type {Object}
 */
export const KEY_CODES = {
  DOWN: 40,
  ENTER: 13,
  ESC: 27,
  UP: 38,
};

/**
 * Mapbox-related strings
 * @type {Object}
 */
export const MAPBOX = {
  ACCESS_TOKEN: 'pk.eyJ1IjoiY2FzZWtsaW0iLCJhIjoiY2l5djI5d3Q2MDAwZTMzbXBwMDFxaDl0OSJ9.YOE46u2rclvWEAQd5zz6eA',
};

/**
 * Typeahead-related strings
 * @type {Object}
 */
export const TYPEAHEAD = {
  INPUT_CLASS: 'typeahead__input',
  RESULTS_CLASS: 'typeahead__results',
  RESULT_CLASS: 'typeahead__result',
  RESULT_HIGHLIGHTED_CLASS: 'typeahead__result--highlighted',
  COORDINATES_ATTRIBUTE: 'data-center',
};

export default {
  KEY_CODES,
  MAPBOX,
  TYPEAHEAD,
};
