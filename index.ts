import * as ts from 'typescript';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

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
    },
    log: any
};

function reportDiagnostics(diagnostics?: ts.Diagnostic[])
{
    if (!diagnostics)
        return;
    diagnostics.forEach(diagnostic =>
    {
        let message = ts.formatDiagnostic(diagnostic, {
            getCurrentDirectory: () => hexo.base_dir,
            getNewLine: () => os.EOL,
            getCanonicalFileName: (fileName) => path.normalize(fileName)
        })
        hexo.log.error(message.trim());
    });
}

function getCompileOption(options: any): ts.CompilerOptions
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

    // transpileModule does not write anything to disk so there is no need to verify that there are no conflicts between input and output paths.
    mergedOptions.suppressOutputPathCheck = true;
    // Filename can be non-ts file.
    mergedOptions.allowNonTsExtensions = true;
    // We are not doing a full typecheck, we are not resolving the whole context,
    // so pass --noResolve to avoid reporting missing file errors.
    mergedOptions.noResolve = true;

    return mergedOptions;
}

function tsRenderer(data: HexoRendererData, hexoOptions: any): string
{
    const options = getCompileOption(hexoOptions);

    // if jsx is specified then treat file as .tsx
    const inputFileName = data.path || (options.jsx ? "module.tsx" : "module.ts");
    const sourceFile = ts.createSourceFile(inputFileName, data.text, options.target!);

    // Output
    let outputText: string | undefined;
    let sourceMapText: string | undefined;
    const defHost = ts.createCompilerHost(options);
    // Create a compilerHost object to allow the compiler to read and write files
    const compilerHost: ts.CompilerHost = {
        ...defHost,
        getSourceFile: (fileName, langVersion, onError, shouldCreateNewSourceFile) =>
        {
            return fileName === path.normalize(inputFileName) ? sourceFile : defHost.getSourceFile(fileName, langVersion, onError, shouldCreateNewSourceFile)
        },
        writeFile: (name, text) =>
        {
            if (path.extname(name) === ".map")
            {
                sourceMapText = text;
            }
            else
            {
                outputText = text;
            }
        },
        useCaseSensitiveFileNames: () => false,
        getCanonicalFileName: fileName => fileName,
        getCurrentDirectory: () => hexo.base_dir,
        fileExists: (fileName): boolean => fileName === inputFileName || defHost.fileExists(fileName),
    };

    const program = ts.createProgram([inputFileName], options, compilerHost);
    // Emit
    const emitResult = program.emit();

    const allDiagnostics = ts
        .getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);
    reportDiagnostics(allDiagnostics);
    return outputText || "";
}

hexo.extend.renderer.register('ts', 'js', tsRenderer, true);
hexo.extend.renderer.register('tsx', 'js', tsRenderer, true);