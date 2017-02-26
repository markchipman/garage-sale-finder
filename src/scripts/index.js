'use strict';

if (module.hot) {
  module.hot.accept();
}

import 'babel-polyfill';
import $ from 'jquery';
import MapboxGL from 'mapbox-gl';
import Typeahead from './typeahead';
import { MAPBOX } from './constants';

import '../styles/index.scss';

MapboxGL.accessToken = MAPBOX.ACCESS_TOKEN;
let map;

let long;
let lat;

// TODO: Handle default location (error or when geolocation is not available)
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition((position) => {
    long = position.coords.longitude;
    lat = position.coords.latitude;

    // TODO: Finish loading state
    $('.loading').addClass('loading--hidden');

    map = new MapboxGL.Map({
        container: 'map-canvas',
        style: 'mapbox://styles/mapbox/streets-v9',
        zoom: 13,
        center: [long, lat],
    });
  }, (error) => {
    // TODO: Location is not available
  });
} else {
  // TODO: geolocation is not available
}

// TODO: Initialize typeahead more gracefully?
// TODO: Ensure only one typeahead and map are initialized?
const typeahead = new Typeahead();
