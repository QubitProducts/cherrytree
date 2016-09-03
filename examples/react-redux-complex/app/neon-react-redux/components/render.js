let createElement = require('react').createElement

module.exports = function (router, routes) {
  if (!routes) return null
  return routes.reduceRight((children, route) => {
    let component = router.components[route.name]
    if (!component) {
      return children
    } else {
      return createElement(component, { children })
    }
  }, null)
}
