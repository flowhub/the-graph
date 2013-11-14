(function() {
  module.exports = function() {

    var banner = 
      "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today('yyyy-mm-dd') %> (<%= grunt.template.date('longTime') %>)\n"+
      "* Copyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>; Licensed <%= _.pluck(pkg.licenses, 'type').join(', ') %> */\n";

    var sources = {
      scripts: ['Gruntfile.js', 'the-*/*.js'],
      elements: ['the-*/*.html']
    };

    this.initConfig({
      pkg: this.file.readJSON('package.json'),
      jshint: {
        all: sources.scripts,
        force: {
          options: { force: true },
          files: { src: sources.scripts }
        }
      },
      inlinelint: {
        html: sources.elements,
        options: { 
          strict: true,
          newcap: false 
        }//,
        // force: {
        //   options: { force: true },
        //   files: { src: sources.scripts }
        // }
      },
      watch: {
        scripts: {
          files: sources.scripts,
          tasks: ['jshint:force'],
          options: {
            nospawn: true
          }
        },
        elements: {
          files: sources.elements,
          tasks: ['inlinelint:force'],
          options: {
            nospawn: true
          }
        }
      }
    });

    this.loadNpmTasks('grunt-contrib-watch');
    this.loadNpmTasks('grunt-contrib-jshint');
    this.loadNpmTasks('grunt-lint-inline');

    this.registerTask('test', ['jshint', 'inlinelint']);
    this.registerTask('default', ['test']);
  };

}).call(this);
