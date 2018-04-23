(function(window){
	
	function Slides(ele,options){
		this.$ele = $(ele);
		this.$wrapper = null;
		this.$slide = null;
		this.options = $.extend(true, {}, options);
		this.constructor = Slides;
		this.slide = (this.constructor == Slides)?true:false;
		this.currentSlide = 0;
		this.currentIndex = 0;
		this.slideWidth = 0;
		this.slideLen = 0;
		this.wrapperWidth = 0;
		this.isLoop = this.options.isLoop||false;
		this.prevBtn = this.options.prevBtn||null;
		this.nextBtn = this.options.nextBtn||null;
		this.duration = this.options.duration||"500ms";//默认500ms
		this.autoPlay = this.options.autoPlay||null;
		this.slideCenter = this.options.slideCenter||false;
		this.slidePerView = this.options.slidePerView||1;
		this.playDirection  =  this.options.playDirection||"right";
		this.autoTimer = null;
		this.eventType = {
			touch:{
				tStart:'touchstart',
				tMove:'touchmove',
				tEnd:'touchend'
			},
			move:{
				tStart:'mousedown',
				tMove:'mousemove',
				tEnd:'mouseup'
			}
		}
		this.moveObj = {
			pagex:0,
			pagey:0,
			moveDistance:0
		};
		if(this.constructor == Slides){
			this.init();
		}else{
			new Slides(ele,options).init();
		}
	}
	Slides.prototype.init = function(){
		this.currentIndex = 0;
		this.$wrapper = this.$ele.find(".slide-wrapper");
		this.$slide = this.$ele.find(".slide-item");
		if(this.isLoop||this.autoPlay){//开启循环
			if(this.slidePerView == 1){
				this.addLoopDom();
			}else{
				this.addMoreDom();
			}
		}
		this.slideLen = this.$ele.find(".slide-item").length;
		this.slideWidth = parseInt(this.$slide.css("width"));
		this.wrapperWidth = this.slideWidth*this.slideLen;
		this.$wrapper.css("width",this.wrapperWidth);
		this.$slide.eq(this.currentIndex).addClass("slide-active");
		this.setDuration(true);//设置duration时间
		this.addBtnEvent();//添加prev,next按钮事件
		this.setPerView();//设置slidePerview
		
		if(this.autoPlay){
			this.onAutoPlay();
		}
		if(!this.isLoop&&this.currentIndex == 0){
			$(this.prevBtn).addClass("btn-disabled");
		}
		this.addTouchMove();
	}
	
	Slides.prototype.isSupportTouch = function(){//是否支持touch事件
		return "ontouchstart" in document;
	}
	Slides.prototype.addTouchMove = function(){//添加滑动翻页
		var _this = this;
		var flag = false;
		var moves = 0;
		var eTouch;
		var eMove;
		var eEnd;
		var touchObj = _this.eventType["touch"];//touch事件
		var moveObj = _this.eventType["move"];//move事件
		if(_this.isSupportTouch()){
			eTouch = touchObj.tStart;
			eMove = touchObj.tMove;
			eEnd = touchObj.tEnd;
		}else{
			eTouch = moveObj.tStart;
			eMove = moveObj.tMove;
			eEnd = moveObj.tEnd;
		}
		var flag = false;
		this.$ele.on(""+eTouch,this.$slide,function(e){
			_this.moveObj.pagex = e.pageX||e.originalEvent.targetTouches[0].pageX;
			_this.moveObj.pagey = e.pageY||e.originalEvent.targetTouches[0].pageY;
			e.stopPropagation();
			e.preventDefault();
			flag = true;
		});
		_this.$ele.off(""+eMove).on(""+eMove,this.$slide,function(e){
			var e = e||window.event;
			if(flag){
				var x = (e.pageX||e.originalEvent.targetTouches[0].pageX)-_this.moveObj.pagex;
				var y = (e.pageY||e.originalEvent.targetTouches[0].pageY)-_this.moveObj.pagey;
				_this.moveObj.moveDistance =x;
			}
		});
		_this.$ele.off(""+eEnd).on(""+eEnd,this.$slide,function(e){
			flag = false;
			var movePosition = _this.moveObj.moveDistance;
			var distance = Math.abs(movePosition);
			
			_this.moveObj = {};//重置移动对象
			if(distance>100){
				if(movePosition>0){
					_this.perviewPrev();
				}else{
					_this.perviewNext();
				}
			}
		});
	}
	Slides.prototype.addMoreDom = function(){
		var wrapperHtml = this.$wrapper.html();
		this.$wrapper.prepend(wrapperHtml);
		this.$wrapper.append(wrapperHtml);
	}
	
	Slides.prototype.setPerView = function(){//开启slidePerView
		var perViev = 0;
		var _this = this;
		if(this.slidePerView>1){
			perViev = parseInt(this.$ele.css("width"))/this.slidePerView;
			this.$ele.find(".slide-item").css("width",perViev);
			this.setDefault(function(){
				_this.$ele.find(".slide-item").on("click",function(){
					if($(this).hasClass("slide-perview-next")){//左移
						$(this).removeClass("slide-perview-next").addClass("slide-perview-active").siblings(".slide-item")
							.removeClass("slide-perview-prev")
							.removeClass("slide-perview-active").end()
							.next(".slide-item").addClass("slide-perview-next").end()
							.prev(".slide-item").addClass("slide-perview-prev");
						_this.perviewNext();
					}
					if($(this).hasClass("slide-perview-prev")){//右移
						$(this).removeClass("slide-perview-prev").addClass("slide-perview-active").siblings(".slide-item")
							.removeClass("slide-perview-next")
							.removeClass("slide-perview-active").end()
							.next(".slide-item").addClass("slide-perview-next").end()
							.prev(".slide-item").addClass("slide-perview-prev");
						_this.perviewPrev();
					}
				});
			});
		}
	}
	
	Slides.prototype.perviewNext = function(){//往下翻页
		this.nextSlide();
	}
	Slides.prototype.perviewPrev = function(){//向前翻页
		this.prevSlide();
	}
	
	Slides.prototype.setDefault = function(callback){
		var len = this.$ele.find(".slide-item").length;
		var _index = (len/3)-1;
		this.slideWidth = parseInt(this.$ele.css("width"))/3;
		this.$wrapper.css("width",this.slideWidth*len);
		this.currentIndex = _index ;
		this.$ele.find(".slide-item").eq(len/3-1).addClass("slide-perview-prev");
		this.$ele.find(".slide-item").eq(len/3).addClass("slide-perview-active");
		this.$ele.find(".slide-item").eq(len/3+1).addClass("slide-perview-next");
		var translateX = -(this.slideWidth*_index);//除以三
		this.translate(translateX);
		callback();
	}
	
	Slides.prototype.addLoopDom =function(){//如果开启了循环，复制dom添加
		this.$wrapper.append(this.$slide.eq(0).clone());
	}
	Slides.prototype.islowIe9 = function(){//ie浏览版本是否小于ie9
		var ua = window.navigator.userAgent.toLowerCase();
		var regIe = /msie 9|msie 8|msie 7|msie 6/;
		if(regIe.test(ua)){
			return true;
		}
		return false;
	}
	Slides.prototype.onAutoPlay = function(){//开启自动轮播
		var _this = this;
		if(this.playDirection == "right"){
			this.autoTimer = setInterval(function(){
				_this.nextSlide(_this.autoPlay);
			},_this.autoPlay);
		}else{
			this.autoTimer = setInterval(function(){
				_this.prevSlide();
			},_this.autoPlay);
		}
	}
	Slides.prototype.nextSlide = function(){//下一页
		var translateX = 0;
		var _index = this.slideLen-1;
		var _this = this;
		var timer = null;
		clearTimeout(timer);
		$(this.prevBtn).removeClass("btn-disabled");
		if(this.isLoop||this.autoPlay){
			if(this.currentIndex == _index){
				this.currentIndex = 0;
				this.setDuration(false,function(){
					_this.translate(0);
					translateX = -(_this.currentIndex+1)*_this.slideWidth;
					timer = setTimeout(function(){
						_this.translate(translateX);
						_this.currentIndex += 1;
						_this.addActive();
						
						_this.setDuration(true,function(){});
							
					},20);
				});	
				
			}else{
				translateX = -(this.currentIndex+1)*this.slideWidth;
				this.translate(translateX);
				this.currentIndex += 1;
				this.addActive();
			}
		}else{
			if(!(this.currentIndex == _index)){
				translateX = -(this.currentIndex+1)*this.slideWidth;
				this.translate(translateX);
				this.currentIndex += 1;
				this.addActive();
				if(this.currentIndex == _index){
					$(this.nextBtn).addClass("btn-disabled");
				}else{
					$(this.nextBtn).removeClass("btn-disabled");
				}
			}
		}
	}
	Slides.prototype.prevSlide = function(){//上一页
		var translateX = 0;
		var _index = this.slideLen-1;
		var _this = this;
		var timer = null;
		clearTimeout(timer);
		$(this.nextBtn).removeClass("btn-disabled");
		if(this.isLoop||this.autoPlay){
			if(this.currentIndex == 0){
				this.currentIndex = _index;
				this.setDuration(false,function(){
					translateX = -(_index*_this.slideWidth);
					_this.translate(translateX);
					_this.currentIndex -=1;
					timer = setTimeout(function(){
						_this.setDuration(true,function(){
							translateX = -(_this.currentIndex*_this.slideWidth);
							_this.translate(translateX);
							_this.addActive();
						});
					},10);
				});
			}else{
				if(this.slidePerView > 1){
					if(this.currentIndex == 1){
						this.setDuration(false,function(){
							_this.currentIndex = _this.$ele.find(".slide-item").length-2;
							translateX = -(_this.currentIndex-1)*_this.slideWidth;
							_this.translate(translateX);
							_this.currentIndex -=1;
							
							$(".slide-item").eq(_this.currentIndex).removeClass("slide-perview-prev").addClass("slide-perview-active").siblings(".slide-item")
							.removeClass("slide-perview-next")
							.removeClass("slide-perview-active").end()
							.next(".slide-item").addClass("slide-perview-next").end()
							.prev(".slide-item").addClass("slide-perview-prev");
							
							timer = setTimeout(function(){
								_this.setDuration(true,function(){
									translateX = -(_this.currentIndex-1)*_this.slideWidth;
									_this.translate(translateX);
									_this.addActive();
								});
							},10);
						});
					}else{
						translateX = -(this.currentIndex-1)*this.slideWidth;
						this.translate(translateX);
						this.currentIndex -= 1;
						this.addActive();
					}
				}else{
					translateX = -(this.currentIndex-1)*this.slideWidth;
					this.translate(translateX);
					this.currentIndex -= 1;
					this.addActive();
				}
			}
		}else{
			if(!(this.currentIndex == 0)){
				translateX = -(this.currentIndex-1)*this.slideWidth;
				this.translate(translateX);
				
				this.currentIndex -= 1;
				this.addActive();
				if(this.currentIndex == 0){
					$(this.prevBtn).addClass("btn-disabled");
				}else{
					$(this.prevBtn).removeClass("btn-disabled");
				}
			}else{
				$(this.prevBtn).addClass("btn-disabled");
			}
		}
	}
	Slides.prototype.addActive = function(){//添加active
		this.$ele.find(".slide-item").eq(this.currentIndex).addClass("slide-active")
			.siblings(".slide-item").removeClass("slide-active");
	}
	Slides.prototype.setDuration = function(flag,callback){//设置过度时间
		if(!flag){
			this.$wrapper.css("-webkit-transition-duration","0ms");
		}else{
			this.$wrapper.css("-webkit-transition-duration",this.duration);
		}
		if(typeof callback == "function"){
			callback();
		}
	}
	Slides.prototype.translate = function(translateX){//翻页
		this.$wrapper.css("-webkit-transform","translate("+translateX+"px)");
		if(this.islowIe9()){//ie9及以下版本动画效果
			this.$wrapper.animate({"left":translateX+"px"},this.duration);
		}
	}
	Slides.prototype.slideTo = function(index){
		
	}
	Slides.prototype.addBtnEvent = function(){//添加翻页按钮事件
		var _this = this;
		var clickType = 'click';//PC端采用click事件
		if(this.isSupportTouch()){//移动端使用touchend事件
			clickType = 'touchend';
		}
		if($(this.prevBtn)!=null&&$(this.prevBtn).length){
			$(this.prevBtn).on(clickType,function(){
				clearInterval(_this.autoTimer);
				_this.prevSlide();
				if(_this.autoPlay){
					_this.onAutoPlay();
				}
			});
		}
		if($(this.nextBtn)!=null&&$(this.nextBtn).length){
			$(this.nextBtn).on(clickType,function(){
				clearInterval(_this.autoTimer);
				_this.nextSlide();
				if(_this.autoPlay){
					_this.onAutoPlay();
				}
			});
		}
	}
	window.Slides = Slides;
})(window);

