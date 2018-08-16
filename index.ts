import * as ts from 'typescript';
/// <reference path="didyoumean.d.ts"/>
import didYouMean = require('didyoumean');

didYouMean.caseSensitive = false;

interface HexoRendererData
{
    text: string;
    path?: string;
}

declare const hexo: {
    config: { render?: { ts?: ts.CompilerOptions } };
    extend: {
        renderer: {
            register(source: string, target: string, renderer: (data: HexoRendererData, options: any) => string, sync: true): void;
            register(source: string, target: string, renderer: (data: HexoRendererData, options: any, callback: Function) => void, sync: false): void;
        }
    }
};

class NumberMap
{
    [key: string]: number | undefined;
}

function getMap(map: { [k: string]: string | number })
{
    let r = new NumberMap();
    for (const key in map)
    {
        const val = map[key];
        if (typeof val === 'number')
            r[key] = val;
    }
    return r;
}

function tsRenderer(data: HexoRendererData, options: ts.CompilerOptions)
{
    const fileOptions = hexo && hexo.config && hexo.config.render && hexo.config.render.ts;
    const option: ts.CompilerOptions = { ...fileOptions, ...options };

    function setEnum(name: keyof ts.CompilerOptions, map: any)
    {
        const enumMap = getMap(map);
        const value = option[name];
        if (value === undefined || value === null)
        {
            delete option[name];
            return;
        }
        const valueStr = String(value).trim().toLowerCase();
        const myMap = new NumberMap();
        for (const key in enumMap)
        {
            const val = enumMap[key];
            if (val === undefined)
                continue;
            myMap[key.toLowerCase()] = val;
            myMap[val.toString()] = val;
        }
        var v = myMap[valueStr];
        if (v === undefined)
        {
            const keys = Object.getOwnPropertyNames(enumMap);
            let match = didYouMean(valueStr, keys);
            const suggest = match
                ? `Did you mean: '${match}'?`
                : `Accepted values: ${keys.map(str => `'${str}'`).join(', ')}.`;

            throw new Error(`Invalid value '${value}' of property '${name}'. ${suggest}`);
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