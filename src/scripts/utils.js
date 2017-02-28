/**
 * Returns a function that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * the given number of milliseconds.
 * @param  {Function} func            The function to be debounced
 * @param  {Number}   [wait=100]      The number of milliseconds to wait
 * @param  {*}        [context=this]  The context in which to execute the returned function
 * @return {Function}                 The debounced function
 */
export function debounce(func, wait = 100, context = this) {
  let timeout;
  let args;

  const later = () => func.apply(context, args);

  return function() {
    args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Given a longitude and latitude, generates a random nearby point.
 * @param  {Number} x0 Longitude
 * @param  {Number} y0 Latitude
 * @return {Array}     Array containing new point values
 */
export function getRandomPoint(x0, y0) {
  const r = 1000 / 111300; // = 1,000 meters
  const u = Math.random();
  const v = Math.random();
  const w = r * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const x1 = x / Math.cos(y0);
  const y1 = w * Math.sin(t);

  return [
    x0 + x1,
    y0 + y1,
  ];
}

export default {
  debounce,
  getRandomPoint,
};
