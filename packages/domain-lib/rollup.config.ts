import {readFileSync} from 'fs';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

export default {
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
        'lodash/forOwn',
        'lodash/get',
        'lodash/set',
        'lodash/isNil',
        'nanoid',
        'react',
        'react-dom'
    ],
    plugins: [
        resolve({ preferBuiltins: true }),
        commonjs(),
        typescript(),
    ],
};