// dependencies
const bcrypt = require('bcrypt-nodejs');
const objectMapper = require('object-mapper');

function select(object, selector) {
  if (object[selector]) return object[selector];

  const path = selector.split('.');
  let obj = Object.assign({}, object);

  for (let i = 0; i < path.length; i += 1) {
    if (obj[path[i]]) {
      obj = obj[path[i]];
    } else return null;
  }

  return obj;
}

module.exports.generateArrayFromObject = (object, fields) => {
  const result = [];

  fields.forEach((field) => {
    if (select(object, field)) {
      result.push(String(select(object, field)).toLowerCase());
    }
  });

  return result;
};

const validatePagination = (page = 0, pageSize = 12) => {
  const errors = [];

  if (page > 99 || page < 0) {
    errors.push([{
      code: 'wrongPageNumber',
      text: 'Page must be a number between 0 and 99',
    }]);
  }

  if (pageSize < 5 || pageSize > 45) {
    errors.push([{
      code: 'wrongPageSize',
      text: 'Page size must be a number between 0 and 45',
    }]);
  }

  return errors.length ? Promise.reject({
    statusCode: 400,
    messages: errors,
    type: 'validationError',
  }) : Promise.resolve({
    limit: Number(pageSize, 10),
    skip: Number(pageSize, 10) * Number(page, 10),
  });
};

module.exports.validatePagination = validatePagination;

module.exports.encryptString = string => (
  new Promise((resolve, reject) => (
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(string, salt, null, (hashErr, hash) => (
        hashErr ? reject(hashErr) : resolve(hash)
      ));
    })
  ))
);

module.exports.compareToEncryptedString = (enctypted, rawString) => (
  new Promise((resolve, reject) => (
    bcrypt.compare(rawString, enctypted, (err, isMatch) => (
      err ? reject(err) : resolve(isMatch)
    ))
  ))
);

module.exports.validateRequiredFields = (object, requiredFieldsList) => {
  const missingFields = requiredFieldsList.filter(requiredField => (!select(object, requiredField)));

  if (missingFields.length > 0) {
    return Promise.reject({
      statusCode: 400,
      code: `Missing fields in create request: ${missingFields.join(', ')}`,
    });
  }

  return Promise.resolve(object);
};

module.exports.hugs = (content, template) => (
  template.match(/{{(.*?)}}/g) ?
  template.match(/{{(.*?)}}/g).map(placeholder => placeholder.replace(/{+|}+/g, '')).forEach((placeholder) => {
    const value = select(content, placeholder);
    template = template.replace(`{{${placeholder}}}`, typeof value !== 'undefined' && value !== null ? select(content, placeholder) : '');
  }) : template
);

module.exports.search = (model, query, eachItem) => {
  const mappedQuery = objectMapper(query, {
    s: {
      key: 'searchTerms',
      default: ' ',
    },
    page: {
      key: 'page',
      default: 0,
    },
    pageSize: {
      key: 'pageSize',
      default: 12,
    },
  });

  // get pagination
  return validatePagination(mappedQuery.page, mappedQuery.pageSize)

    .then((pagination) => {
      const searchRequest = (type) => {
        const search = model[type]({
          $and: mappedQuery.searchTerms.trim().split(' ').map(term => ({
            search: {
              $regex: term,
              $options: 'i',
            },
          })),
        });

        if (type !== 'count') {
          search.limit(pagination.limit).skip(pagination.skip);
        }

        return search.sort({
          created: -1,
        })
        .exec();
      };

      return Promise.all([
        searchRequest('find'),
        searchRequest('count'),
      ])

      .then(([items, hits]) => (
        Promise.all(items.map(item => (
          eachItem ? eachItem(item) : item.getInfo()
        )))

        .then(results => (
          Promise.resolve({
            results,
            hits,
          })
        ))
      ))

      .catch(err => (
        Promise.reject({
          statusCode: 500,
          messages: [{
            code: 'searchError',
            text: `Error while searching ${err}`,
          }],
          type: 'InternalError',
        })
      ));
    });
};
