(function() {
  "use strict";
  module.exports = function() {

    var banner = 
      "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today('yyyy-mm-dd') %> (<%= grunt.template.date('longTime') %>)\n"+
      "* Copyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>; Licensed <%= _.pluck(pkg.licenses, 'type').join(', ') %> */\n";

    var sources = {
      scripts: ['Gruntfile.js', 'the-*/*.js'],
      elements: ['the-*/*.html'],
      styles: ['themes/default/*.css']
    };

    var jshintOptions = { 
      strict: true,
      newcap: false,
      "globals": { "Polymer": true }
    };

    this.initConfig({
      pkg: this.file.readJSON('package.json'),
      exec: {
        build_stylus: {
          command: 'node ./node_modules/stylus/bin/stylus ./themes/the-graph-dark.styl'
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
        styles: {
          files: sources.styles,
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

    this.loadNpmTasks('grunt-exec');
    this.loadNpmTasks('grunt-contrib-watch');
    this.loadNpmTasks('grunt-contrib-jshint');
    this.loadNpmTasks('grunt-lint-inline');
    this.loadNpmTasks('grunt-contrib-connect');

    this.registerTask('dev', ['test', 'connect:server', 'watch']);
    this.registerTask('test', ['jshint:all', 'inlinelint:all']);
    this.registerTask('build', ['exec:build_stylus']);
    this.registerTask('default', ['test']);
  };

}).call(this);
