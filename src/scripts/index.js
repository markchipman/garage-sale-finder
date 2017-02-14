'use strict';

if (module.hot) {
  module.hot.accept();
}

import 'babel-polyfill';
import $ from 'jquery';
import MapboxClient from 'mapbox';
import MapboxGL from 'mapbox-gl';
import { KEY_CODES } from './constants';

import '../styles/index.scss';

const accessToken = 'pk.eyJ1IjoiY2FzZWtsaW0iLCJhIjoiY2l5djI5d3Q2MDAwZTMzbXBwMDFxaDl0OSJ9.YOE46u2rclvWEAQd5zz6eA';

MapboxGL.accessToken = accessToken;
let map = new MapboxGL.Map({
    container: 'map-canvas',
    style: 'mapbox://styles/mapbox/streets-v9'
});

const client = new MapboxClient(accessToken);

const debounce = (func, wait = 100, context = this) => {
  let timeout;
  let args;

  const later = () => func.apply(context, args);

  return function() {
    args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const onInput = debounce(function (event) {
  client.geocodeForward(event.target.value, (err, res) => {
    if (err) {
      return;
    }

    const locations = res.features;
    $('.typeahead__results').empty();

    for (let i = 0, len = locations.length; i < len; i++) {
      const location = locations[i];
      const long = location.center[0];
      const lat = location.center[1];

      $('.typeahead__results').append(
        `<li class="typeahead__result" data-center="${long},${lat}">${location.place_name}</li>`
      );
    }
  });
}, 250);
$('#location-input').on('input', onInput);

$(window).on('click', (event) => {
  const $eventTarget = $(event.target);

  // TODO: Better check to ensure we're clickout outside the typeahead
  // TODO: Clicking back into the typeahead should show the previous set of results
  if (!$eventTarget.hasClass('typeahead__result')) {
    $('.typeahead__results').empty();
  }
});

$(window).on('keydown', (event) => {
  const evt = event || window.event;

  // TODO: Check if typeahead is open
  switch (evt.keyCode) {
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
});

$('.typeahead__results').on('click', (event) => {
  const $eventTarget = $(event.target);

  if ($eventTarget.hasClass('typeahead__result')) {
    let longLat = $eventTarget.attr('data-center').split(',');

    longLat = longLat.map((val) => {
      return parseFloat(val, 10);
    });

    map.flyTo({
      center: longLat,
    });
    // TODO: Zoom in using `map.setZoom(13)`
  }
});
