'use strict';

if (module.hot) {
  module.hot.accept();
}

import 'babel-polyfill';
// import MapboxGL from 'mapbox-gl';
import { MAPBOX } from './constants';
import Typeahead from './typeahead';

import '../styles/index.scss';

// MapboxGL.accessToken = MAPBOX.ACCESS_TOKEN;
// let map = new MapboxGL.Map({
//     container: 'map-canvas',
//     style: 'mapbox://styles/mapbox/streets-v9'
// });

// TODO: Initialize typeahead more gracefully?
const typeahead = new Typeahead();
