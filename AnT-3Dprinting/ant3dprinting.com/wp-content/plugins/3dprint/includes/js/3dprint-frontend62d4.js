/**
 * @author Sergey Burkov, http://www.wp3dprinting.com
 * @copyright 2015
 */

p3d.bar_progress=0;
p3d.xhr1='';
p3d.xhr2='';
p3d.xhr3='';
p3d.filereader_supported=true;
p3d.file_selected=0;
p3d.aabb = new Array();
p3d.resize_scale = 1;
p3d.resize_scale_x = 1;
p3d.resize_scale_y = 1;
p3d.resize_scale_z = 1;
p3d.initial_rotation_x = 0;
p3d.initial_rotation_y = 0;
p3d.initial_rotation_z = 0;
p3d.default_scale = 100;
p3d.cookie_expire = parseInt(p3d.cookie_expire);
p3d.refresh_interval = "";
p3d.refresh_interval1 = "";
p3d.refresh_interval1_running = false;
p3d.refresh_interval_repair = "";
p3d.uploading = false;
p3d.repairing = false;
p3d.processing = false;
p3d.checking = false;
p3d.analyse_error = false;
p3d.model_total_volume=0;
p3d.model_surface_area=0;
p3d.analysed_volume = 0;
p3d.analysed_surface_area = 0;
p3d.triangulation_required = false;
p3d.triangulated_volume = 0;
p3d.triangulated_surface_area = 0;
p3d.is_fullscreen = 0;
p3d.bed_support_height = 8;
p3d.image_height=5;
p3d.image_map=1;
p3d.boundingBox=[];
p3d.fatal_error=false;
p3d.printer_error=false;
p3d.packed=0;
p3d.new_pricing='';
p3d.print_time=0;
p3d.scale_independently=0;
p3d.bxsliders = [];

function p3dInit() {

	//workaround for shortcode pages
	p3d.product_id = jQuery('#p3d_product_id').val();
	p3d.upload_url = jQuery('#p3d_upload_url').val();
	p3d.upload_url_default = jQuery('#p3d_upload_url_default').val();
	p3d.product_price_type = jQuery('#p3d_product_price_type').val();
	p3d.product_display_mode = jQuery('#p3d_product_display_mode').val();
	p3d.file_url = jQuery('#p3d_file_url').val();
	p3d.min_price = jQuery('#p3d_min_price').val();

	jQuery('#rotation_x, #rotation_y, #rotation_z').val('0');

	if (p3d.product_display_mode.length>0) {
		p3d.display_mode = p3d.product_display_mode;
	}
	if (p3d.display_mode=='fullscreen') {
		jQuery('body').append('<div id="p3d-fullscreen"></div>');
	}

	p3dBindSubmit();       



	jQuery('p.price span.amount').html('&nbsp;');
	window.p3d_canvas = document.getElementById('p3d-cv');
	p3dCanvasDetails();


	var logoTimerID = 0;

	p3d.targetRotation = 0;
	p3d.targetRotationOnMouseDown = 0;
	p3d.mouseX = 0;
	p3d.mouseXOnMouseDown = 0;
	p3d.windowHalfX = window.innerWidth / 2;
	p3d.windowHalfY = window.innerHeight / 2;


	if (jQuery('input[name=get_printer_id]').val())	{
		printer=jQuery('input[name=get_printer_id]').val()
		jQuery.cookie('p3d_printer', printer, { expires: p3d.cookie_expire });
	}
	else if (jQuery.cookie('p3d_printer')!='undefined' && jQuery('#p3d_printer_'+jQuery.cookie('p3d_printer')).length>0) {
		printer=jQuery.cookie('p3d_printer');
	}
	else {
		printer=jQuery('input[name=product_printer]').data('id');

	}

	if (jQuery('input[name=get_material_id]').val()) {
		material=jQuery('input[name=get_material_id]').val()
		jQuery.cookie('p3d_material', material, { expires: p3d.cookie_expire });
	}
	else if (jQuery.cookie('p3d_material')!='undefined' && jQuery('#p3d_material_'+jQuery.cookie('p3d_material')).length>0)	{
		material=jQuery.cookie('p3d_material');
	}
	else {
		material=jQuery('input[name=product_filament]').data('id');
	}
	if (jQuery('input[name=get_coating_id]').val()) {
		coating=jQuery('input[name=get_coating_id]').val()
		jQuery.cookie('p3d_coating', coating, { expires: p3d.cookie_expire });
	}
	else if (jQuery.cookie('p3d_coating')!='undefined' && jQuery('#p3d_coating_'+jQuery.cookie('p3d_coating')).length>0)	{
		coating=jQuery.cookie('p3d_coating');
	}
	else {
		coating=jQuery('input[name=product_coating]').data('id');
	}

	if (jQuery('input[name=get_infill]').val()) {
		infill=jQuery('input[name=get_infill]').val()
		jQuery.cookie('p3d_infill', infill, { expires: p3d.cookie_expire });
	}
	else if (jQuery.cookie('p3d_infill')!='undefined') {
		infill=jQuery.cookie('p3d_infill');
	}
	else {
		infill=jQuery('input[name=product_infill]').data('id');
	}

	if (jQuery('input[name=get_filename]').val()) {
		original_filename=jQuery('input[name=get_filename]').val()
		jQuery.cookie('p3d_filename', original_filename, { expires: p3d.cookie_expire });
	}
	else if (jQuery.cookie('p3d_filename')!='undefined') {
		original_filename=jQuery.cookie('p3d_filename');
	}

	if (p3d.file_url) {
		product_file=p3d.file_url.split('/').reverse()[0];
	}
	else if (jQuery('input[name=get_product_model]').val()) {
		product_file=jQuery('input[name=get_product_model]').val();
		jQuery.cookie('p3d_file', product_file, { expires: p3d.cookie_expire });
	}
	else {
		product_file=jQuery.cookie('p3d_file');
	}

	if (typeof(jQuery.cookie('p3d_mtl'))!='undefined') {
		product_mtl=jQuery.cookie('p3d_mtl');
	}
	else if (jQuery('#p3d_mtl').val()!='') {
		product_mtl=jQuery('#p3d_mtl').val();
	}
	else {
		product_mtl='';
	}


	if (jQuery('input[name=get_product_unit]').val()) {
		product_unit=jQuery('input[name=get_product_unit]').val();
		jQuery.cookie('p3d_unit', product_unit, { expires: p3d.cookie_expire });
	}
	else if (p3d.default_unit.length) {
		product_unit=p3d.default_unit;
	}
	else if (jQuery.cookie('p3d_unit')!='undefined') {
		product_unit=jQuery.cookie('p3d_unit');
	}
	else {
		product_unit='mm';
	}


	if (typeof(infill)!='undefined') {
		jQuery('#p3d_infill_'+infill).attr('checked', 'checked');
		p3dSelectInfill(infill);
	}
	if (typeof(original_filename)!='undefined') {
		jQuery('#pa_p3d_filename').val(original_filename);
	}
	else {
		jQuery('#pa_p3d_filename').val('model.stl');
	}


	if (typeof(printer)!='undefined') {
		jQuery('#p3d_printer_'+printer).attr('checked', 'checked');
		p3dSelectPrinter(printer);
	}
	else {
		jQuery('input[name=product_printer]').first().attr('checked', 'checked')
		p3dSelectPrinter(jQuery('input[name=product_printer]').first().data('id') || jQuery('select[name=product_printer]').val());
	}

	if (typeof(material)!='undefined') {
		jQuery('#p3d_material_'+material).attr('checked', 'checked');
		p3dSelectFilament(material);
	}
	else {
		jQuery('input[name=product_filament]').first().attr('checked', 'checked')
		p3dSelectFilament(jQuery('input[name=product_filament]').first().data('id') || jQuery('select[name=product_filament]').val());
	}

	if (typeof(coating)!='undefined') {
		jQuery('#p3d_coating_'+coating).attr('checked', 'checked');
		p3dSelectCoating(coating);
	}
	else if (jQuery('input[name=product_coating]').length>0) {
		jQuery('input[name=product_coating]').first().attr('checked', 'checked');
		p3dSelectCoating(jQuery('input[name=product_coating]').first().data('id') || jQuery('select[name=product_coating]').val());
	}

//	if (typeof(coating)!='undefined') {
//		jQuery('#p3d_coating_'+coating).attr('checked', 'checked');
//		p3dSelectCoating(jQuery('input[name=product_coating]').first().data('id') || jQuery('select[name=product_coating]').val())
//	}




	if (typeof(product_file)!='undefined') {
		jQuery('#pa_p3d_model').val(product_file);
	}
	if (typeof(product_unit)!='undefined') {
		jQuery("input[name=p3d_unit][value=" + product_unit + "]").attr('checked', 'checked');
		p3dSelectUnit(product_unit);
//		p3dSelectUnit(jQuery("input[name=p3d_unit][value=" + product_unit + "]"));
	}
	else {
//		p3dSelectUnit(jQuery("input[name=p3d_unit][value=mm]"));
		p3dSelectUnit('mm');
	}

	if (typeof(printer)!='undefined' && typeof(material)!='undefined' && typeof(product_file)!='undefined') {
		p3dGetStats();
	}
	else {
		p3dDisplayUserDefinedProgressBar(false);
		p3dDisplayQuoteLoading(false);
	}
	if (typeof (product_file) !='undefined' && product_file) {
		var model_type=product_file.split('.').pop().toLowerCase();
		p3dViewerInit(p3d.upload_url+encodeURIComponent(product_file), product_mtl, model_type, false);
	}
	else 
		p3dViewerInit('');
	//p3dAnimate();

}

function p3dMaterialDropdown(state) {
	if (!state.id) {
		return state.text;
	}
	var color = jQuery('#p3d_material_'+state.id).data('color');

	var tooltip_content_id = jQuery('#p3d_material_'+state.id).data('tooltip-content');
	var tooltip_content_description = jQuery(tooltip_content_id).find('.p3d-tooltip-description').html();
	var tooltip_content_photo = jQuery(tooltip_content_id).find('.p3d-tooltip-image').html();
	var tooltip_image_block = '';
	if (typeof(tooltip_content_description)=='undefined') {
		tooltip_content_description = '';
	}

	if (typeof(tooltip_content_photo)!=='undefined' && tooltip_content_photo.length>0) {
		tooltip_image_block = '<div class="p3d-dropdown-photo-sample">'+tooltip_content_photo+'</div>';
	}

	var res = jQuery('<div class="p3d-dropdown-searchable-wrap"><div style="background-color:'+color+';" class="p3d-color-sample"></div>'+tooltip_image_block+'<span>'+state.text+'</span><p class="p3d-dropdown-searchable-p"><small>'+tooltip_content_description+'</small></p></div>')
	return res;
}

function p3dPrinterDropdown(state) {
	if (!state.id) {
		return state.text;
	}

	var tooltip_content_id = jQuery('#p3d_printer_'+state.id).data('tooltip-content');
	var tooltip_content_description = jQuery(tooltip_content_id).find('.p3d-tooltip-description').html();
	var tooltip_content_photo = jQuery(tooltip_content_id).find('.p3d-tooltip-image').html();
	var tooltip_image_block = '';
	if (typeof(tooltip_content_description)=='undefined') {
		tooltip_content_description = '';
	}

	if (typeof(tooltip_content_photo)!=='undefined' && tooltip_content_photo.length>0) {
		tooltip_image_block = '<div class="p3d-dropdown-photo-sample">'+tooltip_content_photo+'</div>';
	}

	var res = jQuery('<div class="p3d-dropdown-searchable-wrap">'+tooltip_image_block+'<span>'+state.text+'</span><p class="p3d-dropdown-searchable-p"><small>'+tooltip_content_description+'</small></p></div>')
	return res;
}

function p3dCoatingDropdown(state) {
	if (!state.id) {
		return state.text;
	}
	var color = jQuery('#p3d_coating_'+state.id).data('color');

	var tooltip_content_id = jQuery('#p3d_coating_'+state.id).data('tooltip-content');
	var tooltip_content_description = jQuery(tooltip_content_id).find('.p3d-tooltip-description').html();
	var tooltip_content_photo = jQuery(tooltip_content_id).find('.p3d-tooltip-image').html();
	var tooltip_image_block = '';

	if (typeof(tooltip_content_description)=='undefined') {
		tooltip_content_description = '';
	}

	if (typeof(tooltip_content_photo)!=='undefined' && tooltip_content_photo.length>0) {
		tooltip_image_block = '<div class="p3d-dropdown-photo-sample">'+tooltip_content_photo+'</div>';
	}

	var res = jQuery('<div class="p3d-dropdown-searchable-wrap"><div style="background-color:'+color+';" class="p3d-color-sample"></div>'+tooltip_image_block+'<span>'+state.text+'</span><p class="p3d-dropdown-searchable-p"><small>'+tooltip_content_description+'</small></p></div>')
	return res;
}

function p3dInfillDropdown(state) {
	if (!state.id) {
		return state.text;
	}

	var tooltip_content_id = jQuery('#p3d_infill_'+state.id).data('tooltip-content');
	var tooltip_content_description = jQuery(tooltip_content_id).find('.p3d-tooltip-description').html();
	var tooltip_content_photo = jQuery(tooltip_content_id).find('.p3d-tooltip-image').html();
	var tooltip_image_block = '';
	if (typeof(tooltip_content_description)=='undefined') {
		tooltip_content_description = '';
	}
	if (typeof(tooltip_content_photo)!=='undefined' && tooltip_content_photo.length>0) {
		tooltip_image_block = '<div class="p3d-dropdown-photo-sample">'+tooltip_content_photo+'</div>';
	}

	var res = jQuery('<div class="p3d-dropdown-searchable-wrap">'+tooltip_image_block+'<span>'+state.text+'</span><p class="p3d-dropdown-searchable-p"><small>'+tooltip_content_description+'</small></p></div>')
	return res;
}

function p3dInitSelect2() {
	if (jQuery('.p3d-dropdown-searchable').length>0) {
		if (p3d.show_materials=='on') jQuery('select.p3d-dropdown-searchable[name="product_filament"]').select2({templateResult: p3dMaterialDropdown});
		if (p3d.show_printers=='on') jQuery('select.p3d-dropdown-searchable[name="product_printer"]').select2({templateResult: p3dPrinterDropdown});
		if (p3d.show_coatings=='on') jQuery('select.p3d-dropdown-searchable[name="product_coating"]').select2({templateResult: p3dCoatingDropdown});
		if (p3d.show_infills=='on') jQuery('select.p3d-dropdown-searchable[name="product_infill"]').select2({templateResult: p3dInfillDropdown}); 
	}
}


jQuery(document).ready(function(){

if (!document.getElementById('p3d-cv')) return;
if (!document.getElementById('p3d-container')) return;
jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();

//preload tooltip images
jQuery('.p3d-tooltip-image img').each(function(){
	jQuery('<img/>')[0].src = this.src;
});

if (p3d.adjust_position=='on') {
	jQuery('div.images').sticky2('div.product');
}

p3dInitSelect2();

if (p3d.multistep=='on') {
	if (p3d.multistep_short_description=='on') {
		jQuery("div.woocommerce-product-details__short-description").appendTo("#p3d-finalize");
	}

	jQuery("p.price").appendTo("#p3d-finalize");
	jQuery("#p3d-before-cart").appendTo("#p3d-finalize");
	jQuery("#p3d-quote-loading").appendTo("#p3d-finalize");
	jQuery("#add-cart-wrapper").appendTo("#p3d-finalize");
	jQuery("table.variations").appendTo("#p3d-finalize");
//	jQuery("#p3d-request-form").appendTo("#p3d-finalize"); //wtf? doesn't work
	var new_request_form = jQuery("#p3d-request-form").wrap('<p/>').parent().clone();
	jQuery("#p3d-request-form").remove();
	jQuery("#p3d-finalize").append(new_request_form.html());





}



//jQuery(window).resize(jQuery.debounce(250, p3dResizeJquerySteps));





jQuery("#rotation_x").bind('keyup mouseup', function () {
	p3dRotateModel('x', this.value);
});
jQuery("#rotation_y").bind('keyup mouseup', function () {
	p3dRotateModel('y', this.value);
});
jQuery("#rotation_z").bind('keyup mouseup', function () {
	p3dRotateModel('z', this.value);
});

jQuery("#scale_x").bind('keyup mouseup', function () {
	p3dUpdateDimensions(this);
});
jQuery("#scale_y").bind('keyup mouseup', function () {
	p3dUpdateDimensions(this);
});
jQuery("#scale_z").bind('keyup mouseup', function () {
	p3dUpdateDimensions(this);
});

p3dInit();

var is_fixed = jQuery('#p3d-viewer').data('fixed');
var drop_element = 'p3d-cv';
if (is_fixed==1) drop_element = '';

window.p3d_uploader = new plupload.Uploader({
	runtimes : 'html5,flash,silverlight,browserplus,gears,html4',
	browse_button : 'p3d-pickfiles', // you can pass an id...
	dragdrop: true,
	drop_element : drop_element,
	multi_selection: false,
	multiple_queues : false,
	max_file_count : 1,
	max_file_size: p3d.file_max_size+"mb",
	container: document.getElementById('p3d-container'), 
	url : p3d.url,
	chunk_size : p3d.file_chunk_size+'mb',
	flash_swf_url : p3d.plugin_url+'includes/ext/plupload/Moxie.swf',
	silverlight_xap_url : p3d.plugin_url+'includes/ext/plupload/Moxie.xap',
	filters : {
	mime_types: [
		{
			title : p3d.file_extensions+" files", 
			extensions : p3d.file_extensions
		}
	]
	},
	init: {
		QueueChanged: function(p3d_uploader) {
			if(p3d_uploader.files.length > 1)
			{
				jQuery('#p3d-filelist').html('');
				jQuery('#p3d-canvas-uploading-status').hide();	
				
				
				p3d_uploader.files.splice(0, 1);
			}
		},
		PostInit: function() {
			document.getElementById('p3d-filelist').innerHTML = '';
			document.getElementById('p3d-console').innerHTML = '';
			jQuery('#p3d-canvas-uploading-status').hide();
			

		},
		Browse: function () {

		},
		FilesAdded: function(up, files) {
			p3d.bar_progress = 0;
			p3d.analysed_volume = 0;
			p3d.analysed_surface_area = 0;
			p3d.triangulation_required = false;
			p3d.triangulated_volume = 0;
			p3d.triangulated_surface_area = 0;
			p3d.new_pricing = '';
			p3d.fatal_error = false;
			p3d.printer_error = false;
			p3d.mtl = '';


			if (p3d.multistep=='on' && p3d.multistep_model_step1=='on') {
				jQuery('#p3d-multistep div[data-acc-step]').removeClass('open');
				jQuery('#p3d-multistep div[data-acc-step]:first').addClass('open')
				jQuery('#p3d-multistep div[data-acc-content]').hide();
				jQuery('#p3d-multistep div[data-acc-content]:first').show();

			}

			if(p3d.xhr1 && p3d.xhr1.readyState != 4) {
				p3d.xhr1.abort();
				p3d.xhr1.readyState = 4;
			}

			if(p3d.xhr2 && p3d.xhr2.readyState != 4) {
				p3d.xhr2.abort();
				p3d.xhr2.readyState = 4;
			}

			if(p3d.xhr3 && p3d.xhr3.readyState != 4) {
				p3d.xhr3.abort();
				p3d.xhr3.readyState = 4;
			}

			if(p3d.xhr4 && p3d.xhr4.readyState != 4) {
				p3d.xhr4.abort();
				p3d.xhr4.readyState = 4;
			}


			if(p3d.process && p3d.process.readyState != 4) {
				p3d.process.abort();
			}

			jQuery.removeCookie("p3d_mtl");
			jQuery('.p3d-mail-success').hide();
			jQuery('.p3d-mail-error').hide();
			jQuery('#p3d-repair-status, #p3d-canvas-repair-status').hide();
			jQuery('#p3d-process-status, #p3d-canvas-process-status').hide();
			jQuery('#p3d-analyse-status, #p3d-canvas-analyse-status').hide();
			jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();
			

			
			if (p3d.show_upload_button=='on' && p3d.display_mode!='fullscreen') {
				jQuery('#p3d-model-message-upload').hide();
			}

			var file = files[0].getNative();
			var file_ext = file.name.split('.').pop().toLowerCase();
			var images = ['png', 'jpg', 'jpeg', 'gif', 'bmp'];
			jQuery('#pa_p3d_filename').val(file.name);
			jQuery.cookie('p3d_filename', file.name, { expires: p3d.cookie_expire });
			if (jQuery.inArray(file_ext, images)!=-1) {
				p3d.image_height = prompt(p3d.text_image_height, p3d.image_height);
				p3d.image_map = confirm(p3d.text_image_map) ? 1 : 0;
			}

			window.wp.hooks.doAction( '3dprint.filesAdded');
			if (p3d.filereader_supported) {
				if (jQuery.inArray(file_ext, p3d.files_to_convert)==-1 && !(p3d.api_reduce=='on' && (p3d.api_reduce_mobile_only!='on' || (p3d.api_reduce_mobile_only=='on' && jQuery.isMobile)) && (p3d.api_reduce_min_size*1048576 < file.size) )) {
					p3d.filereader_supported = true;
					var reader = new FileReader();
					reader.onload = function(event) {
						var chars  = new Uint8Array(event.target.result);
						var CHUNK_SIZE = 0x8000; 
						var index = 0;
						var length = chars.length;
						var result = '';
						var slice;
						while (index < length) {
							slice = chars.subarray(index, Math.min(index + CHUNK_SIZE, length)); 
							result += String.fromCharCode.apply(null, slice);
							index += CHUNK_SIZE;
						}


						window.wp.hooks.doAction( '3dprint.fileRead');

						p3dViewerInit(result, '', file_ext, true);

						
						p3dDisplayUserDefinedProgressBar(false);
	
						p3dChangeModelColor(p3dGetCurrentColor());

						p3dGetStats();

						p3dInitScaling();

            				}
            
					reader.readAsArrayBuffer(file);
				} //! (zip || image || reduce)
					else p3d.filereader_supported = false; //zip or image or reduce file
        		}
		        plupload.each(files, function(file) {
		        	document.getElementById('p3d-filelist').innerHTML += '<div id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ') <b></b></div>';
				jQuery('#p3d-canvas-uploading-status').show();
				
		        });
		        p3d_uploader.disableBrowse(true);
//		        jQuery('.p3d-stats').hide();

			if (p3d.filereader_supported) {
				p3dInitScaling();
			}
		        p3dDisplayPrice(false);
		        p3dDisplayAddToCart(false);
		        p3dDisplayConsole(false);
		        p3dDisplayUserDefinedProgressBar(true);
		        p3dDisplayQuoteLoading(true);


			if ((p3d.api_repair=='on' || p3d.api_optimize=='on'))
				jQuery('#p3d-repair-status, #p3d-canvas-repair-status').show();

			jQuery('#p3d-model-message-arrange').hide();


		        up.start();
			p3d.uploading = true;
			if(p3d.xhr3 && p3d.xhr3.readyState != 4) {
				p3d.xhr3.abort();
			}
			jQuery('#p3d-canvas-repair-status').hide()
			p3dDisplayQuoteLoading(true);
		        jQuery('#p3d-pickfiles').click();
		},



		UploadProgress: function(up, file) {
			p3d.bar_progress=parseFloat(file.percent/100);
			document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = '<span>' + file.percent + "%</span>";
		},

		UploadComplete: function(up, file, response) {

			p3d.uploading = false;
			//p3dDisplayQuoteLoading(false);
			p3d_uploader.disableBrowse(false);
			jQuery('#p3d-canvas-uploading-status').hide();
			
		},

		Error: function(up, err) {
			p3d.uploading = false;
			p3d_uploader.disableBrowse(false);
			jQuery('#p3d-canvas-uploading-status').hide();
			
			//p3dDisplayQuoteLoading(false);
			document.getElementById('p3d-console').appendChild(document.createTextNode("\nError #" + err.code + ": " + err.message));
			window.p3dProgressButton._stop();
			p3dDisplayConsole(true);
		}
	}
});

p3d_uploader.bind('BeforeUpload', function (up, file) {
	up.settings.multipart_params = {
		"action" : 'p3d_handle_upload',
		"quote_attributes" : jQuery('.woo_attribute').serialize(),
		"product_id" : jQuery('#p3d_product_id').val(),
		"printer_id" : jQuery('input[name=product_printer]:checked').data('id'),
		"material_id" : jQuery('input[name=product_filament]:checked').data('id'),
		"coating_id" : jQuery('input[name=product_coating]:checked').data('id'),
		"unit" : jQuery('input[name=p3d_unit]:checked').val(),
		"image_height" : p3d.image_height,
		"image_map" : p3d.image_map
	}
	window.wp.hooks.doAction( '3dprint.beforeUpload');
	});

p3d_uploader.init();

p3d_uploader.bind('FileUploaded', function(p3d_uploader,file,response) {
	p3d.uploading = false;
	p3d.fatal_error = false;
	p3d.packed = 0;
	jQuery('#checkout-add-to-cart').val(p3d.product_id);

	jQuery('#p3d-canvas-uploading-status').hide();
	if (p3d.pricing=='checkout' && p3d.new_pricing!='request') {
		p3dDisplayRequestForm(false);
	}
	else if (p3d.pricing=='request' || p3d.pricing=='request_estimate' || p3d.new_pricing=='request') {
		p3dDisplayRequestForm(true);
	}

	p3dEnableControls();

	var data = jQuery.parseJSON( response.response );

	jQuery('p.price span.amount').html('&nbsp;');
	if (typeof(data.error)!=='undefined') { //fatal error
		p3d.fatal_error = true; 
		jQuery('#p3d-console').html(data.error.message).show();
		p3dDisplayUserDefinedProgressBar(false);
		p3dDisplayQuoteLoading(false);
		return false;
  	}

	p3dDisplayQuoteLoading(false);
        p3dDisplayAddToCart(true);
	jQuery('.p3d-mail-success').remove();
	jQuery('.p3d-mail-error').remove();

	if (!p3d.filereader_supported) {
		p3dDisplayUserDefinedProgressBar(true);
		p3dDisplayQuoteLoading(true);
		var model_type=data.filename.split('.').pop().toLowerCase();
		var mtl='';
		var printer_full_color = jQuery('input[name=product_printer]:checked').data('full_color');
//
//		if (printer_full_color=='1' && typeof(data.material)!=='undefined' && data.material.length>0) {
		if (typeof(data.material)!=='undefined') {
			mtl = data.material;
			p3d.mtl=mtl;
			jQuery.cookie('p3d_mtl', mtl, { expires: p3d.cookie_expire });
		}
		if (typeof(data.failed_files_count)!=='undefined' && parseInt(data.failed_files_count)>0) {

			jQuery('#p3d-failed-files-count').html(data.failed_files_count);
			jQuery('#p3d-model-message-arrange').show();
			if (p3d.pricing_arrange=='request') p3d.fatal_error=1;
			p3dNewPricing('', p3d.pricing_arrange);
		}

		if (typeof(data.packed)!=='undefined' && parseInt(data.packed)>0) {
			p3d.packed=1;
		}




//		}
//		else {
//			jQuery.removeCookie("p3d_mtl");
//		}
		p3dViewerInit(p3d.upload_url+encodeURIComponent(data.filename), mtl, model_type, false); 
	}

	p3dShowResponse(data);

	jQuery.cookie('p3d_file',data.filename, { expires: p3d.cookie_expire });
	jQuery.cookie('p3d_file_original',data.filename_original, { expires: p3d.cookie_expire });
	jQuery('#p3d-file-original').val(data.filename_original);

	product_file=data.filename;
	jQuery('#pa_p3d_model').val(product_file);
	p3dDisplayStats(true)
	p3dGetStats();

	var x_dim=parseFloat(jQuery('#stats-length').html());
	var y_dim=parseFloat(jQuery('#stats-width').html());
	var z_dim=parseFloat(jQuery('#stats-height').html());

	var printer_width=parseFloat(jQuery('input:radio[name=product_printer]:checked').attr('data-width'));
	var printer_length=parseFloat(jQuery('input:radio[name=product_printer]:checked').attr('data-length'));
	var printer_height=parseFloat(jQuery('input:radio[name=product_printer]:checked').attr('data-height'));

	if (!p3dBoxFitsBox(x_dim*10, y_dim*10, z_dim*10, printer_width, printer_length, printer_height)) {
	        p3dInitScaling();
	}


	if (p3dCheckPrintability()) {
//		if (!p3d.uploading && !p3d.checking && !((p3d.xhr1 && p3d.xhr1.readyState != 4) || (p3d.xhr2 && p3d.xhr2.readyState != 4))) {
			p3dDisplayPrice(true);
			p3dDisplayAddToCart(true);
//		}
	}

	p3dRepairModel (data.filename);
	p3dAnalyseModel (data.filename);



	window.wp.hooks.doAction( '3dprint.fileUploaded');
});





jQuery("#p3d-model-message-upload").click(function() { 
	jQuery('div.moxie-shim input[type=file]').trigger('click');
});

if (p3d.use_ninjaforms=='on' && typeof(Marionette)!=='undefined') {
	var p3dController = Marionette.Object.extend({
		initialize: function(formID) {
			
			Backbone.Radio.channel( 'form-' + formID ).reply( 'maybe:submit', this.beforeSubmit, this, formID );
		},
		beforeSubmit: function( formID ) {

			p3dPrepareNinjaForm();
			return true;
		}
	});

	new p3dController(p3d.ninjaforms_form_id); 
}

});

