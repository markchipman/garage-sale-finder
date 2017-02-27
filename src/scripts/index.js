'use strict';

if (module.hot) {
  module.hot.accept();
}

import 'babel-polyfill';
import $ from 'jquery';
import MapboxGL from 'mapbox-gl';
import Typeahead from './typeahead';
import { map } from './map';
import { MAPBOX } from './constants';

import '../styles/index.scss';

const loadMap = new Promise((resolve, reject) => {
  map.on('load', resolve);
});
const getLocation = new Promise((resolve, reject) => {
  navigator.geolocation.getCurrentPosition(resolve, reject);
});

// TODO: Hide map then make it visible
// TODO: Add loading spinner
// TODO: Fix width of map
Promise.all([loadMap, getLocation]).then((values) => {
  const [evt, position] = values;

  map.setCenter([position.coords.longitude, position.coords.latitude]);

  $('.loading').addClass('loading--hidden');
  $('.map').addClass('map--visible');
}).catch((err) => {
  console.log(err);
});

// TODO: Initialize typeahead more gracefully?
// TODO: Ensure only one typeahead and map are initialized?
const typeahead = new Typeahead();
