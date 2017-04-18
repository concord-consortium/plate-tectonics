# Plate Tectonics model

Latest **stable** version:

http://models-resources.concord.org/plate-tectonics/index.html

A particular model can be loaded using `preset` URL parameter, e.g.:

http://models-resources.concord.org/plate-tectonics/index.html?preset=continentCollision

Latest **development** version:

http://models-resources.concord.org/plate-tectonics/branch/master/index.html

Old versions can be accessed via `/version/<tag>` path, e.g.:

http://models-resources.concord.org/plate-tectonics/version/0.1.0/index.html

## Configuration

Some options can be set using URL parameters, for example:

* https://concord-consortium.github.io/plate-tectonics/?preset=continentCollision&elevationColormap=heat - change elevation rendering method.
* https://concord-consortium.github.io/plate-tectonics/?preset=continentCollision&wrappingBoundaries=false - disable wrapping boundaries.

All the available options can be seen here:

https://github.com/concord-consortium/plate-tectonics/blob/master/js/plates-model/config.js

## Development

First, you need to make sure that webpack is installed and all the NPM packages required by this project are available:

```
npm install -g webpack
npm install
```
Then you can build the project files using:
```
webpack
```
or start webpack dev server:
```
npm install -g webpack-dev-server 
webpack-dev-server
```
and open [http://localhost:8080/](http://localhost:8080/) or [http://localhost:8080/webpack-dev-server/](http://localhost:8080/webpack-dev-server/) (auto-reload after each code change).

### CSS styles

* Browser specific prefixes are not necessary, as this project uses [autoprefixer](https://github.com/postcss/autoprefixer), which will add them automatically.
* Webpack parses URLs in CSS too, so it will either copy resources automatically to `/dist` or inline them in CSS file. That applies to images and fonts (take a look at webpack config).
* All the styles are included by related components in JS files. Please make sure that those styles are scoped to the top-level component class, so we don't pollute the whole page. It's not very important right now, but might become important if this page becomes part of the larger UI. And I believe it's a good practice anyway. 
* I would try to make sure that each component specifies all its necessary styles to look reasonably good and it doesn't depend on styles defined somewhere else (e.g. in parent components). Parent components or global styles could be used to theme components, but they should work just fine without them too.

## Releases

- [0.1.0 (Jan 12, 2017)](http://models-resources.concord.org/plate-tectonics/version/0.1.0/index.html)

## License 

[MIT](https://github.com/concord-consortium/seismic-explorer/blob/master/LICENSE)