function p3dSubmitForm() {
		var qty = parseInt(jQuery('#p3d-qty').val());
		jQuery('form.variations_form.cart input.qty').val(qty);
		jQuery('form.variations_form.cart').submit();
}

function p3dBindSubmit() {
	jQuery( "form.variations_form" ).on( "submit", function(e) {

		//get resize scale
		jQuery('#p3d-resize-scale').val(p3d.resize_scale);

		var model_dim = new Array();	
		model_dim.x = p3d.boundingBox.max.x - p3d.boundingBox.min.x;
		model_dim.y = p3d.boundingBox.max.y - p3d.boundingBox.min.y;
		model_dim.z = p3d.boundingBox.max.z - p3d.boundingBox.min.z;

		jQuery('#p3d-dim-x').val(((model_dim.y*p3d.resize_scale*p3dGetUnitMultiplier())/10).toFixed(2));
		jQuery('#p3d-dim-y').val(((model_dim.x*p3d.resize_scale*p3dGetUnitMultiplier())/10).toFixed(2));
		jQuery('#p3d-dim-z').val(((model_dim.z*p3d.resize_scale*p3dGetUnitMultiplier())/10).toFixed(2));


		//screenshot of the current product
		jQuery('#p3d-thumb').val(window.p3d_canvas.toDataURL().replace('data:image/png;base64,',''));
		if (jQuery.cookie('p3d_file_original')) jQuery('#p3d-file-original').val(jQuery.cookie('p3d_file_original'));


		window.wp.hooks.doAction( '3dprint.productScreenshot');
		return true;
	})
}

//p3dProcessModel(jQuery('#pa_p3d_model').val())
function p3dProcessModel (filename) {

	if (typeof(filename)=='undefined' || filename.length==0) return;
	clearInterval(p3d.refresh_interval_process);
	p3d.processing = true;
	//p3dDisplayUserDefinedProgressBar(true);

	var rotation_x = jQuery('#rotation_x').val();
	var rotation_y = jQuery('#rotation_y').val();
	var rotation_z = jQuery('#rotation_z').val();

//	var scale_x = jQuery('#scale_x').val();
//	var scale_y = jQuery('#scale_y').val();
//	var scale_z = jQuery('#scale_z').val();

	var file_ext = filename.split('.').pop().toLowerCase();
	jQuery('#p3d-analyse-status, #p3d-canvas-analyse-status').hide();

	if(p3d.xhr1 && p3d.xhr1.readyState != 4) {
		p3d.xhr1.abort();
		jQuery('#p3d-analyse-status, #p3d-canvas-analyse-status').hide();
		jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();
		jQuery('#stats-material-volume, #stats-weight').show();
	}

	if(p3d.xhr2 && p3d.xhr2.readyState != 4) {
		p3d.xhr2.abort();
		p3d.xhr2.readyState = 4;
		jQuery('#p3d-analyse-status, #p3d-canvas-analyse-status').hide();
		jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();
		jQuery('#stats-material-volume, #stats-weight').show();
	}

	if((p3d.xhr3 && p3d.xhr3.readyState != 4) || (p3d.xhr4 && p3d.xhr4.readyState != 4)) {
		p3d.xhr3.abort();
		p3d.xhr4.abort();
		jQuery('#p3d-repair-status, #p3d-canvas-repair-status').hide();
		jQuery('#p3d-repair-image').hide();
		jQuery('#p3d-canvas-repair-image').hide();
	}



	if(p3d.process && p3d.process.readyState != 4) {
		p3d.process.abort();
	}

	jQuery('#p3d-process-status, #p3d-canvas-process-status').show();
	jQuery('#p3d-process-message').html(p3d.text_processing_model);
	jQuery('#p3d-canvas-process-message').html(p3d.text_processing_model);
	jQuery('#p3d-process-image').show();
	jQuery('#p3d-canvas-process-image').show();

	p3dDisableControls();

        p3dDisplayAddToCart(false);
	p3dDisplayPrice(false);
        p3dDisplayQuoteLoading(true);

	p3d.process=jQuery.ajax({
		method: "POST",
		type: "POST",
		url: p3d.url,
		data: { 
			action: "p3d_handle_process", 
			rotation_x: rotation_x,
			rotation_y: rotation_y,
			rotation_z: rotation_z,
			scale_x: p3d.resize_scale_x,
			scale_y: p3d.resize_scale_y,
			scale_z: p3d.resize_scale_z,
			filename: filename,
			product_id: p3d.product_id
		      }
		})
		.done(function( msg ) {
			var data = jQuery.parseJSON( msg );


			if (data.status=='0' || typeof(data.error)!=='undefined') {
				jQuery('#p3d-process-message').html(p3d.text_processing_model_failed);
				jQuery('#p3d-canvas-message').html(p3d.text_processing_model_failed);
				if (typeof(data.error)!=='undefined') {
					jQuery('#p3d-process-message').html(p3d.text_processing_model_failed + ' : ' + data.error.message);
					jQuery('#p3d-canvas-process-message').html(p3d.text_processing_model_failed + ' : ' + data.error.message);
					jQuery('#p3d-process-image').hide();
					jQuery('#p3d-canvas-process-image').hide();
					p3dDisplayUserDefinedProgressBar(false);
					p3dDisplayQuoteLoading(false);

				}
//				if (p3d.pricing_irprocessable=='request') p3d.fatal_error=1;
//                                p3dNewPricing(filename, p3d.pricing_irprocessable);
			}
			else if (data.status=='2') {

				var server = data.server;
				p3d.processing = true;

				p3d.refresh_interval_process = setInterval(function(){
				    p3dProcessCheck(filename, server); 
				}, 3000);
			
			}

		});
	
}

function p3dProcessCheck (filename, server) {

	if(p3d.xhr_process_check && p3d.xhr_process_check.readyState != 4) {
		return;
	}

	if(p3d.xhr1 && p3d.xhr1.readyState != 4) {
		p3d.xhr1.abort();
		jQuery('#p3d-analyse-status, #p3d-canvas-analyse-status').hide();
		jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();
		jQuery('#stats-material-volume, #stats-weight').show();
	}

	if(p3d.xhr2 && p3d.xhr2.readyState != 4) {
		p3d.xhr2.abort();
		p3d.xhr2.readyState = 4;
		jQuery('#p3d-analyse-status, #p3d-canvas-analyse-status').hide();
		jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();
		jQuery('#stats-material-volume, #stats-weight').show();
	}

	if((p3d.xhr3 && p3d.xhr3.readyState != 4) || (p3d.xhr4 && p3d.xhr4.readyState != 4)) {
		p3d.xhr3.abort();
		p3d.xhr4.abort();
		jQuery('#p3d-repair-status, #p3d-canvas-repair-status').hide();
		jQuery('#p3d-repair-image').hide();
		jQuery('#p3d-canvas-repair-image').hide();
	}

	var rotation_x = jQuery('#rotation_x').val();
	var rotation_y = jQuery('#rotation_y').val();
	var rotation_z = jQuery('#rotation_z').val();


	p3d.xhr_process_check=jQuery.ajax({
		method: "POST",
		type: "POST",
		url: p3d.url,
		data: { 
			action: "p3d_handle_process_check", 
			server: server,
			rotation_x: rotation_x,
			rotation_y: rotation_y,
			rotation_z: rotation_z,
			scale_x: p3d.resize_scale_x,
			scale_y: p3d.resize_scale_y,
			scale_z: p3d.resize_scale_z,
			filename: filename,
			product_id: p3d.product_id
		      }
		})
		.done(function( msg ) {
			var data = jQuery.parseJSON( msg );



			if (data.status=='1') {
				p3d.processing = false;
				clearInterval(p3d.refresh_interval_process);
				var data = jQuery.parseJSON( msg );
				jQuery('#p3d-process-image').hide();
				jQuery('#p3d-canvas-process-image').hide();
				p3dEnableControls();


				if (p3d.api_analyse!='on') {
				        p3dDisplayPrice(true);
				        p3dDisplayAddToCart(true);
				        p3dDisplayQuoteLoading(false);
				}
	
				if (typeof(data.filename)!=='undefined' && data.filename.length>0) {

					var model_type=data.filename.split('.').pop().toLowerCase();
					var mtl='';
					if (!p3d.mtl || p3d.mtl.length==0) { //don't load the model if we have textures
						p3dViewerInit(p3d.upload_url+encodeURIComponent(data.filename), mtl, model_type, false);
						jQuery.cookie('p3d_file',data.filename, { expires: p3d.cookie_expire });
						jQuery('#pa_p3d_model').val(data.filename);
					}

					jQuery('#p3d-process-message').html(p3d.text_processing_model_done);
					jQuery('#p3d-canvas-process-message').html(p3d.text_processing_model_done);


					p3dAnalyseModel (data.filename);
				}
	
				else {//something went wrong
					jQuery('#p3d-process-message').hide();
					jQuery('#p3d-canvas-process-message').hide();
					p3dDisplayUserDefinedProgressBar(false);
//					if (p3d.pricing_irprocessable=='request') p3d.fatal_error=1;
//	                                p3dNewPricing(filename, p3d.pricing_irprocessable);
				}
				p3dDisplayUserDefinedProgressBar(false);

			}
			else if (data.status=='0') {
				p3d.processing = false;
				clearInterval(p3d.refresh_interval_process);
				jQuery('#p3d-process-message').html(p3d.text_processing_model_failed);
				jQuery('#p3d-canvas-message').html(p3d.text_processing_model_failed);
				if (typeof(data.error)!=='undefined') { 
					jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();
					jQuery('#p3d-process-message').html(p3d.text_processing_model_failed + ' : ' + data.error.message);
					jQuery('#p3d-canvas-process-message').html(p3d.text_processing_model_failed + ' : ' + data.error.message);
					p3dDisplayUserDefinedProgressBar(false);
				}
//				if (p3d.pricing_irprocessable=='request') p3d.fatal_error=1;
//                                p3dNewPricing(filename, p3d.pricing_irprocessable);

			}
			else if (typeof(data.error)!=='undefined') {
				p3d.processing = false;
				clearInterval(p3d.refresh_interval_process);
				p3d.process_error = true;
				jQuery('#p3d-console').html(data.error.message).show();
				p3dDisplayQuoteLoading(false);
			        p3dDisplayAddToCart(true);
				jQuery('#p3d-process-status, #p3d-canvas-process-status').hide();
				jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();
				p3dDisplayUserDefinedProgressBar(false);
//				if (p3d.pricing_irprocessable=='request') p3d.fatal_error=1;
//                                p3dNewPricing(filename, p3d.pricing_irprocessable);


	
				return false;
	
			}

		});

/*


			else 
*/
}





function p3dRepairModel (filename) {

	if (p3d.api_repair!='on' && p3d.api_optimize!='on') return;
	if (p3d.api_pack=='on' && p3d.packed>0) {
		jQuery('#p3d-repair-status, #p3d-canvas-repair-status').hide();
		return; //pack has it's own repair system
	}
	if (p3d.processing) return;

	if (typeof(filename)=='undefined' || filename.length==0) return;
	clearInterval(p3d.refresh_interval_repair);
	p3d.repairing = true;
	//p3dDisplayUserDefinedProgressBar(true);

	var printer_id = jQuery('input[name=product_printer]:checked').data('id');

	var file_ext = filename.split('.').pop().toLowerCase();

	if(p3d.xhr1 && p3d.xhr1.readyState != 4) {
		p3d.xhr1.abort();
		jQuery('#p3d-analyse-status, #p3d-canvas-analyse-status').hide();
		jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();
		jQuery('#stats-material-volume, #stats-weight').show();
	}

	if(p3d.xhr2 && p3d.xhr2.readyState != 4) {
		p3d.xhr2.abort();
		p3d.xhr2.readyState = 4;
		jQuery('#p3d-analyse-status, #p3d-canvas-analyse-status').hide();
		jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();
		jQuery('#stats-material-volume, #stats-weight').show();
	}
	if(p3d.xhr3 && p3d.xhr3.readyState != 4) {
		p3d.xhr3.abort();
	}

	jQuery('#p3d-repair-status, #p3d-canvas-repair-status').show();
	jQuery('#p3d-repair-message').html(p3d.text_repairing_model);
	jQuery('#p3d-canvas-repair-message').html(p3d.text_repairing_model);
	jQuery('#p3d-repair-image').show();
	jQuery('#p3d-canvas-repair-image').show();

	p3dDisableControls();

        p3dDisplayAddToCart(false);
	p3dDisplayPrice(false);
        p3dDisplayQuoteLoading(true);

	p3d.xhr3=jQuery.ajax({
		method: "POST",
		type: "POST",
		url: p3d.url,
		data: { 
			action: "p3d_handle_repair", 
			repair: p3d.api_repair, 
			printer_id: printer_id,
			product_id: p3d.product_id,
			optimize: p3d.api_optimize, 
			filename: filename 
		      }
		})
		.done(function( msg ) {
			var data = jQuery.parseJSON( msg );
			if (data.status=='0') {
				jQuery('#p3d-repair-message').html(p3d.text_model_repair_failed);
				jQuery('#p3d-canvas-message').html(p3d.text_model_repair_failed);
				if (typeof(data.error)!=='undefined') { 
					jQuery('#p3d-repair-message').html(p3d.text_model_repair_failed + ' : ' + data.error.message);
					jQuery('#p3d-canvas-repair-message').html(p3d.text_model_repair_failed + ' : ' + data.error.message);
				}
				if (p3d.pricing_irrepairable=='request') p3d.fatal_error=1;
                                p3dNewPricing(filename, p3d.pricing_irrepairable);
			}
			else if (data.status=='2') {

				var server = data.server;
				p3d.repairing = true;

				p3d.refresh_interval_repair = setInterval(function(){
				    p3dRepairCheck(filename, server); 
				}, 3000);
			
			}
			else if (typeof(data.error)!=='undefined') {

				p3d.repairing = false;
				clearInterval(p3d.refresh_interval_repair);
				p3d.repair_error = true;
				jQuery('#p3d-console').html(data.error.message).show();
				p3dDisplayQuoteLoading(false);
			        p3dDisplayAddToCart(true);
				jQuery('#p3d-repair-status, #p3d-canvas-repair-status').hide();
				jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();
				p3dDisplayUserDefinedProgressBar(false);
				//if (p3d.pricing_irrepairable=='request') p3d.fatal_error=1;
                                //p3dNewPricing(filename, p3d.pricing_irrepairable);


	
				return false;
	
			}
		});
	
}

