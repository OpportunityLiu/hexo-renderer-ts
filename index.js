var ts = require('typescript');

function tsRenderer(data, options)
{
  return ts.transpile(data.text, options, data.path);
}

hexo.extend.renderer.register('ts', 'js', tsRenderer, true);