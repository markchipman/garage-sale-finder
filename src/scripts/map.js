import MapboxGL from 'mapbox-gl';
import { MAPBOX } from './constants';

MapboxGL.accessToken = MAPBOX.ACCESS_TOKEN;

export let map = new MapboxGL.Map({
  container: 'map-canvas',
  style: 'mapbox://styles/mapbox/streets-v9',
  zoom: 13,
});