function p3dRepairCheck (filename, server) {

	if(p3d.xhr4 && p3d.xhr4.readyState != 4) {
		return;
	}

	var printer_type = jQuery('input[name=product_printer]:checked').data('type')

	p3d.xhr4=jQuery.ajax({
		method: "POST",
		type: "POST",
		url: p3d.url,
		data: { 
			action: "p3d_handle_repair_check", 
			repair: p3d.api_repair, 
			optimize: p3d.api_optimize, 
			printer_type: printer_type,
			product_id: p3d.product_id,
			server: server,
			filename: filename 
		      }
		})
		.done(function( msg ) {
			var data = jQuery.parseJSON( msg );


			if (data.status=='1') {
				p3d.repairing = false;
				clearInterval(p3d.refresh_interval_repair);
				var data = jQuery.parseJSON( msg );
				jQuery('#p3d-repair-image').hide();
				jQuery('#p3d-canvas-repair-image').hide();
				p3dEnableControls();


				if (p3d.api_analyse!='on') {
				        p3dDisplayPrice(true);
				        p3dDisplayAddToCart(true);
				        p3dDisplayQuoteLoading(false);
				}
	
				if (typeof(data.filename)!=='undefined' && data.filename.length>0) {
                                        p3d.new_pricing='';
					var model_type=data.filename.split('.').pop().toLowerCase();
					var mtl='';
					if (!p3d.mtl || p3d.mtl.length==0) { //don't load the model if we have textures
						p3dViewerInit(p3d.upload_url_default+encodeURIComponent(data.filename), mtl, model_type, false);
						jQuery.cookie('p3d_file',data.filename, { expires: p3d.cookie_expire });
						jQuery('#pa_p3d_model').val(data.filename);
					}

					jQuery('#p3d-repair-message').html(p3d.text_model_repaired);
					
					if (p3d.api_repair=='on' && data.needed_repair=='yes') {
						var model_errors = '<table class="p3d-model-errors">' + 
							'<tr><td>'+p3d.text_model_repair_degenerate_facets+'</td><td>'+data.degenerate_facets+'</td></tr>' + 
							'<tr><td>'+p3d.text_model_repair_edges_fixed+'</td><td>'+data.edges_fixed+'</td></tr>' + 
							'<tr><td>'+p3d.text_model_repair_facets_removed+'</td><td>'+data.facets_removed+'</td></tr>' + 
							'<tr><td>'+p3d.text_model_repair_facets_added+'</td><td>'+data.facets_added+'</td></tr>' + 
							'<tr><td>'+p3d.text_model_repair_facets_reversed+'</td><td>'+data.facets_reversed+'</td></tr>' + 
							'<tr><td>'+p3d.text_model_repair_backwards_edges+'</td><td>'+data.backwards_edges+'</td></tr>' + 
							'</table>';
						jQuery('#p3d-repair-message').html('<b>'+p3d.text_model_repair_report +'</b>'+ model_errors);
						p3d.triangulation_required = false; //slic3r produces only triangles
					}
					if (p3d.api_repair=='on' && data.needed_repair=='no') {
						jQuery('#p3d-repair-message').html(p3d.text_model_no_repair_needed);
						jQuery('#p3d-canvas-repair-message').html(p3d.text_model_no_repair_needed);

						p3dAnalyseModel(filename); 
						return;
					}

					jQuery('#p3d-canvas-repair-message').html(p3d.text_model_repaired);
					p3dAnalyseModel (data.filename);
				}
	
		
				else if (data.needed_repair=='no') { 
                                        p3d.new_pricing='';
					jQuery('#p3d-repair-message').html(p3d.text_model_no_repair_needed);
					jQuery('#p3d-canvas-repair-message').html(p3d.text_model_no_repair_needed);
					p3dAnalyseModel(filename); 
	
				} else {//something went wrong
					jQuery('#p3d-repair-message').hide();
					jQuery('#p3d-canvas-repair-message').hide();
					p3dDisplayUserDefinedProgressBar(false);
					if (p3d.pricing_irrepairable=='request') p3d.fatal_error=1;
	                                p3dNewPricing(filename, p3d.pricing_irrepairable);
				}
				p3dDisplayUserDefinedProgressBar(false);

			}
			else if (data.status=='0') {
				p3d.repairing = false;
				clearInterval(p3d.refresh_interval_repair);
				jQuery('#p3d-repair-message').html(p3d.text_model_repair_failed);
				jQuery('#p3d-canvas-message').html(p3d.text_model_repair_failed);
				if (typeof(data.error)!=='undefined') { 
					jQuery('#p3d-repair-message').html(p3d.text_model_repair_failed + ' : ' + data.error.message);
					jQuery('#p3d-canvas-repair-message').html(p3d.text_model_repair_failed + ' : ' + data.error.message);
					p3dDisplayUserDefinedProgressBar(false);
				}
				if (p3d.pricing_irrepairable=='request') p3d.fatal_error=1;
                                p3dNewPricing(filename, p3d.pricing_irrepairable);

			}
			else if (typeof(data.error)!=='undefined') {

				p3d.repairing = false;
				clearInterval(p3d.refresh_interval_repair);
				p3d.repair_error = true;
				jQuery('#p3d-console').html(data.error.message).show();
				p3dDisplayQuoteLoading(false);
			        p3dDisplayAddToCart(true);
				jQuery('#p3d-repair-status, #p3d-canvas-repair-status').hide();
				jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();
				p3dDisplayUserDefinedProgressBar(false);
				if (p3d.pricing_irrepairable=='request') p3d.fatal_error=1;
                                p3dNewPricing(filename, p3d.pricing_irrepairable);


	
				return false;
	
			}


		});

/*


			else 
*/
}

function p3dEnableControls() {
	var p3dRangeSlider = document.getElementById('p3d-scale'); 
	if (typeof(p3dRangeSlider)!=='undefined' && p3dRangeSlider.noUiSlider) {
		p3dRangeSlider.removeAttribute('disabled');
	}
	jQuery('.p3d-dim-input').prop('disabled', false);
	jQuery('#p3d-apply-button').prop('disabled', false);
	jQuery('#unit_mm, #unit_inch').prop('disabled', false);
	jQuery('#p3d-unlocked-image, #p3d-locked-image').prop('disabled', false);
}

function p3dDisableControls() {
	var p3dRangeSlider = document.getElementById('p3d-scale'); 
	if (typeof(p3dRangeSlider)!=='undefined' && p3dRangeSlider.noUiSlider) {
		p3dRangeSlider.setAttribute('disabled', true);
	}
	jQuery('.p3d-dim-input').prop('disabled', true);
	jQuery('#p3d-apply-button').prop('disabled', true);
	jQuery('#unit_mm, #unit_inch').prop('disabled', true);
	jQuery('#p3d-unlocked-image, #p3d-locked-image').prop('disabled', true);
}

function p3dAnalyseModel (filename) {

	var printer_type = jQuery('input[name=product_printer]:checked').data('type')
	var infill = jQuery('input[name=product_infill]:checked').data('id');



	if (p3d.file_url && p3d.file_url.length>0 && p3d.product_price_type && p3d.product_price_type=='fixed') {
		return;
	}

	if (p3d.new_pricing == 'request' || p3d.new_pricing == 'request_estimate') {
		return;
	}

	if (p3d.processing) {
		return;
	}
	clearInterval(p3d.refresh_interval);	
	clearInterval(p3d.refresh_interval1);	
	p3d.refresh_interval1_running = false;

	if(p3d.xhr1 && p3d.xhr1.readyState != 4) {
		p3d.xhr1.abort();
		//jQuery('#p3d-repair-status, #p3d-canvas-repair-status').hide();
	}
	if(p3d.xhr2 && p3d.xhr2.readyState != 4) {
		p3d.xhr2.abort();
		p3d.xhr2.readyState = 4;
		jQuery('#p3d-analyse-status, #p3d-canvas-analyse-status').hide();
		jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();
	}
            

	if (p3d.api_analyse!='on' && !p3d.triangulation_required) return;


	if (p3d.uploading || p3d.repairing) return;

	if (typeof(printer_type)!=='undefined' && printer_type != 'fff' && printer_type != 'dlp' && !p3d.triangulation_required) {
		p3d.checking = false;
		p3d.analyse_error = false;

	        p3dDisplayQuoteLoading(false);
		if (p3d.pricing=='checkout' && p3d.new_pricing!='request') {
			p3dDisplayAddToCart(true);
	                p3dDisplayPrice(true);
		}
		if (p3d.pricing!='checkout' || p3d.new_pricing=='request') {
			p3dDisplayRequestForm(true);
		}

		jQuery('#stats-material-volume, #stats-weight, #stats-hours').show();
		jQuery('#p3d-analyse-status, #p3d-canvas-analyse-status, #stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();
		p3dGetStats();
		clearInterval(p3d.refresh_interval);
		return;
	}

	if (typeof(filename)=='undefined' || filename.length==0) return;


	p3d.analyse_error = false;	      


	if  (p3d.pricing=='checkout') {
		jQuery('#p3d-console').html('').hide(); 
		jQuery('#add-cart-wrapper .variations_button').show();
	}


	if  (p3d.pricing=='checkout') {
	        p3dDisplayAddToCart(false);
	        p3dDisplayQuoteLoading(true);
	}

	p3dDisplayPrice(false);



	var printer_id = jQuery('input[name=product_printer]:checked').data('id');
       	var material_id = jQuery('input[name=product_filament]:checked').data('id');

	var unit = jQuery('#pa_p3d_unit').val();

	if (!p3d.triangulation_required) {
		//if (typeof(infill) == 'undefined' && typeof(layer_height) == 'undefined') return false;
	}

	jQuery('#p3d-analyse-status, #p3d-canvas-analyse-status').show();
	jQuery('#p3d-analyse-message').html(p3d.text_analysing_model);
	jQuery('#p3d-analyse-image').show().css('display', 'inline-block');
	jQuery('#p3d-analyse-percent').html('1%');
	jQuery('#p3d-canvas-analyse-status').show();
	jQuery('#p3d-canvas-analyse-message').html(p3d.text_analysing_model);
	jQuery('#p3d-canvas-analyse-image').show().css('display', 'inline-block');
	jQuery('#p3d-canvas-analyse-percent').html('1%');



	jQuery('#stats-material-volume, #stats-weight, #stats-hours').hide();
	jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').show();

	if  (p3d.pricing=='checkout') {

	        p3dDisplayAddToCart(false);
	        p3dDisplayQuoteLoading(true);
	}

        p3dDisplayPrice(false);

	p3d.xhr1=jQuery.ajax({
		method: "POST",
		type: "POST",
		url: p3d.url,
		data: { action: "p3d_handle_analyse", 
			product_id: p3d.product_id,
			printer_id: printer_id,
			material_id: material_id,
			filename: filename, 
			infill: infill,
			scale: p3d.resize_scale,
			unit: unit,
			triangulation: p3d.triangulation_required,
			api_analyse: p3d.api_analyse
		      }
		})
		.done(function( msg ) {
			var data = jQuery.parseJSON( msg );
			
			if (typeof(data.error)!=='undefined') {
				p3d.analyse_error = true;
				jQuery('#p3d-console').html(data.error.message).show();
				p3dDisplayQuoteLoading(false);

				//jQuery('#p3d-repair-status, #p3d-canvas-repair-status').hide();
				jQuery('#p3d-analyse-status, #p3d-canvas-analyse-status').hide();
				jQuery('#p3d-canvas-analyse-status').hide();

				jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();
				if (p3d.pricing_api_expired=='request') p3d.fatal_error=1;
				p3dNewPricing('', p3d.pricing_api_expired);
				return false;

			}

			if (data.status == '2') { //in progress
				var server = data.server;
				p3d.checking = true;
			        p3dDisplayPrice(false);
				if (p3d.pricing=='checkout') {
				        p3dDisplayAddToCart(false);
				        p3dDisplayQuoteLoading(true);
				}

				jQuery('#p3d-analyse-percent').html('10%');
				jQuery('#p3d-canvas-analyse-percent').html('10%');
				p3d.refresh_interval = setInterval(function(){
				    p3danalyseCheck(filename, server); 
				}, 3000);
				
			}
			else if (data.status == '1') { //success, currently happens only for triangulation process
				p3d.checking = false;
				p3d.analyse_error = false;

				jQuery('#stats-material-volume').html((data.material_volume/1000).toFixed(2));
//				window.model_total_volume = data.material_volume;
				p3d.triangulated_volume = data.material_volume;
				p3d.triangulated_surface_area = data.surface_area;
				//todo: p3d.triangulated_volume
				jQuery('#p3d-analyse-status, #p3d-canvas-analyse-status').show();
				jQuery('#p3d-analyse-message').html(p3d.text_model_analysed);
				jQuery('#p3d-analyse-image').hide();
				jQuery('#p3d-canvas-analyse-status').show();
				jQuery('#p3d-canvas-analyse-message').html(p3d.text_model_analysed);
				jQuery('#p3d-canvas-analyse-image').hide();

				p3dDisplayAddToCart(false);
			        p3dDisplayQuoteLoading(false);

			        p3dDisplayPrice(true);
				jQuery('#stats-material-volume, #stats-weight, #stats-hours').show();
				jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();
				jQuery('#p3d-analyse-percent').html('100%');
				jQuery('#p3d-canvas-analyse-percent').html('100%');
				p3d.triangulation_required = false;
				p3dGetStats();
				clearInterval(p3d.refresh_interval);

			}

			else if (data.status == '0') { //failed
				jQuery('#p3d-repair-message').html(p3d.text_model_analyse_failed);
				p3d.analyse_error = true;

				if (typeof(data.error)!=='undefined') { 
					jQuery('#p3d-repair-message').html(p3d.text_model_analyse_failed + ' : ' + data.error.message);
				}
				if (p3d.pricing_api_expired=='request') p3d.fatal_error=1;
				p3dNewPricing('', p3d.pricing_api_expired);
			}

		});
	
}

function p3danalyseCheck(filename, server) {

	if (p3d.file_url && p3d.file_url.length>0 && p3d.product_price_type && p3d.product_price_type=='fixed') {
		return;
	}

	if(p3d.xhr2 && p3d.xhr2.readyState != 4) {
		return;
	}
	if (p3d.processing) {
		return;
	}
       	var printer_id = jQuery('input[name=product_printer]:checked').data('id');
       	var material_id = jQuery('input[name=product_filament]:checked').data('id');
	var printer_type = jQuery('input[name=product_printer]:checked').data('type');
	var infill = jQuery('input[name=product_infill]:checked').data('id');
	var unit = jQuery('#pa_p3d_unit').val();

	if  (p3d.pricing == 'checkout') {
	        p3dDisplayAddToCart(false);
	        p3dDisplayQuoteLoading(true);
	}

        p3dDisplayPrice(false);

	p3d.xhr2=jQuery.ajax({
		method: "POST",
		type: "POST",
		url: p3d.url,
		data: { action: "p3d_handle_analyse_check", 
			product_id: p3d.product_id,
			printer_id: printer_id,
			material_id: material_id,
			filename: filename, 
			server: server,
			infill: infill,
			scale: p3d.resize_scale,
			unit: unit,
			triangulation: p3d.triangulation_required
		      }
		})
		.done(function( msg ) {
			var data = jQuery.parseJSON( msg );
			
			if (typeof(data.error)!=='undefined') {
				p3d.analyse_error = true;
				jQuery('#p3d-analyse-status, #p3d-canvas-analyse-status').show();
				jQuery('#p3d-analyse-message').html(p3d.text_model_analyse_failed);
				jQuery('#p3d-analyse-image').hide();
				jQuery('#p3d-canvas-analyse-status').show();
				jQuery('#p3d-canvas-analyse-message').html(p3d.text_model_analyse_failed);
				jQuery('#p3d-canvas-analyse-image').hide();


				jQuery('#p3d-console').html(data.error.message).show();
				p3dDisplayUserDefinedProgressBar(false);
				p3dDisplayQuoteLoading(false);
				//jQuery('#stats-material-volume, #stats-weight').hide();
				jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();
				jQuery('#p3d-analyse-percent').html('');
				jQuery('#p3d-canvas-analyse-percent').html('');
				if (p3d.pricing_api_expired=='request') p3d.fatal_error=1;
				p3dNewPricing('', p3d.pricing_api_expired);

				clearInterval(p3d.refresh_interval);
			}
			if (data.status=='1') {
				p3d.checking = false;
				p3d.analyse_error = false;
				jQuery('#stats-material-volume').html((data.material_volume/1000).toFixed(2));
//				window.model_total_volume = data.material_volume;
				p3d.analysed_volume = data.material_volume
				if (data.surface_area) p3d.analysed_surface_area = data.surface_area;
				p3d.print_time = data.print_time;
				if (printer_type == 'dlp') {
					p3d.print_time = p3dCalculateDLPPrintTime();
				}
				jQuery('#p3d-analyse-status, #p3d-canvas-analyse-status').show();
				jQuery('#p3d-analyse-message').html(p3d.text_model_analysed);
				jQuery('#p3d-analyse-image').hide();
				jQuery('#p3d-canvas-analyse-status').show();
				jQuery('#p3d-canvas-analyse-message').html(p3d.text_model_analysed);
				jQuery('#p3d-canvas-analyse-image').hide();

				p3dDisplayAddToCart(true);
			        p3dDisplayQuoteLoading(false);
			        p3dDisplayPrice(true);
				jQuery('#stats-material-volume, #stats-weight, #stats-hours').show();
				jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();
				jQuery('#p3d-analyse-percent').html('100%');
				jQuery('#p3d-canvas-analyse-percent').html('100%');
				//p3d.triangulation_required = false;
				p3dGetStats();
				clearInterval(p3d.refresh_interval);
			}
			if (data.status=='2') {
				jQuery('#p3d-analyse-percent').html(data.progress+'%');
				jQuery('#p3d-canvas-analyse-percent').html(data.progress+'%');
			}

		});
	

//clearInterval(p3d.refresh_interval);
}

function p3dCalculateDLPPrintTime() {
	var model_length = p3d.boundingBox.max.x - p3d.boundingBox.min.x;
	var model_width  = p3d.boundingBox.max.y - p3d.boundingBox.min.y;
	var model_height = p3d.boundingBox.max.z - p3d.boundingBox.min.z;
	var layer_height = parseFloat(jQuery('input[name=product_printer]:checked').data('layer-height'));
	var time_per_layer = parseFloat(jQuery('input[name=product_printer]:checked').data('time-per-layer'));
	var time_per_bottom_layer = parseFloat(jQuery('input[name=product_printer]:checked').data('time-per-bottom-layer'));
	var time_settle = parseFloat(jQuery('input[name=product_printer]:checked').data('time-settle'));
	var bottom_layers = parseFloat(jQuery('input[name=product_printer]:checked').data('bottom-layers'));
	var z_lift_distance = parseFloat(jQuery('input[name=product_printer]:checked').data('z-lift-distance'));
	var raft_base_thickness = parseFloat(jQuery('input[name=product_printer]:checked').data('raft-base-thickness'));

	var print_time = (bottom_layers*time_per_bottom_layer*p3d.resize_scale*p3dGetUnitMultiplier()) + ((model_height + raft_base_thickness + z_lift_distance)/layer_height)*time_per_layer*p3d.resize_scale*p3dGetUnitMultiplier() + ((model_height + raft_base_thickness + z_lift_distance)/layer_height)*time_settle*p3d.resize_scale*p3dGetUnitMultiplier();

	return print_time;
	
}

function p3dViewerInit(model, mtl, ext, is_string) {

	
	var p3d_canvas = document.getElementById('p3d-cv');
	var p3d_canvas_width = jQuery('#p3d-cv').width()
	var p3d_canvas_height = jQuery('#p3d-cv').height()
	p3d.mtl=mtl;

	jQuery('#rotation_x, #rotation_y, #rotation_z').val('0');
	//p3d.prev_rotation_x=p3d.prev_rotation_y=p3d.prev_rotation_z=0;

	//3D Renderer
	p3d.renderer = Detector.webgl? new THREE.WebGLRenderer({ antialias: true, canvas: p3d_canvas, preserveDrawingBuffer: true }): new THREE.CanvasRenderer({canvas: p3d_canvas});
	p3d.renderer.setClearColor( parseInt(p3d.background1, 16) );
	p3d.renderer.setPixelRatio( window.devicePixelRatio || 1);
	p3d.renderer.setSize( p3d_canvas_width, p3d_canvas_height );


	if (Detector.webgl) {

		p3d.renderer.gammaInput = true;
		p3d.renderer.gammaOutput = true;
		p3d.renderer.shadowMap.enabled = true;
//		p3d.renderer.shadowMap.renderReverseSided = false;
		p3d.renderer.shadowMap.Type = THREE.PCFSoftShadowMap;
	}

	p3d.camera = new THREE.PerspectiveCamera( 35, p3d_canvas_width / p3d_canvas_height, 1, 1000 );
	p3d.camera.position.set( 0, 0, 0 );
	p3d.cameraTarget = new THREE.Vector3( 0, 0, 0 );

	p3d.scene = new THREE.Scene();
	//p3d.scene.fog = new THREE.Fog( 0x72645b, 1, 300 );

	//Group
	if (p3d.group) p3d.scene.remove(p3d.group);
	if (p3d.model_mesh_rotated) p3d.scene.remove(p3d.model_mesh_rotated);
	delete(p3d.model_mesh_rotated);

	p3d.group = new THREE.Group();
	p3d.group.position.set( 0, 0, 0 )
	p3d.group.name = "group";
	p3d.scene.add( p3d.group );
	if (p3d.show_axis=='on') {
		p3d.axis = new THREE.AxesHelper( 300 )
		p3d.scene.add( p3d.axis );
	}



	//Light
	ambientLight = new THREE.AmbientLight(0x191919);
	p3d.scene.add(ambientLight);
	ambientLight.name = "light";



	directionalLight = new THREE.DirectionalLight( 0xffffff, 0.75 );
	directionalLight.name = "light";


	directionalLight2 = new THREE.DirectionalLight( 0xffffff, 0.75 );
	directionalLight2.name = "light2";

//	var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
//	p3d.camera.add( pointLight );





	p3d.controls = new THREE.OrbitControls( p3d.camera, p3d.renderer.domElement );
	if (p3d.auto_rotation=='on') {
		p3d.controls.autoRotate = true; 
	}

	p3d.controls.addEventListener( 'start', function() {
		p3d.controls.autoRotate = false;
	});

	if (ext=='stl')
		p3d.loader = new THREE.STLLoader();
	else if (ext=='obj') {
		p3d.loader = new THREE.OBJLoader();
	}

	if (model.length>0 && is_string) {
		var model_geometry = p3d.loader.parse(model);
		p3dModelOnLoad(model_geometry);
	}
	else if (model.length>0 && !is_string) {

		var mtlLoader = new THREE.MTLLoader();
		mtlLoader.setPath( p3d.upload_url );
		if (ext=='obj' && mtl && mtl.length>0) {
			mtlLoader.load( mtl, function( materials ) {
				materials.preload();
				var objLoader = new THREE.OBJLoader();
				p3d.loader.setMaterials( materials );
				p3d.loader.load( model, function ( geometry ) {
		        	    p3dModelOnLoad(geometry);
				},
				function( e ){},
				function ( error ) {	
					p3dShowError(p3d.error_not_found); 
					p3dDisplayQuoteLoading(false);
				} );
			});
		}
		else {

			p3d.loader.load( model, function ( geometry ) {
				p3dModelOnLoad(geometry)
			} , 
			function( e ){},
			function ( error ) {	
				p3dShowError(p3d.error_not_found); 
				p3dDisplayQuoteLoading(false);
			} );
		}
	}



	if (p3d.display_mode=='fullscreen') {
		p3dGoFullScreen();
		jQuery("#rotation_x").bind('keyup mouseup', function () {
			p3dRotateModel('x', this.value);
		});
		jQuery("#rotation_y").bind('keyup mouseup', function () {
			p3dRotateModel('y', this.value);
		});
		jQuery("#rotation_z").bind('keyup mouseup', function () {
			p3dRotateModel('z', this.value);
		});

		jQuery("#scale_x").bind('keyup mouseup', function () {
			p3dUpdateDimensions(this);
		});
		jQuery("#scale_y").bind('keyup mouseup', function () {
			p3dUpdateDimensions(this);
		});
		jQuery("#scale_z").bind('keyup mouseup', function () {
			p3dUpdateDimensions(this);
		});
	}
p3dInitSelect2();
p3d.wizard = jQuery("#p3d-multistep").accWizard({

  // start step
  start: 1,

  // or 'edit'
  mode: "wizard",

  // auto scroll the page to the current step  
  enableScrolling: ((p3d.multistep_autoscroll=='yes' || (jQuery.isMobile && p3d.multistep_autoscroll=='mobile')) ? true : false ),

  // auto add next/back buttons
  autoButtons: true,

  // CSS classes for next/back buttons
  autoButtonsNextClass: 'p3d-btn p3d-btn-primary p3d-float-right',
  autoButtonsPrevClass: 'p3d-btn p3d-btn-light',

  // auto show submit button
  autoButtonsShowSubmit: false,

  // submit text
  autoButtonsSubmitText: 'Submit',

  // save text
  autoButtonsEditSubmitText: 'Save',

  // show step number
  stepNumbers: true,

  // CSS class for step number
  stepNumberClass: 'p3d-badge p3d-badge-pill p3d-badge-primary p3d-mr-1',

  beforeNextStep: function() {
   if (p3d.multistep_model_required=='on' && typeof(p3d.model_mesh)=='undefined') {
    alert(p3d.text_multistep_upload_model);
    return false;
   }
   else return true;
  }
  
});


//	jQuery('.p3d-bxslider').bxSlider({touchEnabled:false, adaptiveHeight:true});

	jQuery('.p3d-bxslider').each(function(i,item){
		var bxslider = jQuery(this).bxSlider({touchEnabled:false, adaptiveHeight:true});
		if (typeof(bxslider) !=='undefined')
		p3d.bxsliders[i] = bxslider;
	});
	jQuery('.p3d-tooltip').tooltipster({ contentAsHTML: true, maxWidth: 300, theme: 'tooltipster-light' });

	p3dAnimate();

	if (p3d.mobile_no_animation=='on' && jQuery.isMobile) {
		cancelAnimationFrame(p3d.animation_id);		
	}



	window.addEventListener( 'resize', p3dOnWindowResize, false );

}


//var sliders = [];
//jQuery('.p3d-bxslider').each(function(i,item){
//  var slider;
//  slider.jQuery(this).bxSlider();
//  sliders[i] = slider;
//});
//

function p3dReloadSliders() {
	var current_material_checked = jQuery('input[name=product_filament]:checked').data('id');
	var current_printer_checked = jQuery('input[name=product_printer]:checked').data('id');
	var current_coating_checked = jQuery('input[name=product_coating]:checked').data('id');
	jQuery(p3d.bxsliders).each(function(){
		this.reloadSlider();
		jQuery('#p3d_material_'+current_material_checked).prop('checked', true);
		jQuery('#p3d_coating_'+current_coating_checked).prop('checked', true);
		jQuery('#p3d_printer_'+current_printer_checked).prop('checked', true);
	});
}


function p3dMakeTextSprite( message, parameters ) {

        if ( parameters === undefined ) parameters = {};
        var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
        var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
	fontsize=18; //hack for three.js r101


        var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
        var borderColor = parameters.hasOwnProperty("borderColor") ?parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
        var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
        var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:0, g:0, b:0, a:1.0 };

        var canvas = document.createElement('canvas');
	canvas.width = 32; //hack for three.js r101
	canvas.height = 32;
	canvas.style.overflow='visible';
	canvas.style.opacity=0;
	canvas.style.backgroundColor=p3d.plane_color;


        var context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;
        var metrics = context.measureText( message );
        var textWidth = metrics.width;

        context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

        context.lineWidth = borderThickness;
        p3dRoundRect(context, borderThickness/2, borderThickness/2, (textWidth + borderThickness) * 1.1, fontsize * 1.4 + borderThickness, 8);

        context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
        context.fillText( message, borderThickness, fontsize + borderThickness);

        var texture = new THREE.Texture(canvas) 
        texture.needsUpdate = true;

//        var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
        var spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
        return sprite;  
}


