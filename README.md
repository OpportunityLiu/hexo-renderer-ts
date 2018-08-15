# hexo-renderer-ts
hexo renderer for typescript files. 

## Options
See <https://www.typescriptlang.org/docs/handbook/compiler-options.html>

In `_config.yml`:
```yaml
render:
  ts: 
    module: None
```

Or by API:
```js
hexo.render.render({text: '', engine: 'ts'}, {module: 'None'}).then(function(result){
  // ...
});
```
