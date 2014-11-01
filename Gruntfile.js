(function() {
  "use strict";
  module.exports = function() {

    var banner = 
      "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today('yyyy-mm-dd') %> (<%= grunt.template.date('longTime') %>)\n"+
      "* Copyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>; Licensed <%= _.pluck(pkg.licenses, 'type').join(', ') %> */\n";

    var sources = {
      scripts: ['Gruntfile.js', 'the-*/*.js'],
      elements: ['the-*/*.html'],
      stylus: ['themes/*/*.styl'],
      css: ['themes/*.css'],
      browserify: ['src/*/*.coffee']
    };

    var jshintOptions = { 
      strict: true,
      newcap: false,
      "globals": { "Polymer": true }
    };

    this.initConfig({
      pkg: this.file.readJSON('package.json'),
      exec: {
        build_stylus: 'node ./node_modules/stylus/bin/stylus ./themes/*.styl',
        build_fa: 'node ./scripts/build-font-awesome-javascript.js',
        mocha: 'node ./node_modules/mocha/bin/mocha --compilers coffee:coffee-script/register ./test/*/*.coffee',
        browserify: 'npm run build'
      },
      browserify: {
        libs: {
          files: {
            'build/noflo.js': ['./index.js'],
          },
          options: {
            transform: ['coffeeify']
          },
          browserifyOptions: {
            require: 'noflo'
          }
        }
      },
      jshint: {
        options: jshintOptions,
        all: {
          src: sources.scripts
        },
        force: {
          src: sources.scripts,
          options: { force: true }
        }
      },
      inlinelint: {
        options: jshintOptions,
        all: {
          src: sources.elements,
        },
        force: {
          src: sources.elements,
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
          tasks: ['jshint:force'],
          options: {
            livereload: true
          }
        },
        elements: {
          files: sources.elements,
          tasks: ['inlinelint:force'],
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
        browserify: {
          files: sources.browserify,
          tasks: ['exec:mocha', 'exec:browserify'],
          options: {
            livereload: true
          }
        }
      }
    });

    // Only lint changed file
    // this.event.on('watch', function(action, filepath) {
    //   this.config('jshint.all.src', filepath);
    //   this.config('inlinelint.all.src', filepath);
    // }.bind(this));

    this.loadNpmTasks('grunt-exec');
    this.loadNpmTasks('grunt-contrib-watch');
    this.loadNpmTasks('grunt-contrib-jshint');
    this.loadNpmTasks('grunt-lint-inline');
    this.loadNpmTasks('grunt-contrib-connect');
    this.loadNpmTasks('grunt-browserify');

    this.registerTask('dev', ['test', 'connect:server', 'watch']);
    this.registerTask('test', ['jshint:all', 'inlinelint:all', 'exec:mocha']);
    this.registerTask('build', ['exec:build_stylus', 'exec:build_fa', 'browserify:libs', 'exec:browserify']);
    this.registerTask('default', ['test']);
  };

}).call(this);
