let createElement = require('react').createElement

module.exports = function (router, routes) {
  if (!routes) return null
  return routes.reduceRight((element, route) => {
    let routeOptions = router.getRouteOptions(route.name)
    if (!routeOptions.component) {
      return element
    } else {
      return createElement(routeOptions.component, {
        children: element
      })
    }
  }, null)
}
