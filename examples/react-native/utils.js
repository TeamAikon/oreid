/**
 * Created by traylewin on 6/28/17.
 */

export function isNullOrEmpty(obj) {
  if (!obj) {
    return true
  }
  if (obj === null) {
    return true
  }
  //Check for an empty array too
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return true
    }
  }
  return Object.keys(obj).length === 0 && obj.constructor === Object
}

export function urlParamsToArray(fullpath) {
  if (isNullOrEmpty(fullpath)) {
    return []
  }

  //Grab everything after hash if it exists
  if (fullpath.includes('?')) {
    fullpath = fullpath.split('?')[1]
  }

  const parts = fullpath.split(/[/?/$&]/)

  //Everything else delimited by '/' or ',' or '&' or '?' is a parameter
  let params = []
  if (parts.length > 0) {
    params = parts.slice(0)
  }
  // paramPairs  e.g. [ ['enabled'], [ 'abc', '123' ], [ 'dbc', '444' ] ]   -- if the parameter only has a name and no value, the value is set to true
  let paramPairs = params.map(param => splitAt(param.search(/[=]/), 1)(param)) //split at first '='
  let jsonParams = {}
  //convert array to json object e.g. { enabled: true, abc: '123', dbc: '444' }
  paramPairs.forEach(pair => {
    jsonParams[pair[0]] = decodeURIComponent(pair[1]) || true
  })
  return jsonParams
}

//split a string or array at a given index position
const splitAt = (index, dropChars) => x => [
  x.slice(0, index),
  x.slice(index + dropChars)
]
