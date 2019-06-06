;( function( $, window, document, undefined ) {

	"use strict";

	var $steps = [];

	var pluginName = "accWizard",
		defaults = {
			start: 1,
			mode: "wizard", // wizard or edit

			enableScrolling: true,
			scrollPadding: 5,

			autoButtons: true,
			autoButtonsNextClass: null,
			autoButtonsPrevClass: null,
			autoButtonsShowSubmit: true,
			autoButtonsSubmitText: 'Submit',
			autoButtonsEditSubmitText: 'Save',

			stepNumbers: true,
			stepNumberClass: '',

			beforeNextStep: function( currentStep ) { return true; },
			onSubmit: function( element ) { return true; }
		};

	function Plugin ( element, options ) {
		this.element = element;

		this.settings = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	// Avoid Plugin.prototype conflicts
	$.extend( Plugin.prototype, {
		init: function() {

			var mthis = this;

			// cache the steps
			this.$steps = $('[data-acc-step]');

			// get the initial acc-step height so we can calculate offset in animation
			this.stepHeight = $('[data-acc-step]').eq(0).outerHeight();

			// step numbers
			if( this.settings.stepNumbers ) {
				this.$steps.each(function(i, el) {
					$('[data-acc-title]', el).prepend('<span class="acc-step-number '+mthis.settings.stepNumberClass+'">' + (i+1) + '</span> ');
				})
			}

			// autobuttons
			if( this.settings.autoButtons ) {
				this.$steps.each(function(i, el) {

					var $content = $('[data-acc-content]', el);
					$content.append('<div class="p3d-button-content"></div>')
					// Add prev, not on first
					if( i > 0 ) {
						$content.find('.p3d-button-content').append('<a href="javascript:void(0)" class="'+mthis.settings.autoButtonsPrevClass+'" data-acc-btn-prev>'+p3d.text_multistep_back+'</a>');
					}

					// Add next, submit on last
					if( i < ( mthis.$steps.length - 1 ) ) {
						$content.find('.p3d-button-content').append('<a href="javascript:void(0)" class="'+mthis.settings.autoButtonsNextClass+'" data-acc-btn-next>'+p3d.text_multistep_next+'</a>');
					} else if( mthis.settings.autoButtonsShowSubmit ) {

						var btnText = mthis.settings.mode == 'wizard' ? mthis.settings.autoButtonsSubmitText : mthis.settings.autoButtonsEditSubmitText;

						$content.find('.p3d-button-content').append('<input type="submit" class="' + mthis.settings.autoButtonsNextClass + '" value="' + btnText + '">');
					}

				})
			}


			// set current
			this.currentIndex = this.settings.start - 1;


			if( this.settings.mode == 'wizard' ) {
				// 'wizard' mode

				this.activateStep( this.currentIndex, true );


				$('[data-acc-btn-next]').on('click', function() {
					if( mthis.settings.beforeNextStep( mthis.currentIndex + 1 ) ) {
					        //todo configurable
						if (p3d.multistep_model_step1=='on' && jQuery('#p3d-multistep div[data-acc-step]:first').hasClass('open')) {
							mthis.currentIndex = 0;
						}
						mthis.activateStep( mthis.currentIndex + 1 );
					}
				});

				$('[data-acc-btn-prev]').on('click', function() {
					mthis.activateStep( mthis.currentIndex - 1 );
				});

			} else if ( this.settings.mode == 'edit' ) {
				// 'edit' mode

				this.activateAllSteps();
				$('[data-acc-btn-next]').hide();
				$('[data-acc-btn-prev]').hide();

			}

			// onsubmit
			$(this.element).on('submit', function(e) {
				var resp = mthis.settings.onSubmit();
				if( !resp )
					e.preventDefault();
			});

		},
		deactivateStep: function(index, disableScrollOverride) {
			this.$steps.eq(index).removeClass('active');
		},
		activateStep: function(index, disableScrollOverride) {

			this.$steps.removeClass('open');



			var offset = index > this.currentIndex ? this.stepHeight : -this.stepHeight;


			if( !disableScrollOverride && this.settings.enableScrolling ) {
			    $('html').animate({
			        scrollTop: this.$steps.eq(this.currentIndex).offset().top + ( offset - this.settings.scrollPadding )
			    }, 500);
			}

	    	//$('.collapse', this.$steps.eq(index)).stop().collapse('show');
	    	$('[data-acc-content]', this.element).slideUp();

			this.$steps.eq(index)
				.addClass('open')
				.find('[data-acc-content]').slideDown();

			this.currentIndex = index;
			p3dReloadSliders();
			p3dInitSelect2();
		},
		activateNextStep: function() {
			this.activateStep( this.currentIndex + 1 );
		},
		activateAllSteps: function() {
			this.$steps.addClass('open');
			$('[data-acc-content]', this.element).show();
		}
	});

	// wrap up
	$.fn[ pluginName ] = function( options ) {
		return this.each( function() {
			if ( !$.data( this, "plugin_" + pluginName ) ) {
				$.data( this, "plugin_" +
					pluginName, new Plugin( this, options ) );
			}
		} );
	};

} )( jQuery, window, document );