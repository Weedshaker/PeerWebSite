module.exports = function gruntFile(grunt) {
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      dist: {
        options: {
          sourceMap: false,
          screwIE8: true,
        },
        files: {
          'dist/dom2hscript.min.js': ['dist/dom2hscript.js']
        }
      }
    },
    browserify: {
      dist: {
        files: {
          'dist/dom2hscript.js': ['index.js'],
          'dist/test.js': ['tests/index.js']
        },
        options: {
          browserifyOptions: {
            standalone: '<%= pkg.name %>'
          }
        }
      },
    },
  });

  grunt.registerTask('build', ['browserify:dist','uglify:dist']);

};

