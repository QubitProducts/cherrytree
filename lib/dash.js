let toString = Object.prototype.toString
let keys = Object.keys
let assoc = (obj, attr, val) => { obj[attr] = val; return obj }

export let isArray = obj =>
  toString.call(obj) === '[object Array]'

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

export let find = (list, pred) => {
  for (let x of list) if (pred(x)) return x
}

export let isString = obj =>
  Object.prototype.toString.call(obj) === '[object String]'

export let isObject = obj =>
  typeof obj === 'object'

export let mapNested = (root, childrenKey, fn) => {
  return root.map(map)

  function map (node) {
    node = clone(fn(node))
    if (node[childrenKey]) {
      node[childrenKey] = node[childrenKey].map(map)
    }
    return node
  }
}

export let defer = () => {
  let deferred = {}
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })
  return deferred
}
