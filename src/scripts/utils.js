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

export default {
  debounce,
};
