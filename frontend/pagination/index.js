const template = require('!mustache!./pagination.hogan');
var Page = null;
var $rootNode = null;

module.exports.setRootNode = function (node) {
  $rootNode = node;
};

module.exports.listen = function (callback) {
  $rootNode.on('click', '.pagination .previous a', function (event) {
    event.preventDefault();
    callback(Page - 1);
  });

  $rootNode.on('click', '.pagination .number a', function (event) {
    var $this = $(this);
    event.preventDefault();
    callback(parseInt($this.html()) - 1);
  });

  $rootNode.on('click', '.pagination .next a', function (event) {
    event.preventDefault();
    callback(Page + 1);
  });
};

module.exports.show = function (page, numOfResults) {
  Page = page;
  var nextPages = [];
  for (var i = page; i < page + 1; i++) {
    nextPages.push(i + 2);
  }

  var pages = {
    current: page + 1,
    prevPages: page + 1  <= 1 ? [] : [page],
    nextPages: numOfResults === 0 || numOfResults < 12 ? null : nextPages,
    next: numOfResults === 0 || numOfResults < 12 ? null : nextPages[nextPages.length - 1],
    prev: page <= 2 ? null : page - 1,
  };

  $rootNode.find('.pagination').html('');
  $rootNode.find('.pagination').html(template(pages));
};
