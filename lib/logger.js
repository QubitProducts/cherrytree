export default function createLogger (log, options) {
  options = options || {}
  // falsy means no logging
  if (!log) return () => {}
  // custom logging function
  if (log !== true) return log
  // true means use the default logger - console
  let fn = options.error ? console.error : console.info
  return function () {
    fn.apply(console, arguments)
  }
}
