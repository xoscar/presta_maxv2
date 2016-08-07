// dependencies
const crypto = require('crypto');
const _ = require('underscore');
const validator = require('validator');

/**
 * Returns the fingerprint from the combination of the given params.
 * @param  {Object} element object to get fingerprint
 * @param  {Array} params  combined generate the fingerprint.
 * @return {String}  hashed fingerprint.
 */
function generateFingerPrint(element, params) {
  var print = params.map(function (param) {
    return element[param];
  }).join('');
  return crypto.createHash('md5').update(print).digest('hex');
}

/////////////
// objects //
/////////////

/**
 * Removes the keys from the object
 * @param  {Object} object, the object that is going to be filtered.
 * @param  {Array} keys, the keys to remove.
 */
function filterKeys(object, keys) {
  for (var i = 0; i < keys; i++) {
    if (object.hasOwnProperty(keys[i]))
      delete object[keys[i]];
  }
}

/**
 * performs a shallow copy of a simple object
 * @param  {Object} object object to clone
 * @return {Object}        cloned object ready for manipulation
 */
function clone(object) {
  var string = JSON.stringify(object);
  if (typeof string !== 'undefined') return (JSON.parse(string));
  else return null;
}

/**
 * select a dynamic attribute from an object by using the selector
 * @param  {Object} object   object to select attribute from
 * @param  {String} selector attribute to select as string in dot-notation
 * @return {Object}          selected attribute
 */
function select(object, selector) {
  var path = selector.split('.');
  var obj = clone(object);
  for (var i = 0; i < path.length; i++) {
    if (_.has(obj, path[i])) obj = obj[path[i]];
    else return null;
  }

  return obj;
}

////////////
// arrays //
////////////

/**
 * adds a new element to an array if does not already exist
 * @param  {String} element element to add
 */
Array.prototype.pushIfNotExist = function (element) {

  if (this.indexOf(element) === -1) {
    this.push(element);
  }

};

/**
 * appends an array to another array
 * @param  {Array} otherArray array to append
 */
Array.prototype.extend = function (otherArray) {

  if (_.isArray(otherArray)) {
    otherArray.forEach(function (v) {
      this.push(v);
    }, this);
  }

};

/**
 * Validates the page and pagesize and returns the skip and limit
 * @param  {Number} page, page number.
 * @param  {Number} pageSize, size of the page.
 * @return {Object || Boolean}
 */
function validatePagination(page, pageSize) {
  var pageOkay = validator.isInt(page, {
    min: 0,
    max: 99,
  });
  var pageSizeOkay = validator.isInt(pageSize, {
    min: 0,
    max: 48,
  });

  if (!(pageOkay && pageSizeOkay))
    return false;

  return {
    limit: parseInt(pageSize),
    skip: parseInt(pageSize) * parseInt(page),
  };
}

/**
 * Gets the query from the request
 * @param  {Array} availableRequests, array of posible combinations of parameters.
 * @param  {Object} req, request object.
 * @return {Array}
 */
function getQueryFromRequest(availableRequests, req) {
  var query = null;
  var found = false;
  var search = 'body query params'.split(' ');
  search.forEach(function (s) {
    availableRequests.forEach(function (request) {
      var qAux = {};
      request.params.forEach(function (param, index) {
        if (req[s] && req[s][param])
          qAux[request.fields[index]] = req[s][param];
      });

      if (!found && Object.keys(qAux).length === request.params.length) {
        query = qAux;
        found = true;
      }
    });
  });

  _.keys(query).forEach(function (key) {
    if (key === 'user_id') query.user_id = parseInt(query.user_id, 10);
  });

  return query;
}

function generateArrayFromObject(object, fields) {
  var result = [];
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    if (!validator.isNull(String(select(object, field)))) {
      result.push(String(select(object, field)).toLowerCase());
    }
  }

  return result;
}

////////////
// Export //
////////////

module.exports = {
  filterKeys,
  validatePagination,
  clone,
  select,
  getQueryFromRequest,
  generateFingerPrint,
  generateArrayFromObject,
};
