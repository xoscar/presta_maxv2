const template = require('!mustache!./pagination.hogan');

function Pagination(root, type) {
  this.root = root;
  this.type = type;
  this.page = 0;
}

Pagination.prototype.listen = function (callback) {
  this.root.on('click', '.pagination-' + this.type + ' a', function (event) {
    var $this = $(this);
    event.preventDefault();
    callback(parseInt($this.attr('href')) - 1);
  });
};

Pagination.prototype.show = function (page, numOfResults) {
  this.page = page;
  var nextPages = [];
  for (var i = page; i < page + 1; i++) {
    nextPages.push(i + 2);
  }

  var pages = {
    current: page + 1,
    prevPages: page + 1 <= 1 ? [] : [page],
    nextPages: numOfResults === 0 || numOfResults < 12 ? null : nextPages,
    next: numOfResults === 0 || numOfResults < 12 ? null : nextPages[nextPages.length - 1],
    prev: page < 1 ? null : page,
  };

  this.root.find('.pagination-' + this.type).html('');
  this.root.find('.pagination-' + this.type).html(template(pages));
};

module.exports = Pagination;
