module.exports = function(grunt) {

  grunt.initConfig({

    watch: {
      js: {
        files: ['lib/**/*.js'],
        tasks: ['concat:lib', 'babel', 'concat:dist', 'browserify'],
        options: {
          spawn: false,
        },
      },
    },

    concat: {
      options: {
        separator: ';',
      },

      lib: {
        src: [
          'lib/services/**/*.js',
          'lib/models/app/*.js',
          'lib/models/local/*.js',
          'lib/models/server/*.js',
          'lib/models/subclasses/*.js',
          'lib/main.js'
        ],
        dest: 'dist/lib.js',
      },

      dist: {
        src: ['dist/transpiled.js'],
        dest: 'dist/snjs.js',
      },
    },

    babel: {
      options: {
        sourceMap: true,
      },

      dist: {
        files: {
          'dist/transpiled.js': 'dist/lib.js'
        }
      },
    },

    browserify: {

      dist: {
        options: {
          browserifyOptions: {
            standalone: 'SN',
          }
        },
        files: {
          'dist/snjs-browserfied.js': 'dist/snjs.js'
        }
      },
    },

     uglify: {
       compiled: {
         src: ['dist/snjs.js'],
         dest: 'dist/snjs.min.js'
       }
    }
  });

  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['concat:lib', 'babel', 'concat:dist', 'browserify']);
};
