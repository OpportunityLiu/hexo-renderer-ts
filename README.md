# hexo-renderer-ts
hexo renderer for typescript files. 

## Options
See <https://www.typescriptlang.org/docs/handbook/compiler-options.html>

In `_config.yml`:
```yaml
render:
  ts:
    target: ES2015
    removeComments: true
    newLine: Lf
    pretty: false
```

Or by API:
```javascript
hexo.render.render({text: '', engine: 'ts'}, {
  target: 'ES2015',
  removeComments: true, 
  newLine: 'Lf', 
  pretty: false}).then(function(result){
  // ...
});
```
