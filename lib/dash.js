let toString = Object.prototype.toString
let keys = Object.keys
let assoc = (obj, attr, val) => { obj[attr] = val; return obj }
let isArray = obj => toString.call(obj) === '[object Array]'

export let clone = obj =>
  obj
    ? isArray(obj)
      ? obj.slice(0)
      : extend({}, obj)
    : obj

export let pick = (obj, attrs) =>
  attrs.reduce((acc, attr) =>
    obj[attr] === undefined
      ? acc
      : assoc(acc, attr, obj[attr]), {})

export let isEqual = (obj1, obj2) =>
  keys(obj1).length === keys(obj2).length &&
    keys(obj1).reduce((acc, key) => acc && obj2[key] === obj1[key], true)

export let extend = (obj, ...rest) => {
  rest.forEach(source => {
    if (source) {
      for (let prop in source) {
        obj[prop] = source[prop]
      }
    }
  })
  return obj
}
