(function() {
  "use strict";
  module.exports = function() {

    var banner = 
      "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today('yyyy-mm-dd') %> (<%= grunt.template.date('longTime') %>)\n"+
      "* Copyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>; Licensed <%= _.pluck(pkg.licenses, 'type').join(', ') %> */\n";

    var sources = {
      scripts: ['Gruntfile.js', 'the-*/*.js', 'the-*/*.html', 'index.js'],
      // elements: ['the-*/*.html'],
      stylus: ['themes/*/*.styl'],
      css: ['themes/*.css'],
      tests: ['spec/*.coffee', 'spec/runner.html']
    };

    var externals = [
      'react',
      'react-dom',
      '@pleasetrythisathome/react.animate'
    ];

    var glob = require('glob');
    var stylExpand = glob.sync('./themes/*.styl').join(' ');

    this.initConfig({
      pkg: this.file.readJSON('package.json'),
      exec: {
        build_stylus: {
          command: 'node ./node_modules/stylus/bin/stylus ' + stylExpand
        },
        build_fa: {
          command: 'node ./scripts/build-font-awesome-javascript.js'
        }
      },
      coffee: {
        specs: {
          options: {
            bare: true
          },
          expand: true,
          cwd: 'spec',
          src: ['**.coffee'],
          dest: 'spec',
          ext: '.js'
        }
      },
      browserify: {
        vendor: {
          files: {
            'dist/vendor.js': ['spec/vendor.js'],
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
          tasks: ['jshint:force', 'browserify:libs'],
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
          tasks: ['coffee'],
          options: {
            livereload: false
          }
        },
      },
      'saucelabs-mocha': {
        all: {
          options: {
            urls: ['http://127.0.0.1:3000/spec/runner.html'],
            browsers: [
              {
                browserName: 'googlechrome',
                version: '39'
              }
            ],
            build: process.env.TRAVIS_JOB_ID,
            testname: 'the-graph browser tests',
            tunnelTimeout: 5,
            concurrency: 1,
            detailedError: true
          }
        }
      }
    });

    this.loadNpmTasks('grunt-exec');
    this.loadNpmTasks('grunt-contrib-watch');
    this.loadNpmTasks('grunt-contrib-jshint');
    this.loadNpmTasks('grunt-contrib-connect');
    this.loadNpmTasks('grunt-contrib-coffee');
    this.loadNpmTasks('grunt-browserify');
    this.loadNpmTasks('grunt-saucelabs');

    this.registerTask('dev', ['test', 'watch']);
    this.registerTask('build', ['exec:build_stylus', 'exec:build_fa', 'browserify:libs', 'browserify:vendor']);
    this.registerTask('test', ['jshint:all', 'build', 'coffee', 'connect:server']);
    this.registerTask('crossbrowser', ['test', 'saucelabs-mocha']);
    this.registerTask('default', ['test']);
  };

}).call(this);