// function for drawing rounded rectangles
function p3dRoundRect(ctx, x, y, w, h, r) 
{

    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();   
}




function p3dModelOnLoad(object) {

	p3d.object = object;
	geometry = object;
	if (object.type=='Group') {
		geometry = object.children[0].geometry;
		//todo: merge multiple geometries?
	}

	var postprocessing = { enabled: true, onlyAO: false, radius: 32, aoClamp: 0.25, lumInfluence: 0.7 };

	//Material
	var material = p3dCreateMaterial(p3d.shading);

	geometry.computeBoundingBox();
	p3d.boundingBox=geometry.boundingBox;
	if (object.type=='Group' && object.children.length>1) {
		var min_coords=[];
		var max_coords=[];
		for(var i=0;i<object.children.length;i++) {
			object.children[i].geometry.computeBoundingBox();
			if (i==0) {
				min_coords.x=object.children[i].geometry.boundingBox.min.x;
				min_coords.y=object.children[i].geometry.boundingBox.min.y;
				min_coords.z=object.children[i].geometry.boundingBox.min.z;
				max_coords.x=object.children[i].geometry.boundingBox.max.x;
				max_coords.y=object.children[i].geometry.boundingBox.max.y;
				max_coords.z=object.children[i].geometry.boundingBox.max.z;
			}
			else {
				if (object.children[i].geometry.boundingBox.min.x < min_coords.x) min_coords.x = object.children[i].geometry.boundingBox.min.x;
				if (object.children[i].geometry.boundingBox.min.y < min_coords.y) min_coords.y = object.children[i].geometry.boundingBox.min.y;
				if (object.children[i].geometry.boundingBox.min.z < min_coords.z) min_coords.z = object.children[i].geometry.boundingBox.min.z;

				if (object.children[i].geometry.boundingBox.max.x > max_coords.x) max_coords.x = object.children[i].geometry.boundingBox.max.x;
				if (object.children[i].geometry.boundingBox.max.y > max_coords.y) max_coords.y = object.children[i].geometry.boundingBox.max.y;
				if (object.children[i].geometry.boundingBox.max.z > max_coords.z) max_coords.z = object.children[i].geometry.boundingBox.max.z;
			}
		}
		p3d.boundingBox.min=min_coords;
		p3d.boundingBox.max=max_coords;
	}

	//Model


	p3dCreateModel(object, geometry, material, p3d.shading);

	if (object.type=='Group' && object.children.length>1)	{
	}
	else {
		geometry.center();
	}


	//Glow mesh
	p3dSetCurrentGlow();

	var mesh_width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
	var mesh_length = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
	var mesh_height = geometry.boundingBox.max.z - geometry.boundingBox.min.z;

	var mesh_diagonal = Math.sqrt(mesh_width * mesh_width + mesh_length * mesh_length + mesh_height * mesh_height);

	if (Detector.webgl) {
		var canvas_width=p3d.renderer.getSize().width;
		var canvas_height=p3d.renderer.getSize().height;
	}
	else {
		var canvas_width=jQuery('#p3d-cv').width();
		var canvas_height=jQuery('#p3d-cv').height();
	}

	var canvas_diagonal = Math.sqrt(canvas_width * canvas_width + canvas_height * canvas_height);
	var model_dim = new Array();
	model_dim.x = p3d.boundingBox.max.x - p3d.boundingBox.min.x;
	model_dim.y = p3d.boundingBox.max.y - p3d.boundingBox.min.y;
	model_dim.z = p3d.boundingBox.max.z - p3d.boundingBox.min.z;

	var max_side = Math.max(model_dim.x, model_dim.y, model_dim.z)*1.2

	//Camera
	p3d.camera.position.set(max_side*p3d.resize_scale, max_side*p3d.resize_scale, max_side*p3d.resize_scale);

	p3d.camera.far=10000;
	p3d.camera.updateProjectionMatrix();

	//Ground
	if (Detector.webgl) {
		if (p3d.ground_mirror=='on') {
			var plane_shininess = 2500;
			var plane_transparent = true;
			var plane_opacity = 0.6;
		}
		else {
			var plane_shininess = 30;
			var plane_transparent = false;
			var plane_opacity = 1;
		}

		if (jQuery.isMobile) {
			var plane_material = new THREE.MeshLambertMaterial( { color: parseInt(p3d.ground_color, 16), wireframe: false, flatShading:true, precision: 'mediump' } );
		}
		else {
			var plane_material = new THREE.MeshPhongMaterial ( { color: parseInt(p3d.ground_color, 16), transparent:plane_transparent, opacity:plane_opacity, shininess: plane_shininess, precision: 'mediump' } ) 
		}

		p3d.plane = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 2000, 2000 ),
			plane_material
		);
		p3d.plane.rotation.x = -Math.PI/2;
		p3d.plane.position.y = p3d.boundingBox.min.z;
		p3d.plane.receiveShadow = true;
		p3d.plane.castShadow = true;
		p3d.plane.name = 'ground';
		p3d.scene.add( p3d.plane );
		if (p3d.ground_mirror=='on') {
			var planeGeo = new THREE.PlaneBufferGeometry( 2000, 2000 );
//			p3d.groundMirror = new THREE.Mirror( p3d.renderer, p3d.camera, { clipBias: 0.003, textureWidth: canvas_width, textureHeight: canvas_height, color: 0xaaaaaa } );
//			p3d.mirrorMesh = new THREE.Mesh( planeGeo, p3d.groundMirror.material ); //old way

			p3d.mirrorMesh = new THREE.Reflector( planeGeo, { //new way
				clipBias: 0.003,
				textureWidth: canvas_width,
				textureHeight: canvas_height,
				color: 0xaaaaaa,
				recursion: 1
			} );

			p3d.mirrorMesh.position.y = p3d.boundingBox.min.z-0.1;
//			p3d.mirrorMesh.add( p3d.groundMirror );
			p3d.mirrorMesh.rotateX( - Math.PI / 2 );
			p3d.scene.add( p3d.mirrorMesh );
		}

	}

	//Grid
	if (p3d.show_grid=='on' && p3d.plane_color.length>0) {

		var size = 1000, step = 50;
		var grid_geometry = new THREE.Geometry();
		for ( var i = - size; i <= size; i += step ) {
			grid_geometry.vertices.push( new THREE.Vector3( - size, p3d.boundingBox.min.z, i ) );
			grid_geometry.vertices.push( new THREE.Vector3(   size, p3d.boundingBox.min.z, i ) );
			grid_geometry.vertices.push( new THREE.Vector3( i, p3d.boundingBox.min.z, - size ) );
			grid_geometry.vertices.push( new THREE.Vector3( i, p3d.boundingBox.min.z,   size ) );
		
		}


		var grid_material = new THREE.LineBasicMaterial( { color: parseInt(p3d.plane_color, 16), opacity: 0.2 } );
		var line = new THREE.LineSegments( grid_geometry, grid_material );
		line.name = "grid";
		p3d.scene.add( line );
		p3d.group.add( line );
	}

	
	directionalLight.position.set( max_side*2, max_side*2, max_side*2 );
	directionalLight2.position.set( -max_side*2, max_side*2, -max_side*2 );
	if (Detector.webgl && p3d.show_shadow=='on') {
		directionalLight.castShadow = true;
		directionalLight2.castShadow = true;
		p3dMakeShadow();
	}
	p3d.scene.add( directionalLight );
	p3d.scene.add( directionalLight2 );

//	p3d.scene.add( new THREE.HemisphereLight( 0x888877, 0x777788 ) );

	var model_dim = new Array();

	var axis_length = Math.max(mesh_width, mesh_length);
	var axis_width = Math.min(mesh_width, mesh_length);

//	p3d.model_mesh.rotation.z = 90 * Math.PI/180;
//	p3d.model_mesh.rotation.x = -90 * Math.PI/180;

	if (p3d.show_axis=='on') {
		p3d.axis.position.y=p3d.boundingBox.min.z+0.01
		p3d.spritey_x = p3dMakeTextSprite( " X ", 
			{ fontsize: 40, borderColor: {r:255, g:102, b:0, a:1.0}, backgroundColor: {r:255, g:255, b:255, a:0.8} } );

		p3d.spritey_x.position.set((mesh_width/2)+10,0,0);
		p3d.spritey_x.rotation.z = 90 * Math.PI/180;
		p3d.spritey_x.rotation.x = -90 * Math.PI/180;
		p3d.scene.add( p3d.spritey_x );

/*
		//todo make it work
		var xDiv = document.createElement( 'div' );
		xDiv.className = 'label';
		xDiv.textContent = 'Moon';
		xDiv.style.fontSize  = '40px';
//		xDiv.style.marginTop = '-1em';
		xDiv.width=100;
		xDiv.height=100;
console.log(xDiv);
		p3d.spritey_x = new THREE.CSS2DObject( xDiv );

		p3d.spritey_x.position.set((mesh_width/2)+10,0,0);
		p3d.spritey_x.rotation.z = 90 * Math.PI/180;
		p3d.spritey_x.rotation.x = -90 * Math.PI/180;
		p3d.model_mesh.add(p3d.spritey_x);
//		p3d.scene.add( p3d.spritey_x );
*/
		p3d.spritey_y = p3dMakeTextSprite( " Y ", 
			{ fontsize: 40, borderColor: {r:51, g:51, b:255, a:1.0}, backgroundColor: {r:255, g:255, b:255, a:0.8} } );
		p3d.spritey_y.position.set(0,0,(mesh_length/2)+10);
		p3d.spritey_y.rotation.z = 90 * Math.PI/180;
		p3d.spritey_y.rotation.x = -90 * Math.PI/180;
		p3d.scene.add( p3d.spritey_y );

		p3d.spritey_z = p3dMakeTextSprite( " Z ", 
			{ fontsize: 40, borderColor: {r:51, g:204, b:51, a:1.0}, backgroundColor: {r:255, g:255, b:255, a:0.8} } );
		p3d.spritey_z.position.set(0,(mesh_height/2)+10,0);
		p3d.spritey_z.rotation.z = 90 * Math.PI/180;
		p3d.spritey_z.rotation.x = -90 * Math.PI/180;
		p3d.scene.add( p3d.spritey_z );
	}

	if (p3d.pricing=='checkout' && p3d.new_pricing!='request') {
		p3dDisplayRequestForm(false);
	}
	else if (p3d.pricing=='request' || p3d.pricing=='request_estimate') {
		p3dDisplayRequestForm(true);
	}

	p3dDisplayUserDefinedProgressBar(false);
	p3dInitScaling();
	p3dDrawPrinterBox();

}

function p3dCreateMaterial(model_shading) {

	var model_shininess = p3dGetCurrentShininess()
	var model_transparency = p3dGetCurrentTransparency()
	var color = new THREE.Color( p3dGetCurrentColor() );
	color.offsetHSL(0, 0, -0.1);

	if (Detector.webgl && !jQuery.isMobile) {
		if (model_shading=='smooth') {
			var flat_shading = false;
		}
		else {
			var flat_shading = true;
		}

		var material = new THREE.MeshPhongMaterial( { color: color, specular: model_shininess.specular, shininess: model_shininess.shininess, transparent:true, opacity:model_transparency, wireframe:false, flatShading:flat_shading, precision: 'mediump' } );
	}
	else {

		var material = new THREE.MeshLambertMaterial( { color: color, transparent:true, opacity:model_transparency, wireframe: false, flatShading:true, precision: 'mediump' } );
	}
	return material;
}

function p3dCreateModel(object, geometry, material, shading) {

	var attrib = geometry.getAttribute('position');
	if(attrib === undefined) {
		throw new Error('a given BufferGeometry object must have a position attribute.');
	}
	var positions = attrib.array;
	var vertices = [];
	for(var i = 0, n = positions.length; i < n; i += 3) {
		var x = positions[i];
		var y = positions[i + 1];
		var z = positions[i + 2];
		vertices.push(new THREE.Vector3(x, y, z));
	}
	var faces = [];
	for(var i = 0, n = vertices.length; i < n; i += 3) {
		faces.push(new THREE.Face3(i, i + 1, i + 2));
	}

	var new_geometry = new THREE.Geometry();
	new_geometry.vertices = vertices;
	new_geometry.faces = faces;
	new_geometry.computeFaceNormals();              
	new_geometry.computeVertexNormals();
	new_geometry.computeBoundingBox();

	geometry = new_geometry;
	geometry.center();

	if (shading=='smooth' && Detector.webgl) {
                var smooth_geometry = new THREE.Geometry();
                smooth_geometry.vertices = vertices;
                smooth_geometry.faces = faces;
                smooth_geometry.computeFaceNormals();              
                smooth_geometry.mergeVertices();
                smooth_geometry.computeVertexNormals();
		smooth_geometry.computeBoundingBox();
		geometry = smooth_geometry;
                p3d.model_mesh = new THREE.Mesh(geometry, material);
	}
	else {
		p3d.model_mesh = new THREE.Mesh( geometry, material );
	}

	if (p3d.object.type=='Group') {
		if (!p3d.mtl || p3d.mtl.length==0) {
			//p3d.object.children[0].material=p3d.model_mesh.material;
			for (var i=0;i<p3d.object.children.length;i++) {
				p3d.object.children[i].material=p3d.model_mesh.material;
			}
		}

		p3d.object.position.set( 0, 0, 0 );
		p3d.object.rotation.z = 90 * Math.PI/180;
		p3d.object.rotation.x = -90 * Math.PI/180;
		p3d.object.name = "object";

		p3d.initial_rotation_x = p3d.object.rotation.x;
		p3d.initial_rotation_y = p3d.object.rotation.y;
		p3d.initial_rotation_z = p3d.object.rotation.z;

		if (Detector.webgl) {
			for (var i=0;i<p3d.object.children.length;i++) {
				p3d.object.children[i].castShadow = true;
				p3d.object.children[i].receiveShadow = true;
			}
		}
		p3d.scene.add( p3d.object );
		p3d.group.add( p3d.object );
	}
	else {
		p3d.model_mesh.position.set( 0, 0, 0 );
		p3d.model_mesh.rotation.z = 90 * Math.PI/180;
		p3d.model_mesh.rotation.x = -90 * Math.PI/180;
		p3d.model_mesh.name = "model";

		p3d.initial_rotation_x = p3d.model_mesh.rotation.x;
		p3d.initial_rotation_y = p3d.model_mesh.rotation.y;
		p3d.initial_rotation_z = p3d.model_mesh.rotation.z;

		if (Detector.webgl) {
			p3d.model_mesh.castShadow = true;
			p3d.model_mesh.receiveShadow = true;
		}
		p3d.scene.add( p3d.model_mesh );
		p3d.group.add( p3d.model_mesh );
	}




	var p3dRangeSlider = document.getElementById('p3d-scale'); 
	if (typeof(p3dRangeSlider)!=='undefined' && p3dRangeSlider.noUiSlider) {
		p3dRangeSlider.noUiSlider.set(p3d.resize_scale*100);
	}




}

function p3dMakeShadow() {

	var model_dim = new Array();
	model_dim.x = p3d.boundingBox.max.x - p3d.boundingBox.min.x;
	model_dim.y = p3d.boundingBox.max.y - p3d.boundingBox.min.y;
	model_dim.z = p3d.boundingBox.max.z - p3d.boundingBox.min.z;

	var max_side = Math.max(model_dim.x, model_dim.y, model_dim.z)
  	var bias = -0.001;
	var d = max_side*p3d.resize_scale;
	if (d<30) bias = -0.0001;
	directionalLight2.shadow.camera.left = directionalLight.shadow.camera.left = -d;
	directionalLight2.shadow.camera.right = directionalLight.shadow.camera.right = d;
	directionalLight2.shadow.camera.top = directionalLight.shadow.camera.top = d;
	directionalLight2.shadow.camera.bottom = directionalLight.shadow.camera.bottom = -d;
	directionalLight2.shadow.camera.near = directionalLight.shadow.camera.near = 1;
	directionalLight2.shadow.camera.far = directionalLight.shadow.camera.far = p3d.camera.far;
	directionalLight2.shadow.mapSize.width = directionalLight.shadow.mapSize.width = 2048;
	directionalLight2.shadow.mapSize.height = directionalLight.shadow.mapSize.height = 2048;
	directionalLight2.shadow.bias = directionalLight.shadow.bias = bias;

	if (directionalLight.shadow.map) {
		directionalLight.shadow.map.dispose(); 
		directionalLight.shadow.map = null;
		directionalLight2.shadow.map.dispose(); 
		directionalLight2.shadow.map = null;
	}
}



function p3dOnWindowResize() {


	if (p3d.display_mode=='fullscreen') {
		p3d.camera.aspect = window.innerWidth / window.innerHeight;
		p3d.camera.updateProjectionMatrix();
		p3d.renderer.setSize( window.innerWidth, window.innerHeight );
	} 
	else {
		var p3d_canvas_width = jQuery('div.images').width()
		var p3d_canvas_height = jQuery('#p3d-viewer').width()
		p3d.camera.aspect = p3d_canvas_width / p3d_canvas_height;
		p3d.camera.updateProjectionMatrix();
		p3d.renderer.setSize( p3d_canvas_width, p3d_canvas_height );
	}
//	p3d.p3d.ssaoPass.setSize( window.innerWidth, window.innerHeight );
	p3dCanvasDetails();
}

function p3dCanvasDetails() {

	jQuery("#canvas-stats").css({
		top: jQuery("#p3d-cv").position().top ,
		left: jQuery("#p3d-cv").position().left+10
	}) ;
	if (p3d.display_mode=='fullscreen') {
		jQuery('#canvas-stats').css('left', (window.innerWidth-200)+'px')
	}
	jQuery("#p3d-file-loading").css({
		top: jQuery("#p3d-cv").position().top+jQuery("#p3d-cv").height()/2-jQuery("#p3d-file-loading").height()/2,
		left: jQuery("#p3d-cv").position().left + jQuery("#p3d-cv").width()/2-jQuery("#p3d-file-loading").width()/2
	}) ;
}

function p3dGoFullScreen() {

	if (p3d.is_fullscreen==1) return;
	jQuery('#p3d-viewer').appendTo('#p3d-fullscreen');
	document.body.style.overflow = 'hidden';
	window.scrollTo(0, 0);
	jQuery(window).scroll(function(){
		window.scrollTo(0, 0);
	})
	p3d.camera.aspect = window.innerWidth / window.innerHeight;
	p3d.camera.updateProjectionMatrix();
	p3d.renderer.setSize( window.innerWidth, window.innerHeight );
	p3dCanvasDetails();
	jQuery('#wpadminbar').hide()

	//reinit slider
	var p3dRangeSlider = document.getElementById('p3d-scale');
	if (typeof(p3dRangeSlider)!=='undefined' && p3dRangeSlider.noUiSlider) {
		p3dRangeSlider.noUiSlider.destroy();
	}

	jQuery('div.woocommerce-message').appendTo('#p3d-sidepanel-left')
	jQuery('div.summary, div.zo-summary, .product-single .col-sm-6:last').appendTo('#p3d-sidepanel-left').css('margin-right', '10px').css('margin-left', '10px')
	
	jQuery('.variations_button button').removeClass('disabled');//todo: figure out woocommerce js

	var left_panel_width = 350;
	jQuery("#p3d-sidepanel-left").buildMbExtruder({
		position:"left",
		positionFixed:false,
		hidePanelsOnClose:false,
		accordionPanels:false,
		closeOnExternalClick:false,
		width: left_panel_width,
		top:0,
		extruderOpacity:.8,
		onExtOpen:function(){},
		onExtContentLoad:function(){},
		onExtClose:function(){jQuery("#p3d-sidepanel-left .extruder-content").css('overflow-y', 'scroll');},
		slideTimer:1000
	});


	jQuery("#p3d-sidepanel-left .extruder-content").css('height', '100%');
	jQuery("#p3d-sidepanel-left .extruder-content").css('overflow-y', 'scroll');
	jQuery("#p3d-sidepanel-left .extruder-content").css('overflow-x', 'hidden');
	jQuery("#p3d-sidepanel-left .text").css('overflow-x', 'hidden');
	jQuery("#p3d-sidepanel-left .flap").css('top', jQuery("#p3d-cv").position().top+jQuery("#p3d-cv").height()/2-jQuery("#p3d-sidepanel-left .flap").height()) ;
	jQuery('#p3d-sidepanel-left .ext_wrapper').css('left', '0px')
	jQuery('#canvas-stats').css('left', (window.innerWidth-300)+'px')
	jQuery('.p3d-model-message').css('margin-left', left_panel_width+'px');


	jQuery('.p3d-panel-top').appendTo('#p3d-sidepanel-top')
	jQuery("#p3d-sidepanel-top").buildMbExtruder({
		position:"top",
		width:350,
		positionFixed:false,
		hidePanelsOnClose:false,
		accordionPanels:false,
		closeOnExternalClick:false,
		extruderOpacity:.8,
		onExtOpen:function(){},
		onExtContentLoad:function(){},
		onExtClose:function(){},
		slideTimer:1000
	});


	jQuery('.p3d-panel-right').appendTo('#p3d-sidepanel-right')
	jQuery("#p3d-sidepanel-right").buildMbExtruder({
		position:"right",
		width:300,
		top:110,
		positionFixed:false,
		hidePanelsOnClose:false,
		accordionPanels:false,
		closeOnExternalClick:false,
		extruderOpacity:.8,
		onExtOpen:function(){},
		onExtContentLoad:function(){},
		onExtClose:function(){},
		slideTimer:1000
	});
	jQuery("#p3d-sidepanel-right .extruder-content").css('height', 'auto');
	jQuery("#p3d-sidepanel-right .extruder-content").css('min-height', '250px');
	jQuery("#p3d-sidepanel-right .flip_label").css('width', '30px');
	jQuery("#p3d-sidepanel-right").css('top', jQuery("#p3d-cv").position().top+jQuery("#p3d-cv").height()/2-jQuery("#p3d-sidepanel-right .extruder-content").height()/2-10) ;

	jQuery("#p3d-sidepanel-left").openMbExtruder();
	//jQuery("#p3d-sidepanel-top").openMbExtruder();
	//jQuery("#p3d-sidepanel-right").openMbExtruder();

        jQuery('nav.applePie').easyPie({slideTop: false});
	jQuery('nav.applePie ul.nav').show();

	p3dInitScaling();
	p3d.is_fullscreen = 1;

	p3dBindSubmit();


}



