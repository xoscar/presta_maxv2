'use strict';

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
  const print = params.map(param => (
    element[param]
  )).join('');

  return crypto.createHash('md5').update(print).digest('hex');
}

/**
 * Removes the keys from the object
 * @param  {Object} object, the object that is going to be filtered.
 * @param  {Array} keys, the keys to remove.
 */
function filterKeys(object, keys) {
  return Object.keys(object).filter(key => (
    keys.indexOf(key) === -1
  ));
}

/**
 * performs a shallow copy of a simple object
 * @param  {Object} object object to clone
 * @return {Object}        cloned object ready for manipulation
 */
function clone(object) {
  try {
    return JSON.parse(JSON.stringify(object));
  } catch (e) {
    return null;
  }
}

/**
 * select a dynamic attribute from an object by using the selector
 * @param  {Object} object   object to select attribute from
 * @param  {String} selector attribute to select as string in dot-notation
 * @return {Object}          selected attribute
 */
function select(object, selector) {
  const path = selector.split('.');
  let obj = clone(object);

  path.forEach((pathSegment) => {
    if (_.has(obj, pathSegment)) {
      obj = obj[pathSegment];
    }
  });

  return obj;
}

/**
 * Validates the page and pagesize and returns the skip and limit
 * @param  {Number} page, page number.
 * @param  {Number} pageSize, size of the page.
 * @return {Object || Boolean}
 */
function validatePagination(page, pageSize) {
  const pageOkay = validator.isInt(page, {
    min: 0,
    max: 99,
  });

  const pageSizeOkay = validator.isInt(pageSize, {
    min: 0,
    max: 48,
  });

  if (!(pageOkay && pageSizeOkay)) {
    return false;
  }

  return {
    limit: parseInt(pageSize, 10),
    skip: parseInt(pageSize, 10) * parseInt(page, 10),
  };
}

/**
 * Gets the query from the request
 * @param  {Array} availableRequests, array of posible combinations of parameters.
 * @param  {Object} req, request object.
 * @return {Array}
 */
function getQueryFromRequest(availableRequests, req) {
  const query = {};
  let found = false;
  const search = 'body query params'.split(' ');

  search.forEach((s) => {
    availableRequests.forEach((request) => {
      request.params.forEach((param, index) => {
        if (req[s] && req[s][param]) {
          query[request.fields[index]] = req[s][param];
        }
      });

      if (!found && Object.keys(query).length === request.params.length) {
        found = true;
      }
    });
  });

  _.keys(query).forEach((key) => {
    if (key === 'user_id') query.user_id = parseInt(query.user_id, 10);
  });

  return query;
}

function generateArrayFromObject(object, fields) {
  const result = [];

  fields.forEach((field) => {
    if (select(object, field) && !validator.isNull(String(select(object, field)))) {
      result.push(String(select(object, field)).toLowerCase());
    }
  });

  return result;
}

module.exports = {
  filterKeys,
  validatePagination,
  clone,
  select,
  getQueryFromRequest,
  generateFingerPrint,
  generateArrayFromObject,
};
