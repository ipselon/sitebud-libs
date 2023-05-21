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
            'fs',
            'fs-extra',
            'lodash/isString',
            'lodash/lowerFirst',
            'lodash/template',
            'lodash/upperFirst',
            'lodash/forOwn',
            'path',
            'prettier/parser-typescript',
            'prettier/standalone',
            'react',
            'react-dom',
            '@xmldom/xmldom',
            'xpath',
            'klaw-sync',
            'nanoid'
        ],
        plugins: [
            resolve(),
            commonjs(),
            typescript(),
        ],
    }
];