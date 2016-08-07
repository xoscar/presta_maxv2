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

	$(document).ready(function () {

	  var userId = $('#user').val();
	  var token = $('#token').val();

	  clients.init(userId, token, '#rootNode');
	  clients.index(function () {
	    console.log('>> clients loaded');
	  });

	  $('.button-collapse').sideNav();

	  $('#clients').click(function (event) {
	    event.preventDefault();
	    clients.index(function () {
	      console.log('FINISHED');
	    });
	  });
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	const Client = __webpack_require__(2);
	const Pagination = __webpack_require__(4);
	const templates = {
	  cards: __webpack_require__(9),
	  holders: __webpack_require__(10),
	  loans: __webpack_require__(11),
	};
	var searchControl = {
	  page: 0,
	  term: '',
	};
	var client = null;
	var $rootNode = null;

	function showIndex(template, clients) {
	  $rootNode.find('.search-wrapper').html('');
	  $rootNode.find('.search-wrapper').html(templates[template](clients));
	  Pagination.show(searchControl.page, clients.clients.length);
	}

	function sendSearch(query, callback) {
	  client.search(query, function (err, clients) {
	    if (err) return console.log(err);
	    showIndex('cards', { clients: clients });
	    callback(err, clients);
	  });
	}

	module.exports.init = function (user, token, root) {
	  var headers = [{
	    name: 'user',
	    value: user,
	  }, {
	    name: 'token',
	    value: token,
	  }, ];
	  client = new Client(headers);
	  $rootNode = $(root);

	  $rootNode.html('');
	  $rootNode.html(templates.holders());

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
	    client.get($(this).attr('href'), function (err, client) {
	      $rootNode.find('.modals').html(templates.loans(client));
	      $rootNode.find('.loans-modal').openModal();
	    });
	  });

	  Pagination.setRootNode($rootNode);
	  Pagination.listen(function (page) {
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
	};

	module.exports.index = function (callback) {
	  client.getAll(function (err, clients) {
	    if (err) return callback(err);
	    showIndex('cards', { clients: clients });
	    callback();
	  });
	};


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var RestConnection = __webpack_require__(3);

	function Client(headers) {
	  this.resource = 'http://localhost:4000/clients';
	  this.headers = headers;
	}

	RestConnection.inherits(Client);

	Client.prototype.search = function (query, callback) {
	  var url = this.attachParamsToUrl(this.resource, query);
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
/***/ function(module, exports, __webpack_require__) {

	const template = __webpack_require__(5);
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


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(6);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<ul class=\"pagination\">");t.b("\n");t.b("\n" + i);if(t.s(t.f("prev",c,p,1),c,p,0,35,144,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("		<li class=\"waves-effect previous\"><a href=\"");t.b(t.v(t.f("prev",c,p,0)));t.b("\"><i class=\"material-icons\">chevron_left</i></a></li>");t.b("\n" + i);});c.pop();}if(!t.s(t.f("prev",c,p,1),c,p,1,0,0,"")){t.b("  	<li class=\"disabled\"><a href=\"#!\"><i class=\"material-icons\">chevron_left</i></a></li>");t.b("\n" + i);};t.b("\n" + i);if(t.s(t.f("prevPages",c,p,1),c,p,0,283,352,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("  	<li class=\"waves-effect number\"><a href=\"");t.b(t.v(t.d(".",c,p,0)));t.b("\">");t.b(t.v(t.d(".",c,p,0)));t.b("</a></li>");t.b("\n" + i);});c.pop();}t.b("\n" + i);t.b("  <li class=\"active number\"><a href=\"");t.b(t.v(t.f("current",c,p,0)));t.b("\">");t.b(t.v(t.f("current",c,p,0)));t.b("</a></li>");t.b("\n");t.b("\n" + i);if(t.s(t.f("nextPages",c,p,1),c,p,0,456,525,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("  	<li class=\"waves-effect number\"><a href=\"");t.b(t.v(t.d(".",c,p,0)));t.b("\">");t.b(t.v(t.d(".",c,p,0)));t.b("</a></li>");t.b("\n" + i);});c.pop();}t.b("  ");t.b("\n" + i);if(t.s(t.f("next",c,p,1),c,p,0,554,660,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("		<li class=\"waves-effect next\"><a href=\"");t.b(t.v(t.f("next",c,p,0)));t.b("\"><i class=\"material-icons\">chevron_right</i></a></li>");t.b("\n" + i);});c.pop();}if(!t.s(t.f("next",c,p,1),c,p,1,0,0,"")){t.b("  	<li class=\"disabled\"><a href=\"#!\"><i class=\"material-icons\">chevron_right</i></a></li>");t.b("\n" + i);};t.b("</ul>");return t.fl(); },partials: {}, subs: {  }}, "<ul class=\"pagination\">\n\n\t{{#prev}}\n\t\t<li class=\"waves-effect previous\"><a href=\"{{prev}}\"><i class=\"material-icons\">chevron_left</i></a></li>\n\t{{/prev}}\n\t{{^prev}}\n  \t<li class=\"disabled\"><a href=\"#!\"><i class=\"material-icons\">chevron_left</i></a></li>\n  {{/prev}}\n\n  {{#prevPages}}\n  \t<li class=\"waves-effect number\"><a href=\"{{.}}\">{{.}}</a></li>\n  {{/prevPages}}\n\n  <li class=\"active number\"><a href=\"{{current}}\">{{current}}</a></li>\n\n  {{#nextPages}}\n  \t<li class=\"waves-effect number\"><a href=\"{{.}}\">{{.}}</a></li>\n  {{/nextPages}}\n  \n  {{#next}}\n\t\t<li class=\"waves-effect next\"><a href=\"{{next}}\"><i class=\"material-icons\">chevron_right</i></a></li>\n\t{{/next}}\n  {{^next}}\n  \t<li class=\"disabled\"><a href=\"#!\"><i class=\"material-icons\">chevron_right</i></a></li>\n  {{/next}}\n</ul>", H);return T.render.apply(T, arguments); };

