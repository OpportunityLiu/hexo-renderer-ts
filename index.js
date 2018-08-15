const ts = require('typescript');
const didYouMean = require('didyoumean');

/**
 * 
 * @param {any} map 
 * @returns {{[k:string]: number}}
 */
function getMap(map)
{
  let r = {};
  for (const key in map)
  {
    const val = map[key];
    if (typeof val === 'number')
      r[key] = val;
  }
  return r;
}

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
   * @param {string} name 
   * @param {{[k:string]: number}} map
   */
  function setEnum(name, map)
  {
    map = getMap(map);
    var value = option[name];
    if (value === undefined || value === null)
    {
      delete option[name];
      return;
    }
    const valueStr = String(value).trim().toLowerCase();
    const myMap = {};
    for (const key in map)
    {
      const val = map[key];
      myMap[key.toLowerCase()] = val;
      myMap[map[key]] = val;
    }
    var v = myMap[valueStr];
    if (v === undefined)
    {
      const keys = Object.getOwnPropertyNames(map);
      let match = didYouMean(valueStr, Object.getOwnPropertyNames(myMap));
      if (match)
      {
        const val = myMap[match];
        for (const key in map)
        {
          if (map[key] === val)
          {
            match = key;
            break;
          }
        }
      }
      throw new Error(`Invalid value '${value}' of property '${name}'. ${match !== null ? `Did you mean: '${match}'?` : `Accepted values: ${keys.map(str => `'${str}'`).join(', ')}.`}`);
    }
    option[name] = v;
    return;
  }

  setEnum('module', ts.ModuleKind);
  setEnum('moduleResolution', ts.ModuleResolutionKind);
  setEnum('newLine', {
    CrLf: ts.NewLineKind.CarriageReturnLineFeed,
    Lf: ts.NewLineKind.LineFeed
  });
  setEnum('target', ts.ScriptTarget);
  setEnum('jsx', ts.JsxEmit);
  return ts.transpile(data.text, option, data.path);
}

hexo.extend.renderer.register('ts', 'js', tsRenderer, true);
hexo.extend.renderer.register('tsx', 'js', tsRenderer, true);