(function() {
  "use strict";
  module.exports = function() {

    var sources = {
      scripts: ['Gruntfile.js', 'the-*/*.js', 'the-*/*.html', 'index.js'],
      // elements: ['the-*/*.html'],
      stylus: ['themes/*/*.styl'],
      css: ['themes/*.css'],
      tests: ['__tests__/*.js']
    };

    var externals = [
      'react',
      'react-dom',
      'create-react-class',
      'hammerjs',
      '@pleasetrythisathome/react.animate'
    ];

    var glob = require('glob');
    var stylExpand = glob.sync('./themes/*.styl').join(' ');

    this.initConfig({
      pkg: this.file.readJSON('package.json'),
      exec: {
        jest: {
          command: 'jest --verbose',
        },
        build_stylus: {
          command: 'node ./node_modules/stylus/bin/stylus ' + stylExpand
        },
        build_fa: {
          command: 'node ./scripts/build-font-awesome-javascript.js'
        }
      },
      browserify: {
        vendor: {
          files: {
            'dist/vendor.js': ['./vendor.js'],
          },
          options: {
            require: externals
          }
        },
        libs: {
          files: {
            'dist/the-graph.js': ['index.js'],
          },
          options: {
            external: externals,
            transform: ['coffeeify'],
            browserifyOptions: {
              standalone: 'TheGraph'
            }
          }
        },
        render: {
          files: {
            'dist/the-graph-render.js': ['render.js'],
          },
          options: {
            external: [],
            transform: ['coffeeify', 'browserify-css'],
            browserifyOptions: {
              standalone: 'TheGraphRender'
            }
          }
        }
      },
      jshint: {
        options: { 
          extract: 'auto',
          strict: false,
          newcap: false,
          "globals": { "Polymer": true }
        },
        all: {
          src: sources.scripts
        },
        force: {
          src: sources.scripts,
          options: { force: true }
        }
      },
      connect: {
        server: {
          options: {
            port: 3000,
            hostname: '*', // Allow connection from mobile
            livereload: true
          }
        }
      },
      watch: {
        scripts: {
          files: sources.scripts,
          tasks: ['jshint:force', 'browserify:libs', 'exec:jest'],
          options: {
            livereload: true
          }
        },
        stylus: {
          files: sources.stylus,
          tasks: ['exec:build_stylus'],
          options: {
            livereload: false
          }
        },
        css: {
          files: sources.css,
          options: {
            livereload: true
          }
        },
        tests: {
          files: sources.tests,
          tasks: ['exec:jest'],
          options: {
            livereload: false
          }
        },
      },
    });

    this.loadNpmTasks('grunt-exec');
    this.loadNpmTasks('grunt-contrib-jshint');
    this.loadNpmTasks('grunt-contrib-connect');
    this.loadNpmTasks('grunt-contrib-watch');
    this.loadNpmTasks('grunt-browserify');

    this.registerTask('dev', ['connect', 'test', 'watch']);
    this.registerTask('build', ['exec:build_stylus', 'exec:build_fa', 'browserify:libs', 'browserify:vendor', 'browserify:render']);
    this.registerTask('test', ['jshint:all', 'build', 'exec:jest']);
    this.registerTask('default', ['test']);
  };

}).call(this);