/***/ },
/* 6 */
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

	var Hogan = __webpack_require__(7);
	Hogan.Template = __webpack_require__(8).Template;
	Hogan.template = Hogan.Template;
	module.exports = Hogan;


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
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(6);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"row\">");t.b("\n" + i);t.b("  <div style=\"margin-top:2%;\" class=\"col s12 red-text text-darken-2\">");t.b("\n" + i);t.b("    <h4>Clientes</h4>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("  <div class=\"col s12\">");t.b("\n" + i);t.b("    <nav class=\"search red darken-2\">");t.b("\n" + i);t.b("      <div class=\"nav-wrapper\">");t.b("\n" + i);t.b("        <form class=\"search-bar-form\">");t.b("\n" + i);t.b("          <div class=\"input-field\">");t.b("\n" + i);t.b("            <input type=\"search\" placeholder=\"ID de usuario, nombre o apellido.\"/>");t.b("\n" + i);t.b("            <label for=\"search\"><i class=\"material-icons\">search</i></label><i class=\"material-icons\">close</i>");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("        </form>");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);t.b("    </nav>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</div>");t.b("\n" + i);t.b("<div class=\"row\">");t.b("\n" + i);t.b("  <div class=\"col s12 grey-text darken-2\">");t.b("\n" + i);t.b("    <div class=\"row\">");t.b("\n" + i);if(t.s(t.f("clients",c,p,1),c,p,0,655,1755,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("      <div class=\"col s12 m4\">");t.b("\n" + i);t.b("        <div class=\"card\">");t.b("\n" + i);t.b("          <div class=\"card-content grey-text text-darken-2\">");t.b("\n" + i);t.b("            <span class=\"card-title capitalize\">");t.b("\n" + i);t.b("              ");t.b(t.v(t.f("client_id",c,p,0)));t.b("\n" + i);t.b("            </span>");t.b("\n" + i);t.b("            <p class=\"capitalize\">Nombre: ");t.b(t.v(t.f("name_complete",c,p,0)));t.b(" ");t.b(t.v(t.f("surname",c,p,0)));t.b("</p>");t.b("\n" + i);t.b("            <p>Prestamos activos: ");t.b(t.v(t.d("active_loans.length",c,p,0)));t.b(".</p>");t.b("\n" + i);if(t.s(t.f("last_payment",c,p,1),c,p,0,1042,1112,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                <p>Ultimo abono: ");t.b(t.v(t.f("last_payment",c,p,0)));t.b(".</p>");t.b("\n" + i);});c.pop();}t.b("            <p><b>Adeudo actual: $");t.b(t.v(t.f("total_depth",c,p,0)));t.b(".00.</b></p>");t.b("\n" + i);if(t.s(t.f("expired_loans",c,p,1),c,p,0,1222,1336,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("              <p class=\"red-text text-darken-2\">Este cliente tiene al menos un prestamo vencido.</p>");t.b("\n" + i);});c.pop();}if(!t.s(t.f("expired_loans",c,p,1),c,p,1,0,0,"")){t.b("              <p class=\"green-text text-darken-2\">Este no presenta ningun prestamo vencido.</p>");t.b("\n" + i);};t.b("          </div>");t.b("\n" + i);t.b("          <div class=\"card-action\">");t.b("\n" + i);t.b("              <a class=\"green-text darken-2\">Más</a>");t.b("\n" + i);t.b("              <a href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\" class=\"green-text darken-2 modal-trigger\">Prestamos</a>");t.b("\n" + i);t.b("          </div>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("      </div>");t.b("\n" + i);});c.pop();}t.b("    </div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</div>");t.b("\n" + i);t.b("<div class =\"row center-align\">");t.b("\n" + i);t.b("  <div class=\"col s12 pagination\">");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</div>");t.b("\n");return t.fl(); },partials: {}, subs: {  }}, "<div class=\"row\">\n  <div style=\"margin-top:2%;\" class=\"col s12 red-text text-darken-2\">\n    <h4>Clientes</h4>\n  </div>\n  <div class=\"col s12\">\n    <nav class=\"search red darken-2\">\n      <div class=\"nav-wrapper\">\n        <form class=\"search-bar-form\">\n          <div class=\"input-field\">\n            <input type=\"search\" placeholder=\"ID de usuario, nombre o apellido.\"/>\n            <label for=\"search\"><i class=\"material-icons\">search</i></label><i class=\"material-icons\">close</i>\n          </div>\n        </form>\n      </div>\n    </nav>\n  </div>\n</div>\n<div class=\"row\">\n  <div class=\"col s12 grey-text darken-2\">\n    <div class=\"row\">\n    {{#clients}}\n      <div class=\"col s12 m4\">\n        <div class=\"card\">\n          <div class=\"card-content grey-text text-darken-2\">\n            <span class=\"card-title capitalize\">\n              {{client_id}}\n            </span>\n            <p class=\"capitalize\">Nombre: {{name_complete}} {{surname}}</p>\n            <p>Prestamos activos: {{active_loans.length}}.</p>\n              {{#last_payment}}\n                <p>Ultimo abono: {{last_payment}}.</p>\n              {{/last_payment}}\n            <p><b>Adeudo actual: ${{total_depth}}.00.</b></p>\n            {{#expired_loans}}\n              <p class=\"red-text text-darken-2\">Este cliente tiene al menos un prestamo vencido.</p>\n            {{/expired_loans}}\n            {{^expired_loans}}\n              <p class=\"green-text text-darken-2\">Este no presenta ningun prestamo vencido.</p>\n            {{/expired_loans}}\n          </div>\n          <div class=\"card-action\">\n              <a class=\"green-text darken-2\">Más</a>\n              <a href=\"{{id}}\" class=\"green-text darken-2 modal-trigger\">Prestamos</a>\n          </div>\n        </div>\n      </div>\n    {{/clients}}\n    </div>\n  </div>\n</div>\n<div class =\"row center-align\">\n  <div class=\"col s12 pagination\">\n  </div>\n</div>\n", H);return T.render.apply(T, arguments); };

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(6);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class =\"search-wrapper\">");t.b("\n" + i);t.b("</div>");t.b("\n" + i);t.b("<div class = \"modals\">");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }}, "<div class =\"search-wrapper\">\n</div>\n<div class = \"modals\">\n</div>", H);return T.render.apply(T, arguments); };

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var H = __webpack_require__(6);
	module.exports = function() { var T = new H.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"modal loans-modal\">");t.b("\n" + i);t.b("  <div class=\"modal-content\">");t.b("\n" + i);t.b("  	<div class =\"row\">");t.b("\n" + i);t.b("    	<h5>Prestamos de <span class=\"capitalize\">");t.b(t.v(t.f("name_complete",c,p,0)));t.b("</span> (");t.b(t.v(t.f("client_id",c,p,0)));t.b(")</h5>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <div class=\"row\">");t.b("\n" + i);t.b("    	<div class =\"col s6 z-depth-1\">");t.b("\n" + i);t.b("    		<div class=\"collection loans\">");t.b("\n" + i);if(t.s(t.f("active_loans",c,p,1),c,p,0,308,954,"{{ }}")){t.rs(c,p,function(c,p,t){if(!t.s(t.f("expired",c,p,1),c,p,1,0,0,"")){t.b("		        		<a href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\" class=\"collection-item white green-text text-darken-2 hoverable\">");t.b("\n" + i);};if(t.s(t.f("expired",c,p,1),c,p,0,473,578,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("		        		<a href=\"");t.b(t.v(t.f("id",c,p,0)));t.b("\" class=\"collection-item white red-text text-darken-2 hoverable\">");t.b("\n" + i);});c.pop();}t.b("		        	<span>Cantidad: $");t.b(t.v(t.f("amount",c,p,0)));t.b(".00 </span>");t.b("\n" + i);t.b("		        	<span>| Adeudo: $");t.b(t.v(t.f("current_balance",c,p,0)));t.b(".00 </span>");t.b("\n" + i);if(t.s(t.f("last_payment",c,p,1),c,p,0,728,807,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("		        		<span>| Ultimo pago: ");t.b(t.v(t.f("last_payment_from_now",c,p,0)));t.b(" </span>");t.b("\n" + i);});c.pop();}if(!t.s(t.f("last_payment",c,p,1),c,p,1,0,0,"")){t.b("		        		<span>| No ha habido pagos.</span>");t.b("\n" + i);};t.b("		        </a>");t.b("\n" + i);});c.pop();}t.b("       	</div>");t.b("\n" + i);t.b("  		</div>");t.b("\n" + i);t.b("  	</div>");t.b("\n" + i);t.b("  	<div class=\"col s6\">");t.b("\n" + i);t.b("  	</div>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b(" 	<div class=\"modal-footer\">");t.b("\n" + i);t.b("    <a class=\" modal-action modal-close waves-effect waves-green btn-flat\">Close</a>");t.b("\n" + i);t.b("  </div>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }}, "<div class=\"modal loans-modal\">\n  <div class=\"modal-content\">\n  \t<div class =\"row\">\n    \t<h5>Prestamos de <span class=\"capitalize\">{{name_complete}}</span> ({{client_id}})</h5>\n    </div>\n    <div class=\"row\">\n    \t<div class =\"col s6 z-depth-1\">\n    \t\t<div class=\"collection loans\">\n    \t\t\t{{#active_loans}}\n    \t\t\t\t\t{{^expired}}\n\t\t        \t\t<a href=\"{{id}}\" class=\"collection-item white green-text text-darken-2 hoverable\">\n\t\t        \t{{/expired}}\n\t\t        \t{{#expired}}\n\t\t        \t\t<a href=\"{{id}}\" class=\"collection-item white red-text text-darken-2 hoverable\">\n\t\t        \t{{/expired}}\n\t\t        \t<span>Cantidad: ${{amount}}.00 </span>\n\t\t        \t<span>| Adeudo: ${{current_balance}}.00 </span>\n\t\t        \t{{#last_payment}}\n\t\t        \t\t<span>| Ultimo pago: {{last_payment_from_now}} </span>\n\t\t        \t{{/last_payment}}\n\t\t        \t{{^last_payment}}\n\t\t        \t\t<span>| No ha habido pagos.</span>\n\t\t        \t{{/last_payment}}\n\t\t        </a>\n       \t\t{{/active_loans}}\n       \t</div>\n  \t\t</div>\n  \t</div>\n  \t<div class=\"col s6\">\n  \t</div>\n  </div>\n \t<div class=\"modal-footer\">\n    <a class=\" modal-action modal-close waves-effect waves-green btn-flat\">Close</a>\n  </div>\n</div>", H);return T.render.apply(T, arguments); };

/***/ }
/******/ ]);