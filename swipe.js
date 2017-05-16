var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
function convertToArray(nodes) {
    var array = null;
    try {
        array = Array.prototype.slice.call(nodes, 0);
    } catch(ex) {
        array = new Array();
        for(var i=0; i<nodes.length; i++) {
            array.push(nodes[i]);
        }
    }
    return array;
}
function Swipe(){
    this.el = null;
    this.list = [];
    this.dots = [];
    this.index = 0;
    this.direction = 1;
    this.swipeTimer = null;
    this.touch = {
        swiping: 0, // 是否正在滑动中
        isCanSwipe: 0, // 是否可以滑动
        startX: 0,
        startY: 0,
        distance: 0,
        current: 0,
        next: 1
    };
}
Swipe.prototype.initSwipe = function(id){
    this.el = document.getElementById(id);
    var swipeList = this.el.getElementsByClassName('swipe-list')[0];
    var list = convertToArray(this.el.getElementsByClassName('swipe-list-item'));
    this.index = 0;
    this.width = this.el.clientWidth;
    this.list = list;
    if (this.list.length > 1) {
        var dotBox = this.el.getElementsByClassName('swipe-dot')[0];
        if (dotBox) {
            dotBox.className = 'swipe-dot show';
            this.dots = convertToArray(dotBox.getElementsByClassName('swipe-dot-item'));
        }
        this.initSwipeDot(0);
        swipeList.addEventListener('touchstart', $.proxy(this.touchStart, this));
        swipeList.addEventListener('touchmove', $.proxy(this.touchMove, this));
        swipeList.addEventListener('touchend', $.proxy(this.touchEnd, this));
        dotBox.addEventListener('click', $.proxy(this.clickScroll, this));
    }
    this.scroll();
    this.windowResize();
};
Swipe.prototype.windowResize = function(){
    var _this = this;
    if(this.el){
        window.addEventListener('resize', function () {
            _this.width = _this.el.clientWidth;
        });
    }
};
Swipe.prototype.initSwipeDot = function(index) {
    var dots = this.dots;
    index = index ? index : 0;
    dots.forEach(function (item, i) {
        if (i === index) {
            dots[index].className = 'swipe-dot-item active';
        } else {
            dots[i].className = 'swipe-dot-item';
        }
    });
};
Swipe.prototype.scroll = function(page) {
    var _this2 = this;

    if (this.list.length === 0) return;
    var currentPage = this.index;
    var nextPage = page && (typeof page === 'undefined' ? 'undefined' : _typeof(page)) === Number ? page : currentPage + 1;
    if (nextPage >= this.list.length) nextPage = 0;
    var currentLi = this.list[currentPage];
    var nextLi = this.list[nextPage];
    currentLi.style.display = 'block';
    if (this.list.length === 1) {
        this.touch.isCanSwipe = 0;
        return;
    }
    this.touch.isCanSwipe = 1;
    nextLi.style.display = 'block';
    nextLi.style.webkitTransform = 'translate3d(' + this.width + 'px, 0, 0)';

    var callback = function callback() {
        if (_this2.dots.length > 1) {
            _this2.initSwipeDot(nextPage);
        }
        currentLi.style.display = 'none';
        _this2.index = nextPage;
        _this2.isCanSwipe = 1;
        _this2.scroll();
    };

    clearTimeout(this.swipeTimer);
    this.swipeTimer = setTimeout(function () {
        _this2.translate(currentLi, _this2.width, 800, callback);
        _this2.translate(nextLi, 0, 800);
        _this2.isCanSwipe = 0;
    }, 6000);
};
Swipe.prototype.clickScroll = function(e) {
    var _this3 = this;
    if(e.target.nodeName.toLowerCase() == 'li') {
        var page = parseInt(e.target.getAttribute('data-id'));
        if (!this.touch.isCanSwipe || page === undefined || page === this.index) return;
        clearTimeout(_this3.swipeTimer);
        this.isCanSwipe = 0;
        var currentLi = _this3.list[this.index];
        var nextLi = _this3.list[page];
        if(page === _this3.index) return;
        var direction = page > this.index ? 1 : -1;
        nextLi.style.display = 'block';
        _this3.translate(nextLi, direction * _this3.width);
        var callback = function callback() {
            if (_this3.dots.length > 1) {
                _this3.initSwipeDot(page);
            }
            currentLi.style.display = 'none';
            _this3.index = page;
            _this3.isCanSwipe = 1;
            _this3.scroll();
        };
        setTimeout(function () {
            _this3.translate(currentLi, _this3.width * direction, 800, callback);
            _this3.translate(nextLi, 0, 800);
        }, 150);
    }
};
Swipe.prototype.swipeEnd = function() {
    clearTimeout(this.swipeTimer);
};
Swipe.prototype.translate = function(element, offset, speed, callback) {
    if (speed) {
        element.style.webkitTransition = '-webkit-transform ' + speed + 'ms ease';
        setTimeout(function () {
            offset = -1 * offset;
            element.style.webkitTransform = 'translate3d(' + offset + 'px, 0, 0)';
        }, 50);
        setTimeout(function () {
            if (offset !== 0) {
                element.style.display = 'none';
            }
            element.style.webkitTransition = '';
            element.style.webkitTransform = '';
            if (callback) callback();
        }, speed + 50);
    } else {
        element.style.webkitTransition = '';
        element.style.webkitTransform = 'translate3d(' + offset + 'px, 0, 0)';
    }
};
Swipe.prototype.touchStart = function(e) {
    var touch = this.touch;
    if (!touch.isCanSwipe || touch.swiping) return;
    touch.distance = 0;
    this.direction = 0;
    var touches = e.touches[0];
    touch.startX = touches.pageX;
    touch.startY = touches.pageY;
    touch.swiping = 1;
    clearTimeout(this.swipeTimer);
};
Swipe.prototype.touchMove = function(e) {
    var touch = this.touch;
    if (!touch.isCanSwipe || !touch.swiping) return;
    var touches = e.touches[0];
    var left = touches.pageX,
        top = touches.pageY;
    touch.distance = left - touch.startX;
    var dDis = Math.abs(touch.distance) - Math.abs(top - touch.startY);
    var listLength = this.list.length;
    if (dDis < 0) {
        touch.swiping = 0;
        this.scroll();
    } else if (Math.abs(touch.distance) > 10) {
        // 水平方向滑动
        e.preventDefault();
        e.stopPropagation();
        touch.distance = left - touch.startX;
        var currentPage = this.index;
        var nextPage = touch.distance > 0 ? currentPage - 1 : currentPage + 1;
        var prevPage = touch.distance > 0 ? currentPage + 1 : currentPage - 1;
        if (nextPage >= listLength) {
            nextPage = 0;
        } else if (nextPage < 0) {
            nextPage = listLength - 1;
        }
        if (prevPage >= listLength) {
            prevPage = 0;
        } else if (prevPage < 0) {
            prevPage = listLength - 1;
        }
        var currentLi = this.list[currentPage];
        var nextLi = this.list[nextPage];
        var prevLi = this.list[prevPage];
        touch.current = currentPage;
        touch.next = nextPage;
        currentLi.style.display = 'block';
        nextLi.style.display = 'block';
        prevLi.style.display = 'block';
        if (touch.distance < 0) {
            this.direction = 1;
        } else if (touch.distance > 0) {
            this.direction = -1;
        } else {
            touch.direction = 0;
        }
        this.translate(currentLi, touch.distance);
        this.translate(prevLi, this.width * -1 * this.direction);
        this.translate(nextLi, this.width * this.direction + touch.distance);
    }
};
Swipe.prototype.touchEnd = function(e) {
    var _this4 = this;
    var touch = this.touch;
    if (!touch.isCanSwipe || !touch.swiping) return;
    var currentLi = this.list[touch.current];
    var nextLi = this.list[touch.next];
    var isLeft = this.direction;
    if (Math.abs(touch.distance) > this.width * 0.2) {
        var callback = function callback() {
            if (_this4.dots.length > 1) {
                _this4.initSwipeDot(touch.next);
            }
            currentLi.style.display = 'none';
            _this4.index = touch.next;
            touch.swiping = 0;
            _this4.scroll();
        };

        this.translate(currentLi, this.width * isLeft, 150, callback);
        this.translate(nextLi, 0, 150);
    } else if(isLeft !== 0){
        var cb = function cb() {
            _this4.index = touch.current;
            nextLi.style.display = 'none';
            touch.swiping = 0;
            _this4.scroll();
        };
        this.translate(currentLi, 0, 150, cb);
        this.translate(nextLi, -1 * this.width * isLeft, 150);
    } else {
        _this4.direction = 1;
        _this4.scroll();
    }
};
