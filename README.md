## aframe-template-component

> Once the component API is validated, expect this to be pulled into A-Frame as a standard component.

A template component for [A-Frame](https://aframe.io) VR.

Supports:

- [Handlebars.js](https://http://handlebarsjs.com/)
- [mustache.js](https://mustache.github.io/)
- [Nunjucks](https://mozilla.github.io/nunjucks/)

Planned:

- [Jade](http://jade-lang.com/)
- [lodash](https://www.npmjs.com/package/lodash.template)

### Properties

| Property   | Description                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| src        | Selector to a `<script template>` element or a URL to an external template file.                                                      |
| insert     | Where to insert the rendered HTML using [insertAdjacentHTML](https://developer.mozilla.org/docs/Web/API/Element/insertAdjacentHTML)   |
| type       | Type of templating engine to use                                                                                                      |

### Usage

#### Browser Installation

Install and use by directly including the [browser files](dist):


```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://rawgit.com/aframevr/aframe/dev/dist/aframe.min.js"></script>
  <script src="https://rawgit.com/ngokevin/aframe-template-component/dev/dist/aframe-template-component.min.js"></script>
</head>

<body>
  <a-scene>
    <a-assets>
      <script id="butterflies" type="text/x-nunjucks-template">
        {% for x in range(0, 10) %}
          {% for z in range(0, 10) %}
            <a-entity template="src: butterfly.template; type: handlebars"
                      data-position="{{ x * 10 }} 1 {{ z * 10 }}"></a-entity>
          {% endfor %}
        {% endfor %}
      </script>

      <script id="forest" type="text/x-nunjucks-template">
        {% for x in range(0, 10) %}
          {% for z in range(0, 10) %}
            <a-entity template="src: tree.template; type: handlebars"
                      data-position="{{ x * 10 }} 0 {{ z * 10 }}"
                      data-trunkcolor="#623B1C"></a-entity>
          {% endfor %}
        {% endfor %}
      </script>
    </a-assets>

    <a-entity template="src: #forest"></a-entity>
    <a-entity template="src: #butterflies"></a-entity>
  </a-scene>
</body>
```

#### NPM Installation

Install via NPM:

```bash
npm install aframe-template-component
```

Then register and use.

```js
var AFRAME = require('aframe');
var templateComponent = require('aframe-template-component').Component;
AFRAME.registerComponent('template', templateComponent);
```
