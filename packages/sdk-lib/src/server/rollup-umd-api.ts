import rollup, {RollupCache, ModuleJSON, RollupBuild, RollupWatcher} from 'rollup';
import config from './rollup-umd.config';

const inputOptions: any = {
  // core input options
  external: [...config.external],
  input: config.input,
  plugins: [...config.plugins],
};

const outputOptions: any = {...config.output[0]};

let cache: RollupCache | undefined;
let watcher: RollupWatcher | undefined;

function makeCache(bundle: RollupBuild) {
  cache = bundle.cache;
  if (cache && cache.modules && cache.modules.length > 0) {
    console.log('cache old modules count: ', cache.modules.length);
    const newModules: ModuleJSON[] = [];
    cache.modules.forEach(module => {
      // remove tailwind.css implicitly because the tailwind output file should be recompiled every time.
      if (module.id && !module.id.endsWith('tailwind.css')) {
        newModules.push(module);
      }
    });
    cache.modules = newModules;
    console.log('cache new modules count: ', cache.modules.length);
  }
}

export async function build() {
  let bundle: RollupBuild;
  try {
    console.time('Bundle building');
    // create a bundle
    bundle = await rollup.rollup({...inputOptions, cache});
    await bundle.write(outputOptions);
    console.timeEnd('Bundle building');
    if (bundle) {
      makeCache(bundle);
      // closes the bundle
      await bundle.close();
    }
  } catch (error) {
    // do some error reporting
    console.error(error);
  }
}

export function watch(cb: (code: any, error: any) => void) {
  if (watcher) {
    try {
      watcher.close();
    } catch (e) {
      watcher = undefined;
    }
  }
  watcher = rollup.watch({
    ...inputOptions,
    cache,
    output: [outputOptions],
    watch: {
      exclude: 'node_modules/**',
      include: 'src/**',
    }
  });
  // This will make sure that bundles are properly closed after each run
  watcher.on('event', ({ code, result, error }: any) => {
    if (cb) {
      cb(code, error);
    }
    if (result) {
      makeCache(result);
      result.close();
    }
  });
}

export function shutdown() {
  if (watcher) {
    try {
      watcher.close();
    } catch (e) {
      watcher = undefined;
    }
  }
}
