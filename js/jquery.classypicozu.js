/*!
 * jQuery ClassyPicozu
 * vox.SPACE
 *
 * Written by Marius Stanciu - Sergiu <marius@vox.space>
 * Licensed under the MIT license https://vox.SPACE/LICENSE-MIT
 * Version 1.0.2
 *
 */

(function($, win, doc) {
    $.extend($.easing, {
        easeOutBackMin: function(x, t, b, c, d, s) {
            s = 1;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        }
    });
    $.extend({
        ClassyPicozu: {
            defaults: {
                style: {
                    zIndex: 99999,
                    width: 1100,
                    height: 768
                },
                overlay: {
                    opacity: 0.6
                },
                animation: {
                    show: {
                        duration: 400,
                        easing: 'easeOutBackMin'
                    },
                    close: {
                        duration: 200,
                        easing: 'easeOutBackMin'
                    },
                    move: {
                        duration: 700,
                        easing: 'easeOutBackMin'
                    }
                },
                iframe: {
                    width: 1100,
                    height: 768
                },
                maxSize: {
                    width: -1,
                    height: -1
                },
                from: 'top'
            },
            options: {
            },
            animations: {
            },
            image: {
            },
            template: {
                lightbox: [],
                background: [],
                image: [],
                html: []
            },
            visible: false,
            maximized: false,
            mode: 'iframe',
            overlay: {
                _create: function(options) {
                    this.options = options;
                    this.element = $('<div id="' + new Date().getTime() + '" class="picozu-lightbox-overlay"></div>');
                    this.element.css($.extend({
                    }, {
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        opacity: 0,
                        display: 'none',
                        'z-index': this.options.zIndex
                    }, this.options.style));
                    this.hidden = true;
                    this._build();
                    return this;
                },
                _build: function() {
                    this.target = $(doc.body);
                    this.target.append(this.element);
                },
                _resize: function(x, y) {
                    this.element.css({
                        height: 0,
                        width: 0
                    });
                    if (this.shim) {
                        this.shim.css({
                            height: 0,
                            width: 0
                        });
                    }
                    var a = {
                        x: $(doc).width(),
                        y: $(doc).height()
                    };
                    this.element.css({
                        width: '100%',
                        height: y || a.y
                    });
                    if (this.shim) {
                        this.shim.css({
                            'height': 0,
                            'width': 0
                        });
                        this.shim.css({
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: this.element.width(),
                            height: y || a.y
                        });
                    }
                    return this;
                },
                show: function(callback) {
                    if (!this.hidden) {
                        return this;
                    }
                    if (this.transition) {
                        this.transition.stop();
                    }
                    if (this.shim) {
                        this.shim.css('display', 'block');
                    }
                    this.element.css({
                        display: 'block',
                        opacity: 0
                    });
                    this._resize();
                    this.hidden = false;
                    this.transition = this.element.fadeTo(this.options.showDuration, this.options.style.opacity, $.proxy(function() {
                        if (this.options.style.opacity) {
                            this.element.css(this.options.style);
                        }
                        this.element.trigger('show');
                        if ($.isFunction(callback)) {
                            callback();
                        }
                    }, this));
                    return this;
                },
                hide: function(callback) {
                    if (this.hidden) {
                        return this;
                    }
                    if (this.transition) {
                        this.transition.stop();
                    }
                    if (this.shim) {
                        this.shim.css('display', 'none');
                    }
                    this.hidden = true;
                    this.transition = this.element.fadeTo(this.options.closeDuration, 0, $.proxy(function() {
                        this.element.trigger('hide');
                        if ($.isFunction(callback)) {
                            callback();
                        }
                        this.element.css({
                            height: 0,
                            width: 0,
                            display: 'none'
                        });
                    }, this));
                    return this;
                }
            },
            _create: function(options) {
                this.options = $.extend(true, this.defaults, options);
                var c = $('<div class="picozu-lightbox mode-image">' +
                        '<a class="close" href="#close">' +
                        '<span>close</span>' +
                        '</a>' +
                        '<div class="background">' +
                        '<span class="loader">' +
                        '<span class="left">' +
                        '<span class="anim"></span>' +
                        '</span>' +
                        '<span class="right">' +
                        '<span class="anim"></span>' +
                        '</span>' +
                        '</span>' +
                        '</div>' +
                        '<div class="picozu-lightbox-html"></div>' +
                        '</div>');
                var e = this.template;
                this.overlay._create({
                    style: this.options.overlay,
                    zIndex: this.options.style.zIndex - 1,
                    callback: this.proxy(this.close),
                    showDuration: this.options.animation.show.duration,
                    closeDuration: this.options.animation.close.duration
                });
                e.lightbox = c;
                e.background = $('.background', c);
                e.html = $('.picozu-lightbox-html', c);
                e.move = $('<div class="picozu-lightbox-move"></div>').css({
                    position: 'absolute',
                    'z-index': this.options.style.zIndex,
                    top: -999
                }).append(c);
                $('body').append(e.move);
                this.win = $(win);
                this._setupEvents();
                return c;
            },
            _setupEvents: function() {
                this.win[0].onorientationchange = function() {
                    if (this.visible) {
                        this.overlay._resize();
                        if (this.move && !this.maximized) {
                            this._move();
                        }
                    }
                };
                this.win.bind('resize', this.proxy(function() {
                    if (this.visible) {
                        this.overlay._resize();
                        if (this.move && !this.maximized) {
                            this._move();
                        }
                    }
                }));
                this.win.bind('scroll', this.proxy(function() {
                    if (this.visible && this.move && !this.maximized) {
                        this._move();
                    }
                }));
                $('.picozu-lightbox .close').bind('click touchend', {
                    'fn': 'close'
                }, this.proxy(this.fn));
                this.overlay.element.bind('show', this.proxy(function() {
                    $(this).triggerHandler('show');
                }));
                this.overlay.element.bind('hide', this.proxy(function() {
                    $(this).triggerHandler('close');
                }));
            },
            fn: function(e) {
                this[e.data.fn].apply(this);
                e.preventDefault();
            },
            proxy: function(a) {
                return $.proxy(a, this);
            },
            show: function(d, f, g) {
                if (this.isEmpty(d)) {
                    return false;
                }
                var m = {
                    x: this.win.width(),
                    y: this.win.height()
                }, h = d[0], j = false, k = h.href, n, height;
                this._setupLoading();
                j = this.visible;
                this.open();
                if (j === false) {
                    this._move();
                }
                f = $.extend(true, {
                    width: 1100,
                    height: 768,
                    move: true,
                    key: null,
                    image: null,
                    expand: 'right',
                    theme: 'default',
                    workspace: 1,
                    onOpen: function() {
                    },
                    onClose: function() {
                    }
                }, f || {
                }, h);
                this.options.onOpen = f.onOpen;
                this.options.onClose = f.onClose;
                if (f.width && ("" + f.width).indexOf("p") > 0) {
                    f.width = Math.round((m.x - 20) * f.width.substring(0, f.width.indexOf("p")) / 100);
                }
                if (f.height && ("" + f.height).indexOf("p") > 0) {
                    f.height = Math.round((m.y - 20) * f.height.substring(0, f.height.indexOf("p")) / 100);
                }
                this.move = !!f.move;
                this.maximized = false;
                if (f.key === '' || f.key === null) {
                    this.error('You have to specify the Picozu API key.');
                    return false;
                }
                if (f.image !== null && f.image !== '') {
                    k = f.image;
                }
                if (f.width) {
                    n = f.width;
                    height = f.height;
                } else {
                    this.error('You have to specify the modal window size.');
                    return false;
                }
                var t = '<iframe id="IF_' + (new Date().getTime()) + '" frameborder="0" src="https://www.picozu.com/editor/?i=' + encodeURIComponent(window.btoa(k)) + '&amp;key=' + f.key + '&amp;theme=' + f.theme + '&amp;workspace=' + f.workspace + '" style="margin:0; padding:0;"></iframe>';
                this._setupHTML($(t).css({
                    width: n,
                    height: height
                }), n, height);
                this.callback = $.isFunction(g) ? g : function(e) {
                };
            },
            _setupHTML: function(a, b, c) {
                var e = this;
                var f = e.options;
                var g = e.template;
                var h = g.background;
                this._setupMode('html');
                this._resize(b, c + 20);
                h.bind('complete', function() {
                    g.html.append(a);
                    h.unbind('complete');
                    f.onOpen.apply(this);
                });
            },
            _move: function(w, h) {
                var a = $(this.win), d = this.template, e = w != null ? w : d.lightbox.outerWidth(true), f = h != null ? h : d.lightbox.outerHeight(true), y = 0, x = 0;
                var b = {
                    x: a.width(),
                    y: a.height()
                }, c = {
                    x: a.scrollLeft(),
                    y: a.scrollTop()
                };
                x = c.x + ((b.x - e) / 2);
                if (this.visible) {
                    y = c.y + (b.y - f) / 2;
                } else if (this.options.from === 'bottom') {
                    y = (c.y + b.y);
                } else if (this.options.from === 'top') {
                    y = (c.y - f);
                } else if (this.options.from === 'right') {
                    x = b.x;
                    y = c.y + (b.y - f) / 2;
                } else if (this.options.from === 'left') {
                    x = -e;
                    y = c.y + (b.y - f) / 2;
                }
                if (this.visible) {
                    if (!this.animations.move) {
                        this._morph(d.move, {
                            left: parseInt(x, 10)
                        }, 'move');
                    }
                    this._morph(d.move, {
                        top: parseInt(y, 10)
                    }, 'move');
                } else {
                    d.move.css({
                        left: parseInt(x, 10),
                        top: parseInt(y, 10)
                    });
                }
            },
            _morph: function(d, f, g, h, i) {
                d.animate(f, {
                    queue: i || false,
                    duration: this.options.animation[g].duration,
                    easing: this.options.animation[g].easing,
                    complete: ($.isFunction(h) ? this.proxy(h, this) : null)
                });
            },
            _resize: function(x, y) {
                var a = this.template;
                if (this.visible) {
                    var b = {
                        x: $(this.win).width(),
                        y: $(this.win).height()
                    }, c = {
                        x: $(this.win).scrollLeft(),
                        y: $(this.win).scrollTop()
                    };
                    var d = Math.max((c.x + (b.x - (x)) / 2), 0), e = Math.max((c.y + (b.y - (y)) / 2), 0);
                    this.animations.move = true;
                    this._morph(a.move.stop(), {
                        left: (this.maximized && d < 0) ? 0 : d,
                        top: (this.maximized && (y) > b.y) ? c.y : e
                    }, 'move', $.proxy(function() {
                        this.move = false;
                    }, this.animations));
                    this._morph(a.html, {
                        height: y - 20
                    }, 'move');
                    this._morph(a.lightbox.stop(), {
                        width: (x),
                        height: y - 20
                    }, 'move', {
                    }, true);
                    this._morph(a.background.stop(), {
                        width: x,
                        height: y - 20
                    }, 'move', function() {
                        $(a.background).trigger('complete');
                    });
                } else {
                    a.html.css({
                        height: y - 20
                    });
                    a.lightbox.css({
                        width: x,
                        height: y - 20
                    });
                    a.background.css({
                        width: x,
                        height: y
                    });
                }
            },
            close: function(a) {
                var b = this.template;
                this.visible = false;
                this.options.onClose();
                b.move.animate({
                    opacity: 0,
                    top: '-=40'
                }, {
                    queue: false,
                    complete: (this.proxy(function() {
                        b.background.empty();
                        b.html.empty();
                        this._move();
                        b.move.css({
                            display: 'none',
                            opacity: 1,
                            overflow: 'visible'
                        });
                    }))
                });
                this.overlay.hide(this.proxy(function() {
                    if ($.isFunction(this.callback)) {
                        this.callback.apply(this, $.makeArray(a));
                    }
                }));
                b.background.stop(true, false).unbind('complete');
            },
            open: function() {
                this.visible = true;
                this.template.move.stop().css({
                    opacity: 1,
                    display: 'block',
                    overflow: 'visible'
                }).show();
                this.overlay.show();
            },
            _setupMode: function(a) {
                if (a !== this.mode) {
                    var b = 'mode-';
                    this.template.lightbox.removeClass(b + this.mode).addClass(b + a);
                    this.mode = a;
                }
                this.template.move.css('overflow', 'visible');
            },
            error: function(a) {
                alert(a);
                this.close();
            },
            _calc: function(x, y) {
                var a = this.options.maxSize.width > 0 ? this.options.maxSize.width : this.win.width() - 50;
                var b = this.options.maxSize.height > 0 ? this.options.maxSize.height : this.win.height() - 50;
                if (x > a) {
                    y = y * (a / x);
                    x = a;
                    if (y > b) {
                        x = x * (b / y);
                        y = b;
                    }
                } else if (y > b) {
                    x = x * (b / y);
                    y = b;
                    if (x > a) {
                        y = y * (a / x);
                        x = a;
                    }
                }
                return {
                    width: parseInt(x, 10),
                    height: parseInt(y, 10)
                };
            },
            _setupLoading: function() {
                var a = this.options.style, b = this.template, c = b.background;
                this._setupMode('image');
                c.children().stop(true);
                //c.empty();
                b.html.empty();
                if (this.visible === false) {
                    this._move(a["width"], a["height"]);
                    this._resize(a["width"], a["height"]);
                }
            },
            getOptions: function(a) {
                var a = $(a);
                return $.extend({
                }, {
                    href: a.attr("href"),
                    rel: ($.trim(a.attr("data-rel") || a.attr("rel"))),
                    relent: a.attr("data-rel") ? "data-rel" : "rel",
                    element: a[0]
                }, ($.parseJSON((a.attr("data-options") || "{}").replace(/\'/g, '"')) || {
                }));
            },
            link: function(b, c) {
                var d = $(c.element), e = this.getOptions(d), f = e.rel, g = e.relent, h = c.options, j = [];
                d.blur();
                if (this.isEmpty(f) || f === 'nofollow') {
                    j = [e];
                } else {
                    var k = [], l = [], m = false;
                    $("a[" + g + "], area[" + g + "]", this.ownerDocument).filter("[" + g + "=\"" + f + "\"]").each($.proxy(function(i, a) {
                        if (d[0] === a) {
                            k.unshift(this.getOptions(a));
                            m = true;
                        } else if (m === false) {
                            l.push(this.getOptions(a));
                        } else {
                            k.push(this.getOptions(a));
                        }
                    }, this));
                    j = k.concat(l);
                }
                $.lightbox(j, h, c.callback, d);
                return false;
            },
            isEmpty: function(a) {
                if (a == null) {
                    return true;
                }
                if (Object.prototype.toString.call(a) === '[object String]' || $.type(a) === "array") {
                    return a.length === 0;
                }
            }
        },
        lightbox: function(a, b, c) {
            var d = [];
            if ($.ClassyPicozu.isEmpty(a)) {
                return $.ClassyPicozu;
            }
            for (var i = 0; i < a.length; i++) {
                d[i] = $.extend({
                }, b, a[i]);
            }
            return $.ClassyPicozu.show(d, b, c);
        }
    });
    $.fn.ClassyPicozu = function(a, b) {
        return $(this).on('click', function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return $.proxy($.ClassyPicozu.link, $.ClassyPicozu)(e, $.extend({
            }, {
                selector: this.selector,
                options: a,
                callback: b
            }, {
                element: this
            }));
        });
    };
    $(function() {
        $.ClassyPicozu._create();
    });
})(jQuery, window, document);