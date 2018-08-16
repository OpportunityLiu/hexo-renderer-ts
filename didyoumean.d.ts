interface DidYouMaen
{
    threshold: number;
    caseSensitive: boolean;
    nullResultValue: string | null;
    returnWinningObject: boolean;
    returnFirstMatch: boolean;

    (str: string, list: Array<string>): string | null;
    <T>(str: string, list: Array<T>, key: keyof T): string | T | null;
}

declare module 'didyoumean'
{
    let didyoumaen: DidYouMaen;
    export = didyoumaen;
}