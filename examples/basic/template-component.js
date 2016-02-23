var debug = AFRAME.utils.debug;
var templateCache = {};  // Template cache.
var error = debug('template-component:error');
var log = debug('template-component:info');

var HANDLEBARS = 'handlebars';
var MUSTACHE = 'mustache';
var NUNJUCKS = 'nunjucks';

var LIB_LOADED = {};
LIB_LOADED[HANDLEBARS] = !!window.Handlebars;
LIB_LOADED[MUSTACHE] = !!window.Mustache;
LIB_LOADED[NUNJUCKS] = !!window.nunjucks;

var LIB_SRC = {};
LIB_SRC[HANDLEBARS] = 'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.min.js';
LIB_SRC[MUSTACHE] = 'https://cdnjs.cloudflare.com/ajax/libs/mustache.js/2.2.1/mustache.min.js';
LIB_SRC[NUNJUCKS] = 'https://cdnjs.cloudflare.com/ajax/libs/nunjucks/2.3.0/nunjucks.min.js';

AFRAME.registerComponent('template', {
  schema: {
    insert: {
      // insertAdjacentHTML.
      default: 'beforeend'
    },
    type: {
      default: ''
    },
    src: {
      // Selector or URL.
      default: ''
    },
  },

  update: function () {
    var data = this.data;
    var fetcher = data.src[0] === '#' ? fetchTemplateFromScriptTag : fetchTemplateFromXHR;
    var templateCacheItem = templateCache[data.src];

    if (templateCacheItem) {
      this.renderTemplate(templateCacheItem.template, templateCacheItem.type);
      return;
    }

    fetcher(data.src, data.type).then(this.renderTemplate.bind(this));
  },

  renderTemplate: function (templateCacheItem) {
    var el = this.el;
    var renderedTemplate = renderTemplate(
      templateCacheItem.template, templateCacheItem.type, el.dataset);
    el.insertAdjacentHTML(this.data.insert, renderedTemplate);
  }
});

/**
 * Helper to compile template, lazy-loading the template engine if needed.
 */
function compileTemplate (src, type, templateStr) {
  return new Promise(function (resolve) {
    injectTemplateLib(type).then(function () {
      templateCache[src] = {
        template: getCompiler(type)(templateStr),
        type: type
      };
      resolve(templateCache[src]);
    });
  });
}

function renderTemplate (template, type, context) {
  switch (type) {
    case HANDLEBARS: {
      return template(context);
    }
    case MUSTACHE: {
      return Mustache.render(template, context);
    }
    case NUNJUCKS: {
      return template.render(context);
    }
  }
}

/**
 * Cache and compile templates.
 */
function fetchTemplateFromScriptTag (src, type) {
  var compiler;
  var scriptEl = document.querySelector(src);
  var scriptType = scriptEl.getAttribute('type');
  var templateStr = scriptEl.innerHTML;

  // Try to infer template type from <script type> if type not specified.
  if (!type) {
    if (scriptType.indexOf('handlebars') !== -1) {
      type = HANDLEBARS;
    } else if (scriptType.indexOf('mustache') !== -1) {
      type = MUSTACHE;
    } else if (scriptType.indexOf('nunjucks') !== -1) {
      type = NUNJUCKS
    } else {
      error('Template type could not be inferred from the script tag. Please add a type.');
      return;
    }
  }

  return new Promise(function (resolve) {
    compileTemplate(src, type, templateStr).then(function (template) {
      resolve(template, type);
    });
  });
}

function fetchTemplateFromXHR (src, type) {
  return new Promise(function (resolve) {
    var request;
    request = new XMLHttpRequest();
    request.addEventListener('load', function () {
      // Template fetched. Use template.
      compileTemplate(src, type, request.response).then(function (template) {
        resolve(template, type);
      });
    });
    request.open('GET', src);
    request.send();
  });
}

/**
 * Get compiler given type.
 */
function getCompiler (type) {
  switch (type) {
    case HANDLEBARS: {
      return compileHandlebarsTemplate;
    }
    case MUSTACHE: {
      return compileHandlebarsTemplate;
    }
    case NUNJUCKS: {
      return compileNunjucksTemplate;
    }
    default: {
      // If type not specified, assume raw HTML and no templating needed.
      return function (str) { return str; }
    }
  }
}

function compileHandlebarsTemplate (templateStr) {
  return Handlebars.compile(templateStr);
}

function compileMustacheTemplate (templateStr) {
  Mustache.parse(templateStr);
  return templateStr;
}

function compileNunjucksTemplate (templateStr) {
  return nunjucks.compile(templateStr);
}

function injectTemplateLib (type) {
  return new Promise(function (resolve) {
    var scriptEl = LIB_LOADED[type];

    // Engine loaded.
    if (LIB_LOADED[type] === true) { return resolve(); }

    // Start lazy-loading.
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      LIB_LOADED[type] = scriptEl;
      scriptEl.setAttribute('src', LIB_SRC[type]);
      log('Lazy-loading %s engine. Please add <script src="%s"> to your page.',
          type, LIB_SRC[type]);
      document.body.appendChild(scriptEl);
    }

    // Wait for onload, whether just injected or already lazy-loading.
    var prevOnload = scriptEl.onload || function () {};
    scriptEl.onload = function () {
      prevOnload();
      LIB_LOADED[type] = true;
      resolve();
    };
  });
}
