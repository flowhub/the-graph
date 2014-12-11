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
      css: ['themes/*.css']
    };

    var glob = require('glob');
    var stylExpand = glob.sync('./themes/*.styl').join(' ');

    var jshintOptions = { 
      strict: true,
      newcap: false,
      "globals": { "Polymer": true }
    };

    this.initConfig({
      pkg: this.file.readJSON('package.json'),
      'bower-install-simple': {
        deps: {
          options: {
            interactive: false,
            forceLatest: false,
            directory: 'bower_components'
          }
        }
      },
      exec: {
        build_stylus: {
          command: 'node ./node_modules/stylus/bin/stylus ' + stylExpand
        },
        build_fa: {
          command: 'node ./scripts/build-font-awesome-javascript.js'
        }
      },
      browserify: {
        libs: {
          files: {
            'build/noflo.js': ['index.js'],
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
            // nospawn: true,
            livereload: true
          }
        },
        elements: {
          files: sources.elements,
          tasks: ['inlinelint:force'],
          options: {
            // nospawn: true,
            livereload: true
          }
        },
        stylus: {
          files: sources.stylus,
          tasks: ['exec:build_stylus'],
          options: {
            // nospawn: true,
            livereload: false
          }
        },
        css: {
          files: sources.css,
          options: {
            // nospawn: true,
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

    this.loadNpmTasks('grunt-bower-install-simple');
    this.loadNpmTasks('grunt-exec');
    this.loadNpmTasks('grunt-contrib-watch');
    this.loadNpmTasks('grunt-contrib-jshint');
    this.loadNpmTasks('grunt-lint-inline');
    this.loadNpmTasks('grunt-contrib-connect');
    this.loadNpmTasks('grunt-browserify');

    this.registerTask('dev', ['test', 'connect:server', 'watch']);
    this.registerTask('build', ['bower-install-simple', 'exec:build_stylus', 'exec:build_fa', 'browserify:libs']);
    this.registerTask('test', ['jshint:all', 'inlinelint:all', 'build']);
    this.registerTask('default', ['test']);
  };

}).call(this);
