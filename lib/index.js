import Router from './router'
import route from './route'
import BrowserLocation from './locations/browser'
import MemoryLocation from './locations/memory'

let createRouter = options => new Router(options)

// old school exports
createRouter.route = route
createRouter.BrowserLocation = BrowserLocation
createRouter.MemoryLocation = MemoryLocation

// es2015 exports
export default createRouter
export { BrowserLocation, MemoryLocation, route }