function p3dAnimate() {
	p3d.animation_id = window.requestAnimationFrame( p3dAnimate );
	p3d.group.rotation.y += ( p3d.targetRotation - p3d.group.rotation.y ) * 0.05;
	p3d.controls.update();
	p3dRender();
}

function p3dRender() {
	if (Detector.webgl && p3d.ground_mirror=='on' && typeof(p3d.groundMirror)!=='undefined')
		p3d.groundMirror.render();

		p3d.renderer.render( p3d.scene, p3d.camera );
}




function p3dBoxFitsBox (dim_x1, dim_y1, dim_z1, dim_x2, dim_y2, dim_z2) {
	
	var fits=true;
	var min_dim1=Math.min(dim_x1, dim_y1, dim_z1);
	var min_dim2=Math.min(dim_x2, dim_y2, dim_z2);
	var max_dim1=Math.max(dim_x1, dim_y1, dim_z1);
	var max_dim2=Math.max(dim_x2, dim_y2, dim_z2);
	var diag1=Math.sqrt(dim_x1 + dim_y1 + dim_z1);
	var diag2=Math.sqrt(dim_x2 + dim_y2 + dim_z2);
	var median1=(dim_x1 + dim_y1 + dim_z1)/3;
	var median2=(dim_x2 + dim_y2 + dim_z2)/3;

	if (min_dim1<=min_dim2 && max_dim1<=max_dim2 && diag1 <= diag2) 
		fits = true;
	else 
		fits = false;


	fits=window.wp.hooks.applyFilters('3dprint.boxFitsBox', fits, dim_x1, dim_y1, dim_z1, dim_x2, dim_y2, dim_z2);
	return fits;
}

function p3dBoxFitsBoxXY (dim_x1, dim_y1, dim_x2, dim_y2) {

	var fits=true;
	var min_dim1=Math.min(dim_x1, dim_y1);
	var min_dim2=Math.min(dim_x2, dim_y2);
	var max_dim1=Math.max(dim_x1, dim_y1);
	var max_dim2=Math.max(dim_x2, dim_y2);
	var diag1=Math.sqrt(dim_x1 + dim_y1);
	var diag2=Math.sqrt(dim_x2 + dim_y2);

	if (min_dim1<=min_dim2 && max_dim1<=max_dim2) 
		fits = true;
	else 
		fits = false;



	fits=window.wp.hooks.applyFilters('3dprint.boxFitsBoxXY', fits, dim_x1, dim_y1, dim_x2, dim_y2);
	return fits;
}

function p3dShowError(message) {

	var decoded = jQuery('#p3d-console').html(message).text();
	jQuery('#p3d-console').html(decoded).show();
	window.wp.hooks.doAction( '3dprint.showError');
}

function p3dInitProgressButton () {

	if (!p3dDetectIE()) {
		window.p3dProgressButton=new ProgressButton(document.getElementById('p3d-pickfiles'), {
			callback : function( instance ) {
				interval = setInterval( function() {
					instance._setProgress( p3d.bar_progress );
					if( parseInt(p3d.bar_progress) === 1 ) {
						instance._stop(1);
						clearInterval( interval );
					}
				}, 200 );
			}
		} );
	}

}

jQuery(document).ready(function() {

	p3dInitProgressButton();
	if (p3d.display_mode!='fullscreen') {
	        jQuery('nav.applePie').easyPie();
		jQuery('nav.applePie ul.nav').show();
	}

});

function p3dChangeModelColor(model_color) {
	if (!p3d.model_mesh) return;

	p3d.model_mesh.material.color.set(model_color);
	p3d.model_mesh.material.color.offsetHSL(0, 0, -0.1);
	if (Detector.webgl) {
		var model_shininess = p3dGetCurrentShininess();
		p3d.model_mesh.material.shininess = model_shininess.shininess;
		if (typeof(p3d.model_mesh.material.specular)!=='undefined') {
			p3d.model_mesh.material.specular.set(model_shininess.specular);
		}

		var model_transparency = p3dGetCurrentTransparency();
		p3d.model_mesh.material.opacity = model_transparency;

		p3dSetCurrentGlow();
		if (p3d.object && p3d.object.type=='Group' && !(p3d.mtl && p3d.mtl.length>0)) {
			for (var i=0;i<p3d.object.children.length;i++) {
				p3d.object.children[i].material=p3d.model_mesh.material;

			}

		}
	}

	
};

function p3dGetCurrentColor() {

	var model_color = '#ffffff';
	if (typeof(jQuery('input[name=product_coating]:checked').data('color'))!=='undefined' && jQuery('input[name=product_coating]:checked').data('color').length>0 ) {
		model_color = jQuery('input[name=product_coating]:checked').data('color');
	}
	else if (typeof(jQuery('input[name=product_filament]:checked').data('color'))!=='undefined') {
		model_color = jQuery('input[name=product_filament]:checked').data('color');
	}

	return model_color;

}

function p3dGetCurrentShininess() {

	var model_shininess = 'plastic';
	if (typeof(jQuery('input[name=product_coating]:checked').data('shininess'))!=='undefined' && jQuery('input[name=product_coating]:checked').data('shininess').length>0 && jQuery('input[name=product_coating]:checked').data('shininess')!='none')
		model_shininess = jQuery('input[name=product_coating]:checked').data('shininess');
	else if (typeof(jQuery('input[name=product_filament]:checked').data('shininess'))!=='undefined') {
		model_shininess = jQuery('input[name=product_filament]:checked').data('shininess');
	}

	switch(model_shininess) {
		case 'plastic':
			var shininess = 150;
			var specular = 0x111111;
	        break;
		case 'wood':
			var shininess = 15;
			var specular = 0x111111;
	        break;
		case 'metal':
			var shininess = 500;
			var specular = 0xc9c9c9;
	        break;
		default:
			var shininess = 150;
			var specular = 0x111111;

	}
	return {shininess: shininess, specular: specular};
}

function p3dGetCurrentTransparency() {

	var model_transparency = 'opaque';
	if (typeof(jQuery('input[name=product_coating]:checked').data('transparency'))!=='undefined' && jQuery('input[name=product_coating]:checked').data('transparency').length>0 && jQuery('input[name=product_coating]:checked').data('transparency')!='none')
		model_transparency = jQuery('input[name=product_coating]:checked').data('transparency');
	else if (typeof(jQuery('input[name=product_filament]:checked').data('transparency'))!=='undefined') {
		model_transparency = jQuery('input[name=product_filament]:checked').data('transparency');
	}

	switch(model_transparency) {
		case 'opaque':
			var transparency = 1;
	        break;
		case 'resin':
			var transparency = 0.8;
	        break;
		case 'glass':
			var transparency = 0.6;
	        break;
		default:
			var transparency = 1;

	}
	return transparency;
}

function p3dGetCurrentGlowColor() {

	var model_glow = '';

	if (typeof(jQuery('input[name=product_coating]:checked').data('glow'))!=='undefined' && jQuery('input[name=product_coating]:checked').data('glow')=='1') {
		model_glow = jQuery('input[name=product_coating]:checked').data('color');

	}
	else if (jQuery('input[name=product_filament]:checked').data('glow')=='1') {
		model_glow = jQuery('input[name=product_filament]:checked').data('color');
	}
	else {
		model_glow = '';
	}
	return model_glow;
}

function p3dSetCurrentGlow() {

	if (!Detector.webgl) return;
	if (p3d.mtl && p3d.mtl.length>0) return;
	if (typeof(p3d.glow_mesh)!=='undefined') p3d.model_mesh.remove(p3d.glow_mesh.object3d);

	
	var glow_color = p3dGetCurrentGlowColor();

	if (glow_color.length>0) {

		//var material = p3dCreateMaterial('smooth');
		//p3dRemoveGroupObjectByName('model');
		//p3dCreateModel(p3d.backup_geometry, material, 'smooth');

		var model_dim = new Array();
		model_dim.x = p3d.boundingBox.max.x - p3d.boundingBox.min.x;
		model_dim.y = p3d.boundingBox.max.y - p3d.boundingBox.min.y;
		model_dim.z = p3d.boundingBox.max.z - p3d.boundingBox.min.z;

		var min_side = Math.max(model_dim.x, model_dim.y, model_dim.z)

		p3d.glow_mesh = new THREEx.GeometricGlowMesh(p3d.model_mesh, 0.01, min_side/20);
		p3d.model_mesh.add(p3d.glow_mesh.object3d);
		p3d.glow_mesh.position = p3d.model_mesh.position;

		var insideUniforms	= p3d.glow_mesh.insideMesh.material.uniforms
		insideUniforms.glowColor.value.set(glow_color)
		var outsideUniforms	= p3d.glow_mesh.outsideMesh.material.uniforms
		outsideUniforms.glowColor.value.set(glow_color)

	}
	else {
		//var material = p3dCreateMaterial(p3d.shading);
		//p3dCreateModel(p3d.backup_geometry, material, p3d.shading);
	}

}


function p3dSelectFilament(material_id) {
        var obj = jQuery('#p3d_material_'+material_id)

	jQuery('input[name=product_filament]:checked').prop('checked',false);
	jQuery(obj).prop('checked',true);
	jQuery('#pa_p3d_material').val(material_id);
//	material_id=jQuery(obj).find('input').data('id');

	if (jQuery(obj).closest('ul.p3d-bxslider').length>0) {
		jQuery(obj).closest('ul.p3d-bxslider').find('li').removeClass('p3d-selected-li');
		jQuery(obj).addClass('p3d-selected-li');
	}


	p3dChangeModelColor(p3dGetCurrentColor());

	jQuery.cookie('p3d_material', material_id, { expires: p3d.cookie_expire });

	//check compatible printers
	var compatible_printers = new Array();
	jQuery('input[name=product_printer]').each(function() {
		var materials = jQuery(this).data('materials')+'';
		var materials_array = materials.split(',');

		if (materials.length>0 && jQuery.inArray(material_id+'', materials_array)==-1) {
			jQuery(this).prop('disabled', true);
			jQuery(this).prop('checked', false);
			jQuery(this).css('visibility', 'hidden');
			jQuery(this).parent().find('.p3d-dropdown-item').addClass('p3d-inactive-dropdown-item');
			jQuery(this).parent().find('.p3d-slider-item').addClass('p3d-inactive-slider-item');
			jQuery('select.p3d-dropdown-searchable[name=product_printer]').find('option[data-id='+jQuery(this).data('id')+']').prop('disabled', true); p3dInitSelect2();


		}
		else {
			jQuery(this).prop('disabled', false);
			jQuery(this).css('visibility', 'visible');
			jQuery(this).parent().find('.p3d-dropdown-item').removeClass('p3d-inactive-dropdown-item');
			jQuery(this).parent().find('.p3d-slider-item').removeClass('p3d-inactive-slider-item');
			jQuery('select.p3d-dropdown-searchable[name=product_printer]').find('option[data-id='+jQuery(this).data('id')+']').prop('disabled', false); p3dInitSelect2();
			compatible_printers.push(this);

		}
	});

	//check if a compatible printer is already selected
	var selected = false;
	for (i=0;i<compatible_printers.length;i++) {
		if (jQuery('#pa_p3d_printer').val()==jQuery(compatible_printers[i]).data('id'))
			selected = true;
	}
	if (!selected && compatible_printers.length>0) {
		jQuery(compatible_printers[0]).prop('checked', true);		
		p3dSelectPrinter(jQuery(compatible_printers[0]).data('id'));
	}

	//check compatible coatings
	var compatible_coatings = new Array();

	jQuery('input[name=product_coating]').each(function() {
		var materials = jQuery(this).data('materials')+'';
		var materials_array = materials.split(',');

			if (materials.length>0 && jQuery.inArray(material_id+'', materials_array)==-1) {
			jQuery(this).prop('disabled', true);
			jQuery(this).prop('checked', false);
			jQuery(this).css('visibility', 'hidden');
			jQuery(this).parent().find('.p3d-dropdown-item').addClass('p3d-inactive-dropdown-item');
			if (jQuery(this).parent().hasClass('p3d-color-item')) jQuery(this).parent().addClass('p3d-inactive-color-item');
			jQuery(this).parent().find('.p3d-slider-item').addClass('p3d-inactive-slider-item');
			jQuery('select.p3d-dropdown-searchable[name=product_coating]').find('option[data-id='+jQuery(this).data('id')+']').prop('disabled', true); p3dInitSelect2();

		}
		else {
			jQuery(this).prop('disabled', false);
			jQuery(this).css('visibility', 'visible');
			jQuery(this).parent().find('.p3d-dropdown-item').removeClass('p3d-inactive-dropdown-item');
			if (jQuery(this).parent().hasClass('p3d-color-item')) jQuery(this).parent().removeClass('p3d-inactive-color-item');
			jQuery(this).parent().find('.p3d-slider-item').removeClass('p3d-inactive-slider-item');
			jQuery('select.p3d-dropdown-searchable[name=product_coating]').find('option[data-id='+jQuery(this).data('id')+']').prop('disabled', false); p3dInitSelect2();
			compatible_coatings.push(this);

		}
	});

	//check if a compatible coating is already selected
	var selected = false;
	for (i=0;i<compatible_coatings.length;i++) {
		if (jQuery('#pa_p3d_coating').val()==jQuery(compatible_coatings[i]).data('id'))
			selected = true;
	}
	if (!selected && compatible_coatings.length>0) {
		jQuery(compatible_coatings[0]).prop('checked', true);		
//		p3dSelectCoating(jQuery(compatible_coatings[0]).parent());
		p3dSelectCoating(jQuery(compatible_coatings[0]).data('id'));
	}




	var material_name=jQuery(obj).data('name');
	var material_color=jQuery(obj).data('color');

	if (typeof(document.getElementById('p3d-material-name'))!=='undefined') {
		jQuery('#p3d-material-name').html(p3d.text_material+' : <div style="background-color:'+material_color+'" class="p3d-color-sample"></div>'+material_name);
	}

	if (jQuery(obj).hasClass('p3d-color-item')) {
		jQuery(obj).closest('.p3d-fieldset').find('.p3d-color-item').removeClass('p3d-active');
		jQuery(obj).addClass('p3d-active');
	}
	
	p3dGetStats();

	p3dCheckPrintability();
	window.wp.hooks.doAction( '3dprint.selectFilament');
}

function p3dSelectCoating(coating_id) {
        var obj = jQuery('#p3d_coating_'+coating_id);

	if (jQuery(obj).prop('disabled')) return false;

	jQuery('input[name=product_coating]:checked').prop('checked',false);

	if (jQuery(obj).closest('ul.p3d-bxslider').length>0) {
		jQuery(obj).closest('ul.p3d-bxslider').find('li').removeClass('p3d-selected-li');
		jQuery(obj).addClass('p3d-selected-li');
	}

	jQuery(obj).prop('checked',true);
	jQuery('#pa_p3d_coating').val(coating_id);


	if (typeof(jQuery(obj).attr('data-color'))!=='undefined' && jQuery(obj).attr('data-color').length>0) {
		p3dChangeModelColor(jQuery(obj).attr('data-color'));
	}
	else {
		p3dChangeModelColor('#ffffff');
	}

	jQuery.cookie('p3d_coating', coating_id, { expires: p3d.cookie_expire });
	jQuery('select.p3d-dropdown-searchable[name=product_coating]').val(coating_id); p3dInitSelect2();


	var coating_name=jQuery(obj).data('name');
	var material_color=jQuery(obj).data('color');
	if (typeof(document.getElementById('p3d-coating-name'))!=='undefined') {
		jQuery('#p3d-coating-name').html(p3d.text_coating+' : <div style="background-color:'+material_color+'" class="p3d-color-sample"></div>'+coating_name);
	}

	if (jQuery(obj).hasClass('p3d-color-item')) {
		jQuery(obj).closest('.p3d-fieldset').find('.p3d-color-item').removeClass('p3d-active');
		jQuery(obj).addClass('p3d-active');
	}

	p3dGetStats();
	window.wp.hooks.doAction( '3dprint.selectCoating');
}

function p3dSelectUnit(product_unit) {
	var obj = jQuery("input[name=p3d_unit][value=" + product_unit + "]");
	jQuery(obj).attr('checked','true');
	jQuery('#p3d_unit').val(product_unit);
	jQuery('#pa_p3d_unit').val(product_unit);

	if (product_unit=='inch') {
		p3d.resize_scale=2.54*10;
	}
	else {
		p3d.resize_scale=1;
	}


	if (p3d.model_mesh) {
		p3dResizeModel(p3d.resize_scale);
	}

	jQuery.cookie('p3d_unit', product_unit, { expires: p3d.cookie_expire });
	
	//p3dDrawPrinterBox();
	p3dGetStats();
	p3dInitScaling();

	p3dAnalyseModel(jQuery('#pa_p3d_model').val());
	window.wp.hooks.doAction( '3dprint.selectUnit');
}


function p3dSelectPrinter(printer_id) {
        var obj = jQuery('#p3d_printer_'+printer_id)
	if (jQuery(obj).prop('disabled')) return false;

	p3d.printer_error = false;

	if (jQuery(obj).closest('ul.p3d-bxslider').length>0) {
		jQuery(obj).closest('ul.p3d-bxslider').find('li').removeClass('p3d-selected-li');
		jQuery(obj).addClass('p3d-selected-li');
	}


	var old_printer = jQuery('#p3d_printer_'+jQuery('#pa_p3d_printer').val())
	var new_printer = jQuery(obj);

/*	if (p3d.object && p3d.object.type=='Group' && new_printer.data('full_color')!='1')  {
		jQuery('#p3d-model-message-fullcolor').show();
	}
	else {
		jQuery('#p3d-model-message-fullcolor').hide;
	}*/

	jQuery(obj).prop('checked',true);
	jQuery('#pa_p3d_printer').val(printer_id);

	jQuery.cookie('p3d_printer', printer_id, { expires: p3d.cookie_expire });

	jQuery('select.p3d-dropdown-searchable[name=product_printer]').val(printer_id); p3dInitSelect2();

	var printer_name=jQuery(obj).data('name');
	var printer_type=jQuery(obj).data('type')
	if (typeof(document.getElementById('p3d-printer-name'))!=='undefined') {
		jQuery('#p3d-printer-name').html(p3d.text_printer+' : '+printer_name);
	}
	p3dDrawPrinterBox();



	if (jQuery('#pa_p3d_infill').length>0) {
	//check compatible infills
	var compatible_infills = new Array();
	jQuery('input[name=product_infill]').each(function() {
		var infills = jQuery(obj).data('infills')+'';
		var infills_array = infills.split(',');

		if (infills.length>0 && jQuery.inArray(jQuery(this).data('id')+'', infills_array)==-1) {
			jQuery(this).prop('disabled', true);
			jQuery(this).prop('checked', false);
//			jQuery(this).css('visibility', 'hidden');
			jQuery(this).hide();
			jQuery(this).parent().find('.p3d-dropdown-item').hide();
			jQuery('select.p3d-dropdown-searchable[name=product_infill]').find('option[data-id='+jQuery(this).data('id')+']').prop('disabled', true); p3dInitSelect2();
		}
		else {
			jQuery(this).prop('disabled', false);
//			jQuery(this).css('visibility', 'visible');

			if (!jQuery(this).hasClass('p3d-infill-dropdown'))
				jQuery(this).show();	
			jQuery(this).parent().find('.p3d-dropdown-item').show();
			jQuery('select.p3d-dropdown-searchable[name=product_infill]').find('option[data-id='+jQuery(this).data('id')+']').prop('disabled', false); p3dInitSelect2();
			compatible_infills.push(this);

		}
	});
	//check if a compatible infill is already selected
	var selected = false;
/*	for (i=0;i<compatible_infills.length;i++) {
		if (jQuery('#pa_p3d_infill').val().length>0 && jQuery('#pa_p3d_infill').val()==jQuery(compatible_infills[i]).data('id')) {
			selected = true;
		}

	}*/

	if (!selected && compatible_infills.length>0) {
		var default_infill = jQuery(obj).data('default-infill');


		for (i=0;i<compatible_infills.length;i++) {
			if (jQuery(compatible_infills[i]).data('id') == default_infill) {
				jQuery(compatible_infills[i]).prop('checked', true);		
				p3dSelectInfill(default_infill);
			}

		}
	}
	}


	if (printer_type=='other') {
		jQuery('#infill-info').css('visibility', 'hidden');
		jQuery('#stats-print-time').hide();

	}
	else {
		if (p3d.show_infills=='on') jQuery('#infill-info').css('visibility', 'visible');
		if (p3d.show_model_stats_model_hours=='on') jQuery('#stats-print-time').show();
	}
//	if (printer_type=='dlp' && p3d.show_model_stats_model_hours=='on') {
//		jQuery('#stats-print-time, #stats-hours').show();
//
//	}

	p3dGetStats();
//	p3dInitScaling();
	if (old_printer.length>0) {
		var old_printer_max_side = Math.max(old_printer.data('length'), old_printer.data('width'))
		var new_printer_max_side = Math.max(new_printer.data('length'), new_printer.data('width'))
		var old_printer_min_side = Math.min(old_printer.data('length'), old_printer.data('width'))
		var new_printer_min_side = Math.min(new_printer.data('length'), new_printer.data('width'))

		if (old_printer_max_side!=new_printer_max_side || old_printer_min_side!=new_printer_min_side || old_printer.data('height')!=new_printer.data('height')) {
//		        p3dInitScaling();
			p3d.printer_error=false;
			if (p3d.scale_auto_100=='on') {
			        p3dInitScaling();
			}
			else {
			p3dInitScaleSlider();
			var p3dRangeSlider = document.getElementById('p3d-scale');

			if (typeof(p3dRangeSlider.noUiSlider)!=='undefined') {

				p3dRangeSlider.noUiSlider.set(p3d.resize_scale*100)
			}
			}
		}

	}


	p3dCheckPrintability();

	if (p3d.api_optimize == 'on' && typeof(old_printer)!=='undefined' && new_printer.data('type')!='other' && new_printer.data('type')!=old_printer.data('type')) { //FDM or DLP optimization
		p3dRepairModel(jQuery('#pa_p3d_model').val());
	}
	p3dAnalyseModel(jQuery('#pa_p3d_model').val());
	window.wp.hooks.doAction( '3dprint.selectPrinter');
}

