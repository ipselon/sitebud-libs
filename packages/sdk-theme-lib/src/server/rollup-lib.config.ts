import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import image from '@rollup/plugin-image';
import typescript from '@rollup/plugin-typescript';
import styles from 'rollup-plugin-styles';
import svgr from '@svgr/rollup';

const config: any = {
    input: 'src/index.ts',
    output: [
        {
            file: 'lib/index.js',
            format: 'es',
            assetFileNames: '[name][extname]',
            paths: {
                '@sitebud/platform-lib': '@/platform',
            }
        },
    ],
    external: [
        'lodash/cloneDeep',
        'lodash/forOwn',
        'lodash/get',
        'lodash/isArray',
        'lodash/isEmpty',
        'lodash/isObject',
        'lodash/uniqueId',
        'lodash/unionWith',
        'lodash/isEqual',
        'react',
        'react-dom',
        '@headlessui/react',
        '@sitebud/bridge-lib',
        '@sitebud/domain-lib',
        '@sitebud/platform-lib'
    ],
    plugins: [
        resolve({preferBuiltins: true}),
        styles({
            mode: ['extract', 'index.css']
        }),
        svgr(),
        image(),
        commonjs(),
        typescript(),
        json(),
    ],
};

export default config;
