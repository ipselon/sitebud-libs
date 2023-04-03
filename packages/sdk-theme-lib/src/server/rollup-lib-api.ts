import rollup from 'rollup';
import config from './rollup-lib.config';

const inputOptions: any = {
  // core input options
  external: [...config.external],
  input: config.input,
  plugins: [...config.plugins],
};

const outputOptions: any = {...config.output[0]};

export async function build() {
  let bundle;
  try {
    console.time('Bundle building');
    // create a bundle
    bundle = await rollup.rollup(inputOptions);
    await bundle.write(outputOptions);
    console.timeEnd('Bundle building');
  } catch (error) {
    // do some error reporting
    console.error(error);
  }
  if (bundle) {
    // closes the bundle
    await bundle.close();
  }
}