function p3dSelectInfill (infill_id) {
//console.log("caller is " + arguments.callee.caller.toString())
        var obj = jQuery('#p3d_infill_'+infill_id);

	if (jQuery(obj).prop('disabled')) return false;	
	jQuery(obj).attr('checked','true');
	jQuery('#pa_p3d_infill').val(infill_id);
	if (infill_id==0) jQuery('#pa_p3d_infill').val('0.01'); //'invalid value post for infill' bugfix
	jQuery.cookie('p3d_infill', infill_id, { expires: p3d.cookie_expire });
	jQuery('select.p3d-dropdown-searchable[name=product_infill]').val(infill_id); p3dInitSelect2();

//	infill_id=jQuery(obj).find('input').data('id');
	var infill_name=jQuery(obj).data('name');
	if (typeof(document.getElementById('p3d-infill-name'))!=='undefined') {
		jQuery('#p3d-infill-name').html(p3d.text_infill+' : '+infill_name);
	}
	p3dAnalyseModel(jQuery('#pa_p3d_model').val());
}

function p3dCheckPrintability() {
//todo: many things
	var printable=true;
	if (p3d.object && p3d.object.type=='Group' && p3d.mtl && p3d.mtl.length>0 && jQuery('input:radio[name=product_printer]:checked').data('full_color')!='1')  {
		jQuery('#p3d-model-message-fullcolor').show();
		printable=false;
	}
	else {
		jQuery('#p3d-model-message-fullcolor').hide();
	}
	if (p3d.object && p3d.object.type=='Group' && p3d.object.children.length>1) {
		jQuery('#p3d-model-message-multiobj').show();
		if (p3d.pricing == 'checkout') {
			printable=false;
			p3dNewPricing('', p3d.pricing_multi_mesh);
		}
	}
	else {
		jQuery('#p3d-model-message-multiobj').hide();
	}


	var x_dim=parseFloat(jQuery('#stats-length').html());
	var y_dim=parseFloat(jQuery('#stats-width').html());
	var z_dim=parseFloat(jQuery('#stats-height').html());

	if (!x_dim || !y_dim || !z_dim) return false;

	var printer_width=parseFloat(jQuery('input:radio[name=product_printer]:checked').attr('data-width'));
	var printer_length=parseFloat(jQuery('input:radio[name=product_printer]:checked').attr('data-length'));
	var printer_height=parseFloat(jQuery('input:radio[name=product_printer]:checked').attr('data-height'));

/*      //do we need all this now?
	if (!p3dBoxFitsBox(x_dim*10, y_dim*10, z_dim*10, printer_width, printer_length, printer_height)) {
		p3dShowError(p3d.error_box_fit); 
		printable=false;
	}
	else if (!p3dBoxFitsBoxXY(x_dim*10, y_dim*10, printer_width, printer_length)) {
		p3dShowError(p3d.warning_box_fit);
	}
*/

	if (!printable) { 
		p3dDisplayPrice(false);
		p3dDisplayAddToCart(false);
	}
	else { 
		jQuery('#printer_fit_error').hide();
	}

	printable=window.wp.hooks.applyFilters('3dprint.checkPrintability', printable);

	return printable;
}
function p3dPriceDebug(msg, value) {
	if (p3d.price_debug_mode=='on' && value.toFixed(p3d.price_num_decimals) > 0)
		console.log('PRICE DEBUG '+msg+' '+value.toFixed(p3d.price_num_decimals));
}

function p3dCalculatePrintingCost( product_info ) {


	var material = jQuery('input[name=product_filament]:checked');
	var coating = jQuery('input[name=product_coating]:checked');
	var printer = jQuery('input[name=product_printer]:checked');

	if (typeof(material)=='undefined') return;
	if (typeof(printer)=='undefined') return;

	var printer_price_fields = ['', '1', '2', '3', '4'];
	var material_price_fields = ['', '1', '2'];
	var coating_price_fields = ['', '1'];

	var material_cost = 0;
	var coating_cost = 0;
	var printing_cost = 0;

	var material_pct = 0;
	var coating_pct = 0;
	var printing_pct = 0;


	printing_volume=product_info['model']['material_volume'];

	var removed_material_volume = product_info['model']['box_volume']-printing_volume;

	if (p3d.price_debug_mode=='on') console.clear();

	for (var p=0;p<material_price_fields.length;p++) {

		if ( !isNaN ( material.data('price'+material_price_fields[p]) ) ) {
			if ( material.data('price_type'+material_price_fields[p])=='cm3' ) {
				material_cost+=( printing_volume )*material.data('price'+material_price_fields[p]);
				p3dPriceDebug("Material '"+material.data('name')+"' Price Field "+p+" volume charges:", material.data('price'+material_price_fields[p]));
			}
			else if ( material.data('price_type'+material_price_fields[p])=="box_volume" ) {
				material_cost+=product_info['model']['box_volume']*material.data('price'+material_price_fields[p]);
				p3dPriceDebug("Material '"+material.data('name')+"' Price Field "+p+" box volume charges:", material.data('price'+material_price_fields[p]));
			}
			else if ( material.data('price_type'+material_price_fields[p])=="removed_material_volume" ) {
				material_cost+=removed_material_volume*material.data('price'+material_price_fields[p]);
				p3dPriceDebug("Material '"+material.data('name')+"' Price Field "+p+" removed volume charges:", material.data('price'+material_price_fields[p]));
			}
			else if ( material.data('price_type'+material_price_fields[p])=='gram' ) {
				material_cost+=product_info['model']['weight']*material.data('price'+material_price_fields[p]);
				p3dPriceDebug("Material '"+material.data('name')+"' Price Field "+p+" weight charges:", material.data('price'+material_price_fields[p]));
			}
			else if ( material.data('price_type'+material_price_fields[p])=='volumetric_weight' ) {
				var volumetric_weight_indicator = material.data('volumetric-weight-indicator');
				if (volumetric_weight_indicator!=0) {
					var volumetric_weight = product_info['model']['box_volume'] / volumetric_weight_indicator;
					var max_weight = Math.max(volumetric_weight, product_info['model']['weight']);
					material_cost+=max_weight*material.data('price'+material_price_fields[p]);
					p3dPriceDebug("Material '"+material.data('name')+"' Price Field "+p+" volumetric weight charges:", (max_weight*material.data('price'+material_price_fields[p])));
				}
			}
			else if ( material.data('price_type'+material_price_fields[p])=='fixed' ) {
				material_cost+=material.data('price'+material_price_fields[p]);
				p3dPriceDebug("Material '"+material.data('name')+"' Price Field "+p+" fixed charges:", material.data('price'+material_price_fields[p]));
			}
			else if ( material.data('price_type'+material_price_fields[p])=='hour' ) {
				material_cost+=(parseFloat(p3d.print_time) / 3600) * material.data('price'+material_price_fields[p]);
				p3dPriceDebug("Material '"+material.data('name')+"' Price Field "+p+" per hour charges:", (parseFloat(p3d.print_time) / 3600) * material.data('price'+material_price_fields[p]));
			}
			else if ( material.data('price_type'+material_price_fields[p])=='pct' ) {
				material_pct+=material.data('price'+material_price_fields[p]);
				p3dPriceDebug("Material '"+material.data('name')+"' Price Field "+p+" % charges:", material.data('price'+printer_price_fields[p]));
			}
		}
		else if ( material.data('price'+material_price_fields[p]).indexOf(':')>-1 ) {
	
			var material_volume_pricing_array = material.data('price'+material_price_fields[p]).split(';');

			for (var i = material_volume_pricing_array.length-1; i >= 0; i--) {
				var discount_rule = material_volume_pricing_array[i].split(':');
				if (discount_rule.length == 2) {
					var amount = parseFloat(discount_rule[0]);
					var price = parseFloat(discount_rule[1]);	

					if ( material.data('price_type'+material_price_fields[p])=='cm3' ) {
						if (printing_volume >= amount ) {
							material_cost += printing_volume * price;
							p3dPriceDebug("Material '"+material.data('name')+"' Price Field "+p+" volume charges by formula "+material.data('price'+material_price_fields[p])+":", printing_volume * price);
							break;
						}
					}
					else if ( material.data('price_type'+material_price_fields[p])=='gram' ) {
						if (product_info['model']['weight'] >= amount)  {
							material_cost += product_info['model']['weight'] * price;
							p3dPriceDebug("Material '"+material.data('name')+"' Price Field "+p+" weight charges by formula "+material.data('price'+material_price_fields[p])+":", product_info['model']['weight'] * price);
							break;
						}
					}
					else if ( material.data('price_type'+material_price_fields[p])=='removed_material_volume' ) {
						if (removed_material_volume >= amount)  {
							material_cost += removed_material_volume * price;
							p3dPriceDebug("Material '"+material.data('name')+"' Price Field "+p+" removed volume charges by formula "+material.data('price'+material_price_fields[p])+":", removed_material_volume * price);
							break;
						}
					}
					else if ( material.data('price_type'+material_price_fields[p])=='fixed' ) {
						if (printing_volume >= amount ) {
							material_cost += price;
							p3dPriceDebug("Material '"+material.data('name')+"' Price Field "+p+" fixed charges by formula "+material.data('price'+material_price_fields[p])+":", price);
							break;
						}
					}
				}
			}
		}
	}

	p3dPriceDebug("Material Total Cost:", material_cost);

	for (var p=0;p<printer_price_fields.length;p++) {

		if ( !isNaN ( printer.data('price'+printer_price_fields[p]) ) ) {
			if ( printer.data('price_type'+printer_price_fields[p])=="material_volume" ) {
				printing_cost+=printing_volume*printer.data('price'+printer_price_fields[p]);
				p3dPriceDebug("Printer '"+printer.data('name')+"' Price Field "+p+" volume charges:", printer.data('price'+printer_price_fields[p]));
			}
			else if ( printer.data('price_type'+printer_price_fields[p])=="box_volume" ) {
				printing_cost+=product_info['model']['box_volume']*printer.data('price'+printer_price_fields[p]);
				p3dPriceDebug("Printer '"+printer.data('name')+"' Price Field "+p+" box volume charges:", printer.data('price'+printer_price_fields[p]));
			}
			else if ( printer.data('price_type'+printer_price_fields[p])=="removed_material_volume" ) {
				printing_cost+=removed_material_volume*printer.data('price'+printer_price_fields[p]);
				p3dPriceDebug("Printer '"+printer.data('name')+"' Price Field "+p+" removed volume charges:", printer.data('price'+printer_price_fields[p]));
			}
			else if ( printer.data('price_type'+printer_price_fields[p])=="gram" ) {
				printing_cost+=product_info['model']['weight']*printer.data('price'+printer_price_fields[p]);
				p3dPriceDebug("Printer '"+printer.data('name')+"' Price Field "+p+" weight charges:", printer.data('price'+printer_price_fields[p]));
			}
			else if ( printer.data('price_type'+printer_price_fields[p])=="hour" ) {
				printing_cost += (parseFloat(p3d.print_time) / 3600) * printer.data('price'+printer_price_fields[p]);
				p3dPriceDebug("Printer '"+printer.data('name')+"' Price Field "+p+" per hour charges:", (parseFloat(p3d.print_time) / 3600) * printer.data('price'+printer_price_fields[p]));
			}
			else if ( printer.data('price_type'+printer_price_fields[p])=="fixed" ) {
				printing_cost += printer.data('price'+printer_price_fields[p]);
				p3dPriceDebug("Printer '"+printer.data('name')+"' Price Field "+p+" fixed charges:", printer.data('price'+printer_price_fields[p]));
			}
			else if ( printer.data('price_type'+printer_price_fields[p])=="pct" ) {
				printing_pct += printer.data('price'+printer_price_fields[p]);
				p3dPriceDebug("Printer '"+printer.data('name')+"' Price Field "+p+" % charges:", printer.data('price'+printer_price_fields[p]));
			}
		}
		else if ( printer.data('price'+printer_price_fields[p]).indexOf(':')>-1 ) {
			var printer_volume_pricing_array = printer.data('price'+printer_price_fields[p]).split(';');
			for (var i = printer_volume_pricing_array.length-1; i >=0; i--) {
				var discount_rule = printer_volume_pricing_array[i].split(':');
				if (discount_rule.length == 2) {
					var amount = parseFloat(discount_rule[0]);
					var price = parseFloat(discount_rule[1]);	
					if ( printer.data('price_type'+printer_price_fields[p])=='material_volume' ) {
						if (printing_volume >= amount) {
							printing_cost += printing_volume * price;
							p3dPriceDebug("Printer '"+printer.data('name')+"' Price Field "+p+" volume charges by formula "+printer.data('price'+material_price_fields[p])+":", printing_volume * price);
							break;
						}
					}
					else if ( printer.data('price_type'+printer_price_fields[p])=='box_volume' ) {
						if (product_info['model']['box_volume'] >= amount) {
							printing_cost += product_info['model']['box_volume'] * price;
							p3dPriceDebug("Printer '"+printer.data('name')+"' Price Field "+p+" box volume charges by formula "+printer.data('price'+printer_price_fields[p])+":", product_info['model']['box_volume'] * price);
							break;
						}
					}
					else if ( printer.data('price_type'+printer_price_fields[p])=='removed_material_volume' ) {
						if (removed_material_volume >= amount) {
							printing_cost += removed_material_volume * price;
							p3dPriceDebug("Printer '"+printer.data('name')+"' Price Field "+p+" removed volume charges by formula "+printer.data('price'+printer_price_fields[p])+":", removed_material_volume * price);
							break;
						}
					}
					else if ( printer.data('price_type'+printer_price_fields[p])=='gram' ) {
						if (product_info['model']['weight'] >= amount) {
							printing_cost += product_info['model']['weight'] * price;
							p3dPriceDebug("Printer '"+printer.data('name')+"' Price Field "+p+" weight charges by formula "+printer.data('price'+printer_price_fields[p])+":", product_info['model']['weight'] * price);
							break;
						}
					}
					else if ( printer.data('price_type'+printer_price_fields[p])=='fixed' ) {
						if (printing_volume >= amount) {
							printing_cost += price;
							p3dPriceDebug("Printer '"+printer.data('name')+"' Price Field "+p+" fixed charges by formula "+printer.data('price'+printer_price_fields[p])+":", price);
							break;
						}
					}
				}
			}
		}

	}

	if (p3d.print_time>0) {
		var print_hours = p3d.print_time/3600;
		var printer_energy_hourly_cost = printer.data('printer_energy_hourly_cost');
		var printer_depreciation_hourly_cost = printer.data('printer_depreciation_hourly_cost');
		var printer_repair_hourly_cost = printer.data('printer_repair_hourly_cost');
		printing_cost += print_hours * printer_energy_hourly_cost;
		p3dPriceDebug("Printer Energy Hourly Cost:", print_hours * printer_energy_hourly_cost);
		printing_cost += print_hours * printer_depreciation_hourly_cost;
		p3dPriceDebug("Printer Depreciation Cost:", print_hours * printer_depreciation_hourly_cost);
		printing_cost += print_hours * printer_repair_hourly_cost;
		p3dPriceDebug("Printer Repair Cost:", print_hours * printer_repair_hourly_cost);
	}

	p3dPriceDebug("Printer Total Cost:", printing_cost);

	for (var p=0;p<coating_price_fields.length;p++) {
		if (typeof(coating.data('price'+coating_price_fields[p]))!=='undefined') {
			if ( !isNaN ( coating.data('price'+coating_price_fields[p]) ) ) {
				if ( coating.data('price_type'+coating_price_fields[p])=='cm2' ) {
					coating_cost += product_info['model']['surface_area'] * coating.data('price'+coating_price_fields[p]);
					p3dPriceDebug("Coating '"+coating.data('name')+"' Price Field "+p+" surface area charges:", product_info['model']['surface_area'] * coating.data('price'+coating_price_fields[p]));
				}
				else if ( coating.data('price_type'+coating_price_fields[p])=='fixed' ) {
					coating_cost += coating.data('price'+coating_price_fields[p]);
					p3dPriceDebug("Coating '"+coating.data('name')+"' Price Field "+p+" fixed charges:", coating.data('price'+coating_price_fields[p]));
				}
				else if ( coating.data('price_type'+coating_price_fields[p])=='pct' ) {
					coating_pct += coating.data('price'+coating_price_fields[p]);
					p3dPriceDebug("Coating '"+coating.data('name')+"' Price Field "+p+" % charges:", coating.data('price'+coating_price_fields[p]));
				}
			}
			else if ( coating.data('price'+coating_price_fields[p]).indexOf(':')>-1 ) {
				var surface_area_pricing_array = coating.data('price'+coating_price_fields[p]).split(';');
				for (var i = surface_area_pricing_array.length-1; i >= 0; i--) {
					var discount_rule = surface_area_pricing_array[i].split(':');
					if (discount_rule.length == 2) {
						var amount = parseFloat(discount_rule[0]);
						var price = parseFloat(discount_rule[1]);	
						if ( coating.data('price_type'+coating_price_fields[p])=='cm2' ) {
							if (product_info['model']['surface_area'] >= amount) {
								coating_cost += product_info['model']['surface_area'] * price;
								p3dPriceDebug("Coating '"+coating.data('name')+"' Price Field "+p+" surface area charges by formula "+coating.data('price'+coating_price_fields[p])+":", product_info['model']['surface_area'] * price);
								break;
							}
						}
						else if ( coating.data('price_type'+coating_price_fields[p])=='fixed' ) {
							if (product_info['model']['surface_area'] >= amount) {
								coating_cost += price;
								p3dPriceDebug("Coating '"+coating.data('name')+"' Price Field "+p+" fixed charges by formula "+coating.data('price'+coating_price_fields[p])+":", price);
								break;
							}
						}
					}
				}
			}
		}
	}

	jQuery( ".woo_attribute" ).each(function() {
		var attr_price=parseFloat(jQuery(this).find('option:selected').data('price'));
		if (isNaN(attr_price)) attr_price = 0;
		var attr_price_type=jQuery(this).find('option:selected').data('price-type');
		var attr_pct_type=jQuery(this).find('option:selected').data('pct-type');

		if (typeof(attr_pct_type)!=='undefined' && attr_price_type=='pct') {
			if (attr_pct_type=='printer') {	
				printing_cost+=(printing_cost/100)*attr_price
				p3dPriceDebug("Custom attribute '"+jQuery(this).val()+"' +% to printer cost:", (printing_cost/100)*attr_price);
			}
			else if (attr_pct_type=='material') {	
				material_cost+=(material_cost/100)*attr_price
				p3dPriceDebug("Custom attribute '"+jQuery(this).val()+"' +% to material cost:", (material_cost/100)*attr_price);
			}
			else if (attr_pct_type=='coating') {
				coating_cost+=(coating_cost/100)*attr_price
				p3dPriceDebug("Custom attribute '"+jQuery(this).val()+"' +% to coating cost:", (coating_cost/100)*attr_price);

			}
		}

	})

	printing_cost = printing_cost || 0;
	material_cost = material_cost || 0;
	coating_cost = coating_cost || 0;

	printing_pct = printing_pct || 0;
	material_pct = material_pct || 0;
	coating_pct = coating_pct || 0;

	var subtotal=printing_cost+material_cost+coating_cost;
	var total=printing_cost+material_cost+coating_cost;

//	if ((printing_pct + material_pct + coating_pct)>0) 
//		p3dPriceDebug("SUBTOTAL:", total);

//	p3dPriceDebug("Material '"+material.data('name')+"' charges +% to total:", material_pct);
//	p3dPriceDebug("Printer '"+printer.data('name')+"' Price Field "+p+" % charges:", printing_pct);
//	if (coating)
//		p3dPriceDebug("Coating '"+coating.data('name')+"' Price Field "+p+" % charges:", coating_pct);

	total+=(total/100)*(printing_pct + material_pct + coating_pct);




	var attr_total = 0;
	jQuery( ".woo_attribute" ).each(function(){
		var attr_price=parseFloat(jQuery(this).find('option:selected').data('price'));
		if (isNaN(attr_price)) attr_price = 0;
		var attr_price_type=jQuery(this).find('option:selected').data('price-type');
		var attr_pct_type=jQuery(this).find('option:selected').data('pct-type');

		if (attr_price_type=='flat') {
			total+=attr_price;
			p3dPriceDebug("Custom attribute '"+jQuery(this).val()+"' fixed charges:", attr_price);
			attr_total+=attr_price;
		}
		else if (typeof(attr_pct_type)!=='undefined' && attr_price_type=='pct' && attr_pct_type=='total') {
			total+=(total/100)*attr_price;
			p3dPriceDebug("Custom attribute '"+jQuery(this).val()+"' % charges:", attr_price);
			attr_total+=(total/100)*attr_price;
		}
	})

	p3dPriceDebug("Total Custom Attributes Cost:", attr_total);

	if (p3d.minimum_price_type=='starting_price')  {
		total = total + parseFloat(p3d.min_price);
		p3dPriceDebug("Adding Starting Price:", parseFloat(p3d.min_price));
	}
	else if (p3d.minimum_price_type=='minimum_price') {
		if (total < p3d.min_price) {
			total = parseFloat(p3d.min_price);
			p3dPriceDebug("Minimum Price:", parseFloat(p3d.min_price));
		}
	}

	if (p3d.file_url && p3d.file_url.length>0 && p3d.product_price_type && p3d.product_price_type=='fixed') {
		p3dPriceDebug("Minimum Price:", parseFloat(p3d.min_price));
		total = parseFloat(p3d.min_price) + attr_total;
	}

	total = parseFloat(total);


	p3dPriceDebug("TOTAL:", total);

	total=window.wp.hooks.applyFilters('3dprint.calculatePrintingCost', total, product_info);
	return total;
}
//an example hook
window.wp.hooks.addFilter( '3dprint.calculatePrintingCost', function  (total, product_info) {
	//do something with total
	return total;
})



