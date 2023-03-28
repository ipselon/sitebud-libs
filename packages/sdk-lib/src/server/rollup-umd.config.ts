import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import image from '@rollup/plugin-image';
import typescript from '@rollup/plugin-typescript';
import styles from 'rollup-plugin-styles';
import externalGlobals from 'rollup-plugin-external-globals';
import terser from 'rollup-plugin-terser';
import svgr from '@svgr/rollup';

const inputOptions: any = {
    input: 'src/index.ts',
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
        '@headlessui/react',
        '@sitebud/bridge-lib',
        '@sitebud/domain-lib',
        '@sitebud/platform-lib',
        'react',
        'react-dom',
    ],
    plugins: [
        resolve(),
        svgr(),
        image(),
        commonjs(),
        styles({
            mode: ['extract', 'sitebud-theme.css']
        }),
        typescript({
            tsconfig: false,
            baseUrl: './src',
            include: [
                './src/**/*.ts',
                './src/**/*.tsx',
                './src/**/*.d.ts'
            ],
            exclude: [
                '**/__tests__',
                '**/*.test.ts',
                '**/*.test.js',
            ],
            jsx: 'react',
            moduleResolution: 'node',
            module: 'esnext',
            target: 'es6',
            compilerOptions: {
                lib: [
                    "dom",
                    "dom.iterable",
                    "esnext"
                ],
                allowJs: true,
                skipLibCheck: true,
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
                strict: true,
                forceConsistentCasingInFileNames: true,
                noFallthroughCasesInSwitch: true,
                resolveJsonModule: true,
                isolatedModules: true,
                noEmit: true,
                declaration: false,
            }
        }),
        externalGlobals({
            '@headlessui/react': 'headlessuiReact',
            '@sitebud/bridge-lib': 'sitebudBridge',
            '@sitebud/platform-lib': 'sitebudPlatform',
            react: 'React',
            'react-dom': 'ReactDOM'
        }),
    ],
};

const outputOptions: any = {
    format: 'umd',
    name: 'sitebudTheme',
    file: 'dist/sitebud-theme.umd.js',
    assetFileNames: '[name][extname]',
};

const config: any = {
    ...inputOptions,
    output: [outputOptions],
};

if (process.env.NODE_ENV === 'production') {
    config.plugins.push(terser.terser());
}

export default config;
