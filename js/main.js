;(function($) {

	window.main = {
		init: function(){

			main.loaded();	
			main.slider.init();
			main.accordion.init();
			main.youtube.init();

			$('a[href^=#].scroll-to-btn').click(function(){
				var target = $($(this).attr('href'));
				var offsetTop = (target.length != 0) ? target.offset().top : 0;
				$('html,body').animate({scrollTop: offsetTop},'slow');
				return false;
			});

			$('.mobile-navigation-btn').on('touchstart click', function() {
				var navigation = $('#navigation');
				if(navigation.is(':visible')){
					navigation.slideUp();
				} else {
					navigation.slideDown();
				}
			});	

			// $('section').click(function(e) {
			// 	var	posY = $('body').offset().top;
				
			// 	var magnificPopup = $.magnificPopup.instance,
			// 		el = magnificPopup.contentContainer,
			// 		height = el.height(),
			// 		top = (e.pageY - posY) - (height / 2);
				
			// 	el.css('top', top);
			// });			

			$('.poster').each(function() {
				var poster = $(this),
					id = poster.attr('id'),
					url = $.jYoutube(id),
					img = $('<img>'),
					size = 'big';
				poster.append(img);

				img.on('load', function(){
					var image = $(this),
						size;

					if(image.width() < 200 ) {
						if(image.data('size') == 'big') {
							size = 'small';
						} else if (image.data('size') == 'small') {
							size = 'smaller';
						}
					} else {
						image.addClass('scaleup');
					}				

					if(size) {
						var url = $.jYoutube(image.data('id'), size);

						image.attr('src', url).data('size', size);			
					}										
									
				}).data('id', id).data('size', size).attr('src', url);
			});		    
		},

		slider:{
			
			init: function(){
				$('body').on('youtube.loaded', function(){
					main.slider.ready();

					$('.popup-video').magnificPopup({
						disableOn: 700,
						type: 'iframe',
						mainClass: 'mfp-fade',
						removalDelay: 160,
						preloader: false,
						fixedContentPos: true,		          
						callbacks: {
							open: function(){
								var magnificPopup = this,
				                    el = magnificPopup.contentContainer,
			                    	btn = $(magnificPopup.st.el),
			                    	d = $(document),
			                    	windowHeight = 600, //need to find window height
			                    	iframeTop = 350,
			                    	scrollTop = ( main.isIframed() ) ? btn.offset().top : d.scrollTop(),
			                    	height = el.height(),
			                    	posTop = scrollTop - iframeTop + ( (windowHeight / 2 ) - (height / 2) );

			                   	if(posTop <= 20) posTop = 50;

			                    el.css('top', posTop);
							}
						}
					});	

					main.intResize();
				});
			},

			ready: function(){
				$('.flexslider').flexslider({
					animation: "slide",
					animationLoop: false,
					itemWidth: 240,
					itemMargin: 30,
					minItems: 2,
					maxItems: 4,
					controlNav: false,
					slideshow: false
				});

				$('.slider-four').flexslider({
					animation: "slide",
				});	
			}
		},

		youtube:{

			init: function(){
				// CREDENTIALS
				var apiCall = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=";
				var userKey = "&key=AIzaSyBaHC5kwCgRB5VHhkgP51mhVoOeah-rHcQ";
				//HANDLEBARS
				var source   = $("#home-video-template").html();
				var template = Handlebars.compile(source);

				if($('body').hasClass('home')){
					$('.acc-content, .newest').each(function(){
						var id = $(this).data('playlist-id');
						var container = $(this).children('.acc-content-inner');

						$.ajax({
							url: apiCall + id + userKey,
						}).done(function(data){
							var html  = template(data);
							container.append(html);
							$('body').trigger('youtube.loaded');
						});
					});	            	
				} else {
					$('.video-group').each(function(){
						var id = $(this).data('playlist-id');
						var container = $(this).children('.section-inner');

						$.ajax({
							url: apiCall + id + userKey,
						}).done(function(data){ 
							// Remove first element to use in first slide
							data.first = data.items[0];

							//Clone data object
							var newData = jQuery.extend(true, {}, data);
							//Remove first element to skip first slide
							newData.items.shift();

							//Split newData into groups of 4 and push to new dataArray
							var dataArray = [], size = 4;
							while (newData.items.length > 0){
								dataArray.push(newData.items.splice(0, size));
							}

							//Assign new array to groups
							newData.groups = dataArray;

							//Use dataArray in template
							var html  = template(newData);
							
							container.append(html);
							$('body').trigger('youtube.loaded');
						});
					});
				}

			}
		},


		loaded: function(){
			this.setBoxSizing();
		},

		setBoxSizing: function(){
			if( $('html').hasClass('no-boxsizing') ){
				$('.span:visible').each(function(){
					var span = $(this);
					var fullW = span.outerWidth(),
						actualW = span.width(),
						wDiff = fullW - actualW,
						newW = actualW - wDiff;
					
					span.css('width',newW);
				});
			}
		},	

		youtubeHeight: function(){
			if( main.isIframed() ) {
			
				body_height = $("body").height();

				var new_height = JSON.stringify({"height": body_height+"px"});
			
				top.postMessage(new_height, "https://www.youtube.com/");
				top.postMessage(new_height, "http://www.youtube.com/");
			}
			//  console.log(new_height);
		},	

		intResize: function(){
			setTimeout(function() {
				main.youtubeHeight();
			}, 250);
		},


		accordion: {

			init: function(){

				main.accordion.ready();

			},

			ready: function(){
				var animTime = 200,
					clickPolice = false;	      		
				
				$(document).on('touchstart click', '.acc-btn', function(){
					if(!clickPolice){
						clickPolice = true;

						var currIndex = $(this).index('.acc-btn'),
							targetHeight = $('.acc-content-inner').eq(currIndex).outerHeight(),
							triggers = $('.acc-btn'),
							content = $('.acc-content'),
							vidPlayer = $('#player');

						 //CLOSE IF OPENED
						if ($(this).hasClass('selected')) {

							triggers.removeClass('selected');
							content.removeClass('selected');				

							var selected = $('.acc-content.selected'),
								currPoster = $('.poster', selected),
								currPlayer = $('.player', selected);				

							if(main.player.player) {
								main.player.player.pauseVideo();
							}				

							content.eq(currIndex).stop().animate({ height: 0 }, animTime);
							main.intResize();
			
						//OPEN if CLOSED
						} else {
							//mark actual
							triggers.removeClass('selected');
							content.removeClass('selected');						
							$(this).addClass('selected');
							content.eq(currIndex).addClass('selected');			

							var selected = $('.acc-content.selected'),
								currPoster = '',
								currPoster = $('.poster', selected),
								currPlayer = $('.player', selected);
							
							$('.player', selected).append(vidPlayer);
							
							if(main.player.player) {
								setTimeout(function() {
									main.player.player.pauseVideo();
								}, 1000);
							}
								
							content.stop().animate({ height: 0 }, animTime);
							content.eq(currIndex).stop().animate({ height: targetHeight }, animTime);
							main.intResize();	
						}

						setTimeout(function(){ clickPolice = false; }, animTime);				
					}				    
				});

				$(document).on('click','.play-btn', function(event) {
					event.preventDefault();
					var id = $(this).attr('href');

					main.player.init(id);


					$('.acc-content.selected .poster').hide();
					$('.acc-content.selected .player').show();
				});	

				$(document).on('touchstart click', '.footer-btn', function(e){
					e.preventDefault();

					$('.acc-btn.selected').click();

				});
			}
		},

		player: {
			element: $('#player'),

			init: function(id){
				var element = main.player.element,
					loaded = main.player.loaded = false,
					completed = main.player.completed = false,
					player = main.player.player;

				if(element.length){
					if(YT){
						if (!main.player.player) {
							main.player.player = new YT.Player('player', {
								height: '100%',
								width: '100%',
								videoId: id,
								events: {
									'onReady': main.player.onPlayerReady
								},
								playerVars: {
									autoplay: 1
								}
							});
						} else {
							main.player.player.loadVideoById(id);
						}
					} else {
						element.hide();
					}
				}
			},

			destroy: function() {
				main.player.player.destroy();
			},

			onPlayerReady: function (event) {
				event.target.playVideo();
				if(!main.player.loaded){		 	
					main.player.player.addEventListener('onStateChange', main.player.onPlayerStateChange);
					main.player.loaded = true;
				}
			},

			onPlayerStateChange: function (event) {
				if(event.data === 0 && !main.player.completed) {            
					main.player.completed = true;
				}
			}
		},

		resize: function(){
		},

		loaded: function(){
			main.intResize();
		},

		isIframed: function(){
			return (window.location != window.parent.location) ? true : false;
		}
	};

	$(function(){
		main.init();
	});

	$(window).load(function(){
		main.loaded();
	});

})(jQuery);