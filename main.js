$(function() {
    
	function secondsToTime(secs) {
		var hours = Math.floor(secs / (60 * 60));
		var divisor_for_minutes = secs % (60 * 60);
		var minutes = Math.floor(divisor_for_minutes / 60);
		var divisor_for_seconds = divisor_for_minutes % 60;
		var seconds = Math.ceil(divisor_for_seconds);
		if (seconds < 10) seconds = '0' + seconds;
		return minutes + ':' + seconds;
	}

	var $b = $('body'),
		$el = $('#container'),
        id = 0,
		$audio = document.getElementById('#audio');

	function search(x,play) {
        //Fetch Links and info from youtube too inject into the #container div.
		x = x.split(' ').join('_');
        if(x.length > 3){
            $.get('https://www.youtube.com/results', {
                filters: 'video',
                lclk: 'video',
                search_query: x
            }).done(function(data) {
                $el.empty();
                data = $(data).find('.yt-lockup-title a');
                var s = '';
                var images = '';
                $.each(data,function(i,el){
                    var url = 'http://youtubeinmp3.com/fetch/?video=http://www.youtube.com' + data[i].href.replace('file://','');
                    s += '<div class="row" data-count="' + i + '" data-title="' + data[i].innerHTML + '" data-mp3="' + url +
                    '" style="display:none;"><div class="title">' + data[i].innerHTML + '</div></div>';
                    images += '<div class="img" style="background:url() 50% 50% / cover no-repeat" onload="$(this).fadeIn();" />';
                });
                
                window.location.hash = x.split(' ').join('_');
                $el.html(s);
                //$('.play:eq(0)').click();
                $b.addClass('search');
                var d = 0;
                $.each($('.row'),function(i,el){
                    $(this).delay(d).fadeIn(250);
                    d = d + 50;
                });
                if(play){
                    $('.row:eq(0)').click();
                }
            });
        }else{
            $b.removeClass('search');
            $el.empty();
        }
	}
	var hash = window.location.hash;
	if (hash.length > 3) {
		hash = hash.replace('#', '');
		var play = 0;
		if(hash.indexOf('(play)') > -1){
			hash = hash.replace('(play)', '');
			play = 1;
		}
		search(hash,play);
		$('input').val(hash.split('_').join(' '));
	}
	
	var timer = null;
	$("input").keyup(function() {
		if($(this).val().length === 0){
			$('.close').click();
			return;
		}
		if(timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(search,300,$(this).val());
	});

	$('.close').click(function() {
		reset();
	});

	var clicking = false,
		title = $('#audio').data('track'),
		duration = 0,
		$pro = $('#progress'),
		$fill = $('#fill'),
		pWidth = $pro.width(),
		fWidth = $('#fill').width();

	$('#container').on("click", ".row", function() {
        count = parseInt($(this).data('count'));
		reset($(this).data('mp3'), $(this).data('title'));
	});

	$("audio").on("timeupdate", function(event) {
		onTrackedVideoFrame(this.currentTime, this.duration);

		if (!this.paused) {
			$('.play-pause').addClass('pause');
		} else {
			$('.play-pause').removeClass('pause');
		}
	});

	function onTrackedVideoFrame(currentTime, duration) {
		$(".current").text(secondsToTime(currentTime));
		if(!duration) duration = 0;
		$(".full").text(secondsToTime(duration));
		$('#progress').attr('data-sec', currentTime);
		var per = currentTime / duration * 100;
		$('#fill').width(per + '%');
	}
	
	function playPause() {
		$('audio').get(0).paused ? $('audio').get(0).play() : $('audio').get(0).pause();
	}

	$('.play-pause').click(function() {
		playPause();
	});
	
	$(window).keyup(function(e){
		if(!$('input').is(':focus') && e.which == 32){
			playPause();
		}
	});

	$pro.mousedown(function(e) {
		clicking = true;
		var parentOffset = $(this).offset();
		var relX = e.pageX - parentOffset.left;
		$fill.width(relX);
		if (!$audio.paused && !$audio.ended) {
			var newtime = relX * $audio.duration / $(this).width();
			$audio.currentTime = newtime;
		}
	});
	$(document).mouseup(function() {
		clicking = false;
	});
	$pro.mousemove(function(e) {
		if (clicking === false) return;
		var parentOffset = $(this).offset();
		var relX = e.pageX - parentOffset.left;
		$fill.width(relX);
		if (!$audio.paused && !$audio.ended) {
			var newtime = relX * $audio.duration / $(this).width();
			$audio.currentTime = newtime;
		}
	});
	$audio.onplaying = function() {
        $('.play-pause').empty();
		$('.play-pause').removeClass('loading');
	};
	$audio.onloadstart = function() {
        if($('audio').attr('src').length > 0){
          $('.play-pause').addClass('loading');
		  $('.play-pause').html('<div class="spinner"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>');
        }
	};
	$audio.onended = function() {
        var i = parseInt(count) + 1;
        $('.row:eq('+ i +')').trigger("click");
    }
    
    $('.time').click(function(){
       reset(); 
    });

	/*  			$('audio').bind('canplay',function() {
this.currentTime = parseFloat($('#player').data('sec')); // jumps to 29th secs
});  */

	function reset(mp3, title) {
		if (!mp3) mp3 = '';
		if (!title) title = 'Search for a song...';
		if (mp3 === '') {
			$b.removeClass('search');
			$el.html('');
			$('input').val('');
		}
        $('#audio').attr('data-track', title);
        $('audio').attr('src', mp3);
        $('.track-title').html(title);
        $('.play-pause').removeClass('pause');
        $('#fill').width(0);
        $('.time').html('<span class="current">0:00</span><br><span class="full">0:00</span>');
	}
});