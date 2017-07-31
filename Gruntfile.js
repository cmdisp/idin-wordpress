/* jshint node:true */
module.exports = function( grunt ) {
	require( 'load-grunt-tasks' )( grunt );

	// Project configuration.
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		// PHPLint
		phplint: {
			core: [
				'**/*.php',
				'!bower_components/**',
				'!build/**',
				'!deploy/**',
				'!node_modules/**',
				'!vendor/**'
			]
		},

		// PHP Code Sniffer
		phpcs: {
			application: {
				src: [
					'**/*.php',
					'!bower_components/**',
					'!deploy/**',
					'!node_modules/**',
					'!vendor/**'
				]
			},
			options: {
				bin: 'vendor/bin/phpcs',
				standard: 'phpcs.ruleset.xml',
				showSniffCodes: true
			}
		},

		// Sass Lint
		sasslint: {
			options: {
				configFile: '.sass-lint.yml'
			},
			target: [
				'src/sass/**/*.scss'
			]
		},

		// Check WordPress version
		checkwpversion: {
			options: {
				readme: 'readme.txt',
				plugin: 'cm-idin.php'
			},
			check: {
				version1: 'plugin',
				version2: 'readme',
				compare: '=='
			},
			check2: {
				version1: 'plugin',
				version2: '<%= pkg.version %>',
				compare: '=='
			}
		},

		// Imagemin
		imagemin: {
			build: {
				files: [
					{ // Images
						expand: true,
						cwd: 'src/images/',
						src: ['**/*.{png,jpg,gif,svg,ico}'],
						dest: 'images/'
					}
				]
			}
		},

		// Check textdomain
		checktextdomain: {
			options:{
				text_domain: 'cm-idin',
				keywords: [
					'__:1,2d',
					'_e:1,2d',
					'_x:1,2c,3d',
					'esc_html__:1,2d',
					'esc_html_e:1,2d',
					'esc_html_x:1,2c,3d',
					'esc_attr__:1,2d',
					'esc_attr_e:1,2d',
					'esc_attr_x:1,2c,3d',
					'_ex:1,2c,3d',
					'_n:1,2,4d',
					'_nx:1,2,4c,5d',
					'_n_noop:1,2,3d',
					'_nx_noop:1,2,3c,4d'
				]
			},
			files: {
				src:  [
					'**/*.php',
					'!bower_components/**',
					'!node_modules/**'
				],
				expand: true
			}
		},

		// Make POT
		makepot: {
			target: {
				options: {
					domainPath: 'languages',
					type: 'wp-plugin',
					updatePoFiles: true,
					updateTimestamp: false,
					exclude: [
						'bower_components/.*',
						'deploy/.*',
						'node_modules/.*',
						'vendor/.*'
					]
				}
			}
		},

		// Compass
		compass: {
			build: {
				options: {
					sassDir: 'src/sass',
					cssDir: 'src/css'
				}
			}
		},

		// Autoprefixer
		autoprefixer: {
			options: {
		 		browsers: [ 'last 2 version', 'ie 8', 'ie 9' ]
			},
			admin: {
				src: 'src/css/style.css'
			}
		},

		// CSS min
		cssmin: {
			styles: {
				files: {
					// CM iDIN
					'css/style.min.css': 'src/css/style.css'
				}
			}
		},

		// Clean
		clean: {
			assets: {
				src: [
					'assets',
					'css',
					'images',
					'js'
				]
			},
			deploy: {
				src: [ 'deploy/latest' ]
			}
		},

		// Copy
		copy: {
			styles: {
				files: [
					{ // CSS
						expand: true,
						cwd: 'src/css/',
						src: [ '**' ],
						dest: 'css'
					}
				]
			},
			deploy: {
				src: [
					'**',
					'!Gruntfile.js',
					'!package.json',
					'!package-lock.json',
					'!phpcs.ruleset.xml',
					'!README.md',
					'!build/**',
					'!deploy/**',
					'!etc/**',
					'!documentation/**',
					'!node_modules/**',
					'!src/**',
					'!vendor/**'
				],
				dest: 'deploy/latest',
				expand: true
			}
		},

		// Composer
		composer : {
			options : {

			},
			some_target: {
				options : {
					cwd: 'deploy/latest'
				}
			}
		},

		// Shell
		shell: {
			deploy: {
				command: [
					'cd deploy/latest',
					'composer install --no-dev --prefer-dist'
				].join( '&&' )
			}
		},

		// Compress
		compress: {
			deploy: {
				options: {
					archive: 'deploy/archives/<%= pkg.name %>.<%= pkg.version %>.zip'
				},
				expand: true,
				cwd: 'deploy/latest',
				src: ['**/*'],
				dest: '<%= pkg.name %>/'
			}
		},

		// Git checkout
		gitcheckout: {
			tag: {
				options: {
					branch: 'tags/<%= pkg.version %>'
				}
			},
			develop: {
				options: {
					branch: 'develop'
				}
			}
		},

		// S3
		aws_s3: {
			options: {
				region: 'eu-central-1'
			},
			deploy: {
				options: {
					bucket: 'downloads.pronamic.eu',
					differential: true
				},
				files: [
					{
						expand: true,
						cwd: 'deploy/archives/',
						src: '<%= pkg.name %>.<%= pkg.version %>.zip',
						dest: 'plugins/<%= pkg.name %>/'
					}
				]
			}
		},

		// WordPress deploy
		rt_wp_deploy: {
			app: {
				options: {
					svnUrl: 'http://plugins.svn.wordpress.org/<%= pkg.name %>/',
					svnDir: 'deploy/wp-svn',
					svnUsername: 'pronamic',
					deployDir: 'deploy/latest',
					version: '<%= pkg.version %>'
				}
			}
		}
	} );

	// Default task(s).
	grunt.registerTask( 'default', [
		'phplint',
		'phpcs',
		'sasslint'
	] );

	grunt.registerTask( 'assets', [
		'clean:assets',
		'sasslint',
		'compass',
		'autoprefixer',
		'copy:styles',
		'imagemin'
	] );

	grunt.registerTask( 'min', [
		'cssmin',
		'imagemin'
	] );

	grunt.registerTask( 'pot', [
		'checktextdomain',
		'makepot'
	] );

	grunt.registerTask( 'deploy', [
		'default',
		'assets',
		'min',
		'pot',
		'clean:deploy',
		'copy:deploy',
		'shell:deploy',
		'compress:deploy'
	] );

	grunt.registerTask( 'wp-deploy', [
		'gitcheckout:tag',
		'deploy',
		'rt_wp_deploy',
		'gitcheckout:develop'
	] );
	
	grunt.registerTask( 's3-deploy', [
		'gitcheckout:tag',
		'deploy',
		'aws_s3:deploy',
		'gitcheckout:develop'
	] );
};
