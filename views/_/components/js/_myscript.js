$(function() {
    
    //activate schedule tabs
    var hash = window.location.hash;
    has && $('ul.nav a[href="'+ hash + '"]').tab('show');
    
    
	//highlight the current nav
	/*$("#home a:contains('Home')").parent().addClass('active');
	$("#about a:contains('About')").parent().addClass('active');
	$("#sponsors a:contains('Sponsors')").parent().addClass('active');
	$("#faq a:contains('FAQ')").parent().addClass('active');*/
    
    $(function() {
        $("li").click(function() {
        // remove classes from all
            $("li").removeClass("active");
      // add class to the one we clicked
            $(this).addClass("active");
        });
    });
    

	//make menus drop automatically
	$('ul.nav li.dropdown').hover(function() {
		$('.dropdown-menu', this).fadeIn();
	}, function() {
		$('.dropdown-menu', this).fadeOut('fast');
	});//hover

	//show tooltips
	$("[data-toggle='tooltip']").tooltip({ animation: true});

	//show modals

	$('.modalphotos img').on('click', function() {
		$('#modal').modal({
			show: true,
		})

		var mysrc = this.src.substr(0, this.src.length-7) + '.jpg';
		$('#modalimage').attr('src', mysrc);
		$('#modalimage').on('click', function(){
				$('#modal').modal('hide');
		})//hide modal
	});//show modal


}); //jQuery is loaded