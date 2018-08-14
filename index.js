var fs = require('fs'), path = require('path'), _ = require('underscore');
var tsc = require('typescript');

var filePath = path.join(__dirname, 'youku-template.ejs');

function tsRenderer(data, options)
{
  return tsc.transpile(data.text, {}, data.path);
}

hexo.extend.renderer.register('ts', 'js', tsRenderer, true);