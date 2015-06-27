$(function() {
	$('#scraping').on('click', function() {
		$.ajax({
			url: '/scraping',
			type: 'get'
		}).done(function(data) {
			$('#scrapingView').html(data.results[0].results);
			console.log(data.results[0].results);
		})

	});

})