function p3dGetStatsClientSide() {
	var printer_type = jQuery('input[name=product_printer]:checked').data('type');
	if (p3d.analysed_volume>0 && (printer_type == 'fff' || printer_type == 'dlp')) { //analysed on the server
		var filament_volume = p3d.analysed_volume/1000; //cm3
	}
	else if (p3d.triangulated_volume>0) {
		var filament_volume = (p3d.triangulated_volume/1000)*Math.pow(p3d.resize_scale,3); //cm3
	}
	else {
		var filament_volume = Math.abs((p3d.model_total_volume/1000)*Math.pow(p3d.resize_scale,3)); //cm3
		
	}
	if (printer_type=='dlp') {
		p3d.print_time=p3dCalculateDLPPrintTime();
	}



	if (p3d.analysed_surface_area>0 && (printer_type == 'fff' || printer_type == 'dlp')) {
		var surface_area = p3d.analysed_surface_area/100; //cm2
	}
	else if (p3d.triangulated_surface_area>0) {
		var surface_area = (p3d.triangulated_surface_area/100)*Math.pow(p3d.resize_scale,2); //cm2
	}
	else {
		var surface_area = (p3d.model_surface_area/100)*Math.pow(p3d.resize_scale,2); //cm2
	}
	var model_x=model_y=model_z=0;


	model_x = (Math.abs(p3d.boundingBox.max.x - p3d.boundingBox.min.x)/10)*p3d.resize_scale
	model_y = (Math.abs(p3d.boundingBox.max.y - p3d.boundingBox.min.y)/10)*p3d.resize_scale
	model_z = (Math.abs(p3d.boundingBox.max.z - p3d.boundingBox.min.z)/10)*p3d.resize_scale


        

	var box_volume = model_x * model_y * model_z; 
	var material_coeff = 100; //%
	var unit_multiplier = p3dGetUnitMultiplier();

	jQuery( ".woo_attribute" ).each(function() {
		var attr_price=parseFloat(jQuery(this).find('option:selected').data('price'));
		if (isNaN(attr_price)) attr_price = 0;
		var attr_price_type=jQuery(this).find('option:selected').data('price-type');
		var attr_pct_type=jQuery(this).find('option:selected').data('pct-type');

		if (typeof(attr_pct_type)!=='undefined' && attr_price_type=='pct') {
			if (attr_pct_type=='material_amount') {	
				material_coeff+=attr_price
			}

		}

	})



	model_x = model_x*unit_multiplier;
	model_y = model_y*unit_multiplier;
	model_z = model_z*unit_multiplier;
	surface_area=surface_area*Math.pow(unit_multiplier, 2);
	box_volume = model_x*model_y*model_z; 
	if (p3d.api_analyse!='on' || (printer_type != 'fff' && printer_type != 'dlp')) {
		filament_volume = filament_volume*Math.pow(unit_multiplier, 3);
	}


	var product_info = new Array();
	product_info['model'] = new Array();
	product_info['model']['x_dim'] = parseFloat(model_x);
	product_info['model']['y_dim'] = parseFloat(model_y);
	product_info['model']['z_dim'] = parseFloat(model_z);
	product_info['model']['material_volume'] = parseFloat(filament_volume)*(material_coeff/100);
	product_info['model']['box_volume'] = parseFloat(box_volume);
	product_info['model']['surface_area'] = parseFloat(surface_area);
	product_info['model']['weight'] = parseFloat(filament_volume * parseFloat(jQuery('input[name=product_filament]:checked').data('density')) * (material_coeff/100));
	product_info=window.wp.hooks.applyFilters('3dprint.getStatsClientSide', product_info);
	return product_info;
}

function p3dPrepareNinjaForm() {
	var printer_id=jQuery('input:radio[name=product_printer]:checked').attr('data-id');
	var material_id=jQuery('input:radio[name=product_filament]:checked').attr('data-id');
	if (typeof(jQuery('input:radio[name=product_coating]:checked').attr('data-id'))!=='undefined')
		var coating_id=jQuery('input:radio[name=product_coating]:checked').attr('data-id');
	else 
		var coating_id='';
	var product_id=jQuery('#p3d_product_id').val();
	var model=jQuery('#pa_p3d_model').val();
	var model_unit=jQuery("input[name=p3d_unit]:checked").val();
	var infill = jQuery('input[name=product_infill]:checked').data('id');
	var original_filename = jQuery('#pa_p3d_filename').val();


	var thumbnail_data =  window.p3d_canvas.toDataURL().replace('data:image/png;base64,','');


	var model_dim = new Array();	
	model_dim.x = p3d.boundingBox.max.x - p3d.boundingBox.min.x;
	model_dim.y = p3d.boundingBox.max.y - p3d.boundingBox.min.y;
	model_dim.z = p3d.boundingBox.max.z - p3d.boundingBox.min.z;

	var dim_x = ((model_dim.y*p3d.resize_scale*p3dGetUnitMultiplier())/10).toFixed(2);
	var dim_y = ((model_dim.x*p3d.resize_scale*p3dGetUnitMultiplier())/10).toFixed(2);
	var dim_z = ((model_dim.z*p3d.resize_scale*p3dGetUnitMultiplier())/10).toFixed(2);
//p3d.ninjaforms_form_id
	if (typeof(nfForms)!=='undefined' && nfForms.length>0) {
		for (var n=0;n<nfForms.length;n++) {
			if (nfForms[n].id!=p3d.ninjaforms_form_id) continue;
			for (var i=0;i<nfForms[n].fields.length;i++) {


				switch (nfForms[0].fields[i].key) {
					case 'nf_p3d_printer':
	        				jQuery('#nf-field-'+nfForms[0].fields[i].id).val(printer_id);
					break;
					case 'nf_p3d_material':
	        				jQuery('#nf-field-'+nfForms[0].fields[i].id).val(material_id);
					break;
					case 'nf_p3d_coating':
	        				jQuery('#nf-field-'+nfForms[0].fields[i].id).val(coating_id);
					break;
					case 'nf_p3d_product_id':
	        				jQuery('#nf-field-'+nfForms[0].fields[i].id).val(product_id);
					break;
					case 'nf_p3d_infill':
	        				jQuery('#nf-field-'+nfForms[0].fields[i].id).val(infill);
					break;
					case 'nf_p3d_resize_scale':
        				jQuery('#nf-field-'+nfForms[0].fields[i].id).val(p3d.resize_scale);
					break;
					case 'nf_p3d_unit':
	        				jQuery('#nf-field-'+nfForms[0].fields[i].id).val(model_unit);
					break;
					case 'nf_p3d_filename':
	        				jQuery('#nf-field-'+nfForms[0].fields[i].id).val(original_filename);
	
					break;
					case 'nf_p3d_model':
	        				jQuery('#nf-field-'+nfForms[0].fields[i].id).val(model);
					break;
					case 'nf_p3d_thumbnail':
	        				jQuery('#nf-field-'+nfForms[0].fields[i].id).val(thumbnail_data);
					break;
					case 'nf_p3d_dim_x':
	        				jQuery('#nf-field-'+nfForms[0].fields[i].id).val(dim_x);
					break;
					case 'nf_p3d_dim_y':
		       				jQuery('#nf-field-'+nfForms[0].fields[i].id).val(dim_y);
					break;
					case 'nf_p3d_dim_z':
	        				jQuery('#nf-field-'+nfForms[0].fields[i].id).val(dim_z);
					break;
					case 'nf_p3d_estimated_price':
	        				jQuery('#nf-field-'+nfForms[0].fields[i].id).val(jQuery('#p3d_estimated_price').val());
					break;
				}
			}
		}
	}

}
//jQuery('#p3d_estimated_price').val
function p3dGetStats() {
//	jQuery('.p3d-stats').hide(); 
	p3dDisplayPrice(false);
	p3dDisplayAddToCart(false);
	jQuery('#p3d-console').html('').hide();

	
	var printer_id=jQuery('input:radio[name=product_printer]:checked').attr('data-id');
	var material_id=jQuery('input:radio[name=product_filament]:checked').attr('data-id');
	if (typeof(jQuery('input:radio[name=product_coating]:checked').attr('data-id'))!=='undefined')
		var coating_id=jQuery('input:radio[name=product_coating]:checked').attr('data-id');
	else 
		var coating_id='';
	var product_id=jQuery('#p3d_product_id').val();
	var model=jQuery('#pa_p3d_model').val();
	var model_unit=jQuery("input[name=p3d_unit]:checked").val();

	if (p3d.model_mesh) {
		var product_info=p3dGetStatsClientSide();

		var product_price=parseFloat(p3dCalculatePrintingCost(product_info));

		var response = new Array();
		response.model = new Array();
		response.model = product_info['model'];

		if (p3d.price_num_decimals<0) response.price = p3dRoundPrice(product_price);
		else response.price = product_price.toFixed(p3d.price_num_decimals);

		if (p3d.currency_position=='left')
			accounting.settings.currency.format = "%s%v";
		else if (p3d.currency_position=='left_space')
			accounting.settings.currency.format = "%s %v";
		else if (p3d.currency_position=='right')
			accounting.settings.currency.format = "%v%s";
		else if (p3d.currency_position=='right_space')
			accounting.settings.currency.format = "%v %s";

		if (p3d.price_num_decimals<0)
			response.html_price = accounting.formatMoney(p3dRoundPrice(product_price), p3d.currency_symbol, 0, p3d.thousand_sep, p3d.decimal_sep);
		else 
			response.html_price = accounting.formatMoney(product_price, p3d.currency_symbol, p3d.price_num_decimals, p3d.thousand_sep, p3d.decimal_sep);

		jQuery('#p3d_estimated_price').val(response.price);
		p3dShowResponse(response);
		//p3dPrepareNinjaForm();
	}
	window.wp.hooks.doAction( '3dprint.getStats');

}

function p3dRoundPrice(price) {
	var new_price =  (price / (Math.abs(p3d.price_num_decimals)*10)).toFixed() * (Math.abs(p3d.price_num_decimals)*10);
	if (new_price == 0) new_price = Math.pow(10, Math.abs(p3d.price_num_decimals));
	return new_price;
}

function p3dShowResponse(response) {

	if (response.error) { //fatal error
		p3d.fatal_error = true
		p3dDisplayQuoteLoading(false); 
		p3dShowError(response.error);
		return;
	}
	var printer_type = jQuery('input[name=product_printer]:checked').data('type');

//	if (window.p3d_uploader.state==1 && !p3d.checking) p3dDisplayQuoteLoading(false);
	if (!p3d.uploading && !p3d.checking && !p3d.repairing && !((p3d.xhr1 && p3d.xhr1.readyState != 4) || (p3d.xhr2 && p3d.xhr2.readyState != 4))) {p3dDisplayQuoteLoading(false);}
	if (response.model) {
		if (response.model.error) p3dShowError(response.model.error); //soft error
		jQuery('#stats-material-volume').html(response.model.material_volume.toFixed(2));
		jQuery('#stats-box-volume').html(response.model.box_volume.toFixed(2));
		jQuery('#stats-surface-area').html(response.model.surface_area.toFixed(2));
		jQuery('#stats-width').html(response.model.x_dim.toFixed(2));
		jQuery('#stats-length').html(response.model.y_dim.toFixed(2));
		jQuery('#stats-height').html(response.model.z_dim.toFixed(2));
		jQuery('#stats-weight').html(response.model.weight.toFixed(2));
		jQuery('#stats-polygons').html(p3d.model_mesh.geometry.faces.length);
		jQuery('#stats-hours').html((parseFloat(p3d.print_time)/3600).toFixed(1));

		jQuery('#scale_x').val(response.model.x_dim.toFixed(3));
		jQuery('#scale_y').val(response.model.y_dim.toFixed(3));
		jQuery('#scale_z').val(response.model.z_dim.toFixed(3));

		jQuery('#scale_x').data('real_value', response.model.x_dim);
		jQuery('#scale_y').data('real_value', response.model.y_dim);
		jQuery('#scale_z').data('real_value', response.model.z_dim);





		p3dDisplayStats(true)
	}

	if ( p3dCheckPrintability() ) {
		if ( (!p3d.analyse_error && !((p3d.xhr1 && p3d.xhr1.readyState != 4) || (p3d.xhr2 && p3d.xhr2.readyState != 4)) && !p3d.checking && !p3d.uploading && !p3d.repairing) || (printer_type != 'fff' && printer_type != 'dlp') ) {

			if (p3d.pricing!='request' || (p3d.new_pricing=='request_estimate')) {
				p3dDisplayPrice(true);
			}
			if (!p3d.uploading && !p3d.repairing) {
				p3dDisplayAddToCart(true);
			}
			if (!p3d.uploading || !p3d.filereader_supported) {
				p3dDisplayAddToCart(true);
			}

			//jQuery('p.price meta[itemprop=price]').attr('content',response.price);
			jQuery('p.price span.amount').html(response.html_price);
		}
	}

	window.wp.hooks.doAction( '3dprint.showResponse');
}
function p3dCalculateWeight(material_volume) {
	var density = parseFloat(jQuery('input[name=product_filament]:checked').attr('data-density'));
	var weight = material_volume*density;
	return weight.toFixed(2);
}


function p3dDisplayUserDefinedProgressBar(show) {
	if(show) {
		jQuery('#p3d-file-loading').show();
	}
	else {
		if (!p3d.repairing) {
			jQuery('#p3d-file-loading').hide();
		}
	}
}



function p3dDisplayConsole(show) {
	if (show) {
		jQuery('#p3d-console').show();
	}
	else {
		jQuery('#p3d-console').hide();
	}
}

function p3dDisplayAddToCart(show) {
//console.log("p3dDisplayAddToCart("+show+")  " + arguments.callee.caller.toString());
	if (show && !p3d.fatal_error && !p3d.printer_error && p3d.new_pricing!='request') {
		jQuery('#add-cart-container').css('visibility', 'visible');
//		jQuery('#add-cart-container').show();
	}
	else {
		jQuery('#add-cart-container').css('visibility', 'hidden');
//		jQuery('#add-cart-container').hide();
	}
}


function p3dDisplayQuoteLoading(show) {
//if (!show)
//console.log("p3dDisplayQuoteLoading("+show+")  " + arguments.callee.caller.toString());
	if (show) {
		jQuery('#p3d-quote-loading').css('visibility', 'visible');
	}
	else {
		jQuery('#p3d-quote-loading').css('visibility', 'hidden');
	}
}

function p3dDisplayRequestForm(show) {
	if (p3d.uploading) show=false;

	if (show) {

		jQuery('#p3d-request-form').show();
		jQuery('#p3d-request-form').css('visibility', 'visible');
		jQuery('#p3d-repair-status, #p3d-canvas-repair-status').hide();
		jQuery('#p3d-analyse-status, #p3d-canvas-analyse-status').hide();
		jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();
		if (p3d.use_ninjaforms=='on') {
			jQuery('#add-cart-wrapper div.nf-form-cont').show();
		}

	}
	else {
		jQuery('#p3d-request-form').hide();
		jQuery('#p3d-request-form').css('visibility', 'hidden');
		if (p3d.use_ninjaforms=='on') {
			jQuery('#add-cart-wrapper div.nf-form-cont').hide();
		}
	}
}

function p3dDisplayPrice(show) {
	if (show && !p3d.fatal_error && !p3d.printer_error && (p3d.pricing!='request' || p3d.new_pricing=='request_estimate')) {
		jQuery('p.price').css('visibility', 'visible');
		jQuery('p.price').show();
	}
	else {
		jQuery('p.price').css('visibility', 'hidden');
	}
}

function p3dNewPricing (filename, new_pricing) {
//        p3d.new_pricing='';
	if (new_pricing=='checkout' && filename.length==0 && p3d.fatal_error!=1 && p3d.printer_error!=1) {
		p3d.new_pricing='checkout';
		jQuery('#checkout-add-to-cart').val(jQuery('#p3d_product_id').val());
		p3dDisplayAddToCart(true);
		p3dDisplayRequestForm(false);
	}
	else if (new_pricing=='checkout' && filename.length>0) {
		p3d.new_pricing='checkout';
		jQuery('#checkout-add-to-cart').val(jQuery('#p3d_product_id').val());
		p3dAnalyseModel(filename); //try to use the old file anyways
	}
	else if (new_pricing=='request_estimate') {
		p3d.new_pricing='request_estimate';
		jQuery('#checkout-add-to-cart').val('');
		p3dDisplayAddToCart(false);
		p3dDisplayPrice(true);
		p3dDisplayRequestForm(true);
//		p3dDisplayQuoteLoading(false);
//		jQuery('#p3d-analyse-status, #p3d-canvas-analyse-status').hide();
//		jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();

	}
	else if (new_pricing=='request') {
		p3d.new_pricing='request';
		jQuery('#checkout-add-to-cart').val('');
		p3dDisplayAddToCart(false);
		p3dDisplayPrice(false);
		p3dDisplayRequestForm(true);
//		p3dDisplayQuoteLoading(false);
//		jQuery('#p3d-analyse-status, #p3d-canvas-analyse-status').hide();
//		jQuery('#stats-material-volume-loading, #stats-material-weight-loading, #stats-hours-loading').hide();


	}
}


function p3dDisplayStats(show) {
	if (show) {
		jQuery('.p3d-stats').css('visibility','visible');
	}
	else {
		jQuery('.p3d-stats').css('visibility','hidden');
	}
}




function p3dDetectIE() {
	var ua = window.navigator.userAgent;

	var msie = ua.indexOf('MSIE ');
	if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
       // IE 12 => return version number
       return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
   }

    // other browser
    return false;
}



function p3dRemoveGroupObjectByName(name) {
	var o = p3d.group.getObjectByName(name);
	p3d.group.remove( o )
}

function p3dDrawPrinterBox() {
	if (!p3d.model_mesh) return; //basically we build the box around the model
	p3dRemoveGroupObjectByName('printer');
	p3dRemoveGroupObjectByName('printer bed');
	p3dRemoveGroupObjectByName('printer roof');
	var printer_id = jQuery('input[name=product_printer]:checked').data('id') 
	var unit = jQuery('input[name=p3d_unit]:checked').val();
	var platform_shape = jQuery('input[name=product_printer]:checked').data('platform_shape') ;
	var printer_radius = parseFloat(jQuery('input[name=product_printer]:checked').data('diameter'))/2 ;


	var printer_dim=new Array();
	printer_dim.x=jQuery('#p3d_printer_'+printer_id).data('length')
	printer_dim.y=jQuery('#p3d_printer_'+printer_id).data('width')
	printer_dim.z=jQuery('#p3d_printer_'+printer_id).data('height')

	var min_z = p3d.boundingBox.min.z;
	var model_ydim = p3d.boundingBox.max.x - p3d.boundingBox.min.x;
	var model_xdim = p3d.boundingBox.max.y - p3d.boundingBox.min.y;
	var model_zdim = p3d.boundingBox.max.z - p3d.boundingBox.min.z;

	if (platform_shape=='rectangle' || platform_shape.length==0) {
		//xy rotation
		if (model_xdim > model_ydim && printer_dim.y > printer_dim.x) {
			tmpvar=printer_dim.x;
			printer_dim.x=printer_dim.y;
			printer_dim.y=tmpvar;
		}
	
		if (model_ydim > model_xdim && printer_dim.x > printer_dim.y) {
			tmpvar=printer_dim.y;
			printer_dim.y=printer_dim.x;
			printer_dim.x=tmpvar;
		}

	}

	var material = new THREE.LineBasicMaterial({
		color: parseInt(p3d.printer_color, 16)
	});




//	p3d.model_mesh.geometry.computeBoundingSphere();
//	var radius = p3d.model_mesh.geometry.boundingSphere.radius;
	if (platform_shape=='circle') {
		var segmentCount = 32,
		radius = printer_radius,
		geometry = new THREE.Geometry(),
		material = new THREE.LineBasicMaterial({ color: parseInt(p3d.printer_color, 16) });

		for (var i = 0; i <= segmentCount; i++) {
			var theta = (i / segmentCount) * Math.PI * 2;
			geometry.vertices.push(
				new THREE.Vector3(
				Math.cos(theta) * radius,
				Math.sin(theta) * radius,
				0));            
		}

		p3d.model_printer_bed = new THREE.Line(geometry, material);
		p3d.model_printer_bed.position.set( 0, min_z, 0 );
		p3d.model_printer_bed.rotation.z = 90 * Math.PI/180;
		p3d.model_printer_bed.rotation.x = -90 * Math.PI/180;
		p3d.model_printer_bed.name = "printer bed";
		p3d.model_printer_bed.geometry.computeBoundingBox();
		if (p3d.show_printer_box!='on' || p3d.printer_color=='') {
			p3d.model_printer_bed.visible=false;
		}

//		p3d.model_printer_roof = p3d.model_printer_bed.clone();
		p3d.model_printer_roof = new THREE.Line(geometry, material);
		p3d.model_printer_roof.position.set( 0, min_z+printer_dim.z, 0 );
		p3d.model_printer_roof.rotation.z = 90 * Math.PI/180;
		p3d.model_printer_roof.rotation.x = -90 * Math.PI/180;
//		p3d.model_printer_roof.position.set( 0, min_z+printer_dim.z, 0 );
		p3d.model_printer_roof.name = "printer roof";
		p3d.model_printer_roof.geometry.computeBoundingBox();
		if (p3d.show_printer_box!='on' || p3d.printer_color=='') {
			p3d.model_printer_roof.visible=false;
		}


		p3d.scene.add(p3d.model_printer_bed);
		p3d.scene.add(p3d.model_printer_roof);
		p3d.group.add( p3d.model_printer_bed );
		p3d.group.add( p3d.model_printer_roof );

	}

	else {
		var geometry = new THREE.Geometry();
		geometry.vertices.push(
	 		new THREE.Vector3( - printer_dim.x/2, min_z, - printer_dim.y/2),
	 		new THREE.Vector3( - printer_dim.x/2, min_z, printer_dim.y/2),
	   		new THREE.Vector3( printer_dim.x/2, min_z, printer_dim.y/2),
	   		new THREE.Vector3( printer_dim.x/2, min_z, - printer_dim.y/2),
	 		new THREE.Vector3( - printer_dim.x/2, min_z, - printer_dim.y/2),

	 		new THREE.Vector3( - printer_dim.x/2, min_z + printer_dim.z, - printer_dim.y/2),
	 		new THREE.Vector3( - printer_dim.x/2, min_z + printer_dim.z, printer_dim.y/2),
	   		new THREE.Vector3( printer_dim.x/2, min_z + printer_dim.z, printer_dim.y/2),
	   		new THREE.Vector3( printer_dim.x/2, min_z + printer_dim.z, - printer_dim.y/2),
	 		new THREE.Vector3( - printer_dim.x/2, min_z + printer_dim.z, - printer_dim.y/2),

	 		new THREE.Vector3(  printer_dim.x/2, min_z + printer_dim.z, - printer_dim.y/2),
	 		new THREE.Vector3(  printer_dim.x/2, min_z, - printer_dim.y/2),
	 		new THREE.Vector3(  printer_dim.x/2, min_z,  printer_dim.y/2),
	 		new THREE.Vector3(  printer_dim.x/2, min_z + printer_dim.z,  printer_dim.y/2),
	 		new THREE.Vector3(  -printer_dim.x/2, min_z + printer_dim.z,  printer_dim.y/2),
	 		new THREE.Vector3(  -printer_dim.x/2, min_z,  printer_dim.y/2)


		);
		p3d.model_printer = new THREE.Line( geometry, material );



		p3d.model_printer.name = "printer";
		p3d.model_printer.geometry.computeBoundingBox();
		if (p3d.show_printer_box!='on' || p3d.printer_color=='') {
			p3d.model_printer.visible=false;
		}

		p3d.scene.add( p3d.model_printer );
		p3d.group.add( p3d.model_printer );
	}

 	window.wp.hooks.doAction( '3dprint.drawPrinterBox');
}



function p3dSignedVolume(p1, p2, p3) {
	if (p1 && p2 && p3) {
		v321 = p3[0]*p2[1]*p1[2];
		v231 = p2[0]*p3[1]*p1[2];
		v312 = p3[0]*p1[1]*p2[2];
		v132 = p1[0]*p3[1]*p2[2];
		v213 = p2[0]*p1[1]*p3[2];
		v123 = p1[0]*p2[1]*p3[2];

		return (1.0/6.0)*(-v321 + v231 + v312 - v132 - v213 + v123);
	}
}

function p3dSurfaceArea(p1, p2, p3) {
	if (p1 && p2 && p3) {
		ax = p2[0] - p1[0];
		ay = p2[1] - p1[1];
		az = p2[2] - p1[2];
		bx = p3[0] - p1[0];
		by = p3[1] - p1[1];
		bz = p3[2] - p1[2];
		cx = ay*bz - az*by;
		cy = az*bx - ax*bz;
		cz = ax*by - ay*bx;
		return 0.5 * Math.sqrt(cx*cx + cy*cy + cz*cz);
	}
}
function p3dAngleToRadians (angle) {
	return angle * (Math.PI / 180);
}

