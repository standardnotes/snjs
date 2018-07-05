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
        dest: 'dist/sn-models.js',
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
          'dist/sn-models-browserfied.js': 'dist/sn-models.js'
        }
      },
    },

     uglify: {
       compiled: {
         src: ['dist/sn-models.js'],
         dest: 'dist/sn-models.min.js'
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
