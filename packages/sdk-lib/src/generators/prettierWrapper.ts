// @ts-nocheck
import prettier from 'prettier/standalone';
import parserTypeScript from "prettier/parser-typescript";

export function formatTS (
    text,
    options = {
        singleQuote: true,
        printWidth: 80,
        tabWidth: 4
    }
) {
    return prettier.format(text, {
        parser: 'typescript',
        plugins: [parserTypeScript],
        ...options
    });
}

export function removeEmptyLines(text: string): string {
    // Split the text into an array of lines
    const lines = text.split(/\r?\n/);

    // Filter out empty lines (remove lines containing only whitespace characters)
    const nonEmptyLines = lines.filter(line => line.trim() !== '');

    // Join the non-empty lines back together
    const newText = nonEmptyLines.join('\n');

    return newText;
}