function p3dRotateModel(axis, degree) {

	if (p3d.mtl && p3d.mtl.length>0) {
		jQuery('#p3d-console').html(p3d.text_cant_rotate_obj+"<br>");
		jQuery('#p3d-console').show();
		return;
	}

	if (isNaN(degree)) degree=0;

//	if (jQuery('#'))
//	p3dDisableControls();
	jQuery('#p3d-apply-button').show();
	if ((jQuery('#rotation_x').val() + jQuery('#rotation_y').val() + jQuery('#rotation_z').val())==0) {
		p3dEnableControls();
	}
	else {
		p3dDisableControls();
		jQuery('#rotation_x, #rotation_y, #rotation_z, #p3d-apply-button').prop('disabled', false);
	}



	if (axis=='x') {
		jQuery("#rotation_x").focus();
		p3d.model_mesh.rotation.x=p3d.initial_rotation_x+p3dAngleToRadians(degree);
//		p3d.model_mesh.geometry.applyMatrix( new THREE.Matrix4().makeRotationY( p3dAngleToRadians(degree)-p3d.prev_rotation_x ) );
//		p3d.prev_rotation_x = p3dAngleToRadians(degree);
		if (p3d.object.type=='Group') {
			p3d.object.rotation.x=p3d.initial_rotation_x+p3dAngleToRadians(degree);
		}
	}
	if (axis=='y') {
		jQuery("#rotation_y").focus();
		p3d.model_mesh.rotation.y=p3d.initial_rotation_y+p3dAngleToRadians(degree);
//		p3d.model_mesh.geometry.applyMatrix( new THREE.Matrix4().makeRotationX( p3dAngleToRadians(degree)-p3d.prev_rotation_y ) );
//		p3d.prev_rotation_y = p3dAngleToRadians(degree);
		if (p3d.object.type=='Group') {
			p3d.object.rotation.y=p3d.initial_rotation_y+p3dAngleToRadians(degree);
		}

	}
	if (axis=='z') {
		jQuery("#rotation_z").focus();
		p3d.model_mesh.rotation.z=p3d.initial_rotation_z+p3dAngleToRadians(degree);
//		p3d.model_mesh.geometry.applyMatrix( new THREE.Matrix4().makeRotationZ( p3dAngleToRadians(degree)-p3d.prev_rotation_z ) );
//		p3d.prev_rotation_z = p3dAngleToRadians(degree);
		if (p3d.object.type=='Group') {
			p3d.object.rotation.z=p3d.initial_rotation_z+p3dAngleToRadians(degree);
		}

	}

	if (p3d.object.type=='Group') {
		//calculate new dimensions
		var bbox = new THREE.Box3().setFromObject(p3d.object);
		var mesh_height = bbox.max.y - bbox.min.y;
		var mesh_width = bbox.max.x - bbox.min.x;
		var mesh_length = bbox.max.z - bbox.min.z;
		p3d.object.position.y = p3d.scene.getObjectByName('ground').position.y+(mesh_height/2)
	}
	else {
		//calculate new dimensions
		var bbox = new THREE.Box3().setFromObject(p3d.model_mesh);
		var mesh_height = bbox.max.y - bbox.min.y;
		var mesh_width = bbox.max.x - bbox.min.x;
		var mesh_length = bbox.max.z - bbox.min.z;
		p3d.model_mesh.position.y = p3d.scene.getObjectByName('ground').position.y+(mesh_height/2)
	}

}


function p3dDialogCheck() {
//file not selected fix
	if (p3d.file_selected>0)
		jQuery('#p3d-container input[type=file]').parent().css('z-index', '999')
	p3d.file_selected++;
}

function p3dGetMaxScale(model_dim, printer_dim, printer_radius, platform_shape ) {
	var mesh_diagonal = Math.sqrt(model_dim.x * model_dim.x + model_dim.y * model_dim.y);
	var model_radius = mesh_diagonal/2; //model xy radius*/

	var max_printer_side = Math.max(printer_dim.x, printer_dim.y);
	var min_printer_side = Math.min(printer_dim.x, printer_dim.y);
	var max_model_side = Math.max(model_dim.x, model_dim.y);
	var min_model_side = Math.min(model_dim.x, model_dim.y);

	if (platform_shape=='circle') {
		max_model_side = model_radius;
		min_model_side = min_model_side/2;

		max_printer_side = printer_radius;
		min_printer_side = printer_radius;
	}

	var height_diff = printer_dim.z/model_dim.z;
	var max_side_diff = max_printer_side/max_model_side;
	var min_side_diff = min_printer_side/min_model_side;
	var side_diff = Math.min(max_side_diff, min_side_diff, height_diff);
	var max_scale = (side_diff*100)/p3dGetUnitMultiplier();

	return max_scale;
}

function p3dInitScaleSlider() {
	window.wp.hooks.doAction( '3dprint.p3dInitScaleSlider_start');

	if (!p3d.model_mesh) return false;
	var p3dRangeSlider = document.getElementById('p3d-scale');
	var printer_dim=new Array();
	var printer_type = jQuery('input[name=product_printer]:checked').data('type');

	printer_dim.x=jQuery('input[name=product_printer]:checked').data('length');
	printer_dim.y=jQuery('input[name=product_printer]:checked').data('width');
	printer_dim.z=jQuery('input[name=product_printer]:checked').data('height');
	var platform_shape = jQuery('input[name=product_printer]:checked').data('platform_shape') ;
	var printer_radius = parseFloat(jQuery('input[name=product_printer]:checked').data('diameter'))/2 ;

	
	var model_dim = new Array();
	model_dim.x = p3d.boundingBox.max.x - p3d.boundingBox.min.x;
	model_dim.y = p3d.boundingBox.max.y - p3d.boundingBox.min.y;
	model_dim.z = p3d.boundingBox.max.z - p3d.boundingBox.min.z;

	var max_scale = p3dGetMaxScale(model_dim, printer_dim, printer_radius, platform_shape);

	if (isNaN(max_scale)) return false;

	var new_printer_id = 0;
	if (max_scale < 100) {

		//check compatible printers
		var current_material = jQuery('input[name=product_filament]:checked');
		var current_printer = jQuery('input[name=product_printer]:checked');
		var material_id = current_material.data('id');
		var printer_id = current_printer.data('id');


		jQuery('input[name=product_printer]').each(function() {
			var materials = jQuery(this).data('materials')+'';
			var materials_array = materials.split(',');
			if (materials.length>0 && jQuery.inArray(material_id+'', materials_array)==-1) {
			}
			else {
				if (jQuery(this).data('id')!=printer_id) {

					var new_printer_dim=new Array();
					new_printer_dim.x=jQuery(this).data('length');
					new_printer_dim.y=jQuery(this).data('width');
					new_printer_dim.z=jQuery(this).data('height');

					var new_max_scale = p3dGetMaxScale(model_dim, new_printer_dim, parseFloat(jQuery(this).data('diameter'))/2, jQuery(this).data('platform_shape'));

					if (new_max_scale>=100) {

						new_printer_id = jQuery(this).data('id');
					}
				}
			}
		});

		jQuery('#p3d-model-message-scale').show();
		if (new_printer_id == 0) {
			if (p3d.pricing_too_large=='request') p3d.printer_error=1;
			p3dNewPricing('', p3d.pricing_too_large);
		}
	}
	else {
		p3d.printer_error=false;

		if (p3d.pricing=='checkout') {
			if (!p3d.fatal_error) {
				p3dNewPricing('', 'checkout');
				//p3dDisplayRequestForm(false);
			}
		}
//			p3dDisplayAddToCart(false);
//			p3dDisplayPrice(true);
//			p3dDisplayRequestForm(true);

		jQuery('#p3d-model-message-scale').hide();
	}

	if (typeof(p3dRangeSlider.noUiSlider)=='undefined') {

		//if (max_scale < 100) p3d.resize_scale = max_scale;

		noUiSlider.create(p3dRangeSlider, {
			start: [ 100 ],
			range: {
				'min': [ 0.01 ],
				'max': [ max_scale ]
			}
		});
		var p3dRangeSliderValueElement = document.getElementById('p3d-slider-range-value');

		p3dRangeSlider.noUiSlider.on('update', function( values, handle ) {
			if (!p3dCheckMinSide(values[handle])) {
				values[handle]=p3dGetMinScale()*100;

			}

			p3dRangeSliderValueElement.value = values[handle];
		
			if (p3d.api_analyse=='on' && jQuery('.noUi-active').length>0 && (printer_type == 'fff' || printer_type == 'dlp')) {

				if (!p3d.refresh_interval1_running) {
					p3d.refresh_interval1_running = true;
					p3d.refresh_interval1 = setInterval(function(){
						p3dUpdateScale('');
					}, 500);
				}
			}
			else {
				p3d.resize_scale = values[handle]/100;

				var model_dim = new Array();
				model_dim.x = p3d.boundingBox.max.x - p3d.boundingBox.min.x;
				model_dim.y = p3d.boundingBox.max.y - p3d.boundingBox.min.y;
				model_dim.z = p3d.boundingBox.max.z - p3d.boundingBox.min.z;


				var cur_value_x=jQuery('#scale_x').data('real_value');
				var cur_value_y=jQuery('#scale_y').data('real_value');
				var cur_value_z=jQuery('#scale_z').data('real_value');
				var prev_value_x = model_dim.x;
				var prev_value_y = model_dim.y;
				var prev_value_z = model_dim.z;

				p3d.resize_scale_x=(cur_value_x*10)/prev_value_x/p3dGetUnitMultiplier();
				p3d.resize_scale_y=(cur_value_y*10)/prev_value_y/p3dGetUnitMultiplier();
				p3d.resize_scale_z=(cur_value_z*10)/prev_value_z/p3dGetUnitMultiplier();


				
				jQuery('#p3d-resize-scale').val(p3d.resize_scale);
				printer_id=jQuery('input:radio[name=product_printer]:checked').data('id');
				p3dResizeModel(p3d.resize_scale);
				p3dGetStats();
				jQuery('#p3d-scale-x').val(jQuery('#scale_x').val());
				jQuery('#p3d-scale-y').val(jQuery('#scale_y').val());
				jQuery('#p3d-scale-z').val(jQuery('#scale_z').val());


				p3dAnalyseModel(jQuery('#pa_p3d_model').val());

			}


		});

	}
	else {

		p3dRangeSlider.noUiSlider.updateOptions({
			start: [ 100 ],
			range: {
				'min': 0.01,
				'max': max_scale
			}
		});

	}


	if (new_printer_id>0) {
		p3dSelectPrinter(new_printer_id);
		jQuery('#p3d-model-message-fitting-priner').show();
		return;
	}
	else {
		jQuery('#p3d-model-message-fitting-priner').hide();
	}

	p3dGetStats();

	window.wp.hooks.doAction( '3dprint.p3dInitScaleSlider_end');
}

function p3dInitScaling() {
	p3d.printer_error=false;
	p3dInitScaleSlider();
	var p3dRangeSlider = document.getElementById('p3d-scale');

	if (typeof(p3dRangeSlider.noUiSlider)!=='undefined') {

		p3dRangeSlider.noUiSlider.set(p3d.default_scale)
	}
}



function p3dUpdateScale (value) {
	if (jQuery('.noUi-active').length==0) {
		clearInterval(p3d.refresh_interval1);	
		if (value=='') {
			var p3dRangeSlider = document.getElementById('p3d-scale');
			value = p3dRangeSlider.noUiSlider.get();
		}
		var model_dim = new Array();
		model_dim.x = p3d.boundingBox.max.x - p3d.boundingBox.min.x;
		model_dim.y = p3d.boundingBox.max.y - p3d.boundingBox.min.y;
		model_dim.z = p3d.boundingBox.max.z - p3d.boundingBox.min.z;

		p3d.refresh_interval1_running = false;
		p3d.resize_scale = value/100;

		var cur_value_x=jQuery('#scale_x').data('real_value');
		var cur_value_y=jQuery('#scale_y').data('real_value');
		var cur_value_z=jQuery('#scale_z').data('real_value');
		var prev_value_x = model_dim.x;
		var prev_value_y = model_dim.y;
		var prev_value_z = model_dim.z;

		p3d.resize_scale_x=(cur_value_x*10)/prev_value_x/p3dGetUnitMultiplier();
		p3d.resize_scale_y=(cur_value_y*10)/prev_value_y/p3dGetUnitMultiplier();
		p3d.resize_scale_z=(cur_value_z*10)/prev_value_z/p3dGetUnitMultiplier();


		jQuery('#p3d-resize-scale').val(p3d.resize_scale);
		printer_id=jQuery('input:radio[name=product_printer]:checked').data('id');
		p3dResizeModel(p3d.resize_scale);
		p3dGetStats();
		p3dAnalyseModel(jQuery('#pa_p3d_model').val());
	}
}

function p3dUpdateDimensions (obj) {
	window.wp.hooks.doAction( '3dprint.p3dUpdateDimensions_start');
	var cur_value=jQuery(obj).val();

//	var cur_value=jQuery(obj).data('real_value');
	//console.log(jQuery(obj).data('real_value'));

	if (isNaN(cur_value)) return;
	if (cur_value==0) return;

	var model_dim = new Array();
	model_dim.x = p3d.boundingBox.max.x - p3d.boundingBox.min.x;
	model_dim.y = p3d.boundingBox.max.y - p3d.boundingBox.min.y;
	model_dim.z = p3d.boundingBox.max.z - p3d.boundingBox.min.z;
	
	if (jQuery(obj).attr('id')=='scale_x') {
		jQuery('#scale_x').data('real_value', cur_value);
		prev_value = model_dim.x;
	}
	if (jQuery(obj).attr('id')=='scale_y') {
		jQuery('#scale_y').data('real_value', cur_value);
		prev_value = model_dim.y;
	}
	if (jQuery(obj).attr('id')=='scale_z') {
		jQuery('#scale_z').data('real_value', cur_value);
		prev_value = model_dim.z;
	}

	var scale = (cur_value*10)/prev_value/p3dGetUnitMultiplier();
//	if (p3d.scale_independently) {
	var cur_value_x=jQuery('#scale_x').data('real_value');
	var cur_value_y=jQuery('#scale_y').data('real_value');
	var cur_value_z=jQuery('#scale_z').data('real_value');
	var prev_value_x = model_dim.x;
	var prev_value_y = model_dim.y;
	var prev_value_z = model_dim.z;



	p3d.resize_scale_x=(cur_value_x*10)/prev_value_x/p3dGetUnitMultiplier();
	p3d.resize_scale_y=(cur_value_y*10)/prev_value_y/p3dGetUnitMultiplier();
	p3d.resize_scale_z=(cur_value_z*10)/prev_value_z/p3dGetUnitMultiplier();

//console.log(p3d.resize_scale_x, p3d.resize_scale_y, p3d.resize_scale_z)
/*
		if (jQuery(obj).attr('id')=='scale_x') p3d.resize_scale_x=scale;
		if (jQuery(obj).attr('id')=='scale_y') p3d.resize_scale_y=scale;
		if (jQuery(obj).attr('id')=='scale_z') p3d.resize_scale_z=scale;*/
//	}

	var p3dRangeSlider = document.getElementById('p3d-scale');
	if (typeof(p3dRangeSlider.noUiSlider)!=='undefined') {
		if (p3d.scale_independently==0) {
			p3dRangeSlider.noUiSlider.set(scale*100)
			p3d.resize_scale = scale;
		}
		else {
			//p3d.resize_scale = scale;
			p3dResizeModel(scale) ;
		}
	
	}

}

function p3dResizeModel(scale) {
	if (p3d.scale_independently==0) {
		p3d.resize_scale_x=p3d.resize_scale_y=p3d.resize_scale_z=p3d.resize_scale;
	}
	if (p3d.resize_on_scale!='on') return;
	var unit_multiplier = p3dGetUnitMultiplier();
	var model_length = p3d.boundingBox.max.x - p3d.boundingBox.min.x;
	var model_width = p3d.boundingBox.max.y - p3d.boundingBox.min.y;
	var model_height = p3d.boundingBox.max.z - p3d.boundingBox.min.z;
	var axis_length = Math.max(model_width, model_length);
	var axis_width = Math.min(model_width, model_length); //todo initial axis position
	var z_offset = -(model_height/2 - (model_height/2 * p3d.resize_scale_z * unit_multiplier));

	scale*=unit_multiplier;




//	var scale_x = scale * p3d.resize_scale_x;
//	var scale_y = scale * p3d.resize_scale_y;
//	var scale_z = scale * p3d.resize_scale_z;


	p3d.model_mesh.scale.set(p3d.resize_scale_x*unit_multiplier, p3d.resize_scale_y*unit_multiplier, p3d.resize_scale_z*unit_multiplier);
	p3d.model_mesh.position.set(0, z_offset, 0);
	if (p3d.object.type=="Group" && typeof(p3d.object.children[0].position)!=='undefined') {
		p3d.object.scale.set(p3d.resize_scale_x*unit_multiplier, p3d.resize_scale_y*unit_multiplier, p3d.resize_scale_z*unit_multiplier);
		p3d.object.position.set(0, z_offset, 0);

	}

	p3d.controls.target.y=z_offset;
	if (p3d.fit_on_resize=='on') {
		var model_dim = new Array();
		var unit_multiplier = p3dGetUnitMultiplier();
		model_dim.x = p3d.boundingBox.max.x - p3d.boundingBox.min.x;
		model_dim.y = p3d.boundingBox.max.y - p3d.boundingBox.min.y;
		model_dim.z = p3d.boundingBox.max.z - p3d.boundingBox.min.z;

		var max_side = Math.max(model_dim.x*p3d.resize_scale_x*unit_multiplier, model_dim.y*p3d.resize_scale_y*unit_multiplier, model_dim.z*p3d.resize_scale_z*unit_multiplier)

		p3d.camera.position.set(max_side*1.5, max_side*1.5, max_side*1.5);
	}

	if (p3d.show_axis=='on') {

		p3d.axis.position.y=z_offset;
		p3d.spritey_x.position.set((model_width*p3d.resize_scale_x*unit_multiplier/2)+10,z_offset,0);
		p3d.spritey_y.position.set(0,z_offset,(model_length*p3d.resize_scale_y*unit_multiplier/2)+10);
		p3d.spritey_z.position.set(0,(model_height*p3d.resize_scale_z*unit_multiplier/2)+z_offset+9,0);

//		p3d.spritey_x.scale.set(scale*100, scale*100, scale*100);
//		p3d.spritey_y.scale.set(scale*100, scale*100, scale*100);
//		p3d.spritey_z.scale.set(scale*100, scale*100, scale*100);




//		p3d.spritey_z = p3dMakeTextSprite( " Z ", 
//			{ fontsize: 40, borderColor: {r:51, g:204, b:51, a:1.0}, backgroundColor: {r:255, g:255, b:255, a:0.8} } );
	}
/*	if (typeof(p3d.model_mesh_rotated)!='undefined') {
		p3d.model_mesh_rotated.position.set(p3d.model_mesh.position.x, p3d.model_mesh.position.y, p3d.model_mesh.position.z);
		p3d.model_mesh_rotated.scale.set(p3d.model_mesh.scale.x, p3d.model_mesh.scale.y, p3d.model_mesh.scale.z);
	}
*/
	p3dMakeShadow();
}

function p3dGetMinScale() {
	var printer_min_side = jQuery('input[name=product_printer]:checked').data('min_side');
	var model_dim = new Array();

	model_dim.x = p3d.boundingBox.max.x - p3d.boundingBox.min.x;
	model_dim.y = p3d.boundingBox.max.y - p3d.boundingBox.min.y;
	model_dim.z = p3d.boundingBox.max.z - p3d.boundingBox.min.z;
	var model_min_side = Math.min(model_dim.x, model_dim.y, model_dim.z)*p3dGetUnitMultiplier();
	var side_diff = printer_min_side / model_min_side;
	return side_diff;

}

function p3dCheckMinSide(requested_scale) {
	var printer_min_side = jQuery('input[name=product_printer]:checked').data('min_side');
	var model_dim = new Array();

	model_dim.x = p3d.boundingBox.max.x - p3d.boundingBox.min.x;
	model_dim.y = p3d.boundingBox.max.y - p3d.boundingBox.min.y;
	model_dim.z = p3d.boundingBox.max.z - p3d.boundingBox.min.z;
	var model_min_side = Math.min(model_dim.x, model_dim.y, model_dim.z)*p3dGetUnitMultiplier()*(requested_scale/100);

	if (model_min_side < printer_min_side) {
		//var side_diff = printer_min_side / model_min_side;

		//p3d.default_scale = p3d.default_scale * side_diff;

		jQuery('#p3d-model-message-minside').show();
		return false;
	}
	else {
		jQuery('#p3d-model-message-minside').hide();
		return true;
	}
}

function p3dGetUnitMultiplier() {
	var product_unit = jQuery('input[name=p3d_unit]:checked').val();
	switch (product_unit) {
		case 'inch':
			var unit_multiplier = 2.54*10;
		break;
		case 'mm':
			var unit_multiplier = 1;
		break;
		default: 
			var unit_multiplier = 1;
	}
	return unit_multiplier;
}


function p3dUpdateSliderValue (value) {
	if (isNaN(value)) return false;

	var p3dRangeSlider = document.getElementById('p3d-scale');
	if (typeof(p3dRangeSlider.noUiSlider)!=='undefined') {
		p3dRangeSlider.noUiSlider.set(value);
	}
}

function p3dUpdateSliderValue (value) {
	if (isNaN(value)) return false;

	var p3dRangeSlider = document.getElementById('p3d-scale');
	if (typeof(p3dRangeSlider.noUiSlider)!=='undefined') {
		p3dRangeSlider.noUiSlider.set(value);
	}
}
function p3dScaleIndependently (val) {

/*	if (p3d.mtl && p3d.mtl.length>0) {
		jQuery('#p3d-unlocked-image').hide();
		jQuery('#p3d-locked-image').show();
		p3d.scale_independently=0;
		p3d.resize_scale=p3d.resize_scale_x=p3d.resize_scale_y=p3d.resize_scale_z=1;
		document.getElementById('p3d-console').appendChild(document.createTextNode(p3d.text_cant_scale_obj+'<br>'));
		jQuery('#p3d-console').show();
		return;
	}*/

	if (val) {
		jQuery('#p3d-unlocked-image').show();
		jQuery('#p3d-locked-image').hide();
		p3d.scale_independently=1;
		jQuery('#p3d-apply-button').show();
	}
	else {
		jQuery('#p3d-unlocked-image').hide();
		jQuery('#p3d-locked-image').show();
		p3d.scale_independently=0;
		p3d.resize_scale=p3d.resize_scale_x=p3d.resize_scale_y=p3d.resize_scale_z=1;
		//p3dResizeModel(p3d.resize_scale);
//		var p3dRangeSlider = document.getElementById('p3d-scale');
//		if (typeof(p3dRangeSlider.noUiSlider)!=='undefined') {
//			p3dRangeSlider.noUiSlider.set(p3d.resize_scale*100);
//		}
		p3dInitScaling();
	}
}


if (window.FileReader && window.FileReader.prototype.readAsArrayBuffer) {
	p3d.filereader_supported=true;
} else {
	p3d.filereader_supported=false;
}




jQuery( document ).ready( function( $ ) {
   
});