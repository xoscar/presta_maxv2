/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const clients = __webpack_require__(1);
	const loans = __webpack_require__(18);
	const charges = __webpack_require__(28);

	$(document).ready(function () {

	  var userId = $('#user').val();
	  var token = $('#token').val();

	  clients.init(userId, token, '#rootNode');
	  loans.init(userId, token, '#rootNode');
	  charges.init(userId, token, '#rootNode');
	  clients.index(function () {});

	  $('.button-collapse').sideNav();

	  $('#clients').click(function (event) {
	    event.preventDefault();
	    clients.index(function () {});
	    $(this).parent().find('a').removeClass('active');
	    $(this).addClass('active');
	  });

	  $('#loans').click(function (event) {
	    event.preventDefault();
	    loans.index(function () {});
	    $(this).parent().find('a').removeClass('active');
	    $(this).addClass('active');
	  });
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	const Client = __webpack_require__(2);
	const Pagination = __webpack_require__(5);
	const common = __webpack_require__(10);
	const Response = __webpack_require__(11);
	const templates = {
	  cards: __webpack_require__(13),
	  search: __webpack_require__(14),
	  loans: __webpack_require__(15),
	  client_holder: __webpack_require__(16),
	  client: __webpack_require__(17),
	};
	var searchControl = {
	  page: 0,
	  term: '',
	};
	var client = null;
	var $rootNode = null;
	var pagination = null;

	function showIndex(template, clients) {
	  $rootNode.find('.search-wrapper').html('');
	  $rootNode.find('.search-wrapper').html(templates[template](clients));
	  pagination.show(searchControl.page, clients.clients.length);
	}

	function sendSearch(query, callback) {
	  client.search(query, function (err, clients) {
	    if (err) return console.log(err);
	    showIndex('cards', { clients: clients });
	    callback(err, clients);
	  });
	}

	function showProfile(client) {
	  client.loans.forEach(function (loan) {
	    loan.text_color = loan.expired ? 'red-text' : 'green-text';
	  });

	  client.charges.forEach(function (charge) {
	    charge.text_color = charge.expired ? 'red-text' : 'green-text';
	  });

	  $rootNode.html(templates.client_holder());
	  $rootNode.find('.client_name').html(client.name_complete + ' ' + client.surname);
	  $rootNode.find('.profile').html(templates.client(client));
	  $rootNode.find('.collapsible').collapsible({});
	}

	function init(user, token, root) {
	  var headers = [{
	    name: 'user',
	    value: user,
	  }, {
	    name: 'token',
	    value: token,
	  }, ];
	  client = new Client(headers);
	  $rootNode = $(root);
	  pagination = new Pagination($rootNode, 'clients');

	  // search listener
	  $rootNode.on('submit', '.search-bar-form', function (event) {
	    event.preventDefault();
	    if (searchControl.term === $(this).find('input').val()) return;
	    searchControl.term = $(this).find('input').val();
	    searchControl.page = 0;
	    var query = [{
	      name: 's',
	      value: searchControl.term,
	    }, ];
	    sendSearch(query, function () {
	      console.log('>> clients loaded');
	    });
	  });

	  $rootNode.on('click', 'a.modal-trigger', function (event) {
	    event.preventDefault();
	    client.loans($(this).attr('href'), function (err, client) {
	      client.loans.forEach(function (loan) {
	        loan.text_color = loan.expired ? 'red-text' : 'green-text';
	      });

	      $rootNode.find('.modals').html(templates.loans(client));
	      $rootNode.find('.modals .payments ul:first-of-type').removeClass('hide');
	      $rootNode.find('.loans-modal').openModal();
	    });
	  });

	  $rootNode.on('submit', '.add_client_form', function (event) {
	    event.preventDefault();
	    var data = common.generateFormData($(this).serializeArray());
	    client.create(data, function (err) {
	      if (!err) {
	        $rootNode.find('.add-client-modal').closeModal();
	        sendSearch([], console.log);
	      }

	      Response.show('.add_client_response', err, 'Usuario creado exitosamente.');
	    });
	  });

	  $rootNode.on('click', '.add-client', function () {
	    $rootNode.find('.add-client-modal').openModal();
	  });

	  $rootNode.on('click', '.remove_client', function (event) {
	    event.preventDefault();
	    $rootNode.find('input[name="client_id"]').val($(this).attr('href'));
	    $rootNode.find('.remove_client_modal').openModal();
	  });

	  $rootNode.on('submit', '.remove_client_form', function (event) {
	    event.preventDefault();
	    var data = common.generateFormData($(this).serializeArray());
	    client.delete(data.client_id, function () {
	      $rootNode.find('.remove_client_modal').closeModal();
	      $rootNode.html(templates.search());
	      sendSearch([], console.log);
	    });
	  });

	  $rootNode.on('submit', '.update_profile_form', function (event) {
	    event.preventDefault();
	    var id = $(this).attr('href');
	    var data = common.generateFormData($(this).serializeArray());
	    client.update(id, data, function (err, client) {
	      if (!err) showProfile(client);
	      Response.show('.update_response', err, 'Usuario modificado exitosamente.');
	    });
	  });

	  $rootNode.on('click', '.modals .loan', function () {
	    var id = $(this).attr('href');

	    $rootNode.find('.payments ul').addClass('hide');
	    $rootNode.find('.payments [name="' + id + '"]').removeClass('hide');
	  });

	  $rootNode.on('click', '.profile_loans .loan', function () {
	    var id = $(this).attr('href');

	    $rootNode.find('.profile_loans ul').addClass('hide');
	    $rootNode.find('.profile_loans [name="' + id + '"]').removeClass('hide');
	  });

	  $rootNode.on('click', '.search-wrapper .more, .client_more', function (event) {
	    event.preventDefault();
	    var id = $(this).attr('href');
	    client.get(id, function (err, client) {
	      showProfile(client);
	    });
	  });

	  pagination.listen(function (page) {
	    searchControl.page = page;
	    var query = [{
	      name: 'page',
	      value: searchControl.page,
	    }, {
	      name: 's',
	      value: searchControl.term,
	    }, ];
	    client.search(query, function (err, clients) {
	      if (err) return console.log(err);
	      showIndex('cards', { clients: clients });
	    });
	  });
	}

	function index(callback) {
	  $rootNode.html(templates.search());
	  sendSearch([], callback);
	}

	module.exports = {
	  index: index,
	  init: init,
	};


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var RestConnection = __webpack_require__(3);
	var baseUrl = __webpack_require__(4).baseUrl.client;

	function Client(headers) {
	  this.resource = baseUrl;
	  this.headers = headers;
	}

	RestConnection.inherits(Client);

	Client.prototype.search = function (query, callback) {
	  var url = this.attachParamsToUrl(this.resource, query);
	  var options = this.generateOptions(url, 'GET', null, callback);
	  this.send(options);
	};

	Client.prototype.loans = function (id, callback) {
	  var url = this.resource + '/' + id + '/loans';
	  var options = this.generateOptions(url, 'GET', null, callback);
	  this.send(options);
	};

	module.exports = Client;


/***/ },
/* 3 */
/***/ function(module, exports) {

	var requestsWithBody = 'POST PATCH PUT'.split(' ');

	function RestConnection(options) {
	  this.resource = options.resource;
	  this.headers = options.headers;
	}

	RestConnection.prototype.attachParamsToUrl = function (url, query) {
	  if (!query) return null;
	  url = url + '?';
	  query.forEach(function (param) {
	    url += param.name + '=' + param.value + '&';
	  });

	  return url;
	};

	RestConnection.prototype.create = function (body, callback) {
	  var options = this.generateOptions(this.resource, 'POST', body, callback);
	  this.send(options);
	};

	RestConnection.prototype.update = function (id, body, callback) {
	  var url = this.resource + '/' + id;
	  var options = this.generateOptions(url, 'PATCH', body, callback);
	  this.send(options);
	};

	RestConnection.prototype.get = function (id, callback) {
	  var url = this.resource + '/' + id;
	  var options = this.generateOptions(url, 'GET', null, callback);
	  this.send(options);
	};

	RestConnection.prototype.getAll = function (callback) {
	  var url = this.resource;
	  var options = this.generateOptions(url, 'GET', null, callback);
	  console.log(options);
	  this.send(options);
	};

	RestConnection.prototype.delete = function (id, callback) {
	  var url = this.resource + '/' + id;
	  var options = this.generateOptions(url, 'DELETE', null, callback);
	  this.send(options);
	};

	RestConnection.prototype.generateOptions = function (url, method, body, callback) {
	  var options = {
	    type: method,
	    url: url,
	    headers: this.getHeaders(),
	    cache: false,
	    success: function (data, status, xhr) {
	      callback(null, data, status, xhr);
	    },

	    error: function (err) {
	      callback(err);
	    },
	  };

	  if (requestsWithBody.indexOf(method) !== -1)
	    options.data = JSON.stringify(body);
	  return options;
	};

	RestConnection.prototype.getHeaders = function () {
	  var result = {
	    'Content-type': 'application/json',
	  };

	  if (!this.headers) return result;
	  this.headers.forEach(function (h) {
	    result[h.name] = h.value;
	  });

	  return result;
	};

	RestConnection.prototype.send = function (options) {
	  $.ajax(options);
	};

	RestConnection.inherits = function (child) {
	  child.prototype = Object.create(this.prototype);
	};

	module.exports = RestConnection;


/***/ },
/* 4 */
/***/ function(module, exports) {

	const production = {
	  charge: 'http://52.37.139.27/api/charges',
	  client: 'http://52.37.139.27/api/clients',
	  loan: 'http://52.37.139.27/api/loans',
	};

	const local = {
	  charge: 'http://localhost:4000/api/charges',
	  client: 'http://localhost:4000/api/clients',
	  loan: 'http://localhost:4000/api/loans',
	};

	module.exports.baseUrl = local;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	const template = __webpack_require__(6);

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

	  console.log(page, page - 1);
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


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(7);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<ul class=\"pagination\">");t.b("\n");t.b("\n" + i);if(t.s(t.f("prev",c,p,1),c,p,0,35,144,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("		<li class=\"waves-effect previous\"><a href=\"");t.b(t.v(t.f("prev",c,p,0)));t.b("\"><i class=\"material-icons\">chevron_left</i></a></li>");t.b("\n" + i);});c.pop();}if(!t.s(t.f("prev",c,p,1),c,p,1,0,0,"")){t.b("  	<li class=\"disabled\"><a href=\"#!\"><i class=\"material-icons\">chevron_left</i></a></li>");t.b("\n" + i);};t.b("\n" + i);if(t.s(t.f("prevPages",c,p,1),c,p,0,283,352,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("  	<li class=\"waves-effect number\"><a href=\"");t.b(t.v(t.d(".",c,p,0)));t.b("\">");t.b(t.v(t.d(".",c,p,0)));t.b("</a></li>");t.b("\n" + i);});c.pop();}t.b("\n" + i);t.b("  <li class=\"active number\"><a href=\"");t.b(t.v(t.f("current",c,p,0)));t.b("\">");t.b(t.v(t.f("current",c,p,0)));t.b("</a></li>");t.b("\n");t.b("\n" + i);if(t.s(t.f("nextPages",c,p,1),c,p,0,456,525,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("  	<li class=\"waves-effect number\"><a href=\"");t.b(t.v(t.d(".",c,p,0)));t.b("\">");t.b(t.v(t.d(".",c,p,0)));t.b("</a></li>");t.b("\n" + i);});c.pop();}t.b("  ");t.b("\n" + i);if(t.s(t.f("next",c,p,1),c,p,0,554,660,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("		<li class=\"waves-effect next\"><a href=\"");t.b(t.v(t.f("next",c,p,0)));t.b("\"><i class=\"material-icons\">chevron_right</i></a></li>");t.b("\n" + i);});c.pop();}if(!t.s(t.f("next",c,p,1),c,p,1,0,0,"")){t.b("  	<li class=\"disabled\"><a href=\"#!\"><i class=\"material-icons\">chevron_right</i></a></li>");t.b("\n" + i);};t.b("</ul>");return t.fl(); },partials: {}, subs: {  }}, "<ul class=\"pagination\">\n\n\t{{#prev}}\n\t\t<li class=\"waves-effect previous\"><a href=\"{{prev}}\"><i class=\"material-icons\">chevron_left</i></a></li>\n\t{{/prev}}\n\t{{^prev}}\n  \t<li class=\"disabled\"><a href=\"#!\"><i class=\"material-icons\">chevron_left</i></a></li>\n  {{/prev}}\n\n  {{#prevPages}}\n  \t<li class=\"waves-effect number\"><a href=\"{{.}}\">{{.}}</a></li>\n  {{/prevPages}}\n\n  <li class=\"active number\"><a href=\"{{current}}\">{{current}}</a></li>\n\n  {{#nextPages}}\n  \t<li class=\"waves-effect number\"><a href=\"{{.}}\">{{.}}</a></li>\n  {{/nextPages}}\n  \n  {{#next}}\n\t\t<li class=\"waves-effect next\"><a href=\"{{next}}\"><i class=\"material-icons\">chevron_right</i></a></li>\n\t{{/next}}\n  {{^next}}\n  \t<li class=\"disabled\"><a href=\"#!\"><i class=\"material-icons\">chevron_right</i></a></li>\n  {{/next}}\n</ul>", H);return T.render.apply(T, arguments); };

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 *  Copyright 2011 Twitter, Inc.
	 *  Licensed under the Apache License, Version 2.0 (the "License");
	 *  you may not use this file except in compliance with the License.
	 *  You may obtain a copy of the License at
	 *
	 *  http://www.apache.org/licenses/LICENSE-2.0
	 *
	 *  Unless required by applicable law or agreed to in writing, software
	 *  distributed under the License is distributed on an "AS IS" BASIS,
	 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *  See the License for the specific language governing permissions and
	 *  limitations under the License.
	 */

	// This file is for use with Node.js. See dist/ for browser files.

	var Hogan = __webpack_require__(8);
	Hogan.Template = __webpack_require__(9).Template;
	Hogan.template = Hogan.Template;
	module.exports = Hogan;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 *  Copyright 2011 Twitter, Inc.
	 *  Licensed under the Apache License, Version 2.0 (the "License");
	 *  you may not use this file except in compliance with the License.
	 *  You may obtain a copy of the License at
	 *
	 *  http://www.apache.org/licenses/LICENSE-2.0
	 *
	 *  Unless required by applicable law or agreed to in writing, software
	 *  distributed under the License is distributed on an "AS IS" BASIS,
	 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *  See the License for the specific language governing permissions and
	 *  limitations under the License.
	 */

	(function (Hogan) {
	  // Setup regex  assignments
	  // remove whitespace according to Mustache spec
	  var rIsWhitespace = /\S/,
	      rQuot = /\"/g,
	      rNewline =  /\n/g,
	      rCr = /\r/g,
	      rSlash = /\\/g,
	      rLineSep = /\u2028/,
	      rParagraphSep = /\u2029/;

	  Hogan.tags = {
	    '#': 1, '^': 2, '<': 3, '$': 4,
	    '/': 5, '!': 6, '>': 7, '=': 8, '_v': 9,
	    '{': 10, '&': 11, '_t': 12
	  };

	  Hogan.scan = function scan(text, delimiters) {
	    var len = text.length,
	        IN_TEXT = 0,
	        IN_TAG_TYPE = 1,
	        IN_TAG = 2,
	        state = IN_TEXT,
	        tagType = null,
	        tag = null,
	        buf = '',
	        tokens = [],
	        seenTag = false,
	        i = 0,
	        lineStart = 0,
	        otag = '{{',
	        ctag = '}}';

	    function addBuf() {
	      if (buf.length > 0) {
	        tokens.push({tag: '_t', text: new String(buf)});
	        buf = '';
	      }
	    }

	    function lineIsWhitespace() {
	      var isAllWhitespace = true;
	      for (var j = lineStart; j < tokens.length; j++) {
	        isAllWhitespace =
	          (Hogan.tags[tokens[j].tag] < Hogan.tags['_v']) ||
	          (tokens[j].tag == '_t' && tokens[j].text.match(rIsWhitespace) === null);
	        if (!isAllWhitespace) {
	          return false;
	        }
	      }

	      return isAllWhitespace;
	    }

	    function filterLine(haveSeenTag, noNewLine) {
	      addBuf();

	      if (haveSeenTag && lineIsWhitespace()) {
	        for (var j = lineStart, next; j < tokens.length; j++) {
	          if (tokens[j].text) {
	            if ((next = tokens[j+1]) && next.tag == '>') {
	              // set indent to token value
	              next.indent = tokens[j].text.toString()
	            }
	            tokens.splice(j, 1);
	          }
	        }
	      } else if (!noNewLine) {
	        tokens.push({tag:'\n'});
	      }

	      seenTag = false;
	      lineStart = tokens.length;
	    }

	    function changeDelimiters(text, index) {
	      var close = '=' + ctag,
	          closeIndex = text.indexOf(close, index),
	          delimiters = trim(
	            text.substring(text.indexOf('=', index) + 1, closeIndex)
	          ).split(' ');

	      otag = delimiters[0];
	      ctag = delimiters[delimiters.length - 1];

	      return closeIndex + close.length - 1;
	    }

	    if (delimiters) {
	      delimiters = delimiters.split(' ');
	      otag = delimiters[0];
	      ctag = delimiters[1];
	    }

	    for (i = 0; i < len; i++) {
	      if (state == IN_TEXT) {
	        if (tagChange(otag, text, i)) {
	          --i;
	          addBuf();
	          state = IN_TAG_TYPE;
	        } else {
	          if (text.charAt(i) == '\n') {
	            filterLine(seenTag);
	          } else {
	            buf += text.charAt(i);
	          }
	        }
	      } else if (state == IN_TAG_TYPE) {
	        i += otag.length - 1;
	        tag = Hogan.tags[text.charAt(i + 1)];
	        tagType = tag ? text.charAt(i + 1) : '_v';
	        if (tagType == '=') {
	          i = changeDelimiters(text, i);
	          state = IN_TEXT;
	        } else {
	          if (tag) {
	            i++;
	          }
	          state = IN_TAG;
	        }
	        seenTag = i;
	      } else {
	        if (tagChange(ctag, text, i)) {
	          tokens.push({tag: tagType, n: trim(buf), otag: otag, ctag: ctag,
	                       i: (tagType == '/') ? seenTag - otag.length : i + ctag.length});
	          buf = '';
	          i += ctag.length - 1;
	          state = IN_TEXT;
	          if (tagType == '{') {
	            if (ctag == '}}') {
	              i++;
	            } else {
	              cleanTripleStache(tokens[tokens.length - 1]);
	            }
	          }
	        } else {
	          buf += text.charAt(i);
	        }
	      }
	    }

	    filterLine(seenTag, true);

	    return tokens;
	  }

	  function cleanTripleStache(token) {
	    if (token.n.substr(token.n.length - 1) === '}') {
	      token.n = token.n.substring(0, token.n.length - 1);
	    }
	  }

	  function trim(s) {
	    if (s.trim) {
	      return s.trim();
	    }

	    return s.replace(/^\s*|\s*$/g, '');
	  }

	  function tagChange(tag, text, index) {
	    if (text.charAt(index) != tag.charAt(0)) {
	      return false;
	    }

	    for (var i = 1, l = tag.length; i < l; i++) {
	      if (text.charAt(index + i) != tag.charAt(i)) {
	        return false;
	      }
	    }

	    return true;
	  }

	  // the tags allowed inside super templates
	  var allowedInSuper = {'_t': true, '\n': true, '$': true, '/': true};

	  function buildTree(tokens, kind, stack, customTags) {
	    var instructions = [],
	        opener = null,
	        tail = null,
	        token = null;

	    tail = stack[stack.length - 1];

	    while (tokens.length > 0) {
	      token = tokens.shift();

	      if (tail && tail.tag == '<' && !(token.tag in allowedInSuper)) {
	        throw new Error('Illegal content in < super tag.');
	      }

	      if (Hogan.tags[token.tag] <= Hogan.tags['$'] || isOpener(token, customTags)) {
	        stack.push(token);
	        token.nodes = buildTree(tokens, token.tag, stack, customTags);
	      } else if (token.tag == '/') {
	        if (stack.length === 0) {
	          throw new Error('Closing tag without opener: /' + token.n);
	        }
	        opener = stack.pop();
	        if (token.n != opener.n && !isCloser(token.n, opener.n, customTags)) {
	          throw new Error('Nesting error: ' + opener.n + ' vs. ' + token.n);
	        }
	        opener.end = token.i;
	        return instructions;
	      } else if (token.tag == '\n') {
	        token.last = (tokens.length == 0) || (tokens[0].tag == '\n');
	      }

	      instructions.push(token);
	    }

	    if (stack.length > 0) {
	      throw new Error('missing closing tag: ' + stack.pop().n);
	    }

	    return instructions;
	  }

	  function isOpener(token, tags) {
	    for (var i = 0, l = tags.length; i < l; i++) {
	      if (tags[i].o == token.n) {
	        token.tag = '#';
	        return true;
	      }
	    }
	  }

	  function isCloser(close, open, tags) {
	    for (var i = 0, l = tags.length; i < l; i++) {
	      if (tags[i].c == close && tags[i].o == open) {
	        return true;
	      }
	    }
	  }

	  function stringifySubstitutions(obj) {
	    var items = [];
	    for (var key in obj) {
	      items.push('"' + esc(key) + '": function(c,p,t,i) {' + obj[key] + '}');
	    }
	    return "{ " + items.join(",") + " }";
	  }

	  function stringifyPartials(codeObj) {
	    var partials = [];
	    for (var key in codeObj.partials) {
	      partials.push('"' + esc(key) + '":{name:"' + esc(codeObj.partials[key].name) + '", ' + stringifyPartials(codeObj.partials[key]) + "}");
	    }
	    return "partials: {" + partials.join(",") + "}, subs: " + stringifySubstitutions(codeObj.subs);
	  }

	  Hogan.stringify = function(codeObj, text, options) {
	    return "{code: function (c,p,i) { " + Hogan.wrapMain(codeObj.code) + " }," + stringifyPartials(codeObj) +  "}";
	  }

	  var serialNo = 0;
	  Hogan.generate = function(tree, text, options) {
	    serialNo = 0;
	    var context = { code: '', subs: {}, partials: {} };
	    Hogan.walk(tree, context);

	    if (options.asString) {
	      return this.stringify(context, text, options);
	    }

	    return this.makeTemplate(context, text, options);
	  }

	  Hogan.wrapMain = function(code) {
	    return 'var t=this;t.b(i=i||"");' + code + 'return t.fl();';
	  }

	  Hogan.template = Hogan.Template;

	  Hogan.makeTemplate = function(codeObj, text, options) {
	    var template = this.makePartials(codeObj);
	    template.code = new Function('c', 'p', 'i', this.wrapMain(codeObj.code));
	    return new this.template(template, text, this, options);
	  }

	  Hogan.makePartials = function(codeObj) {
	    var key, template = {subs: {}, partials: codeObj.partials, name: codeObj.name};
	    for (key in template.partials) {
	      template.partials[key] = this.makePartials(template.partials[key]);
	    }
	    for (key in codeObj.subs) {
	      template.subs[key] = new Function('c', 'p', 't', 'i', codeObj.subs[key]);
	    }
	    return template;
	  }

	  function esc(s) {
	    return s.replace(rSlash, '\\\\')
	            .replace(rQuot, '\\\"')
	            .replace(rNewline, '\\n')
	            .replace(rCr, '\\r')
	            .replace(rLineSep, '\\u2028')
	            .replace(rParagraphSep, '\\u2029');
	  }

	  function chooseMethod(s) {
	    return (~s.indexOf('.')) ? 'd' : 'f';
	  }

	  function createPartial(node, context) {
	    var prefix = "<" + (context.prefix || "");
	    var sym = prefix + node.n + serialNo++;
	    context.partials[sym] = {name: node.n, partials: {}};
	    context.code += 't.b(t.rp("' +  esc(sym) + '",c,p,"' + (node.indent || '') + '"));';
	    return sym;
	  }

	  Hogan.codegen = {
	    '#': function(node, context) {
	      context.code += 'if(t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),' +
	                      'c,p,0,' + node.i + ',' + node.end + ',"' + node.otag + " " + node.ctag + '")){' +
	                      't.rs(c,p,' + 'function(c,p,t){';
	      Hogan.walk(node.nodes, context);
	      context.code += '});c.pop();}';
	    },

	    '^': function(node, context) {
	      context.code += 'if(!t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),c,p,1,0,0,"")){';
	      Hogan.walk(node.nodes, context);
	      context.code += '};';
	    },

	    '>': createPartial,
	    '<': function(node, context) {
	      var ctx = {partials: {}, code: '', subs: {}, inPartial: true};
	      Hogan.walk(node.nodes, ctx);
	      var template = context.partials[createPartial(node, context)];
	      template.subs = ctx.subs;
	      template.partials = ctx.partials;
	    },

	    '$': function(node, context) {
	      var ctx = {subs: {}, code: '', partials: context.partials, prefix: node.n};
	      Hogan.walk(node.nodes, ctx);
	      context.subs[node.n] = ctx.code;
	      if (!context.inPartial) {
	        context.code += 't.sub("' + esc(node.n) + '",c,p,i);';
	      }
	    },

	    '\n': function(node, context) {
	      context.code += write('"\\n"' + (node.last ? '' : ' + i'));
	    },

	    '_v': function(node, context) {
	      context.code += 't.b(t.v(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
	    },

	    '_t': function(node, context) {
	      context.code += write('"' + esc(node.text) + '"');
	    },

	    '{': tripleStache,

	    '&': tripleStache
	  }

	  function tripleStache(node, context) {
	    context.code += 't.b(t.t(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
	  }

	  function write(s) {
	    return 't.b(' + s + ');';
	  }

	  Hogan.walk = function(nodelist, context) {
	    var func;
	    for (var i = 0, l = nodelist.length; i < l; i++) {
	      func = Hogan.codegen[nodelist[i].tag];
	      func && func(nodelist[i], context);
	    }
	    return context;
	  }

	  Hogan.parse = function(tokens, text, options) {
	    options = options || {};
	    return buildTree(tokens, '', [], options.sectionTags || []);
	  }

	  Hogan.cache = {};

	  Hogan.cacheKey = function(text, options) {
	    return [text, !!options.asString, !!options.disableLambda, options.delimiters, !!options.modelGet].join('||');
	  }

	  Hogan.compile = function(text, options) {
	    options = options || {};
	    var key = Hogan.cacheKey(text, options);
	    var template = this.cache[key];

	    if (template) {
	      var partials = template.partials;
	      for (var name in partials) {
	        delete partials[name].instance;
	      }
	      return template;
	    }

	    template = this.generate(this.parse(this.scan(text, options.delimiters), text, options), text, options);
	    return this.cache[key] = template;
	  }
	})( true ? exports : Hogan);


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 *  Copyright 2011 Twitter, Inc.
	 *  Licensed under the Apache License, Version 2.0 (the "License");
	 *  you may not use this file except in compliance with the License.
	 *  You may obtain a copy of the License at
	 *
	 *  http://www.apache.org/licenses/LICENSE-2.0
	 *
	 *  Unless required by applicable law or agreed to in writing, software
	 *  distributed under the License is distributed on an "AS IS" BASIS,
	 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 *  See the License for the specific language governing permissions and
	 *  limitations under the License.
	 */

	var Hogan = {};

	(function (Hogan) {
	  Hogan.Template = function (codeObj, text, compiler, options) {
	    codeObj = codeObj || {};
	    this.r = codeObj.code || this.r;
	    this.c = compiler;
	    this.options = options || {};
	    this.text = text || '';
	    this.partials = codeObj.partials || {};
	    this.subs = codeObj.subs || {};
	    this.buf = '';
	  }

	  Hogan.Template.prototype = {
	    // render: replaced by generated code.
	    r: function (context, partials, indent) { return ''; },

	    // variable escaping
	    v: hoganEscape,

	    // triple stache
	    t: coerceToString,

	    render: function render(context, partials, indent) {
	      return this.ri([context], partials || {}, indent);
	    },

	    // render internal -- a hook for overrides that catches partials too
	    ri: function (context, partials, indent) {
	      return this.r(context, partials, indent);
	    },

	    // ensurePartial
	    ep: function(symbol, partials) {
	      var partial = this.partials[symbol];

	      // check to see that if we've instantiated this partial before
	      var template = partials[partial.name];
	      if (partial.instance && partial.base == template) {
	        return partial.instance;
	      }

	      if (typeof template == 'string') {
	        if (!this.c) {
	          throw new Error("No compiler available.");
	        }
	        template = this.c.compile(template, this.options);
	      }

	      if (!template) {
	        return null;
	      }

	      // We use this to check whether the partials dictionary has changed
	      this.partials[symbol].base = template;

	      if (partial.subs) {
	        // Make sure we consider parent template now
	        if (!partials.stackText) partials.stackText = {};
	        for (key in partial.subs) {
	          if (!partials.stackText[key]) {
	            partials.stackText[key] = (this.activeSub !== undefined && partials.stackText[this.activeSub]) ? partials.stackText[this.activeSub] : this.text;
	          }
	        }
	        template = createSpecializedPartial(template, partial.subs, partial.partials,
	          this.stackSubs, this.stackPartials, partials.stackText);
	      }
	      this.partials[symbol].instance = template;

	      return template;
	    },

	    // tries to find a partial in the current scope and render it
	    rp: function(symbol, context, partials, indent) {
	      var partial = this.ep(symbol, partials);
	      if (!partial) {
	        return '';
	      }

	      return partial.ri(context, partials, indent);
	    },

	    // render a section
	    rs: function(context, partials, section) {
	      var tail = context[context.length - 1];

	      if (!isArray(tail)) {
	        section(context, partials, this);
	        return;
	      }

	      for (var i = 0; i < tail.length; i++) {
	        context.push(tail[i]);
	        section(context, partials, this);
	        context.pop();
	      }
	    },

	    // maybe start a section
	    s: function(val, ctx, partials, inverted, start, end, tags) {
	      var pass;

	      if (isArray(val) && val.length === 0) {
	        return false;
	      }

	      if (typeof val == 'function') {
	        val = this.ms(val, ctx, partials, inverted, start, end, tags);
	      }

	      pass = !!val;

	      if (!inverted && pass && ctx) {
	        ctx.push((typeof val == 'object') ? val : ctx[ctx.length - 1]);
	      }

	      return pass;
	    },

	    // find values with dotted names
	    d: function(key, ctx, partials, returnFound) {
	      var found,
	          names = key.split('.'),
	          val = this.f(names[0], ctx, partials, returnFound),
	          doModelGet = this.options.modelGet,
	          cx = null;

	      if (key === '.' && isArray(ctx[ctx.length - 2])) {
	        val = ctx[ctx.length - 1];
	      } else {
	        for (var i = 1; i < names.length; i++) {
	          found = findInScope(names[i], val, doModelGet);
	          if (found !== undefined) {
	            cx = val;
	            val = found;
	          } else {
	            val = '';
	          }
	        }
	      }

	      if (returnFound && !val) {
	        return false;
	      }

	      if (!returnFound && typeof val == 'function') {
	        ctx.push(cx);
	        val = this.mv(val, ctx, partials);
	        ctx.pop();
	      }

	      return val;
	    },

	    // find values with normal names
	    f: function(key, ctx, partials, returnFound) {
	      var val = false,
	          v = null,
	          found = false,
	          doModelGet = this.options.modelGet;

	      for (var i = ctx.length - 1; i >= 0; i--) {
	        v = ctx[i];
	        val = findInScope(key, v, doModelGet);
	        if (val !== undefined) {
	          found = true;
	          break;
	        }
	      }

	      if (!found) {
	        return (returnFound) ? false : "";
	      }

	      if (!returnFound && typeof val == 'function') {
	        val = this.mv(val, ctx, partials);
	      }

	      return val;
	    },

	    // higher order templates
	    ls: function(func, cx, partials, text, tags) {
	      var oldTags = this.options.delimiters;

	      this.options.delimiters = tags;
	      this.b(this.ct(coerceToString(func.call(cx, text)), cx, partials));
	      this.options.delimiters = oldTags;

	      return false;
	    },

	    // compile text
	    ct: function(text, cx, partials) {
	      if (this.options.disableLambda) {
	        throw new Error('Lambda features disabled.');
	      }
	      return this.c.compile(text, this.options).render(cx, partials);
	    },

	    // template result buffering
	    b: function(s) { this.buf += s; },

	    fl: function() { var r = this.buf; this.buf = ''; return r; },

	    // method replace section
	    ms: function(func, ctx, partials, inverted, start, end, tags) {
	      var textSource,
	          cx = ctx[ctx.length - 1],
	          result = func.call(cx);

	      if (typeof result == 'function') {
	        if (inverted) {
	          return true;
	        } else {
	          textSource = (this.activeSub && this.subsText && this.subsText[this.activeSub]) ? this.subsText[this.activeSub] : this.text;
	          return this.ls(result, cx, partials, textSource.substring(start, end), tags);
	        }
	      }

	      return result;
	    },

	    // method replace variable
	    mv: function(func, ctx, partials) {
	      var cx = ctx[ctx.length - 1];
	      var result = func.call(cx);

	      if (typeof result == 'function') {
	        return this.ct(coerceToString(result.call(cx)), cx, partials);
	      }

	      return result;
	    },

	    sub: function(name, context, partials, indent) {
	      var f = this.subs[name];
	      if (f) {
	        this.activeSub = name;
	        f(context, partials, this, indent);
	        this.activeSub = false;
	      }
	    }

	  };

	  //Find a key in an object
	  function findInScope(key, scope, doModelGet) {
	    var val;

	    if (scope && typeof scope == 'object') {

	      if (scope[key] !== undefined) {
	        val = scope[key];

	      // try lookup with get for backbone or similar model data
	      } else if (doModelGet && scope.get && typeof scope.get == 'function') {
	        val = scope.get(key);
	      }
	    }

	    return val;
	  }

	  function createSpecializedPartial(instance, subs, partials, stackSubs, stackPartials, stackText) {
	    function PartialTemplate() {};
	    PartialTemplate.prototype = instance;
	    function Substitutions() {};
	    Substitutions.prototype = instance.subs;
	    var key;
	    var partial = new PartialTemplate();
	    partial.subs = new Substitutions();
	    partial.subsText = {};  //hehe. substext.
	    partial.buf = '';

	    stackSubs = stackSubs || {};
	    partial.stackSubs = stackSubs;
	    partial.subsText = stackText;
	    for (key in subs) {
	      if (!stackSubs[key]) stackSubs[key] = subs[key];
	    }
	    for (key in stackSubs) {
	      partial.subs[key] = stackSubs[key];
	    }

	    stackPartials = stackPartials || {};
	    partial.stackPartials = stackPartials;
	    for (key in partials) {
	      if (!stackPartials[key]) stackPartials[key] = partials[key];
	    }
	    for (key in stackPartials) {
	      partial.partials[key] = stackPartials[key];
	    }

	    return partial;
	  }

	  var rAmp = /&/g,
	      rLt = /</g,
	      rGt = />/g,
	      rApos = /\'/g,
	      rQuot = /\"/g,
	      hChars = /[&<>\"\']/;

	  function coerceToString(val) {
	    return String((val === null || val === undefined) ? '' : val);
	  }

	  function hoganEscape(str) {
	    str = coerceToString(str);
	    return hChars.test(str) ?
	      str
	        .replace(rAmp, '&amp;')
	        .replace(rLt, '&lt;')
	        .replace(rGt, '&gt;')
	        .replace(rApos, '&#39;')
	        .replace(rQuot, '&quot;') :
	      str;
	  }

	  var isArray = Array.isArray || function(a) {
	    return Object.prototype.toString.call(a) === '[object Array]';
	  };

	})( true ? exports : Hogan);


/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports.generateFormData = function (serializeArray) {
	  var result = {};

	  serializeArray.forEach(function (field) {
	    result[field.name] = field.value;
	  });

	  return result;
	};

	module.exports.wait = function (seconds, callback) {
	  setTimeout(callback, seconds * 1000);
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var template = __webpack_require__(12);
	var $rootNode = null;

	module.exports.show = function (selector, err, response) {
	  var messages = null;
	  if (err) messages = { errors: JSON.parse(err.responseText).messages };
	  else if (err && !messages) messages = [{ messages: err.responseText }];
	  else if (response) messages = { success: [{ message: response }] };
	  if (messages)
	    $rootNode.find(selector).html(template(messages));
	};

	module.exports.setRootNode = function (root) {
	  $rootNode = root;
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(7);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");if(t.s(t.f("errors",c,p,1),c,p,0,11,135,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("	<div class=\"white-text animated bounceIn red chip\"> ");t.b("\n" + i);t.b("		");t.b(t.v(t.f("message",c,p,0)));t.b("\n" + i);t.b("    <i class=\"close material-icons\">close</i>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);});c.pop();}if(t.s(t.f("success",c,p,1),c,p,0,159,292,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("	<div class=\"white-text animated bounceIn green chip\"> ");t.b("\n" + i);t.b("		");t.b(t.v(t.f("message",c,p,0)));t.b("\n" + i);t.b("    <i class=\"close material-icons\">close</i>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("  <br>");t.b("\n" + i);});c.pop();}return t.fl(); },partials: {}, subs: {  }}, "{{#errors}}\n\t<div class=\"white-text animated bounceIn red chip\"> \n\t\t{{message}}\n    <i class=\"close material-icons\">close</i>\n  </div>\n{{/errors}}\n{{#success}}\n\t<div class=\"white-text animated bounceIn green chip\"> \n\t\t{{message}}\n    <i class=\"close material-icons\">close</i>\n  </div>\n  <br>\n{{/success}}", H);return T.render.apply(T, arguments); };

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(7);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"row\">");t.b("\n" + i);t.b("  <div class=\"col s12 grey-text darken-2\">");t.b("\n" + i);t.b("    <div class=\"row\">");t.b("\n" + i);if(t.s(t.f("clients",c,p,1),c,p,0,99,1319,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("      <div class=\"col s12 m4\">");t.b("\n" + i);t.b("        <div class=\"card client\">");t.b("\n" + i);t.b("          <div class=\"card-content grey-text text-darken-2\">");t.b("\n" + i);t.b("            <span class=\"card-title capitalize\">");t.b("\n" + i);t.b("              ");t.b(t.v(t.f("client_id",c,p,0)));t.b("\n" + i);t.b("            </span>");t.b("\n" + i);t.b("            <p class=\"capitalize\">Nombre: ");t.b(t.v(t.f("name_complete",c,p,0)));t.b(" ");t.b(t.v(t.f("surname",c,p,0)));t.b(".</p>");t.b("\n" + i);t.b("            <p>Prestamos activos: ");t.b(t.v(t.d("loans.length",c,p,0)));t.b(".</p>");t.b("\n" + i);t.b("            <p>Cargos activos: ");t.b(t.v(t.d("charges.length",c,p,0)));t.b(".</p>");t.b("\n" + i);if(t.s(t.f("last_payment",c,p,1),c,p,0,542,612,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                <p>Ultimo abono: ");t.b(t.v(t.f("last_payment",c,p,0)));t.b(".</p>");t.b("\n" + i);});c.pop();}t.b("            <p><b>Adeudo actual: $");t.b(t.v(t.f("total_depth",c,p,0)));t.b(".00.</b></p>");t.b("\n" + i);if(t.s(t.f("expired_loans",c,p,1),c,p,0,722,823,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("              <p class=\"red-text text-darken-2\">Tiene al menos un prestamo vencido.</p>");t.b("\n" + i);});c.pop();}if(!t.s(t.f("expired_loans",c,p,1),c,p,1,0,0,"")){t.b("              <p class=\"green-text text-darken-2\">No presenta ningun prestamo vencido.</p>");t.b("\n" + i);};t.b("          </div>");t.b("\n" + i);t.b("          <div class=\"card-action\">");t.b("\n" + i);t.b("              <a href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\" class=\"more green-text darken-2\">Más</a>");t.b("\n" + i);if(t.s(t.f("active_loans",c,p,1),c,p,0,1151,1252,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("              <a href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\" class=\"blue-text darken-2 modal-trigger\">Prestamos</a>");t.b("\n" + i);});c.pop();}t.b("          </div>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);});c.pop();}t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</div>");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "<div class=\"row\">\n  <div class=\"col s12 grey-text darken-2\">\n    <div class=\"row\">\n    {{#clients}}\n      <div class=\"col s12 m4\">\n        <div class=\"card client\">\n          <div class=\"card-content grey-text text-darken-2\">\n            <span class=\"card-title capitalize\">\n              {{client_id}}\n            </span>\n            <p class=\"capitalize\">Nombre: {{name_complete}} {{surname}}.</p>\n            <p>Prestamos activos: {{loans.length}}.</p>\n            <p>Cargos activos: {{charges.length}}.</p>\n              {{#last_payment}}\n                <p>Ultimo abono: {{last_payment}}.</p>\n              {{/last_payment}}\n            <p><b>Adeudo actual: ${{total_depth}}.00.</b></p>\n            {{#expired_loans}}\n              <p class=\"red-text text-darken-2\">Tiene al menos un prestamo vencido.</p>\n            {{/expired_loans}}\n            {{^expired_loans}}\n              <p class=\"green-text text-darken-2\">No presenta ningun prestamo vencido.</p>\n            {{/expired_loans}}\n          </div>\n          <div class=\"card-action\">\n              <a href=\"{{id}}\" class=\"more green-text darken-2\">Más</a>\n              {{#active_loans}}\n              <a href=\"{{id}}\" class=\"blue-text darken-2 modal-trigger\">Prestamos</a>\n              {{/active_loans}}\n          </div>\n        </div>\n      </div>\n    {{/clients}}\n    </div>\n  </div>\n</div>\n", H);return T.render.apply(T, arguments); };

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(7);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<!-- headings -->");t.b("\n" + i);t.b("<div class=\"row z-depth-1\">");t.b("\n" + i);t.b("  <div class=\"col s12\">");t.b("\n" + i);t.b("    <div style=\"margin-top:2%;\" class=\"col s12 red-text text-darken-2\">");t.b("\n" + i);t.b("      <div class=\"row\">");t.b("\n" + i);t.b("        <h4 class=\"col s10\"> Clientes </h4>");t.b("\n" + i);t.b("        <div class=\"col s2\">");t.b("\n" + i);t.b("          <button class=\"add-client right btn waves-effect\" style=\"margin-top: 20px\">");t.b("\n" + i);t.b("            Nuevo");t.b("\n" + i);t.b("            <i class=\"material-icons right\">account_box</i> ");t.b("\n" + i);t.b("          </button>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</div>");t.b("\n");t.b("\n" + i);t.b("<!-- search form -->");t.b("\n" + i);t.b("<div class=\"row z-depth-1\" style=\"padding: 10px;\">");t.b("\n" + i);t.b("	<form class=\"search-bar-form\">");t.b("\n" + i);t.b("	  <div class=\"col s10\">");t.b("\n" + i);t.b("	    <nav class=\"search red darken-2\">");t.b("\n" + i);t.b("	      <div class=\"nav-wrapper\">");t.b("\n" + i);t.b("          <div class=\"input-field\">");t.b("\n" + i);t.b("            <input type=\"search\" placeholder=\"ID de prestamo, ID de cliente, cantidad o semanas.\"/>");t.b("\n" + i);t.b("            <label for=\"search\"><i class=\"material-icons\">search</i></label><i class=\"material-icons\">close</i>");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("	      </div>");t.b("\n" + i);t.b("	    </nav>");t.b("\n" + i);t.b("	  </div>");t.b("\n" + i);t.b("	  <div class=\"col s2\">");t.b("\n" + i);t.b("	    <button class=\"btn red darken-2 white-text\">Buscar</button>");t.b("\n" + i);t.b("	  </div>");t.b("\n" + i);t.b("	</form>");t.b("\n" + i);t.b("</div>");t.b("\n");t.b("\n" + i);t.b("<!-- search results -->");t.b("\n" + i);t.b("<div class=\"search-wrapper z-depth-1 row animated fadeIn\" style=\"padding-top:20px;\">");t.b("\n" + i);t.b("</div>");t.b("\n");t.b("\n" + i);t.b("<!-- pagination -->");t.b("\n" + i);t.b("<div class =\"row center-align z-depth-1\">");t.b("\n" + i);t.b("  <div class=\"col s12 pagination-clients\">");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</div>");t.b("\n");t.b("\n" + i);t.b("<!-- new client -->");t.b("\n" + i);t.b("<div>");t.b("\n" + i);t.b("	<div class=\"modal add-client-modal\">");t.b("\n" + i);t.b("  	<div class=\"modal-content\">");t.b("\n" + i);t.b("  		<div class=\"col s12\">");t.b("\n" + i);t.b("			  <h5>Agregar cliente</h5>");t.b("\n" + i);t.b("			</div>");t.b("\n" + i);t.b("			<div class=\"col s12 add_client_response center-align\">");t.b("\n" + i);t.b("			</div>");t.b("\n" + i);t.b("			<form class=\"col s12 add_client_form\">");t.b("\n" + i);t.b("			  <div class=\"row\">");t.b("\n" + i);t.b("			    <div class=\"input-field col s4\">");t.b("\n" + i);t.b("			      <input id=\"name\" name=\"name\" type=\"text\" class=\"uppercase validate\">");t.b("\n" + i);t.b("			      <label for=\"name\">Nombre</label>");t.b("\n" + i);t.b("			    </div>");t.b("\n" + i);t.b("			    <div class=\"input-field col s4\">");t.b("\n" + i);t.b("			      <input id=\"surname\" name=\"surname\" type=\"text\" class=\"uppercase validate\">");t.b("\n" + i);t.b("			      <label for=\"surname\">Apellido</label>");t.b("\n" + i);t.b("			    </div>");t.b("\n" + i);t.b("			    <div class=\"input-field col s4\">");t.b("\n" + i);t.b("            <input id=\"phone\" name=\"phone\" type=\"text\" class=\"uppercase validate\">");t.b("\n" + i);t.b("            <label for=\"phone\">Teléfono</label>");t.b("\n" + i);t.b("        	</div>");t.b("\n" + i);t.b("			    <div class=\"input-field col s12\">");t.b("\n" + i);t.b("			      <textarea id=\"address\" name=\"address\" class=\"uppercase materialize-textarea\"></textarea>");t.b("\n" + i);t.b("			      <label for=\"address\">Dirección</label>");t.b("\n" + i);t.b("			    </div>");t.b("\n" + i);t.b("			  </div>");t.b("\n" + i);t.b("			  <div class=\"row\">");t.b("\n" + i);t.b("          <div class=\"col s12 right-align\">");t.b("\n" + i);t.b("          	<a class=\"modal-action modal-close waves-effect waves-green black-text btn grey lighten-3\">Cerrar</a>");t.b("\n" + i);t.b("            <button class=\"waves-effect waves-light btn\">Agregar</button>");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("			</form>");t.b("\n" + i);t.b("		</div>");t.b("\n" + i);t.b("</div>");t.b("\n");t.b("\n" + i);t.b("<!-- loan modals -->");t.b("\n" + i);t.b("<div>");t.b("\n" + i);t.b("	<div class=\"modal loans-modal modal-fixed-footer\" style=\"height: 80%; width: 80%;\">");t.b("\n" + i);t.b("	  <div class=\"modal-content modals\">");t.b("\n" + i);t.b("	  </div>");t.b("\n" + i);t.b("	  <div class=\"modal-footer\">");t.b("\n" + i);t.b("    	<a class=\" modal-action modal-close waves-effect waves-green btn-flat\">Cerrar</a>");t.b("\n" + i);t.b("		</div>");t.b("\n" + i);t.b("	</div>");t.b("\n" + i);t.b("</div>");t.b("\n");t.b("\n" + i);t.b("<!-- add payments -->");t.b("\n" + i);t.b("<div class=\"modal add_payment_modal\">");t.b("\n" + i);t.b("  <div class=\"modal-content add_payment_view\">");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }}, "<!-- headings -->\n<div class=\"row z-depth-1\">\n  <div class=\"col s12\">\n    <div style=\"margin-top:2%;\" class=\"col s12 red-text text-darken-2\">\n      <div class=\"row\">\n        <h4 class=\"col s10\"> Clientes </h4>\n        <div class=\"col s2\">\n          <button class=\"add-client right btn waves-effect\" style=\"margin-top: 20px\">\n            Nuevo\n            <i class=\"material-icons right\">account_box</i> \n          </button>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<!-- search form -->\n<div class=\"row z-depth-1\" style=\"padding: 10px;\">\n\t<form class=\"search-bar-form\">\n\t  <div class=\"col s10\">\n\t    <nav class=\"search red darken-2\">\n\t      <div class=\"nav-wrapper\">\n          <div class=\"input-field\">\n            <input type=\"search\" placeholder=\"ID de prestamo, ID de cliente, cantidad o semanas.\"/>\n            <label for=\"search\"><i class=\"material-icons\">search</i></label><i class=\"material-icons\">close</i>\n          </div>\n\t      </div>\n\t    </nav>\n\t  </div>\n\t  <div class=\"col s2\">\n\t    <button class=\"btn red darken-2 white-text\">Buscar</button>\n\t  </div>\n\t</form>\n</div>\n\n<!-- search results -->\n<div class=\"search-wrapper z-depth-1 row animated fadeIn\" style=\"padding-top:20px;\">\n</div>\n\n<!-- pagination -->\n<div class =\"row center-align z-depth-1\">\n  <div class=\"col s12 pagination-clients\">\n  </div>\n</div>\n\n<!-- new client -->\n<div>\n\t<div class=\"modal add-client-modal\">\n  \t<div class=\"modal-content\">\n  \t\t<div class=\"col s12\">\n\t\t\t  <h5>Agregar cliente</h5>\n\t\t\t</div>\n\t\t\t<div class=\"col s12 add_client_response center-align\">\n\t\t\t</div>\n\t\t\t<form class=\"col s12 add_client_form\">\n\t\t\t  <div class=\"row\">\n\t\t\t    <div class=\"input-field col s4\">\n\t\t\t      <input id=\"name\" name=\"name\" type=\"text\" class=\"uppercase validate\">\n\t\t\t      <label for=\"name\">Nombre</label>\n\t\t\t    </div>\n\t\t\t    <div class=\"input-field col s4\">\n\t\t\t      <input id=\"surname\" name=\"surname\" type=\"text\" class=\"uppercase validate\">\n\t\t\t      <label for=\"surname\">Apellido</label>\n\t\t\t    </div>\n\t\t\t    <div class=\"input-field col s4\">\n            <input id=\"phone\" name=\"phone\" type=\"text\" class=\"uppercase validate\">\n            <label for=\"phone\">Teléfono</label>\n        \t</div>\n\t\t\t    <div class=\"input-field col s12\">\n\t\t\t      <textarea id=\"address\" name=\"address\" class=\"uppercase materialize-textarea\"></textarea>\n\t\t\t      <label for=\"address\">Dirección</label>\n\t\t\t    </div>\n\t\t\t  </div>\n\t\t\t  <div class=\"row\">\n          <div class=\"col s12 right-align\">\n          \t<a class=\"modal-action modal-close waves-effect waves-green black-text btn grey lighten-3\">Cerrar</a>\n            <button class=\"waves-effect waves-light btn\">Agregar</button>\n          </div>\n        </div>\n\t\t\t</form>\n\t\t</div>\n</div>\n\n<!-- loan modals -->\n<div>\n\t<div class=\"modal loans-modal modal-fixed-footer\" style=\"height: 80%; width: 80%;\">\n\t  <div class=\"modal-content modals\">\n\t  </div>\n\t  <div class=\"modal-footer\">\n    \t<a class=\" modal-action modal-close waves-effect waves-green btn-flat\">Cerrar</a>\n\t\t</div>\n\t</div>\n</div>\n\n<!-- add payments -->\n<div class=\"modal add_payment_modal\">\n  <div class=\"modal-content add_payment_view\">\n  </div>\n</div>", H);return T.render.apply(T, arguments); };

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(7);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class =\"row\">");t.b("\n" + i);t.b("  <div class=\"col s12\">");t.b("\n" + i);t.b("  	<h4>Prestamos de <span class=\"capitalize\">");t.b(t.v(t.f("name_complete",c,p,0)));t.b("</span> <span style=\"font-size:.7em;\">(");t.b(t.v(t.f("client_id",c,p,0)));t.b(")</span></h4>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("  <div class=\"row\">");t.b("\n" + i);t.b("    <div class=\"col s6\">");t.b("\n" + i);t.b("      <h5>Prestamos</h5>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <div class=\"col s6\">");t.b("\n" + i);t.b("      <h5>Pagos</h5>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <div class =\"col s6\">");t.b("\n" + i);if(t.s(t.f("loans",c,p,1),c,p,0,360,1120,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("  		<div class=\"card loan\" href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\">");t.b("\n" + i);t.b("      	<div class=\"card-content white ");t.b(t.v(t.f("text_color",c,p,0)));t.b("  avatar text-darken-2\">");t.b("\n" + i);t.b("          <div class=\"row\" style=\"margin:0px\">");t.b("\n" + i);t.b("          <div class=\"col s6\">");t.b("\n" + i);t.b("            <p>Adeudo: $");t.b(t.v(t.f("current_balance",c,p,0)));t.b(".00 </p>");t.b("\n" + i);t.b("            <p>");t.b("\n" + i);t.b("              Creado ");t.b(t.v(t.f("created_from_now",c,p,0)));t.b(" <span style=\"font-size:.7rem;\">(");t.b(t.v(t.f("created",c,p,0)));t.b(")</span>");t.b("\n" + i);t.b("            </p>");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("          <div class=\"col s6\">");t.b("\n" + i);t.b("            <p>Cantidad: $");t.b(t.v(t.f("amount",c,p,0)));t.b(".00 </p>");t.b("\n" + i);if(t.s(t.f("last_payment",c,p,1),c,p,0,859,927,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("              <p>Abono: ");t.b(t.v(t.f("last_payment_from_now",c,p,0)));t.b(" </p>");t.b("\n" + i);});c.pop();}if(!t.s(t.f("last_payment",c,p,1),c,p,1,0,0,"")){t.b("              <p>No se han realizado pagos</p>");t.b("\n" + i);};t.b("          </div>");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);});c.pop();}t.b("    </div>");t.b("\n" + i);t.b("    <div class=\"col s6 payments\">");t.b("\n" + i);if(t.s(t.f("loans",c,p,1),c,p,0,1192,1753,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("        <ul class=\"collection hide\" name=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\">");t.b("\n" + i);if(t.s(t.f("payments",c,p,1),c,p,0,1267,1522,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            <li class=\"collection-item payment\">");t.b("\n" + i);t.b("              <span class=\"title green-text text-darken-2\">$");t.b(t.v(t.f("amount",c,p,0)));t.b(".00</span>");t.b("\n" + i);t.b("              <label>");t.b("\n" + i);t.b("                ");t.b(t.v(t.f("created_from_now",c,p,0)));t.b(" (");t.b(t.v(t.f("created",c,p,0)));t.b(")");t.b("\n" + i);t.b("              </label>");t.b("\n" + i);t.b("            </li>");t.b("\n" + i);});c.pop();}if(!t.s(t.f("payments",c,p,1),c,p,1,0,0,"")){t.b("            <li class=\"collection-item payment\">");t.b("\n" + i);t.b("              <span class=\"title text-darken-2\">No se han realizado pagos.</span>");t.b("\n" + i);t.b("            </li>");t.b("\n" + i);};t.b("        </ul>");t.b("\n" + i);});c.pop();}t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }}, "<div class =\"row\">\n  <div class=\"col s12\">\n  \t<h4>Prestamos de <span class=\"capitalize\">{{name_complete}}</span> <span style=\"font-size:.7em;\">({{client_id}})</span></h4>\n  </div>\n  <div class=\"row\">\n    <div class=\"col s6\">\n      <h5>Prestamos</h5>\n    </div>\n    <div class=\"col s6\">\n      <h5>Pagos</h5>\n    </div>\n    <div class =\"col s6\">\n      {{#loans}}\n  \t\t<div class=\"card loan\" href=\"{{id}}\">\n      \t<div class=\"card-content white {{text_color}}  avatar text-darken-2\">\n          <div class=\"row\" style=\"margin:0px\">\n          <div class=\"col s6\">\n            <p>Adeudo: ${{current_balance}}.00 </p>\n            <p>\n              Creado {{created_from_now}} <span style=\"font-size:.7rem;\">({{created}})</span>\n            </p>\n          </div>\n          <div class=\"col s6\">\n            <p>Cantidad: ${{amount}}.00 </p>\n            {{#last_payment}}\n              <p>Abono: {{last_payment_from_now}} </p>\n            {{/last_payment}}\n            {{^last_payment}}\n              <p>No se han realizado pagos</p>\n            {{/last_payment}}\n          </div>\n          </div>\n        </div>\n      </div>\n      {{/loans}}\n    </div>\n    <div class=\"col s6 payments\">\n      {{#loans}}\n        <ul class=\"collection hide\" name=\"{{id}}\">\n          {{#payments}}\n            <li class=\"collection-item payment\">\n              <span class=\"title green-text text-darken-2\">${{amount}}.00</span>\n              <label>\n                {{created_from_now}} ({{created}})\n              </label>\n            </li>\n          {{/payments}}\n          {{^payments}}\n            <li class=\"collection-item payment\">\n              <span class=\"title text-darken-2\">No se han realizado pagos.</span>\n            </li>\n          {{/payments}}\n        </ul>\n      {{/loans}}\n    </div>\n  </div>\n</div>", H);return T.render.apply(T, arguments); };

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(7);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"profile z-depth-1 animated fadeIn\"></div>");t.b("\n");t.b("\n" + i);t.b("<div class=\"modal add_loan_modal\">");t.b("\n" + i);t.b("  <div class=\"modal-content add_loan_view\">");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</div>");t.b("\n");t.b("\n" + i);t.b("<div class=\"modal remove_client_modal\" style=\"height: 57%;\">");t.b("\n" + i);t.b("  <div class=\"modal-content\">");t.b("\n" + i);t.b("    <div class=\"row\">");t.b("\n" + i);t.b("      <h5>Confirmacion de seguridad</h5>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <div class=\"row\">");t.b("\n" + i);t.b("      <div class=\"red-text card col s12 text-darken-3\">");t.b("\n" + i);t.b("        <div class=\"card-content\">");t.b("\n" + i);t.b("          Estas a punto de eliminar el cliente: <b class=\"client_name capitalize\"></b>, al momento");t.b("\n" + i);t.b("          de confirmar se borraran todos los prestamos y pagos realizados por este cliente y");t.b("\n" + i);t.b("          no habrá manera de recuperarlos.");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <div class=\"row\">");t.b("\n" + i);t.b("      <form class=\"col s12 remove_client_form\">");t.b("\n" + i);t.b("        <input type=\"hidden\" value=\"");t.b(t.v(t.f("client_id",c,p,0)));t.b("\" name=\"client_id\"/>");t.b("\n" + i);t.b("        <div class=\"row right-align\">");t.b("\n" + i);t.b("          <div class=\"input-field col s12\">");t.b("\n" + i);t.b("            <a class=\"modal-action modal-close waves-effect waves-green black-text btn grey lighten-3\">Cerrar</a>");t.b("\n" + i);t.b("            <input type=\"submit\" value=\"Eliminar\" class=\"btn waves-effect waves-light red white-text darken-2\" />");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("      </form>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</div>  ");t.b("\n");t.b("\n" + i);t.b("<!-- add charge -->");t.b("\n" + i);t.b("<div class=\"modal charge_modal\">");t.b("\n" + i);t.b("  <div class=\"modal-content charge_view\">");t.b("\n" + i);t.b("  </div> ");t.b("\n" + i);t.b("</div>");t.b("\n");t.b("\n" + i);t.b("<!-- add payments -->");t.b("\n" + i);t.b("<div class=\"modal add_payment_modal\">");t.b("\n" + i);t.b("  <div class=\"modal-content add_payment_view\">");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</div>");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "<div class=\"profile z-depth-1 animated fadeIn\"></div>\n\n<div class=\"modal add_loan_modal\">\n  <div class=\"modal-content add_loan_view\">\n  </div>\n</div>\n\n<div class=\"modal remove_client_modal\" style=\"height: 57%;\">\n  <div class=\"modal-content\">\n    <div class=\"row\">\n      <h5>Confirmacion de seguridad</h5>\n    </div>\n    <div class=\"row\">\n      <div class=\"red-text card col s12 text-darken-3\">\n        <div class=\"card-content\">\n          Estas a punto de eliminar el cliente: <b class=\"client_name capitalize\"></b>, al momento\n          de confirmar se borraran todos los prestamos y pagos realizados por este cliente y\n          no habrá manera de recuperarlos.\n        </div>\n      </div>\n    </div>\n    <div class=\"row\">\n      <form class=\"col s12 remove_client_form\">\n        <input type=\"hidden\" value=\"{{client_id}}\" name=\"client_id\"/>\n        <div class=\"row right-align\">\n          <div class=\"input-field col s12\">\n            <a class=\"modal-action modal-close waves-effect waves-green black-text btn grey lighten-3\">Cerrar</a>\n            <input type=\"submit\" value=\"Eliminar\" class=\"btn waves-effect waves-light red white-text darken-2\" />\n          </div>\n        </div>\n      </form>\n    </div>\n  </div>\n</div>  \n\n<!-- add charge -->\n<div class=\"modal charge_modal\">\n  <div class=\"modal-content charge_view\">\n  </div> \n</div>\n\n<!-- add payments -->\n<div class=\"modal add_payment_modal\">\n  <div class=\"modal-content add_payment_view\">\n  </div>\n</div>\n", H);return T.render.apply(T, arguments); };

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(7);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"row\">");t.b("\n" + i);t.b("  <div class=\"col s12\">");t.b("\n" + i);t.b("    <div style=\"margin-top:2%;\" class=\"col s12\">");t.b("\n" + i);t.b("      <div class=\"row\">");t.b("\n" + i);t.b("        <div class=\"col s8\">");t.b("\n" + i);t.b("          <h4 class=\"capitalize\">");t.b(t.v(t.f("name_complete",c,p,0)));t.b("</h4>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("        <div class=\"col s4 right-align\" style=\"margin-top:20px\">");t.b("\n" + i);t.b("          <button href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\" class=\"client_more btn waves-effect waves-green\"><i class=\"material-icons\">refresh</i></button>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("  <div class=\"col s12\">");t.b("\n" + i);t.b("    <div class=\"row\">");t.b("\n" + i);t.b("      <div class=\"col s8 update_response center-align\">");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);t.b("      <form class=\"col s8 update_profile_form\" href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\">");t.b("\n" + i);t.b("        <div class=\"row\">");t.b("\n" + i);t.b("          <div class=\"input-field col s6\">");t.b("\n" + i);t.b("            <input id=\"first_name\" name=\"name\" type=\"text\" class=\"uppercase validate\" value=\"");t.b(t.v(t.f("name_complete",c,p,0)));t.b("\">");t.b("\n" + i);t.b("            <label class=\"active\" for=\"first_name\">Nombre</label>");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("          <div class=\"input-field col s6\">");t.b("\n" + i);t.b("            <input id=\"last_name\" name=\"surname\" type=\"text\" class=\"uppercase validate\" value=\"");t.b(t.v(t.f("surname",c,p,0)));t.b("\">");t.b("\n" + i);t.b("            <label class=\"active\" for=\"last_name\">Apellido</label>");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("          <div class=\"input-field col s6\">");t.b("\n" + i);t.b("            <input id=\"phone\" name=\"phone\" type=\"text\" class=\"validate\" value=\"");t.b(t.v(t.f("phone",c,p,0)));t.b("\">");t.b("\n" + i);t.b("            <label class=\"active\" for=\"phone\">Teléfono</label>");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("          <div class=\"input-field col s12\">");t.b("\n" + i);t.b("            <textarea id=\"address\" name=\"address\" class=\"uppercase materialize-textarea\">");t.b(t.v(t.f("address",c,p,0)));t.b("</textarea>");t.b("\n" + i);t.b("            <label class=\"active\" for=\"address\">Dirección</label>");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("        <div class=\"row\">");t.b("\n" + i);t.b("          <div class=\"col s12 right-align\">");t.b("\n" + i);t.b("            <button class=\"waves-effect waves-light btn\">Modificar</button>");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("      </form>");t.b("\n" + i);t.b("      <div class=\"col s4\">");t.b("\n" + i);t.b("        <ul class=\"collection with-header\" style=\"margin-top:0px\">");t.b("\n" + i);t.b("          <li class=\"collection-header\"><h5>Información</h5></li>");t.b("\n" + i);t.b("          <li class=\"collection-item\"><div>ID: <span class=\"secondary-content\">");t.b(t.v(t.f("client_id",c,p,0)));t.b("</span></li>");t.b("\n" + i);t.b("          <li class=\"collection-item\"><div>Adeudo: <span class=\"secondary-content\">$");t.b(t.v(t.f("total_depth",c,p,0)));t.b(".00</span></li>");t.b("\n" + i);t.b("          <li class=\"collection-item\"><div>Creado: <span class=\"secondary-content\">");t.b(t.v(t.f("created",c,p,0)));t.b("</span></li>");t.b("\n" + i);t.b("          <li class=\"collection-item\"><div>Prestamos activos: <span class=\"secondary-content\">");t.b(t.v(t.d("loans.length",c,p,0)));t.b("</span></li>");t.b("\n" + i);if(t.s(t.f("last_payment",c,p,1),c,p,0,2431,2561,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            <li class=\"collection-item\"><div>Ultimo pago: <span class=\"secondary-content\">");t.b(t.v(t.f("last_payment",c,p,0)));t.b("</span></li>");t.b("\n" + i);});c.pop();}if(t.s(t.f("last_loan",c,p,1),c,p,0,2603,2734,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            <li class=\"collection-item\"><div>Ultimo prestamo: <span class=\"secondary-content\">");t.b(t.v(t.f("last_loan",c,p,0)));t.b("</span></li>");t.b("\n" + i);});c.pop();}t.b("          <li class=\"collection-item\"><div>Prestamos vencidos: ");t.b("\n" + i);if(t.s(t.f("expired_loans",c,p,1),c,p,0,2845,2920,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                <span class=\"secondary-content red-text\">Si");t.b("\n" + i);});c.pop();}if(!t.s(t.f("expired_loans",c,p,1),c,p,1,0,0,"")){t.b("              <span class=\"secondary-content\">No");t.b("\n" + i);};t.b("            </span>");t.b("\n" + i);t.b("          </li>");t.b("\n" + i);t.b("        </ul>");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("  <div class=\"row\">");t.b("\n" + i);t.b("    <div class=\"col s12\">");t.b("\n" + i);t.b("      <ul class=\"collapsible popout\" data-collapsible=\"accordion\">");t.b("\n" + i);t.b("        <li>");t.b("\n" + i);t.b("          <div class=\"collapsible-header active\"><i class=\"material-icons blue-text text-darken-2\">thumbs_up_down</i>Prestamos</div>");t.b("\n" + i);t.b("          <div class=\"collapsible-body\">");t.b("\n" + i);t.b("            <div class=\"row\">");t.b("\n" + i);if(t.s(t.f("loans",c,p,1),c,p,0,3491,4897,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                <div class=\"col s6\">");t.b("\n" + i);t.b("                  <div class=\"card\" href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\" style=\"height:169px;\">");t.b("\n" + i);t.b("                    <div class=\"card-content white ");t.b(t.v(t.f("text_color",c,p,0)));t.b("  avatar text-darken-2\">");t.b("\n" + i);t.b("                      <div class=\"row\" style=\"margin:0px\">");t.b("\n" + i);t.b("                        <div class=\"col s6\">");t.b("\n" + i);t.b("                          <p>Adeudo: $");t.b(t.v(t.f("current_balance",c,p,0)));t.b(".00 </p>");t.b("\n" + i);t.b("                          <p>");t.b("\n" + i);t.b("                            Creado ");t.b(t.v(t.f("created_from_now",c,p,0)));t.b(" <span style=\"font-size:.7rem;\">(");t.b(t.v(t.f("created",c,p,0)));t.b(")</span>");t.b("\n" + i);t.b("                          </p>");t.b("\n" + i);t.b("                        </div>");t.b("\n" + i);t.b("                        <div class=\"col s6\">");t.b("\n" + i);t.b("                          <p>Cantidad: $");t.b(t.v(t.f("amount",c,p,0)));t.b(".00 </p>");t.b("\n" + i);if(t.s(t.f("last_payment",c,p,1),c,p,0,4209,4305,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                            <p>Abono: ");t.b(t.v(t.f("last_payment_from_now",c,p,0)));t.b(" </p>");t.b("\n" + i);});c.pop();}if(!t.s(t.f("last_payment",c,p,1),c,p,1,0,0,"")){t.b("                            <p>No se han realizado pagos</p>");t.b("\n" + i);};t.b("                        </div>");t.b("\n" + i);t.b("                      </div>");t.b("\n" + i);t.b("                    </div>");t.b("\n" + i);t.b("                    <div class=\"card-action\">");t.b("\n" + i);t.b("                      <a href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\" class=\"green-text loan_more text-darken-2\">Más</a>");t.b("\n" + i);t.b("                      <a href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("-");t.b(t.v(t.f("weekly_payment",c,p,0)));t.b("\" class=\"payment_add blue-text text-darken-2\">Abonar</a>");t.b("\n" + i);t.b("                    </div>");t.b("\n" + i);t.b("                  </div>");t.b("\n" + i);t.b("                </div>");t.b("\n" + i);});c.pop();}if(!t.s(t.f("loans",c,p,1),c,p,1,0,0,"")){t.b("                <p>No hay cargos para mostrar.</p>");t.b("\n" + i);};t.b("            </div>");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("        </li>");t.b("\n" + i);t.b("        <li>");t.b("\n" + i);t.b("          <div class=\"collapsible-header\"><i class=\"material-icons green-text text-darken-2\">done</i>Prestamos liquidados</div>");t.b("\n" + i);t.b("          <div class=\"collapsible-body\">");t.b("\n" + i);t.b("            <div class=\"row\">");t.b("\n" + i);if(t.s(t.f("finished_loans",c,p,1),c,p,0,5304,6591,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                <div class=\"col s6\">");t.b("\n" + i);t.b("                  <div class=\"card\" href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\" style=\"height:169px;\">");t.b("\n" + i);t.b("                    <div class=\"card-content ");t.b(t.v(t.f("text_color",c,p,0)));t.b("  avatar text-darken-2\">");t.b("\n" + i);t.b("                      <div class=\"row\" style=\"margin:0px\">");t.b("\n" + i);t.b("                        <div class=\"col s6\">");t.b("\n" + i);t.b("                          <p>Adeudo: $");t.b(t.v(t.f("current_balance",c,p,0)));t.b(".00 </p>");t.b("\n" + i);t.b("                          <p>");t.b("\n" + i);t.b("                            Creado ");t.b(t.v(t.f("created_from_now",c,p,0)));t.b(" <span style=\"font-size:.7rem;\">(");t.b(t.v(t.f("created",c,p,0)));t.b(")</span>");t.b("\n" + i);t.b("                          </p>");t.b("\n" + i);t.b("                        </div>");t.b("\n" + i);t.b("                        <div class=\"col s6\">");t.b("\n" + i);t.b("                          <p>Cantidad: $");t.b(t.v(t.f("amount",c,p,0)));t.b(".00 </p>");t.b("\n" + i);if(t.s(t.f("last_payment",c,p,1),c,p,0,6016,6112,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                            <p>Abono: ");t.b(t.v(t.f("last_payment_from_now",c,p,0)));t.b(" </p>");t.b("\n" + i);});c.pop();}if(!t.s(t.f("last_payment",c,p,1),c,p,1,0,0,"")){t.b("                            <p>No se han realizado pagos</p>");t.b("\n" + i);};t.b("                        </div>");t.b("\n" + i);t.b("                      </div>");t.b("\n" + i);t.b("                    </div>");t.b("\n" + i);t.b("                    <div class=\"card-action\">");t.b("\n" + i);t.b("                      <a href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\" class=\"green-text loan_more text-darken-2\">Más</a>");t.b("\n" + i);t.b("                    </div>");t.b("\n" + i);t.b("                  </div>");t.b("\n" + i);t.b("                </div>");t.b("\n" + i);});c.pop();}if(!t.s(t.f("finished_loans",c,p,1),c,p,1,0,0,"")){t.b("                <p>No hay cargos para mostrar.</p>");t.b("\n" + i);};t.b("            </div>");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("        </li>");t.b("\n" + i);t.b("        <li>");t.b("\n" + i);t.b("          <div class=\"collapsible-header\"><i class=\"material-icons yellow-text text-darken-2\">attach_money</i>Cargos</div>");t.b("\n" + i);t.b("          <div class=\"collapsible-body\">");t.b("\n" + i);t.b("            <div class=\"row\">");t.b("\n" + i);if(t.s(t.f("charges",c,p,1),c,p,0,7013,8070,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                <div class=\"col s6\">");t.b("\n" + i);t.b("                  <div class=\"card\" href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\">");t.b("\n" + i);t.b("                    <div class=\"card-content white ");t.b(t.v(t.f("text_color",c,p,0)));t.b("  avatar text-darken-2\">");t.b("\n" + i);t.b("                      <div class=\"row\" style=\"margin:0px\">");t.b("\n" + i);t.b("                        <div class=\"col s12\">");t.b("\n" + i);t.b("                          <span>Cantidad: $");t.b(t.v(t.f("amount",c,p,0)));t.b(".00</span>");t.b("\n" + i);t.b("                          <p>Creado: ");t.b(t.v(t.f("created_from_now",c,p,0)));t.b(" (");t.b(t.v(t.f("created",c,p,0)));t.b(")</p>");t.b("\n" + i);if(t.s(t.f("paid",c,p,1),c,p,0,7474,7548,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                              <p>Pagado.</p>");t.b("\n" + i);});c.pop();}t.b("                        </div>");t.b("\n" + i);t.b("                      </div>");t.b("\n" + i);t.b("                    </div>");t.b("\n" + i);t.b("                    <div class=\"card-action\">");t.b("\n" + i);t.b("                      <a href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\" class=\"pay_charge blue-text text-darken-2\">Pagar</a>");t.b("\n" + i);t.b("                      <a href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\" class=\"update_charge yellow-text text-darken-2\">Modificar</a>");t.b("\n" + i);t.b("                      <a href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\" class=\"remove_charge red-text text-darken-2\">Eliminar</a>");t.b("\n" + i);t.b("                    </div>");t.b("\n" + i);t.b("                  </div>");t.b("\n" + i);t.b("                </div>");t.b("\n" + i);});c.pop();}if(!t.s(t.f("charges",c,p,1),c,p,1,0,0,"")){t.b("                <p>No hay cargos para mostrar.</p>");t.b("\n" + i);};t.b("            </div>");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("        </li>");t.b("\n" + i);t.b("      </ul>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n");t.b("\n" + i);t.b("<div class=\"fixed-action-btn horizontal\" style=\"bottom: 45px; right: 24px;\">");t.b("\n" + i);t.b("  <a class=\"btn-floating btn-large red darken-2\">");t.b("\n" + i);t.b("    <i class=\"large material-icons\">menu</i>");t.b("\n" + i);t.b("  </a>");t.b("\n" + i);t.b("  <ul>");t.b("\n" + i);t.b("    <li><a href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\" class=\"btn-floating remove_client red darken-1\"><i class=\"material-icons\">close</i></a></li>");t.b("\n" + i);t.b("    <li><a href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\" class=\"btn-floating add_loan blue darken-1\"><i class=\"material-icons\">exposure_plus_1</i></a></li>");t.b("\n" + i);t.b("    <li><a href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\" class=\"btn-floating add_charge yellow darken-3\"><i class=\"material-icons\">attach_money</i></a></li>");t.b("\n" + i);t.b("  </ul>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }}, "<div class=\"row\">\n  <div class=\"col s12\">\n    <div style=\"margin-top:2%;\" class=\"col s12\">\n      <div class=\"row\">\n        <div class=\"col s8\">\n          <h4 class=\"capitalize\">{{name_complete}}</h4>\n        </div>\n        <div class=\"col s4 right-align\" style=\"margin-top:20px\">\n          <button href=\"{{id}}\" class=\"client_more btn waves-effect waves-green\"><i class=\"material-icons\">refresh</i></button>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class=\"col s12\">\n    <div class=\"row\">\n      <div class=\"col s8 update_response center-align\">\n      </div>\n      <form class=\"col s8 update_profile_form\" href=\"{{id}}\">\n        <div class=\"row\">\n          <div class=\"input-field col s6\">\n            <input id=\"first_name\" name=\"name\" type=\"text\" class=\"uppercase validate\" value=\"{{name_complete}}\">\n            <label class=\"active\" for=\"first_name\">Nombre</label>\n          </div>\n          <div class=\"input-field col s6\">\n            <input id=\"last_name\" name=\"surname\" type=\"text\" class=\"uppercase validate\" value=\"{{surname}}\">\n            <label class=\"active\" for=\"last_name\">Apellido</label>\n          </div>\n          <div class=\"input-field col s6\">\n            <input id=\"phone\" name=\"phone\" type=\"text\" class=\"validate\" value=\"{{phone}}\">\n            <label class=\"active\" for=\"phone\">Teléfono</label>\n          </div>\n          <div class=\"input-field col s12\">\n            <textarea id=\"address\" name=\"address\" class=\"uppercase materialize-textarea\">{{address}}</textarea>\n            <label class=\"active\" for=\"address\">Dirección</label>\n          </div>\n        </div>\n        <div class=\"row\">\n          <div class=\"col s12 right-align\">\n            <button class=\"waves-effect waves-light btn\">Modificar</button>\n          </div>\n        </div>\n      </form>\n      <div class=\"col s4\">\n        <ul class=\"collection with-header\" style=\"margin-top:0px\">\n          <li class=\"collection-header\"><h5>Información</h5></li>\n          <li class=\"collection-item\"><div>ID: <span class=\"secondary-content\">{{client_id}}</span></li>\n          <li class=\"collection-item\"><div>Adeudo: <span class=\"secondary-content\">${{total_depth}}.00</span></li>\n          <li class=\"collection-item\"><div>Creado: <span class=\"secondary-content\">{{created}}</span></li>\n          <li class=\"collection-item\"><div>Prestamos activos: <span class=\"secondary-content\">{{loans.length}}</span></li>\n          {{#last_payment}}\n            <li class=\"collection-item\"><div>Ultimo pago: <span class=\"secondary-content\">{{last_payment}}</span></li>\n          {{/last_payment}}\n          {{#last_loan}}\n            <li class=\"collection-item\"><div>Ultimo prestamo: <span class=\"secondary-content\">{{last_loan}}</span></li>\n          {{/last_loan}}\n          <li class=\"collection-item\"><div>Prestamos vencidos: \n              {{#expired_loans}}\n                <span class=\"secondary-content red-text\">Si\n              {{/expired_loans}}\n              {{^expired_loans}}\n              <span class=\"secondary-content\">No\n              {{/expired_loans}}\n            </span>\n          </li>\n        </ul>\n      </div>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col s12\">\n      <ul class=\"collapsible popout\" data-collapsible=\"accordion\">\n        <li>\n          <div class=\"collapsible-header active\"><i class=\"material-icons blue-text text-darken-2\">thumbs_up_down</i>Prestamos</div>\n          <div class=\"collapsible-body\">\n            <div class=\"row\">\n              {{#loans}}\n                <div class=\"col s6\">\n                  <div class=\"card\" href=\"{{id}}\" style=\"height:169px;\">\n                    <div class=\"card-content white {{text_color}}  avatar text-darken-2\">\n                      <div class=\"row\" style=\"margin:0px\">\n                        <div class=\"col s6\">\n                          <p>Adeudo: ${{current_balance}}.00 </p>\n                          <p>\n                            Creado {{created_from_now}} <span style=\"font-size:.7rem;\">({{created}})</span>\n                          </p>\n                        </div>\n                        <div class=\"col s6\">\n                          <p>Cantidad: ${{amount}}.00 </p>\n                          {{#last_payment}}\n                            <p>Abono: {{last_payment_from_now}} </p>\n                          {{/last_payment}}\n                          {{^last_payment}}\n                            <p>No se han realizado pagos</p>\n                          {{/last_payment}}\n                        </div>\n                      </div>\n                    </div>\n                    <div class=\"card-action\">\n                      <a href=\"{{id}}\" class=\"green-text loan_more text-darken-2\">Más</a>\n                      <a href=\"{{id}}-{{weekly_payment}}\" class=\"payment_add blue-text text-darken-2\">Abonar</a>\n                    </div>\n                  </div>\n                </div>\n              {{/loans}}\n              {{^loans}}\n                <p>No hay cargos para mostrar.</p>\n              {{/loans}}\n            </div>\n          </div>\n        </li>\n        <li>\n          <div class=\"collapsible-header\"><i class=\"material-icons green-text text-darken-2\">done</i>Prestamos liquidados</div>\n          <div class=\"collapsible-body\">\n            <div class=\"row\">\n              {{#finished_loans}}\n                <div class=\"col s6\">\n                  <div class=\"card\" href=\"{{id}}\" style=\"height:169px;\">\n                    <div class=\"card-content {{text_color}}  avatar text-darken-2\">\n                      <div class=\"row\" style=\"margin:0px\">\n                        <div class=\"col s6\">\n                          <p>Adeudo: ${{current_balance}}.00 </p>\n                          <p>\n                            Creado {{created_from_now}} <span style=\"font-size:.7rem;\">({{created}})</span>\n                          </p>\n                        </div>\n                        <div class=\"col s6\">\n                          <p>Cantidad: ${{amount}}.00 </p>\n                          {{#last_payment}}\n                            <p>Abono: {{last_payment_from_now}} </p>\n                          {{/last_payment}}\n                          {{^last_payment}}\n                            <p>No se han realizado pagos</p>\n                          {{/last_payment}}\n                        </div>\n                      </div>\n                    </div>\n                    <div class=\"card-action\">\n                      <a href=\"{{id}}\" class=\"green-text loan_more text-darken-2\">Más</a>\n                    </div>\n                  </div>\n                </div>\n              {{/finished_loans}}\n              {{^finished_loans}}\n                <p>No hay cargos para mostrar.</p>\n              {{/finished_loans}}\n            </div>\n          </div>\n        </li>\n        <li>\n          <div class=\"collapsible-header\"><i class=\"material-icons yellow-text text-darken-2\">attach_money</i>Cargos</div>\n          <div class=\"collapsible-body\">\n            <div class=\"row\">\n              {{#charges}}\n                <div class=\"col s6\">\n                  <div class=\"card\" href=\"{{id}}\">\n                    <div class=\"card-content white {{text_color}}  avatar text-darken-2\">\n                      <div class=\"row\" style=\"margin:0px\">\n                        <div class=\"col s12\">\n                          <span>Cantidad: ${{amount}}.00</span>\n                          <p>Creado: {{created_from_now}} ({{created}})</p>\n                            {{#paid}}\n                              <p>Pagado.</p>\n                            {{/paid}}\n                        </div>\n                      </div>\n                    </div>\n                    <div class=\"card-action\">\n                      <a href=\"{{id}}\" class=\"pay_charge blue-text text-darken-2\">Pagar</a>\n                      <a href=\"{{id}}\" class=\"update_charge yellow-text text-darken-2\">Modificar</a>\n                      <a href=\"{{id}}\" class=\"remove_charge red-text text-darken-2\">Eliminar</a>\n                    </div>\n                  </div>\n                </div>\n              {{/charges}}\n              {{^charges}}\n                <p>No hay cargos para mostrar.</p>\n              {{/charges}}\n            </div>\n          </div>\n        </li>\n      </ul>\n    </div>\n  </div>\n\n<div class=\"fixed-action-btn horizontal\" style=\"bottom: 45px; right: 24px;\">\n  <a class=\"btn-floating btn-large red darken-2\">\n    <i class=\"large material-icons\">menu</i>\n  </a>\n  <ul>\n    <li><a href=\"{{id}}\" class=\"btn-floating remove_client red darken-1\"><i class=\"material-icons\">close</i></a></li>\n    <li><a href=\"{{id}}\" class=\"btn-floating add_loan blue darken-1\"><i class=\"material-icons\">exposure_plus_1</i></a></li>\n    <li><a href=\"{{id}}\" class=\"btn-floating add_charge yellow darken-3\"><i class=\"material-icons\">attach_money</i></a></li>\n  </ul>\n</div>", H);return T.render.apply(T, arguments); };

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	const Loan = __webpack_require__(19);
	const common = __webpack_require__(10);
	const Response = __webpack_require__(11);
	const Pagination = __webpack_require__(5);
	const templates = {
	  add_loan: __webpack_require__(20),
	  search: __webpack_require__(21),
	  cards: __webpack_require__(22),
	  loan_holder: __webpack_require__(23),
	  loan: __webpack_require__(24),
	  update_payment: __webpack_require__(25),
	  add_payment: __webpack_require__(26),
	  loan_payments: __webpack_require__(27),
	};

	var loan = null;
	var $rootNode = null;

	var searchControl = {
	  page: 0,
	  term: '',
	};

	var pagination = null;

	function showIndex(template, loans) {
	  $rootNode.html('');
	  $rootNode.html(templates.search());
	  $rootNode.find('.search-wrapper-loans').html('');
	  $rootNode.find('.search-wrapper-loans').html(templates[template](loans));
	  pagination.show(searchControl.page, loans.loans.length);
	}

	function sendSearch(query, callback) {
	  loan.search(query, function (err, loans) {
	    if (err) return console.log(err);
	    showIndex('cards', { loans: loans });
	    callback(err, loans);
	  });
	}

	function showPayments(payments) {
	  $rootNode.find('.loan_payments').html(templates.loan_payments({ payments: payments }));
	}

	function showLoan(loan) {
	  $rootNode.html(templates.loan_holder(loan));
	  $rootNode.find('.loan_info').html(templates.loan(loan));
	  showPayments(loan.payments);
	}

	function init(user, token, root) {
	  var headers = [{
	    name: 'user',
	    value: user,
	  }, {
	    name: 'token',
	    value: token,
	  }, ];
	  loan = new Loan(headers);
	  $rootNode = $(root);
	  Response.setRootNode($rootNode);

	  // search listener
	  $rootNode.on('submit', '.search-loans-form', function (event) {
	    event.preventDefault();
	    if (searchControl.term === $(this).find('input').val()) return;
	    searchControl.term = $(this).find('input').val();
	    searchControl.page = 0;
	    var query = [{
	      name: 's',
	      value: searchControl.term,
	    }, ];
	    sendSearch(query, function () {});
	  });

	  $rootNode.on('click', '.loan_more', function (event) {
	    event.preventDefault();
	    var id = $(this).attr('href');
	    loan.get(id, function (err, loan) {
	      showLoan(loan);
	    });
	  });

	  $rootNode.on('click', '.add_loan', function (event) {
	    event.preventDefault();
	    var clientId = $(this).attr('href');
	    $rootNode.find('.add_loan_view').html(templates.add_loan({ client_id: clientId }));
	    $rootNode.find('.add_loan_modal').openModal();
	  });

	  $rootNode.on('submit', '.update_loan_form', function (event) {
	    event.preventDefault();
	    var id = $(this).attr('href');
	    var data = common.generateFormData($(this).serializeArray());

	    loan.update(id, data, function (err, loan) {
	      if (!err) showLoan(loan);
	      Response.show('.update_loan_response', err, 'Prestamo actualizado correctamente.');
	    });
	  });

	  $rootNode.on('click', '.payment_delete', function (event) {
	    event.preventDefault();
	    var $this = $(this);
	    var ids = $this.attr('href').split('-');

	    loan.deletePayment(ids[1], ids[0], function (err, payments) {
	      if (!err) showPayments(payments);
	    });
	  });

	  $rootNode.on('click', '.payment_update', function (event) {
	    event.preventDefault();
	    var ids = $(this).attr('href').split('-');
	    loan.getPayment(ids[1], ids[0], function (err, payment) {
	      $rootNode.find('.update_payment_view').html(templates.update_payment(payment));
	      $rootNode.find('.update_payment_modal').openModal();
	    });
	  });

	  $rootNode.on('click', '.remove_loan', function (event) {
	    event.preventDefault();
	    $rootNode.find('.remove_loan_modal').openModal();
	  });

	  $rootNode.on('submit', '.remove_loan_form', function (event) {
	    event.preventDefault();
	    var id = $(this).attr('href');
	    loan.delete(id, function (err) {
	      if (!err) {
	        $rootNode.find('.remove_loan_modal').closeModal();   
	        return sendSearch([], function () {});
	      }
	    });
	  });

	  $rootNode.on('submit', '.update_payment_form', function (event) {
	    event.preventDefault();
	    var ids = $(this).attr('href').split('-');
	    var data = common.generateFormData($(this).serializeArray());
	    loan.updatePayment(ids[1], ids[0], data, function (err, payments) {
	      if (!err) {
	        $rootNode.find('.update_payment_modal').closeModal();
	        return showPayments(payments);
	      }

	      Response.show('.update_payment_response', err, 'Pago actualizado exitosamente.');
	    });
	  });

	  $rootNode.on('click', '.payment_add', function (event) {
	    event.preventDefault();
	    var ids = $(this).attr('href').split('-');
	    var data = {
	      weekly_payment: ids[1],
	      loan_id: ids[0],
	    };

	    $rootNode.find('.add_payment_view').html(templates.add_payment(data));
	    $rootNode.find('.add_payment_modal').openModal();
	  });

	  $rootNode.on('submit', '.add_payment_form', function (event) {
	    event.preventDefault();
	    var id = $(this).attr('href');
	    var data = common.generateFormData($(this).serializeArray());
	    loan.createPayment(id, data, function (err, payments) {
	      console.log(payments);
	      if (!err) showPayments(payments);
	      Response.show('.add_payment_response', err, 'Pago creado exitosamente.');
	    });
	  });

	  $rootNode.on('submit', '.add_loan_form', function (event) {
	    event.preventDefault();
	    var $this = $(this);
	    var data = common.generateFormData($this.serializeArray());
	    loan.create(data, function (err) {
	      if (!err) $this[0].reset();
	      Response.show('.add_loan_response', err, 'Prestamo creado exitosamente.');
	    });
	  });

	  pagination = new Pagination($rootNode, 'loans');
	  pagination.listen(function (page) {
	    searchControl.page = page;
	    var query = [{
	      name: 'page',
	      value: searchControl.page,
	    }, {
	      name: 's',
	      value: searchControl.term,
	    }, ];
	    loan.search(query, function (err, loans) {
	      if (err) return console.log(err);
	      showIndex('cards', { loans: loans });
	    });
	  });
	}

	function index(callback) {
	  sendSearch([], callback);
	}

	module.exports = {
	  init: init,
	  index: index,
	};


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var RestConnection = __webpack_require__(3);
	var baseUrl = __webpack_require__(4).baseUrl.loan;

	function Loan(headers) {
	  this.resource = baseUrl;
	  this.headers = headers;
	}

	RestConnection.inherits(Loan);

	Loan.prototype.search = function (query, callback) {
	  var url = this.attachParamsToUrl(this.resource, query);
	  var options = this.generateOptions(url, 'GET', null, callback);
	  this.send(options);
	};

	Loan.prototype.deletePayment = function (id, paymentId, callback) {
	  var url = this.resource + '/' + id + '/payments/' + paymentId;
	  var options = this.generateOptions(url, 'DELETE', null, callback);
	  this.send(options);
	};

	Loan.prototype.updatePayment = function (id, paymentId, body, callback) {
	  var url = this.resource + '/' + id + '/payments/' + paymentId;
	  var options = this.generateOptions(url, 'PATCH', body, callback);
	  this.send(options);
	};

	Loan.prototype.getPayment = function (id, paymentId, callback) {
	  var url = this.resource + '/' + id + '/payments/' + paymentId;
	  var options = this.generateOptions(url, 'GET', null, callback);
	  this.send(options);
	};

	RestConnection.prototype.createPayment = function (id, body, callback) {
	  var url = this.resource + '/' + id + '/payments/';
	  var options = this.generateOptions(url, 'POST', body, callback);
	  this.send(options);
	};

	module.exports = Loan;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(7);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"col s12\">");t.b("\n" + i);t.b("  <h5>Añadir prestamo</h5>");t.b("\n" + i);t.b("</div>");t.b("\n" + i);t.b("<div class=\"col s12 add_loan_response center-align\">");t.b("\n" + i);t.b("</div>");t.b("\n" + i);t.b("<form class=\"col s12 add_loan_form\">");t.b("\n" + i);t.b("  <input type=\"hidden\" value=\"");t.b(t.v(t.f("client_id",c,p,0)));t.b("\" name=\"client_id\"/>");t.b("\n" + i);t.b("  <div class=\"row\">");t.b("\n" + i);t.b("    <div class=\"input-field col s4\">");t.b("\n" + i);t.b("      <input id=\"amount\" name=\"amount\" type=\"text\" class=\"validate\">");t.b("\n" + i);t.b("      <label for=\"amount\">Cantidad</label>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <div class=\"input-field col s4\">");t.b("\n" + i);t.b("      <input id=\"weekly_payment\" name=\"weekly_payment\" type=\"text\" class=\"validate\">");t.b("\n" + i);t.b("      <label for=\"weekly_payment\">Pago semanal</label>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <div class=\"input-field col s4\">");t.b("\n" + i);t.b("      <input id=\"weeks\" name=\"weeks\" type=\"text\" class=\"validate\">");t.b("\n" + i);t.b("      <label for=\"weeks\">Semanas</label>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <div class=\"input-field col s12\">");t.b("\n" + i);t.b("      <textarea id=\"description\" name=\"description\" class=\"materialize-textarea uppercase\"></textarea>");t.b("\n" + i);t.b("      <label for=\"description\">Descripción</label>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("  <div class=\"row\">");t.b("\n" + i);t.b("    <div class=\"col s12 right-align\">");t.b("\n" + i);t.b("      <a class=\"modal-action modal-close waves-effect waves-green black-text btn grey lighten-3\">Cerrar</a>");t.b("\n" + i);t.b("      <button class=\"waves-effect waves-light btn\">Crear</button>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</form>");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "<div class=\"col s12\">\n  <h5>Añadir prestamo</h5>\n</div>\n<div class=\"col s12 add_loan_response center-align\">\n</div>\n<form class=\"col s12 add_loan_form\">\n  <input type=\"hidden\" value=\"{{client_id}}\" name=\"client_id\"/>\n  <div class=\"row\">\n    <div class=\"input-field col s4\">\n      <input id=\"amount\" name=\"amount\" type=\"text\" class=\"validate\">\n      <label for=\"amount\">Cantidad</label>\n    </div>\n    <div class=\"input-field col s4\">\n      <input id=\"weekly_payment\" name=\"weekly_payment\" type=\"text\" class=\"validate\">\n      <label for=\"weekly_payment\">Pago semanal</label>\n    </div>\n    <div class=\"input-field col s4\">\n      <input id=\"weeks\" name=\"weeks\" type=\"text\" class=\"validate\">\n      <label for=\"weeks\">Semanas</label>\n    </div>\n    <div class=\"input-field col s12\">\n      <textarea id=\"description\" name=\"description\" class=\"materialize-textarea uppercase\"></textarea>\n      <label for=\"description\">Descripción</label>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col s12 right-align\">\n      <a class=\"modal-action modal-close waves-effect waves-green black-text btn grey lighten-3\">Cerrar</a>\n      <button class=\"waves-effect waves-light btn\">Crear</button>\n    </div>\n  </div>\n</form>\n", H);return T.render.apply(T, arguments); };

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(7);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<!-- search bar and cards -->");t.b("\n" + i);t.b("<div class=\"row z-depth-1\">");t.b("\n" + i);t.b("  <div class=\"col s12\">");t.b("\n" + i);t.b("    <div style=\"margin-top:2%;\" class=\"col s12 red-text text-darken-2\">");t.b("\n" + i);t.b("      <div class=\"row\">");t.b("\n" + i);t.b("        <h4 class=\"col s10\"> Prestamos </h4>");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</div>");t.b("\n");t.b("\n" + i);t.b("<!-- search form -->");t.b("\n" + i);t.b("<div class=\"row z-depth-1\" style=\"padding: 10px;\">");t.b("\n" + i);t.b("	<form class=\"search-loans-form\">");t.b("\n" + i);t.b("	  <div class=\"col s10\">");t.b("\n" + i);t.b("	    <nav class=\"search red darken-2\">");t.b("\n" + i);t.b("	      <div class=\"nav-wrapper\">");t.b("\n" + i);t.b("          <div class=\"input-field\">");t.b("\n" + i);t.b("            <input type=\"search\" placeholder=\"ID de prestamo, ID de cliente, cantidad o semanas.\"/>");t.b("\n" + i);t.b("            <label for=\"search\"><i class=\"material-icons\">search</i></label><i class=\"material-icons\">close</i>");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("	      </div>");t.b("\n" + i);t.b("	    </nav>");t.b("\n" + i);t.b("	  </div>");t.b("\n" + i);t.b("	  <div class=\"col s2\">");t.b("\n" + i);t.b("	    <button class=\"btn red darken-2 white-text\">Buscar</button>");t.b("\n" + i);t.b("	  </div>");t.b("\n" + i);t.b("	</form>");t.b("\n" + i);t.b("</div>");t.b("\n");t.b("\n" + i);t.b("<!-- search results -->");t.b("\n" + i);t.b("<div class=\"search-wrapper-loans z-depth-1 row animated fadeIn\" style=\"padding-top:20px;\">");t.b("\n" + i);t.b("</div>");t.b("\n");t.b("\n" + i);t.b("<!-- pagination -->");t.b("\n" + i);t.b("<div class =\"row center-align z-depth-1\">");t.b("\n" + i);t.b("  <div class=\"col s12 pagination-loans\">");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }}, "<!-- search bar and cards -->\n<div class=\"row z-depth-1\">\n  <div class=\"col s12\">\n    <div style=\"margin-top:2%;\" class=\"col s12 red-text text-darken-2\">\n      <div class=\"row\">\n        <h4 class=\"col s10\"> Prestamos </h4>\n      </div>\n    </div>\n  </div>\n</div>\n\n<!-- search form -->\n<div class=\"row z-depth-1\" style=\"padding: 10px;\">\n\t<form class=\"search-loans-form\">\n\t  <div class=\"col s10\">\n\t    <nav class=\"search red darken-2\">\n\t      <div class=\"nav-wrapper\">\n          <div class=\"input-field\">\n            <input type=\"search\" placeholder=\"ID de prestamo, ID de cliente, cantidad o semanas.\"/>\n            <label for=\"search\"><i class=\"material-icons\">search</i></label><i class=\"material-icons\">close</i>\n          </div>\n\t      </div>\n\t    </nav>\n\t  </div>\n\t  <div class=\"col s2\">\n\t    <button class=\"btn red darken-2 white-text\">Buscar</button>\n\t  </div>\n\t</form>\n</div>\n\n<!-- search results -->\n<div class=\"search-wrapper-loans z-depth-1 row animated fadeIn\" style=\"padding-top:20px;\">\n</div>\n\n<!-- pagination -->\n<div class =\"row center-align z-depth-1\">\n  <div class=\"col s12 pagination-loans\">\n  </div>\n</div>", H);return T.render.apply(T, arguments); };

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(7);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"col s12 grey-text darken-2\">");t.b("\n" + i);t.b("  <div class=\"row\">");t.b("\n" + i);if(t.s(t.f("loans",c,p,1),c,p,0,73,1313,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("    <div class=\"col s12 m4\">");t.b("\n" + i);t.b("      <div class=\"card client\">");t.b("\n" + i);t.b("        <div class=\"card-content grey-text text-darken-2\">");t.b("\n" + i);t.b("          <p class=\"card-title capitalize\">$");t.b(t.v(t.f("amount",c,p,0)));t.b(".00 <span class=\"right\">");t.b(t.v(t.f("weeks",c,p,0)));t.b("s</span></p>");t.b("\n" + i);t.b("          <p class=\"capitalize\">Cliente: ");t.b(t.v(t.d("client.name_complete",c,p,0)));t.b(" ");t.b(t.v(t.d("client.surname",c,p,0)));t.b(".</p>");t.b("\n" + i);t.b("          <p>Creado: ");t.b(t.v(t.f("created_from_now",c,p,0)));t.b(".</p>");t.b("\n" + i);if(t.s(t.f("last_payment",c,p,1),c,p,0,458,529,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            <p>Ultimo abono: ");t.b(t.v(t.f("last_payment_from_now",c,p,0)));t.b(".</p>");t.b("\n" + i);});c.pop();}if(t.s(t.f("current_week",c,p,1),c,p,0,574,637,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            <p>Semana actual: ");t.b(t.v(t.f("current_week",c,p,0)));t.b(".</p>");t.b("\n" + i);});c.pop();}t.b("          <p>Pagos realizados: ");t.b(t.v(t.d("payments.length",c,p,0)));t.b(".</p>");t.b("\n" + i);t.b("          <b>Adeudo actual: $");t.b(t.v(t.f("current_balance",c,p,0)));t.b(".00.</b></p>");t.b("\n" + i);t.b("          <p>Expira en: ");t.b(t.v(t.f("expired_date_from_now",c,p,0)));t.b("</p>");t.b("\n" + i);if(t.s(t.f("expired",c,p,1),c,p,0,848,928,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            <p class=\"red-text text-darken-2\">Prestamo expirado.</p>");t.b("\n" + i);});c.pop();}if(!t.s(t.f("expired",c,p,1),c,p,1,0,0,"")){t.b("            <p class=\"green-text text-darken-2\">Prestamo no expirado.</p>");t.b("\n" + i);};t.b("        </div>");t.b("\n" + i);t.b("        <div class=\"card-action\">");t.b("\n" + i);t.b("            <a href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\" class=\"loan_more green-text darken-2\">Más</a>");t.b("\n" + i);t.b("            <a href=\"");t.b(t.v(t.f("client_id",c,p,0)));t.b("\" class=\"blue-text client_more darken-2\">Cliente</a>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);});c.pop();}t.b("  </div>");t.b("\n" + i);t.b("</div>");t.b("\n");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "<div class=\"col s12 grey-text darken-2\">\n  <div class=\"row\">\n  {{#loans}}\n    <div class=\"col s12 m4\">\n      <div class=\"card client\">\n        <div class=\"card-content grey-text text-darken-2\">\n          <p class=\"card-title capitalize\">${{amount}}.00 <span class=\"right\">{{weeks}}s</span></p>\n          <p class=\"capitalize\">Cliente: {{client.name_complete}} {{client.surname}}.</p>\n          <p>Creado: {{created_from_now}}.</p>\n          {{#last_payment}}\n            <p>Ultimo abono: {{last_payment_from_now}}.</p>\n          {{/last_payment}}\n          {{#current_week}}\n            <p>Semana actual: {{current_week}}.</p>\n          {{/current_week}}\n          <p>Pagos realizados: {{payments.length}}.</p>\n          <b>Adeudo actual: ${{current_balance}}.00.</b></p>\n          <p>Expira en: {{expired_date_from_now}}</p>\n          {{#expired}}\n            <p class=\"red-text text-darken-2\">Prestamo expirado.</p>\n          {{/expired}}\n          {{^expired}}\n            <p class=\"green-text text-darken-2\">Prestamo no expirado.</p>\n          {{/expired}}\n        </div>\n        <div class=\"card-action\">\n            <a href=\"{{id}}\" class=\"loan_more green-text darken-2\">Más</a>\n            <a href=\"{{client_id}}\" class=\"blue-text client_more darken-2\">Cliente</a>\n        </div>\n      </div>\n    </div>\n  {{/loans}}\n  </div>\n</div>\n\n", H);return T.render.apply(T, arguments); };

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(7);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"loan_info z-depth-1 animated fadeIn\"></div>");t.b("\n");t.b("\n" + i);t.b("<div class=\"modal add_payment_modal\">");t.b("\n" + i);t.b("  <div class=\"modal-content add_payment_view\">");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</div>");t.b("\n");t.b("\n" + i);t.b("<div class=\"modal update_payment_modal\">");t.b("\n" + i);t.b("  <div class=\"modal-content update_payment_view\">");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</div>");t.b("\n");t.b("\n" + i);t.b("<div class=\"modal remove_loan_modal\" style=\"height: 57%;\">");t.b("\n" + i);t.b("  <div class=\"modal-content\">");t.b("\n" + i);t.b("    <div class=\"row\">");t.b("\n" + i);t.b("      <h5>Confirmacion de seguridad</h5>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <div class=\"row\">");t.b("\n" + i);t.b("      <div class=\"red-text card col s12 text-darken-3\">");t.b("\n" + i);t.b("        <div class=\"card-content\">");t.b("\n" + i);t.b("          Estas a punto de elimiar este prestamo, al momento");t.b("\n" + i);t.b("          de confirmar se borraran todos los pagos realizados y toda la ");t.b("\n" + i);t.b("          informacion acerca de deste prestamo.");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <div class=\"row\">");t.b("\n" + i);t.b("      <form class=\"col s12 remove_loan_form\" href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\">");t.b("\n" + i);t.b("        <div class=\"row right-align\">");t.b("\n" + i);t.b("          <div class=\"input-field col s12\">");t.b("\n" + i);t.b("            <a class=\"modal-action modal-close waves-effect waves-green black-text btn grey lighten-3\">Cerrar</a>");t.b("\n" + i);t.b("            <input type=\"submit\" value=\"Eliminar\" class=\"btn waves-effect waves-light red white-text darken-2\" />");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("      </form>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }}, "<div class=\"loan_info z-depth-1 animated fadeIn\"></div>\n\n<div class=\"modal add_payment_modal\">\n  <div class=\"modal-content add_payment_view\">\n  </div>\n</div>\n\n<div class=\"modal update_payment_modal\">\n  <div class=\"modal-content update_payment_view\">\n  </div>\n</div>\n\n<div class=\"modal remove_loan_modal\" style=\"height: 57%;\">\n  <div class=\"modal-content\">\n    <div class=\"row\">\n      <h5>Confirmacion de seguridad</h5>\n    </div>\n    <div class=\"row\">\n      <div class=\"red-text card col s12 text-darken-3\">\n        <div class=\"card-content\">\n          Estas a punto de elimiar este prestamo, al momento\n          de confirmar se borraran todos los pagos realizados y toda la \n          informacion acerca de deste prestamo.\n        </div>\n      </div>\n    </div>\n    <div class=\"row\">\n      <form class=\"col s12 remove_loan_form\" href=\"{{id}}\">\n        <div class=\"row right-align\">\n          <div class=\"input-field col s12\">\n            <a class=\"modal-action modal-close waves-effect waves-green black-text btn grey lighten-3\">Cerrar</a>\n            <input type=\"submit\" value=\"Eliminar\" class=\"btn waves-effect waves-light red white-text darken-2\" />\n          </div>\n        </div>\n      </form>\n    </div>\n  </div>\n</div>", H);return T.render.apply(T, arguments); };

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(7);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"row\">");t.b("\n" + i);t.b("  <div class=\"col s12\">");t.b("\n" + i);t.b("    <div style=\"margin-top:2%;\" class=\"col s12\">");t.b("\n" + i);t.b("      <div class=\"row\">");t.b("\n" + i);t.b("        <div class=\"col s8\">");t.b("\n" + i);t.b("          <h4 class=\"capitalize\">");t.b(t.v(t.d("client.name_complete",c,p,0)));t.b(" ");t.b(t.v(t.d("client.surname",c,p,0)));t.b("</h4>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("        <div class=\"col s4 right-align\" style=\"margin-top:20px\">");t.b("\n" + i);t.b("          <button href=\"");t.b(t.v(t.f("client_id",c,p,0)));t.b("\" class=\"client_more btn waves-effect waves-green\"><i class=\"material-icons\">person</i></button>");t.b("\n" + i);t.b("          <button href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\" class=\"loan_more btn waves-effect waves-green\"><i class=\"material-icons\">refresh</i></button>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("  <div class=\"col s12\">");t.b("\n" + i);t.b("    <div class=\"row\">");t.b("\n" + i);t.b("      <div class=\"col s8 update_loan_response center-align\">");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);t.b("      <form class=\"col s8 update_loan_form\" href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\">");t.b("\n" + i);t.b("        <input type=\"hidden\" value=\"");t.b(t.v(t.f("client_id",c,p,0)));t.b("\" name=\"client_id\"/>");t.b("\n" + i);t.b("        <div class=\"row\">");t.b("\n" + i);t.b("          <div class=\"input-field col s6\">");t.b("\n" + i);t.b("            <input id=\"amount\" name=\"amount\" type=\"text\" class=\"uppercase validate\" value=\"");t.b(t.v(t.f("amount",c,p,0)));t.b("\">");t.b("\n" + i);t.b("            <label class=\"active\" for=\"amount\">Cantidad</label>");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("          <div class=\"input-field col s6\">");t.b("\n" + i);t.b("            <input id=\"weeks\" name=\"weeks\" type=\"text\" class=\"uppercase validate\" value=\"");t.b(t.v(t.f("weeks",c,p,0)));t.b("\">");t.b("\n" + i);t.b("            <label class=\"active\" for=\"weeks\">Semanas</label>");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("          <div class=\"input-field col s6\">");t.b("\n" + i);t.b("            <input id=\"weekly_payment\" name=\"weekly_payment\" type=\"text\" class=\"uppercase validate\" value=\"");t.b(t.v(t.f("weekly_payment",c,p,0)));t.b("\">");t.b("\n" + i);t.b("            <label class=\"active\" for=\"weeks\">Pago semanal</label>");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("          <div class=\"input-field col s6\">");t.b("\n" + i);t.b("            <input id=\"created\" name=\"created\" type=\"text\" placeholder=\"DD/MM/YYYY hh:mm\" class=\"validate\" value=\"");t.b(t.v(t.f("created",c,p,0)));t.b("\">");t.b("\n" + i);t.b("            <label class=\"active\" for=\"weeks\">Creado</label>");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("        <div class=\"row\">");t.b("\n" + i);t.b("          <div class=\"col s12 right-align\">");t.b("\n" + i);t.b("            <button class=\"waves-effect waves-light btn\">Modificar</button>");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("      </form>");t.b("\n" + i);t.b("      <div class=\"col s4\">");t.b("\n" + i);t.b("        <ul class=\"collection with-header\" style=\"margin-top:0px\">");t.b("\n" + i);t.b("          <li class=\"collection-header\"><h5>Información</h5></li>");t.b("\n" + i);t.b("          <li class=\"collection-item\"><div>Saldo: <span class=\"secondary-content\">$");t.b(t.v(t.f("current_balance",c,p,0)));t.b(".00</span></li>");t.b("\n" + i);if(t.s(t.f("last_payment",c,p,1),c,p,0,2356,2494,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            <li class=\"collection-item\"><div>Ult. abono: <span class=\"secondary-content\">");t.b(t.v(t.f("last_payment_from_now",c,p,0)));t.b("</span></li>");t.b("\n" + i);});c.pop();}t.b("\n" + i);if(t.s(t.f("finish",c,p,1),c,p,0,2534,2648,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            <li class=\"collection-item\"><div>Terminado: <span class=\"secondary-content\">Si</span></li>");t.b("\n" + i);});c.pop();}t.b("          ");t.b("\n" + i);t.b("          <li class=\"collection-item\"><div>Abonos: <span class=\"secondary-content\">");t.b(t.v(t.d("payments.length",c,p,0)));t.b("</span></li>");t.b("\n" + i);if(t.s(t.f("current_week",c,p,1),c,p,0,2813,2945,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            <li class=\"collection-item\"><div>Semana actual: <span class=\"secondary-content\">");t.b(t.v(t.f("current_week",c,p,0)));t.b("</span></li>");t.b("\n" + i);});c.pop();}t.b("\n" + i);t.b("          <li class=\"collection-item\"><div>Vencimiento: <span class=\"secondary-content\">");t.b(t.v(t.f("expired_date",c,p,0)));t.b("</span></li>");t.b("\n");t.b("\n" + i);t.b("          <li class=\"collection-item\"><div>Vencido: ");t.b("\n" + i);if(t.s(t.f("expired",c,p,1),c,p,0,3161,3236,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                <span class=\"secondary-content red-text\">Si");t.b("\n" + i);});c.pop();}if(!t.s(t.f("expired",c,p,1),c,p,1,0,0,"")){t.b("              <span class=\"secondary-content\">No");t.b("\n" + i);};t.b("            </span>");t.b("\n" + i);t.b("          </li>");t.b("\n" + i);t.b("        </ul>");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("  <div class=\"col s12\">");t.b("\n" + i);t.b("    <div class =\"row\">");t.b("\n" + i);t.b("      <div class =\"col s12\">");t.b("\n" + i);t.b("        <div class=\"row\">");t.b("\n" + i);t.b("          <h5>Pagos</h5>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("        <div class=\"row loan_payments animated fadeIn\">");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</div>");t.b("\n");t.b("\n" + i);t.b("<div class=\"fixed-action-btn horizontal\" style=\"bottom: 45px; right: 24px;\">");t.b("\n" + i);t.b("  <a class=\"btn-floating btn-large red darken-2\">");t.b("\n" + i);t.b("    <i class=\"large material-icons\">menu</i>");t.b("\n" + i);t.b("  </a>");t.b("\n" + i);t.b("  <ul>");t.b("\n" + i);t.b("    <li><a href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\" class=\"btn-floating remove_loan red darken-1\"><i class=\"material-icons\">close</i></a></li>");t.b("\n" + i);t.b("    <li><a href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("-");t.b(t.v(t.f("weekly_payment",c,p,0)));t.b("\" class=\"btn-floating payment_add blue darken-1\"><i class=\"material-icons\">exposure_plus_1</i></a></li>");t.b("\n" + i);t.b("  </ul>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }}, "<div class=\"row\">\n  <div class=\"col s12\">\n    <div style=\"margin-top:2%;\" class=\"col s12\">\n      <div class=\"row\">\n        <div class=\"col s8\">\n          <h4 class=\"capitalize\">{{client.name_complete}} {{client.surname}}</h4>\n        </div>\n        <div class=\"col s4 right-align\" style=\"margin-top:20px\">\n          <button href=\"{{client_id}}\" class=\"client_more btn waves-effect waves-green\"><i class=\"material-icons\">person</i></button>\n          <button href=\"{{id}}\" class=\"loan_more btn waves-effect waves-green\"><i class=\"material-icons\">refresh</i></button>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class=\"col s12\">\n    <div class=\"row\">\n      <div class=\"col s8 update_loan_response center-align\">\n      </div>\n      <form class=\"col s8 update_loan_form\" href=\"{{id}}\">\n        <input type=\"hidden\" value=\"{{client_id}}\" name=\"client_id\"/>\n        <div class=\"row\">\n          <div class=\"input-field col s6\">\n            <input id=\"amount\" name=\"amount\" type=\"text\" class=\"uppercase validate\" value=\"{{amount}}\">\n            <label class=\"active\" for=\"amount\">Cantidad</label>\n          </div>\n          <div class=\"input-field col s6\">\n            <input id=\"weeks\" name=\"weeks\" type=\"text\" class=\"uppercase validate\" value=\"{{weeks}}\">\n            <label class=\"active\" for=\"weeks\">Semanas</label>\n          </div>\n          <div class=\"input-field col s6\">\n            <input id=\"weekly_payment\" name=\"weekly_payment\" type=\"text\" class=\"uppercase validate\" value=\"{{weekly_payment}}\">\n            <label class=\"active\" for=\"weeks\">Pago semanal</label>\n          </div>\n          <div class=\"input-field col s6\">\n            <input id=\"created\" name=\"created\" type=\"text\" placeholder=\"DD/MM/YYYY hh:mm\" class=\"validate\" value=\"{{created}}\">\n            <label class=\"active\" for=\"weeks\">Creado</label>\n          </div>\n        </div>\n        <div class=\"row\">\n          <div class=\"col s12 right-align\">\n            <button class=\"waves-effect waves-light btn\">Modificar</button>\n          </div>\n        </div>\n      </form>\n      <div class=\"col s4\">\n        <ul class=\"collection with-header\" style=\"margin-top:0px\">\n          <li class=\"collection-header\"><h5>Información</h5></li>\n          <li class=\"collection-item\"><div>Saldo: <span class=\"secondary-content\">${{current_balance}}.00</span></li>\n          {{#last_payment}}\n            <li class=\"collection-item\"><div>Ult. abono: <span class=\"secondary-content\">{{last_payment_from_now}}</span></li>\n          {{/last_payment}}\n\n          {{#finish}}\n            <li class=\"collection-item\"><div>Terminado: <span class=\"secondary-content\">Si</span></li>\n          {{/finish}}\n          \n          <li class=\"collection-item\"><div>Abonos: <span class=\"secondary-content\">{{payments.length}}</span></li>\n          {{#current_week}}\n            <li class=\"collection-item\"><div>Semana actual: <span class=\"secondary-content\">{{current_week}}</span></li>\n          {{/current_week}}\n\n          <li class=\"collection-item\"><div>Vencimiento: <span class=\"secondary-content\">{{expired_date}}</span></li>\n\n          <li class=\"collection-item\"><div>Vencido: \n              {{#expired}}\n                <span class=\"secondary-content red-text\">Si\n              {{/expired}}\n              {{^expired}}\n              <span class=\"secondary-content\">No\n              {{/expired}}\n            </span>\n          </li>\n        </ul>\n      </div>\n    </div>\n  </div>\n  <div class=\"col s12\">\n    <div class =\"row\">\n      <div class =\"col s12\">\n        <div class=\"row\">\n          <h5>Pagos</h5>\n        </div>\n        <div class=\"row loan_payments animated fadeIn\">\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"fixed-action-btn horizontal\" style=\"bottom: 45px; right: 24px;\">\n  <a class=\"btn-floating btn-large red darken-2\">\n    <i class=\"large material-icons\">menu</i>\n  </a>\n  <ul>\n    <li><a href=\"{{id}}\" class=\"btn-floating remove_loan red darken-1\"><i class=\"material-icons\">close</i></a></li>\n    <li><a href=\"{{id}}-{{weekly_payment}}\" class=\"btn-floating payment_add blue darken-1\"><i class=\"material-icons\">exposure_plus_1</i></a></li>\n  </ul>\n</div>", H);return T.render.apply(T, arguments); };

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(7);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"col s12\">");t.b("\n" + i);t.b("  <h5>Modificar abono</h5>");t.b("\n" + i);t.b("</div>");t.b("\n" + i);t.b("<div class=\"col s12 update_payment_response center-align\">");t.b("\n" + i);t.b("</div>");t.b("\n" + i);t.b("<form class=\"col s12 update_payment_form\" href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("-");t.b(t.v(t.f("loan_id",c,p,0)));t.b("\">");t.b("\n" + i);t.b("  <div class=\"row\">");t.b("\n" + i);t.b("    <div class=\"input-field col s6\">");t.b("\n" + i);t.b("      <input id=\"amount\" name=\"amount\" type=\"text\" class=\"validate\" value=\"");t.b(t.v(t.f("amount",c,p,0)));t.b("\">");t.b("\n" + i);t.b("      <label class=\"active\" for=\"amount\">Cantidad</label>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <div class=\"input-field col s6\">");t.b("\n" + i);t.b("      <input id=\"created\" name=\"created\" placeholder=\"DD/MM/YYYY HH:mm\" type=\"text\" class=\"validate\" value=\"");t.b(t.v(t.f("created",c,p,0)));t.b("\">");t.b("\n" + i);t.b("      <label class=\"active\" for=\"created\">Creado</label>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("  <div class=\"row\">");t.b("\n" + i);t.b("    <div class=\"col s12 right-align\">");t.b("\n" + i);t.b("      <a class=\"modal-action modal-close waves-effect waves-green black-text btn grey lighten-3\">Cerrar</a>");t.b("\n" + i);t.b("      <button class=\"waves-effect waves-light btn\">Modificar</button>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</form>");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "<div class=\"col s12\">\n  <h5>Modificar abono</h5>\n</div>\n<div class=\"col s12 update_payment_response center-align\">\n</div>\n<form class=\"col s12 update_payment_form\" href=\"{{id}}-{{loan_id}}\">\n  <div class=\"row\">\n    <div class=\"input-field col s6\">\n      <input id=\"amount\" name=\"amount\" type=\"text\" class=\"validate\" value=\"{{amount}}\">\n      <label class=\"active\" for=\"amount\">Cantidad</label>\n    </div>\n    <div class=\"input-field col s6\">\n      <input id=\"created\" name=\"created\" placeholder=\"DD/MM/YYYY HH:mm\" type=\"text\" class=\"validate\" value=\"{{created}}\">\n      <label class=\"active\" for=\"created\">Creado</label>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col s12 right-align\">\n      <a class=\"modal-action modal-close waves-effect waves-green black-text btn grey lighten-3\">Cerrar</a>\n      <button class=\"waves-effect waves-light btn\">Modificar</button>\n    </div>\n  </div>\n</form>\n", H);return T.render.apply(T, arguments); };

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(7);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"col s12\">");t.b("\n" + i);t.b("  <h5>Agregar abono</h5>");t.b("\n" + i);t.b("</div>");t.b("\n" + i);t.b("<div class=\"col s12 add_payment_response center-align\">");t.b("\n" + i);t.b("</div>");t.b("\n" + i);t.b("<form class=\"col s12 add_payment_form\" href=\"");t.b(t.v(t.f("loan_id",c,p,0)));t.b("\">");t.b("\n" + i);t.b("  <div class=\"row\">");t.b("\n" + i);t.b("    <div class=\"input-field col s6\">");t.b("\n" + i);t.b("      <input id=\"amount\" name=\"amount\" type=\"text\" class=\"validate\" value=\"");t.b(t.v(t.f("weekly_payment",c,p,0)));t.b("\">");t.b("\n" + i);t.b("      <label class=\"active\" for=\"amount\">Cantidad</label>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <div class=\"col s6 center-align\" style=\"margin-top: 25px;\">");t.b("\n" + i);t.b("      <a class=\"modal-action modal-close waves-effect waves-green black-text btn grey lighten-3\">Cerrar</a>");t.b("\n" + i);t.b("      <button class=\"waves-effect waves-light btn\">Agregar</button>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</form>");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "<div class=\"col s12\">\n  <h5>Agregar abono</h5>\n</div>\n<div class=\"col s12 add_payment_response center-align\">\n</div>\n<form class=\"col s12 add_payment_form\" href=\"{{loan_id}}\">\n  <div class=\"row\">\n    <div class=\"input-field col s6\">\n      <input id=\"amount\" name=\"amount\" type=\"text\" class=\"validate\" value=\"{{weekly_payment}}\">\n      <label class=\"active\" for=\"amount\">Cantidad</label>\n    </div>\n    <div class=\"col s6 center-align\" style=\"margin-top: 25px;\">\n      <a class=\"modal-action modal-close waves-effect waves-green black-text btn grey lighten-3\">Cerrar</a>\n      <button class=\"waves-effect waves-light btn\">Agregar</button>\n    </div>\n  </div>\n</form>\n", H);return T.render.apply(T, arguments); };

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(7);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");if(t.s(t.f("payments",c,p,1),c,p,0,13,632,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("  <div class=\"col s4\">");t.b("\n" + i);t.b("    <div class=\"card\" href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\">");t.b("\n" + i);t.b("      <div class=\"card-content white ");t.b(t.v(t.f("text_color",c,p,0)));t.b("  avatar text-darken-2\">");t.b("\n" + i);t.b("        <p class=\"card-title\">$");t.b(t.v(t.f("amount",c,p,0)));t.b(".00</p>");t.b("\n" + i);t.b("        <p class=\"capitalize\">");t.b(t.v(t.f("created_from_now",c,p,0)));t.b(" <span style=\"font-size:.7rem;\">(");t.b(t.v(t.f("created",c,p,0)));t.b(")</span></p>");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);t.b("      <div class=\"card-action\">");t.b("\n" + i);t.b("        <a href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("-");t.b(t.v(t.f("loan_id",c,p,0)));t.b("\" class=\"payment_delete red-text text-darken-2\"><i class=\"material-icons\">close</i></a>");t.b("\n" + i);t.b("        <a href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("-");t.b(t.v(t.f("loan_id",c,p,0)));t.b("\" class=\"payment_update yellow-text text-darken-2\"><i class=\"material-icons\">edit</i></a>");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);});c.pop();}if(!t.s(t.f("payments",c,p,1),c,p,1,0,0,"")){t.b("  <div class=\"col s12\">");t.b("\n" + i);t.b("    <p>No hay pagos para mostrar.</p>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);};return t.fl(); },partials: {}, subs: {  }}, "{{#payments}}\n  <div class=\"col s4\">\n    <div class=\"card\" href=\"{{id}}\">\n      <div class=\"card-content white {{text_color}}  avatar text-darken-2\">\n        <p class=\"card-title\">${{amount}}.00</p>\n        <p class=\"capitalize\">{{created_from_now}} <span style=\"font-size:.7rem;\">({{created}})</span></p>\n      </div>\n      <div class=\"card-action\">\n        <a href=\"{{id}}-{{loan_id}}\" class=\"payment_delete red-text text-darken-2\"><i class=\"material-icons\">close</i></a>\n        <a href=\"{{id}}-{{loan_id}}\" class=\"payment_update yellow-text text-darken-2\"><i class=\"material-icons\">edit</i></a>\n      </div>\n    </div>\n  </div>\n{{/payments}}\n{{^payments}}\n  <div class=\"col s12\">\n    <p>No hay pagos para mostrar.</p>\n  </div>\n{{/payments}}", H);return T.render.apply(T, arguments); };

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	const Charge = __webpack_require__(29);
	const common = __webpack_require__(10);
	const Response = __webpack_require__(11);
	const templates = {
	  add_charge: __webpack_require__(30),
	  pay_charge: __webpack_require__(31),
	  remove_charge: __webpack_require__(32),
	  update_charge: __webpack_require__(33),
	};

	var charge = null;
	var $rootNode = null;

	function openModal(template, data) {
	  $rootNode.find('.charge_view').html(templates[template](data));
	  $rootNode.find('.charge_modal').openModal();
	}

	module.exports.init = function (user, token, root) {
	  var headers = [{
	    name: 'user',
	    value: user,
	  }, {
	    name: 'token',
	    value: token,
	  }, ];
	  charge = new Charge(headers);
	  $rootNode = $(root);
	  Response.setRootNode($rootNode);

	  $rootNode.on('click', '.add_charge', function (event) {
	    event.preventDefault();
	    var data = { client_id: $(this).attr('href') };
	    console.log(data);
	    openModal('add_charge', data);
	  });

	  $rootNode.on('submit', '.add_charge_form', function (event) {
	    event.preventDefault();
	    var $this = $(this);
	    var data = common.generateFormData($this.serializeArray());
	    charge.create(data, function (err) {
	      if (!err) $this[0].reset();
	      Response.show('.add_charge_response', err, 'Prestamo creado exitosamente.');
	    });
	  });

	  $rootNode.on('click', '.pay_charge', function (event) {
	    event.preventDefault();
	    var data = { charge_id: $(this).attr('href') };
	    openModal('pay_charge', data);
	  });

	  $rootNode.on('submit', '.pay_charge_form', function (event) {
	    event.preventDefault();
	    var id = $(this).attr('href');
	    charge.pay(id, function (err) {
	      if (!err) $rootNode.find('.charge_modal').closeModal();
	    });
	  });

	  $rootNode.on('click', '.update_charge', function (event) {
	    event.preventDefault();
	    charge.get($(this).attr('href'), function (err, charge) {
	      console.log(err, charge);
	      if (!err) openModal('update_charge', charge);
	    });
	  });

	  $rootNode.on('submit', '.update_charge_form', function (event) {
	    event.preventDefault();
	    var id = $(this).attr('href');
	    var data = common.generateFormData($(this).serializeArray());
	    charge.update(id, data, function (err) {
	      if (!err) $rootNode.find('.charge_modal').closeModal();
	      Response.show('.update_charge_response', err, 'Cargo modificado exitosamente.');
	    });
	  });

	  $rootNode.on('click', '.remove_charge', function (event) {
	    event.preventDefault();
	    var data = { charge_id: $(this).attr('href') };
	    openModal('remove_charge', data);
	  });

	  $rootNode.on('submit', '.remove_charge_form', function (event) {
	    event.preventDefault();
	    var id = $(this).attr('href');
	    charge.delete(id, function (err) {
	      if (!err) $rootNode.find('.charge_modal').closeModal();
	    });
	  });
	};


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var RestConnection = __webpack_require__(3);
	var baseUrl = __webpack_require__(4).baseUrl.charge;

	function Charge(headers) {
	  this.resource = baseUrl;
	  this.headers = headers;
	}

	RestConnection.inherits(Charge);

	Charge.prototype.pay = function (id, callback) {
	  var url = this.resource + '/' + id + '/pay';
	  var options = this.generateOptions(url, 'POST', {}, callback);
	  this.send(options);
	};

	module.exports = Charge;


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(7);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"col s12\">");t.b("\n" + i);t.b("  <h5>Añadir cargo</h5>");t.b("\n" + i);t.b("</div>");t.b("\n" + i);t.b("<div class=\"col s12 add_charge_response center-align\">");t.b("\n" + i);t.b("</div>");t.b("\n" + i);t.b("<form class=\"col s12 add_charge_form\">");t.b("\n" + i);t.b("  <input type=\"hidden\" value=\"");t.b(t.v(t.f("client_id",c,p,0)));t.b("\" name=\"client_id\"/>");t.b("\n" + i);t.b("  <div class=\"row\">");t.b("\n" + i);t.b("    <div class=\"input-field col s6\">");t.b("\n" + i);t.b("      <input id=\"amount\" name=\"amount\" type=\"text\" class=\"validate\">");t.b("\n" + i);t.b("      <label for=\"amount\">Cantidad</label>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <div class=\"input-field col s6\">");t.b("\n" + i);t.b("      <input id=\"weeks\" name=\"weeks\" type=\"text\" class=\"validate\">");t.b("\n" + i);t.b("      <label for=\"weeks\">Semanas</label>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <div class=\"input-field col s12\">");t.b("\n" + i);t.b("      <textarea id=\"description\" name=\"description\" class=\"materialize-textarea uppercase\"></textarea>");t.b("\n" + i);t.b("      <label for=\"description\">Descripción</label>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("  <div class=\"row\">");t.b("\n" + i);t.b("    <div class=\"col s12 right-align\">");t.b("\n" + i);t.b("      <a class=\"modal-action modal-close waves-effect waves-green black-text btn grey lighten-3\">Cerrar</a>");t.b("\n" + i);t.b("      <button class=\"waves-effect waves-light btn\">Crear</button>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</form>");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "<div class=\"col s12\">\n  <h5>Añadir cargo</h5>\n</div>\n<div class=\"col s12 add_charge_response center-align\">\n</div>\n<form class=\"col s12 add_charge_form\">\n  <input type=\"hidden\" value=\"{{client_id}}\" name=\"client_id\"/>\n  <div class=\"row\">\n    <div class=\"input-field col s6\">\n      <input id=\"amount\" name=\"amount\" type=\"text\" class=\"validate\">\n      <label for=\"amount\">Cantidad</label>\n    </div>\n    <div class=\"input-field col s6\">\n      <input id=\"weeks\" name=\"weeks\" type=\"text\" class=\"validate\">\n      <label for=\"weeks\">Semanas</label>\n    </div>\n    <div class=\"input-field col s12\">\n      <textarea id=\"description\" name=\"description\" class=\"materialize-textarea uppercase\"></textarea>\n      <label for=\"description\">Descripción</label>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col s12 right-align\">\n      <a class=\"modal-action modal-close waves-effect waves-green black-text btn grey lighten-3\">Cerrar</a>\n      <button class=\"waves-effect waves-light btn\">Crear</button>\n    </div>\n  </div>\n</form>\n", H);return T.render.apply(T, arguments); };

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(7);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b(" <div class=\"row\">");t.b("\n" + i);t.b("  <h5>Confirmacion de seguridad</h5>");t.b("\n" + i);t.b("</div>");t.b("\n" + i);t.b("<div class=\"row\">");t.b("\n" + i);t.b("  <form class=\"col s12 pay_charge_form\" href=\"");t.b(t.v(t.f("charge_id",c,p,0)));t.b("\">");t.b("\n" + i);t.b("    <div class=\"row center-align\">");t.b("\n" + i);t.b("      <div class=\"input-field col s12\">");t.b("\n" + i);t.b("        <a class=\"modal-action modal-close waves-effect waves-green black-text btn grey lighten-3\">Cerrar</a>");t.b("\n" + i);t.b("        <input type=\"submit\" value=\"Pagar\" class=\"btn waves-effect waves-light blue white-text darken-2\" />");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </form>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }}, " <div class=\"row\">\n  <h5>Confirmacion de seguridad</h5>\n</div>\n<div class=\"row\">\n  <form class=\"col s12 pay_charge_form\" href=\"{{charge_id}}\">\n    <div class=\"row center-align\">\n      <div class=\"input-field col s12\">\n        <a class=\"modal-action modal-close waves-effect waves-green black-text btn grey lighten-3\">Cerrar</a>\n        <input type=\"submit\" value=\"Pagar\" class=\"btn waves-effect waves-light blue white-text darken-2\" />\n      </div>\n    </div>\n  </form>\n</div>", H);return T.render.apply(T, arguments); };

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(7);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b(" <div class=\"row\">");t.b("\n" + i);t.b("  <h5>Confirmacion de seguridad</h5>");t.b("\n" + i);t.b("</div>");t.b("\n" + i);t.b("<div class=\"row\">");t.b("\n" + i);t.b("  <form class=\"col s12 remove_charge_form\" href=\"");t.b(t.v(t.f("charge_id",c,p,0)));t.b("\">");t.b("\n" + i);t.b("    <div class=\"row center-align\">");t.b("\n" + i);t.b("      <div class=\"input-field col s12\">");t.b("\n" + i);t.b("        <a class=\"modal-action modal-close waves-effect waves-green black-text btn grey lighten-3\">Cerrar</a>");t.b("\n" + i);t.b("        <input type=\"submit\" value=\"Eliminar\" class=\"btn waves-effect waves-light red white-text darken-2\" />");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </form>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }}, " <div class=\"row\">\n  <h5>Confirmacion de seguridad</h5>\n</div>\n<div class=\"row\">\n  <form class=\"col s12 remove_charge_form\" href=\"{{charge_id}}\">\n    <div class=\"row center-align\">\n      <div class=\"input-field col s12\">\n        <a class=\"modal-action modal-close waves-effect waves-green black-text btn grey lighten-3\">Cerrar</a>\n        <input type=\"submit\" value=\"Eliminar\" class=\"btn waves-effect waves-light red white-text darken-2\" />\n      </div>\n    </div>\n  </form>\n</div>", H);return T.render.apply(T, arguments); };

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(7);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"col s12\">");t.b("\n" + i);t.b("  <h5>Modificar cargo</h5>");t.b("\n" + i);t.b("</div>");t.b("\n" + i);t.b("<div class=\"col s12 update_charge_response center-align\">");t.b("\n" + i);t.b("</div>");t.b("\n" + i);t.b("<form class=\"col s12 update_charge_form\" href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\">");t.b("\n" + i);t.b("  <div class=\"row\">");t.b("\n" + i);t.b("    <div class=\"input-field col s6\">");t.b("\n" + i);t.b("      <input id=\"amount\" name=\"amount\" type=\"text\" class=\"validate\" value=\"");t.b(t.v(t.f("amount",c,p,0)));t.b("\">");t.b("\n" + i);t.b("      <label class=\"active\" for=\"amount\">Cantidad</label>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <div class=\"input-field col s6\">");t.b("\n" + i);t.b("      <input id=\"created\" name=\"created\" placeholder=\"DD/MM/YYYY HH:mm\" type=\"text\" class=\"validate\" value=\"");t.b(t.v(t.f("created",c,p,0)));t.b("\">");t.b("\n" + i);t.b("      <label class=\"active\" for=\"created\">Creado</label>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("  <div class=\"row\">");t.b("\n" + i);t.b("    <div class=\"col s12 right-align\">");t.b("\n" + i);t.b("      <a class=\"modal-action modal-close waves-effect waves-green black-text btn grey lighten-3\">Cerrar</a>");t.b("\n" + i);t.b("      <button class=\"waves-effect waves-light btn\">Modificar</button>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</form>");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "<div class=\"col s12\">\n  <h5>Modificar cargo</h5>\n</div>\n<div class=\"col s12 update_charge_response center-align\">\n</div>\n<form class=\"col s12 update_charge_form\" href=\"{{id}}\">\n  <div class=\"row\">\n    <div class=\"input-field col s6\">\n      <input id=\"amount\" name=\"amount\" type=\"text\" class=\"validate\" value=\"{{amount}}\">\n      <label class=\"active\" for=\"amount\">Cantidad</label>\n    </div>\n    <div class=\"input-field col s6\">\n      <input id=\"created\" name=\"created\" placeholder=\"DD/MM/YYYY HH:mm\" type=\"text\" class=\"validate\" value=\"{{created}}\">\n      <label class=\"active\" for=\"created\">Creado</label>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col s12 right-align\">\n      <a class=\"modal-action modal-close waves-effect waves-green black-text btn grey lighten-3\">Cerrar</a>\n      <button class=\"waves-effect waves-light btn\">Modificar</button>\n    </div>\n  </div>\n</form>\n", H);return T.render.apply(T, arguments); };

/***/ }
/******/ ]);