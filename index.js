var ts = require('typescript');

function setEnum(value, map)
{
  if (typeof value === 'number')
    return value;
  if (!value)
    return undefined;
  const valueStr = String(value).trim().toLowerCase();
  for (const key in map)
    map[key.toLowerCase()] = map[key];
  return map[valueStr];
}

function tsRenderer(data, options)
{
  var fileOptions = undefined;
  if (hexo.config && hexo.config.render && typeof hexo.config.render.ts === 'object')
    fileOptions = hexo.config.render.ts;
  var option = { ...fileOptions, ...options };
  option.module = setEnum(option.module, {
    None: 0,
    CommonJS: 1,
    AMD: 2,
    UMD: 3,
    System: 4,
    ES2015: 5,
    ESNext: 6
  });
  option.moduleResolution = setEnum(option.moduleResolution, {
    Classic: 1,
    NodeJs: 2
  });
  option.newLine = setEnum(option.newLine, {
    CarriageReturnLineFeed: 0,
    LineFeed: 1,
    '\r\n': 0,
    '\r': 1
  });
  option.target = setEnum(option.target, {
    ES3: 0,
    ES5: 1,
    ES2015: 2,
    ES2016: 3,
    ES2017: 4,
    ES2018: 5,
    ESNext: 6,
    JSON: 100,
    Latest: 6
  });
  return ts.transpile(data.text, option, data.path);
}

hexo.extend.renderer.register('ts', 'js', tsRenderer, true);