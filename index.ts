import ts = require('typescript');
import os = require('os');

interface HexoRendererData
{
    text: string;
    path?: string;
}

declare const hexo: {
    base_dir: string;
    public_dir: string;
    source_dir: string;
    plugin_dir: string;
    script_dir: string;
    scaffold_dir: string;
    theme_dir: string;
    theme_script_dir: string;
    config: { render?: { ts?: any } };
    extend: {
        renderer: {
            register(source: string, target: string, renderer: (data: HexoRendererData, options: any) => string, sync: true): void;
            register(source: string, target: string, renderer: (data: HexoRendererData, options: any) => Promise<string>, sync: false): void;
        }
    }
};

function reportDiagnostics(diagnostics?: ts.Diagnostic[])
{
    if (!diagnostics)
        return;
    diagnostics.forEach(d => console.error(
        "Error",
        d.code,
        ":",
        ts.flattenDiagnosticMessageText(d.messageText, os.EOL)
    ));
}

function getCompileOption(options: any)
{
    const config = hexo && hexo.config && hexo.config.render && hexo.config.render.ts;
    const defaultOptions = ts.getDefaultCompilerOptions();
    let fileOptions: ts.CompilerOptions | null = null;
    if (config)
    {
        if (typeof config === 'object')
        {
            const result = ts.convertCompilerOptionsFromJson(config, hexo.base_dir);
            reportDiagnostics(result.errors);
            fileOptions = result.options;
        }
        else
        {
            const file = hexo.base_dir + String(config);
            const json = require(file);
            const result = ts.convertCompilerOptionsFromJson(json.compilerOptions, hexo.base_dir, String(config));
            reportDiagnostics(result.errors);
            fileOptions = result.options;
        }
    }
    let argOptions: ts.CompilerOptions | null = null;
    if (options)
    {
        const result = ts.convertCompilerOptionsFromJson(options, hexo.base_dir);
        reportDiagnostics(result.errors);
        argOptions = result.options;
    }
    const mergedOptions: ts.CompilerOptions = { ...defaultOptions, ...fileOptions, ...argOptions };

    return mergedOptions;
}

function tsRenderer(data: HexoRendererData, options: any)
{
    const option = getCompileOption(options);
    const result = ts.transpileModule(data.text, { compilerOptions: option, fileName: data.path, reportDiagnostics: true });
    reportDiagnostics(result.diagnostics);
    return result.outputText;
}

hexo.extend.renderer.register('ts', 'js', tsRenderer, true);
hexo.extend.renderer.register('tsx', 'js', tsRenderer, true);