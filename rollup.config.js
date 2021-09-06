import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import replace from 'rollup-plugin-replace';
import md from 'rollup-plugin-md';
import fs from 'fs';

const production = !process.env.ROLLUP_WATCH;

function insertHashToIndex() {
  return {
    writeBundle() {
      const stats = fs.statSync('html/build/bundle.js');
      let indexHtml = fs.readFileSync(`html/index.html`, 'utf8');
      // let swJs = fs.readFileSync(`html/service-worker.js`, "utf8");
      indexHtml = indexHtml
        .replace(/\/global\.css(\?_=[0-9\.]+)?/, '/global.css?_=' + stats.ctimeMs)
        .replace(/\/normalize\.css(\?_=[0-9\.]+)?/, '/normalize.css?_=' + stats.ctimeMs)
        .replace(/\/theme\.css(\?_=[0-9\.]+)?/, '/theme.css?_=' + stats.ctimeMs)
        .replace(/\/build\/bundle\.css(\?_=[0-9\.]+)?/, '/build/bundle.css?_=' + stats.ctimeMs)
        .replace(/\/build\/bundle\.js(\?_=[0-9\.]+)?/, '/build/bundle.js?_=' + stats.ctimeMs);
      // .replace(
      //   /\/service-worker\.js(\?_=[0-9\.]+)?/,
      //   "/service-worker.js?_=" + stats.ctimeMs
      // );
      // swJs = swJs.replace(
      //   /staticCache(\?_=[0-9\.]+)?/,
      //   "staticCache?_=" + stats.ctimeMs
      // );

      // You can create a new file if you don't want to make a mutable modification.
      fs.writeFileSync(`html/index.html`, indexHtml);
      // fs.writeFileSync(`html/service-worker.js`, swJs);
    },
  };
}

export default {
  input: 'src/main.js',
  output: {
    sourcemap: !production,
    format: 'iife',
    name: 'app',
    dir: production ? 'html/build/' : 'public/build/',
    entryFileNames: 'bundle.js',
    // entryFileNames: production ? `bundle?+_[hash].js` : "bundle.js",
  },
  plugins: [
    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file - better for performance
      css: css => {
        css.write('bundle.css', !production);
      },
    }),
    production && insertHashToIndex(),
    replace({
      ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload('public'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
    md({
      // to disable marked set to false
      marked: {
        //marked options
      },
    }),
  ],
  watch: {
    clearScreen: false,
  },
};

function serve() {
  let started = false;

  return {
    writeBundle() {
      if (!started) {
        started = true;

        require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true,
        });
      }
    },
  };
}
