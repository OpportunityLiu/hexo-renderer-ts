const ts = require('typescript');
const didYouMean = require('didyoumean');

/**
 * 
 * @param {{text:string, path:string}} data 
 * @param {ts.CompilerOptions} options
 */
function tsRenderer(data, options)
{
  /**
   * @type {ts.CompilerOptions}
   */
  var fileOptions = undefined;
  if (hexo.config && hexo.config.render && typeof hexo.config.render.ts === 'object')
    fileOptions = hexo.config.render.ts;
  /**
   * @type {ts.CompilerOptions}
   */
  var option = { ...fileOptions, ...options };

  /**
   * 
   * @param {string} name 
   * @param {{[key: string]:number}} map 
   */
  function setEnum(name, map)
  {
    var value = option[name];
    if (value === undefined || value === null)
    {
      delete option[name];
      return;
    }
    const valueStr = String(value).trim().toLowerCase();
    const keys = Object.getOwnPropertyNames(map);
    for (const key in map)
    {
      const val = map[key];
      map[map[key]] = val;
      map[key.toLowerCase()] = val;
    }
    var v = map[valueStr];
    if (v === undefined)
    {
      const match = didYouMean(valueStr, Object.getOwnPropertyNames(map));
      throw new Error(`Invalid value '${value}' of property '${name}'. ${match !== null ? `Did you mean: '${match}'?` : `Accepted values: ${keys.map(str => `'${str}'`).join(', ')}.`}`);
    }
    option[name] = v;
    return;
  }

  setEnum('module', {
    None: 0,
    CommonJS: 1,
    AMD: 2,
    UMD: 3,
    System: 4,
    ES2015: 5,
    ESNext: 6
  });
  setEnum('moduleResolution', {
    Classic: 1,
    NodeJs: 2
  });
  setEnum('newLine', {
    CarriageReturnLineFeed: 0,
    LineFeed: 1,
    CrLf: 0,
    Lf: 1,
    '\r\n': 0,
    '\r': 1
  });
  setEnum('target', {
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
  setEnum('jsx', {
    None: 0,
    Preserve: 1,
    React: 2,
    ReactNative: 3
  });
  return ts.transpile(data.text, option, data.path);
}

hexo.extend.renderer.register('ts', 'js', tsRenderer, true);
hexo.extend.renderer.register('tsx', 'js', tsRenderer, true);