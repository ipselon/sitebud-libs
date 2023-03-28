import {readFileSync} from 'fs';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: pkg.main,
                format: 'cjs',
            },
            {
                file: pkg.module,
                format: 'es',
            },
        ],
        external: [
            '@sitebud/domain-lib',
            '@rollup/plugin-commonjs',
            '@rollup/plugin-image',
            '@rollup/plugin-json',
            '@rollup/plugin-node-resolve',
            '@rollup/plugin-typescript',
            '@svgr/rollup',
            'cors',
            'date-fns',
            'express',
            'fs',
            'fs-extra',
            'klaw-sync',
            'lodash/isString',
            'lodash/lowerFirst',
            'lodash/template',
            'lodash/upperFirst',
            'octokit',
            'path',
            'prettier/parser-typescript',
            'prettier/standalone',
            'react',
            'react-dom',
            'request',
            'rollup',
            'rollup-plugin-external-globals',
            'rollup-plugin-styles',
            'rollup-plugin-terser',
            'socket.io',
        ],
        plugins: [
            resolve(),
            commonjs(),
            typescript(),
        ],
    }
];