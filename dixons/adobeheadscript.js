// All code and conventions are protected by copyright
! function(window, document, undefined) {
    function assert(e, t) {
        if (!e) throw new Error(t || "Assertion Failure")
    }

    function LeaveEventEmitter() {
        SL.getToolsByType("nielsen").length > 0 && SL.domReady(SL.bind(this.initialize, this))
    }

    function TwitterEventEmitter(e) {
        SL.domReady(SL.bind(function() {
            this.twttr = e || window.twttr, this.initialize()
        }, this))
    }

    function LocationChangeEventEmitter() {
        this.lastURL = SL.URL(), this._fireIfURIChanged = SL.bind(this.fireIfURIChanged, this), this._onPopState = SL.bind(this.onPopState, this), this._onHashChange = SL.bind(this.onHashChange, this), this._pushState = SL.bind(this.pushState, this), this._replaceState = SL.bind(this.replaceState, this), this.initialize()
    }

    function DataElementChangeEmitter() {
        var e = SL.filter(SL.rules, function(e) {
            return 0 === e.event.indexOf("dataelementchange")
        });
        this.dataElementsNames = SL.map(e, function(e) {
            return e.event.match(/dataelementchange\((.*)\)/i)[1]
        }, this), this.initPolling()
    }

    function OrientationChangeEventEmitter() {
        SL.addEventHandler(window, "orientationchange", OrientationChangeEventEmitter.orientationChange)
    }

    function VideoPlayedEventEmitter() {
        this.rules = SL.filter(SL.rules, function(e) {
            return "videoplayed" === e.event.substring(0, 11)
        }), this.eventHandler = SL.bind(this.onUpdateTime, this)
    }

    function VisibilityEventEmitter() {
        this.defineEvents(), this.visibilityApiHasPriority = !0, document.addEventListener ? this.setVisibilityApiPriority(!1) : this.attachDetachOlderEventListeners(!0, document, "focusout");
        SL.bindEvent("aftertoolinit", function() {
            SL.fireEvent(SL.visibility.isHidden() ? "tabblur" : "tabfocus")
        })
    }

    function InViewEventEmitter(e) {
        e = e || SL.rules, this.rules = SL.filter(e, function(e) {
            return "inview" === e.event
        }), this.elements = [], this.eventHandler = SL.bind(this.track, this), SL.addEventHandler(window, "scroll", this.eventHandler), SL.addEventHandler(window, "load", this.eventHandler)
    }

    function ElementExistsEventEmitter() {
        this.rules = SL.filter(SL.rules, function(e) {
            return "elementexists" === e.event
        })
    }

    function FacebookEventEmitter(e) {
        this.delay = 250, this.FB = e, SL.domReady(SL.bind(function() {
            SL.poll(SL.bind(this.initialize, this), this.delay, 8)
        }, this))
    }

    function HoverEventEmitter() {
        var e = this.eventRegex = /^hover\(([0-9]+)\)$/,
            t = this.rules = [];
        SL.each(SL.rules, function(n) {
            n.event.match(e) && t.push([Number(n.event.match(e)[1]), n.selector])
        })
    }

    function NielsenTool(e) {
        SL.BaseTool.call(this, e), this.defineListeners(), this.beaconMethod = "plainBeacon", this.adapt = new NielsenTool.DataAdapters, this.dataProvider = new NielsenTool.DataProvider.Aggregate
    }

    function Tnt(e) {
        SL.BaseTool.call(this, e), this.styleElements = {}, this.targetPageParamsStore = {}
    }

    function DefaultTool() {
        SL.BaseTool.call(this), this.asyncScriptCallbackQueue = [], this.argsForBlockingScripts = []
    }

    function SiteCatalystTool(e) {
        SL.BaseTool.call(this, e), this.varBindings = {}, this.events = [], this.products = [], this.customSetupFuns = []
    }

    function BasicTool(e) {
        SL.BaseTool.call(this, e), this.name = e.name || "Basic"
    }

    function GATool(e) {
        SL.BaseTool.call(this, e)
    }

    function GAUniversalTool(e) {
        SL.BaseTool.call(this, e)
    }

    function VisitorIdTool(e) {
        SL.BaseTool.call(this, e), this.name = e.name || "VisitorID", this.initialize()
    }
    var ToString = Object.prototype.toString,
        Overrides = window._satellite && window._satellite.override,
        SL = {
            initialized: !1,
            $data: function(e, t, n) {
                if (e) {
                    var a = "__satellite__",
                        i = SL.dataCache,
                        r = e[a];
                    r || (r = e[a] = SL.uuid++);
                    var o = i[r];
                    if (o || (o = i[r] = {}), n === undefined) return o[t];
                    o[t] = n
                }
            },
            uuid: 1,
            dataCache: {},
            keys: function(e) {
                var t = [];
                for (var n in e) e.hasOwnProperty(n) && t.push(n);
                return t
            },
            values: function(e) {
                var t = [];
                for (var n in e) e.hasOwnProperty(n) && t.push(e[n]);
                return t
            },
            isArray: Array.isArray || function(e) {
                return "[object Array]" === ToString.apply(e)
            },
            isObject: function(e) {
                return null != e && !SL.isArray(e) && "object" == typeof e
            },
            isString: function(e) {
                return "string" == typeof e
            },
            isNumber: function(e) {
                return "[object Number]" === ToString.apply(e) && !SL.isNaN(e)
            },
            isNaN: function(e) {
                return e != e
            },
            isRegex: function(e) {
                return e instanceof RegExp
            },
            isLinkTag: function(e) {
                return !(!e || !e.nodeName || "a" !== e.nodeName.toLowerCase())
            },
            each: function(e, t, n) {
                for (var a = 0, i = e.length; a < i; a++) t.call(n, e[a], a, e)
            },
            map: function(e, t, n) {
                for (var a = [], i = 0, r = e.length; i < r; i++) a.push(t.call(n, e[i], i, e));
                return a
            },
            filter: function(e, t, n) {
                for (var a = [], i = 0, r = e.length; i < r; i++) {
                    var o = e[i];
                    t.call(n, o, i, e) && a.push(o)
                }
                return a
            },
            any: function(e, t, n) {
                for (var a = 0, i = e.length; a < i; a++) {
                    var r = e[a];
                    if (t.call(n, r, a, e)) return !0
                }
                return !1
            },
            every: function(e, t, n) {
                for (var a = !0, i = 0, r = e.length; i < r; i++) {
                    var o = e[i];
                    a = a && t.call(n, o, i, e)
                }
                return a
            },
            contains: function(e, t) {
                return -1 !== SL.indexOf(e, t)
            },
            indexOf: function(e, t) {
                if (e.indexOf) return e.indexOf(t);
                for (var n = e.length; n--;)
                    if (t === e[n]) return n;
                return -1
            },
            find: function(e, t, n) {
                if (!e) return null;
                for (var a = 0, i = e.length; a < i; a++) {
                    var r = e[a];
                    if (t.call(n, r, a, e)) return r
                }
                return null
            },
            textMatch: function(e, t) {
                if (null == t) throw new Error("Illegal Argument: Pattern is not present");
                return null != e && ("string" == typeof t ? e === t : t instanceof RegExp && t.test(e))
            },
            stringify: function(e, t) {
                if (t = t || [], SL.isObject(e)) {
                    if (SL.contains(t, e)) return "<Cycle>";
                    t.push(e)
                }
                if (SL.isArray(e)) return "[" + SL.map(e, function(e) {
                    return SL.stringify(e, t)
                }).join(",") + "]";
                if (SL.isString(e)) return '"' + String(e) + '"';
                if (SL.isObject(e)) {
                    var n = [];
                    for (var a in e) e.hasOwnProperty(a) && n.push(a + ": " + SL.stringify(e[a], t));
                    return "{" + n.join(", ") + "}"
                }
                return String(e)
            },
            trim: function(e) {
                return null == e ? null : e.trim ? e.trim() : e.replace(/^ */, "").replace(/ *$/, "")
            },
            bind: function(e, t) {
                return function() {
                    return e.apply(t, arguments)
                }
            },
            throttle: function(e, t) {
                var n = null;
                return function() {
                    var a = this,
                        i = arguments;
                    clearTimeout(n), n = setTimeout(function() {
                        e.apply(a, i)
                    }, t)
                }
            },
            domReady: function(e) {
                function t(e) {
                    for (u = 1; e = a.shift();) e()
                }
                var n, a = [],
                    i = !1,
                    r = document,
                    o = r.documentElement,
                    s = o.doScroll,
                    c = "DOMContentLoaded",
                    l = "addEventListener",
                    d = "onreadystatechange",
                    u = /^loade|^c/.test(r.readyState);
                return r[l] && r[l](c, n = function() {
                    r.removeEventListener(c, n, i), t()
                }, i), s && r.attachEvent(d, n = function() {
                    /^c/.test(r.readyState) && (r.detachEvent(d, n), t())
                }), e = s ? function(t) {
                    self != top ? u ? t() : a.push(t) : function() {
                        try {
                            o.doScroll("left")
                        } catch (n) {
                            return setTimeout(function() {
                                e(t)
                            }, 50)
                        }
                        t()
                    }()
                } : function(e) {
                    u ? e() : a.push(e)
                }
            }(),
            loadScript: function(e, t) {
                var n = document.createElement("script");
                SL.scriptOnLoad(e, n, t), n.src = e, document.getElementsByTagName("head")[0].appendChild(n)
            },
            scriptOnLoad: function(e, t, n) {
                function a(e) {
                    e && SL.logError(e), n && n(e)
                }
                "onload" in t ? (t.onload = function() {
                    a()
                }, t.onerror = function() {
                    a(new Error("Failed to load script " + e))
                }) : "readyState" in t && (t.onreadystatechange = function() {
                    var e = t.readyState;
                    "loaded" !== e && "complete" !== e || (t.onreadystatechange = null, a())
                })
            },
            loadScriptOnce: function(e, t) {
                SL.loadedScriptRegistry[e] || SL.loadScript(e, function(n) {
                    n || (SL.loadedScriptRegistry[e] = !0), t && t(n)
                })
            },
            loadedScriptRegistry: {},
            loadScriptSync: function(e) {
                document.write ? SL.domReadyFired ? SL.notify('Cannot load sync the "' + e + '" script after DOM Ready.', 1) : (e.indexOf('"') > -1 && (e = encodeURI(e)), document.write('<script src="' + e + '"></script>')) : SL.notify('Cannot load sync the "' + e + '" script because "document.write" is not available', 1)
            },
            pushAsyncScript: function(e) {
                SL.tools["default"].pushAsyncScript(e)
            },
            pushBlockingScript: function(e) {
                SL.tools["default"].pushBlockingScript(e)
            },
            addEventHandler: window.addEventListener ? function(e, t, n) {
                e.addEventListener(t, n, !1)
            } : function(e, t, n) {
                e.attachEvent("on" + t, n)
            },
            removeEventHandler: window.removeEventListener ? function(e, t, n) {
                e.removeEventListener(t, n, !1)
            } : function(e, t, n) {
                e.detachEvent("on" + t, n)
            },
            preventDefault: window.addEventListener ? function(e) {
                e.preventDefault()
            } : function(e) {
                e.returnValue = !1
            },
            stopPropagation: function(e) {
                e.cancelBubble = !0, e.stopPropagation && e.stopPropagation()
            },
            containsElement: function(e, t) {
                return e.contains ? e.contains(t) : !!(16 & e.compareDocumentPosition(t))
            },
            matchesCss: function(e) {
                function t(e, t) {
                    var n = t.tagName;
                    return !!n && e.toLowerCase() === n.toLowerCase()
                }
                var n = e.matchesSelector || e.mozMatchesSelector || e.webkitMatchesSelector || e.oMatchesSelector || e.msMatchesSelector;
                return n ? function(e, t) {
                    if (t === document || t === window) return !1;
                    try {
                        return n.call(t, e)
                    } catch (a) {
                        return !1
                    }
                } : e.querySelectorAll ? function(e, n) {
                    if (!n.parentNode) return !1;
                    if (e.match(/^[a-z]+$/i)) return t(e, n);
                    try {
                        for (var a = n.parentNode.querySelectorAll(e), i = a.length; i--;)
                            if (a[i] === n) return !0
                    } catch (r) {}
                    return !1
                } : function(e, n) {
                    if (e.match(/^[a-z]+$/i)) return t(e, n);
                    try {
                        return SL.Sizzle.matches(e, [n]).length > 0
                    } catch (a) {
                        return !1
                    }
                }
            }(document.documentElement),
            cssQuery: (Ub = document, Ub.querySelectorAll ? function(e, t) {
                var n;
                try {
                    n = Ub.querySelectorAll(e)
                } catch (a) {
                    n = []
                }
                t(n)
            } : function(e, t) {
                if (SL.Sizzle) {
                    var n;
                    try {
                        n = SL.Sizzle(e)
                    } catch (a) {
                        n = []
                    }
                    t(n)
                } else SL.sizzleQueue.push([e, t])
            }),
            hasAttr: function(e, t) {
                return e.hasAttribute ? e.hasAttribute(t) : e[t] !== undefined
            },
            inherit: function(e, t) {
                var n = function() {};
                n.prototype = t.prototype, e.prototype = new n, e.prototype.constructor = e
            },
            extend: function(e, t) {
                for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
            },
            toArray: function() {
                try {
                    var e = Array.prototype.slice;
                    return e.call(document.documentElement.childNodes, 0)[0].nodeType,
                        function(t) {
                            return e.call(t, 0)
                        }
                } catch (t) {
                    return function(e) {
                        for (var t = [], n = 0, a = e.length; n < a; n++) t.push(e[n]);
                        return t
                    }
                }
            }(),
            equalsIgnoreCase: function(e, t) {
                return null == e ? null == t : null != t && String(e).toLowerCase() === String(t).toLowerCase()
            },
            poll: function(e, t, n) {
                function a() {
                    SL.isNumber(n) && i++ >= n || e() || setTimeout(a, t)
                }
                var i = 0;
                t = t || 1e3, a()
            },
            escapeForHtml: function(e) {
                return e ? String(e).replace(/\&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;").replace(/\"/g, "&quot;").replace(/\'/g, "&#x27;").replace(/\//g, "&#x2F;") : e
            }
        },
        Ub, Hg, Ig;
    SL.availableTools = {}, SL.availableEventEmitters = [], SL.fireOnceEvents = ["condition", "elementexists"], SL.initEventEmitters = function() {
        SL.eventEmitters = SL.map(SL.availableEventEmitters, function(e) {
            return new e
        })
    }, SL.eventEmitterBackgroundTasks = function() {
        SL.each(SL.eventEmitters, function(e) {
            "backgroundTasks" in e && e.backgroundTasks()
        })
    }, SL.initTools = function(e) {
        var t = {
                "default": new DefaultTool
            },
            n = SL.settings.euCookieName || "sat_track";
        for (var a in e)
            if (e.hasOwnProperty(a)) {
                var i, r, o;
                if ((i = e[a]).euCookie)
                    if ("true" !== SL.readCookie(n)) continue;
                if (!(r = SL.availableTools[i.engine])) {
                    var s = [];
                    for (var c in SL.availableTools) SL.availableTools.hasOwnProperty(c) && s.push(c);
                    throw new Error("No tool engine named " + i.engine + ", available: " + s.join(",") + ".")
                }(o = new r(i)).id = a, t[a] = o
            }
        return t
    }, SL.preprocessArguments = function(e, t, n, a, i) {
        function r(e) {
            return a && SL.isString(e) ? e.toLowerCase() : e
        }

        function o(e) {
            var c = {};
            for (var l in e)
                if (e.hasOwnProperty(l)) {
                    var d = e[l];
                    SL.isObject(d) ? c[l] = o(d) : SL.isArray(d) ? c[l] = s(d, a) : c[l] = r(SL.replace(d, t, n, i))
                }
            return c
        }

        function s(e) {
            for (var a = [], i = 0, s = e.length; i < s; i++) {
                var c = e[i];
                SL.isString(c) ? c = r(SL.replace(c, t, n)) : c && c.constructor === Object && (c = o(c)), a.push(c)
            }
            return a
        }
        return e ? s(e, a) : e
    }, SL.execute = function(e, t, n, a) {
        function i(i) {
            var r = a[i || "default"];
            if (r) try {
                r.triggerCommand(e, t, n)
            } catch (o) {
                SL.logError(o)
            }
        }
        if (!_satellite.settings.hideActivity)
            if (a = a || SL.tools, e.engine) {
                var r = e.engine;
                for (var o in a)
                    if (a.hasOwnProperty(o)) {
                        var s = a[o];
                        s.settings && s.settings.engine === r && i(o)
                    }
            } else e.tool instanceof Array ? SL.each(e.tool, function(e) {
                i(e)
            }) : i(e.tool)
    }, SL.Logger = {
        outputEnabled: !1,
        messages: [],
        keepLimit: 100,
        flushed: !1,
        LEVELS: [null, null, "log", "info", "warn", "error"],
        message: function(e, t) {
            var n = this.LEVELS[t] || "log";
            this.messages.push([n, e]), this.messages.length > this.keepLimit && this.messages.shift(), this.outputEnabled && this.echo(n, e)
        },
        getHistory: function() {
            return this.messages
        },
        clearHistory: function() {
            this.messages = []
        },
        setOutputState: function(e) {
            this.outputEnabled != e && (this.outputEnabled = e, e ? this.flush() : this.flushed = !1)
        },
        echo: function(e, t) {
            window.console && window.console[e]("SATELLITE: " + t)
        },
        flush: function() {
            this.flushed || (SL.each(this.messages, function(e) {
                !0 !== e[2] && (this.echo(e[0], e[1]), e[2] = !0)
            }, this), this.flushed = !0)
        }
    }, SL.notify = SL.bind(SL.Logger.message, SL.Logger), SL.cleanText = function(e) {
        return null == e ? null : SL.trim(e).replace(/\s+/g, " ")
    }, SL.cleanText.legacy = function(e) {
        return null == e ? null : SL.trim(e).replace(/\s{2,}/g, " ").replace(/[^\000-\177]*/g, "")
    }, SL.text = function(e) {
        return e.textContent || e.innerText
    }, SL.specialProperties = {
        text: SL.text,
        cleanText: function(e) {
            return SL.cleanText(SL.text(e))
        }
    }, SL.getObjectProperty = function(e, t, n) {
        for (var a, i = t.split("."), r = e, o = SL.specialProperties, s = 0, c = i.length; s < c; s++) {
            if (null == r) return undefined;
            var l = i[s];
            if (n && "@" === l.charAt(0)) r = o[l.slice(1)](r);
            else if (r.getAttribute && (a = l.match(/^getAttribute\((.+)\)$/))) {
                var d = a[1];
                r = r.getAttribute(d)
            } else r = r[l]
        }
        return r
    }, SL.getToolsByType = function(e) {
        if (!e) throw new Error("Tool type is missing");
        var t = [];
        for (var n in SL.tools)
            if (SL.tools.hasOwnProperty(n)) {
                var a = SL.tools[n];
                a.settings && a.settings.engine === e && t.push(a)
            }
        return t
    }, SL.setVar = function() {
        var e = SL.data.customVars;
        if (null == e && (SL.data.customVars = {}, e = SL.data.customVars), "string" == typeof arguments[0]) e[arguments[0]] = arguments[1];
        else if (arguments[0]) {
            var t = arguments[0];
            for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
        }
    }, SL.dataElementSafe = function(e, t) {
        if (arguments.length > 2) {
            var n = arguments[2];
            "pageview" === t ? SL.dataElementSafe.pageviewCache[e] = n : "session" === t ? SL.setCookie("_sdsat_" + e, n) : "visitor" === t && SL.setCookie("_sdsat_" + e, n, 730)
        } else {
            if ("pageview" === t) return SL.dataElementSafe.pageviewCache[e];
            if ("session" === t || "visitor" === t) return SL.readCookie("_sdsat_" + e)
        }
    }, SL.dataElementSafe.pageviewCache = {}, SL.realGetDataElement = function(e) {
        var t;
        return e.selector ? SL.hasSelector && SL.cssQuery(e.selector, function(n) {
            if (n.length > 0) {
                var a = n[0];
                "text" === e.property ? t = a.innerText || a.textContent : e.property in a ? t = a[e.property] : SL.hasAttr(a, e.property) && (t = a.getAttribute(e.property))
            }
        }) : e.queryParam ? t = e.ignoreCase ? SL.getQueryParamCaseInsensitive(e.queryParam) : SL.getQueryParam(e.queryParam) : e.cookie ? t = SL.readCookie(e.cookie) : e.jsVariable ? t = SL.getObjectProperty(window, e.jsVariable) : e.customJS ? t = e.customJS() : e.contextHub && (t = e.contextHub()), SL.isString(t) && e.cleanText && (t = SL.cleanText(t)), t
    }, SL.getDataElement = function(e, t, n) {
        if (null == (n = n || SL.dataElements[e])) return SL.settings.undefinedVarsReturnEmpty ? "" : null;
        var a = SL.realGetDataElement(n);
        return a === undefined && n.storeLength ? a = SL.dataElementSafe(e, n.storeLength) : a !== undefined && n.storeLength && SL.dataElementSafe(e, n.storeLength, a), a || t || (a = n["default"] || ""), SL.isString(a) && n.forceLowerCase && (a = a.toLowerCase()), a
    }, SL.getVar = function(e, t, n) {
        var a, i, r = SL.data.customVars,
            o = n ? n.target || n.srcElement : null,
            s = {
                uri: SL.URI(),
                protocol: document.location.protocol,
                hostname: document.location.hostname
            };
        if (SL.dataElements && e in SL.dataElements) return SL.getDataElement(e);
        if ((i = s[e.toLowerCase()]) === undefined)
            if ("this." === e.substring(0, 5)) e = e.slice(5), i = SL.getObjectProperty(t, e, !0);
            else if ("event." === e.substring(0, 6)) e = e.slice(6), i = SL.getObjectProperty(n, e);
        else if ("target." === e.substring(0, 7)) e = e.slice(7), i = SL.getObjectProperty(o, e);
        else if ("window." === e.substring(0, 7)) e = e.slice(7), i = SL.getObjectProperty(window, e);
        else if ("param." === e.substring(0, 6)) e = e.slice(6), i = SL.getQueryParam(e);
        else if (a = e.match(/^rand([0-9]+)$/)) {
            var c = Number(a[1]),
                l = (Math.random() * (Math.pow(10, c) - 1)).toFixed(0);
            i = Array(c - l.length + 1).join("0") + l
        } else i = SL.getObjectProperty(r, e);
        return i
    }, SL.getVars = function(e, t, n) {
        var a = {};
        return SL.each(e, function(e) {
            a[e] = SL.getVar(e, t, n)
        }), a
    }, SL.replace = function(e, t, n, a) {
        return "string" != typeof e ? e : e.replace(/%(.*?)%/g, function(e, i) {
            var r = SL.getVar(i, t, n);
            return null == r ? SL.settings.undefinedVarsReturnEmpty ? "" : e : a ? SL.escapeForHtml(r) : r
        })
    }, SL.escapeHtmlParams = function(e) {
        return e.escapeHtml = !0, e
    }, SL.searchVariables = function(e, t, n) {
        if (!e || 0 === e.length) return "";
        for (var a = [], i = 0, r = e.length; i < r; i++) {
            var o = e[i],
                s = SL.getVar(o, t, n);
            a.push(o + "=" + escape(s))
        }
        return "?" + a.join("&")
    }, SL.fireRule = function(e, t, n) {
        var a = e.trigger;
        if (a) {
            for (var i = 0, r = a.length; i < r; i++) {
                var o = a[i];
                SL.execute(o, t, n)
            }
            SL.contains(SL.fireOnceEvents, e.event) && (e.expired = !0)
        }
    }, SL.isLinked = function(e) {
        for (var t = e; t; t = t.parentNode)
            if (SL.isLinkTag(t)) return !0;
        return !1
    }, SL.firePageLoadEvent = function(e) {
        for (var t = document.location, n = {
                type: e,
                target: t
            }, a = SL.pageLoadRules, i = SL.evtHandlers[n.type], r = a.length; r--;) {
            var o = a[r];
            SL.ruleMatches(o, n, t) && (SL.notify('Rule "' + o.name + '" fired.', 1), SL.fireRule(o, t, n))
        }
        for (var s in SL.tools)
            if (SL.tools.hasOwnProperty(s)) {
                var c = SL.tools[s];
                c.endPLPhase && c.endPLPhase(e)
            }
        i && SL.each(i, function(e) {
            e(n)
        })
    }, SL.track = function(e) {
        e = e.replace(/^\s*/, "").replace(/\s*$/, "");
        for (var t = 0; t < SL.directCallRules.length; t++) {
            var n = SL.directCallRules[t];
            if (n.name === e) return SL.notify('Direct call Rule "' + e + '" fired.', 1), void SL.fireRule(n, location, {
                type: e
            })
        }
        SL.notify('Direct call Rule "' + e + '" not found.', 1)
    }, SL.basePath = function() {
        return SL.data.host ? ("https:" === document.location.protocol ? "https://" + SL.data.host.https : "http://" + SL.data.host.http) + "/" : this.settings.basePath
    }, SL.setLocation = function(e) {
        //window.location = e
    }, SL.parseQueryParams = function(e) {
        var t = function(e) {
            var t = e;
            try {
                t = decodeURIComponent(e)
            } catch (n) {}
            return t
        };
        if ("" === e || !1 === SL.isString(e)) return {};
        0 === e.indexOf("?") && (e = e.substring(1));
        var n = {},
            a = e.split("&");
        return SL.each(a, function(e) {
            (e = e.split("="))[1] && (n[t(e[0])] = t(e[1]))
        }), n
    }, SL.getCaseSensitivityQueryParamsMap = function(e) {
        var t = SL.parseQueryParams(e),
            n = {};
        for (var a in t) t.hasOwnProperty(a) && (n[a.toLowerCase()] = t[a]);
        return {
            normal: t,
            caseInsensitive: n
        }
    }, SL.updateQueryParams = function() {
        SL.QueryParams = SL.getCaseSensitivityQueryParamsMap(window.location.search)
    }, SL.updateQueryParams(), SL.getQueryParam = function(e) {
        return SL.QueryParams.normal[e]
    }, SL.getQueryParamCaseInsensitive = function(e) {
        return SL.QueryParams.caseInsensitive[e.toLowerCase()]
    }, SL.encodeObjectToURI = function(e) {
        if (!1 === SL.isObject(e)) return "";
        var t = [];
        for (var n in e) e.hasOwnProperty(n) && t.push(encodeURIComponent(n) + "=" + encodeURIComponent(e[n]));
        return t.join("&")
    }, SL.readCookie = function(e) {
        for (var t = e + "=", n = document.cookie.split(";"), a = 0; a < n.length; a++) {
            for (var i = n[a];
                " " == i.charAt(0);) i = i.substring(1, i.length);
            if (0 === i.indexOf(t)) return i.substring(t.length, i.length)
        }
        return undefined
    }, SL.setCookie = function(e, t, n) {
        var a;
        if (n) {
            var i = new Date;
            i.setTime(i.getTime() + 24 * n * 60 * 60 * 1e3), a = "; expires=" + i.toGMTString()
        } else a = "";
        document.cookie = e + "=" + t + a + "; path=/"
    }, SL.removeCookie = function(e) {
        SL.setCookie(e, "", -1)
    }, SL.getElementProperty = function(e, t) {
        if ("@" === t.charAt(0)) {
            var n = SL.specialProperties[t.substring(1)];
            if (n) return n(e)
        }
        return "innerText" === t ? SL.text(e) : t in e ? e[t] : e.getAttribute ? e.getAttribute(t) : undefined
    }, SL.propertiesMatch = function(e, t) {
        if (e)
            for (var n in e)
                if (e.hasOwnProperty(n)) {
                    var a = e[n],
                        i = SL.getElementProperty(t, n);
                    if ("string" == typeof a && a !== i) return !1;
                    if (a instanceof RegExp && !a.test(i)) return !1
                }
        return !0
    }, SL.isRightClick = function(e) {
        var t;
        return e.which ? t = 3 == e.which : e.button && (t = 2 == e.button), t
    }, SL.ruleMatches = function(e, t, n, a) {
        var i = e.condition,
            r = e.conditions,
            o = e.property,
            s = t.type,
            c = e.value,
            l = t.target || t.srcElement,
            d = n === l;
        if (e.event !== s && ("custom" !== e.event || e.customEvent !== s)) return !1;
        if (!SL.ruleInScope(e)) return !1;
        if ("click" === e.event && SL.isRightClick(t)) return !1;
        if (e.isDefault && a > 0) return !1;
        if (e.expired) return !1;
        if ("inview" === s && t.inviewDelay !== e.inviewDelay) return !1;
        if (!d && (!1 === e.bubbleFireIfParent || 0 !== a && !1 === e.bubbleFireIfChildFired)) return !1;
        if (e.selector && !SL.matchesCss(e.selector, n)) return !1;
        if (!SL.propertiesMatch(o, n)) return !1;
        if (null != c)
            if ("string" == typeof c) {
                if (c !== n.value) return !1
            } else if (!c.test(n.value)) return !1;
        if (i) try {
            if (!i.call(n, t, l)) return SL.notify('Condition for rule "' + e.name + '" not met.', 1), !1
        } catch (m) {
            return SL.notify('Condition for rule "' + e.name + '" not met. Error: ' + m.message, 1), !1
        }
        if (r) {
            var u = SL.find(r, function(a) {
                try {
                    return !a.call(n, t, l)
                } catch (m) {
                    return SL.notify('Condition for rule "' + e.name + '" not met. Error: ' + m.message, 1), !0
                }
            });
            if (u) return SL.notify("Condition " + u.toString() + ' for rule "' + e.name + '" not met.', 1), !1
        }
        return !0
    }, SL.evtHandlers = {}, SL.bindEvent = function(e, t) {
        var n = SL.evtHandlers;
        n[e] || (n[e] = []), n[e].push(t)
    }, SL.whenEvent = SL.bindEvent, SL.unbindEvent = function(e, t) {
        var n = SL.evtHandlers;
        if (n[e]) {
            var a = SL.indexOf(n[e], t);
            n[e].splice(a, 1)
        }
    }, SL.bindEventOnce = function(e, t) {
        var n = function() {
            SL.unbindEvent(e, n), t.apply(null, arguments)
        };
        SL.bindEvent(e, n)
    }, SL.isVMLPoisoned = function(e) {
        if (!e) return !1;
        try {
            e.nodeName
        } catch (t) {
            if ("Attribute only valid on v:image" === t.message) return !0
        }
        return !1
    }, SL.handleEvent = function(e) {
        if (!SL.$data(e, "eventProcessed")) {
            var t = e.type.toLowerCase(),
                n = e.target || e.srcElement,
                a = 0,
                i = SL.rules,
                r = (SL.tools, SL.evtHandlers[e.type]);
            if (SL.isVMLPoisoned(n)) SL.notify("detected " + t + " on poisoned VML element, skipping.", 1);
            else {
                r && SL.each(r, function(t) {
                    t(e)
                }), n && n.nodeName ? SL.notify("detected " + t + " on " + n.nodeName, 1) : SL.notify("detected " + t, 1);
                for (var o = n; o; o = o.parentNode) {
                    var s = !1;
                    if (SL.each(i, function(t) {
                            SL.ruleMatches(t, e, o, a) && (SL.notify('Rule "' + t.name + '" fired.', 1), SL.fireRule(t, o, e), a++, t.bubbleStop && (s = !0))
                        }), s) break
                }
                SL.$data(e, "eventProcessed", !0)
            }
        }
    }, SL.onEvent = document.querySelectorAll ? function(e) {
        SL.handleEvent(e)
    } : (Hg = [], Ig = function(e) {
        e.selector ? Hg.push(e) : SL.handleEvent(e)
    }, Ig.pendingEvents = Hg, Ig), SL.fireEvent = function(e, t) {
        SL.onEvent({
            type: e,
            target: t
        })
    }, SL.registerEvents = function(e, t) {
        for (var n = t.length - 1; n >= 0; n--) {
            var a = t[n];
            SL.$data(e, a + ".tracked") || (SL.addEventHandler(e, a, SL.onEvent), SL.$data(e, a + ".tracked", !0))
        }
    }, SL.registerEventsForTags = function(e, t) {
        for (var n = e.length - 1; n >= 0; n--)
            for (var a = e[n], i = document.getElementsByTagName(a), r = i.length - 1; r >= 0; r--) SL.registerEvents(i[r], t)
    }, SL.setListeners = function() {
        var e = ["click", "submit"];
        SL.each(SL.rules, function(t) {
            "custom" === t.event && t.hasOwnProperty("customEvent") && !SL.contains(e, t.customEvent) && e.push(t.customEvent)
        }), SL.registerEvents(document, e)
    }, SL.getUniqueRuleEvents = function() {
        return SL._uniqueRuleEvents || (SL._uniqueRuleEvents = [], SL.each(SL.rules, function(e) {
            -1 === SL.indexOf(SL._uniqueRuleEvents, e.event) && SL._uniqueRuleEvents.push(e.event)
        })), SL._uniqueRuleEvents
    }, SL.setFormListeners = function() {
        if (!SL._relevantFormEvents) {
            var e = ["change", "focus", "blur", "keypress"];
            SL._relevantFormEvents = SL.filter(SL.getUniqueRuleEvents(), function(t) {
                return -1 !== SL.indexOf(e, t)
            })
        }
        SL._relevantFormEvents.length && SL.registerEventsForTags(["input", "select", "textarea", "button"], SL._relevantFormEvents)
    }, SL.setVideoListeners = function() {
        if (!SL._relevantVideoEvents) {
            var e = ["play", "pause", "ended", "volumechange", "stalled", "loadeddata"];
            SL._relevantVideoEvents = SL.filter(SL.getUniqueRuleEvents(), function(t) {
                return -1 !== SL.indexOf(e, t)
            })
        }
        SL._relevantVideoEvents.length && SL.registerEventsForTags(["video"], SL._relevantVideoEvents)
    }, SL.readStoredSetting = function(e) {
        try {
            return e = "sdsat_" + e, window.localStorage.getItem(e)
        } catch (t) {
            return SL.notify("Cannot read stored setting from localStorage: " + t.message, 2), null
        }
    }, SL.loadStoredSettings = function() {
        var e = SL.readStoredSetting("debug"),
            t = SL.readStoredSetting("hide_activity");
        e && (SL.settings.notifications = "true" === e), t && (SL.settings.hideActivity = "true" === t)
    }, SL.isRuleActive = function(e, t) {
        function n(e, t) {
            return t = i(t, {
                hour: e[p](),
                minute: e[g]()
            }), Math.floor(Math.abs((e.getTime() - t.getTime()) / 864e5))
        }

        function a(e, t) {
            function n(e) {
                return 12 * e[u]() + e[m]()
            }
            return Math.abs(n(e) - n(t))
        }

        function i(e, t) {
            var n = new Date(e.getTime());
            for (var a in t)
                if (t.hasOwnProperty(a)) {
                    var i = t[a];
                    switch (a) {
                        case "hour":
                            n[v](i);
                            break;
                        case "minute":
                            n[f](i);
                            break;
                        case "date":
                            n[h](i)
                    }
                }
            return n
        }

        function r(e, t) {
            return 60 * e[p]() + e[g]() > 60 * t[p]() + t[g]()
        }

        function o(e, t) {
            return 60 * e[p]() + e[g]() < 60 * t[p]() + t[g]()
        }
        var s = e.schedule;
        if (!s) return !0;
        var c = s.utc,
            l = c ? "getUTCDate" : "getDate",
            d = c ? "getUTCDay" : "getDay",
            u = c ? "getUTCFullYear" : "getFullYear",
            m = c ? "getUTCMonth" : "getMonth",
            p = c ? "getUTCHours" : "getHours",
            g = c ? "getUTCMinutes" : "getMinutes",
            v = c ? "setUTCHours" : "setHours",
            f = c ? "setUTCMinutes" : "setMinutes",
            h = c ? "setUTCDate" : "setDate";
        if (t = t || new Date, s.repeat) {
            if (r(s.start, t)) return !1;
            if (o(s.end, t)) return !1;
            if (t < s.start) return !1;
            if (s.endRepeat && t >= s.endRepeat) return !1;
            if ("daily" === s.repeat) {
                if (s.repeatEvery)
                    if (n(s.start, t) % s.repeatEvery != 0) return !1
            } else if ("weekly" === s.repeat) {
                if (s.days) {
                    if (!SL.contains(s.days, t[d]())) return !1
                } else if (s.start[d]() !== t[d]()) return !1;
                if (s.repeatEvery)
                    if (n(s.start, t) % (7 * s.repeatEvery) != 0) return !1
            } else if ("monthly" === s.repeat) {
                if (s.repeatEvery)
                    if (a(s.start, t) % s.repeatEvery != 0) return !1;
                if (s.nthWeek && s.mthDay) {
                    if (s.mthDay !== t[d]()) return !1;
                    var b = Math.floor((t[l]() - t[d]() + 1) / 7);
                    if (s.nthWeek !== b) return !1
                } else if (s.start[l]() !== t[l]()) return !1
            } else if ("yearly" === s.repeat) {
                if (s.start[m]() !== t[m]()) return !1;
                if (s.start[l]() !== t[l]()) return !1;
                if (s.repeatEvery)
                    if (Math.abs(s.start[u]() - t[u]()) % s.repeatEvery != 0) return !1
            }
        } else {
            if (s.start > t) return !1;
            if (s.end < t) return !1
        }
        return !0
    }, SL.isOutboundLink = function(e) {
        if (!e.getAttribute("href")) return !1;
        var t = e.hostname,
            n = (e.href, e.protocol);
        return ("http:" === n || "https:" === n) && (!SL.any(SL.settings.domainList, function(e) {
            return SL.isSubdomainOf(t, e)
        }) && t !== location.hostname)
    }, SL.isLinkerLink = function(e) {
        return !(!e.getAttribute || !e.getAttribute("href")) && (SL.hasMultipleDomains() && e.hostname != location.hostname && !e.href.match(/^javascript/i) && !SL.isOutboundLink(e))
    }, SL.isSubdomainOf = function(e, t) {
        if (e === t) return !0;
        var n = e.length - t.length;
        return n > 0 && SL.equalsIgnoreCase(e.substring(n), t)
    }, SL.getVisitorId = function() {
        var e = SL.getToolsByType("visitor_id");
        return 0 === e.length ? null : e[0].getInstance()
    }, SL.URI = function() {
        var e = document.location.pathname + document.location.search;
        return SL.settings.forceLowerCase && (e = e.toLowerCase()), e
    }, SL.URL = function() {
        var e = document.location.href;
        return SL.settings.forceLowerCase && (e = e.toLowerCase()), e
    }, SL.filterRules = function() {
        function e(e) {
            return !!SL.isRuleActive(e)
        }
        SL.rules = SL.filter(SL.rules, e), SL.pageLoadRules = SL.filter(SL.pageLoadRules, e)
    }, SL.ruleInScope = function(e, t) {
        function n(e, t) {
            function n(e) {
                return t.match(e)
            }
            var i = e.include,
                r = e.exclude;
            if (i && a(i, t)) return !0;
            if (r) {
                if (SL.isString(r) && r === t) return !0;
                if (SL.isArray(r) && SL.any(r, n)) return !0;
                if (SL.isRegex(r) && n(r)) return !0
            }
            return !1
        }

        function a(e, t) {
            function n(e) {
                return t.match(e)
            }
            return !(!SL.isString(e) || e === t) || (!(!SL.isArray(e) || SL.any(e, n)) || !(!SL.isRegex(e) || n(e)))
        }
        t = t || document.location;
        var i = e.scope;
        if (!i) return !0;
        var r = i.URI,
            o = i.subdomains,
            s = i.domains,
            c = i.protocols,
            l = i.hashes;
        return (!r || !n(r, t.pathname + t.search)) && ((!o || !n(o, t.hostname)) && ((!s || !a(s, t.hostname)) && ((!c || !a(c, t.protocol)) && (!l || !n(l, t.hash)))))
    }, SL.backgroundTasks = function() {
        new Date;
        SL.setFormListeners(), SL.setVideoListeners(), SL.loadStoredSettings(), SL.registerNewElementsForDynamicRules(), SL.eventEmitterBackgroundTasks();
        new Date
    }, SL.registerNewElementsForDynamicRules = function() {
        function e(t, n) {
            var a = e.cache[t];
            if (a) return n(a);
            SL.cssQuery(t, function(a) {
                e.cache[t] = a, n(a)
            })
        }
        e.cache = {}, SL.each(SL.dynamicRules, function(t) {
            e(t.selector, function(e) {
                SL.each(e, function(e) {
                    var n = "custom" === t.event ? t.customEvent : t.event;
                    SL.$data(e, "dynamicRules.seen." + n) || (SL.$data(e, "dynamicRules.seen." + n, !0), SL.propertiesMatch(t.property, e) && SL.registerEvents(e, [n]))
                })
            })
        })
    }, SL.ensureCSSSelector = function() {
        document.querySelectorAll ? SL.hasSelector = !0 : (SL.loadingSizzle = !0, SL.sizzleQueue = [], SL.loadScript(SL.basePath() + "selector.js", function() {
            if (SL.Sizzle) {
                var e = SL.onEvent.pendingEvents;
                SL.each(e, function(e) {
                    SL.handleEvent(e)
                }, this), SL.onEvent = SL.handleEvent, SL.hasSelector = !0, delete SL.loadingSizzle, SL.each(SL.sizzleQueue, function(e) {
                    SL.cssQuery(e[0], e[1])
                }), delete SL.sizzleQueue
            } else SL.logError(new Error("Failed to load selector.js"))
        }))
    }, SL.errors = [], SL.logError = function(e) {
        SL.errors.push(e), SL.notify(e.name + " - " + e.message, 5)
    }, SL.pageBottom = function() {
        SL.initialized && (SL.pageBottomFired = !0, SL.firePageLoadEvent("pagebottom"))
    }, SL.stagingLibraryOverride = function() {
        if ("true" === SL.readStoredSetting("stagingLibrary")) {
            for (var e, t, n, a = document.getElementsByTagName("script"), i = /^(.*)satelliteLib-([a-f0-9]{40})\.js$/, r = /^(.*)satelliteLib-([a-f0-9]{40})-staging\.js$/, o = 0, s = a.length; o < s && (!(n = a[o].getAttribute("src")) || (e || (e = n.match(i)), t || (t = n.match(r)), !t)); o++);
            if (e && !t) {
                var c = e[1] + "satelliteLib-" + e[2] + "-staging.js";
                if (document.write) document.write('<script src="' + c + '"></script>');
                else {
                    var l = document.createElement("script");
                    l.src = c, document.head.appendChild(l)
                }
                return !0
            }
        }
        return !1
    }, SL.checkAsyncInclude = function() {
        window.satellite_asyncLoad && SL.notify('You may be using the async installation of Satellite. In-page HTML and the "pagebottom" event will not work. Please update your Satellite installation for these features.', 5)
    }, SL.hasMultipleDomains = function() {
        return !!SL.settings.domainList && SL.settings.domainList.length > 1
    }, SL.handleOverrides = function() {
        if (Overrides)
            for (var e in Overrides) Overrides.hasOwnProperty(e) && (SL.data[e] = Overrides[e])
    }, SL.privacyManagerParams = function() {
        var e = {};
        SL.extend(e, SL.settings.privacyManagement);
        var t = [];
        for (var n in SL.tools)
            if (SL.tools.hasOwnProperty(n)) {
                var a = SL.tools[n],
                    i = a.settings;
                if (!i) continue;
                "sc" === i.engine && t.push(a)
            }
        var r = SL.filter(SL.map(t, function(e) {
            return e.getTrackingServer()
        }), function(e) {
            return null != e
        });
        e.adobeAnalyticsTrackingServers = r;
        for (var o = ["bannerText", "headline", "introductoryText", "customCSS"], s = 0; s < o.length; s++) {
            var c = o[s],
                l = e[c];
            if (l)
                if ("text" === l.type) e[c] = l.value;
                else {
                    if ("data" !== l.type) throw new Error("Invalid type: " + l.type);
                    e[c] = SL.getVar(l.value)
                }
        }
        return e
    }, SL.prepareLoadPrivacyManager = function() {
        function e(e) {
            function t() {
                ++r === i.length && (n(), clearTimeout(o), e())
            }

            function n() {
                SL.each(i, function(e) {
                    SL.unbindEvent(e.id + ".load", t)
                })
            }

            function a() {
                n(), e()
            }
            var i = SL.filter(SL.values(SL.tools), function(e) {
                return e.settings && "sc" === e.settings.engine
            });
            if (0 === i.length) return e();
            var r = 0;
            SL.each(i, function(e) {
                SL.bindEvent(e.id + ".load", t)
            });
            var o = setTimeout(a, 5e3)
        }
        SL.addEventHandler(window, "load", function() {
            e(SL.loadPrivacyManager)
        })
    }, SL.loadPrivacyManager = function() {
        var e = SL.basePath() + "privacy_manager.js";
        SL.loadScript(e, function() {
            var e = SL.privacyManager;
            e.configure(SL.privacyManagerParams()), e.openIfRequired()
        })
    }, SL.init = function(e) {
        if (!SL.stagingLibraryOverride()) {
            SL.configurationSettings = e;
            var t = e.tools;
            for (var n in delete e.tools, e) e.hasOwnProperty(n) && (SL[n] = e[n]);
            SL.data.customVars === undefined && (SL.data.customVars = {}), SL.data.queryParams = SL.QueryParams.normal, SL.handleOverrides(), SL.detectBrowserInfo(), SL.trackVisitorInfo && SL.trackVisitorInfo(), SL.loadStoredSettings(), SL.Logger.setOutputState(SL.settings.notifications), SL.checkAsyncInclude(), SL.ensureCSSSelector(), SL.filterRules(), SL.dynamicRules = SL.filter(SL.rules, function(e) {
                return e.eventHandlerOnElement
            }), SL.tools = SL.initTools(t), SL.initEventEmitters(), SL.firePageLoadEvent("aftertoolinit"), SL.settings.privacyManagement && SL.prepareLoadPrivacyManager(), SL.hasSelector && SL.domReady(SL.eventEmitterBackgroundTasks), SL.setListeners(), SL.domReady(function() {
                SL.poll(function() {
                    SL.backgroundTasks()
                }, SL.settings.recheckEvery || 3e3)
            }), SL.domReady(function() {
                SL.domReadyFired = !0, SL.pageBottomFired || SL.pageBottom(), SL.firePageLoadEvent("domready")
            }), SL.addEventHandler(window, "load", function() {
                SL.firePageLoadEvent("windowload")
            }), SL.firePageLoadEvent("pagetop"), SL.initialized = !0
        }
    }, SL.pageLoadPhases = ["aftertoolinit", "pagetop", "pagebottom", "domready", "windowload"], SL.loadEventBefore = function(e, t) {
        return SL.indexOf(SL.pageLoadPhases, e) <= SL.indexOf(SL.pageLoadPhases, t)
    }, SL.flushPendingCalls = function(e) {
        e.pending && (SL.each(e.pending, function(t) {
            var n = t[0],
                a = t[1],
                i = t[2],
                r = t[3];
            n in e ? e[n].apply(e, [a, i].concat(r)) : e.emit ? e.emit(n, a, i, r) : SL.notify("Failed to trigger " + n + " for tool " + e.id, 1)
        }), delete e.pending)
    }, SL.setDebug = function(e) {
        try {
            window.localStorage.setItem("sdsat_debug", e)
        } catch (t) {
            SL.notify("Cannot set debug mode: " + t.message, 2)
        }
    }, SL.getUserAgent = function() {
        return navigator.userAgent
    }, SL.detectBrowserInfo = function() {
        function e(e) {
            return function(t) {
                for (var n in e) {
                    if (e.hasOwnProperty(n))
                        if (e[n].test(t)) return n
                }
                return "Unknown"
            }
        }
        var t = e({
                "IE Edge Mobile": /Windows Phone.*Edge/,
                "IE Edge": /Edge/,
                OmniWeb: /OmniWeb/,
                "Opera Mini": /Opera Mini/,
                "Opera Mobile": /Opera Mobi/,
                Opera: /Opera/,
                Chrome: /Chrome|CriOS|CrMo/,
                Firefox: /Firefox|FxiOS/,
                "IE Mobile": /IEMobile/,
                IE: /MSIE|Trident/,
                "Mobile Safari": /Mobile(\/[0-9A-z]+)? Safari/,
                Safari: /Safari/
            }),
            n = e({
                Blackberry: /BlackBerry|BB10/,
                "Symbian OS": /Symbian|SymbOS/,
                Maemo: /Maemo/,
                Android: /Android/,
                Linux: / Linux /,
                Unix: /FreeBSD|OpenBSD|CrOS/,
                Windows: /[\( ]Windows /,
                iOS: /iPhone|iPad|iPod/,
                MacOS: /Macintosh;/
            }),
            a = e({
                Nokia: /Symbian|SymbOS|Maemo/,
                "Windows Phone": /Windows Phone/,
                Blackberry: /BlackBerry|BB10/,
                Android: /Android/,
                iPad: /iPad/,
                iPod: /iPod/,
                iPhone: /iPhone/,
                Desktop: /.*/
            }),
            i = SL.getUserAgent();
        SL.browserInfo = {
            browser: t(i),
            os: n(i),
            deviceType: a(i)
        }
    }, SL.isHttps = function() {
        return "https:" == document.location.protocol
    }, SL.BaseTool = function(e) {
        this.settings = e || {}, this.forceLowerCase = SL.settings.forceLowerCase, "forceLowerCase" in this.settings && (this.forceLowerCase = this.settings.forceLowerCase)
    }, SL.BaseTool.prototype = {
        triggerCommand: function(e, t, n) {
            var a = this.settings || {};
            if (this.initialize && this.isQueueAvailable() && this.isQueueable(e) && n && SL.loadEventBefore(n.type, a.loadOn)) this.queueCommand(e, t, n);
            else {
                var i = e.command,
                    r = this["$" + i],
                    o = !!r && r.escapeHtml,
                    s = SL.preprocessArguments(e.arguments, t, n, this.forceLowerCase, o);
                r ? r.apply(this, [t, n].concat(s)) : this.$missing$ ? this.$missing$(i, t, n, s) : SL.notify("Failed to trigger " + i + " for tool " + this.id, 1)
            }
        },
        endPLPhase: function() {},
        isQueueable: function(e) {
            return "cancelToolInit" !== e.command
        },
        isQueueAvailable: function() {
            return !this.initialized && !this.initializing
        },
        flushQueue: function() {
            this.pending && (SL.each(this.pending, function(e) {
                this.triggerCommand.apply(this, e)
            }, this), this.pending = [])
        },
        queueCommand: function(e, t, n) {
            this.pending || (this.pending = []), this.pending.push([e, t, n])
        },
        $cancelToolInit: function() {
            this._cancelToolInit = !0
        }
    }, window._satellite = SL, SL.ecommerce = {
        addItem: function() {
            var e = [].slice.call(arguments);
            SL.onEvent({
                type: "ecommerce.additem",
                target: e
            })
        },
        addTrans: function() {
            var e = [].slice.call(arguments);
            SL.data.saleData.sale = {
                orderId: e[0],
                revenue: e[2]
            }, SL.onEvent({
                type: "ecommerce.addtrans",
                target: e
            })
        },
        trackTrans: function() {
            SL.onEvent({
                type: "ecommerce.tracktrans",
                target: []
            })
        }
    }, SL.visibility = {
        isHidden: function() {
            var e = this.getHiddenProperty();
            return !!e && document[e]
        },
        isVisible: function() {
            return !this.isHidden()
        },
        getHiddenProperty: function() {
            var e = ["webkit", "moz", "ms", "o"];
            if ("hidden" in document) return "hidden";
            for (var t = 0; t < e.length; t++)
                if (e[t] + "Hidden" in document) return e[t] + "Hidden";
            return null
        },
        getVisibilityEvent: function() {
            var e = this.getHiddenProperty();
            return e ? e.replace(/[H|h]idden/, "") + "visibilitychange" : null
        }
    }, LeaveEventEmitter.prototype = {
        obue: !1,
        initialize: function() {
            this.attachCloseListeners()
        },
        obuePrevUnload: function() {},
        obuePrevBeforeUnload: function() {},
        newObueListener: function() {
            this.obue || (this.obue = !0, this.triggerBeacons())
        },
        attachCloseListeners: function() {
            this.prevUnload = window.onunload, this.prevBeforeUnload = window.onbeforeunload, window.onunload = SL.bind(function(e) {
                this.prevUnload && setTimeout(SL.bind(function() {
                    this.prevUnload.call(window, e)
                }, this), 1), this.newObueListener()
            }, this), window.onbeforeunload = SL.bind(function(e) {
                this.prevBeforeUnload && setTimeout(SL.bind(function() {
                    this.prevBeforeUnload.call(window, e)
                }, this), 1), this.newObueListener()
            }, this)
        },
        triggerBeacons: function() {
            SL.fireEvent("leave", document)
        }
    }, SL.availableEventEmitters.push(LeaveEventEmitter), TwitterEventEmitter.prototype = {
        initialize: function() {
            var e = this.twttr;
            e && "function" == typeof e.ready && e.ready(SL.bind(this.bind, this))
        },
        bind: function() {
            this.twttr.events.bind("tweet", function(e) {
                e && (SL.notify("tracking a tweet button", 1), SL.onEvent({
                    type: "twitter.tweet",
                    target: document
                }))
            })
        }
    }, SL.availableEventEmitters.push(TwitterEventEmitter), LocationChangeEventEmitter.prototype = {
        initialize: function() {
            this.setupHistoryAPI(), this.setupHashChange()
        },
        fireIfURIChanged: function() {
            var e = SL.URL();
            this.lastURL !== e && (this.fireEvent(), this.lastURL = e)
        },
        fireEvent: function() {
            SL.updateQueryParams(), SL.onEvent({
                type: "locationchange",
                target: document
            })
        },
        setupSPASupport: function() {
            this.setupHistoryAPI(), this.setupHashChange()
        },
        setupHistoryAPI: function() {
            var e = window.history;
            e && (e.pushState && (this.originalPushState = e.pushState, e.pushState = this._pushState), e.replaceState && (this.originalReplaceState = e.replaceState, e.replaceState = this._replaceState)), SL.addEventHandler(window, "popstate", this._onPopState)
        },
        pushState: function() {
            var e = this.originalPushState.apply(history, arguments);
            return this.onPushState(), e
        },
        replaceState: function() {
            var e = this.originalReplaceState.apply(history, arguments);
            return this.onReplaceState(), e
        },
        setupHashChange: function() {
            SL.addEventHandler(window, "hashchange", this._onHashChange)
        },
        onReplaceState: function() {
            setTimeout(this._fireIfURIChanged, 0)
        },
        onPushState: function() {
            setTimeout(this._fireIfURIChanged, 0)
        },
        onPopState: function() {
            setTimeout(this._fireIfURIChanged, 0)
        },
        onHashChange: function() {
            setTimeout(this._fireIfURIChanged, 0)
        },
        uninitialize: function() {
            this.cleanUpHistoryAPI(), this.cleanUpHashChange()
        },
        cleanUpHistoryAPI: function() {
            history.pushState === this._pushState && (history.pushState = this.originalPushState), history.replaceState === this._replaceState && (history.replaceState = this.originalReplaceState), SL.removeEventHandler(window, "popstate", this._onPopState)
        },
        cleanUpHashChange: function() {
            SL.removeEventHandler(window, "hashchange", this._onHashChange)
        }
    }, SL.availableEventEmitters.push(LocationChangeEventEmitter), DataElementChangeEmitter.prototype.getStringifiedValue = window.JSON && window.JSON.stringify || SL.stringify, DataElementChangeEmitter.prototype.initPolling = function() {
        0 !== this.dataElementsNames.length && (this.dataElementsStore = this.getDataElementsValues(), SL.poll(SL.bind(this.checkDataElementValues, this), 1e3))
    }, DataElementChangeEmitter.prototype.getDataElementsValues = function() {
        var e = {};
        return SL.each(this.dataElementsNames, function(t) {
            var n = SL.getVar(t);
            e[t] = this.getStringifiedValue(n)
        }, this), e
    }, DataElementChangeEmitter.prototype.checkDataElementValues = function() {
        SL.each(this.dataElementsNames, SL.bind(function(e) {
            var t = this.getStringifiedValue(SL.getVar(e));
            t !== this.dataElementsStore[e] && (this.dataElementsStore[e] = t, SL.onEvent({
                type: "dataelementchange(" + e + ")",
                target: document
            }))
        }, this))
    }, SL.availableEventEmitters.push(DataElementChangeEmitter), OrientationChangeEventEmitter.orientationChange = function(e) {
        var t = 0 === window.orientation ? "portrait" : "landscape";
        e.orientation = t, SL.onEvent(e)
    }, SL.availableEventEmitters.push(OrientationChangeEventEmitter), VideoPlayedEventEmitter.prototype = {
        backgroundTasks: function() {
            var e = this.eventHandler;
            SL.each(this.rules, function(t) {
                SL.cssQuery(t.selector || "video", function(t) {
                    SL.each(t, function(t) {
                        SL.$data(t, "videoplayed.tracked") || (SL.addEventHandler(t, "timeupdate", SL.throttle(e, 100)), SL.$data(t, "videoplayed.tracked", !0))
                    })
                })
            })
        },
        evalRule: function(e, t) {
            var n = t.event,
                a = e.seekable,
                i = a.start(0),
                r = a.end(0),
                o = e.currentTime,
                s = t.event.match(/^videoplayed\(([0-9]+)([s%])\)$/);
            if (s) {
                var c = s[2],
                    l = Number(s[1]),
                    d = "%" === c ? function() {
                        return l <= 100 * (o - i) / (r - i)
                    } : function() {
                        return l <= o - i
                    };
                !SL.$data(e, n) && d() && (SL.$data(e, n, !0), SL.onEvent({
                    type: n,
                    target: e
                }))
            }
        },
        onUpdateTime: function(e) {
            var t = this.rules,
                n = e.target;
            if (n.seekable && 0 !== n.seekable.length)
                for (var a = 0, i = t.length; a < i; a++) this.evalRule(n, t[a])
        }
    }, SL.availableEventEmitters.push(VideoPlayedEventEmitter), VisibilityEventEmitter.prototype = {
        defineEvents: function() {
            this.oldBlurClosure = function() {
                SL.fireEvent("tabblur", document)
            }, this.oldFocusClosure = SL.bind(function() {
                this.visibilityApiHasPriority ? SL.fireEvent("tabfocus", document) : null != SL.visibility.getHiddenProperty() && SL.visibility.isHidden() || SL.fireEvent("tabfocus", document)
            }, this)
        },
        attachDetachModernEventListeners: function(e) {
            SL[0 == e ? "removeEventHandler" : "addEventHandler"](document, SL.visibility.getVisibilityEvent(), this.handleVisibilityChange)
        },
        attachDetachOlderEventListeners: function(e, t, n) {
            var a = 0 == e ? "removeEventHandler" : "addEventHandler";
            SL[a](t, n, this.oldBlurClosure), SL[a](window, "focus", this.oldFocusClosure)
        },
        handleVisibilityChange: function() {
            SL.visibility.isHidden() ? SL.fireEvent("tabblur", document) : SL.fireEvent("tabfocus", document)
        },
        setVisibilityApiPriority: function(e) {
            this.visibilityApiHasPriority = e, this.attachDetachOlderEventListeners(!1, window, "blur"), this.attachDetachModernEventListeners(!1), e ? null != SL.visibility.getHiddenProperty() ? this.attachDetachModernEventListeners(!0) : this.attachDetachOlderEventListeners(!0, window, "blur") : (this.attachDetachOlderEventListeners(!0, window, "blur"), null != SL.visibility.getHiddenProperty() && this.attachDetachModernEventListeners(!0))
        },
        oldBlurClosure: null,
        oldFocusClosure: null,
        visibilityApiHasPriority: !0
    }, SL.availableEventEmitters.push(VisibilityEventEmitter), InViewEventEmitter.offset = function(e) {
        var t = null,
            n = null;
        try {
            var a = e.getBoundingClientRect(),
                i = document,
                r = i.documentElement,
                o = i.body,
                s = window,
                c = r.clientTop || o.clientTop || 0,
                l = r.clientLeft || o.clientLeft || 0,
                d = s.pageYOffset || r.scrollTop || o.scrollTop,
                u = s.pageXOffset || r.scrollLeft || o.scrollLeft;
            t = a.top + d - c, n = a.left + u - l
        } catch (m) {}
        return {
            top: t,
            left: n
        }
    }, InViewEventEmitter.getViewportHeight = function() {
        var e = window.innerHeight,
            t = document.compatMode;
        return t && (e = "CSS1Compat" == t ? document.documentElement.clientHeight : document.body.clientHeight), e
    }, InViewEventEmitter.getScrollTop = function() {
        return document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop
    }, InViewEventEmitter.isElementInDocument = function(e) {
        return document.body.contains(e)
    }, InViewEventEmitter.isElementInView = function(e) {
        if (!InViewEventEmitter.isElementInDocument(e)) return !1;
        var t = InViewEventEmitter.getViewportHeight(),
            n = InViewEventEmitter.getScrollTop(),
            a = InViewEventEmitter.offset(e).top,
            i = e.offsetHeight;
        return null !== a && !(n > a + i || n + t < a)
    }, InViewEventEmitter.prototype = {
        backgroundTasks: function() {
            var e = this.elements;
            SL.each(this.rules, function(t) {
                SL.cssQuery(t.selector, function(n) {
                    var a = 0;
                    SL.each(n, function(t) {
                        SL.contains(e, t) || (e.push(t), a++)
                    }), a && SL.notify(t.selector + " added " + a + " elements.", 1)
                })
            }), this.track()
        },
        checkInView: function(e, t, n) {
            var a = SL.$data(e, "inview");
            if (InViewEventEmitter.isElementInView(e)) {
                a || SL.$data(e, "inview", !0);
                var i = this;
                this.processRules(e, function(n, a, r) {
                    if (t || !n.inviewDelay) SL.$data(e, a, !0), SL.onEvent({
                        type: "inview",
                        target: e,
                        inviewDelay: n.inviewDelay
                    });
                    else if (n.inviewDelay) {
                        var o = SL.$data(e, r);
                        o || (o = setTimeout(function() {
                            i.checkInView(e, !0, n.inviewDelay)
                        }, n.inviewDelay), SL.$data(e, r, o))
                    }
                }, n)
            } else {
                if (!InViewEventEmitter.isElementInDocument(e)) {
                    var r = SL.indexOf(this.elements, e);
                    this.elements.splice(r, 1)
                }
                a && SL.$data(e, "inview", !1), this.processRules(e, function(t, n, a) {
                    var i = SL.$data(e, a);
                    i && clearTimeout(i)
                }, n)
            }
        },
        track: function() {
            for (var e = this.elements.length - 1; e >= 0; e--) this.checkInView(this.elements[e])
        },
        processRules: function(e, t, n) {
            var a = this.rules;
            n && (a = SL.filter(this.rules, function(e) {
                return e.inviewDelay == n
            })), SL.each(a, function(n, a) {
                var i = n.inviewDelay ? "viewed_" + n.inviewDelay : "viewed",
                    r = "inview_timeout_id_" + a;
                SL.$data(e, i) || SL.matchesCss(n.selector, e) && t(n, i, r)
            })
        }
    }, SL.availableEventEmitters.push(InViewEventEmitter), ElementExistsEventEmitter.prototype.backgroundTasks = function() {
        SL.each(this.rules, function(e) {
            SL.cssQuery(e.selector, function(e) {
                if (e.length > 0) {
                    var t = e[0];
                    if (SL.$data(t, "elementexists.seen")) return;
                    SL.$data(t, "elementexists.seen", !0), SL.onEvent({
                        type: "elementexists",
                        target: t
                    })
                }
            })
        })
    }, SL.availableEventEmitters.push(ElementExistsEventEmitter), FacebookEventEmitter.prototype = {
        initialize: function() {
            if (this.FB = this.FB || window.FB, this.FB && this.FB.Event && this.FB.Event.subscribe) return this.bind(), !0
        },
        bind: function() {
            this.FB.Event.subscribe("edge.create", function() {
                SL.notify("tracking a facebook like", 1), SL.onEvent({
                    type: "facebook.like",
                    target: document
                })
            }), this.FB.Event.subscribe("edge.remove", function() {
                SL.notify("tracking a facebook unlike", 1), SL.onEvent({
                    type: "facebook.unlike",
                    target: document
                })
            }), this.FB.Event.subscribe("message.send", function() {
                SL.notify("tracking a facebook share", 1), SL.onEvent({
                    type: "facebook.send",
                    target: document
                })
            })
        }
    }, SL.availableEventEmitters.push(FacebookEventEmitter), HoverEventEmitter.prototype = {
        backgroundTasks: function() {
            var e = this;
            SL.each(this.rules, function(t) {
                var n = t[1],
                    a = t[0];
                SL.cssQuery(n, function(t) {
                    SL.each(t, function(t) {
                        e.trackElement(t, a)
                    })
                })
            }, this)
        },
        trackElement: function(e, t) {
            var n = this,
                a = SL.$data(e, "hover.delays");
            a ? SL.contains(a, t) || a.push(t) : (SL.addEventHandler(e, "mouseover", function(t) {
                n.onMouseOver(t, e)
            }), SL.addEventHandler(e, "mouseout", function(t) {
                n.onMouseOut(t, e)
            }), SL.$data(e, "hover.delays", [t]))
        },
        onMouseOver: function(e, t) {
            var n = e.target || e.srcElement,
                a = e.relatedTarget || e.fromElement;
            (t === n || SL.containsElement(t, n)) && !SL.containsElement(t, a) && this.onMouseEnter(t)
        },
        onMouseEnter: function(e) {
            var t = SL.$data(e, "hover.delays"),
                n = SL.map(t, function(t) {
                    return setTimeout(function() {
                        SL.onEvent({
                            type: "hover(" + t + ")",
                            target: e
                        })
                    }, t)
                });
            SL.$data(e, "hover.delayTimers", n)
        },
        onMouseOut: function(e, t) {
            var n = e.target || e.srcElement,
                a = e.relatedTarget || e.toElement;
            (t === n || SL.containsElement(t, n)) && !SL.containsElement(t, a) && this.onMouseLeave(t)
        },
        onMouseLeave: function(e) {
            var t = SL.$data(e, "hover.delayTimers");
            t && SL.each(t, function(e) {
                clearTimeout(e)
            })
        }
    }, SL.availableEventEmitters.push(HoverEventEmitter), SL.inherit(NielsenTool, SL.BaseTool), SL.extend(NielsenTool.prototype, {
        name: "Nielsen",
        endPLPhase: function(e) {
            switch (e) {
                case "pagetop":
                    this.initialize();
                    break;
                case "pagebottom":
                    this.enableTracking && (this.queueCommand({
                        command: "sendFirstBeacon",
                        arguments: []
                    }), this.flushQueueWhenReady())
            }
        },
        defineListeners: function() {
            this.onTabFocus = SL.bind(function() {
                this.notify("Tab visible, sending view beacon when ready", 1), this.tabEverVisible = !0, this.flushQueueWhenReady()
            }, this), this.onPageLeave = SL.bind(function() {
                this.notify("isHuman? : " + this.isHuman(), 1), this.isHuman() && this.sendDurationBeacon()
            }, this), this.onHumanDetectionChange = SL.bind(function(e) {
                this == e.target.target && (this.human = e.target.isHuman)
            }, this)
        },
        initialize: function() {
            this.initializeTracking(), this.initializeDataProviders(), this.initializeNonHumanDetection(), this.tabEverVisible = SL.visibility.isVisible(), this.tabEverVisible ? this.notify("Tab visible, sending view beacon when ready", 1) : SL.bindEventOnce("tabfocus", this.onTabFocus), this.initialized = !0
        },
        initializeTracking: function() {
            this.initialized || (this.notify("Initializing tracking", 1), this.addRemovePageLeaveEvent(this.enableTracking), this.addRemoveHumanDetectionChangeEvent(this.enableTracking), this.initialized = !0)
        },
        initializeDataProviders: function() {
            var e, t = this.getAnalyticsTool();
            this.dataProvider.register(new NielsenTool.DataProvider.VisitorID(SL.getVisitorId())), t ? (e = new NielsenTool.DataProvider.Generic("rsid", function() {
                return t.settings.account
            }), this.dataProvider.register(e)) : this.notify("Missing integration with Analytics: rsid will not be sent.")
        },
        initializeNonHumanDetection: function() {
            SL.nonhumandetection ? (SL.nonhumandetection.init(), this.setEnableNonHumanDetection(0 != this.settings.enableNonHumanDetection), this.settings.nonHumanDetectionDelay > 0 && this.setNonHumanDetectionDelay(1e3 * parseInt(this.settings.nonHumanDetectionDelay))) : this.notify("NHDM is not available.")
        },
        getAnalyticsTool: function() {
            if (this.settings.integratesWith) return SL.tools[this.settings.integratesWith]
        },
        flushQueueWhenReady: function() {
            this.enableTracking && this.tabEverVisible && SL.poll(SL.bind(function() {
                if (this.isReadyToTrack()) return this.flushQueue(), !0
            }, this), 100, 20)
        },
        isReadyToTrack: function() {
            return this.tabEverVisible && this.dataProvider.isReady()
        },
        $setVars: function(e, t, n) {
            for (var a in n) {
                var i = n[a];
                "function" == typeof i && (i = i()), this.settings[a] = i
            }
            this.notify("Set variables done", 2), this.prepareContextData()
        },
        $setEnableTracking: function(e, t, n) {
            this.notify("Will" + (n ? "" : " not") + " track time on page", 1), this.enableTracking != n && (this.addRemovePageLeaveEvent(n), this.addRemoveHumanDetectionChangeEvent(n), this.enableTracking = n)
        },
        $sendFirstBeacon: function() {
            this.sendViewBeacon()
        },
        setEnableNonHumanDetection: function(e) {
            e ? SL.nonhumandetection.register(this) : SL.nonhumandetection.unregister(this)
        },
        setNonHumanDetectionDelay: function(e) {
            SL.nonhumandetection.register(this, e)
        },
        addRemovePageLeaveEvent: function(e) {
            this.notify((e ? "Attach onto" : "Detach from") + " page leave event", 1), SL[0 == e ? "unbindEvent" : "bindEvent"]("leave", this.onPageLeave)
        },
        addRemoveHumanDetectionChangeEvent: function(e) {
            this.notify((e ? "Attach onto" : "Detach from") + " human detection change event", 1), SL[0 == e ? "unbindEvent" : "bindEvent"]("humandetection.change", this.onHumanDetectionChange)
        },
        sendViewBeacon: function() {
            this.notify("Tracked page view.", 1), this.sendBeaconWith()
        },
        sendDurationBeacon: function() {
            if (SL.timetracking && "function" == typeof SL.timetracking.timeOnPage && null != SL.timetracking.timeOnPage()) {
                this.notify("Tracked close", 1), this.sendBeaconWith({
                    timeOnPage: Math.round(SL.timetracking.timeOnPage() / 1e3),
                    duration: "D",
                    timer: "timer"
                });
                var e;
                for (e = 0; e < this.magicConst; e++) "0"
            } else this.notify("Could not track close due missing time on page", 5)
        },
        sendBeaconWith: function(e) {
            this.enableTracking && this[this.beaconMethod].call(this, this.prepareUrl(e))
        },
        plainBeacon: function(e) {
            var t = new Image;
            t.src = e, t.width = 1, t.height = 1, t.alt = ""
        },
        navigatorSendBeacon: function(e) {
            navigator.sendBeacon(e)
        },
        prepareUrl: function(e) {
            var t = this.settings;
            return SL.extend(t, this.dataProvider.provide()), SL.extend(t, e), this.preparePrefix(this.settings.collectionServer) + this.adapt.convertToURI(this.adapt.toNielsen(this.substituteVariables(t)))
        },
        preparePrefix: function(e) {
            return "//" + encodeURIComponent(e) + ".imrworldwide.com/cgi-bin/gn?"
        },
        substituteVariables: function(e) {
            var t = {};
            for (var n in e) e.hasOwnProperty(n) && (t[n] = SL.replace(e[n]));
            return t
        },
        prepareContextData: function() {
            if (this.getAnalyticsTool()) {
                var e = this.settings;
                e.sdkVersion = _satellite.publishDate, this.getAnalyticsTool().$setVars(null, null, {
                    contextData: this.adapt.toAnalytics(this.substituteVariables(e))
                })
            } else this.notify("Adobe Analytics missing.")
        },
        isHuman: function() {
            return this.human
        },
        onTabFocus: function() {},
        onPageLeave: function() {},
        onHumanDetectionChange: function() {},
        notify: function(e, t) {
            SL.notify(this.logPrefix + e, t)
        },
        beaconMethod: "plainBeacon",
        adapt: null,
        enableTracking: !1,
        logPrefix: "Nielsen: ",
        tabEverVisible: !1,
        human: !0,
        magicConst: 2e6
    }), NielsenTool.DataProvider = {}, NielsenTool.DataProvider.Generic = function(e, t) {
        this.key = e, this.valueFn = t
    }, SL.extend(NielsenTool.DataProvider.Generic.prototype, {
        isReady: function() {
            return !0
        },
        getValue: function() {
            return this.valueFn()
        },
        provide: function() {
            this.isReady() || NielsenTool.prototype.notify("Not yet ready to provide value for: " + this.key, 5);
            var e = {};
            return e[this.key] = this.getValue(), e
        }
    }), NielsenTool.DataProvider.VisitorID = function(e, t, n) {
        this.key = t || "uuid", this.visitorInstance = e, this.visitorInstance && (this.visitorId = e.getMarketingCloudVisitorID([this, this._visitorIdCallback])), this.fallbackProvider = n || new NielsenTool.UUID
    }, SL.inherit(NielsenTool.DataProvider.VisitorID, NielsenTool.DataProvider.Generic), SL.extend(NielsenTool.DataProvider.VisitorID.prototype, {
        isReady: function() {
            return null === this.visitorInstance || !!this.visitorId
        },
        getValue: function() {
            return this.visitorId || this.fallbackProvider.get()
        },
        _visitorIdCallback: function(e) {
            this.visitorId = e
        }
    }), NielsenTool.DataProvider.Aggregate = function() {
        this.providers = [];
        for (var e = 0; e < arguments.length; e++) this.register(arguments[e])
    }, SL.extend(NielsenTool.DataProvider.Aggregate.prototype, {
        register: function(e) {
            this.providers.push(e)
        },
        isReady: function() {
            return SL.every(this.providers, function(e) {
                return e.isReady()
            })
        },
        provide: function() {
            var e = {};
            return SL.each(this.providers, function(t) {
                SL.extend(e, t.provide())
            }), e
        }
    }), NielsenTool.UUID = function() {}, SL.extend(NielsenTool.UUID.prototype, {
        generate: function() {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(e) {
                var t = 16 * Math.random() | 0;
                return ("x" == e ? t : 3 & t | 8).toString(16)
            })
        },
        get: function() {
            var e = SL.readCookie(this.key("uuid"));
            return e || (e = this.generate(), SL.setCookie(this.key("uuid"), e), e)
        },
        key: function(e) {
            return "_dtm_nielsen_" + e
        }
    }), NielsenTool.DataAdapters = function() {}, SL.extend(NielsenTool.DataAdapters.prototype, {
        toNielsen: function(e) {
            var t = (new Date).getTime(),
                n = {
                    c6: "vc,",
                    c13: "asid,",
                    c15: "apn,",
                    c27: "cln,",
                    c32: "segA,",
                    c33: "segB,",
                    c34: "segC,",
                    c35: "adrsid,",
                    c29: "plid,",
                    c30: "bldv,",
                    c40: "adbid,"
                },
                a = {
                    ci: e.clientId,
                    c6: e.vcid,
                    c13: e.appId,
                    c15: e.appName,
                    prv: 1,
                    forward: 0,
                    ad: 0,
                    cr: e.duration || "V",
                    rt: "text",
                    st: "dcr",
                    prd: "dcr",
                    r: t,
                    at: e.timer || "view",
                    c16: e.sdkVersion,
                    c27: e.timeOnPage || 0,
                    c40: e.uuid,
                    c35: e.rsid,
                    ti: t,
                    sup: 0,
                    c32: e.segmentA,
                    c33: e.segmentB,
                    c34: e.segmentC,
                    asn: e.assetName,
                    c29: e.playerID,
                    c30: e.buildVersion
                };
            for (key in a)
                if (a[key] !== undefined && null != a[key] && a[key] !== undefined && null != a && "" != a) {
                    var i = encodeURIComponent(a[key]);
                    n.hasOwnProperty(key) && i && (i = n[key] + i), a[key] = i
                }
            return this.filterObject(a)
        },
        toAnalytics: function(e) {
            return this.filterObject({
                "a.nielsen.clientid": e.clientId,
                "a.nielsen.vcid": e.vcid,
                "a.nielsen.appid": e.appId,
                "a.nielsen.appname": e.appName,
                "a.nielsen.accmethod": "0",
                "a.nielsen.ctype": "text",
                "a.nielsen.sega": e.segmentA,
                "a.nielsen.segb": e.segmentB,
                "a.nielsen.segc": e.segmentC,
                "a.nielsen.asset": e.assetName
            })
        },
        convertToURI: function(e) {
            if (!1 === SL.isObject(e)) return "";
            var t = [];
            for (var n in e) e.hasOwnProperty(n) && t.push(n + "=" + e[n]);
            return t.join("&")
        },
        filterObject: function(e) {
            for (var t in e) !e.hasOwnProperty(t) || null != e[t] && e[t] !== undefined || delete e[t];
            return e
        }
    }), SL.availableTools.nielsen = NielsenTool, SL.inherit(Tnt, SL.BaseTool), SL.extend(Tnt.prototype, {
        name: "tnt",
        endPLPhase: function(e) {
            "aftertoolinit" === e && this.initialize()
        },
        initialize: function() {
            SL.notify("Test & Target: Initializing", 1), this.initializeTargetPageParams(), this.load()
        },
        initializeTargetPageParams: function() {
            window.targetPageParams && this.updateTargetPageParams(this.parseTargetPageParamsResult(window.targetPageParams())), this.updateTargetPageParams(this.settings.pageParams), this.setTargetPageParamsFunction()
        },
        load: function() {
            var e = this.getMboxURL(this.settings.mboxURL);
            !1 !== this.settings.initTool ? this.settings.loadSync ? (SL.loadScriptSync(e), this.onScriptLoaded()) : (SL.loadScript(e, SL.bind(this.onScriptLoaded, this)), this.initializing = !0) : this.initialized = !0
        },
        getMboxURL: function(e) {
            var t = e;
            return SL.isObject(e) && (t = "https:" === window.location.protocol ? e.https : e.http), t.match(/^https?:/) ? t : SL.basePath() + t
        },
        onScriptLoaded: function() {
            SL.notify("Test & Target: loaded.", 1), this.flushQueue(), this.initialized = !0, this.initializing = !1
        },
        $addMbox: function(e, t, n) {
            var a = n.mboxGoesAround,
                i = a + "{visibility: hidden;}",
                r = this.appendStyle(i);
            a in this.styleElements || (this.styleElements[a] = r), this.initialized ? this.$addMBoxStep2(null, null, n) : this.initializing && this.queueCommand({
                command: "addMBoxStep2",
                arguments: [n]
            }, e, t)
        },
        $addMBoxStep2: function(e, t, n) {
            var a = this.generateID(),
                i = this;
            SL.addEventHandler(window, "load", SL.bind(function() {
                SL.cssQuery(n.mboxGoesAround, function(e) {
                    var t = e[0];
                    if (t) {
                        var r = document.createElement("div");
                        r.id = a, t.parentNode.replaceChild(r, t), r.appendChild(t), window.mboxDefine(a, n.mboxName);
                        var o = [n.mboxName];
                        n.arguments && (o = o.concat(n.arguments)), window.mboxUpdate.apply(null, o), i.reappearWhenCallComesBack(t, a, n.timeout, n)
                    }
                })
            }, this)), this.lastMboxID = a
        },
        $addTargetPageParams: function(e, t, n) {
            this.updateTargetPageParams(n)
        },
        generateID: function() {
            return "_sdsat_mbox_" + String(Math.random()).substring(2) + "_"
        },
        appendStyle: function(e) {
            var t = document.getElementsByTagName("head")[0],
                n = document.createElement("style");
            return n.type = "text/css", n.styleSheet ? n.styleSheet.cssText = e : n.appendChild(document.createTextNode(e)), t.appendChild(n), n
        },
        reappearWhenCallComesBack: function(e, t, n, a) {
            function i() {
                var e = r.styleElements[a.mboxGoesAround];
                e && (e.parentNode.removeChild(e), delete r.styleElements[a.mboxGoesAround])
            }
            var r = this;
            SL.cssQuery('script[src*="omtrdc.net"]', function(e) {
                var t = e[0];
                if (t) {
                    SL.scriptOnLoad(t.src, t, function() {
                        SL.notify("Test & Target: request complete", 1), i(), clearTimeout(a)
                    });
                    var a = setTimeout(function() {
                        SL.notify("Test & Target: bailing after " + n + "ms", 1), i()
                    }, n)
                } else SL.notify("Test & Target: failed to find T&T ajax call, bailing", 1), i()
            })
        },
        updateTargetPageParams: function(e) {
            var t = {};
            for (var n in e) e.hasOwnProperty(n) && (t[SL.replace(n)] = SL.replace(e[n]));
            SL.extend(this.targetPageParamsStore, t)
        },
        getTargetPageParams: function() {
            return this.targetPageParamsStore
        },
        setTargetPageParamsFunction: function() {
            window.targetPageParams = SL.bind(this.getTargetPageParams, this)
        },
        parseTargetPageParamsResult: function(e) {
            var t = e;
            return SL.isArray(e) && (e = e.join("&")), SL.isString(e) && (t = SL.parseQueryParams(e)), t
        }
    }), SL.availableTools.tnt = Tnt, SL.inherit(DefaultTool, SL.BaseTool), SL.extend(DefaultTool.prototype, {
        name: "Default",
        $loadIframe: function(e, t, n) {
            var a = n.pages,
                i = n.loadOn,
                r = SL.bind(function() {
                    SL.each(a, function(n) {
                        this.loadIframe(e, t, n)
                    }, this)
                }, this);
            i || r(), "domready" === i && SL.domReady(r), "load" === i && SL.addEventHandler(window, "load", r)
        },
        loadIframe: function(e, t, n) {
            var a = document.createElement("iframe");
            a.style.display = "none";
            var i = SL.data.host,
                r = n.data,
                o = this.scriptURL(n.src),
                s = SL.searchVariables(r, e, t);
            i && (o = SL.basePath() + o), o += s, a.src = o;
            var c = document.getElementsByTagName("body")[0];
            c ? c.appendChild(a) : SL.domReady(function() {
                document.getElementsByTagName("body")[0].appendChild(a)
            })
        },
        scriptURL: function(e) {
            return (SL.settings.scriptDir || "") + e
        },
        $loadScript: function(e, t, n) {
            var a = n.scripts,
                i = n.sequential,
                r = n.loadOn,
                o = SL.bind(function() {
                    i ? this.loadScripts(e, t, a) : SL.each(a, function(n) {
                        this.loadScripts(e, t, [n])
                    }, this)
                }, this);
            r ? "domready" === r ? SL.domReady(o) : "load" === r && SL.addEventHandler(window, "load", o) : o()
        },
        loadScripts: function(e, t, n) {
            function a() {
                r.length > 0 && i && r.shift().call(e, t, o);
                var c = n.shift();
                if (c) {
                    var l = SL.data.host,
                        d = s.scriptURL(c.src);
                    l && (d = SL.basePath() + d), i = c, SL.loadScript(d, a)
                }
            }
            try {
                n = n.slice(0);
                var i, r = this.asyncScriptCallbackQueue,
                    o = t.target || t.srcElement,
                    s = this
            } catch (c) {
                console.error("scripts is", SL.stringify(n))
            }
            a()
        },
        $loadBlockingScript: function(e, t, n) {
            var a = n.scripts;
            n.loadOn;
            SL.bind(function() {
                SL.each(a, function(n) {
                    this.loadBlockingScript(e, t, n)
                }, this)
            }, this)()
        },
        loadBlockingScript: function(e, t, n) {
            var a = this.scriptURL(n.src),
                i = SL.data.host,
                r = t.target || t.srcElement;
            i && (a = SL.basePath() + a), this.argsForBlockingScripts.push([e, t, r]), SL.loadScriptSync(a)
        },
        pushAsyncScript: function(e) {
            this.asyncScriptCallbackQueue.push(e)
        },
        pushBlockingScript: function(e) {
            var t = this.argsForBlockingScripts.shift(),
                n = t[0];
            e.apply(n, t.slice(1))
        },
        $writeHTML: SL.escapeHtmlParams(function(e, t) {
            if (!SL.domReadyFired && document.write)
                if ("pagebottom" === t.type || "pagetop" === t.type)
                    for (var n = 2, a = arguments.length; n < a; n++) {
                        var i = arguments[n].html;
                        i = SL.replace(i, e, t), document.write(i)
                    } else SL.notify("You can only use writeHTML on the `pagetop` and `pagebottom` events.", 1);
                else SL.notify("Command writeHTML failed. You should try appending HTML using the async option.", 1)
        }),
        linkNeedsDelayActivate: function(e, t) {
            t = t || window;
            var n = e.tagName,
                a = e.getAttribute("target"),
                i = e.getAttribute("href");
            return (!n || "a" === n.toLowerCase()) && (!!i && (!a || "_blank" !== a && ("_top" === a ? t.top === t : "_parent" !== a && ("_self" === a || (!t.name || a === t.name)))))
        },
        $delayActivateLink: function(e, t) {
            if (this.linkNeedsDelayActivate(e)) {
                SL.preventDefault(t);
                var n = SL.settings.linkDelay || 100;
                setTimeout(function() {
                    SL.setLocation(e.href)
                }, n)
            }
        },
        isQueueable: function(e) {
            return "writeHTML" !== e.command
        }
    }), SL.availableTools["default"] = DefaultTool, SL.inherit(SiteCatalystTool, SL.BaseTool), SL.extend(SiteCatalystTool.prototype, {
        name: "SC",
        endPLPhase: function(e) {
            e === this.settings.loadOn && this.initialize(e)
        },
        initialize: function(e) {
            if (!this._cancelToolInit)
                if (this.settings.initVars = this.substituteVariables(this.settings.initVars, {
                        type: e
                    }), !1 !== this.settings.initTool) {
                    var t = this.settings.sCodeURL || SL.basePath() + "s_code.js";
                    "object" == typeof t && (t = "https:" === window.location.protocol ? t.https : t.http), t.match(/^https?:/) || (t = SL.basePath() + t), this.settings.initVars && this.$setVars(null, null, this.settings.initVars), SL.loadScript(t, SL.bind(this.onSCodeLoaded, this)), this.initializing = !0
                } else this.initializing = !0, this.pollForSC()
        },
        getS: function(e, t) {
            var n = t && t.hostname || window.location.hostname,
                a = this.concatWithToolVarBindings(t && t.setVars || this.varBindings),
                i = t && t.addEvent || this.events,
                r = this.getAccount(n),
                o = window.s_gi;
            if (!o) return null;
            if (this.isValidSCInstance(e) || (e = null), !r && !e) return SL.notify("Adobe Analytics: tracker not initialized because account was not found", 1), null;
            e = e || o(r);
            var s = "D" + SL.appVersion;
            return "undefined" != typeof e.tagContainerMarker ? e.tagContainerMarker = s : "string" == typeof e.version && e.version.substring(e.version.length - 5) !== "-" + s && (e.version += "-" + s), e.sa && !0 !== this.settings.skipSetAccount && !1 !== this.settings.initTool && e.sa(this.settings.account), this.applyVarBindingsOnTracker(e, a), i.length > 0 && (e.events = i.join(",")), SL.getVisitorId() && (e.visitor = SL.getVisitorId()), e
        },
        onSCodeLoaded: function(e) {
            this.initialized = !0, this.initializing = !1;
            var t = ["Adobe Analytics: loaded", e ? " (manual)" : "", "."];
            SL.notify(t.join(""), 1), SL.fireEvent(this.id + ".load", this.getS()), e || (this.flushQueueExceptTrackLink(), this.sendBeacon()), this.flushQueue()
        },
        getAccount: function(e) {
            return window.s_account ? window.s_account : e && this.settings.accountByHost && this.settings.accountByHost[e] || this.settings.account
        },
        getTrackingServer: function() {
            var e = this,
                t = e.getS();
            if (t) {
                if (t.ssl && t.trackingServerSecure) return t.trackingServerSecure;
                if (t.trackingServer) return t.trackingServer
            }
            var n, a = e.getAccount(window.location.hostname);
            if (!a) return null;
            var i, r, o = "",
                s = t && t.dc;
            return (i = (n = a).indexOf(",")) >= 0 && (n = n.gb(0, i)), n = n.replace(/[^A-Za-z0-9]/g, ""), o || (o = "2o7.net"), s = s ? ("" + s).toLowerCase() : "d1", "2o7.net" == o && ("d1" == s ? s = "112" : "d2" == s && (s = "122"), r = ""), i = n + "." + s + "." + r + o
        },
        sendBeacon: function() {
            var e = this.getS(window[this.settings.renameS || "s"]);
            e ? this.settings.customInit && !1 === this.settings.customInit(e) ? SL.notify("Adobe Analytics: custom init suppressed beacon", 1) : (this.settings.executeCustomPageCodeFirst && this.applyVarBindingsOnTracker(e, this.varBindings), this.executeCustomSetupFuns(e), e.t(), this.clearVarBindings(), this.clearCustomSetup(), SL.notify("Adobe Analytics: tracked page view", 1)) : SL.notify("Adobe Analytics: page code not loaded", 1)
        },
        pollForSC: function() {
            SL.poll(SL.bind(function() {
                if ("function" == typeof window.s_gi) return this.onSCodeLoaded(!0), !0
            }, this))
        },
        flushQueueExceptTrackLink: function() {
            if (this.pending) {
                for (var e = [], t = 0; t < this.pending.length; t++) {
                    var n = this.pending[t];
                    "trackLink" === n[0].command ? e.push(n) : this.triggerCommand.apply(this, n)
                }
                this.pending = e
            }
        },
        isQueueAvailable: function() {
            return !this.initialized
        },
        substituteVariables: function(e, t) {
            var n = {};
            for (var a in e)
                if (e.hasOwnProperty(a)) {
                    var i = e[a];
                    n[a] = SL.replace(i, location, t)
                }
            return n
        },
        $setVars: function(e, t, n) {
            for (var a in n)
                if (n.hasOwnProperty(a)) {
                    var i = n[a];
                    "function" == typeof i && (i = i()), this.varBindings[a] = i
                }
            SL.notify("Adobe Analytics: set variables.", 2)
        },
        $customSetup: function(e, t, n) {
            this.customSetupFuns.push(function(a) {
                n.call(e, t, a)
            })
        },
        isValidSCInstance: function(e) {
            return !!e && "function" == typeof e.t && "function" == typeof e.tl
        },
        concatWithToolVarBindings: function(e) {
            var t = this.settings.initVars || {};
            return SL.map(["trackingServer", "trackingServerSecure"], function(n) {
                t[n] && !e[n] && (e[n] = t[n])
            }), e
        },
        applyVarBindingsOnTracker: function(e, t) {
            for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
        },
        clearVarBindings: function() {
            this.varBindings = {}
        },
        clearCustomSetup: function() {
            this.customSetupFuns = []
        },
        executeCustomSetupFuns: function(e) {
            SL.each(this.customSetupFuns, function(t) {
                t.call(window, e)
            })
        },
        $trackLink: function(e, t, n) {
            var a = (n = n || {}).type,
                i = n.linkName;
            !i && e && e.nodeName && "a" === e.nodeName.toLowerCase() && (i = e.innerHTML), i || (i = "link clicked");
            var r = n && n.setVars,
                o = n && n.addEvent || [],
                s = this.getS(null, {
                    setVars: r,
                    addEvent: o
                });
            if (s) {
                var c = s.linkTrackVars,
                    l = s.linkTrackEvents,
                    d = this.definedVarNames(r);
                n && n.customSetup && n.customSetup.call(e, t, s), o.length > 0 && d.push("events"), s.products && d.push("products"), d = this.mergeTrackLinkVars(s.linkTrackVars, d), o = this.mergeTrackLinkVars(s.linkTrackEvents, o), s.linkTrackVars = this.getCustomLinkVarsList(d);
                var u = SL.map(o, function(e) {
                    return e.split(":")[0]
                });
                s.linkTrackEvents = this.getCustomLinkVarsList(u), s.tl(!0, a || "o", i), SL.notify(["Adobe Analytics: tracked link ", "using: linkTrackVars=", SL.stringify(s.linkTrackVars), "; linkTrackEvents=", SL.stringify(s.linkTrackEvents)].join(""), 1), s.linkTrackVars = c, s.linkTrackEvents = l
            } else SL.notify("Adobe Analytics: page code not loaded", 1)
        },
        mergeTrackLinkVars: function(e, t) {
            return e && (t = e.split(",").concat(t)), t
        },
        getCustomLinkVarsList: function(e) {
            var t = SL.indexOf(e, "None");
            return t > -1 && e.length > 1 && e.splice(t, 1), e.join(",")
        },
        definedVarNames: function(e) {
            e = e || this.varBindings;
            var t = [];
            for (var n in e) e.hasOwnProperty(n) && /^(eVar[0-9]+)|(prop[0-9]+)|(hier[0-9]+)|campaign|purchaseID|channel|server|state|zip|pageType$/.test(n) && t.push(n);
            return t
        },
        $trackPageView: function(e, t, n) {
            var a = n && n.setVars,
                i = n && n.addEvent || [],
                r = this.getS(null, {
                    setVars: a,
                    addEvent: i
                });
            r ? (r.linkTrackVars = "", r.linkTrackEvents = "", this.executeCustomSetupFuns(r), n && n.customSetup && n.customSetup.call(e, t, r), r.t(), this.clearVarBindings(), this.clearCustomSetup(), SL.notify("Adobe Analytics: tracked page view", 1)) : SL.notify("Adobe Analytics: page code not loaded", 1)
        },
        $postTransaction: function(e, t, n) {
            var a = SL.data.transaction = window[n],
                i = this.varBindings,
                r = this.settings.fieldVarMapping;
            if (SL.each(a.items, function(e) {
                    this.products.push(e)
                }, this), i.products = SL.map(this.products, function(e) {
                    var t = [];
                    if (r && r.item)
                        for (var n in r.item)
                            if (r.item.hasOwnProperty(n)) {
                                var a = r.item[n];
                                t.push(a + "=" + e[n]), "event" === a.substring(0, 5) && this.events.push(a)
                            }
                    var i = ["", e.product, e.quantity, e.unitPrice * e.quantity];
                    return t.length > 0 && i.push(t.join("|")), i.join(";")
                }, this).join(","), r && r.transaction) {
                var o = [];
                for (var s in r.transaction)
                    if (r.transaction.hasOwnProperty(s)) {
                        n = r.transaction[s];
                        o.push(n + "=" + a[s]),
                            "event" === n.substring(0, 5) && this.events.push(n)
                    }
                i.products.length > 0 && (i.products += ","), i.products += ";;;;" + o.join("|")
            }
        },
        $addEvent: function() {
            for (var e = 2, t = arguments.length; e < t; e++) this.events.push(arguments[e])
        },
        $addProduct: function() {
            for (var e = 2, t = arguments.length; e < t; e++) this.products.push(arguments[e])
        }
    }), SL.availableTools.sc = SiteCatalystTool, SL.inherit(BasicTool, SL.BaseTool), SL.extend(BasicTool.prototype, {
        initialize: function() {
            var e = this.settings;
            if (!1 !== this.settings.initTool) {
                var t = e.url;
                t = "string" == typeof t ? SL.basePath() + t : SL.isHttps() ? t.https : t.http, SL.loadScript(t, SL.bind(this.onLoad, this)), this.initializing = !0
            } else this.initialized = !0
        },
        isQueueAvailable: function() {
            return !this.initialized
        },
        onLoad: function() {
            this.initialized = !0, this.initializing = !1, this.settings.initialBeacon && this.settings.initialBeacon(), this.flushQueue()
        },
        endPLPhase: function(e) {
            e === this.settings.loadOn && (SL.notify(this.name + ": Initializing at " + e, 1), this.initialize())
        },
        $fire: function(e, t, n) {
            this.initializing ? this.queueCommand({
                command: "fire",
                arguments: [n]
            }, e, t) : n.call(this.settings, e, t)
        }
    }), SL.availableTools.am = BasicTool, SL.availableTools.adlens = BasicTool, SL.availableTools.aem = BasicTool, SL.availableTools.__basic = BasicTool, SL.inherit(GATool, SL.BaseTool), SL.extend(GATool.prototype, {
        name: "GA",
        initialize: function() {
            var e = this.settings,
                t = window._gaq,
                n = e.initCommands || [],
                a = e.customInit;
            if (t || (_gaq = []), this.isSuppressed()) SL.notify("GA: page code not loaded(suppressed).", 1);
            else {
                if (!t && !GATool.scriptLoaded) {
                    var i = SL.isHttps(),
                        r = (i ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";
                    e.url && (r = i ? e.url.https : e.url.http), SL.loadScript(r), GATool.scriptLoaded = !0, SL.notify("GA: page code loaded.", 1)
                }
                e.domain;
                var o = e.trackerName,
                    s = GAUtils.allowLinker(),
                    c = SL.replace(e.account, location);
                SL.settings.domainList;
                _gaq.push([this.cmd("setAccount"), c]), s && _gaq.push([this.cmd("setAllowLinker"), s]), _gaq.push([this.cmd("setDomainName"), GAUtils.cookieDomain()]), SL.each(n, function(e) {
                    var t = [this.cmd(e[0])].concat(SL.preprocessArguments(e.slice(1), location, null, this.forceLowerCase));
                    _gaq.push(t)
                }, this), a && (this.suppressInitialPageView = !1 === a(_gaq, o)), e.pageName && this.$overrideInitialPageView(null, null, e.pageName)
            }
            this.initialized = !0, SL.fireEvent(this.id + ".configure", _gaq, o)
        },
        isSuppressed: function() {
            return this._cancelToolInit || !1 === this.settings.initTool
        },
        tracker: function() {
            return this.settings.trackerName
        },
        cmd: function(e) {
            var t = this.tracker();
            return t ? t + "._" + e : "_" + e
        },
        $overrideInitialPageView: function(e, t, n) {
            this.urlOverride = n
        },
        trackInitialPageView: function() {
            if (!this.isSuppressed() && !this.suppressInitialPageView)
                if (this.urlOverride) {
                    var e = SL.preprocessArguments([this.urlOverride], location, null, this.forceLowerCase);
                    this.$missing$("trackPageview", null, null, e)
                } else this.$missing$("trackPageview")
        },
        endPLPhase: function(e) {
            e === this.settings.loadOn && (SL.notify("GA: Initializing at " + e, 1), this.initialize(), this.flushQueue(), this.trackInitialPageView())
        },
        call: function(e, t, n, a) {
            if (!this._cancelToolInit) {
                this.settings;
                var i = this.tracker(),
                    r = this.cmd(e);
                a = a ? [r].concat(a) : [r];
                _gaq.push(a), i ? SL.notify("GA: sent command " + e + " to tracker " + i + (a.length > 1 ? " with parameters [" + a.slice(1).join(", ") + "]" : "") + ".", 1) : SL.notify("GA: sent command " + e + (a.length > 1 ? " with parameters [" + a.slice(1).join(", ") + "]" : "") + ".", 1)
            }
        },
        $missing$: function(e, t, n, a) {
            this.call(e, t, n, a)
        },
        $postTransaction: function(e, t, n) {
            var a = SL.data.customVars.transaction = window[n];
            this.call("addTrans", e, t, [a.orderID, a.affiliation, a.total, a.tax, a.shipping, a.city, a.state, a.country]), SL.each(a.items, function(n) {
                this.call("addItem", e, t, [n.orderID, n.sku, n.product, n.category, n.unitPrice, n.quantity])
            }, this), this.call("trackTrans", e, t)
        },
        delayLink: function(e, t) {
            var n = this;
            if (GAUtils.allowLinker() && e.hostname.match(this.settings.linkerDomains) && !SL.isSubdomainOf(e.hostname, location.hostname)) {
                SL.preventDefault(t);
                var a = SL.settings.linkDelay || 100;
                setTimeout(function() {
                    n.call("link", e, t, [e.href])
                }, a)
            }
        },
        popupLink: function(e, t) {
            if (window._gat) {
                SL.preventDefault(t);
                var n = this.settings.account,
                    a = window._gat._createTracker(n)._getLinkerUrl(e.href);
                window.open(a)
            }
        },
        $link: function(e, t) {
            "_blank" === e.getAttribute("target") ? this.popupLink(e, t) : this.delayLink(e, t)
        },
        $trackEvent: function(e, t) {
            var n = Array.prototype.slice.call(arguments, 2);
            if (n.length >= 4 && null != n[3]) {
                var a = parseInt(n[3], 10);
                SL.isNaN(a) && (a = 1), n[3] = a
            }
            this.call("trackEvent", e, t, n)
        }
    }), SL.availableTools.ga = GATool;
    var GAUtils = {
        allowLinker: function() {
            return SL.hasMultipleDomains()
        },
        cookieDomain: function() {
            var e = SL.settings.domainList,
                t = SL.find(e, function(e) {
                    var t = window.location.hostname;
                    return SL.equalsIgnoreCase(t.slice(t.length - e.length), e)
                });
            return t ? "." + t : "auto"
        }
    };
    SL.inherit(GAUniversalTool, SL.BaseTool), SL.extend(GAUniversalTool.prototype, {
        name: "GAUniversal",
        endPLPhase: function(e) {
            e === this.settings.loadOn && (SL.notify("GAU: Initializing at " + e, 1), this.initialize(), this.flushQueue(), this.trackInitialPageView())
        },
        getTrackerName: function() {
            return this.settings.trackerSettings.name || ""
        },
        isPageCodeLoadSuppressed: function() {
            return !1 === this.settings.initTool || !0 === this._cancelToolInit
        },
        initialize: function() {
            if (this.isPageCodeLoadSuppressed()) return this.initialized = !0, void SL.notify("GAU: Page code not loaded (suppressed).", 1);
            var e = "ga";
            window[e] = window[e] || this.createGAObject(), window.GoogleAnalyticsObject = e, SL.notify("GAU: Page code loaded.", 1), SL.loadScriptOnce(this.getToolUrl());
            var t = this.settings;
            (GAUtils.allowLinker() && !1 !== t.allowLinker ? this.createAccountForLinker() : this.createAccount(), this.executeInitCommands(), t.customInit) && (!1 === (0, t.customInit)(window[e], this.getTrackerName()) && (this.suppressInitialPageView = !0));
            this.initialized = !0
        },
        createGAObject: function() {
            var e = function() {
                e.q.push(arguments)
            };
            return e.q = [], e.l = 1 * new Date, e
        },
        createAccount: function() {
            this.create()
        },
        createAccountForLinker: function() {
            var e = {};
            GAUtils.allowLinker() && (e.allowLinker = !0), this.create(e), this.call("require", "linker"), this.call("linker:autoLink", this.autoLinkDomains(), !1, !0)
        },
        create: function(e) {
            var t = this.settings.trackerSettings;
            (t = SL.preprocessArguments([t], location, null, this.forceLowerCase)[0]).trackingId = SL.replace(this.settings.trackerSettings.trackingId, location), t.cookieDomain || (t.cookieDomain = GAUtils.cookieDomain()), SL.extend(t, e || {}), this.call("create", t)
        },
        autoLinkDomains: function() {
            var e = location.hostname;
            return SL.filter(SL.settings.domainList, function(t) {
                return t !== e
            })
        },
        executeInitCommands: function() {
            var e = this.settings;
            e.initCommands && SL.each(e.initCommands, function(e) {
                var t = e.splice(2, e.length - 2);
                e = e.concat(SL.preprocessArguments(t, location, null, this.forceLowerCase)), this.call.apply(this, e)
            }, this)
        },
        trackInitialPageView: function() {
            this.suppressInitialPageView || this.isPageCodeLoadSuppressed() || this.call("send", "pageview")
        },
        call: function() {
            "function" == typeof ga ? this.isCallSuppressed() || (arguments[0] = this.cmd(arguments[0]), this.log(SL.toArray(arguments)), ga.apply(window, arguments)) : SL.notify("GA Universal function not found!", 4)
        },
        isCallSuppressed: function() {
            return !0 === this._cancelToolInit
        },
        $missing$: function(e, t, n, a) {
            a = a || [], a = [e].concat(a), this.call.apply(this, a)
        },
        getToolUrl: function() {
            var e = this.settings,
                t = SL.isHttps();
            return e.url ? t ? e.url.https : e.url.http : (t ? "https://ssl" : "http://www") + ".google-analytics.com/analytics.js"
        },
        cmd: function(e) {
            var t = ["send", "set", "get"],
                n = this.getTrackerName();
            return n && -1 !== SL.indexOf(t, e) ? n + "." + e : e
        },
        log: function(e) {
            var t = "GA Universal: sent command " + e[0] + " to tracker " + (this.getTrackerName() || "default");
            if (e.length > 1) {
                SL.stringify(e.slice(1));
                t += " with parameters " + SL.stringify(e.slice(1))
            }
            t += ".", SL.notify(t, 1)
        }
    }), SL.availableTools.ga_universal = GAUniversalTool, SL.extend(VisitorIdTool.prototype, {
        getInstance: function() {
            return this.instance
        },
        initialize: function() {
            var e, t = this.settings;
            SL.notify("Visitor ID: Initializing tool", 1), null !== (e = this.createInstance(t.mcOrgId, t.initVars)) && (t.customerIDs && this.applyCustomerIDs(e, t.customerIDs), t.autoRequest && e.getMarketingCloudVisitorID(), this.instance = e)
        },
        createInstance: function(e, t) {
            if (!SL.isString(e)) return SL.notify('Visitor ID: Cannot create instance using mcOrgId: "' + e + '"', 4), null;
            e = SL.replace(e), SL.notify('Visitor ID: Create instance using mcOrgId: "' + e + '"', 1), t = this.parseValues(t);
            var n = Visitor.getInstance(e, t);
            return SL.notify("Visitor ID: Set variables: " + SL.stringify(t), 1), n
        },
        applyCustomerIDs: function(e, t) {
            var n = this.parseIds(t);
            e.setCustomerIDs(n), SL.notify("Visitor ID: Set Customer IDs: " + SL.stringify(n), 1)
        },
        parseValues: function(e) {
            if (!1 === SL.isObject(e)) return {};
            var t = {};
            for (var n in e) e.hasOwnProperty(n) && (t[n] = SL.replace(e[n]));
            return t
        },
        parseIds: function(e) {
            var t = {};
            if (!1 === SL.isObject(e)) return {};
            for (var n in e)
                if (e.hasOwnProperty(n)) {
                    var a = SL.replace(e[n].id);
                    a !== e[n].id && a && (t[n] = {}, t[n].id = a, t[n].authState = Visitor.AuthState[e[n].authState])
                }
            return t
        }
    }), SL.availableTools.visitor_id = VisitorIdTool, _satellite.init({
        tools: {
            bd533b533cf3b3a1aa7acc28b81b326a: {
                engine: "ga_universal",
                pageName: "%URI%",
                forceLowerCase: !0,
                euCookie: !0,
                loadOn: "pagetop",
                initCommands: [],
                trackerSettings: {
                    trackingId: "UA-16885468-4"
                }
            },
            f162a116a99b083bbc58656a88752924: {
                engine: "ga_universal",
                pageName: "%URI%",
                forceLowerCase: !0,
                euCookie: !1,
                loadOn: "pagetop",
                initCommands: [],
                customInit: function(e) {
                    e("require", "GTM-M5PNFKD");
                    var t = function() {
                            for (var e = null, t = window.location.search.substr(1).split("&"), n = 0; n < t.length; n++) {
                                var a = t[n].split("=");
                                "dclid" != a[0].toLowerCase() && "gclid" != a[0].toLowerCase() || (e = a[1])
                            }
                            return e
                        }(),
                        n = function() {
                            for (var e = null, t = window.location.search.substr(1).split("&"), n = 0; n < t.length; n++) {
                                var a = t[n].split("=");
                                if ("cmpid" == a[0].toLowerCase()) {
                                    var i = a[1].split("~");
                                    e = new Array(i[1], i[0])
                                }
                            }
                            return e
                        }();
                    return null == t ? (console.log("clid not present"), null != n ? (console.log("cmpid present, setting source to " + n[0] + " and medium to " + n[1]), e("set", "campaignSource", n[0]), e("set", "campaignMedium", n[1])) : console.log("no cmpid present, deferring to GA to determine sourcemedium")) : console.log("clid present, deferring to autotagging"), e("set", "dimension4", _satellite.getVar("Local Storage - DMP Segments")), !1
                },
                trackerSettings: {
                    trackingId: "UA-16885468-27",
                    siteSpeedSampleRate: "1",
                    allowAnchor: !1
                }
            },
            "7583601894f25f325ca11dbf8c0bac0f": {
                engine: "sc",
                loadOn: "pagetop",
                account: "dixonsrtcurrysprod,dixonsrtpcwprod",
                euCookie: !1,
                sCodeURL: {
                    http: "http://currys.cdn.dixons.com/js/tags/s_code.js",
                    https: "https://currys-ssl.cdn.dixons.com/js/tags/s_code.js"
                },
                renameS: "s",
                initVars: {
                    charSet: "UTF-8",
                    currencyCode: "GBP",
                    visitorID: "s_vi",
                    trackingServer: "dixonsretail.d3.sc.omtrdc.net/",
                    trackingServerSecure: "dixonsretail.d3.sc.omtrdc.net/",
                    trackInlineStats: !0,
                    trackDownloadLinks: !0,
                    linkDownloadFileTypes: "avi,css,csv,doc,docx,eps,exe,jpg,js,m4v,mov,mp3,pdf,png,ppt,pptx,rar,svg,tab,txt,vsd,vxd,wav,wma,wmv,xls,xlsx,xml,zip",
                    trackExternalLinks: !0,
                    linkInternalFilters: "#,currys.co.uk,javascript:,mailto:,tel:,test01.dixons.com,test02.dixons.com,test03.dixons.com,test04.dixons.com,test05.dixons.com,test06.dixons.com,test07.dixons.com,test08.dixons.com,test09.dixons.com,test10.dixons.com",
                    linkLeaveQueryString: !1,
                    dynamicVariablePrefix: "D="
                },
                initTool: !1,
                customInit: function(e) {
                    var t = _satellite.getVar("Internal - Link Tracking - b parameter");
                    t.length > 1 ? e.eVar2 = t : e.eVar2 = "", e.list3 = _satellite.getVar("Local Storage - DMP Segments")
                }
            },
            "24da1bc38e3f84688d59b90bd5a7c4b83198e55f": {
                engine: "tnt",
                mboxURL: "5e3c12259ba754dbb3132d54e5421a9f0f40dbce/mbox-contents-24da1bc38e3f84688d59b90bd5a7c4b83198e55f.js",
                loadSync: !0,
                pageParams: {
                    DMPSegments: "%Local Storage - DMP Segments%"
                }
            }
        },
        pageLoadRules: [{
            name: "150505: orderConfirmPage Reservations mBox AW",
            trigger: [{
                engine: "tnt",
                command: "addMbox",
                arguments: [{
                    mboxGoesAround: "div#targetDiv",
                    mboxName: "orderConfirmPage",
                    arguments: ["orderTotal=%150505: Total Order Value AW%", "orderId=%150505: Order ID AW%", "product_ordered_ID=%150514: ProductID ordered%", "paymentType=%Universal Variable - Order - Payment Type%"],
                    timeout: "1500"
                }]
            }, {
                command: "writeHTML",
                arguments: [{
                    html: '<script>\n  (function(){\n    var a = window.universal_variable;\n    var b = a.transaction;\n    var c = b.line_items;\n    var d = {\n      quant: [],\n      subtotal: [],\n      id: [],\n      name: [],\n      manu: [],\n      cat: [],\n      subcat: [],\n      uni: [],\n      seg: [],\n      sku: [],\n      price: []\n    };\n    for(var i = 0; i < c.length; i++){\n      var e = c[i];\n      d.quant.push(e.quantity);\n      d.subtotal.push(e.product.unit_sale_price);\n      d.id.push(e.product.id);\n      d.name.push(e.product.name);\n      d.manu.push(e.product.manufacturer);\n      d.cat.push(e.product.category);\n      d.subcat.push(e.product.subcategory);\n      d.uni.push(e.product.universe);\n      d.seg.push(e.product.segment);\n      d.sku.push(e.product.sku_code);\n      d.price.push(e.product.unit_sale_price);\n    }\n    \n    d.quant.join(",");\n    d.subtotal.join(",");\n    d.id.join(",");\n    d.name.join(",");\n    d.manu.join(",");\n    d.cat.join(",");\n    d.subcat.join(",");\n    d.uni.join(",");\n    d.seg.join(",");\n    d.sku.join(",");\n    d.price.join(",");\n    \n    \n    var axel = Math.random() + "";\n  var a = axel * 10000000000000;\n  var iFrame = document.createElement(\'iframe\');\n  iFrame.src = "https://4672209.fls.doubleclick.net/activityi;src=4672209;type=order000;cat=%Fld_Domain%;qty="+d.quant+";cost="+d.subtotal+";u1="+a.page.category+";u2="+d.id+";u3="+d.name+";u4="+d.manu+";u5="+d.cat+";u6="+d.subcat+";u7="+d.uni+";u8="+d.seg+";u9="+d.sku+";u10="+d.price+";u11=%150826: Transaction Subtotal - EB%;u12=%150826: Transaction Subtotal - EB%;ord=%150505: Order ID AW%?";\n  iFrame.width = "1";\n  iFrame.height = "1";\n  iFrame.frameborder = "0";\n  iFrame.style.display = "none";\n  document.body.appendChild(iFrame);\n  })();\n  \n  \n  \n</script>\n'
                }]
            }],
            scope: {
                URI: {
                    include: ["/order-reservation.html"]
                }
            },
            conditions: [function() {
                return document.body.innerHTML += "<div id='targetDiv'></div>", !0
            }],
            event: "pagebottom"
        }, {
            name: "150505: orderConfirmPage mBox - Guest Order Confirmation AW",
            trigger: [{
                engine: "tnt",
                command: "addMbox",
                arguments: [{
                    mboxGoesAround: "div#targetDiv",
                    mboxName: "orderConfirmPage",
                    arguments: ["orderTotal=%150505: Total Order Value AW%", "orderId=%150505: Order ID AW%", "product_ordered_ID=%150514: ProductID ordered%", "paymentType=%Universal Variable - Order - Payment Type%", "servicesAndCarePlans=%MO - Basket - Services from s.products%"],
                    timeout: "1500"
                }]
            }, {
                command: "writeHTML",
                arguments: [{
                    html: '<script>\n  (function(){\n    var a = window.universal_variable;\n    var b = a.transaction;\n    var c = b.line_items;\n    var d = {\n      quant: [],\n      subtotal: [],\n      id: [],\n      name: [],\n      manu: [],\n      cat: [],\n      subcat: [],\n      uni: [],\n      seg: [],\n      sku: [],\n      price: []\n    };\n    for(var i = 0; i < c.length; i++){\n      var e = c[i];\n      d.quant.push(e.quantity);\n      d.subtotal.push(e.product.unit_sale_price);\n      d.id.push(e.product.id);\n      d.name.push(e.product.name);\n      d.manu.push(e.product.manufacturer);\n      d.cat.push(e.product.category);\n      d.subcat.push(e.product.subcategory);\n      d.uni.push(e.product.universe);\n      d.seg.push(e.product.segment);\n      d.sku.push(e.product.sku_code);\n      d.price.push(e.product.unit_sale_price);\n    }\n    \n    d.quant.join(",");\n    d.subtotal.join(",");\n    d.id.join(",");\n    d.name.join(",");\n    d.manu.join(",");\n    d.cat.join(",");\n    d.subcat.join(",");\n    d.uni.join(",");\n    d.seg.join(",");\n    d.sku.join(",");\n    d.price.join(",");\n    \n    \n    var axel = Math.random() + "";\n  var a = axel * 10000000000000;\n  var iFrame = document.createElement(\'iframe\');\n  iFrame.src = "https://4672209.fls.doubleclick.net/activityi;src=4672209;type=order000;cat=%Fld_Domain%;qty="+d.quant+";cost="+d.subtotal+";u1="+a.page.category+";u2="+d.id+";u3="+d.name+";u4="+d.manu+";u5="+d.cat+";u6="+d.subcat+";u7="+d.uni+";u8="+d.seg+";u9="+d.sku+";u10="+d.price+";u11=%150826: Transaction Subtotal - EB%;u12=%150826: Transaction Subtotal - EB%;ord=%150505: Order ID AW%?";\n  iFrame.width = "1";\n  iFrame.height = "1";\n  iFrame.frameborder = "0";\n  iFrame.style.display = "none";\n  document.body.appendChild(iFrame);\n  })();\n  \n  \n  \n</script>\n'
                }]
            }],
            scope: {
                URI: {
                    include: ["order_guest_confirmation/index.html"]
                }
            },
            conditions: [function() {
                return document.body.innerHTML += "<div id='targetDiv'></div>", !0
            }],
            event: "pagebottom"
        }, {
            name: "150505: orderConfirmPage mBox - Signed in Order Confirmation AW",
            trigger: [{
                engine: "tnt",
                command: "addMbox",
                arguments: [{
                    mboxGoesAround: "div#targetDiv",
                    mboxName: "orderConfirmPage",
                    arguments: ["orderId=%150505: Order ID AW%", "orderTotal=%150505: Total Order Value AW%", "product_ordered_ID=%150514: ProductID ordered%", "paymentType=%Universal Variable - Order - Payment Type%", "servicesAndCarePlans=%MO - Basket - Services from s.products%"],
                    timeout: "1500"
                }]
            }, {
                command: "writeHTML",
                arguments: [{
                    html: '<script>\n  (function(){\n    var a = window.universal_variable;\n    var b = a.transaction;\n    var c = b.line_items;\n    var d = {\n      quant: [],\n      subtotal: [],\n      id: [],\n      name: [],\n      manu: [],\n      cat: [],\n      subcat: [],\n      uni: [],\n      seg: [],\n      sku: [],\n      price: []\n    };\n    for(var i = 0; i < c.length; i++){\n      var e = c[i];\n      d.quant.push(e.quantity);\n      d.subtotal.push(e.product.unit_sale_price);\n      d.id.push(e.product.id);\n      d.name.push(e.product.name);\n      d.manu.push(e.product.manufacturer);\n      d.cat.push(e.product.category);\n      d.subcat.push(e.product.subcategory);\n      d.uni.push(e.product.universe);\n      d.seg.push(e.product.segment);\n      d.sku.push(e.product.sku_code);\n      d.price.push(e.product.unit_sale_price);\n    }\n    \n    d.quant.join(",");\n    d.subtotal.join(",");\n    d.id.join(",");\n    d.name.join(",");\n    d.manu.join(",");\n    d.cat.join(",");\n    d.subcat.join(",");\n    d.uni.join(",");\n    d.seg.join(",");\n    d.sku.join(",");\n    d.price.join(",");\n    \n    \n    var axel = Math.random() + "";\n  var a = axel * 10000000000000;\n  var iFrame = document.createElement(\'iframe\');\n  iFrame.src = "https://4672209.fls.doubleclick.net/activityi;src=4672209;type=order000;cat=%Fld_Domain%;qty="+d.quant+";cost="+d.subtotal+";u1="+a.page.category+";u2="+d.id+";u3="+d.name+";u4="+d.manu+";u5="+d.cat+";u6="+d.subcat+";u7="+d.uni+";u8="+d.seg+";u9="+d.sku+";u10="+d.price+";u11=%150826: Transaction Subtotal - EB%;u12=%150826: Transaction Subtotal - EB%;ord=%150505: Order ID AW%?";\n  iFrame.width = "1";\n  iFrame.height = "1";\n  iFrame.frameborder = "0";\n  iFrame.style.display = "none";\n  document.body.appendChild(iFrame);\n  })();\n  \n  \n  \n</script>\n'
                }]
            }],
            scope: {
                URI: {
                    include: ["order-confirmation.html"]
                }
            },
            conditions: [function() {
                return document.body.innerHTML += "<div id='targetDiv'></div>", !0
            }],
            event: "pagebottom"
        }, {
            name: "150518: iPad Air 2 Selector EB",
            trigger: [{
                engine: "tnt",
                command: "addMbox",
                arguments: [{
                    mboxGoesAround: "div.selector",
                    mboxName: "Selector",
                    arguments: [],
                    timeout: "1500"
                }]
            }],
            scope: {
                URI: {
                    include: ["865-commercial.html"]
                }
            },
            event: "pagetop"
        }, {
            name: "150615: App Dynamic Bootstrap Code: AW",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script>window[\'adrum-start-time\'] = new Date().getTime();</script>\n<script src="https://currys-ssl.cdn.dixons.com/js/tags/adrum.js" name="adrum"></script>'
                }]
            }],
            scope: {
                domains: [/currys\.co\.uk$/i, /pcworld\.co\.uk$/i]
            },
            event: "pagetop"
        }, {
            name: "150825: Category Floodlight - EB",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<!--\nStart of DoubleClick Floodlight Tag: Please do not remove\nActivity name of this tag: Currys - Category\nURL of the webpage where the tag is expected to be placed: http://www.currys.co.uk/gbuk/household-appliances/laundry-dishwashers-332-c.html\nThis tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\nCreation Date: 08/28/2015\n-->\n<script type="text/javascript">\nvar axel = Math.random() + "";\nvar a = axel * 10000000000000;\ndocument.write(\'<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=categ0;cat=%Fld_Domain%;u1=%150826: Page category%;u5=%150826: Product Category - EB%;u7=%150826: Universe - EB%;ord=\' + a + \'?" width="1" height="1" frameborder="0" style="display:none"></iframe>\');\n</script>\n<noscript>\n<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=categ0;cat=%Fld_Domain%;u1=%150826: Page category%;u5=%150826: Product Category - EB%;u7=%150826: Universe - EB%;ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>\n</noscript>\n<!-- End of DoubleClick Floodlight Tag: Please do not remove -->'
                }, {
                    html: '<!--\nStart of DoubleClick Floodlight Tag: Please do not remove\nActivity name of this tag: Currys - Laptop Trade-In\nURL of the web page where the tag is expected to be placed: http://www.currys.co.uk/gbuk/windows-tradein-1189-commercial.html\nThis tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\nCreation Date: 07/28/2016\n-->\n<script type="text/javascript">\nvar axel = Math.random() + "";\nvar a = axel * 10000000000000;\ndocument.write(\'<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=trade-in;cat=curry0;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=\' + a + \'?" width="1" height="1" frameborder="0" style="display:none"></iframe>\');\n</script>\n<noscript>\n<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=trade-in;cat=curry0;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>\n</noscript>\n<!-- End of DoubleClick Floodlight Tag: Please do not remove -->'
                }]
            }],
            scope: {
                URI: {
                    include: ["-c.html"]
                },
                domains: [/currys\.co\.uk$/i, /pcworld\.co\.uk$/i]
            },
            event: "pagebottom"
        }, {
            name: "150825: Checkout  Floodlight - EB",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: "<!--\nStart of DoubleClick Floodlight Tag: Please do not remove\nActivity name of this tag: Currys - Checkout\nURL of the webpage where the tag is expected to be placed: http://www.currys.co.uk/gbuk/o/initorder/basket-confirmation.html\n    This tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\n    Creation Date: 08/28/2015\n-->\n<script type=\"text/javascript\">\n\n    /**\n     *\n     * @param type\n     * @param name\n     * @returns {string}\n     */\n    function getDataForType(type, name) {\n        var dataArray = universal_variable.basket.line_items;\n        var newData = dataArray.map(\n                function (item) {\n                    return item.product[type];\n                }).join('|');\n        return ';' + name + '=' + newData;\n    }\n    var u2 = getDataForType('id', 'u2');\n    var u3 = getDataForType('name', 'u3');\n    var u4 = getDataForType('manufacturer', 'u4');\n    var u5 = getDataForType('category', 'u5');\n    var u6 = getDataForType('subcategory', 'u6');\n    var u7 = getDataForType('universe', 'u7');\n    var u8 = getDataForType('segment', 'u8');\n    var u9 = getDataForType('sku_code', 'u9');\n    var u10 = getDataForType('unit_sale_price', 'u10');\n\n    var total = u2 + u3 + u4 + u5 + u6 + u7 + u8 + u9 + u10;\n    //document.getElementById(\"abc\").src=\"https://4672209.fls.doubleclick.net/activityi;src=4672209;type=check0;cat=curry0;u1=[Page Category]\"+total\n\n    var axel = Math.random() + \"\";\n    var a = axel * 10000000000000;\n    document.write('<iframe src=\"https://4672209.fls.doubleclick.net/activityi;src=4672209;type=check0;cat=%Fld_Domain%;u1=%150826: Page category%' +\n            total +\n                    ';u11=%150930: Basket - Subtotal%;u12=%150930: Basket - total%;' +\n            'ord=' + a + '?\" width=\"1\" height=\"1\" frameborder=\"0\" style=\"display:none\"></iframe>');\n</script>\n<noscript>\n    <iframe id=\"abc\" src=\"https://4672209.fls.doubleclick.net/activityi;src=4672209;type=check0;cat=curry0;\n    u1=%150826: Page category%;\n    u2=NA;\n    u3=NA;\n    u4=NA;\n    u5=NA;\n    u6=NA;\n    u7=NA;\n    u8=NA;\n    u9=NA;\n    u10=NA;\n    u11=%150930: Basket - Subtotal%;\n    u12=%150930: Basket - total%;\n    ord=1?\" width=\"1\" height=\"1\" frameborder=\"0\" style=\"display:none\"></iframe>\n</noscript>\n<!-- End of DoubleClick Floodlight Tag: Please do not remove -->"
                }]
            }],
            scope: {
                URI: {
                    include: [/basket-confirmation/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "150825: Product 3rd Party- EB",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script>\n  var axel = Math.random() + "";\n  var a = axel * 10000000000000;\n  var iFrame = document.createElement(\'iframe\');\n  iFrame.src = "https://4672209.fls.doubleclick.net/activityi;src=4672209;type=produ0;cat=%Fld_Domain%;u1=%150826: Page category%;u2=%150826: Product ID - EB%;u3=%150826: Product Name - EB%;u4=%150826: Product Manufacturer - EB%;u5=%150826: Product Category - EB%;u6=%150826: Product Sub Category%;u7=%150826: Universe - EB%;u9=%150826: Product SKU%;u10=%150826: Product Price - EB%;ord=" + a + "?";\n  iFrame.width = "1";\n  iFrame.height = "1";\n  iFrame.frameborder = "0";\n  iFrame.style.display = "none";\n  document.body.appendChild(iFrame);\n</script>'
                }, {
                    html: '<!--<script type="text/javascript" src="//static.criteo.net/js/ld/ld.js" async="true"></script>\n<script type="text/javascript">\nwindow.criteo_q = window.criteo_q || [];\nwindow.criteo_q.push(  \n        { event: "setAccount", account: 20348 },\n        { event: "setHashedEmail", email: "#MD5-hashed email address#" },\n        { event: "setSiteType", type: "#m for mobile or t for tablet or d for desktop#" },\n        { event: "viewItem", item: "#Your item id#" }\n);\n</script>\n-->'
                }]
            }],
            scope: {
                URI: {
                    include: ["-pdt"]
                }
            },
            event: "pagebottom"
        }, {
            name: "150825: Rich Relevance Guest Checkout Script - EB",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script src="https://media.richrelevance.com/rrserver/js/1.2/p13n.js"></script>'
                }, {
                    html: "<script>var R3_COMMON = new r3_common();\nR3_COMMON.setApiKey('cd10d5116928df8a');\nR3_COMMON.setBaseUrl('https://recs.richrelevance.com/rrserver/');\n\nR3_COMMON.setSessionId('${sessionID}');\nR3_COMMON.setUserId('${sessionID}');\n\nvar R3_PURCHASED    = new r3_purchased();\nR3_PURCHASED.setOrderNumber('${orderId}');\n\nfor (var i=0; i<${productID}.length; i++) {\n  R3_PURCHASED.addItemIdPriceQuantity(${productID}[i], ${productPrice}[i], ${productQunatity}[i]);\n}\n                  \nr3();\n</script>"
                }]
            }],
            scope: {
                URI: {
                    include: ["order_guest_confirmation"]
                }
            },
            event: "pagebottom"
        }, {
            name: "150907: Commercial Page Floodlight - EB",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<!--\nStart of DoubleClick Floodlight Tag: Please do not remove\nActivity name of this tag: Currys - ThinkPages\nURL of the webpage where the tag is expected to be placed: http://www.currys.co.uk/gbuk/4k-ultra-hd-1707-commercial.html\nThis tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\nCreation Date: 08/28/2015\n-->\n<script type="text/javascript">\nvar axel = Math.random() + "";\nvar a = axel * 10000000000000;\ndocument.write(\'<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=think0;cat=%Fld_Domain%;u1=%150826: Page category%;u4=%150826: Product Manufacturer - EB%;u5=%150826: Product Category - EB%;u6=%150826: Product Sub Category%;u7=%150826: Universe - EB%;u8=%150826: Product Segment%;u15=%150723: Capture Page Name: AW%;ord=\' + a + \'?" width="1" height="1" frameborder="0" style="display:none"></iframe>\');\n</script>\n<noscript>\n<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=think0;cat=%Fld_Domain%;u1=%150826: Page category%;u4=%150826: Product Manufacturer - EB%;u5=%150826: Product Category - EB%;u6=%150826: Product Sub Category%;u7=%150826: Universe - EB%;u8=%150826: Product Segment%;u15=%150723: Capture Page Name: AW%;ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>\n</noscript>\n<!-- End of DoubleClick Floodlight Tag: Please do not remove -->'
                }]
            }],
            scope: {
                URI: {
                    include: ["-commercial.html"]
                },
                domains: [/currys\.co\.uk$/i, /pcworld\.co\.uk$/i]
            },
            event: "pagebottom"
        }, {
            name: "150907: Market Floodlight - EB",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<!--\nStart of DoubleClick Floodlight Tag: Please do not remove\nActivity name of this tag: Currys - Market\nURL of the webpage where the tag is expected to be placed: http://www.currys.co.uk/gbuk/household-appliances/laundry-dishwashers/washing-machines/332_3119_30206_xx_xx/xx-criteria.html\nThis tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\nCreation Date: 08/28/2015\n-->\n<script type="text/javascript">\nvar axel = Math.random() + "";\nvar a = axel * 10000000000000;\ndocument.write(\'<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=marke0;cat=%Fld_Domain%;u1=marke0;u5=NA;u6=NA;u7=NA;ord=\' + a + \'?" width="1" height="1" frameborder="0" style="display:none"></iframe>\');\n</script>\n<noscript>\n<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=marke0;cat=%Fld_Domain%;u1=marke0;u5=NA;u6=NA;u7=NA;ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>\n</noscript>\n<!-- End of DoubleClick Floodlight Tag: Please do not remove -->'
                }]
            }],
            scope: {
                URI: {
                    include: ["-m.html"]
                },
                domains: [/currys\.co\.uk$/i, /pcworld\.co\.uk$/i]
            },
            event: "pagebottom"
        }, {
            name: "150907: Search Results Floodlight - EB",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<!--\nStart of DoubleClick Floodlight Tag: Please do not remove\nActivity name of this tag: Currys - Search Pages\nURL of the webpage where the tag is expected to be placed: http://www.currys.co.uk/gbuk/search-keywords/xx_xx_xx_xx_xx/tv/xx-criteria.html\nThis tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\nCreation Date: 08/28/2015\n-->\n<script type="text/javascript">\nvar axel = Math.random() + "";\nvar a = axel * 10000000000000;\ndocument.write(\'<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=searc0;cat=%Fld_Domain%;u1=searc0;u14=NA;ord=\' + a + \'?" width="1" height="1" frameborder="0" style="display:none"></iframe>\');\n</script>\n<noscript>\n<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=searc0;cat=%Fld_Domain%;u1=searc0;u14=NA;ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>\n</noscript>\n<!-- End of DoubleClick Floodlight Tag: Please do not remove -->'
                }]
            }],
            scope: {
                URI: {
                    include: ["/search-keywords/"]
                },
                domains: [/currys\.co\.uk$/i, /pcworld\.co\.uk$/i]
            },
            event: "pagebottom"
        }, {
            name: "150907: Segment Floodlight - EB",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<!--\nStart of DoubleClick Floodlight Tag: Please do not remove\nActivity name of this tag: Currys - Segment\nURL of the webpage where the tag is expected to be placed: http://www.currys.co.uk/gbuk/household-appliances/laundry-dishwashers/washing-machines/332_3119_30206_xx_xx/xx-300-criteria.html\nThis tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\nCreation Date: 08/28/2015\n-->\n<script type="text/javascript">\nvar axel = Math.random() + "";\nvar a = axel * 10000000000000;\ndocument.write(\'<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=segme0;cat=%Fld_Domain%;u1=segme0;u5=NA;u6=NA;u7=NA;u8=NA;ord=\' + a + \'?" width="1" height="1" frameborder="0" style="display:none"></iframe>\');\n</script>\n<noscript>\n<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=segme0;cat=%Fld_Domain%;u1=NA;u5=NA;u6=NA;u7=NA;u8=NA;ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>\n</noscript>\n<!-- End of DoubleClick Floodlight Tag: Please do not remove -->'
                }, {
                    html: '<!--<script type="text/javascript" src="//static.criteo.net/js/ld/ld.js" async="true"></script>\n<script type="text/javascript">\nwindow.criteo_q = window.criteo_q || [];\nwindow.criteo_q.push(\n        { event: "setAccount", account: 20348 },\n        { event: "setHashedEmail", email: "#MD5-hashed email address#" },\n        { event: "setSiteType", type: "#m for mobile or t for tablet or d for desktop#" },\n        { event: "viewList", item: ["#First item id#", "#Second item id#", "#Third item id#"] }\n);\n</script>\n-->'
                }]
            }],
            scope: {
                URI: {
                    include: ["-criteria.html"]
                },
                domains: [/currys\.co\.uk$/i, /pcworld\.co\.uk$/i]
            },
            event: "pagebottom"
        }, {
            name: "150907: Service Page Floodlight",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<!--\nStart of DoubleClick Floodlight Tag: Please do not remove\nActivity name of this tag: Currys - Customer Services\nURL of the webpage where the tag is expected to be placed: http://www.currys.co.uk/gbuk/customer-services-1143-theme.html\nThis tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\nCreation Date: 08/28/2015\n-->\n<script type="text/javascript">\nvar axel = Math.random() + "";\nvar a = axel * 10000000000000;\ndocument.write(\'<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=custo0;cat=curry0;u1=NA;u15=NA;ord=\' + a + \'?" width="1" height="1" frameborder="0" style="display:none"></iframe>\');\n</script>\n<noscript>\n<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=custo0;cat=curry0;u1=NA;u15=NA;ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>\n</noscript>\n<!-- End of DoubleClick Floodlight Tag: Please do not remove -->'
                }]
            }],
            scope: {
                URI: {
                    include: [/knowhow|contact-us|price-promise|recycle|care-plan|returns-cancellations|gift-vouchers|payment-options|order-and-collect|delivery|repairs|customer-services/i]
                },
                domains: [/currys\.co\.uk$/i, /dixons\.com$/i, /pcworld\.co\.uk$/i],
                protocols: [/http:/i]
            },
            event: "pagebottom"
        }, {
            name: "150907: Universe Floodlight - EB",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<!--\nStart of DoubleClick Floodlight Tag: Please do not remove\nActivity name of this tag: Currys - Hub\nURL of the webpage where the tag is expected to be placed: http://www.currys.co.uk/gbuk/tv-dvd-blu-ray-31-u.html\nThis tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\nCreation Date: 08/28/2015\n-->\n<script type="text/javascript">\nvar axel = Math.random() + "";\nvar a = axel * 10000000000000;\ndocument.write(\'<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=hub;cat=%Fld_Domain%;u1=%150826: Page category%;u5=%150826: Product Category - EB%;u6=%150826: Product Sub Category%;u7=%150826: Universe - EB%;u8=%150826: Product Segment%;u15=%150723: Capture Page Name: AW%;ord=\' + a + \'?" width="1" height="1" frameborder="0" style="display:none"></iframe>\');\n</script>\n<noscript>\n<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=hub;cat=%Fld_Domain%;u1=%150826: Page category%;u5=%150826: Product Category - EB%;u6=%150826: Product Sub Category%;u7=%150826: Universe - EB%;u8=%150826: Product Segment%;u15=%150723: Capture Page Name: AW%;ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>\n</noscript>\n<!-- End of DoubleClick Floodlight Tag: Please do not remove -->'
                }]
            }],
            scope: {
                URI: {
                    include: ["-u.html"]
                },
                domains: [/currys\.co\.uk$/i, /pcworld\.co\.uk$/i]
            },
            event: "pagebottom"
        }, {
            name: "150909: Customer Service Floodlight - EB",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<!--\nStart of DoubleClick Floodlight Tag: Please do not remove\nActivity name of this tag: Currys - Customer Services\nURL of the webpage where the tag is expected to be placed: http://www.currys.co.uk/gbuk/customer-services-1143-theme.html\nThis tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\nCreation Date: 08/28/2015\n-->\n<script type="text/javascript">\nvar axel = Math.random() + "";\nvar a = axel * 10000000000000;\ndocument.write(\'<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=custo0;cat=%Fld_Domain%;u1=%150826: Page category%;u15=%150723: Capture Page Name: AW%;ord=\' + a + \'?" width="1" height="1" frameborder="0" style="display:none"></iframe>\');\n</script>\n<noscript>\n<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=custo0;cat=%Fld_Domain%;u1=%150826: Page category%;u15=%150723: Capture Page Name: AW%;ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>\n</noscript>\n<!-- End of DoubleClick Floodlight Tag: Please do not remove -->'
                }]
            }],
            scope: {
                URI: {
                    include: ["customer-services"]
                }
            },
            event: "pagebottom"
        }, {
            name: "150917: Affiliate Cookie EB",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script>function (session) {\n\n  var landing = session.sessionLandingPage;\n  var expiry = (new Date()).getTime() + 1000 * 60 * 60 * 24 * 30;\n  expiry = new Date(expiry);\n  var domain = ".pcworld.co.uk";\n\n  function setAffiliateCookie(affiliate){\n    var cookieString = "qb_affiliate=" + affiliate + \n                       ";domain=" + domain + \n                       ";expires=" + expiry.toGMTString() + \n                       ";path=/;";\n    document.cookie = cookieString;\n  }\n\n  //Count this as a landing page if it started loading near the session start\n  if (Math.abs(session.pageStartTime - session.sessionStartTime) < 100) {\n    if (landing.indexOf("cmpid=aff~") > -1 &&\n        landing.indexOf("Tradedoubler~") === -1){\n      //Set AWIN cookie\n      setAffiliateCookie("AWIN");\n    } else if (landing.indexOf("Tradedoubler~") > -1) {\n      //Set Tradedoubler cookie\n      setAffiliateCookie("TRADEDOUBLER");\n    } else if (landing.indexOf("cmpid=comp~Become") > -1) {\n      //Set Become cookie\n      setAffiliateCookie("BECOME");\n    } else if (landing.indexOf("cmpid=comp~Kelkoo") > -1) {\n      //Set Kelkoo cookie\n      setAffiliateCookie("KELKOO");\n    } else if (landing.indexOf("cmpid=comp~Nextag") > -1) {\n      //Set Nextag cookie\n      setAffiliateCookie("NEXTAG");\n    } else if (landing.indexOf("cmpid=comp~Pricegrabber") > -1) {\n      //Set PriceGrabber cookie\n      setAffiliateCookie("PRICEGRABBER");\n    } else if (landing.indexOf("cmpid=comp~Pricerunner") > -1) {\n      //Set PriceRunner cookie\n      setAffiliateCookie("PRICERUNNER");\n    } else if (landing.indexOf("cmpid=comp~Shoppingcom") > -1) {\n      //Set Shopping.com cookie\n      setAffiliateCookie("SHOPPINGCOM");\n    }\n  }\n  \n  return (true);\n  \n}\n  </script>'
                }]
            }],
            event: "pagetop"
        }, {
            name: "150928: Criteo User Agent Detect EB",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script>\n  if (navigator.userAgent.match(/(android|iphone|ipad|blackberry|symbian|symbianos|symbos|netfront|model- orange|javaplatform|iemobile|windows phone|samsung|htc|opera mobile|opera mobi|opera mini|presto|huawei|blazer|bolt|doris|fennec|gobrowser|iris|maemo browser|mib|cldc|minimo|semc- browser|skyfire|teashark|teleca|uzard|uzardweb|meego|nokia|bb10|playbook)/gi)) { \nif (((screen.width >= 480) && (screen.height >= 800)) || ((screen.width >= 800) && (screen.height >= 480))) { sitetype = "t"; \n} else {\nsitetype = "m"; \n}\n} else { \nsitetype = "d"; }\n  );\n</script> '
                }]
            }],
            event: "pagetop"
        }, {
            name: "151002: Think Page Floodlight",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '\n"<!--\nStart of DoubleClick Floodlight Tag: Please do not remove\nActivity name of this tag: Currys - Hub\nURL of the webpage where the tag is expected to be placed: http://www.currys.co.uk/gbuk/tv-dvd-blu-ray-31-u.html\nThis tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\nCreation Date: 08/28/2015\n-->\n<script type="text/javascript">\nvar axel = Math.random() + "";\nvar a = axel * 10000000000000;\ndocument.write(\'<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=hub;cat=%Fld_Domain%;u1=NA;u5=NA;u6=NA;u7=NA;u8=NA;u15=NA;ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>\');\n</script>\n<noscript>\n    <iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=hub;cat=%Fld_Domain%;u1=NA;u5=NA;u6=NA;u7=NA;u8=NA;u15=NA;ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>\n    </noscript>\n        <!-- End of DoubleClick Floodlight Tag: Please do not remove -->"'
                }]
            }],
            scope: {
                URI: {
                    include: [/4k-ultra-hd-1707|now-tv-951|samsung-suhd-1077|sayduck-app-622|xbox-999|acer-revo-1109|windows10-1004|intel-1336|hp-laptops-792|sprout-1040|chromebook-1856|surface-pro3-770|nexus9-868|epson-projectors-1059|philips-screeneo-694|refurbished-computing-928|samsung-tablet-1159|amazon-fire-tv-905|belkin-netcam-331|epson-eco-tank-823|gaming-bunker-489|google-chromecast-686|hp-instant-ink-709|whats-office365-786|seagate-cloud-1068|google-nexus6-phone-1063|samsung-galaxy-s6-1078|google-android-wear-1065|black-friday-785|ms-fitness-1079|windows-tradein-1189/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Analytics - Delivery Types Available",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-59df624064746d21fe008ec6.js"
                    }]
                }]
            }],
            scope: {
                URI: {
                    include: [/order-delivery.html|order_guest_delivery\/index.html/i]
                }
            },
            event: "windowload"
        }, {
            name: "Analytics - MA - s.abort",
            trigger: [{
                command: "loadBlockingScript",
                arguments: [{
                    sequential: !0,
                    scripts: [{
                        src: "satellite-58a6f1c164746d1d7c0077bd.js"
                    }]
                }]
            }],
            scope: {
                URI: {
                    include: ["my-account.html"]
                }
            },
            event: "pagebottom"
        }, {
            name: "Analytics - Page Load Time Into Legacy Request",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-59b7f44864746d3832006905.js"
                    }]
                }]
            }],
            conditions: [function() {
                return "undefined" != typeof window.performance.timing
            }],
            event: "pagetop"
        }, {
            name: "Analytics - Product Page - pdt forward order before s.t()",
            scope: {
                URI: {
                    include: ["pdt.html"]
                }
            },
            conditions: [function() {
                var e = (window.digitalData || {}).product || [];
                if ((e[e.length - 1] || {}).isForwardOrder) {
                    var t = s.events.split(",");
                    return t.push("event224"), s.events = t.join(","), !0
                }
            }],
            event: "pagebottom"
        }, {
            name: "Basket - Webchat Touch Commerce",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-58a41ce164746d1d7c00564b.js"
                    }]
                }]
            }],
            scope: {
                URI: {
                    include: [/basket-confirmation.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Booking Buddy Re-sizer Code",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "addEvent",
                arguments: ["event52"]
            }, {
                command: "loadBlockingScript",
                arguments: [{
                    sequential: !0,
                    scripts: [{
                        src: "satellite-56d9c28f64746d545a003dce.js"
                    }]
                }]
            }],
            scope: {
                URI: {
                    include: [/instore-booking-1231-commercial/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Category Affinity - Global mBox",
            scope: {
                URI: {
                    include: [/pdt.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Chromecast - Landing Pixel",
            trigger: [{
                command: "loadIframe",
                arguments: [{
                    pages: [{
                        src: "satellite-56fa7a4064746d05880039e8.html",
                        data: []
                    }]
                }]
            }],
            scope: {
                URI: {
                    include: [/(10137566|10137628).*-pdt.html/i]
                }
            },
            event: "windowload"
        }, {
            name: "Competitor Pricing mBox",
            trigger: [{
                engine: "tnt",
                command: "addMbox",
                arguments: [{
                    mboxGoesAround: "price-promise.pp-show.variationC",
                    mboxName: "Price Promise",
                    arguments: [],
                    timeout: "1500"
                }]
            }],
            scope: {
                URI: {
                    include: [/pdt.html/i]
                }
            },
            event: "pagetop"
        }, {
            name: "Facebook - pdt.html",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: "<!-- Facebook Pixel Code -->\n<script>\n!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;\nn.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;\nt.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,\ndocument,'script','https://connect.facebook.net/en_US/fbevents.js');\n\n  fbq('init', '837733026317349');\n  fbq('track', 'PageView');\n\tfbq('track', 'ViewContent', {\n    content_type: 'product', //either 'product' or 'product_group'\n    content_ids: [universal_variable.product.id], //array of one or more product ids in the page\n    value: universal_variable.product.unit_sale_price,    //OPTIONAL, but highly recommended\n    currency: 'GBP' //REQUIRED if you a pass value\n\t});\n</script>\n\n<noscript><img height=\"1\" width=\"1\" style=\"display:none\" src=\"https://www.facebook.com/tr?id=837733026317349&ev=ViewContent&noscript=1\"/></noscript>\n<!-- End Facebook Pixel Code --> \n\n"
                }]
            }],
            scope: {
                URI: {
                    include: ["pdt.html"]
                }
            },
            event: "pagebottom"
        }, {
            name: "Facebook - product_confirmation.html",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: "<!-- Facebook Pixel Code -->\n<script>\n!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;\nn.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;\nt.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,\ndocument,'script','https://connect.facebook.net/en_US/fbevents.js');\n\n\tfbq('init', '837733026317349');\n  fbq('track', 'PageView');\n\tfbq('track', 'AddToCart', {\n\t        content_ids: [_satellite.getVar(\"MCD - Step Page - FUPID\")],\n\t        content_type: 'product',\n\t        value: _satellite.getVar(\"Step Page - Product Price\"), //OPTIONAL, but highly recommended\n\t        currency: 'GBP' //REQUIRED if you pass a value\n\t    });\n</script>\n\n<noscript><img height=\"1\" width=\"1\" style=\"display:none\"\nsrc=\"https://www.facebook.com/tr?id=837733026317349&ev=AddToCart&noscript=1\"\n/></noscript>\n<!-- End Facebook Pixel Code --> \n"
                }]
            }],
            scope: {
                URI: {
                    include: ["product_confirmation.html"]
                }
            },
            event: "pagebottom"
        }, {
            name: "Floodlight - Landing Pages",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<!--\n Start of DoubleClick Floodlight Tag: Please do not remove\n Activity name of this tag: Both Domains - Landing Pages (Non Secure)\n URL of the web page where the tag is expected to be placed: http://www.pcworld.co.uk/gbuk/index.html\n This tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\n Creation Date: 05/06/2016\n -->\n  <script type="text/javascript" src="//www.gstatic.com/attribution/collection/attributiontools.js"></script>\n  <script type="text/javascript">\n  if (google_attr) {\n  var attrProps = [];\n  attrProps.push({\n  });\n  var attrParam = google_attr.build(attrProps);\n  }\n </script>\n <script type="text/javascript">\n var axel = Math.random() + "";\n var a = axel * 10000000000000;\n document.write(\'<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=landingp;cat=\' + _satellite.getVar(\'Fld_Domain\') + \';dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=\' + (attrParam || \'\') + \'?" width="1" height="1" frameborder="0" style="display:none"></iframe>\');\n </script>\n <noscript>\n <iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=landingp;cat=pcwor0;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>\n </noscript>\n <!-- End of DoubleClick Floodlight Tag: Please do not remove -->'
                }]
            }],
            scope: {
                protocols: [/http:/i]
            },
            event: "pagebottom"
        }, {
            name: "Floodlight - Registration",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<!--\n Start of DoubleClick Floodlight Tag: Please do not remove\n Activity name of this tag: PC World - Registration Confirmation Completion\n URL of the web page where the tag is expected to be placed: http://www.pcworld.co.uk/gbuk/index.html\n This tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\n Creation Date: 05/06/2016\n -->\n  <script type="text/javascript" src="//www.gstatic.com/attribution/collection/attributiontools.js"></script>\n  <script type="text/javascript">\n  if (google_attr) {\n  var attrProps = [];\n  attrProps.push({\n  });\n  var attrParam = google_attr.build(attrProps);\n  }\n </script>\n <script type="text/javascript">\n var axel = Math.random() + "";\n var a = axel * 10000000000000;\n document.write(\'<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=reg_conf;cat=%Fld_Domain%;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=\' + (attrParam || \'\') + \'?" width="1" height="1" frameborder="0" style="display:none"></iframe>\');\n </script>\n <noscript>\n <iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=reg_conf;cat=%Fld_Domain%;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>\n </noscript>\n <!-- End of DoubleClick Floodlight Tag: Please do not remove -->'
                }]
            }],
            conditions: [function() {
                var e, t = window.location.pathname,
                    n = document.createElement("a");
                return n.href = document.referrer, e = n.pathname, "/gbuk/s/my-account.html" === t && "/gbuk/s/inscription.html" === e || "/gbuk/o/order-payment.html" === t && "/gbuk/o_action/order_guest_payment/index.html" === e
            }],
            event: "pagebottom"
        }, {
            name: "Floodlight - Store Locator",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<!--\n Start of DoubleClick Floodlight Tag: Please do not remove\n Activity name of this tag: Currys - Store Locator\n URL of the webpage where the tag is expected to be placed: http://www.currys.co.uk/gbuk/s/find-a-store.html\n This tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\n Creation Date: 08/28/2015\n -->\n  <script type="text/javascript" src="//www.gstatic.com/attribution/collection/attributiontools.js"></script>\n  <script type="text/javascript">\n  if (google_attr) {\n  var attrProps = [];\n  attrProps.push({\n  });\n  var attrParam = google_attr.build(attrProps);\n  }\n </script>\n <script type="text/javascript">\n var axel = Math.random() + "";\n var a = axel * 10000000000000;\n document.write(\'<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=store0;cat=%Fld_Domain%;u1=store0;u13=NA;ord=\' + (attrParam || \'\') + \'?" width="1" height="1" frameborder="0" style="display:none"></iframe>\');\n </script>\n <noscript>\n <iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=store0;cat=%Fld_Domain%;u1=store0;u13=NA;ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>\n </noscript>\n <!-- End of DoubleClick Floodlight Tag: Please do not remove -->'
                }]
            }],
            scope: {
                URI: {
                    include: ["/find-a-store.html"]
                },
                domains: [/currys\.co\.uk$/i, /pcworld\.co\.uk$/i]
            },
            event: "pagebottom"
        }, {
            name: "GA - Order Confirmation",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-582db88a64746d06550048f5.js"
                    }]
                }]
            }],
            scope: {
                URI: {
                    include: [/.order_guest_confirmation|.order-confirmation|.reservation/i]
                }
            },
            event: "pagetop"
        }, {
            name: "Home Page Tags - Currys",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript">\n  console.log("DTM: Criteo Homepage tag for Currys"); </script>\n\n\n<script type="text/javascript" src="//static.criteo.net/js/ld/ld.js" async="true"></script>\n<script type="text/javascript">\nwindow.criteo_q = window.criteo_q || [];\nwindow.criteo_q.push(\n        { event: "setAccount", account: 23730 },\n        { event: "setSiteType", type: "sitetype" },\n        { event: "viewHome" }\n);\n</script>'
                }, {
                    html: '<!--\nStart of DoubleClick Floodlight Tag: Please do not remove\nActivity name of this tag: Currys - Homepage\nURL of the webpage where the tag is expected to be placed: http://www.currys.co.uk/gbuk/index.html\nThis tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\nCreation Date: 08/28/2015\n-->\n<script type="text/javascript">\nvar axel = Math.random() + "";\nvar a = axel * 10000000000000;\ndocument.write(\'<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=homep0;cat=%Fld_Domain%;u1=Home;ord=\' + a + \'?" width="1" height="1" frameborder="0" style="display:none"></iframe>\');\n</script>\n<noscript>\n<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=homep0;cat=%Fld_Domain%;u1=Home;ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>\n</noscript>\n<!-- End of DoubleClick Floodlight Tag: Please do not remove -->'
                }]
            }],
            scope: {
                protocols: [/http:/i]
            },
            conditions: [function() {
                if ((currSite.indexOf("fo-currys.fo.") > -1 || currSite.indexOf("currys.co.uk") > -1) && document.location.href.indexOf("index.html") > -1) return !0
            }],
            event: "pagebottom"
        }, {
            name: "Home Page Tags - PC World",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript">\n  console.log("DTM: Criteo Homepage tag for PC World"); </script>\n\n\n<script type="text/javascript" src="//static.criteo.net/js/ld/ld.js" async="true"></script>\n<script type="text/javascript">\nwindow.criteo_q = window.criteo_q || [];\nwindow.criteo_q.push(\n        { event: "setAccount", account: 23883 },\n        { event: "setSiteType", type: "sitetype" },\n        { event: "viewHome" }\n);\n</script>'
                }, {
                    html: '<!--\nStart of DoubleClick Floodlight Tag: Please do not remove\nActivity name of this tag: Currys - Homepage\nURL of the webpage where the tag is expected to be placed: http://www.currys.co.uk/gbuk/index.html\nThis tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\nCreation Date: 08/28/2015\n-->\n<script type="text/javascript">\nvar axel = Math.random() + "";\nvar a = axel * 10000000000000;\ndocument.write(\'<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=homep0;cat=%Fld_Domain%;u1=Home;ord=\' + a + \'?" width="1" height="1" frameborder="0" style="display:none"></iframe>\');\n</script>\n<noscript>\n<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=homep0;cat=%Fld_Domain%;u1=Home;ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>\n</noscript>\n<!-- End of DoubleClick Floodlight Tag: Please do not remove -->'
                }]
            }],
            conditions: [function() {
                if ((currSite = document.location.host, currSite.indexOf("fo-pcw.fo.") > -1 || currSite.indexOf("pcworld.co.uk") > -1) && document.location.href.indexOf("index.html") > -1) return !0
            }],
            event: "pagebottom"
        }, {
            name: "Hotpoint JS Insertion",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script src="http://currys.cdn.dixons.com/css/themes/hotpoint/js/jquery.min.js"></script>\n<script src="http://currys.cdn.dixons.com/css/themes/hotpoint/js/hotpoint.js"></script>\n<script> var qb$ = jQuery.noConflict();</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/hotpoint-laundry-568-commercial.html/i, /hotpoint-refridgeration-713-commercial.html/i, /hotpoint-diswashers-714-commercial.html/i, /hotpoint-cooking-711-commercial.html/i, /hotpoint-ska-1052-commercial.html/i, /hotpoint-builtin-1051-commercial.html/i, /hotpoint-smart-736-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Listing Page Tags - Currys",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "setVars",
                arguments: [{
                    eVar62: "Default|%160112: Layout Type%%160112: Grid Value%"
                }]
            }],
            conditions: [function() {
                if ((currSite = document.location.host, currSite.indexOf("fo-currys.fo.") > -1 || currSite.indexOf("currys.co.uk") > -1) && document.location.href.indexOf("xx-criteria.html") > -1) return !0
            }],
            event: "pagebottom"
        }, {
            name: "Listing Page Tags - PC World",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "setVars",
                arguments: [{
                    eVar62: "Default|%160112: Layout Type%%160112: Grid Value%"
                }]
            }],
            conditions: [function() {
                if ((currSite = document.location.host, currSite.indexOf("fo-pcw.fo.") > -1 || currSite.indexOf("pcworld.co.uk") > -1) && document.location.href.indexOf("xx-criteria.html") > -1) return !0
            }],
            event: "pagebottom"
        }, {
            name: "Load MA and Category into Mbox",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: "<script type=\"text/javascript\">\n/*\n  mboxDefine(\"content\", \"Services\", \"Services=value1\", \"Install=value2\");\n\n    mboxUpdate('Services','Services='+_satellite.getVar('160217: Basket - Service Titles'),'Install='+_satellite.getVar('160217: Basket - Installation data from href'));\n*/\n</script>"
                }]
            }, {
                command: "loadBlockingScript",
                arguments: [{
                    sequential: !0,
                    scripts: [{
                        src: "satellite-56c499a264746d38ca003ba6.js"
                    }]
                }]
            }],
            scope: {
                URI: {
                    include: [/\/basket-confirmation.html/i]
                }
            },
            conditions: [function() {
                return _satellite.getVar("%160217: Basket - Service Titles%"), !0
            }],
            event: "pagebottom"
        }, {
            name: "MS Action Tags - Basket",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-57c6f22364746d1929007b70.js"
                    }]
                }]
            }],
            scope: {
                URI: {
                    include: ["basket-confirmation.html"]
                },
                domains: [/currys\.co\.uk$/i, /pcworld\.co\.uk$/i]
            },
            conditions: [function() {
                for (var e = ((universal_variable || {}).basket || {}).line_items || [], t = 0; t < e.length; t++) {
                    var n = (e[t].product || {}).id;
                    if (["10147540"].includes(n)) return !0
                }
                return !1
            }],
            event: "domready"
        }, {
            name: "MS Action Tags - Product",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-57c6e3f864746d7d21004d66.js"
                    }]
                }]
            }],
            scope: {
                domains: [/currys\.co\.uk$/i, /pcworld\.co\.uk$/i]
            },
            conditions: [function() {
                var e = universal_variable || {},
                    t = e && e.product && e.product.id;
                return ["10147540"].indexOf(t) > -1
            }],
            event: "domready"
        }, {
            name: "Marketing - Checkout - Primary Categories into mbox",
            scope: {
                URI: {
                    include: [/\/o\/|\/o_action\//i]
                }
            },
            event: "domready"
        }, {
            name: "Marketing - Countdown Script",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-59faed1364746d0bbd00035e.js"
                    }]
                }]
            }],
            scope: {
                URI: {
                    include: ["&fuseaction=home", "gbuk/index.html"]
                }
            },
            event: "pagebottom"
        }, {
            name: "Marketing - Failed Search Mbox for Target",
            trigger: [{
                engine: "tnt",
                command: "addMbox",
                arguments: [{
                    mboxGoesAround: "aside.col3",
                    mboxName: "failedSearchMbox",
                    arguments: ["numberOfResults=%DD - Page - Search Results%"],
                    timeout: "1500"
                }]
            }],
            scope: {
                URI: {
                    include: ["-criteria.html"]
                }
            },
            conditions: [function() {
                return _satellite.textMatch(_satellite.getVar("DD - Page - Search Type"), "Keyword Searches - Failed")
            }],
            event: "pagebottom"
        }, {
            name: "Marketing - Global Tags - Currys",
            trigger: [{
                tool: ["f162a116a99b083bbc58656a88752924"],
                command: "set",
                arguments: [{
                    dimension1: "%DTM Rule Fired%"
                }]
            }, {
                command: "writeHTML",
                arguments: [{
                    html: '<script>\nconsole.log("Adobe DTM: Affiliate Dedupe Cookie Script Injected");\n\n\n  var landing = document.location.href;\n  var expiry = (new Date()).getTime() + 1000 * 60 * 60 * 24 * 30;\n  expiry = new Date(expiry);\n  var domain = ".currys.co.uk";\n  //var domain = ".dixons.com"; //used for QA\n\n  function setAffiliateCookie(affiliate){\n    var cookieString = "qb_affiliate=" + affiliate + \n                       ";domain=" + domain + \n                       ";expires=" + expiry.toGMTString() + \n                       ";path=/;";\n    document.cookie = cookieString;\n  }\n\n  //Count this as a landing page if it started loading near the session start\n\n    if (landing.indexOf("cmpid=aff~") > -1 &&\n        landing.indexOf("Tradedoubler~") === -1){\n      //Set AWIN cookie\n      setAffiliateCookie("AWIN");\n    } else if (landing.indexOf("Tradedoubler~") > -1) {\n      //Set Tradedoubler cookie\n      setAffiliateCookie("TRADEDOUBLER");\n    } else if (landing.indexOf("cmpid=comp~Become") > -1) {\n      //Set Become cookie\n      setAffiliateCookie("BECOME");\n    } else if (landing.indexOf("cmpid=comp~Kelkoo") > -1) {\n      //Set Kelkoo cookie\n      setAffiliateCookie("KELKOO");\n    } else if (landing.indexOf("cmpid=comp~Nextag") > -1) {\n      //Set Nextag cookie\n      setAffiliateCookie("NEXTAG");\n    } else if (landing.indexOf("cmpid=comp~Pricegrabber") > -1) {\n      //Set PriceGrabber cookie\n      setAffiliateCookie("PRICEGRABBER");\n    } else if (landing.indexOf("cmpid=comp~Pricerunner") > -1) {\n      //Set PriceRunner cookie\n      setAffiliateCookie("PRICERUNNER");\n    } else if (landing.indexOf("cmpid=comp~Shoppingcom") > -1) {\n      //Set Shopping.com cookie\n      setAffiliateCookie("SHOPPINGCOM");\n    } else if (landing.indexOf("cmpid=ppc~") > -1){\n\t  //Set Cookie to PPC - Added 11/6/2017\n\t  setAffiliateCookie("PPC")\n    } else if (landing.indexOf("cmpid=em~") > -1) {\n\t  //Set Cookie to Email - Added 11/6/2017    \n\t  setAffiliateCookie("Email")\n    } else if (landing.indexOf("cmpid=display~|rmktg") > -1){\n\t  //Set Cookie to Display - Added 11/6/2017    \n\t  setAffiliateCookie("Display")\n    } else if (landing.indexOf("cmpid=comp") > -1) {\n\t  //Set Cookie to Price Comp - Added 11/6/2017    \n\t  setAffiliateCookie("Price Comp")\n    } else if (landing.indexOf("cmpid=social") > -1){\n\t  //Set Cookie to Social - Added 11/6/2017\n\t  setAffiliateCookie("Social")\n    } else if (landing.indexOf("cmpid=embis") > -1) {\n\t  //Set Cookie to Email When Back In Stock- Added 11/6/2017    \n\t  setAffiliateCookie("Email When Back In Stock")\n    } else if (landing.indexOf("cmpid=content") > -1){\n\t  //Set Cookie to Content Marketing - Added 11/6/2017\n\t  setAffiliateCookie("Content Marketing")\n    } else if (landing.indexOf("cmpid=bc") > -1) {\n\t  //Set Cookie to Beacons - Added 11/6/2017    \n\t  setAffiliateCookie("Beacons")\n    }\n\n  \n  \n  \n  \n  \n  \n  \n  \n  \n</script>'
                }, {
                    html: '<script type="text/javascript">\n  try {var __scS=document.createElement("script");__scS.type="text/javascript";\n    __scS.async=true;__scS.src="https://s.salecycle.com/currys/bundle.js";\n    document.getElementsByTagName("head")[0].appendChild(__scS);}catch(e){}\n</script>'
                }, {
                    html: "<!-- Decibel Insight - www.currys.co.uk -->\n<script type=\"text/javascript\">\n  // <![CDATA[\n  (function(d,e,c,i,b,el,it) {\n    d._da_=d._da_||[];_da_.oldErr=d.onerror;_da_.err=[];\n    d.onerror=function(){_da_.err.push(arguments);_da_.oldErr&&_da_.oldErr.apply(d,Array.prototype.slice.call(arguments));};\n    d.DecibelInsight=b;d[b]=d[b]||function(){(d[b].q=d[b].q||[]).push(arguments);};\n    el=e.createElement(c),it=e.getElementsByTagName(c)[0];el.async=1;el.src=i;it.parentNode.insertBefore(el,it);\n  })(window,document,'script','https://cdn.decibelinsight.net/i/13432/63041/di.js','decibelInsight');\n  // ]]>\n</script>"
                }, {
                    html: "<!-- BEGIN Krux ControlTag for \"currys.co.uk and secure.currys.co.uk\" -->\n<script class=\"kxct\" data-id=\"r737ckxfi\" data-timing=\"async\" data-version=\"3.0\" type=\"text/javascript\">\n  window.Krux||((Krux=function(){Krux.q.push(arguments)}).q=[]);\n  (function(){\n    var k=document.createElement('script');k.type='text/javascript';k.async=true;\n    k.src=(location.protocol==='https:'?'https:':'http:')+'//cdn.krxd.net/controltag/r737ckxfi.js';\n    var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(k,s);\n  }());\n</script>\n<!-- END Krux ControlTag -->"
                }]
            }, {
                command: "loadBlockingScript",
                arguments: [{
                    sequential: !0,
                    scripts: [{
                        src: "satellite-5616a6c06266640014000a3c.js"
                    }, {
                        src: "satellite-563bbc7264746d41da003426.js"
                    }]
                }]
            }, {
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-5730b57e64746d64d9001750.js"
                    }]
                }]
            }, {
                command: "loadIframe",
                arguments: [{
                    pages: [{
                        src: "satellite-57bad90664746d78b5003c35.html",
                        data: []
                    }]
                }]
            }],
            conditions: [function() {
                if (currSite = document.location.host, currSite.indexOf("fo-currys.fo.") > -1 || currSite.indexOf("currys.co.uk") > -1) return !0
            }],
            event: "pagebottom"
        }, {
            name: "Marketing - Global Tags - PC World",
            trigger: [{
                tool: ["f162a116a99b083bbc58656a88752924"],
                command: "set",
                arguments: [{
                    dimension1: "%DTM Rule Fired%"
                }]
            }, {
                command: "writeHTML",
                arguments: [{
                    html: '<script>\n  try {var scS=document.createElement("script");scS.type="text/javascript";\nscS.async=true;scS.src="https://s.salecycle.com/pcworld/bundle.js";\ndocument.getElementsByTagName("head")[0].appendChild(__scS);}catch(e){}\n</script>'
                }, {
                    html: '<script>\nconsole.log("Adobe DTM: Affiliate Dedupe Cookie Script Injected");\n\n\n  var landing = document.location.href;\n  var expiry = (new Date()).getTime() + 1000 * 60 * 60 * 24 * 30;\n  expiry = new Date(expiry);\n  var domain = ".pcworld.co.uk";\n  //var domain = ".dixons.com"; //used for QA\n\n  function setAffiliateCookie(affiliate){\n    var cookieString = "qb_affiliate=" + affiliate + \n                       ";domain=" + domain + \n                       ";expires=" + expiry.toGMTString() + \n                       ";path=/;";\n    document.cookie = cookieString;\n  }\n\n  //Count this as a landing page if it started loading near the session start\n\n    if (landing.indexOf("cmpid=aff~") > -1 &&\n        landing.indexOf("Tradedoubler~") === -1){\n      //Set AWIN cookie\n      setAffiliateCookie("AWIN");\n    } else if (landing.indexOf("Tradedoubler~") > -1) {\n      //Set Tradedoubler cookie\n      setAffiliateCookie("TRADEDOUBLER");\n    } else if (landing.indexOf("cmpid=comp~Become") > -1) {\n      //Set Become cookie\n      setAffiliateCookie("BECOME");\n    } else if (landing.indexOf("cmpid=comp~Kelkoo") > -1) {\n      //Set Kelkoo cookie\n      setAffiliateCookie("KELKOO");\n    } else if (landing.indexOf("cmpid=comp~Nextag") > -1) {\n      //Set Nextag cookie\n      setAffiliateCookie("NEXTAG");\n    } else if (landing.indexOf("cmpid=comp~Pricegrabber") > -1) {\n      //Set PriceGrabber cookie\n      setAffiliateCookie("PRICEGRABBER");\n    } else if (landing.indexOf("cmpid=comp~Pricerunner") > -1) {\n      //Set PriceRunner cookie\n      setAffiliateCookie("PRICERUNNER");\n    } else if (landing.indexOf("cmpid=comp~Shoppingcom") > -1) {\n      //Set Shopping.com cookie\n      setAffiliateCookie("SHOPPINGCOM");\n    } else if (landing.indexOf("cmpid=ppc~") > -1){\n\t  //Set Cookie to PPC - Added 11/6/2017\n\t  setAffiliateCookie("PPC")\n    } else if (landing.indexOf("cmpid=em~") > -1) {\n\t  //Set Cookie to Email - Added 11/6/2017    \n\t  setAffiliateCookie("Email")\n    } else if (landing.indexOf("cmpid=display~|rmktg") > -1){\n\t  //Set Cookie to Display - Added 11/6/2017    \n\t  setAffiliateCookie("Display")\n    } else if (landing.indexOf("cmpid=comp") > -1) {\n\t  //Set Cookie to Price Comp - Added 11/6/2017    \n\t  setAffiliateCookie("Price Comp")\n    } else if (landing.indexOf("cmpid=social") > -1){\n\t  //Set Cookie to Social - Added 11/6/2017\n\t  setAffiliateCookie("Social")\n    } else if (landing.indexOf("cmpid=embis") > -1) {\n\t  //Set Cookie to Email When Back In Stock- Added 11/6/2017    \n\t  setAffiliateCookie("Email When Back In Stock")\n    } else if (landing.indexOf("cmpid=content") > -1){\n\t  //Set Cookie to Content Marketing - Added 11/6/2017\n\t  setAffiliateCookie("Content Marketing")\n    } else if (landing.indexOf("cmpid=bc") > -1) {\n\t  //Set Cookie to Beacons - Added 11/6/2017    \n\t  setAffiliateCookie("Beacons")\n    }\n\n  \n  \n  \n  \n  \n  \n  \n  \n  \n</script>'
                }, {
                    html: "<!-- Decibel Insight - www.currys.co.uk -->\n<script type=\"text/javascript\">\n  // <![CDATA[\n  (function(d,e,c,i,b,el,it) {\n    d._da_=d._da_||[];_da_.oldErr=d.onerror;_da_.err=[];\n    d.onerror=function(){_da_.err.push(arguments);_da_.oldErr&&_da_.oldErr.apply(d,Array.prototype.slice.call(arguments));};\n    d.DecibelInsight=b;d[b]=d[b]||function(){(d[b].q=d[b].q||[]).push(arguments);};\n    el=e.createElement(c),it=e.getElementsByTagName(c)[0];el.async=1;el.src=i;it.parentNode.insertBefore(el,it);\n  })(window,document,'script','https://cdn.decibelinsight.net/i/13432/63041/di.js','decibelInsight');\n  // ]]>\n</script>"
                }, {
                    html: "<!-- BEGIN Krux ControlTag for \"pcworld.co.uk\" -->\n<script class=\"kxct\" data-id=\"r737gan6i\" data-timing=\"async\" data-version=\"3.0\" type=\"text/javascript\">\n  window.Krux||((Krux=function(){Krux.q.push(arguments)}).q=[]);\n  (function(){\n    var k=document.createElement('script');k.type='text/javascript';k.async=true;\n    k.src=(location.protocol==='https:'?'https:':'http:')+'//cdn.krxd.net/controltag/r737gan6i.js';\n    var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(k,s);\n  }());\n</script>\n<!-- END Krux ControlTag -->"
                }]
            }, {
                command: "loadBlockingScript",
                arguments: [{
                    sequential: !0,
                    scripts: [{
                        src: "satellite-5616bf9264363200170009e9.js"
                    }, {
                        src: "satellite-563b828864746d3f86004316.js"
                    }]
                }]
            }, {
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-5730b5c864746d64e20016e4.js"
                    }]
                }]
            }, {
                command: "loadIframe",
                arguments: [{
                    pages: [{
                        src: "satellite-57bae2e264746d78b8003919.html",
                        data: []
                    }]
                }]
            }],
            conditions: [function() {
                if (currSite = document.location.host, currSite.indexOf("fo-pcw.fo.") > -1 || currSite.indexOf("pcworld.co.uk") > -1) return !0
            }],
            event: "pagetop"
        }, {
            name: "Marketing - Search Results",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-59273d0764746d08a6005c11.js"
                    }]
                }]
            }],
            scope: {
                URI: {
                    include: [/-criteria.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Marketing - Uniqodo Generic",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-5936b6cf64746d3b03004b57.js"
                    }]
                }]
            }],
            scope: {
                URI: {
                    exclude: [/order_guest_confirmation\/index.html|order-confirmation.html/i]
                },
                domains: [/currys\.co\.uk$/i, /dixons\.com$/i, /pcworld\.co\.uk$/i]
            },
            event: "pagebottom"
        }, {
            name: "Marketing - Uniqodo confirmation tag",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-59369b9b64746d38600067c1.js"
                    }]
                }]
            }],
            scope: {
                URI: {
                    include: [/order-confirmation.html|order_guest_confirmation\/index.html/i]
                },
                domains: [/currys\.co\.uk$/i, /dixons\.com$/i, /pcworld\.co\.uk$/i]
            },
            event: "pagebottom"
        }, {
            name: "Mbox: Product Page Colour Swatches",
            trigger: [{
                engine: "tnt",
                command: "addMbox",
                arguments: [{
                    mboxGoesAround: ".product-swatches",
                    mboxName: "pdp-swatch",
                    arguments: [],
                    timeout: "1500"
                }]
            }],
            scope: {
                URI: {
                    include: ["-pdt.html"]
                }
            },
            event: "pagetop"
        }, {
            name: "Miele Advisor - Coffee Machines",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=tJ11Jxds"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=tJ11Jxds">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "tJ11Jxds",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-advisor-coffee-machines-1560-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Advisor - Combi Steam",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=MblRqWBp"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=MblRqWBp">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "MblRqWBp",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-advisor-combi-steam-1561-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Advisor - Cooker Hood",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=phWpnsMn"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=phWpnsMn">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "phWpnsMn",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-advisor-cooker-hood-1562-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Advisor - Dishwasher",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=Dr0GchHZ"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=Dr0GchHZ">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "Dr0GchHZ",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-advisor-dishwasher-1563-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Advisor - Dryer",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=h3dP6jKt"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=h3dP6jKt">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "h3dP6jKt",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-advisor-dryer-1564-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Advisor - Fridges",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=GMZ00g6d"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=GMZ00g6d">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "GMZ00g6d",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-advisor-fridges-1565-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Advisor - Microwave Ovens",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=l04gSLBZ"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=l04gSLBZ">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "l04gSLBZ",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-advisor-microwave-ovens-1566-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Advisor - Ovens",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=NLvWDzQ8"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=NLvWDzQ8">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "NLvWDzQ8",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-advisor-ovens-1567-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Advisor - Steam Ovens",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=SH1wZ0KL"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=SH1wZ0KL">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "SH1wZ0KL",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-advisor-steam-ovens-1568-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Advisor - Vacuums",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=DxbL7k2g"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=DxbL7k2g">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "DxbL7k2g",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-advisor-vacuums-1569-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Advisor - Washing Machines ",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=ZzrxMdK5"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=ZzrxMdK5">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "ZzrxMdK5",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-advisor-washing-machines-1570-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Filter - Coffee Machines",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=2f3d46w0"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=2f3d46w0">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "2f3d46w0",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-filter-coffee-machines-561-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Filter - Combi Steam",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=V9kR9zcz"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=V9kR9zcz">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "V9kR9zcz",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-filter-combi-steam-571-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Filter - Cooker  Hoods",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=FRD3ZJt3"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=FRD3ZJt3">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "FRD3ZJt3",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-filter-cooker-hoods-602-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Filter - Dishwashers",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=kJMs75XR"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=kJMs75XR">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "kJMs75XR",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-filter-dishwashers-765-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Filter - Dryers",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=Bx5Tc6Dl"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=Bx5Tc6Dl">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "Bx5Tc6Dl",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-filter-dryers-783-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Filter - Fridges",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=qSlf8hF4"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=qSlf8hF4">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "qSlf8hF4",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-filter-fridges-1269-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Filter - Microwave Ovens  ",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=sgZVkxb0"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=sgZVkxb0">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "sgZVkxb0",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-filter-microwave-ovens-1270-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Filter - Ovens",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=PZl1Gsr0"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=PZl1Gsr0">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "PZl1Gsr0",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-filter-ovens-1296-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Filter - Steam Ovens",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=lbc3Wddd"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=lbc3Wddd">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "lbc3Wddd",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-filter-steam-ovens-1336-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Filter - Vacuums",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=Ld7vtKcw"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=Ld7vtKcw">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "Ld7vtKcw",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-filter-vacuums-1342-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Miele Filter - Washing Machines",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/assets/js-nwd/smartassistant.nwd.all.js"></script>\n<script id="advisor-custom-javascript" type="text/javascript" src="//st.smartassistant.com/advisor-fe-web/custom-javascript?advisorCode=HFx9FPmz"></script>\n<link type="text/css" rel="stylesheet" href="//st.smartassistant.com/advisor-fe-web/css-design?advisorCode=HFx9FPmz">\n\n<script type="text/javascript">\nif(SmartAssistant){\n    smrt42_jquery(function() {\n    \n        SmartAssistant.integrate({\n            "divId" : "advisor-container",\n            "advisorContextPath" : "//st.smartassistant.com/advisor-fe-web",\n            "advisorCode" : "HFx9FPmz",\n            "disableTracking" : false\n        });\n    });\n}\n</script>'
                }]
            }],
            scope: {
                URI: {
                    include: [/miele-filter-washing-machines-1344-commercial.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Order Confirmation (Incl Reserve)",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<!--<script type="text/javascript" src="//static.criteo.net/js/ld/ld.js" async="true"></script>\n<script type="text/javascript">\nwindow.criteo_q = window.criteo_q || [];\nwindow.criteo_q.push( \n        { event: "setAccount", account: 20348 },\n        { event: "setHashedEmail", email: "#MD5-hashed email address#" },\n        { event: "setSiteType", type: "#m for mobile or t for tablet or d for desktop#" },\n        { event: "trackTransaction" , id: "#Transaction Id#", new_customer: #1 if first purchase or 0 if not#,\n            deduplication: #1 if attributed to Criteo or 0 if not#, item: [ \n              { id: "#First item id#", price: #First item unit price#, quantity: #First item quantity# },\n              { id: "#Second item id#", price: #Second item unit price#, quantity: #Second item quantity# } \n              /* #add a line for each item in the user\'s cart# */\n]});\n</script> \n-->'
                }, {
                    html: '<script>\nif (ADRUM) {\n    ADRUM.command("addUserData", "Transaction Total", _satellite.getVar("150505: Total Order Value AW"));\n}\n</script>'
                }, {
                    html: '<!-- Google Code for Currys Sale Conversion Page -->\n<script type="text/javascript">\n/* <![CDATA[ */\nvar google_conversion_id = 1053370658;\nvar google_conversion_language = "en";\nvar google_conversion_format = "3";\nvar google_conversion_color = "ffffff";\nvar google_conversion_label = "wVaUCOvCjWwQotKk9gM";\nvar google_conversion_value = "\xa3" + _satellite.getVar("150505: Total Order Value AW");  \nvar google_conversion_currency = "GBP";\nvar google_remarketing_only = false;\n/* ]]> */\n</script>\n<script type="text/javascript" src="//www.googleadservices.com/pagead/conversion.js">\n</script>\n<noscript>\n<div style="display:inline;">\n<img height="1" width="1" style="border-style:none;" alt="" src="//www.googleadservices.com/pagead/conversion/1053370658/?value=%150505: Total Order Value AW%&amp;currency_code=GBP&amp;label=wVaUCOvCjWwQotKk9gM&amp;guid=ON&amp;script=0"/>\n</div>\n</noscript>\n'
                }]
            }],
            scope: {
                URI: {
                    include: [/.order_guest_confirmation|.order-confirmation|order-reservation.html/i]
                }
            },
            event: "pagetop"
        }, {
            name: "Order Confirmation(Excl Reserve) - Currys",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript">\nconsole.log("DTM: Criteo Order Confirmation Page Tag for Currys") </script>\n\n\n<script type="text/javascript" src="//static.criteo.net/js/ld/ld.js" async="true"></script>\n<script type="text/javascript">\nvar orderID = window.universal_variable.transaction.order_id;\nvar arrayLen = universal_variable.transaction.line_items.length;\nvar itemList = [];\nvar prodSKU;\nvar prodPrice;\nvar prodQuantity;\n \nfor (var i = 0; i < arrayLen; i++) {\nprodSKU = universal_variable.transaction.line_items[i].product.id;\nprodPrice =  universal_variable.transaction.line_items[i].product.unit_sale_price;\nprodQuantity = universal_variable.transaction.line_items[i].quantity;\n \n itemList.push({ id: prodSKU, price: prodPrice, quantity:prodQuantity });\n \n}\nwindow.criteo_q = window.criteo_q || [];\nwindow.criteo_q.push(  \n        { event: "setAccount", account: 23904 },\n        { event: "setSiteType", type: "sitetype" },\n        { event: "trackTransaction" , id: orderID, new_customer: 0, item: itemList });\n\n\n</script>'
                }, {
                    html: '<script>\nvar _qevents = _qevents || []; \n\n(function() {\n  var elem = document.createElement(\'script\');\n  elem.src = (document.location.protocol == "https:" ? "https://secure" : "http://edge") + ".quantserve.com/quant.js";\n  elem.async = true;\n  elem.type = "text/javascript";\n  document.getElementsByTagName(\'head\')[0].appendChild(elem);\n})();\n\n_qevents.push({\n  qacct:"p-7cVMr8EWEG2Go",\n  labels:"%Quantcast Labels%",\n  orderid:"%150505: Order ID AW%",\n  revenue:"%150505: Total Order Value AW%"\n});\n</script>'
                }, {
                    html: "<!-- Facebook Pixel Code -->\n<script>\n  \n  var transaction = universal_variable.transaction || \"\",\n      lineItems = transaction.line_items || \"\",\n      fupids = [];\n  \n  for (var i = 0; i < lineItems.length; i++){\n    fupids.push(lineItems[i].product.id);\n  }\n  \n!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;\nn.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;\nt.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,\ndocument,'script','https://connect.facebook.net/en_US/fbevents.js');\n\n  fbq('init', '837733026317349');\n  fbq('track', 'PageView');\n  fbq('track', 'Purchase', {\n    content_ids: fupids,\n    content_type: 'product',\n    value: transaction.total, //OPTIONAL, but highly recommended\n    currency: 'GBP' //REQUIRED if you pass a value\n  });\n</script>\n\n<noscript><img height=\"1\" width=\"1\" style=\"display:none\"\nsrc=\"https://www.facebook.com/tr?id=837733026317349&ev=AddToCart&noscript=1\"\n/></noscript>\n<!-- End Facebook Pixel Code --> \n"
                }, {
                    html: "<!-- Tag for Activity Group: Order Confirmation Pages, Activity Name: Currys - Order Confirmation - Purchase, Activity ID: 2154204 -->\n<!-- URL Expected: http://www.currys.co.uk/gbuk/index.html -->\n\n<!--\nActivity ID: 2154204\nActivity Name: Currys - Order Confirmation - Purchase\nActivity Group Name: Order Confirmation Pages\n-->\n\n<!--\nStart of DoubleClick Floodlight Tag: Please do not remove\nActivity name of this tag: Currys - Order Confirmation - Purchase\nURL of the web page where the tag is expected to be placed: http://www.currys.co.uk/gbuk/index.html\nThis tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\nCreation Date: 03/31/2017\n-->\n  <script type=\"text/javascript\" src=\"//www.gstatic.com/attribution/collection/attributiontools.js\"></script>\n  <script type=\"text/javascript\">\n  if (google_attr) {\n  var attrProps = [];\n  attrProps.push({\n  });\n  var attrParam = google_attr.build(attrProps);\n  }\n  </script>\n <script type=\"text/javascript\">\n\n/**\n*\n* @param type\n* @param name\n* @returns {string}\n*/\nfunction getDataForType(type, name) {\n    var dataArray = universal_variable.transaction.line_items;\n    var newData = dataArray.map(function(item) {\n            return item.product[type];\n        }).join('|');\n    \n    return ';' + name + '=' + newData;\n}\n\n\nfunction getQtyForType(type, name) {\n    var dataArray = universal_variable.transaction.line_items;\n    var newData = dataArray.map(function(item) {\n            return item[type];\n        }).join('|');\n    \n    return '' + name + '=' + newData;\n}\n\nfunction prdFunc(){\n    var lineItems = universal_variable.transaction.line_items || [],\n        prd = {\n            \"i\": [],\n            \"p\": [],\n            \"q\": [],\n            \"c\": [],\n            \"l\": []\n        },\n        prdArr = []\n    for (var int = 0; int < lineItems.length; int++){\n        var itemNo = int+1;\n        prd.i.push('i' + itemNo + \":\" + lineItems[int].product.id);\n        prd.p.push('p' + itemNo + \":\" + lineItems[int].product.unit_sale_price);\n        prd.q.push('q' + itemNo + \":\" + lineItems[int].quantity);\n        prd.c.push('c' + itemNo + \":gb\");\n        prd.l.push('l' + itemNo + \":en\");\n        prdArr.push(prd.i[int], prd.p[int], prd.q[int], prd.c[int], prd.l[int])\n    }\n    return prdArr.join(\"|\");\n}\n\nvar u2 = getDataForType('id', 'u2');\nvar u3 = getDataForType('name', 'u3').replace(/\"/g, '&#34;');\nvar u4 = getDataForType('manufacturer', 'u4');\nvar u5 = getDataForType('category', 'u5');\nvar u6 = getDataForType('subcategory', 'u6');\nvar u7 = getDataForType('universe', 'u7');\nvar u8 = getDataForType('segment', 'u8');\nvar u9 = getDataForType('sku_code', 'u9');\nvar u10 = getDataForType('unit_sale_price', 'u10');\nvar u11 = getDataForType('unit_sale_price', 'u11');\nvar qty = getQtyForType('quantity', 'qty');\nvar total = u2 + u3 + u4 + u5 + u6 + u7 + u8 + u9 + u10 + u11;\nvar prds = prdFunc();\n   \ndocument.write('<iframe src=\"https://4672209.fls.doubleclick.net/activityi;src=4672209;type=order000;cat=curry0' + (attrParam || '') +\nqty + ';' +\n'cost=' + _satellite.getVar(\"150505: Total Order Value AW\") + ';' +\n'u1=' + _satellite.getVar(\"150826: Page category\") + total + ';' +\n'u12=' + _satellite.getVar(\"150825: Transaction - Subtotal\") + ';' +\n'u17=' + _satellite.getVar(\"150505: Order ID AW\") + ';' + \n'ord=' + _satellite.getVar(\"150505: Order ID AW\") + ';' + \n'prd=' + prds + '?\" width=\"1\" height=\"1\" frameborder=\"0\" style=\"display:none\"></iframe>');\n\n   \n</script>\n <noscript>\n  <iframe src=\"https://4672209.fls.doubleclick.net/activityi;src=4672209;type=order000;cat=curry0;\n  qty=%150825: Transaction - Quantity List%;\n  cost=%150505: Total Order Value AW%;\n  type=%150826: Page category%;\n  u2=NA;\n  u3=NA;\n  u4=NA;\n  u5=NA;\n  u6=NA;\n  u7=NA;\n  u8=NA;\n  u9=NA;\n  u10=NA;\n  u11=NA;\n  u12=%150825: Transaction - Subtotal%;\n  u17=%150505: Order ID AW%;\n  ord=1?\" width=\"1\" height=\"1\" frameborder=\"0\" style=\"display:none\"></iframe>\n </noscript>\n <!-- End of DoubleClick Floodlight Tag: Please do not remove-->"
                }, {
                    html: '<script type="text/javascript">\nvar affCookie = _satellite.getVar("Affiliate Cookie");\n\nif (affCookie === "PRICERUNNER"){\n  console.log("Adobe DTM: Pricerunner Order Confirmation Page Tag for Currys");\n  var amount = window.universal_variable.transaction.subtotal;\n  var orderID = window.universal_variable.transaction.order_id;\n  var img = new Image();\n  \n  img.src = "https://www.emjcd.com/u?AMOUNT=" + amount + "&CID=1508711&OID=" + orderID + "&TYPE=320206&CURRENCY=GBP&METHOD=IMG";\n\tdocument.body.appendChild(img); \n}\n</script>  \n\n'
                }, {
                    html: '<script type="text/javascript">\n\nvar amount = window.universal_variable.transaction.total;\nvar orderID = window.universal_variable.transaction.order_id;\n<!--\n    /* NexTag ROI Optimizer Data */\n    var id = \'4815408\';\n    var rev = amount;\n    var order = orderID;\n//-->\n\n    var affCookie = _satellite.getVar("Affiliate Cookie");\n  \t\n  if (affCookie === "NEXTAG"){\n\t\tconsole.log("Adobe DTM: Nextag Order Confirmation Page Pixel for Currys");\n  \tdocument.write(\'<scr\'+\'ipt type="text/javascript" src="https://imgsrv.nextag.com/imagefiles/includes/roitrack.js"></scr\'+\'ipt>\');\n  }\n</script>\n\n\n'
                }, {
                    html: '<script type="text/javascript">\nvar affCookie = _satellite.getVar("Affiliate Cookie");\n  \nif (affCookie === "KELKOO"){\n\n  console.log("Adobe DTM: Kellkoo Order Confirmation Page Tag for Currys");\n  var amount = window.universal_variable.transaction.subtotal;\n  var orderID = window.universal_variable.transaction.order_id;\n  var orderCurr = window.universal_variable.transaction.currency;\n  \n  var img = new Image();\n    \n  img.src = "https://tbs.tradedoubler.com/report?organization=1471109&event=241999&orderNumber=" + orderID + "&orderValue=" + amount + "&currency=GBP";\n\tdocument.body.appendChild(img);  \n}\n</script>  '
                }, {
                    html: '\n\n\t\n<script type="text/javascript">\nvar affCookie = _satellite.getVar("Affiliate Cookie");\n  \nif (affCookie == "AWIN"){\n  console.log("Adobe DTM: AWIN Order Confirmation Page Tag for Currys");\n\n\t//Data Mapping - Order Level//\n  var advertiserID = "1599"; //ID is specific to Currys\n  var orderRef = window.universal_variable.transaction.order_id;\n  var voucherAmount = window.universal_variable.transaction.voucher_discount;\n  var salesTotal = window.universal_variable.transaction.subtotal;\n  if (voucherAmount == 0) {\n\t  var salesAmount = (salesTotal).toFixed(2);\n  \t} else {\n\t  var salesAmount = (salesTotal / 1.2).toFixed(2);\n  \t}\n  var currency = window.universal_variable.transaction.currency;\n  var voucherCode = window.universal_variable.transaction.voucher;\n  var channel = "AWIN"; //Defaulted to AWIN per dedupe cookie validation\n  var orderType = window.universal_variable.page.category;\n  var isTest = 0; //test =1; production =0;\n  \n  //Format String for AWIN.Tracking.Sale.parts//\n\n\t//Initialize variables\n\tvar productList = "";\n\tvar arrayLen = universal_variable.transaction.line_items.length;\n\tvar catPriceList = {};\n\t\n\t\n\t//Product Tracking Form Header//\n  \tdocument.write(\'<form style="display: none;" name="aw_basket_form">\\r\\n\');\n  \tdocument.write(\'<textarea wrap="physical" id="aw_basket">\\r\\n\');\n\t\n\t//Step through product line items and populate a product object with format market:market_total\n\tfor (var i = 0; i < arrayLen; i++) {\n\t   \n\t   //Product Line Details\n\t   var productId = universal_variable.transaction.line_items[i].product.id;\n\t   var productName = universal_variable.transaction.line_items[i].product.name;\n\t   var productItemPrice = universal_variable.transaction.line_items[i].product.unit_sale_price;\n\t   var productItemPriceExVat = Math.round((productItemPrice / 1.2) * 100) /100;\n\t   var productQty = universal_variable.transaction.line_items[i].quantity;\n\t   var productSKU = universal_variable.transaction.line_items[i].product.sku_code;\n// \t   var comGroupCode = universal_variable.transaction.line_items[i].product.segment;\n\t   var productCat = universal_variable.transaction.line_items[i].product.category;\n\t   var productSubCat = universal_variable.transaction.line_items[i].product.subcategory; \n\t   var productSeg = universal_variable.transaction.line_items[i].product.segment;\n\t   if (orderType == "Confirmation RC") {\n\t   \t\tvar comGroupCode = "CAS-" + productSubCat;\n  \t\t\t} else {\n  \t\t\tvar comGroupCode = productSubCat;\n  \t\t\t}\n\t   \n\t   \n      //Product Tracking Form Product Lines\n \t  document.write(\'AW:P|1599|\'+orderRef+\'|\'+productId+\'|\'+productName+\'|\'+productItemPriceExVat+\'|\'+productQty+\'|\'+productSKU+\'|\'+comGroupCode+\'|\'+productCat+\'\\r\\n\');\n\n\t  \n\t\t \n\t\tif (orderType =="Confirmation RC") {\n\t\t\t\n\t\t  //Build Segment:Price Object\n\t\t  if (universal_variable.transaction.line_items[i].product.subcategory in catPriceList){\n\t\t  catPriceList[universal_variable.transaction.line_items[i].product.subcategory] = productItemPriceExVat + catPriceList[universal_variable.transaction.line_items[i].product.subcategory];\n\t  \t\t}else{\n\t  \t\tcatPriceList[universal_variable.transaction.line_items[i].product.subcategory] = productItemPriceExVat;\n\t  \t\t}\n\t  \t} else {\n\t\t  \n\t\t  //Build Segment:Price Object\n\t\t  if (universal_variable.transaction.line_items[i].product.subcategory in catPriceList){\n\t\t  catPriceList[universal_variable.transaction.line_items[i].product.subcategory] = productItemPriceExVat + catPriceList[universal_variable.transaction.line_items[i].product.subcategory];\n\t  \t\t}else{\n\t  \t\tcatPriceList[universal_variable.transaction.line_items[i].product.subcategory] = productItemPriceExVat;\n\t  \t\t}\t\n\t\t  \t\n\t\t  \t\n\t  \t}\n\t  \t\t\n\t\n\t\n\t\n\t  \n\t}\n\t\n\t//Product Tracking Form Footer\n\tdocument.write(\'</textarea>\\r\\n\');\n  \tdocument.write(\'</form>\\r\\n\');\n\t\n\t\n\t\t\n\t//Initialize variables\n\tvar i = 0;\n\tvar catArrayLen = Object.keys(catPriceList).length;\n\t\n\t//Step through Segment:Price Object and format string for Sale.parts\n\tfor (var prop in catPriceList){\n\ti++;\n\tproductList += prop + ":" + catPriceList[prop];\n\t  \n\tif (i != catArrayLen){\n\tproductList += \'|\';\n\t}\n\t}\n\t\t\n\n  \n  //<![CDATA[\t\n\t\n  //Conversion Tag//\n\tvar AWIN = {};\n\tAWIN.Tracking = {};\n\tAWIN.Tracking.Sale = {};\n\t\n  // Set your transaction parameters //\n\tAWIN.Tracking.Sale.amount = salesAmount;\n\tAWIN.Tracking.Sale.channel = channel;\n\tAWIN.Tracking.Sale.orderRef = orderRef; \n\tAWIN.Tracking.Sale.parts = productList;\n\tAWIN.Tracking.Sale.currency = currency;\n\tAWIN.Tracking.Sale.voucher = voucherCode;\n\tAWIN.Tracking.Sale.test = isTest;\n\t//]]>\n  \n  \n//Fall Back Conversion Pixel//\nvar img = new Image();\nimg.src = "https://www.awin1.com/sread.img?tt=ns&tv=2&merchant=1599&amount="+salesAmount+"&ch=AWIN&parts="+productList+"&ref="+orderRef+"&cr="+currency+"&vc="+voucherCode+"&testmode="+isTest+"";\ndocument.body.appendChild(img); \n \t\n  \n  \n\n  document.write(\'<scr\'+\'ipt type="text/javascript" defer="defer" src="https://www.dwin1.com/1599.js"></scr\'+\'ipt>\');\n  \n}  \n</script>\n\n'
                }, {
                    html: '<script type="text/javascript">\nvar affCookie = _satellite.getVar("Affiliate Cookie");\n\n  if (affCookie === "BECOME"){\n\n  console.log("Adobe DTM: Connexity (Become) Order Confirmation Page Tag for Currys");\n  var amount = window.universal_variable.transaction.total;\n  var orderID = window.universal_variable.transaction.order_id;\n  \n  var img = new Image();\n    \n  img.src = "https://www.bizrate.com/roi/index.xpml?mid=82438&cust_type=&order_id=" + orderID + "&order_value=" + amount + "&currency=GBP";\n\tdocument.body.appendChild(img);  \n}\n</script>  '
                }, {
                    html: "<script type=\"text/javascript\">\nconsole.log(\"Adobe DTM: eBay Order Confirmation Page Tag for Currys\");\n\nvar _roi = _roi || [];\n\n//Initilize Varibles//\nvar orderRef = window.universal_variable.transaction.order_id;\nvar salesAmount = window.universal_variable.transaction.subtotal;\nvar arrayLen = window.universal_variable.transaction.line_items.length;\n\n// Step 1: add base order details\n\n_roi.push(['_setMerchantId', '439291']); // required\n_roi.push(['_setOrderId', orderRef]); // unique customer order ID\n_roi.push(['_setOrderAmount', salesAmount]); // order total without tax and shipping\n_roi.push(['_setOrderNotes', '']); // notes on order, up to 50 characters\n\n// Step 2: add every item in the order\n// where your e-commerce engine loops through each item in the cart and prints out _addItem for each\n// please note that the order of the values must be followed to ensure reporting accuracy\n\n\n//Step through product line items and print out _addItem\nfor (var i = 0; i < arrayLen; i++) {\n\n//Product Line Details\n//var productId = universal_variable.transaction.line_items[i].product.id;\nvar productName = window.universal_variable.transaction.line_items[i].product.name;\nvar productItemPrice = window.universal_variable.transaction.line_items[i].product.unit_sale_price;\nvar productQty = window.universal_variable.transaction.line_items[i].quantity;\nvar productSKU = window.universal_variable.transaction.line_items[i].product.sku_code;\n//var comGroupCode = universal_variable.transaction.line_items[i].product.segment +':'+ universal_variable.transaction.line_items[i].subtotal;\n//var productCat = universal_variable.transaction.line_items[i].product.category;\nvar productSeg = window.universal_variable.transaction.line_items[i].product.segment\n  \n_roi.push(['_addItem', \nproductSKU, // Merchant sku\nproductName, // Product name\n'', // Category id - NOT SET\nproductSeg, // Category name\nproductItemPrice, // Unit price\nproductQty // Item quantity\n]);\n}\n\n// Step 3: submit transaction to ECN ROI tracker\n\n_roi.push(['_trackTrans']);\n</script>\n\n<script type=\"text/javascript\" src=\"https://stat.dealtime.com/ROI/ROI2.js\"></script>"
                }, {
                    html: '\n\n\t\n<script type="text/javascript">\n\nconsole.log("Adobe DTM: Intelligent Reach Order Confirmation Page Tag for Currys");\n\n  //Data Mapping//\n  var _OrderId_ = window.universal_variable.transaction.order_id;\n  var _OrderTotal_ = window.universal_variable.transaction.total;\n  var _ItemCount_ = window.universal_variable.transaction.line_items.length;\n  var _NewCustomer_ = false;\n  var _PurchasedItems_ = (function(){\n  \t\tvar a = [];\n\t   \t for(i=0;i<window.universal_variable.transaction.line_items.length;i++){\n\t   \t var b = window.universal_variable.transaction.line_items[i].product.id;\n\t   \t a.push(b);\n\t    }\n\t   \t return a.join("|");\n\t\t})();\n  var _PurchasedItemQuantities_ = (function(){\n  \t\tvar a = [];\n\t\t for(i=0;i<window.universal_variable.transaction.line_items.length;i++){\n\t\t var b = window.universal_variable.transaction.line_items[i].quantity;\n\t\t a.push(b);\n    \t}\n\t\t return a.join("|");\n\t\t})();\n  var _PurchasedItemPrices_ = (function(){\n  \t\tvar a = [];\n\t     for(i=0;i<window.universal_variable.transaction.line_items.length;i++){\n\t\t var b = window.universal_variable.transaction.line_items[i].subtotal;\n\t\t a.push(b);\n    \t}\n\t\t return a.join("|");\n\t\t })();\n  var _VoucherCode_ = window.universal_variable.transaction.voucher;\n  var _LastAffiliateCode_ = _satellite.getVar("Affiliate Cookie");\n  console.log("Affiliate Cookie: "+_LastAffiliateCode_);\n  var _InstorePickup_ = false;\n  istCompanyId="BEC25C7E-CBCD-460D-81D5-A25372D2E3D7";\n  istOrderId=_OrderId_;\n  istTotal=_OrderTotal_;\n  istItemCount=_ItemCount_;\n  istNewCustomer=_NewCustomer_;\n  istPurchasedItems=_PurchasedItems_;\n  istPurchasedItemQuantities=_PurchasedItemQuantities_;\n  istPurchasedItemPrices=_PurchasedItemPrices_;\n  istInstorePickup=_InstorePickup_;\n  istVoucherCode=_VoucherCode_;\n  istLastAffiliateCode=_LastAffiliateCode_;\n  istUserDefinedFieldOne="_UserDefinedFieldOne_";\n  istUserDefinedFieldTwo="_UserDefinedFieldTwo_";\n  istUserDefinedFieldThree="_UserDefinedFieldThree_";\nconsole.log("Variables Set");\n\n</script>\n<script type="text/javascript" src="//www.ist-track.com/ProcessPurchaseJavaScript.ashx?id=BEC25C7E-CBCD-460D-81D5-A25372D2E3D7&useDom=1"></script>\n\n<script type="text/javascript">\n\nconsole.log("Script Executed");\n</script>\n\n'
                }]
            }, {
                command: "loadBlockingScript",
                arguments: [{
                    sequential: !0,
                    scripts: [{
                        src: "satellite-561726cd3034630017000e28.js"
                    }]
                }]
            }, {
                command: "loadIframe",
                arguments: [{
                    pages: [{
                        src: "satellite-57bae56364746d7a9c003756.html",
                        data: []
                    }]
                }]
            }],
            conditions: [function() {
                if (currSite = document.location.host, currSite.indexOf("fo-currys.fo.") > -1 || currSite.indexOf("currys.co.uk") > -1) {
                    var e = document.location.href;
                    if (e.indexOf("order-confirmation.html") > -1 || e.indexOf("/order_guest_confirmation/") > -1) return !0
                }
            }],
            event: "pagebottom"
        }, {
            name: "Order Confirmation(Excl Reserve) - PC World",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: "<!-- Tag for Activity Group: Order Confirmation Pages, Activity Name: PC World - Order Confirmation - Purchase, Activity ID: 2153910 -->\n<!-- URL Expected: http://www.pcworld.co.uk/gbuk/index.html -->\n\n<!--\nActivity ID: 2153910\nActivity Name: PC World - Order Confirmation - Purchase\nActivity Group Name: Order Confirmation Pages\n-->\n\n<!--\nStart of DoubleClick Floodlight Tag: Please do not remove\nActivity name of this tag: PC World - Order Confirmation - Purchase\nURL of the web page where the tag is expected to be placed: http://www.pcworld.co.uk/gbuk/index.html\nThis tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\nCreation Date: 03/31/2017\n-->\n  <script type=\"text/javascript\" src=\"//www.gstatic.com/attribution/collection/attributiontools.js\"></script>\n  <script type=\"text/javascript\">\n  if (google_attr) {\n  var attrProps = [];\n  attrProps.push({\n  });\n  var attrParam = google_attr.build(attrProps);\n  }\n  </script>\n <script type=\"text/javascript\">\n\n/**\n*\n* @param type\n* @param name\n* @returns {string}\n*/\nfunction getDataForType(type, name) {\n    var dataArray = universal_variable.transaction.line_items;\n    var newData = dataArray.map(function(item) {\n            return item.product[type];\n        }).join('|');\n    \n    return ';' + name + '=' + newData;\n}\n\n\nfunction getQtyForType(type, name) {\n    var dataArray = universal_variable.transaction.line_items;\n    var newData = dataArray.map(function(item) {\n            return item[type];\n        }).join('|');\n    \n    return '' + name + '=' + newData;\n}\n\nfunction prdFunc(){\n    var lineItems = universal_variable.transaction.line_items || [],\n        prd = {\n            \"i\": [],\n            \"p\": [],\n            \"q\": [],\n            \"c\": [],\n            \"l\": []\n        },\n        prdArr = []\n    for (var int = 0; int < lineItems.length; int++){\n        var itemNo = int+1;\n        prd.i.push('i' + itemNo + \":\" + lineItems[int].product.id);\n        prd.p.push('p' + itemNo + \":\" + lineItems[int].product.unit_sale_price);\n        prd.q.push('q' + itemNo + \":\" + lineItems[int].quantity);\n        prd.c.push('c' + itemNo + \":gb\");\n        prd.l.push('l' + itemNo + \":en\");\n        prdArr.push(prd.i[int], prd.p[int], prd.q[int], prd.c[int], prd.l[int])\n    }\n    return prdArr.join(\"|\");\n}\n\nvar u2 = getDataForType('id', 'u2');\nvar u3 = getDataForType('name', 'u3').replace(/\"/g, '&#34;');\nvar u4 = getDataForType('manufacturer', 'u4');\nvar u5 = getDataForType('category', 'u5');\nvar u6 = getDataForType('subcategory', 'u6');\nvar u7 = getDataForType('universe', 'u7');\nvar u8 = getDataForType('segment', 'u8');\nvar u9 = getDataForType('sku_code', 'u9');\nvar u10 = getDataForType('unit_sale_price', 'u10');\nvar u11 = getDataForType('unit_sale_price', 'u11');\nvar qty = getQtyForType('quantity', 'qty');\nvar total = u2 + u3 + u4 + u5 + u6 + u7 + u8 + u9 + u10 + u11;\nvar prds = prdFunc();\n   \ndocument.write('<iframe src=\"https://4672209.fls.doubleclick.net/activityi;src=4672209;type=order000;cat=pcwor0' + (attrParam || '') +\nqty + ';' +\n'cost=' + _satellite.getVar(\"150505: Total Order Value AW\") + ';' +\n'u1=' + _satellite.getVar(\"150826: Page category\") + total + ';' +\n'u12=' + _satellite.getVar(\"150825: Transaction - Subtotal\") + ';' +\n'u17=' + _satellite.getVar(\"150505: Order ID AW\") + ';' + \n'ord=' + _satellite.getVar(\"150505: Order ID AW\") + ';' + \n'prd=' + prds + '?\" width=\"1\" height=\"1\" frameborder=\"0\" style=\"display:none\"></iframe>');\n\n   \n</script>\n <noscript>\n  <iframe src=\"https://4672209.fls.doubleclick.net/activityi;src=4672209;type=order000;cat=pcwor0;\n  qty=%150825: Transaction - Quantity List%;\n  cost=%150505: Total Order Value AW%;\n  type=%150826: Page category%;\n  u2=NA;\n  u3=NA;\n  u4=NA;\n  u5=NA;\n  u6=NA;\n  u7=NA;\n  u8=NA;\n  u9=NA;\n  u10=NA;\n  u11=NA;\n  u12=%150825: Transaction - Subtotal%;\n  u17=%150505: Order ID AW%;\n  ord=1?\" width=\"1\" height=\"1\" frameborder=\"0\" style=\"display:none\"></iframe>\n </noscript>\n <!-- End of DoubleClick Floodlight Tag: Please do not remove-->"
                }, {
                    html: '<script type="text/javascript">\n    var affCookie = _satellite.getVar("Affiliate Cookie");\n\nif (affCookie === "PRICERUNNER"){\n\n  console.log("Adobe DTM: Pricerunner Order Confirmation Page Tag for PC World");\n\n  var amount = window.universal_variable.transaction.subtotal;\n  var orderID = window.universal_variable.transaction.order_id;\n  var img = new Image();\n  \n  img.src = "https://www.emjcd.com/u?AMOUNT=" + amount + "&CID=1529902&OID=" + orderID + "&TYPE=369153&CURRENCY=GBP&METHOD=IMG";\n\tdocument.body.appendChild(img);\n}\n</script>  \n'
                }, {
                    html: '<script type="text/javascript">\n\n  var amount =   window.universal_variable.transaction.total;\n  var orderID = window.universal_variable.transaction.order_id;\n<!--\n    /* NexTag ROI Optimizer Data */\n    var id = \'652161\';\n    var rev = amount;\n    var order = orderID;\n//-->\n  var affCookie = _satellite.getVar("Affiliate Cookie");\n\n  if (affCookie === "NEXTAG"){\n  \tconsole.log("Adobe DTM: Nextag Order Confirmation Page Pixel for PC World");\n  \tdocument.write(\'<scr\'+\'ipt type="text/javascript" src="https://imgsrv.nextag.com/imagefiles/includes/roitrack.js"></scr\'+\'ipt>\');\n  }  \n  \n  \n</script>\n'
                }, {
                    html: '<script type="text/javascript">\n    var affCookie = _satellite.getVar("Affiliate Cookie");\n\n  if (affCookie === "KELKOO"){\n  console.log("Adobe DTM: Kellkoo Order Confirmation Page Tag for PC World");\n  var amount = window.universal_variable.transaction.subtotal;\n  var orderID = window.universal_variable.transaction.order_id;\n  var orderCurr = window.universal_variable.transaction.currency;\n  \n  var img = new Image();\n    \n  img.src = "https://tbs.tradedoubler.com/report?organization=1471109&event=242001&orderNumber=" + orderID + "&orderValue=" + amount + "&currency=GBP";\n\tdocument.body.appendChild(img);  \n}\n</script>  '
                }, {
                    html: '<script type="text/javascript">\n    var affCookie = _satellite.getVar("Affiliate Cookie");\n\nif (affCookie === "BECOME"){\n\n  console.log("Adobe DTM: Connexity (Become) Order Confirmation Page Tag for PC World");\n  var amount = window.universal_variable.transaction.total;\n  var orderID = window.universal_variable.transaction.order_id;\n  \n  var img = new Image();\n    \n  img.src = "https://www.bizrate.com/roi/index.xpml?mid=82578&cust_type=&order_id=" + orderID + "&order_value=" + amount + "&currency=GBP";\n\tdocument.body.appendChild(img);  \n}\n</script>  '
                }, {
                    html: '\n\n\t\n<script type="text/javascript">\nvar affCookie = _satellite.getVar("Affiliate Cookie");\n  \nif (affCookie == "AWIN"){\n  console.log("Adobe DTM: AWIN Order Confirmation Page Tag for PC World");\n\n\t//Data Mapping - Order Level//\n  var advertiserID = "1598"; //ID is specific to PC World\n  var orderRef = window.universal_variable.transaction.order_id;\n  var voucherAmount = window.universal_variable.transaction.voucher_discount;\n  var salesTotal = window.universal_variable.transaction.subtotal;\n  if (voucherAmount == 0) {\n\t  var salesAmount = (salesTotal).toFixed(2);\n  \t} else {\n\t  var salesAmount = (salesTotal / 1.2).toFixed(2);\n  \t}\n  var currency = window.universal_variable.transaction.currency;\n  var voucherCode = window.universal_variable.transaction.voucher;\n  var channel = "AWIN"; //Defaulted to AWIN per dedupe cookie validation\n  var orderType = window.universal_variable.page.category;\n  var isTest = 0; //test =1; production =0;\n  \n  //Format String for AWIN.Tracking.Sale.parts//\n\n\t//Initialize variables\n\tvar productList = "";\n\tvar arrayLen = universal_variable.transaction.line_items.length;\n\tvar catPriceList = {};\n\t\n\t\n\t//Product Tracking Form Header//\n  \tdocument.write(\'<form style="display: none;" name="aw_basket_form">\\r\\n\');\n  \tdocument.write(\'<textarea wrap="physical" id="aw_basket">\\r\\n\');\n\t\n\t//Step through product line items and populate a product object with format market:market_total\n\tfor (var i = 0; i < arrayLen; i++) {\n\t   \n\t   //Product Line Details\n\t   var productId = universal_variable.transaction.line_items[i].product.id;\n\t   var productName = universal_variable.transaction.line_items[i].product.name;\n\t   var productItemPrice = universal_variable.transaction.line_items[i].product.unit_sale_price;\n\t   var productItemPriceExVat = Math.round((productItemPrice / 1.2) * 100) /100;\n\t   var productQty = universal_variable.transaction.line_items[i].quantity;\n\t   var productSKU = universal_variable.transaction.line_items[i].product.sku_code;\n// \t   var comGroupCode = universal_variable.transaction.line_items[i].product.segment;\n\t   var productCat = universal_variable.transaction.line_items[i].product.category;\n\t   var productSubCat = universal_variable.transaction.line_items[i].product.subcategory; \n\t   var productSeg = universal_variable.transaction.line_items[i].product.segment;\n\t   if (orderType == "Confirmation RC") {\n\t   \t\tvar comGroupCode = "CAS-" + productSubCat;\n  \t\t\t} else {\n  \t\t\tvar comGroupCode = productSubCat;\n  \t\t\t}\n\t   \n\t   \n      //Product Tracking Form Product Lines\n \t  document.write(\'AW:P|1598|\'+orderRef+\'|\'+productId+\'|\'+productName+\'|\'+productItemPriceExVat+\'|\'+productQty+\'|\'+productSKU+\'|\'+comGroupCode+\'|\'+productCat+\'\\r\\n\');\n\n\t  \n\t\t \n\t\tif (orderType =="Confirmation RC") {\n\t\t\t\n\t\t  //Build Segment:Price Object\n\t\t  if (universal_variable.transaction.line_items[i].product.subcategory in catPriceList){\n\t\t  catPriceList[universal_variable.transaction.line_items[i].product.subcategory] = productItemPriceExVat + catPriceList[universal_variable.transaction.line_items[i].product.subcategory];\n\t  \t\t}else{\n\t  \t\tcatPriceList[universal_variable.transaction.line_items[i].product.subcategory] = productItemPriceExVat;\n\t  \t\t}\n\t  \t} else {\n\t\t  \n\t\t  //Build Segment:Price Object\n\t\t  if (universal_variable.transaction.line_items[i].product.subcategory in catPriceList){\n\t\t  catPriceList[universal_variable.transaction.line_items[i].product.subcategory] = productItemPriceExVat + catPriceList[universal_variable.transaction.line_items[i].product.subcategory];\n\t  \t\t}else{\n\t  \t\tcatPriceList[universal_variable.transaction.line_items[i].product.subcategory] = productItemPriceExVat;\n\t  \t\t}\t\n\t\t  \t\n\t\t  \t\n\t  \t}\n\t  \t\t\n\t\n\t\n\t\n\t  \n\t}\n\t\n\t//Product Tracking Form Footer\n\tdocument.write(\'</textarea>\\r\\n\');\n  \tdocument.write(\'</form>\\r\\n\');\n\t\n\t\n\t\t\n\t//Initialize variables\n\tvar i = 0;\n\tvar catArrayLen = Object.keys(catPriceList).length;\n\t\n\t//Step through Segment:Price Object and format string for Sale.parts\n\tfor (var prop in catPriceList){\n\ti++;\n\tproductList += prop + ":" + catPriceList[prop];\n\t  \n\tif (i != catArrayLen){\n\tproductList += \'|\';\n\t}\n\t}\n\t\t\n\n  \n  //<![CDATA[\t\n\t\n  //Conversion Tag//\n\tvar AWIN = {};\n\tAWIN.Tracking = {};\n\tAWIN.Tracking.Sale = {};\n\t\n  // Set your transaction parameters //\n\tAWIN.Tracking.Sale.amount = salesAmount;\n\tAWIN.Tracking.Sale.channel = channel;\n\tAWIN.Tracking.Sale.orderRef = orderRef; \n\tAWIN.Tracking.Sale.parts = productList;\n\tAWIN.Tracking.Sale.currency = currency;\n\tAWIN.Tracking.Sale.voucher = voucherCode;\n\tAWIN.Tracking.Sale.test = isTest;\n\t//]]>\n  \n  \n//Fall Back Conversion Pixel//\nvar img = new Image();\nimg.src = "https://www.awin1.com/sread.img?tt=ns&tv=2&merchant=1598&amount="+salesAmount+"&ch=AWIN&parts="+productList+"&ref="+orderRef+"&cr="+currency+"&vc="+voucherCode+"&testmode="+isTest+"";\ndocument.body.appendChild(img); \n \t\n  \n  \n\n  document.write(\'<scr\'+\'ipt type="text/javascript" defer="defer" src="https://www.dwin1.com/1598.js"></scr\'+\'ipt>\');\n  \n}  \n</script>\n\n'
                }, {
                    html: "<script type=\"text/javascript\">\nconsole.log(\"Adobe DTM: eBay Order Confirmation Page Tag for PC World\");\n\nvar _roi = _roi || [];\n\n//Initilize Varibles//\nvar orderRef = window.universal_variable.transaction.order_id;\nvar salesAmount = window.universal_variable.transaction.subtotal;\nvar arrayLen = window.universal_variable.transaction.line_items.length;\n\n// Step 1: add base order details\n\n_roi.push(['_setMerchantId', '439293']); // required\n_roi.push(['_setOrderId', orderRef]); // unique customer order ID\n_roi.push(['_setOrderAmount', salesAmount]); // order total without tax and shipping\n_roi.push(['_setOrderNotes', '']); // notes on order, up to 50 characters\n\n// Step 2: add every item in the order\n// where your e-commerce engine loops through each item in the cart and prints out _addItem for each\n// please note that the order of the values must be followed to ensure reporting accuracy\n\n\n//Step through product line items and print out _addItem\nfor (var i = 0; i < arrayLen; i++) {\n\n//Product Line Details\n//var productId = universal_variable.transaction.line_items[i].product.id;\nvar productName = window.universal_variable.transaction.line_items[i].product.name;\nvar productItemPrice = window.universal_variable.transaction.line_items[i].product.unit_sale_price;\nvar productQty = window.universal_variable.transaction.line_items[i].quantity;\nvar productSKU = window.universal_variable.transaction.line_items[i].product.sku_code;\n//var comGroupCode = universal_variable.transaction.line_items[i].product.segment +':'+ universal_variable.transaction.line_items[i].subtotal;\n//var productCat = universal_variable.transaction.line_items[i].product.category;\nvar productSeg = window.universal_variable.transaction.line_items[i].product.segment\n  \n_roi.push(['_addItem', \nproductSKU, // Merchant sku\nproductName, // Product name\n'', // Category id - NOT SET\nproductSeg, // Category name\nproductItemPrice, // Unit price\nproductQty // Item quantity\n]);\n}\n\n// Step 3: submit transaction to ECN ROI tracker\n\n_roi.push(['_trackTrans']);\n</script>\n\n<script type=\"text/javascript\" src=\"https://stat.dealtime.com/ROI/ROI2.js\"></script>"
                }, {
                    html: '\n\n\t\n<script type="text/javascript">\n\nconsole.log("Adobe DTM: Intelligent Reach Order Confirmation Page Tag for PC World");\n\n  //Data Mapping//\n  var _OrderId_ = window.universal_variable.transaction.order_id;\n  var _OrderTotal_ = window.universal_variable.transaction.total;\n  var _ItemCount_ = window.universal_variable.transaction.line_items.length;\n  var _NewCustomer_ = false;\n  var _PurchasedItems_ = (function(){\n  \t\tvar a = [];\n\t   \t for(i=0;i<window.universal_variable.transaction.line_items.length;i++){\n\t   \t var b = window.universal_variable.transaction.line_items[i].product.id;\n\t   \t a.push(b);\n\t    }\n\t   \t return a.join("|");\n\t\t})();\n  var _PurchasedItemQuantities_ = (function(){\n  \t\tvar a = [];\n\t\t for(i=0;i<window.universal_variable.transaction.line_items.length;i++){\n\t\t var b = window.universal_variable.transaction.line_items[i].quantity;\n\t\t a.push(b);\n    \t}\n\t\t return a.join("|");\n\t\t})();\n  var _PurchasedItemPrices_ = (function(){\n  \t\tvar a = [];\n\t     for(i=0;i<window.universal_variable.transaction.line_items.length;i++){\n\t\t var b = window.universal_variable.transaction.line_items[i].subtotal;\n\t\t a.push(b);\n    \t}\n\t\t return a.join("|");\n\t\t })();\n  var _VoucherCode_ = window.universal_variable.transaction.voucher;\n  var _LastAffiliateCode_ = _satellite.getVar("Affiliate Cookie");\n  console.log("Affiliate Cookie: "+_LastAffiliateCode_);\n  var _InstorePickup_ = false;\n  istCompanyId="9A35962D-802D-4E67-9721-0A3328CA1F02";\n  istOrderId=_OrderId_;\n  istTotal=_OrderTotal_;\n  istItemCount=_ItemCount_;\n  istNewCustomer=_NewCustomer_;\n  istPurchasedItems=_PurchasedItems_;\n  istPurchasedItemQuantities=_PurchasedItemQuantities_;\n  istPurchasedItemPrices=_PurchasedItemPrices_;\n  istInstorePickup=_InstorePickup_;\n  istVoucherCode=_VoucherCode_;\n  istLastAffiliateCode=_LastAffiliateCode_;\n  istUserDefinedFieldOne="_UserDefinedFieldOne_";\n  istUserDefinedFieldTwo="_UserDefinedFieldTwo_";\n  istUserDefinedFieldThree="_UserDefinedFieldThree_";\nconsole.log("Variables Set");\n\n</script>\n<script type="text/javascript" src="//www.ist-track.com/ProcessPurchaseJavaScript.ashx?id=9A35962D-802D-4E67-9721-0A332BCA1F92&useDom=1"></script>\n\n<script type="text/javascript">\n\nconsole.log("Script Executed");\n</script>\n\n'
                }, {
                    html: '<script type="text/javascript">\nconsole.log("DTM: Criteo Order Confirmation Page Tag for PC World") </script>\n\n\n<script type="text/javascript" src="//static.criteo.net/js/ld/ld.js" async="true"></script>\n<script type="text/javascript">\nvar orderID = window.universal_variable.transaction.order_id;\nvar arrayLen = universal_variable.transaction.line_items.length;\nvar itemList = [];\nvar prodSKU;\nvar prodPrice;\nvar prodQuantity;\n \nfor (var i = 0; i < arrayLen; i++) {\nprodSKU = universal_variable.transaction.line_items[i].product.id;\nprodPrice =  universal_variable.transaction.line_items[i].product.unit_sale_price;\nprodQuantity = universal_variable.transaction.line_items[i].quantity;\n \n itemList.push({ id: prodSKU, price: prodPrice, quantity:prodQuantity });\n \n}\nwindow.criteo_q = window.criteo_q || [];\nwindow.criteo_q.push(  \n        { event: "setAccount", account: 23883 },\n        { event: "setSiteType", type: "sitetype" },\n        { event: "trackTransaction" , id: orderID, new_customer: 0, item: itemList });\n\n\n</script>'
                }]
            }, {
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-57c9aa0564746d78bb009a9c.js"
                    }]
                }]
            }],
            conditions: [function() {
                if (currSite = document.location.host, currSite.indexOf("fo-pcw.fo.") > -1 || currSite.indexOf("pcworld.co.uk") > -1) {
                    var e = document.location.href;
                    if (e.indexOf("order-confirmation.html") > -1 || e.indexOf("/order_guest_confirmation/") > -1) return !0
                }
            }],
            event: "pagebottom"
        }, {
            name: "Order Summary - Webchat Touch Commerce",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-58a1e75764746d4e8900ea98.js"
                    }]
                }]
            }],
            scope: {
                URI: {
                    include: [/order_guest_payment\/index.html|gbuk\/o\/order-payment.html /i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Product Page - Webchat Touch Commerce",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-58809cc564746d61df0008b4.js"
                    }]
                }]
            }],
            scope: {
                URI: {
                    include: ["pdt.html"]
                }
            },
            event: "pagebottom"
        }, {
            name: "Product Page Tags - Currys",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript">\n  console.log("Adobe DTM: Criteo Product Page tag for Currys")\nvar itemID = window.universal_variable.product.id\n</script>\n<script type="text/javascript" src="//static.criteo.net/js/ld/ld.js" async="true"></script>\n<script type="text/javascript">\nwindow.criteo_q = window.criteo_q || [];\nwindow.criteo_q.push(  \n        { event: "setAccount", account: 23904 },\n        { event: "setSiteType", type: "sitetype" },\n        { event: "viewItem", item: itemID }\n);\n</script>'
                }]
            }],
            conditions: [function() {
                if ((currSite = document.location.host, currSite.indexOf("fo-currys.fo.") > -1 || currSite.indexOf("currys.co.uk") > -1) && document.location.href.indexOf("-pdt.html") > -1) return !0
            }],
            event: "pagebottom"
        }, {
            name: "Product Page Tags - PC World",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript">\n  console.log("Adobe DTM: Criteo Product Page tag for PC World")\nvar itemID = window.universal_variable.product.sku_code\n</script>\n<script type="text/javascript" src="//static.criteo.net/js/ld/ld.js" async="true"></script>\n<script type="text/javascript">\nwindow.criteo_q = window.criteo_q || [];\nwindow.criteo_q.push(  \n        { event: "setAccount", account: 23883 },\n        { event: "setSiteType", type: "sitetype" },\n        { event: "viewItem", item: itemID }\n);\n</script>'
                }]
            }],
            conditions: [function() {
                if ((currSite = document.location.host, currSite.indexOf("fo-pcw.fo.") > -1 || currSite.indexOf("pcworld.co.uk") > -1) && document.location.href.indexOf("-pdt.html") > -1) return !0
            }],
            event: "pagebottom"
        }, {
            name: "PropagateTracking params to digitalData",
            trigger: [{
                command: "loadBlockingScript",
                arguments: [{
                    sequential: !0,
                    scripts: [{
                        src: "satellite-5a15ad9a64746d0bbd00c7b2.js"
                    }]
                }]
            }],
            event: "pagebottom"
        }, {
            name: "Qudini Pixel",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script>\n  var uv = universal_variable || [],\n      trans = uv.transaction || [],\n      items = trans.line_items || [],\n      orderId = trans.order_id || "",\n      resNo = _satellite.getVar("Reservation Number") || "",\n      skus = [],\n      brand = [],\n      prodName = [],\n      prodQty = [],\n      categories = [],\n      subCategories = [],\n      url = "https://app.qudini.com/api/dixons/data-collection/collect?",\n      data,\n      src;\n\n  for (var i = 0; i < items.length; i++){\n    var thisProduct = items[i].product;\n    skus.push(thisProduct.sku_code);\n    brand.push(thisProduct.manufacturer);\n    prodName.push(thisProduct.name);\n    prodQty.push(items[i].quantity);\n    categories.push(thisProduct.category);\n    subCategories.push(thisProduct.subcategory);\n  }\n\n  data = "reserveNumber=" + resNo + \n    "&ordId=" + orderId + \n    "&skus=" + skus.join("|") + \n    "&brands=" + brand.join("|") + \n    "&names=" + prodName.join("|") + \n    "&qty=" + prodQty.join("|") + \n    "&cats=" + categories.join("|") + \n    "&subCats=" + subCategories.join("|");\n\n  src = encodeURI(url + data);\n\n  document.write(\'<img src="\' + src + \'" width="1" height="1" style="display:none" />\');\n</script>'
                }]
            }],
            conditions: [function() {
                var e = _satellite.getVar("Reservation Number") || "",
                    t = ((universal_variable || "").page || "").category || "",
                    n = [{
                        no: "2844",
                        pc: "w1d 1bz"
                    }, {
                        no: "2432",
                        pc: "nw2 6lu"
                    }, {
                        no: "2388",
                        pc: "ws10 9qy"
                    }, {
                        no: "2211",
                        pc: "gu1 1ee"
                    }, {
                        no: "2324",
                        pc: "gu22 8bd"
                    }];
                if ("Confirmation RC" === t) {
                    for (var a = 0; a < n.length; a++)
                        if (e.indexOf(n[a].no) > -1) return !0
                } else {
                    if ("Confirmation PC" !== t) return !1;
                    var i = document.querySelector("div.address"),
                        r = (i.innerText || i.textContent).toLowerCase();
                    for (a = 0; a < n.length; a++)
                        if (r.indexOf(n[a].pc) > -1) return !0
                }
            }],
            event: "pagebottom"
        }, {
            name: "Reservation Confirmation Page (Currys)",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: "<!-- Tag for Activity Group: Order Confirmation Pages, Activity Name: Currys - Order Confirmation - Reserve and Collect, Activity ID: 4654412 -->\n<!-- URL Expected: http://www.currys.co.uk/gbuk/index.html -->\n\n<!--\nActivity ID: 4654412\nActivity Name: Currys - Order Confirmation - Reserve and Collect\nActivity Group Name: Order Confirmation Pages\n-->\n\n<!--\nStart of DoubleClick Floodlight Tag: Please do not remove\nActivity name of this tag: Currys - Order Confirmation - Reserve and Collect\nURL of the web page where the tag is expected to be placed: http://www.currys.co.uk/gbuk/index.html\nThis tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\nCreation Date: 03/31/2017\n-->\n  <script type=\"text/javascript\" src=\"//www.gstatic.com/attribution/collection/attributiontools.js\"></script>\n  <script type=\"text/javascript\">\n  if (google_attr) {\n  var attrProps = [];\n  attrProps.push({\n  });\n  var attrParam = google_attr.build(attrProps);\n  }\n  </script>\n <script type=\"text/javascript\">\n\n/**\n*\n* @param type\n* @param name\n* @returns {string}\n*/\nfunction getDataForType(type, name) {\n    var dataArray = universal_variable.transaction.line_items;\n    var newData = dataArray.map(function(item) {\n            return item.product[type];\n        }).join('|');\n    \n    return ';' + name + '=' + newData;\n}\n\n\nfunction getQtyForType(type, name) {\n    var dataArray = universal_variable.transaction.line_items;\n    var newData = dataArray.map(function(item) {\n            return item[type];\n        }).join('|');\n    \n    return '' + name + '=' + newData;\n}\n\nfunction prdFunc(){\n    var lineItems = universal_variable.transaction.line_items || [],\n        prd = {\n            \"i\": [],\n            \"p\": [],\n            \"q\": [],\n            \"c\": [],\n            \"l\": []\n        },\n        prdArr = []\n    for (var int = 0; int < lineItems.length; int++){\n        var itemNo = int+1;\n        prd.i.push('i' + itemNo + \":\" + lineItems[int].product.id);\n        prd.p.push('p' + itemNo + \":\" + lineItems[int].product.unit_sale_price);\n        prd.q.push('q' + itemNo + \":\" + lineItems[int].quantity);\n        prd.c.push('c' + itemNo + \":gb\");\n        prd.l.push('l' + itemNo + \":en\");\n        prdArr.push(prd.i[int], prd.p[int], prd.q[int], prd.c[int], prd.l[int])\n    }\n    return prdArr.join(\"|\");\n}\n\nvar u2 = getDataForType('id', 'u2');\nvar u3 = getDataForType('name', 'u3').replace(/\"/g, '&#34;');\nvar u4 = getDataForType('manufacturer', 'u4');\nvar u5 = getDataForType('category', 'u5');\nvar u6 = getDataForType('subcategory', 'u6');\nvar u7 = getDataForType('universe', 'u7');\nvar u8 = getDataForType('segment', 'u8');\nvar u9 = getDataForType('sku_code', 'u9');\nvar u10 = getDataForType('unit_sale_price', 'u10');\nvar u11 = getDataForType('unit_sale_price', 'u11');\nvar qty = getQtyForType('quantity', 'qty');\nvar total = u2 + u3 + u4 + u5 + u6 + u7 + u8 + u9 + u10 + u11;\nvar prds = prdFunc();\n   \ndocument.write('<iframe src=\"https://4672209.fls.doubleclick.net/activityi;src=4672209;type=order000;cat=curry00' + (attrParam || '') +\nqty + ';' +\n'cost=' + _satellite.getVar(\"150505: Total Order Value AW\") + ';' +\n'u1=' + _satellite.getVar(\"150826: Page category\") + total + ';' +\n'u12=' + _satellite.getVar(\"150825: Transaction - Subtotal\") + ';' +\n'u17=' + _satellite.getVar(\"150505: Order ID AW\") + ';' + \n'ord=' + _satellite.getVar(\"150505: Order ID AW\") + ';' + \n'prd=' + prds + '?\" width=\"1\" height=\"1\" frameborder=\"0\" style=\"display:none\"></iframe>');\n\n   \n</script>\n <noscript>\n  <iframe src=\"https://4672209.fls.doubleclick.net/activityi;src=4672209;type=order000;cat=curry00;\n  qty=%150825: Transaction - Quantity List%;\n  cost=%150505: Total Order Value AW%;\n  type=%150826: Page category%;\n  u2=NA;\n  u3=NA;\n  u4=NA;\n  u5=NA;\n  u6=NA;\n  u7=NA;\n  u8=NA;\n  u9=NA;\n  u10=NA;\n  u11=NA;\n  u12=%150825: Transaction - Subtotal%;\n  u17=%150505: Order ID AW%;\n  ord=1?\" width=\"1\" height=\"1\" frameborder=\"0\" style=\"display:none\"></iframe>\n </noscript>\n <!-- End of DoubleClick Floodlight Tag: Please do not remove-->"
                }, {
                    html: '<script type="text/javascript">\nvar affCookie = _satellite.getVar("Affiliate Cookie");\n\nif (affCookie === "PRICERUNNER"){\n  console.log("Adobe DTM: Pricerunner Reservation Confirmation Page Tag for Currys");\n  var amount = window.universal_variable.transaction.subtotal;\n  var orderID = window.universal_variable.transaction.order_id;\n  var img = new Image();\n  \n  img.src = "https://www.emjcd.com/u?AMOUNT=" + amount + "&CID=1508711&OID=" + orderID + "&TYPE=320206&CURRENCY=GBP&METHOD=IMG";\n\tdocument.body.appendChild(img); \n}\n</script>  \n\n'
                }, {
                    html: '<script type="text/javascript">\n\nvar amount = window.universal_variable.transaction.total;\nvar orderID = window.universal_variable.transaction.order_id;\n<!--\n    /* NexTag ROI Optimizer Data */\n    var id = \'4815408\';\n    var rev = amount;\n    var order = orderID;\n//-->\n\n    var affCookie = _satellite.getVar("Affiliate Cookie");\n  \t\n  if (affCookie === "NEXTAG"){\n\t\tconsole.log("Adobe DTM: Nextag Reservation Confirmation Page Pixel for Currys");\n  \tdocument.write(\'<scr\'+\'ipt type="text/javascript" src="https://imgsrv.nextag.com/imagefiles/includes/roitrack.js"></scr\'+\'ipt>\');\n  }\n</script>\n\n\n'
                }, {
                    html: '<script type="text/javascript">\nvar affCookie = _satellite.getVar("Affiliate Cookie");\n  \nif (affCookie === "KELKOO"){\n\n  console.log("Adobe DTM: Kellkoo Reservation Confirmation Page Tag for Currys");\n  var amount = window.universal_variable.transaction.subtotal;\n  var orderID = window.universal_variable.transaction.order_id;\n  var orderCurr = window.universal_variable.transaction.currency;\n  \n  var img = new Image();\n    \n  img.src = "https://tbs.tradedoubler.com/report?organization=1471109&event=241999&orderNumber=" + orderID + "&orderValue=" + amount + "&currency=GBP";\n\tdocument.body.appendChild(img);  \n}\n</script>  '
                }, {
                    html: '\n\n\t\n<script type="text/javascript">\nvar affCookie = _satellite.getVar("Affiliate Cookie");\n  \nif (affCookie == "AWIN"){\n  console.log("Adobe DTM: AWIN Reservation Confirmation Page Tag for Currys");\n\n\t//Data Mapping - Order Level//\n  var advertiserID = "1599"; //ID is specific to Currys\n  var orderRef = window.universal_variable.transaction.order_id;\n  var voucherAmount = window.universal_variable.transaction.voucher_discount;\n  var salesTotal = window.universal_variable.transaction.subtotal;\n  if (voucherAmount == 0) {\n\t  var salesAmount = (salesTotal).toFixed(2);\n  \t} else {\n\t  var salesAmount = (salesTotal / 1.2).toFixed(2);\n  \t}\n  var currency = window.universal_variable.transaction.currency;\n  var voucherCode = window.universal_variable.transaction.voucher;\n  var channel = "AWIN"; //Defaulted to AWIN per dedupe cookie validation\n  var orderType = window.universal_variable.page.category;\n  var isTest = 0; //test =1; production =0;\n  \n  //Format String for AWIN.Tracking.Sale.parts//\n\n\t//Initialize variables\n\tvar productList = "";\n\tvar arrayLen = universal_variable.transaction.line_items.length;\n\tvar catPriceList = {};\n\t\n\t\n\t//Product Tracking Form Header//\n  \tdocument.write(\'<form style="display: none;" name="aw_basket_form">\\r\\n\');\n  \tdocument.write(\'<textarea wrap="physical" id="aw_basket">\\r\\n\');\n\t\n\t//Step through product line items and populate a product object with format market:market_total\n\tfor (var i = 0; i < arrayLen; i++) {\n\t   \n\t   //Product Line Details\n\t   var productId = universal_variable.transaction.line_items[i].product.id;\n\t   var productName = universal_variable.transaction.line_items[i].product.name;\n\t   var productItemPrice = universal_variable.transaction.line_items[i].product.unit_sale_price;\n\t   var productItemPriceExVat = Math.round((productItemPrice / 1.2) * 100) /100;\n\t   var productQty = universal_variable.transaction.line_items[i].quantity;\n\t   var productSKU = universal_variable.transaction.line_items[i].product.sku_code;\n// \t   var comGroupCode = universal_variable.transaction.line_items[i].product.segment;\n\t   var productCat = universal_variable.transaction.line_items[i].product.category;\n\t   var productSubCat = universal_variable.transaction.line_items[i].product.subcategory; \n\t   var productSeg = universal_variable.transaction.line_items[i].product.segment;\n\t   if (orderType == "Confirmation RC") {\n\t   \t\tvar comGroupCode = "CAS-" + productSubCat;\n  \t\t\t} else {\n  \t\t\tvar comGroupCode = productSubCat;\n  \t\t\t}\n\t   \n\t   \n      //Product Tracking Form Product Lines\n \t  document.write(\'AW:P|1599|\'+orderRef+\'|\'+productId+\'|\'+productName+\'|\'+productItemPriceExVat+\'|\'+productQty+\'|\'+productSKU+\'|\'+comGroupCode+\'|\'+productCat+\'\\r\\n\');\n\n\t  \n\t\t \n\t\tif (orderType =="Confirmation RC") {\n\t\t\t\n\t\t  //Build Segment:Price Object\n\t\t  if (universal_variable.transaction.line_items[i].product.subcategory in catPriceList){\n\t\t  catPriceList[universal_variable.transaction.line_items[i].product.subcategory] = productItemPriceExVat + catPriceList[universal_variable.transaction.line_items[i].product.subcategory];\n\t  \t\t}else{\n\t  \t\tcatPriceList[universal_variable.transaction.line_items[i].product.subcategory] = productItemPriceExVat;\n\t  \t\t}\n\t  \t} else {\n\t\t  \n\t\t  //Build Segment:Price Object\n\t\t  if (universal_variable.transaction.line_items[i].product.subcategory in catPriceList){\n\t\t  catPriceList[universal_variable.transaction.line_items[i].product.subcategory] = productItemPriceExVat + catPriceList[universal_variable.transaction.line_items[i].product.subcategory];\n\t  \t\t}else{\n\t  \t\tcatPriceList[universal_variable.transaction.line_items[i].product.subcategory] = productItemPriceExVat;\n\t  \t\t}\t\n\t\t  \t\n\t\t  \t\n\t  \t}\n\t  \t\t\n\t\n\t\n\t\n\t  \n\t}\n\t\n\t//Product Tracking Form Footer\n\tdocument.write(\'</textarea>\\r\\n\');\n  \tdocument.write(\'</form>\\r\\n\');\n\t\n\t\n\t\t\n\t//Initialize variables\n\tvar i = 0;\n\tvar catArrayLen = Object.keys(catPriceList).length;\n\t\n\t//Step through Segment:Price Object and format string for Sale.parts\n\tfor (var prop in catPriceList){\n\ti++;\n\tproductList += "CAS-" + prop + ":" + catPriceList[prop];\n\t  \n\tif (i != catArrayLen){\n\tproductList += \'|\';\n\t}\n\t}\n\t\t\n\n  \n  //<![CDATA[\t\n\t\n  //Conversion Tag//\n\tvar AWIN = {};\n\tAWIN.Tracking = {};\n\tAWIN.Tracking.Sale = {};\n\t\n  // Set your transaction parameters //\n\tAWIN.Tracking.Sale.amount = salesAmount;\n\tAWIN.Tracking.Sale.channel = channel;\n\tAWIN.Tracking.Sale.orderRef = orderRef; \n\tAWIN.Tracking.Sale.parts = productList;\n\tAWIN.Tracking.Sale.currency = currency;\n\tAWIN.Tracking.Sale.voucher = voucherCode;\n\tAWIN.Tracking.Sale.test = isTest;\n\t//]]>\n  \n  \n//Fall Back Conversion Pixel//\nvar img = new Image();\nimg.src = "https://www.awin1.com/sread.img?tt=ns&tv=2&merchant=1599&amount="+salesAmount+"&ch=AWIN&parts="+productList+"&ref="+orderRef+"&cr="+currency+"&vc="+voucherCode+"&testmode="+isTest+"";\ndocument.body.appendChild(img); \n \t\n  \n  \n\n  document.write(\'<scr\'+\'ipt type="text/javascript" defer="defer" src="https://www.dwin1.com/1599.js"></scr\'+\'ipt>\');\n  \n}  \n</script>\n\n'
                }, {
                    html: '<script type="text/javascript">\nvar affCookie = _satellite.getVar("Affiliate Cookie");\n\n  if (affCookie === "BECOME"){\n\n  console.log("Adobe DTM: Connexity (Become) Reservation Confirmation Page Tag for Currys");\n  var amount = window.universal_variable.transaction.total;\n  var orderID = window.universal_variable.transaction.order_id;\n  \n  var img = new Image();\n    \n  img.src = "https://www.bizrate.com/roi/index.xpml?mid=82438&cust_type=&order_id=" + orderID + "&order_value=" + amount + "&currency=GBP";\n\tdocument.body.appendChild(img);  \n}\n</script>  '
                }, {
                    html: "<script type=\"text/javascript\">\nconsole.log(\"Adobe DTM: eBay Reservation Confirmation Page Tag for Currys\");\n\nvar _roi = _roi || [];\n\n//Initilize Varibles//\nvar orderRef = window.universal_variable.transaction.order_id;\nvar salesAmount = window.universal_variable.transaction.subtotal;\nvar arrayLen = window.universal_variable.transaction.line_items.length;\n\n// Step 1: add base order details\n\n_roi.push(['_setMerchantId', '439291']); // required\n_roi.push(['_setOrderId', orderRef]); // unique customer order ID\n_roi.push(['_setOrderAmount', salesAmount]); // order total without tax and shipping\n_roi.push(['_setOrderNotes', '']); // notes on order, up to 50 characters\n\n// Step 2: add every item in the order\n// where your e-commerce engine loops through each item in the cart and prints out _addItem for each\n// please note that the order of the values must be followed to ensure reporting accuracy\n\n\n//Step through product line items and print out _addItem\nfor (var i = 0; i < arrayLen; i++) {\n\n//Product Line Details\n//var productId = universal_variable.transaction.line_items[i].product.id;\nvar productName = window.universal_variable.transaction.line_items[i].product.name;\nvar productItemPrice = window.universal_variable.transaction.line_items[i].product.unit_sale_price;\nvar productQty = window.universal_variable.transaction.line_items[i].quantity;\nvar productSKU = window.universal_variable.transaction.line_items[i].product.sku_code;\n//var comGroupCode = universal_variable.transaction.line_items[i].product.segment +':'+ universal_variable.transaction.line_items[i].subtotal;\n//var productCat = universal_variable.transaction.line_items[i].product.category;\nvar productSeg = window.universal_variable.transaction.line_items[i].product.segment\n  \n_roi.push(['_addItem', \nproductSKU, // Merchant sku\nproductName, // Product name\n'', // Category id - NOT SET\nproductSeg, // Category name\nproductItemPrice, // Unit price\nproductQty // Item quantity\n]);\n}\n\n// Step 3: submit transaction to ECN ROI tracker\n\n_roi.push(['_trackTrans']);\n</script>\n\n<script type=\"text/javascript\" src=\"https://stat.dealtime.com/ROI/ROI2.js\"></script>"
                }, {
                    html: '\n\n\t\n<script type="text/javascript">\n\nconsole.log("Adobe DTM: Intelligent Reach Reservation Confirmation Page Tag for Currys");\n\n  //Data Mapping//\n  var _OrderId_ = window.universal_variable.transaction.order_id;\n  var _OrderTotal_ = window.universal_variable.transaction.total;\n  var _ItemCount_ = window.universal_variable.transaction.line_items.length;\n  var _NewCustomer_ = false;\n  var _PurchasedItems_ = (function(){\n  \t\tvar a = [];\n\t   \t for(i=0;i<window.universal_variable.transaction.line_items.length;i++){\n\t   \t var b = window.universal_variable.transaction.line_items[i].product.id;\n\t   \t a.push(b);\n\t    }\n\t   \t return a.join("|");\n\t\t})();\n  var _PurchasedItemQuantities_ = (function(){\n  \t\tvar a = [];\n\t\t for(i=0;i<window.universal_variable.transaction.line_items.length;i++){\n\t\t var b = window.universal_variable.transaction.line_items[i].quantity;\n\t\t a.push(b);\n    \t}\n\t\t return a.join("|");\n\t\t})();\n  var _PurchasedItemPrices_ = (function(){\n  \t\tvar a = [];\n\t     for(i=0;i<window.universal_variable.transaction.line_items.length;i++){\n\t\t var b = window.universal_variable.transaction.line_items[i].subtotal;\n\t\t a.push(b);\n    \t}\n\t\t return a.join("|");\n\t\t })();\n  var _VoucherCode_ = window.universal_variable.transaction.voucher;\n  var _LastAffiliateCode_ = _satellite.getVar("Affiliate Cookie");\n  console.log("Affiliate Cookie: "+_LastAffiliateCode_);\n  var _InstorePickup_ = true;\n  istCompanyId="BEC25C7E-CBCD-460D-81D5-A25372D2E3D7";\n  istOrderId=_OrderId_;\n  istTotal=_OrderTotal_;\n  istItemCount=_ItemCount_;\n  istNewCustomer=_NewCustomer_;\n  istPurchasedItems=_PurchasedItems_;\n  istPurchasedItemQuantities=_PurchasedItemQuantities_;\n  istPurchasedItemPrices=_PurchasedItemPrices_;\n  istInstorePickup=_InstorePickup_;\n  istVoucherCode=_VoucherCode_;\n  istLastAffiliateCode=_LastAffiliateCode_;\n  istUserDefinedFieldOne="_UserDefinedFieldOne_";\n  istUserDefinedFieldTwo="_UserDefinedFieldTwo_";\n  istUserDefinedFieldThree="_UserDefinedFieldThree_";\nconsole.log("Variables Set");\n\n</script>\n<script type="text/javascript" src="//www.ist-track.com/ProcessPurchaseJavaScript.ashx?id=BEC25C7E-CBCD-460D-81D5-A25372D2E3D7&useDom=1"></script>\n\n<script type="text/javascript">\n\nconsole.log("Script Executed");\n</script>\n\n'
                }, {
                    html: '<script type="text/javascript">\nconsole.log("DTM: Criteo Reservation Confirmation Page Tag for Currys") </script>\n\n\n<script type="text/javascript" src="//static.criteo.net/js/ld/ld.js" async="true"></script>\n<script type="text/javascript">\nvar orderID = window.universal_variable.transaction.order_id;\nvar arrayLen = universal_variable.transaction.line_items.length;\nvar itemList = [];\nvar prodSKU;\nvar prodPrice;\nvar prodQuantity;\n \nfor (var i = 0; i < arrayLen; i++) {\nprodSKU = universal_variable.transaction.line_items[i].product.id;\nprodPrice =  universal_variable.transaction.line_items[i].product.unit_sale_price;\nprodQuantity = universal_variable.transaction.line_items[i].quantity;\n \n itemList.push({ id: prodSKU, price: prodPrice, quantity:prodQuantity });\n \n}\nwindow.criteo_q = window.criteo_q || [];\nwindow.criteo_q.push(  \n        { event: "setAccount", account: 23904 },\n        { event: "setSiteType", type: "sitetype" },\n        { event: "trackTransaction" , id: orderID, new_customer: 0, item: itemList });\n\n\n</script>'
                }]
            }],
            conditions: [function() {
                if ((currSite = document.location.host, currSite.indexOf("fo-currys.fo.") > -1 || currSite.indexOf("currys.co.uk") > -1) && document.location.href.indexOf("order-reservation.html") > -1) return !0
            }],
            event: "pagebottom"
        }, {
            name: "Reservation Confirmation Page (PC World)",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: "<!-- Tag for Activity Group: Order Confirmation Pages, Activity Name: PC World - Order Confirmation - Reserve and Collect, Activity ID: 4660386 -->\n<!-- URL Expected: http://www.currys.co.uk/gbuk/index.html -->\n\n<!--\nActivity ID: 4660386\nActivity Name: PC World - Order Confirmation - Reserve and Collect\nActivity Group Name: Order Confirmation Pages\n-->\n\n<!--\nStart of DoubleClick Floodlight Tag: Please do not remove\nActivity name of this tag: PC World - Order Confirmation - Reserve and Collect\nURL of the web page where the tag is expected to be placed: http://www.currys.co.uk/gbuk/index.html\nThis tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\nCreation Date: 03/31/2017\n-->\n  <script type=\"text/javascript\" src=\"//www.gstatic.com/attribution/collection/attributiontools.js\"></script>\n  <script type=\"text/javascript\">\n  if (google_attr) {\n  var attrProps = [];\n  attrProps.push({\n  });\n  var attrParam = google_attr.build(attrProps);\n  }\n  </script>\n <script type=\"text/javascript\">\n\n/**\n*\n* @param type\n* @param name\n* @returns {string}\n*/\nfunction getDataForType(type, name) {\n    var dataArray = universal_variable.transaction.line_items;\n    var newData = dataArray.map(function(item) {\n            return item.product[type];\n        }).join('|');\n    \n    return ';' + name + '=' + newData;\n}\n\n\nfunction getQtyForType(type, name) {\n    var dataArray = universal_variable.transaction.line_items;\n    var newData = dataArray.map(function(item) {\n            return item[type];\n        }).join('|');\n    \n    return '' + name + '=' + newData;\n}\n\nfunction prdFunc(){\n    var lineItems = universal_variable.transaction.line_items || [],\n        prd = {\n            \"i\": [],\n            \"p\": [],\n            \"q\": [],\n            \"c\": [],\n            \"l\": []\n        },\n        prdArr = []\n    for (var int = 0; int < lineItems.length; int++){\n        var itemNo = int+1;\n        prd.i.push('i' + itemNo + \":\" + lineItems[int].product.id);\n        prd.p.push('p' + itemNo + \":\" + lineItems[int].product.unit_sale_price);\n        prd.q.push('q' + itemNo + \":\" + lineItems[int].quantity);\n        prd.c.push('c' + itemNo + \":gb\");\n        prd.l.push('l' + itemNo + \":en\");\n        prdArr.push(prd.i[int], prd.p[int], prd.q[int], prd.c[int], prd.l[int])\n    }\n    return prdArr.join(\"|\");\n}\n\nvar u2 = getDataForType('id', 'u2');\nvar u3 = getDataForType('name', 'u3').replace(/\"/g, '&#34;');\nvar u4 = getDataForType('manufacturer', 'u4');\nvar u5 = getDataForType('category', 'u5');\nvar u6 = getDataForType('subcategory', 'u6');\nvar u7 = getDataForType('universe', 'u7');\nvar u8 = getDataForType('segment', 'u8');\nvar u9 = getDataForType('sku_code', 'u9');\nvar u10 = getDataForType('unit_sale_price', 'u10');\nvar u11 = getDataForType('unit_sale_price', 'u11');\nvar qty = getQtyForType('quantity', 'qty');\nvar total = u2 + u3 + u4 + u5 + u6 + u7 + u8 + u9 + u10 + u11;\nvar prds = prdFunc();\n   \ndocument.write('<iframe src=\"https://4672209.fls.doubleclick.net/activityi;src=4672209;type=order000;cat=pcwor00' + (attrParam || '') +\nqty + ';' +\n'cost=' + _satellite.getVar(\"150505: Total Order Value AW\") + ';' +\n'u1=' + _satellite.getVar(\"150826: Page category\") + total + ';' +\n'u12=' + _satellite.getVar(\"150825: Transaction - Subtotal\") + ';' +\n'u17=' + _satellite.getVar(\"150505: Order ID AW\") + ';' + \n'ord=' + _satellite.getVar(\"150505: Order ID AW\") + ';' + \n'prd=' + prds + '?\" width=\"1\" height=\"1\" frameborder=\"0\" style=\"display:none\"></iframe>');\n\n   \n</script>\n <noscript>\n  <iframe src=\"https://4672209.fls.doubleclick.net/activityi;src=4672209;type=order000;cat=pcwor00;\n  qty=%150825: Transaction - Quantity List%;\n  cost=%150505: Total Order Value AW%;\n  type=%150826: Page category%;\n  u2=NA;\n  u3=NA;\n  u4=NA;\n  u5=NA;\n  u6=NA;\n  u7=NA;\n  u8=NA;\n  u9=NA;\n  u10=NA;\n  u11=NA;\n  u12=%150825: Transaction - Subtotal%;\n  u17=%150505: Order ID AW%;\n  ord=1?\" width=\"1\" height=\"1\" frameborder=\"0\" style=\"display:none\"></iframe>\n </noscript>\n <!-- End of DoubleClick Floodlight Tag: Please do not remove-->"
                }, {
                    html: '<script type="text/javascript">\n    var affCookie = _satellite.getVar("Affiliate Cookie");\n\nif (affCookie === "PRICERUNNER"){\n\n  console.log("Adobe DTM: Pricerunner Reservation Confirmation Page Tag for PC World");\n\n  var amount = window.universal_variable.transaction.subtotal;\n  var orderID = window.universal_variable.transaction.order_id;\n  var img = new Image();\n  \n  img.src = "https://www.emjcd.com/u?AMOUNT=" + amount + "&CID=1529902&OID=" + orderID + "&TYPE=369153&CURRENCY=GBP&METHOD=IMG";\n\tdocument.body.appendChild(img);\n}\n</script>  \n'
                }, {
                    html: '<script type="text/javascript">\n\n  var amount =   window.universal_variable.transaction.total;\n  var orderID = window.universal_variable.transaction.order_id;\n<!--\n    /* NexTag ROI Optimizer Data */\n    var id = \'652161\';\n    var rev = amount;\n    var order = orderID;\n//-->\n  var affCookie = _satellite.getVar("Affiliate Cookie");\n\n  if (affCookie === "NEXTAG"){\n  \tconsole.log("Adobe DTM: Nextag Reservation Confirmation Page Pixel for PC World");\n  \tdocument.write(\'<scr\'+\'ipt type="text/javascript" src="https://imgsrv.nextag.com/imagefiles/includes/roitrack.js"></scr\'+\'ipt>\');\n  }  \n</script>\n'
                }, {
                    html: '<script type="text/javascript">\n    var affCookie = _satellite.getVar("Affiliate Cookie");\n\n  if (affCookie === "KELKOO"){\n  console.log("Adobe DTM: Kellkoo Reservation Confirmation Page Tag for PC World");\n  var amount = window.universal_variable.transaction.subtotal;\n  var orderID = window.universal_variable.transaction.order_id;\n  var orderCurr = window.universal_variable.transaction.currency;\n  \n  var img = new Image();\n    \n  img.src = "https://tbs.tradedoubler.com/report?organization=1471109&event=242001&orderNumber=" + orderID + "&orderValue=" + amount + "&currency=GBP";\n\tdocument.body.appendChild(img);  \n}\n</script>  '
                }, {
                    html: '<script type="text/javascript">\n    var affCookie = _satellite.getVar("Affiliate Cookie");\n\nif (affCookie === "BECOME"){\n\n  console.log("Adobe DTM: Connexity (Become) Reservation Confirmation Page Tag for PC World");\n  var amount = window.universal_variable.transaction.total;\n  var orderID = window.universal_variable.transaction.order_id;\n  \n  var img = new Image();\n    \n  img.src = "https://www.bizrate.com/roi/index.xpml?mid=82578&cust_type=&order_id=" + orderID + "&order_value=" + amount + "&currency=GBP";\n\tdocument.body.appendChild(img);  \n}\n</script>  '
                }, {
                    html: '\n\n\t\n<script type="text/javascript">\nvar affCookie = _satellite.getVar("Affiliate Cookie");\n  \nif (affCookie == "AWIN"){\n  console.log("Adobe DTM: AWIN Reservation Confirmation Page Tag for PC World");\n\n\t//Data Mapping - Order Level//\n  var advertiserID = "1598"; //ID is specific to PC World\n  var orderRef = window.universal_variable.transaction.order_id;\n  var voucherAmount = window.universal_variable.transaction.voucher_discount;\n  var salesTotal = window.universal_variable.transaction.subtotal;\n  if (voucherAmount == 0) {\n\t  var salesAmount = (salesTotal).toFixed(2);\n  \t} else {\n\t  var salesAmount = (salesTotal / 1.2).toFixed(2);\n  \t}\n  var currency = window.universal_variable.transaction.currency;\n  var voucherCode = window.universal_variable.transaction.voucher;\n  var channel = "AWIN"; //Defaulted to AWIN per dedupe cookie validation\n  var orderType = window.universal_variable.page.category;\n  var isTest = 0; //test =1; production =0;\n  \n  //Format String for AWIN.Tracking.Sale.parts//\n\n\t//Initialize variables\n\tvar productList = "";\n\tvar arrayLen = universal_variable.transaction.line_items.length;\n\tvar catPriceList = {};\n\t\n\t\n\t//Product Tracking Form Header//\n  \tdocument.write(\'<form style="display: none;" name="aw_basket_form">\\r\\n\');\n  \tdocument.write(\'<textarea wrap="physical" id="aw_basket">\\r\\n\');\n\t\n\t//Step through product line items and populate a product object with format market:market_total\n\tfor (var i = 0; i < arrayLen; i++) {\n\t   \n\t   //Product Line Details\n\t   var productId = universal_variable.transaction.line_items[i].product.id;\n\t   var productName = universal_variable.transaction.line_items[i].product.name;\n\t   var productItemPrice = universal_variable.transaction.line_items[i].product.unit_sale_price;\n\t   var productItemPriceExVat = Math.round((productItemPrice / 1.2) * 100) /100;\n\t   var productQty = universal_variable.transaction.line_items[i].quantity;\n\t   var productSKU = universal_variable.transaction.line_items[i].product.sku_code;\n// \t   var comGroupCode = universal_variable.transaction.line_items[i].product.segment;\n\t   var productCat = universal_variable.transaction.line_items[i].product.category;\n\t   var productSubCat = universal_variable.transaction.line_items[i].product.subcategory; \n\t   var productSeg = universal_variable.transaction.line_items[i].product.segment;\n\t   if (orderType == "Confirmation RC") {\n\t   \t\tvar comGroupCode = "CAS-" + productSubCat;\n  \t\t\t} else {\n  \t\t\tvar comGroupCode = productSubCat;\n  \t\t\t}\n\t   \n\t   \n      //Product Tracking Form Product Lines\n \t  document.write(\'AW:P|1598|\'+orderRef+\'|\'+productId+\'|\'+productName+\'|\'+productItemPriceExVat+\'|\'+productQty+\'|\'+productSKU+\'|\'+comGroupCode+\'|\'+productCat+\'\\r\\n\');\n\n\t  \n\t\t \n\t\tif (orderType =="Confirmation RC") {\n\t\t\t\n\t\t  //Build Segment:Price Object\n\t\t  if (universal_variable.transaction.line_items[i].product.subcategory in catPriceList){\n\t\t  catPriceList[universal_variable.transaction.line_items[i].product.subcategory] = productItemPriceExVat + catPriceList[universal_variable.transaction.line_items[i].product.subcategory];\n\t  \t\t}else{\n\t  \t\tcatPriceList[universal_variable.transaction.line_items[i].product.subcategory] = productItemPriceExVat;\n\t  \t\t}\n\t  \t} else {\n\t\t  \n\t\t  //Build Segment:Price Object\n\t\t  if (universal_variable.transaction.line_items[i].product.subcategory in catPriceList){\n\t\t  catPriceList[universal_variable.transaction.line_items[i].product.subcategory] = productItemPriceExVat + catPriceList[universal_variable.transaction.line_items[i].product.subcategory];\n\t  \t\t}else{\n\t  \t\tcatPriceList[universal_variable.transaction.line_items[i].product.subcategory] = productItemPriceExVat;\n\t  \t\t}\t\n\t\t  \t\n\t\t  \t\n\t  \t}\n\t  \t\t\n\t\n\t\n\t\n\t  \n\t}\n\t\n\t//Product Tracking Form Footer\n\tdocument.write(\'</textarea>\\r\\n\');\n  \tdocument.write(\'</form>\\r\\n\');\n\t\n\t\n\t\t\n\t//Initialize variables\n\tvar i = 0;\n\tvar catArrayLen = Object.keys(catPriceList).length;\n\t\n\t//Step through Segment:Price Object and format string for Sale.parts\n\tfor (var prop in catPriceList){\n\ti++;\n\tproductList += "CAS-" + prop + ":" + catPriceList[prop];\n\t  \n\tif (i != catArrayLen){\n\tproductList += \'|\';\n\t}\n\t}\n\t\t\n\n  \n  //<![CDATA[\t\n\t\n  //Conversion Tag//\n\tvar AWIN = {};\n\tAWIN.Tracking = {};\n\tAWIN.Tracking.Sale = {};\n\t\n  // Set your transaction parameters //\n\tAWIN.Tracking.Sale.amount = salesAmount;\n\tAWIN.Tracking.Sale.channel = channel;\n\tAWIN.Tracking.Sale.orderRef = orderRef; \n\tAWIN.Tracking.Sale.parts = productList;\n\tAWIN.Tracking.Sale.currency = currency;\n\tAWIN.Tracking.Sale.voucher = voucherCode;\n\tAWIN.Tracking.Sale.test = isTest;\n\t//]]>\n  \n  \n//Fall Back Conversion Pixel//\nvar img = new Image();\nimg.src = "https://www.awin1.com/sread.img?tt=ns&tv=2&merchant=1598&amount="+salesAmount+"&ch=AWIN&parts="+productList+"&ref="+orderRef+"&cr="+currency+"&vc="+voucherCode+"&testmode="+isTest+"";\ndocument.body.appendChild(img); \n \t\n  \n  \n\n  document.write(\'<scr\'+\'ipt type="text/javascript" defer="defer" src="https://www.dwin1.com/1598.js"></scr\'+\'ipt>\');\n  \n}  \n</script>\n\n'
                }, {
                    html: "<script type=\"text/javascript\">\nconsole.log(\"Adobe DTM: eBay Reservation Confirmation Page Tag for PC World\");\n\nvar _roi = _roi || [];\n\n//Initilize Varibles//\nvar orderRef = window.universal_variable.transaction.order_id;\nvar salesAmount = window.universal_variable.transaction.subtotal;\nvar arrayLen = window.universal_variable.transaction.line_items.length;\n\n// Step 1: add base order details\n\n_roi.push(['_setMerchantId', '439293']); // required\n_roi.push(['_setOrderId', orderRef]); // unique customer order ID\n_roi.push(['_setOrderAmount', salesAmount]); // order total without tax and shipping\n_roi.push(['_setOrderNotes', '']); // notes on order, up to 50 characters\n\n// Step 2: add every item in the order\n// where your e-commerce engine loops through each item in the cart and prints out _addItem for each\n// please note that the order of the values must be followed to ensure reporting accuracy\n\n\n//Step through product line items and print out _addItem\nfor (var i = 0; i < arrayLen; i++) {\n\n//Product Line Details\n//var productId = universal_variable.transaction.line_items[i].product.id;\nvar productName = window.universal_variable.transaction.line_items[i].product.name;\nvar productItemPrice = window.universal_variable.transaction.line_items[i].product.unit_sale_price;\nvar productQty = window.universal_variable.transaction.line_items[i].quantity;\nvar productSKU = window.universal_variable.transaction.line_items[i].product.sku_code;\n//var comGroupCode = universal_variable.transaction.line_items[i].product.segment +':'+ universal_variable.transaction.line_items[i].subtotal;\n//var productCat = universal_variable.transaction.line_items[i].product.category;\nvar productSeg = window.universal_variable.transaction.line_items[i].product.segment\n  \n_roi.push(['_addItem', \nproductSKU, // Merchant sku\nproductName, // Product name\n'', // Category id - NOT SET\nproductSeg, // Category name\nproductItemPrice, // Unit price\nproductQty // Item quantity\n]);\n}\n\n// Step 3: submit transaction to ECN ROI tracker\n\n_roi.push(['_trackTrans']);\n</script>\n\n<script type=\"text/javascript\" src=\"https://stat.dealtime.com/ROI/ROI2.js\"></script>"
                }, {
                    html: '\n\n\t\n<script type="text/javascript">\n\nconsole.log("Adobe DTM: Intelligent Reach Reservation Confirmation Page Tag for PC World");\n\n  //Data Mapping//\n  var _OrderId_ = window.universal_variable.transaction.order_id;\n  var _OrderTotal_ = window.universal_variable.transaction.total;\n  var _ItemCount_ = window.universal_variable.transaction.line_items.length;\n  var _NewCustomer_ = false;\n  var _PurchasedItems_ = (function(){\n  \t\tvar a = [];\n\t   \t for(i=0;i<window.universal_variable.transaction.line_items.length;i++){\n\t   \t var b = window.universal_variable.transaction.line_items[i].product.id;\n\t   \t a.push(b);\n\t    }\n\t   \t return a.join("|");\n\t\t})();\n  var _PurchasedItemQuantities_ = (function(){\n  \t\tvar a = [];\n\t\t for(i=0;i<window.universal_variable.transaction.line_items.length;i++){\n\t\t var b = window.universal_variable.transaction.line_items[i].quantity;\n\t\t a.push(b);\n    \t}\n\t\t return a.join("|");\n\t\t})();\n  var _PurchasedItemPrices_ = (function(){\n  \t\tvar a = [];\n\t     for(i=0;i<window.universal_variable.transaction.line_items.length;i++){\n\t\t var b = window.universal_variable.transaction.line_items[i].subtotal;\n\t\t a.push(b);\n    \t}\n\t\t return a.join("|");\n\t\t })();\n  var _VoucherCode_ = window.universal_variable.transaction.voucher;\n  var _LastAffiliateCode_ = _satellite.getVar("Affiliate Cookie");\n  console.log("Affiliate Cookie: "+_LastAffiliateCode_);\n  var _InstorePickup_ = true;\n  istCompanyId="9A35962D-802D-4E67-9721-0A3328CA1F02";\n  istOrderId=_OrderId_;\n  istTotal=_OrderTotal_;\n  istItemCount=_ItemCount_;\n  istNewCustomer=_NewCustomer_;\n  istPurchasedItems=_PurchasedItems_;\n  istPurchasedItemQuantities=_PurchasedItemQuantities_;\n  istPurchasedItemPrices=_PurchasedItemPrices_;\n  istInstorePickup=_InstorePickup_;\n  istVoucherCode=_VoucherCode_;\n  istLastAffiliateCode=_LastAffiliateCode_;\n  istUserDefinedFieldOne="_UserDefinedFieldOne_";\n  istUserDefinedFieldTwo="_UserDefinedFieldTwo_";\n  istUserDefinedFieldThree="_UserDefinedFieldThree_";\nconsole.log("Variables Set");\n\n</script>\n<script type="text/javascript" src="//www.ist-track.com/ProcessPurchaseJavaScript.ashx?id=9A35962D-802D-4E67-9721-0A332BCA1F92&useDom=1"></script>\n\n<script type="text/javascript">\n\nconsole.log("Script Executed");\n</script>\n\n'
                }, {
                    html: '<script type="text/javascript">\nconsole.log("DTM: Criteo Reservation Confirmation Page Tag for PC World") </script>\n\n\n<script type="text/javascript" src="//static.criteo.net/js/ld/ld.js" async="true"></script>\n<script type="text/javascript">\nvar orderID = window.universal_variable.transaction.order_id;\nvar arrayLen = universal_variable.transaction.line_items.length;\nvar itemList = [];\nvar prodSKU;\nvar prodPrice;\nvar prodQuantity;\n \nfor (var i = 0; i < arrayLen; i++) {\nprodSKU = universal_variable.transaction.line_items[i].product.id;\nprodPrice =  universal_variable.transaction.line_items[i].product.unit_sale_price;\nprodQuantity = universal_variable.transaction.line_items[i].quantity;\n \n itemList.push({ id: prodSKU, price: prodPrice, quantity:prodQuantity });\n \n}\nwindow.criteo_q = window.criteo_q || [];\nwindow.criteo_q.push(  \n        { event: "setAccount", account: 23883 },\n        { event: "setSiteType", type: "sitetype" },\n        { event: "trackTransaction" , id: orderID, new_customer: 0, item: itemList });\n\n\n</script>'
                }]
            }],
            conditions: [function() {
                if ((currSite = document.location.host, currSite.indexOf("fo-pcw.fo.") > -1 || currSite.indexOf("pcworld.co.uk") > -1) && document.location.href.indexOf("order-reservation.html") > -1) return !0
            }],
            event: "pagebottom"
        }, {
            name: "Shopping Cart - Currys",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript">\n  console.log("Adobe DTM: Criteo Cart Page Tag for Currys") </script>\n\n<script type="text/javascript" src="//static.criteo.net/js/ld/ld.js" async="true"></script>\n<script type="text/javascript">\n\nvar arrayLen = universal_variable.basket.line_items.length;\nvar itemList = [];\nvar prodSKU;\nvar prodPrice;\nvar prodQuantity;\n \nfor (var i = 0; i < arrayLen; i++) {\nprodSKU = universal_variable.basket.line_items[i].product.id;\nprodPrice = universal_variable.basket.line_items[i].product.unit_sale_price;\nprodQuantity = universal_variable.basket.line_items[i].quantity;\n \n itemList.push({ id: prodSKU, price: prodPrice, quantity:prodQuantity });\n \n}\nwindow.criteo_q = window.criteo_q || [];\nwindow.criteo_q.push(  \n        { event: "setAccount", account: 23904 },\n        { event: "setSiteType", type: "sitetype" },\n        { event: "viewBasket", item: itemList });\n\n\n</script>'
                }, {
                    html: '<script>\nif (ADRUM) {\n    ADRUM.command("addUserData", "Basket Subtotal", _satellite.getVar("150930: Basket - total"));\n}\n</script>\n\n<script>\nif (ADRUM) {\n    ADRUM.command("addUserData", "Basket Product Name", _satellite.getVar("150930: Basket - Product Name"));\n}\n</script>\n\n<script>\nif (ADRUM) {\n    ADRUM.command("addUserData", "Basket Product Category", _satellite.getVar("150930: Basket - Product Category"));\n}\n</script>'
                }]
            }],
            conditions: [function() {
                if ((currSite = document.location.host, currSite.indexOf("fo-currys.fo.") > -1 || currSite.indexOf("currys.co.uk") > -1) && document.location.href.indexOf("basket-confirmation.html") > -1) return !0
            }],
            event: "pagebottom"
        }, {
            name: "Shopping Cart - PC World",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<script type="text/javascript">\n  console.log("Adobe DTM: Criteo Cart Page Tag for PC World") </script>\n\n<script type="text/javascript" src="//static.criteo.net/js/ld/ld.js" async="true"></script>\n<script type="text/javascript">\n\nvar arrayLen = universal_variable.basket.line_items.length;\nvar itemList = [];\nvar prodSKU;\nvar prodPrice;\nvar prodQuantity;\n \nfor (var i = 0; i < arrayLen; i++) {\nprodSKU = universal_variable.basket.line_items[i].product.sku_code;\nprodPrice = universal_variable.basket.line_items[i].product.unit_sale_price;\nprodQuantity = universal_variable.basket.line_items[i].quantity;\n \n itemList.push({ id: prodSKU, price: prodPrice, quantity:prodQuantity });\n \n}\nwindow.criteo_q = window.criteo_q || [];\nwindow.criteo_q.push(  \n        { event: "setAccount", account: 23883 },\n        { event: "setSiteType", type: "sitetype" },\n        { event: "viewBasket", item: itemList });\n</script>'
                }, {
                    html: '<script>\nif (ADRUM) {\n    ADRUM.command("addUserData", "Basket Subtotal", _satellite.getVar("150930: Basket - total"));\n}\n</script>\n\n<script>\nif (ADRUM) {\n    ADRUM.command("addUserData", "Basket Product Name", _satellite.getVar("150930: Basket - Product Name"));\n}\n</script>\n\n<script>\nif (ADRUM) {\n    ADRUM.command("addUserData", "Basket Product Category", _satellite.getVar("150930: Basket - Product Category"));\n}\n</script>'
                }]
            }],
            conditions: [function() {
                if ((currSite = document.location.host, currSite.indexOf("fo-pcw.fo.") > -1 || currSite.indexOf("pcworld.co.uk") > -1) && document.location.href.indexOf("basket-confirmation.html") > -1) return !0
            }],
            event: "pagebottom"
        }, {
            name: "Step Page - Webchat Touch Commerce",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-58a1e05964746d20120068b9.js"
                    }]
                }]
            }],
            scope: {
                URI: {
                    include: [/product_confirmation.html/i]
                }
            },
            conditions: [function() {
                if (_satellite.getVar("TouchComm - Category").length > 0 && _satellite.getVar("TouchComm - Manufacturer").length > 0) return !0
            }],
            event: "pagebottom"
        }, {
            name: "Target - Basket Page - Product data into global mbox",
            scope: {
                URI: {
                    include: [/basket-confirmation.html/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Target: Capture product details in Mbox (Category Affinity)",
            trigger: [{
                command: "loadBlockingScript",
                arguments: [{
                    sequential: !0,
                    scripts: [{
                        src: "satellite-57ada6d164746d68090012e5.js"
                    }]
                }]
            }],
            scope: {
                URI: {
                    include: [/.pdt/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Techtalk",
            trigger: [{
                command: "loadIframe",
                arguments: [{
                    pages: [{
                        src: "satellite-56ab4f5b64746d73e4001733.html",
                        data: []
                    }]
                }]
            }],
            scope: {
                subdomains: {
                    include: [/techtalk/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Trade-In Page Floodlight",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<!--\nStart of DoubleClick Floodlight Tag: Please do not remove\nActivity name of this tag: Currys - Laptop Trade-In\nURL of the web page where the tag is expected to be placed: http://www.currys.co.uk/gbuk/windows-tradein-1189-commercial.html\nThis tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\nCreation Date: 07/28/2016\n-->\n<script type="text/javascript">\nvar axel = Math.random() + "";\nvar a = axel * 10000000000000;\ndocument.write(\'<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=trade-in;cat=curry0;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=\' + a + \'?" width="1" height="1" frameborder="0" style="display:none"></iframe>\');\n</script>\n<noscript>\n<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=trade-in;cat=curry0;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>\n</noscript>\n<!-- End of DoubleClick Floodlight Tag: Please do not remove -->'
                }]
            }],
            scope: {
                URI: {
                    include: [/windows-tradein-1189/i]
                },
                domains: [/currys\.co\.uk$/i]
            },
            event: "pagebottom"
        }, {
            name: "Your Plan Main Floodlight",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '"<!--\nStart of DoubleClick Floodlight Tag: Please do not remove\nActivity name of this tag: Your Plan - Check Store\nURL of the webpage where the tag is expected to be placed: http://www.currys.co.uk/gbuk/yourplan-1347-commercial.html#stores\nCreation Date: 10/17/2016\n-->\n<script type="text/javascript">\nvar axel = Math.random() + "";\nvar a = axel * 10000000000000;\ndocument.write(\'<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=check00;cat=yourp0;u15=Your Plan Marketing;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=\' + a + \'?" width=1" height=1 frameborder=0" style="display:none"></iframe>\');\n</script>\n<noscript>\n<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=check00;cat=yourp0;u15=Your Plan Marketing;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>\n</noscript>\n<!-- End of DoubleClick..." -->'
                }]
            }],
            scope: {
                URI: {
                    include: [/yourplan-1347-commercial.html/i]
                },
                hashes: {
                    exclude: [/#stores/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "Your Plan Store Floodlight",
            trigger: [{
                command: "writeHTML",
                arguments: [{
                    html: '<!--\nStart of DoubleClick Floodlight Tag: Please do not remove\nActivity name of this tag: Your Plan - Check Store\nURL of the webpage where the tag is expected to be placed: http://www.currys.co.uk/gbuk/yourplan-1347-commercial.html#stores\nThis tag must be placed between the <body> and </body> tags, as close as possible to the opening tag.\nCreation Date: 10/17/2016\n-->\n<script type="text/javascript">\nvar axel = Math.random() + "";\nvar a = axel * 10000000000000;\ndocument.write(\'<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=check00;cat=yourp0;u15=Your Plan Marketing;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=\' + a + \'?" width="1" height="1" frameborder="0" style="display:none"></iframe>\');\n</script>\n<noscript>\n<iframe src="https://4672209.fls.doubleclick.net/activityi;src=4672209;type=check00;cat=yourp0;u15=Your Plan Marketing;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=1?" width="1" height="1" frameborder="0" style="display:none"></iframe>\n</noscript>\n<!-- End of DoubleClick..." -->'
                }]
            }],
            scope: {
                URI: {
                    include: [/\/yourplan-1347-commercial.html/i]
                },
                hashes: {
                    include: [/stores/i]
                }
            },
            event: "pagebottom"
        }, {
            name: "150505: orderConfirmPage mBox - Guest Order Confirmation AW - (Global Mbox Parameters)",
            event: "aftertoolinit",
            scope: {
                URI: {
                    include: ["order_guest_confirmation/index.html"]
                }
            },
            trigger: [{
                engine: "tnt",
                command: "addTargetPageParams",
                arguments: [{
                    paymentType: "%Universal Variable - Order - Payment Type%"
                }]
            }],
            conditions: [function() {
                return document.body.innerHTML += "<div id='targetDiv'></div>", !0
            }]
        }, {
            name: "150505: orderConfirmPage mBox - Signed in Order Confirmation AW - (Global Mbox Parameters)",
            event: "aftertoolinit",
            scope: {
                URI: {
                    include: ["order-confirmation.html"]
                }
            },
            trigger: [{
                engine: "tnt",
                command: "addTargetPageParams",
                arguments: [{
                    paymentType: "%Universal Variable - Order - Payment Type%"
                }]
            }],
            conditions: [function() {
                return document.body.innerHTML += "<div id='targetDiv'></div>", !0
            }]
        }, {
            name: "Category Affinity - Global mBox - (Global Mbox Parameters)",
            event: "aftertoolinit",
            scope: {
                URI: {
                    include: [/pdt.html/i]
                }
            },
            trigger: [{
                engine: "tnt",
                command: "addTargetPageParams",
                arguments: [{
                    "user.categoryId": "%Pathname - universe%"
                }]
            }]
        }, {
            name: "Load MA and Category into Mbox - (Global Mbox Parameters)",
            event: "aftertoolinit",
            scope: {
                URI: {
                    include: [/\/basket-confirmation.html/i]
                }
            },
            trigger: [{
                engine: "tnt",
                command: "addTargetPageParams",
                arguments: [{
                    SKU: "%150930: Basket - Product ID%"
                }]
            }],
            conditions: [function() {
                return _satellite.getVar("%160217: Basket - Service Titles%"), !0
            }]
        }, {
            name: "Marketing - Checkout - Primary Categories into mbox - (Global Mbox Parameters)",
            event: "aftertoolinit",
            scope: {
                URI: {
                    include: [/\/o\/|\/o_action\//i]
                }
            },
            trigger: [{
                engine: "tnt",
                command: "addTargetPageParams",
                arguments: [{
                    primaryCats: "%UV - Cart - Primary Categories Concat%"
                }]
            }]
        }, {
            name: "Target - Basket Page - Product data into global mbox - (Global Mbox Parameters)",
            event: "aftertoolinit",
            scope: {
                URI: {
                    include: [/basket-confirmation.html/i]
                }
            },
            trigger: [{
                engine: "tnt",
                command: "addTargetPageParams",
                arguments: [{
                    Product1Quantity: "%Basket Item 1 Quantity%",
                    Product1Price: "%Basket Item 1 Price%",
                    Product1Cat: "%Basket Item 1 Category%",
                    LineItemsLength: "%Basket Items Length%"
                }]
            }]
        }, {
            name: "Target: Capture product details in Mbox (Category Affinity) - (Global Mbox Parameters)",
            event: "aftertoolinit",
            scope: {
                URI: {
                    include: [/.pdt/i]
                }
            },
            trigger: [{
                engine: "tnt",
                command: "addTargetPageParams",
                arguments: [{
                    Product_ID: "%150826: Product ID - EB%",
                    Product_manufacturer: "%150826: Product Manufacturer - EB%",
                    Product_price: "%150826: Product Price - EB%",
                    Product_category: "%160421: Universe:Category%",
                    categoryID: "%160421: Universe:Category%"
                }]
            }]
        }],
        rules: [{
            name: "150605: Form submit Email me back in stock EB",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    type: "o",
                    linkName: "Form submit Email me back in stock",
                    setVars: {
                        prop40: "%150915: FUPID email me%"
                    },
                    addEvent: ["event103"]
                }]
            }],
            selector: ".email-when-back-form button.bt",
            eventHandlerOnElement: !0,
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "150629: Click on email me when back in stock EB",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    type: "o",
                    linkName: "Initiate - Email me when back in stock",
                    addEvent: ["event101"]
                }]
            }],
            selector: "a.email-when-back",
            eventHandlerOnElement: !0,
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "150907: Submit Delivery - Next Day Not Selected",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    type: "o",
                    linkName: "Delivery Grid Submitted",
                    addEvent: ["event106"]
                }]
            }, {
                command: "delayActivateLink"
            }],
            scope: {
                URI: {
                    include: [/order_guest_delivery|order-delivery/i]
                },
                protocols: [/https:/i]
            },
            conditions: [function() {
                return _satellite.textMatch(_satellite.getVar("150819: Next day delivery data"), "Next Day Not Selected")
            }],
            selector: ".btnShop",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "150907: Submit Delivery Grid",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    type: "o",
                    linkName: "Delivery Grid Submitted",
                    addEvent: ["event105"]
                }]
            }, {
                command: "delayActivateLink"
            }],
            scope: {
                URI: {
                    include: [/order-delivery|order_guest_delivery/i]
                },
                protocols: [/https:/i]
            },
            conditions: [function() {
                return _satellite.textMatch(_satellite.getVar("150819: Next day delivery data"), "Next Day Selected")
            }],
            selector: ".btnShop",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "150930: Title Tracking - Clicks: AW",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        t.linkTrackVars = "eVar71", t.eVar71 = t.prop4 + "|" + t.pageName + "|" + _satellite.getVar("Click Title")
                    },
                    addEvent: ["event112"]
                }]
            }, {
                command: "loadScript",
                arguments: [{
                    sequential: !0,
                    scripts: [{
                        src: "satellite-5661964964746d7dbf0015e2.js"
                    }]
                }]
            }, {
                command: "delayActivateLink"
            }],
            scope: {
                URI: {
                    include: [/u.html|commercial.html|gbuk\/index.html|c.html/i]
                }
            },
            conditions: [function(e, t) {
                function n(e, t) {
                    for (; e.parentNode;)
                        if ((e = e.parentNode).tagName === t) return e;
                    return null
                }
                var a, i = t;
                if ("A" == i.tagName) a = i.title;
                else {
                    var r = n(i, "A");
                    a = r ? r.title : "No anchor in: " + this.tagName
                }
                return _satellite.setVar("Click Title", this.title + "|" + a), !0
            }],
            selector: "section[title], nav[title], article[title], header[title], footer[title], aside[title]",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "150930: Title Tracking - Viewport 1 seconds: AW",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        eVar71: "%150723: Capture Page Type: AW%|%150723: Capture Page Name: AW%|%this.title%|Parent View"
                    },
                    addEvent: ["event113"]
                }]
            }],
            scope: {
                URI: {
                    include: [/u.html|commercial.html|gbuk\/index.html|c.html/i]
                }
            },
            selector: "section[title], nav[title], article[title], header[title], footer[title], aside[title]",
            eventHandlerOnElement: !0,
            event: "inview",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1,
            inviewDelay: 1e3
        }, {
            name: "151015: Initiate Postal Code Search",
            scope: {
                URI: {
                    include: ["pdt.html"]
                }
            },
            conditions: [function() {
                return this.onsubmit = function() {
                    var e, t, n = 0,
                        a = document.querySelector("div#product-actions");
                    "block" !== window.getComputedStyle(a).display && (a = document.querySelector("div#product-actions-touch")), e = a.querySelector("div.dcg-simple-tabs.mcd-tabs.space-b");
                    var i = setInterval(function() {
                        t = window.getComputedStyle(e), _satellite.notify("Set Interval - False"), "block" === t.display && (_satellite.notify("Set Interval - True"), _satellite.track("defaultView"), clearInterval(i)), (n += 100) >= 7e3 && (_satellite.notify("exceeded expectations"), _satellite.notify(n), clearInterval(i))
                    }, 100)
                }, !0
            }],
            selector: "form.form-reset.form-label.postcode-checker",
            event: "focus",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1,
            customEvent: "submit"
        }, {
            name: "Analytics - AB - Laptop Selector Buttons",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = _satellite.getVar("Laptop Selector Click");
                        t.linkTrackVars = "contextData.eVar107", t.contextData.eVar107 = n
                    }
                }]
            }],
            conditions: [function(e) {
                var t, n = e.target.innerText || e.target.textContent,
                    a = n.toLowerCase();
                if (a.indexOf("next") > -1 || a.indexOf("back") > -1 || a.indexOf("view results") > -1) {
                    for (var i = [], r = document.querySelectorAll("#ab-test-root div.container h2")[0], o = r.innerText || r.textContent, s = document.querySelectorAll("#ab-test-root div.container ul li.selected"), c = 0; c < s.length; c++) {
                        var l = s[c].innerText || s[c].textContent;
                        i.push(l.trim())
                    }
                    t = ["Laptop Selector", n, o, i.join(":")]
                } else {
                    var d = document.querySelectorAll("#ab-test-root div.dc-base-font strong.dc-hl");
                    t = ["Laptop Selector", n, (d.length ? d[0].innerText || d[0].textContent : "0").replace(" laptops", ""), ""]
                }
                return _satellite.setVar("Laptop Selector Click", t.join("|")), !0
            }],
            selector: "#ab-test-root button",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - AB - Laptop Selector Close",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = _satellite.getVar("Laptop Selector Click");
                        t.linkTrackVars = "contextData.eVar107", t.contextData.eVar107 = n
                    }
                }]
            }],
            conditions: [function() {
                var e = document.querySelectorAll("#ab-test-root div.progress-widget div.percent-achieved--percentage"),
                    t = e.length ? e[0].innerText || e[0].textContent : "",
                    n = document.querySelectorAll("#ab-test-root div.container h2"),
                    a = ["Laptop Selector", "Close", n.length ? n[0].innerText || n.textContent : "", t];
                return _satellite.setVar("Laptop Selector Click", a.join("|")), !0
            }],
            selector: "a#abModalContainer__close",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - AB - Laptop Selector No Results",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        t.linkTrackVars = "contextData.eVar107", t.contextData.eVar107 = "Laptop Selector|No Results Shown|0|"
                    }
                }]
            }],
            conditions: [function() {
                return !0
            }],
            selector: "#ab-test-root div[data-component='ErrorScene']",
            event: "inview",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - AB - Laptop Selector Show Results",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        t.linkTrackVars = "contextData.eVar107", t.contextData.eVar107 = "Laptop Selector|Results Shown|" + _satellite.getVar("Results Shown") + "|"
                    }
                }]
            }],
            conditions: [function() {
                var e = document.querySelectorAll("#ab-test-root div.dc-base-font strong.dc-hl"),
                    t = (e.length ? e[0].innerText || e[0].textContent : "").replace(" laptops", "");
                return _satellite.setVar("Results Shown", t), !0
            }],
            selector: '#ab-test-root div[data-component="ProductSelectorTool-ResultsScene"] div.top-products',
            event: "inview",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - AB - Laptop Selector View Product",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = _satellite.getVar("Product Clicked");
                        t.linkTrackVars = "contextData.eVar107", t.contextData.eVar107 = "Laptop Selector|Product Clicked|" + n + "|"
                    }
                }]
            }],
            conditions: [function() {
                var e = this.href.split("/"),
                    t = e[e.length - 1].split("-"),
                    n = t[t.length - 2];
                return _satellite.setVar("Product Clicked", n), !0
            }],
            selector: "#ab-test-root div.top-products-container a",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - Checkout - Voucher Code Form Initiate",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    type: "o",
                    linkName: "Voucher Code Initiate Form",
                    addEvent: ["event140"]
                }]
            }],
            selector: '#promo-code.expanded-form legend label[tabindex="0"]',
            event: "click",
            bubbleFireIfParent: !1,
            bubbleFireIfChildFired: !1,
            bubbleStop: !0
        }, {
            name: "Analytics - FoundIt - Button Clicks",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        prop55: "%foundit button%"
                    },
                    addEvent: ["event225"]
                }]
            }],
            conditions: [function() {
                var e = this.innerText || this.textContent;
                return _satellite.setVar("foundit button", e), !0
            }],
            selector: "#fi-plp-original > li > a",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - Listing Page - Flexible Credit Available Click",
            trigger: [{
                tool: ["a43b551c97a6d6ae6a8625ab786110ce"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        prop50: "Analytics - Listing Page - Flexible Credit Available Click"
                    },
                    addEvent: ["event130"]
                }]
            }],
            selector: ".online-credit-message",
            eventHandlerOnElement: !0,
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - MA - Clicks on data-interaction Attributes",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        t.linkTrackVars = "contextData.eVar94", t.linkTrackEvents = "event217", t.contextData.eVar94 = _satellite.getVar("Data Interaction Clicked"), t.events = "event217"
                    }
                }]
            }, {
                command: "delayActivateLink"
            }],
            scope: {
                URI: {
                    include: [/\/my-account.html/i]
                }
            },
            conditions: [function() {
                function e(e, t) {
                    var n = 864e5;
                    return Math.round(Math.abs((e.getTime() - t.setHours(0, 0, 0, 0)) / n))
                }
                for (var t, n = (window.digitalData || {}).user || [], a = n[n.length - 1].productsSavedForLater || [], i = this.getAttribute("data-interaction"), r = this.closest("[data-component='ProductCardFront']").id, o = r.substring(r.indexOf("--") + 2), s = new Date, c = 0; c < a.length; c++) a[c].productID === o && (t = new Date(a[c].dateSaved.replace(/(\d+)(st|nd|rd|th)/, "$1")));
                return data = o + "|Save for Later Interaction|" + i + "|" + e(t, s), _satellite.setVar("Data Interaction Clicked", data), !0
            }],
            selector: "[data-interaction]",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - MA - Custom Page Load",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackPageView",
                arguments: [{
                    setVars: {
                        pageName: "%ZTBR - 150723: Capture Page Name: AW%"
                    }
                }]
            }, {
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-59785b5b64746d65f3000fcd.js"
                    }]
                }]
            }],
            scope: {
                URI: {
                    include: ["my-account.html"]
                }
            },
            conditions: [function() {
                _satellite.getVar("document location hash");
                return "" !== s.pageName && (s.abort = !0, !0)
            }],
            event: "dataelementchange(150723: Capture Page Name: AW)",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - MA - R&C Add Email Address ",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        prop54: "My Account Interaction|Add Email Address|Link Clicked"
                    },
                    addEvent: ["event243"]
                }]
            }],
            selector: "[data-interaction='add-email-address']",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - MA - SFL - Forgot Password ",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        t.linkTrackVars = "contextData.eVar94", t.linkTrackEvents = "event175", t.contextData.eVar94 = _satellite.getVar("SFL Forgot Password"), t.events = "event175"
                    }
                }]
            }, {
                command: "delayActivateLink"
            }],
            scope: {
                URI: {
                    include: [/pdt.html/i]
                }
            },
            conditions: [function() {
                (((window.digitalData || {}).product || [])[0] || {}).productID;
                var e = ["My Account Interaction", this.getAttribute("data-interaction"), "true"];
                return _satellite.setVar("SFL Forgot Password", e.join("|")), !0
            }],
            selector: '[data-interaction="quick-signin-forgot-password"]',
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - MA - SFL Hover over share",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        t.linkTrackVars = "contextData.eVar94", t.linkTrackEvents = "event221", t.contextData.eVar94 = _satellite.getVar("Data Interaction Clicked"), t.events = "event221"
                    }
                }]
            }],
            conditions: [function() {
                function e(e, t) {
                    var n = 864e5;
                    return Math.round(Math.abs((e.getTime() - t.setHours(0, 0, 0, 0)) / n))
                }
                for (var t, n = (window.digitalData || {}).user || [], a = n[n.length - 1].productsSavedForLater || [], i = this.getAttribute("data-interaction"), r = this.closest("[data-component='ProductCardFront']").id, o = r.substring(r.indexOf("--") + 2), s = new Date, c = 0; c < a.length; c++) a[c].productID === o && (t = new Date(a[c].dateSaved.replace(/(\d+)(st|nd|rd|th)/, "$1")));
                return data = o + "|Save for Later Interaction|" + i + "|" + e(t, s), _satellite.setVar("Data Interaction Clicked", data), !0
            }],
            selector: '[data-interaction="social"]',
            event: "hover(200)",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - MA - Save For Later - Product Page Initial Click",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    type: "o",
                    linkName: "Save For Later - Product Page Initial Click",
                    addEvent: ["event222"]
                }]
            }],
            scope: {
                URI: {
                    include: ["-pdt.html"]
                }
            },
            selector: 'button[data-interaction="save-for-later-product"] ',
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - MA - Tracking Link Clicked",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = _satellite.getVar("My Account - Tracking Link Clicked").split("|");
                        t.linkTrackVars = "contextData.eVar94", t.linkTrackEvents = "event206", t.contextData.eVar94 = n[0] + "|" + n[1] + "|" + n[2], t.events = "event206"
                    }
                }]
            }],
            event: "dataelementchange(My Account - Tracking Link Clicked)",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - MCD - Add To Basket (different buttons)",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = _satellite.getVar("Add To Basket Button Data"),
                            a = "string" == typeof n ? n.split("|") : null,
                            i = Array.isArray(a) && "string" == typeof a[2] ? a[2].split(":") : [];
                        t.linkTrackVars = "contextData.eVar94", "Home Delivery" === i[0] ? "standard-delivery" === i[1] ? (t.linkTrackEvents = "event169", t.events = "event169") : (t.linkTrackEvents = "event166", t.events = "event166") : "Collection" === i[0] && ("pay-and-collect" === i[2] ? (t.linkTrackEvents = "event167", t.events = "event167") : "reserve-and-collect" === i[2] && (t.linkTrackEvents = "event168", t.events = "event168")), t.contextData.eVar94 = n
                    }
                }]
            }, {
                command: "delayActivateLink"
            }],
            conditions: [function() {
                function e(e, t) {
                    return Math.round((t - e) / 864e5)
                }
                var t = digitalData.events && digitalData.events.length > 0 ? digitalData.events[digitalData.events.length - 1] : null;
                if (t) {
                    var n = ["Product Interaction", "Add to Basket"];
                    if ("Store Locator Store Selection" === (t.eventAction || "")) n.push("Collection:" + (t.data ? t.data.storeIDSelected : "") + ":" + this.getAttribute("data-deliverytype").toLowerCase().replace(/_/g, "-") + ":");
                    else {
                        if (this.classList.value.indexOf("choose-slot") > -1) {
                            var a = (new Date).setHours(0, 0, 0, 0),
                                i = new Date(this.getAttribute("data-date")).setHours(0, 0, 0, 0);
                            n.push("Home Delivery:" + e(a, i) + ":" + this.getAttribute("data-label") + ":" + this.getAttribute("data-price"))
                        }
                        this.parentNode.parentNode.classList.value.indexOf("free-delivery-button") > -1 && n.push("Home Delivery:standard-delivery:standard-delivery:0")
                    }
                    return _satellite.setVar("Add To Basket Button Data", n.join("|")), !0
                }
                return !1
            }],
            selector: "button.choose-slot.button, #mcd-touch-tab1 button.bt.btn-primary.outline.wide, #mcd-desktop-tab1 button.bt.btn-primary.outline.wide, button.btn-primary.choose-store",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - MCD - Swatches",
            trigger: [{
                command: "delayActivateLink"
            }],
            conditions: [function() {
                var e = this.parentNode.classList.value.indexOf("active") > -1,
                    t = (this.parentNode.parentNode.children, this.innerText || this.textContent, -1),
                    n = -1;
                if (e) return !1;
                var a = setInterval(function() {
                    var e = window.digitalData || {},
                        i = (e.product || [])[0] || {},
                        r = i.availableSwatches || [],
                        o = i.productID || "",
                        c = i.currentPrice || null,
                        l = e.events || [],
                        d = l[l.length - 1] || {},
                        u = d.eventAction || "";
                    if ("swatchClick" === u) {
                        clearInterval(a);
                        for (var m = d.eventName || "", p = d.data || [], g = p.numberOfSwatches || null, v = p.chosenSwatch.replace(/&nbsp;/g, " ") || "", f = p.chosenSwatchID || "", h = p.chosenSwatchAttributeType || "", b = {}, y = {}, w = 0; w < r.length; w++) r[w].swatchID === f ? (b = r[w], n = w) : r[w].swatchID === o && (y = r[w], t = w);
                        var S = n > t ? "up" : "down",
                            L = b.swatchPrice || null,
                            k = y.swatchName || "",
                            _ = ((L - c) / c * 100).toFixed(2),
                            C = [m, u, [o, f, h, v, k, g, L, new Number(_), S].join(":")];
                        s.linkTrackEvents = "event137", s.linkTrackVars = "contextData.eVar94", s.events = "event137", s.contextData.eVar94 = C.join("|"), s.tl(!0, "o", "swatch click")
                    }
                }, 10);
                return setTimeout(function() {
                    clearInterval(a)
                }, 5e3), !0
            }],
            selector: "ul > li.dc-product-swatch > a, ul > li.dc-product-swatch > span > div.dc-tooltip > article > a.dc-product-tooltip-link",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - Open Brief Description - Listing",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = [_satellite.getVar("Brief Description fupid") + ":" + _satellite.getVar("Brief Description Segment"), "Listing Interaction", "Open Brief Description"];
                        t.linkTrackVars = "contextData.eVar94", t.contextData.eVar94 = n.join("|")
                    },
                    addEvent: ["event450"]
                }]
            }],
            conditions: [function(e) {
                function t(e, t) {
                    for (;
                        (e = e.parentElement) && e.tagName.toLowerCase() !== t;);
                    return e
                }
                var n = e.target.innerText || e.target.textContent,
                    a = (window.digitalData || {}).products || [],
                    i = {};
                if ("Brief product description" === n) {
                    for (var r = t(this, "article") || null, o = (null !== r ? r.id : "Error finding article").replace("product", ""), s = 0; s < a.length; s++) {
                        (a[s].productID || "") === o && (i = a[s])
                    }
                    var c = (i.category || {}).segment || "";
                    return _satellite.setVar("Brief Description fupid", o), _satellite.setVar("Brief Description Segment", c), !0
                }
                return !1
            }],
            selector: ".product-desc *",
            eventHandlerOnElement: !0,
            event: "click",
            bubbleFireIfParent: !1,
            bubbleFireIfChildFired: !0,
            bubbleStop: !0,
            customEvent: "copy"
        }, {
            name: "Analytics - Order Summary - Payment Methods",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        eVar29: "%DD - Cart - Payment Methods%"
                    },
                    addEvent: ["event53"]
                }]
            }],
            event: "dataelementchange(DD - Cart - Payment Methods)",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - Order Summary - What you need to apply",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    type: "o",
                    linkName: "Order Summary - What you need to apply link"
                }]
            }],
            selector: "#need-to-apply",
            eventHandlerOnElement: !0,
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - Payment Options Error",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        eVar34: "%payment option error message%",
                        prop34: "%payment option error message%"
                    },
                    addEvent: ["event174"]
                }]
            }],
            conditions: [function() {
                var e = "Payment Options|" + (this.innerText || this.textContent);
                return _satellite.setVar("payment option error message", e), !0
            }],
            selector: "div.alert.alertRequired h4",
            event: "inview",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1,
            inviewDelay: 2e3
        }, {
            name: "Analytics - Product Page - Add To Bundle",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        t.linkTrackVars = "contextData.eVar94", t.contextData.eVar94 = "Product Interaction|Add To Bundle|" + _satellite.getVar("bundle fupid")
                    }
                }]
            }],
            conditions: [function(e) {
                function t(e, t, n) {
                    for (;
                        (e = e.parentElement) && e.tagName.toLowerCase() !== t && e.className.indexOf(n) < 0;);
                    return e
                }

                function n(e, t, n) {
                    for (;
                        (e = e.parentElement) && e.tagName.toLowerCase() !== t && e.id.indexOf(n) < 0;);
                    return e
                }
                var a = n(e.target, "span", "addAccessory").id.replace("addAccessory", ""),
                    i = t(e.target, "article", "product"),
                    r = i.querySelectorAll("span.currentPrice"),
                    o = (r.length ? r[0].innerText || r[0].textContent : "").replace("\xa3", ""),
                    s = i.querySelectorAll("span.previousPrice del"),
                    c = (s.length ? s[0].innerText || s[0].textContent : "null").replace("\xa3", ""),
                    l = document.querySelectorAll(".tabCtl.active")[0],
                    d = (l.innerText || l.textContent).trim(),
                    u = "null" !== c ? Math.abs((o - c).toFixed(2)) : "No Saving",
                    m = [a, d, o, u, "null" !== c ? (u / c * 100).toFixed(0) : "No Saving"];
                return _satellite.setVar("bundle fupid", m.join(":")), !0
            }],
            selector: 'button[name="add"]',
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - Product Page - Finance Available",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        prop50: "Analytics - Product Page - Finance Available"
                    },
                    addEvent: ["event151"]
                }]
            }],
            conditions: [function() {
                return setTimeout(function() {}, 2e3), _satellite.getVar("Product Page - Flexible Credit Available").indexOf("#tab5|your-plan-information") > 1
            }],
            selector: ".product-page",
            eventHandlerOnElement: !0,
            event: "inview",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !1,
            bubbleStop: !0,
            inviewDelay: 5e3
        }, {
            name: "Analytics - Product Page - Financing Information Link Click",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        prop50: "Analytics - Product Page - Financing Information Link Click"
                    },
                    addEvent: ["event52"]
                }]
            }],
            selector: "ul.prd-credit-available > li > div > a",
            eventHandlerOnElement: !0,
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - Product Page - Remove From Bundle",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        t.linkTrackVars = "contextData.eVar94", t.contextData.eVar94 = "Product Interaction|Remove From Bundle|" + _satellite.getVar("Remove from bundle")
                    }
                }]
            }],
            conditions: [function() {
                var e = this.parentNode.querySelectorAll("input[name='sAccessoryProductId']"),
                    t = e.length ? e[0].value : "DOM Traversal Error";
                return _satellite.setVar("Remove from bundle", t), !0
            }],
            selector: 'button[name="remove"]',
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - Product Page Credit",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-5aaa79f964746d531f004bc9.js"
                    }]
                }]
            }],
            event: "dataelementchange(DD - Product - Credit JSON String)",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - SDD - Delivery Slot Expired",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        eVar34: "%SDD Error Message%",
                        prop34: "%SDD Error Messages%"
                    },
                    addEvent: ["event231"]
                }]
            }],
            conditions: [function() {
                var e = (this.innerText || this.textContent).trim(),
                    t = "delivery slot",
                    n = (window.digitalData || {}).events || [],
                    a = n[n.length - 1] || {},
                    i = a.eventName || "",
                    r = a.eventAction || "",
                    o = (a.data || {}).errorMessage || "";
                return _satellite.setVar("SDD Error Message", [i, r, o].join("|")), e.indexOf(t) > -1
            }],
            selector: "#content > div > div.col9.order-table-div > div.dc-site-currys > div > div > div",
            event: "inview",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1,
            inviewDelay: 1e3
        }, {
            name: "Analytics - SDD - Delivery Slot Selected Bandaid",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = _satellite.getVar("SDD Slot Clicked"),
                            a = ["Delivery interaction", "Delivery slot selected (click bandaid)", n],
                            i = ((window.digitalData || {}).cart || {}).sbSameDay || {},
                            r = n.split(":");
                        universal_variable.analytics = {
                            "150820: Delivery Timeslot": {
                                "CRD2-261": {
                                    SB: {
                                        sDeliveryDateChoiceSB: {
                                            availableTimeSlots: Object.keys(i).length,
                                            daysAway: "0 days",
                                            defaultDate: r[1],
                                            deliveryAvailable: Object.keys(i).length,
                                            deliveryDay: r[1],
                                            deliveryTime: r[3]
                                        }
                                    }
                                }
                            }
                        }, t.linkTrackVars = "contextData.eVar101", t.linkTrackEvents = "event228", t.contextData.eVar101 = a.join("|"), t.events = "event228"
                    }
                }]
            }],
            conditions: [function() {
                var e = this.getAttribute("data-reactid"),
                    t = this.nodeName,
                    n = (this.innerText || this.textContent).replace("\xa3", ""),
                    a = new Date,
                    i = a.getMonth() + 1,
                    r = a.getDate(),
                    o = [a.getFullYear(), (i > 9 ? "" : "0") + i, (r > 9 ? "" : "0") + r].join("/"),
                    s = 0,
                    c = "";
                if (e.indexOf("SDD") > -1) {
                    if ("BUTTON" === t)
                        for (var l = this.parentNode.parentNode, d = 0; d < l.children.length; d++) {
                            var u = l.children[d];
                            "label-container" === u.className && (c = u.innerText || u.textContent)
                        } else if (t = "A") {
                            for (var m = this.parentNode, p = 0, g = this.parentNode.parentNode.parentNode.previousSibling.children[0]; null != (m = m.previousSibling);) p++;
                            c = g.children[p].innerText || g.children[p].textContent
                        }
                    var v = [n, o, s, c];
                    return _satellite.setVar("SDD Slot Clicked", v.join(":")), !0
                }
                return !1
            }],
            selector: ".delivery-table-sdd a, .delivery-table-mobile-container button",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Analytics - Step Page Attachments",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        t.linkTrackVars = "contextData.eVar94", t.linkTrackEvents = "event218", t.contextData.eVar94 = _satellite.getVar("Step Page Attach"), t.events = "event218"
                    }
                }]
            }, {
                command: "delayActivateLink"
            }],
            conditions: [function() {
                for (var e = this.parentNode.childNodes, t = "Accessory", n = 0; n < e.length; n++)
                    if ("sFUPID" === e[n].name) return "bundle" === this.parentNode.parentNode.classList[1] && (t = "Recommended Bundle"), "ab--step-page-button--add" === this.classList[0] && (t = "AB Accessory"), _satellite.setVar("Step Page Attach", e[n].value + "|Attach Interaction|Step Page " + t), !0
            }],
            selector: "button.btn.btnShop, .ab--step-page-button--add",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Attempted Order Splitting by Address",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    type: "o",
                    linkName: "Attempt to Split Delivery for Order",
                    addEvent: ["event132"]
                }]
            }],
            scope: {
                URI: {
                    include: [/.pdt/i]
                }
            },
            selector: "#hd-postcode-info",
            event: "inview",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "CRD - Delivery Grid",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = _satellite.getVar("CRD - Delivery Grid - Data Layer");
                        t.list1 = n, t.linkTrackVars = "list1"
                    }
                }]
            }, {
                command: "delayActivateLink"
            }],
            conditions: [function() {
                return "undefined" != typeof universal_variable.analytics["150820: Delivery Timeslot"]["CRD2-261"]
            }],
            selector: 'button[name="delivery_validate"]',
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "CRD - Store Selector",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        prop46: "%CRD - Store Selector - Data Layer%"
                    }
                }]
            }],
            conditions: [function() {
                var e = $(this),
                    t = e.find("th input:radio");
                return !e.hasClass("row-disabled") && (t.is(":checked") ? (_satellite.notify(_satellite.getVar("CRD - Store Selector - Data Layer")), !0) : void 0)
            }],
            selector: "form#store-selector.submit-on-change tr",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "CRD - View More Stores - basket-confirmation.html",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    addEvent: ["event124"]
                }]
            }, {
                command: "delayActivateLink"
            }],
            scope: {
                URI: {
                    include: ["basket-confirmation.html"]
                }
            },
            conditions: [function() {
                var e = this.className.split(" ");
                return e.length > 1 && e[1].indexOf("active") > -1 && (_satellite.notify(e[1]), !0)
            }],
            selector: "button.more-stores-button",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Colour Swatch - Click",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        prop48: "%Colour Swatch - data layer%"
                    },
                    addEvent: ["event137"]
                }]
            }, {
                command: "delayActivateLink"
            }],
            selector: "dl[data-component='product-swatches'] dd:not([data-selected='true']) a",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Continue Shopping - Guest Upgrade - Element Exists",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        eVar72: "order_confirm&continue_shopping&homepage"
                    },
                    customSetup: function() {
                        _satellite.getToolsByType("sc")[0].getS().clearVars()
                    }
                }]
            }],
            conditions: [function() {
                var e = "order_confirm&continue_shopping&homepage";
                return window.location.search.indexOf(e) > -1 && "home" === s.pageName
            }],
            selector: "header#header",
            event: "elementexists",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Error Message",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !0,
                    scripts: [{
                        src: "satellite-566981ba64746d270a005c61.js"
                    }]
                }]
            }],
            selector: ".search-btn, div.suggestion-list li",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Geolocation - update datalayer",
            conditions: [function() {
                return universal_variable.analytics.searchType = "Geolocation", !0
            }],
            selector: "button.dcg-icon-location-finder",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Grid View Button Click",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    type: "o",
                    linkName: "Grid View Button Click",
                    customSetup: function(e, t) {
                        var n, a, i;
                        n = (a = window.innerWidth) > 768 ? "4x4" : a < 599 ? "2x2" : "3x3", i = "list" == _satellite.readCookie("layout") ? "List" : "Grid|" + n, t.linkTrackVars = "eVar62", t.eVar62 = i
                    },
                    addEvent: ["event108"]
                }]
            }],
            selector: "i.dcg-icon-grid-view",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "List View Button Click",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    type: "o",
                    linkName: "List View Button Click",
                    customSetup: function(e, t) {
                        var n, a, i;
                        n = (a = window.innerWidth) > 768 ? "4x4" : a < 599 ? "2x2" : "3x3", i = "list" == _satellite.readCookie("layout") ? "List" : "Grid|" + n, t.linkTrackVars = "eVar62", t.eVar62 = i
                    },
                    addEvent: ["event108"]
                }]
            }],
            selector: "i.dcg-icon-list-view",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "MCD - Price Promise - href Below Price",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    addEvent: ["event125"]
                }]
            }, {
                command: "delayActivateLink"
            }],
            scope: {
                URI: {
                    include: ["pdt.html"]
                }
            },
            selector: "ul.prd-price-promise > li > a",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "MCD - Price Promise - href In Callout - Currys & PCW",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    addEvent: ["event118"]
                }]
            }, {
                command: "delayActivateLink"
            }],
            selector: "div.price-promise-bluebox-text > p > a",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1,
            customEvent: "onmouseup"
        }, {
            name: "MCD - Price Promise - href In Tab - Currys & PCW",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    addEvent: ["event139"]
                }]
            }],
            selector: "#price-promise-section > div > a",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "MCD - Product Title Copy",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    addEvent: ["event117"]
                }]
            }, {
                command: "loadScript",
                arguments: [{
                    sequential: !0,
                    scripts: [{
                        src: "satellite-56dedeaa64746d054a000b7d.js"
                    }]
                }]
            }],
            scope: {
                URI: {
                    include: ["pdt.html"]
                }
            },
            selector: "h1.page-title.nosp, p.prd-code",
            event: "custom",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1,
            customEvent: "copy"
        }, {
            name: "MCD - Step Page - Remove from Basket",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        prop47: "%MCD - Step Page - FUPID%"
                    }
                }]
            }],
            conditions: [function() {
                return _satellite.textMatch(_satellite.getVar("150723: Capture Page Name: AW"), "trolley:add to basket step")
            }],
            selector: "form.deleteStepPage",
            event: "submit",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "MCD - Stock Checker - Change Location",
            conditions: [function() {
                return universal_variable.analytics.searchType = "", !0
            }],
            selector: "div.change-location a",
            eventHandlerOnElement: !0,
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "MCD - Stock Checker - First Visit Callout",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    addEvent: ["event123"]
                }]
            }],
            scope: {
                URI: {
                    include: ["pdt.html"]
                }
            },
            conditions: [function() {
                var e = "delivery and/or collection";
                return (document.querySelectorAll("div.callout")[0].innerText || document.querySelectorAll("div.callout")[0].textContent).indexOf(e) > -1
            }],
            selector: "div.callout",
            event: "inview",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1,
            customEvent: "load"
        }, {
            name: "MCD - Store Info Copy",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    addEvent: ["event127"]
                }]
            }],
            scope: {
                URI: {
                    include: ["pdt.html"]
                }
            },
            selector: "ul.mcd-stores-list li > div > div > div > div.store-details",
            eventHandlerOnElement: !0,
            event: "custom",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1,
            customEvent: "copy"
        }, {
            name: "MS Action Tags - Add To Basket",
            trigger: [{
                command: "loadIframe",
                arguments: [{
                    pages: [{
                        src: "satellite-57c82ca164746d4d3b008ab3.html",
                        data: ["Fld_Domain"]
                    }]
                }]
            }],
            scope: {
                domains: [/currys\.co\.uk$/i, /pcworld\.co\.uk$/i]
            },
            conditions: [function() {
                var e = universal_variable || {},
                    t = e && e.product && e.product.id;
                return ["10147540"].indexOf(t) > -1
            }],
            selector: "button.main-purchase-btn",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "My Account - Rich Relevance Interaction",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    addEvent: ["event240"]
                }]
            }, {
                command: "delayActivateLink"
            }],
            selector: "a[data-interaction='rich-relevance-account']",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Proceed to checkout - get services message",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        eVar34: "Services|%Message Alert - Services Attach%",
                        prop34: "Services|%Message Alert - Services Attach%"
                    }
                }]
            }, {
                command: "delayActivateLink"
            }],
            scope: {
                URI: {
                    include: ["/basket-confirmation.html"]
                }
            },
            conditions: [function() {
                return !!document.contains(document.querySelector('div[data-component="alert"][data-type="MESSAGE"]'))
            }],
            selector: "button.btn.wide.btnMain.btnShop, button#formSubmit.btn.btnMain.btnShop.tsp",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Product Page - Tab Selection",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        prop16: "%Product Page - Active Tab%"
                    },
                    addEvent: ["event176"]
                }]
            }],
            scope: {
                URI: {
                    include: ["-pdt.html"]
                }
            },
            selector: ".tab-toggle,.tab-toggle.touch",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Promotional Message",
            trigger: [{
                engine: "sc",
                command: "trackLink",
                arguments: [{
                    setVars: {
                        eVar34: "%Promo Message - Step Page%",
                        prop34: "%Promo Message - Step Page%"
                    },
                    customSetup: function() {
                        _satellite.getToolsByType("sc")[0].getS().clearVars()
                    }
                }]
            }],
            scope: {
                URI: {
                    include: ["/product_confirmation.html"]
                }
            },
            conditions: [function() {
                for (var e, t = document.querySelectorAll('div[data-component="alert"][data-type="MESSAGE"]') || [], n = !1, a = 0; a < t.length; a++) {
                    "none" !== window.getComputedStyle(t[a]).display && (n = !0, e = t[a])
                }
                if (n) {
                    var i = "Merchandising|",
                        r = e.innerText.trim() || e.textContent.trim();
                    return (r = r.toLowerCase()).indexOf("pc") > -1 ? i += "PC Promo" : r.indexOf("ink") > -1 ? i += "Printer Promo" : i += "No String Match", _satellite.setVar("Promo Message - Step Page", i), !0
                }
                return !1
            }],
            selector: 'div[data-component="alert"][data-type="MESSAGE"]',
            event: "elementexists",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Search Result Filtering",
            trigger: [{
                tool: ["f162a116a99b083bbc58656a88752924"],
                command: "send",
                arguments: [{
                    hitType: "event",
                    eventCategory: "%DD - Last Event Name%",
                    eventAction: "%DD - Last Event Action%",
                    eventLabel: "%Filter Attribute + Value - Event Label%",
                    eventValue: null
                }]
            }, {
                engine: "sc",
                command: "trackLink",
                arguments: [{
                    setVars: {
                        eVar46: "%Search Result Filtering - dataLayer%",
                        prop42: "%Search Result Filtering - dataLayer%"
                    }
                }]
            }, {
                command: "delayActivateLink"
            }],
            conditions: [function(e) {
                e = $(this);
                var t, n, a, i = this.tagName,
                    r = this.id,
                    o = e.parents("ul").siblings("h3").text().trim(),
                    s = function(e, t) {
                        var n = $("<div>" + e + "</div>");
                        return n.find(t).remove(), "img" == t ? n.html() : n.text()
                    },
                    c = function(e, t) {
                        var n = $('label[for="' + t + '"]').html();
                        if ("Colour" === e) {
                            var a = s(n, "img");
                            return s(a, "small").trim()
                        }
                        return "Customer rating" == e ? $(n).attr("class").split(" ")[1] : s(n, "small").trim()
                    },
                    l = function(e) {
                        return e ? "Checked" : "Unchecked"
                    },
                    d = function(e) {
                        if ("submit" === e) return "Custom Price : \xa3" + $("input#price-floor").val() + " - \xa3" + $("input#price-ceiling").val() + " : Custom Price";
                        if ("checkbox" == e) {
                            var a = document.getElementById(r).checked;
                            return t = c(o, r), n = l(a), o + " : " + t + " : " + n
                        }
                        return "input type is neither submit or checkbox"
                    },
                    u = function(n) {
                        return n ? "Reset : Reset : Reset" : (t = s(e.html(), "small").trim(), o + " : " + t + " : Checked")
                    };
                switch (i) {
                    case "A":
                        a = u(e.hasClass("btn-reset"));
                        break;
                    case "INPUT":
                        a = d(e.attr("type"))
                }
                return universal_variable.analytics.searchFilterTracking = a, !0
            }],
            selector: 'div#filters-content ul li input[type=\'checkbox\'], div#filters-content ul li a, div#filters-content ul li input[type="submit"][value="Refresh"], aside#filters a.btn-reset',
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Search Result Sorting",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        prop45: "%Search Result Sorting - dataLayer%",
                        prop50: "Search Result Sorting"
                    }
                }]
            }, {
                command: "delayActivateLink"
            }],
            scope: {
                URI: {
                    include: ["criteria.html"]
                }
            },
            conditions: [function() {
                function e(e) {
                    var t = document.getElementById(e),
                        n = t.selectedIndex,
                        a = t.getElementsByTagName("option")[n];
                    return a.innerText || a.textContent
                }
                var t = document.getElementById("sViewCount"),
                    n = document.getElementById("sSortBy"),
                    a = this.contains(t),
                    i = (this.contains(n), universal_variable.analytics);
                return i.searchResultSorting = a ? e("sSortBy") + "|" + e("sViewCount") : e("sSortBy") + "|", !0
            }],
            selector: 'section[role="main"][class="col9"] > div > form',
            event: "change",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Software Offer - add / remove - refactored",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        t.contextData.eVar92 = _satellite.getVar("Software Offer"), t.linkTrackVars = "contextData.eVar92"
                    }
                }]
            }],
            selector: "th[data-component='software-offers-analytics'] input[data-action='add'],  th[data-component='software-offers-analytics'] a[data-action='remove']",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Software Offer - set customVar - element exists",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-57d1573264746d4d3e00cb86.js"
                    }]
                }]
            }],
            conditions: [function() {
                return _satellite.textMatch(_satellite.getVar("Software Offer"), /added|removed/i)
            }],
            selector: "div#content",
            event: "elementexists",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Submit Voucher Code Form",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    type: "o",
                    linkName: "Submit Voucher Code Form",
                    addEvent: ["event141"]
                }]
            }],
            selector: ".voucher-form",
            event: "submit",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Voucher Code Applied ",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        eVar89: "%this.@text%"
                    }
                }]
            }],
            selector: ".vouchers-list div.floatRight",
            event: "inview",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Your Plan Floodlight Online Tab Click",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    type: "o",
                    linkName: "Online Credit - Your Plan Marketing Online Tab",
                    addEvent: ["event164"]
                }]
            }, {
                command: "loadIframe",
                arguments: [{
                    pages: [{
                        src: "satellite-581aeea164746d7de00104ec.html",
                        data: []
                    }]
                }]
            }],
            scope: {
                URI: {
                    include: [/\/gbuk\/yourplan-1347-commercial.html/i]
                }
            },
            selector: "a#online-tab",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "Your Plan Floodlight Store Tab Click",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    type: "o",
                    linkName: "Online Credit - Your Plan Marketing Store Tab",
                    addEvent: ["event165"]
                }]
            }, {
                command: "loadIframe",
                arguments: [{
                    pages: [{
                        src: "satellite-581aedb164746d7de00104d7.html",
                        data: []
                    }]
                }]
            }],
            scope: {
                URI: {
                    include: [/\/gbuk\/yourplan-1347-commercial.html/i]
                }
            },
            selector: "a#store-tab",
            event: "click",
            bubbleFireIfParent: !0,
            bubbleFireIfChildFired: !0,
            bubbleStop: !1
        }, {
            name: "facebook like",
            event: "facebook.like",
            trigger: [{
                command: "send",
                arguments: [{
                    hitType: "social",
                    socialNetwork: "facebook",
                    socialAction: "like",
                    socialTarget: document.location.href
                }],
                tool: ["bd533b533cf3b3a1aa7acc28b81b326a", "f162a116a99b083bbc58656a88752924"]
            }]
        }, {
            name: "facebook unlike",
            event: "facebook.unlike",
            trigger: [{
                command: "send",
                arguments: [{
                    hitType: "social",
                    socialNetwork: "facebook",
                    socialAction: "unlike",
                    socialTarget: document.location.href
                }],
                tool: ["bd533b533cf3b3a1aa7acc28b81b326a", "f162a116a99b083bbc58656a88752924"]
            }]
        }, {
            name: "facebook send",
            event: "facebook.send",
            trigger: [{
                command: "send",
                arguments: [{
                    hitType: "social",
                    socialNetwork: "facebook",
                    socialAction: "send",
                    socialTarget: document.location.href
                }],
                tool: ["bd533b533cf3b3a1aa7acc28b81b326a", "f162a116a99b083bbc58656a88752924"]
            }]
        }, {
            name: "twitter tweet",
            event: "twitter.tweet",
            trigger: [{
                command: "send",
                arguments: [{
                    hitType: "social",
                    socialNetwork: "twitter",
                    socialAction: "tweet",
                    socialTarget: document.location.href
                }],
                tool: ["bd533b533cf3b3a1aa7acc28b81b326a", "f162a116a99b083bbc58656a88752924"]
            }]
        }],
        directCallRules: [{
            name: "Gift Card Entered",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    addEvent: ["event119"]
                }]
            }]
        }, {
            name: "Gift Card Server Error",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    type: "o",
                    linkName: "Gift Card Server Error",
                    setVars: {
                        eVar34: "Gift Card: %150721 Gift Card Server Error TM%",
                        prop34: "Gift Card: %150721 Gift Card Server Error TM%"
                    }
                }]
            }]
        }, {
            name: "Gift Card Entry Validation Error",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        eVar34: "Gift Cards: %150721 Gift Card Validation Error TM%",
                        prop34: "Gift Cards: %150721 Gift Card Validation Error TM%"
                    }
                }]
            }]
        }, {
            name: "Voucher Entered",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        t.linkTrackVars = "eVar61", t.eVar61 = window.universal_variable.basket.voucher, console.log("eVar61=" + t.eVar61)
                    },
                    addEvent: ["event142"]
                }]
            }]
        }, {
            name: "Voucher Entry Validation Error",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        t.linkTrackVars = "eVar61", t.eVar61 = $("#voucher").val(), console.log("eVar61=" + t.eVar61)
                    },
                    addEvent: ["event143"]
                }]
            }]
        }, {
            name: "creditEligibilityChange",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = (window.digitalData || {}).cart || {},
                            a = "undefined" != typeof n.credit ? n.credit : [],
                            i = a.length > 0 ? a[0] : {},
                            r = i.APR || null,
                            o = i.creditType || null,
                            s = i.minTerm || null,
                            c = i.maxTerm || null,
                            l = i.deferralPeriod || null,
                            d = null !== o ? "true" : "false",
                            u = [n.financingAvailable ? "true" : "false", d, [r, o, s, c, l].join(":")];
                        t.linkTrackVars = "contextData.eVar109", t.contextData.eVar109 = u.join("|"), _satellite.notify(u.join("|"))
                    }
                }]
            }]
        }, {
            name: "creditTermsReturned",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = (window.digitalData || {}).cart || {},
                            a = "undefined" != typeof n.credit ? n.credit : [],
                            i = a.length > 0 ? a[0] : {},
                            r = i.APR || null,
                            o = i.creditType || null,
                            s = i.minTerm || null,
                            c = i.maxTerm || null,
                            l = i.deferralPeriod || null,
                            d = null !== o ? "true" : "false",
                            u = [n.financingAvailable ? "true" : "false", d, [r, o, s, c, l].join(":")];
                        t.linkTrackVars = "contextData.eVar109", t.contextData.eVar109 = u.join("|"), _satellite.notify(u.join("|"))
                    }
                }]
            }]
        }, {
            name: "myAccountSflAvailabilityCheck",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        prop54: "%My Account - Availability Check%"
                    },
                    addEvent: ["event241"]
                }]
            }]
        }, {
            name: "myAccountSflAvailabilityToggle",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        prop54: "%My Account - Availability Check Toggle%"
                    },
                    addEvent: ["event239"]
                }]
            }]
        }, {
            name: "myAccountEmailPreferences",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-591ad6b864746d6d6700acf6.js"
                    }]
                }]
            }]
        }, {
            name: "myAccountOrderSearch",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-591996e564746d198e0143f5.js"
                    }]
                }]
            }]
        }, {
            name: "myAccountPriceDropToggle",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        prop54: "%My Account - Price Drop Notify Toggle%"
                    },
                    addEvent: ["event227"]
                }]
            }]
        }, {
            name: "Add second email",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = (window.digitalData || {}).events || [],
                            a = n[n.length - 1] || {},
                            i = a.eventName || "",
                            r = a.eventAction || "",
                            o = a.data || {},
                            s = [i, r, [o.addedSecondaryEmail ? "true" : "false", o.isValidEmail ? "true" : "false"].join(":")];
                        t.linkTrackVars = "prop54,events", t.prop54 = s.join("|")
                    },
                    addEvent: ["event244"]
                }]
            }]
        }, {
            name: "saveForLater",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = (digitalData || {}).events || [],
                            a = n[n.length - 1] || {},
                            i = a.data || {},
                            r = [a.eventName || "", a.eventAction || "", [i.addOrRemove, i.saveForLaterStatus, i.saveForLaterUserMessaging].join(":")].join("|"),
                            o = "Removed" === i.addOrRemove ? "event220" : "event219";
                        t.linkTrackVars = "contextData.eVar94", t.linkTrackEvents = o, t.contextData.eVar94 = r, t.events = o
                    }
                }]
            }]
        }, {
            name: "saveForLaterEmailRecognition",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = (window.digitalData || {}).events || [],
                            a = n[n.length - 1] || {},
                            i = (a.data || {}).emailExists.toString() || "",
                            r = [a.eventName || "", a.eventAction || "", [i].join(":")];
                        t.linkTrackVars = "contextData.eVar94", t.linkTrackEvents = "event171", t.contextData.eVar94 = r.join("|"), t.events = "event171"
                    }
                }]
            }]
        }, {
            name: "saveForLaterRegisterAndSave",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = (window.digitalData || {}).events || [],
                            a = n[n.length - 1] || {},
                            i = a.data || {},
                            r = i.registerStatus || "",
                            o = i.saveForLaterStatus || "",
                            s = i.saveForLaterUserMessaging || "",
                            c = i.priceDropToggle || !1,
                            l = [a.eventName || "", a.eventAction || "", ["register-" + r, "save-" + o, s, "pricedropToggle-" + c].join(":")];
                        t.linkTrackVars = "contextData.eVar94", t.linkTrackEvents = "event173", t.contextData.eVar94 = l.join("|"), t.events = "event173"
                    }
                }]
            }]
        }, {
            name: "saveForLaterSignInAndSave",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = (window.digitalData || {}).events || [],
                            a = n[n.length - 1] || {},
                            i = a.data || {},
                            r = i.signInStatus || "",
                            o = i.saveForLaterStatus || "",
                            s = i.saveForLaterUserMessaging || "",
                            c = [a.eventName || "", a.eventAction || "", [r, o, s].join(":")];
                        t.linkTrackVars = "contextData.eVar94", t.linkTrackEvents = "event172", t.contextData.eVar94 = c.join("|"), t.events = "event172"
                    }
                }]
            }]
        }, {
            name: "myAccountUpdateBillingAddress",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-591acf4964746d329900536f.js"
                    }]
                }]
            }]
        }, {
            name: "myAccountUpdateDeliveryAddress",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-591ace9964746d07d80006ec.js"
                    }]
                }]
            }]
        }, {
            name: "myAccountUpdateEmailAddress",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-591accfe64746d505e0002e4.js"
                    }]
                }]
            }]
        }, {
            name: "myAccountUpdatePassword",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-591acdea64746d5007000527.js"
                    }]
                }]
            }]
        }, {
            name: "myAccountUpdatePersonalDetails",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-591ac8cc64746d0387005c13.js"
                    }]
                }]
            }]
        }, {
            name: "collectInStoreDisplayed",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-589302b664746d240e00290d.js"
                    }]
                }]
            }]
        }, {
            name: "collectInStoreDisplayedDelayed",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    addEvent: ["event204"]
                }]
            }]
        }, {
            name: "compareItems",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = (window.digitalData || {}).events || [],
                            a = n[n.length - 1] || {},
                            i = a.eventName || "",
                            r = a.eventAction || "",
                            o = (a.data || {}).products || [];
                        t.linkTrackVars = "contextData.eVar94", t.linkTrackEvents = "event234", t.contextData.eVar94 = [i, r, o.join(":")].join("|"), t.events = "event234"
                    }
                }]
            }]
        }, {
            name: "comparisonCheckClick",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = (window.digitalData || {}).events || [],
                            a = n[n.length - 1] || {},
                            i = a.eventName || "",
                            r = a.eventAction || "",
                            o = a.data || {},
                            s = o.error || null,
                            c = (e = null === s ? "event232" : "event233", [i, r, [o.productID || "", o.status || "", s].join(":")].join("|"));
                        t.linkTrackVars = "contextData.eVar94", t.linkTrackEvents = e, t.contextData.eVar94 = c, t.events = e, null !== s && (t.linkTrackVars += ",eVar34,prop34", t.eVar34 = c, t.prop34 = c)
                    }
                }]
            }]
        }, {
            name: "comparisonListClick",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = (window.digitalData || {}).events || [],
                            a = n[n.length - 1] || {},
                            i = a.eventName || "",
                            r = a.eventAction || "",
                            o = (a.data || {}).productID || "";
                        t.linkTrackVars = "contextData.eVar94", t.linkTrackEvents = "event236", t.contextData.eVar94 = [i, r, [o].join(":")].join("|"), t.events = "event236"
                    }
                }]
            }]
        }, {
            name: "removeComparisonItem",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = (window.digitalData || {}).events || [],
                            a = n[n.length - 1] || {},
                            i = a.eventName || "",
                            r = a.eventAction || "",
                            o = (a.data || {}).productID || "";
                        t.linkTrackVars = "contextData.eVar94", t.linkTrackEvents = "event235", t.contextData.eVar94 = [i, r, [o].join(":")].join("|"), t.events = "event235"
                    }
                }]
            }]
        }, {
            name: "storelocatorcomplete",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-5877511664746d482c004a09.js"
                    }]
                }]
            }]
        }, {
            name: "storelocatorcompletedelayed",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    addEvent: ["event205"]
                }]
            }]
        }, {
            name: "View Store Opening Hours",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = (window.digitalData || {}).events || [],
                            a = ((n[n.length - 1] || {}).data || {}).storeClicked || "",
                            i = parseInt(a);
                        e = "";
                        1 === i ? e = "event214" : 2 === i ? e = "event215" : 3 === i && (e = "event216"), t.linkTrackVars = "contextData.eVar94", t.linkTrackEvents = e, t.contextData.eVar94 = _satellite.getVar("MCD - View Store Opening Hours"), t.events = e
                    }
                }]
            }]
        }, {
            name: "Delivery method selected",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = (window.digitalData || {}).events || [],
                            a = n[n.length - 1] || {},
                            i = a.data || {},
                            r = [a.eventName || "", a.eventAction || "", [i.deliveryGroup || "", i.deliveryMethod].join(":")];
                        t.linkTrackVars = "contextData.eVar102", t.linkTrackEvents = "event229", t.contextData.eVar102 = r.join("|"), t.events = "event229", _satellite.notify(r.join("|"), 4)
                    }
                }]
            }]
        }, {
            name: "Delivery slot selected",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    customSetup: function(e, t) {
                        var n = (window.digitalData || {}).events || [],
                            a = n[n.length - 1] || {},
                            i = a.eventName || "",
                            r = a.eventAction || "",
                            o = a.data || {},
                            s = o.deliveryDay || "",
                            c = o.deliveryTime || "",
                            l = o.daysAway || "0",
                            d = [i, r, [o.deliveryPrice || "0", s, l, c].join(":")];
                        t.linkTrackVars = "contextData.eVar101", t.linkTrackEvents = "event228", t.contextData.eVar101 = d.join("|"), t.events = "event228"
                    }
                }]
            }]
        }, {
            name: "chromecastFloodlight",
            trigger: [{
                command: "loadIframe",
                arguments: [{
                    pages: [{
                        src: "satellite-56fb960864746d052600ae87.html",
                        data: []
                    }]
                }]
            }]
        }, {
            name: "defaultView",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        prop41: "%Postal search value through query selector%",
                        prop43: "%Deliver/Collect in store default view%"
                    },
                    addEvent: ["event107"]
                }]
            }]
        }, {
            name: "freeDeliveryBigButton",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        eVar13: "%MCD - Countdown Clock - Enabled%|%MCD - Countdown Clock - Colour%|%MCD - Countdown Clock - Time%",
                        eVar50: "%150820: Fulfillment Method%|Free Delivery|%MCD - Free delivery button - difference in days before delivery%",
                        eVar51: "%MCD - Stock Checker - Search Term%|%MCD - Stock Checker - Post Code%|%MCD - Stock Checker - Location%|%MCD - Geolocation / Typed%",
                        eVar52: "%150815: Stock at Address Successful%",
                        prop36: "%MCD - Geolocation / Typed%",
                        prop37: "%150820: Product Availability Message%"
                    }
                }]
            }]
        }, {
            name: "pricePromiseOnload",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !1,
                    scripts: [{
                        src: "satellite-58232e0064746d0638000602.js"
                    }]
                }]
            }]
        }, {
            name: "locationautocomplete",
            trigger: [{
                command: "loadScript",
                arguments: [{
                    sequential: !0,
                    scripts: [{
                        src: "satellite-582205ae64746d38fe010433.js"
                    }]
                }]
            }]
        }, {
            name: "locationcomplete",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        eVar52: "%MCD - Stock Checker - Search Term|Location|Postcode|Typed/Geolocated|useCase%",
                        prop41: "%MCD - Stock Checker - Search Term|Location|Postcode|Typed/Geolocated|useCase%",
                        prop43: "%MCD - Stock Checker - Deliver/Collect in store default view%",
                        prop50: "%DTM Rule Fired%"
                    },
                    addEvent: ["event107"]
                }]
            }]
        }, {
            name: "locationdelayedautocomplete",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        eVar52: "Autocomplete|%MCD - Stock Checker - Autocomplete Postcode%|Autocomplete|Autocomplete|Autocomplete",
                        prop41: "Autocomplete|%MCD - Stock Checker - Autocomplete Postcode%|Autocomplete|Autocomplete|Autocomplete",
                        prop43: "%MCD - Stock Checker - Deliver/Collect in store default view%",
                        prop50: "%DTM Rule Fired%"
                    },
                    addEvent: ["event107"]
                }]
            }]
        }, {
            name: "locationerror",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        eVar34: "%MCD - Stock Checker - Error Message%",
                        prop34: "%MCD - Stock Checker - Error Message%",
                        prop41: "%MCD - Stock Checker - Search Term|Location|Postcode|Typed/Geolocated|useCase%"
                    }
                }]
            }]
        }, {
            name: "not registered",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        eVar19: "Not Registered"
                    }
                }]
            }]
        }, {
            name: "registered",
            trigger: [{
                tool: ["7583601894f25f325ca11dbf8c0bac0f"],
                command: "trackLink",
                arguments: [{
                    setVars: {
                        eVar19: "Registered"
                    },
                    addEvent: ["event136"]
                }]
            }]
        }],
        settings: {
            trackInternalLinks: !0,
            libraryName: "satelliteLib-32636a7d43bf75eafaa1888f4d5b91bb32da400b",
            isStaging: !1,
            allowGATTcalls: !1,
            downloadExtensions: /\.(?:doc|docx|eps|jpg|png|svg|xls|ppt|pptx|pdf|xlsx|tab|csv|zip|txt|vsd|vxd|xml|js|css|rar|exe|wma|mov|avi|wmv|mp3|wav|m4v)($|\&|\?)/i,
            notifications: !1,
            utilVisible: !1,
            domainList: ["currys.co.uk", "dixons.com", "dixonsretail.net", "pcworld.co.uk", "queue-it.net"],
            scriptDir: "5e3c12259ba754dbb3132d54e5421a9f0f40dbce/scripts/",
            linkDelay: 200,
            tagTimeout: 3e3
        },
        data: {
            URI: document.location.pathname + document.location.search,
            browser: {},
            cartItems: [],
            revenue: "",
            host: {
                http: "assets.adobedtm.com",
                https: "assets.adobedtm.com"
            }
        },
        dataElements: {
            "150505: Order ID AW": {
                jsVariable: "window.universal_variable.transaction.order_id",
                storeLength: "pageview"
            },
            "150505: Total Order Value AW": {
                jsVariable: "window.universal_variable.transaction.total",
                storeLength: "pageview"
            },
            "150514: ProductID ordered": {
                customJS: function() {
                    function e(e, t) {
                        var n = [];
                        for (var a in e) e[a][t] && n.push(e[a][t].id);
                        return n.join()
                    }
                    var t = window.universal_variable.transaction || {},
                        n = "line_items",
                        a = "product";
                    return t[n] && t[n].constructor === Array ? e(t[n], a) : t[n]
                },
                storeLength: "pageview"
            },
            "150721 Gift Card Server Error TM": {
                jsVariable: "window.universal_variable.page.svserror",
                storeLength: "pageview",
                forceLowerCase: !0
            },
            "150721 Gift Card Validation Error TM": {
                selector: ".error-numbers",
                property: "text",
                storeLength: "pageview"
            },
            "150723: Capture Page Name: AW": {
                jsVariable: "s.pageName",
                storeLength: "pageview"
            },
            "150723: Capture Page Type: AW": {
                jsVariable: "s.prop4",
                storeLength: "pageview"
            },
            "150730: Gift Card Number EB": {
                customJS: function() {
                    for (var e = [], t = 0; t < window.universal_variable.transaction.giftcards.length; t++) e.push(window.universal_variable.transaction.giftcards[t].cardnumber);
                    e.join(",")
                },
                storeLength: "pageview"
            },
            "150813: Gift Card Total Amount Used: AW": {
                customJS: function() {
                    for (var gcAmountUsed = [], i = 0; i < window.universal_variable.transaction.giftcards.length; i++) gcAmountUsed.push(window.universal_variable.transaction.giftcards[i].amountused);
                    eval(gcAmountUsed.join("+"))
                },
                storeLength: "pageview"
            },
            "150813: Number of Gift Cards Used: AW": {
                jsVariable: "window.universal_variable.transaction.giftcards.length",
                storeLength: "pageview"
            },
            "150814: Countdown Clock Colour": {
                customJS: function() {
                    var e = DCG.$("#countdown-delivery-clock:visible");
                    return e && e.length > 0 ? e.find("span").css("color") : "ERROR: NO COLOR DEFINED"
                },
                storeLength: "session"
            },
            "150814: Countdown Clock Enabled": {
                customJS: function() {
                    var e = DCG.$("#countdown-delivery-clock:visible");
                    return e && e.length > 0 ? "ENABLED" : "DISABLED"
                },
                storeLength: "session"
            },
            "150814: Countdown Clock Time": {
                customJS: function() {
                    var e = DCG.$("#countdown-delivery-clock:visible");
                    return e && e.length > 0 ? (e.find(".hours") ? e.find(".hours").text().split(" ")[0] : "00") + ":" + (e.find(".minutes") ? e.find(".minutes").text().split(" ")[0] : "00") + ":" + (e.find(".seconds ") ? e.find(".seconds").text().split(" ")[0] : "00") : "ERROR: NO TIME DEFINED"
                },
                storeLength: "session"
            },
            "150815: Stock at Address Successful": {
                customJS: function() {
                    return universal_variable.analytics["150815: Stock at Address Successful"]
                },
                storeLength: "pageview"
            },
            "150819: Next day delivery data": {
                customJS: function() {
                    if (_satellite.readCookie("_sdsat_150819: Next day delivery data") === undefined) {
                        var e = DCG.$(".hoverTable").length > 0 ? DCG.$(".hoverTable input[type=radio]:checked").val().split("_")[0] : null,
                            t = new Date(e),
                            n = new Date((new Date).getTime() + 864e5);
                        return t.getDate() === n.getDate() ? "Next Day Selected" : "Next Day Not Selected"
                    }
                },
                "default": "NEXT DAY DELIVERY DATE ERROR",
                storeLength: "session"
            },
            "150820: Delivery Timeslot": {
                customJS: function() {
                    return universal_variable.analytics["150820: Delivery Timeslot"]
                },
                storeLength: "pageview"
            },
            "150820: Fulfillment Method": {
                customJS: function() {
                    return universal_variable.analytics["150820: Fulfillment Method"]
                },
                storeLength: "pageview"
            },
            "150820: Multiple Postal Codes Attempted": {
                jsVariable: "universal_variable.analytics.150820: Multiple Postal Codes Attempted",
                storeLength: "session"
            },
            "150820: Postal Code Search Type": {
                customJS: function() {
                    return universal_variable.analytics["150820: Postal Code Search Type"]
                },
                storeLength: "pageview"
            },
            "150820: Postal Code Search Value": {
                customJS: function() {
                    return universal_variable.analytics["150820: Postal Code Search Value"]
                },
                storeLength: "pageview"
            },
            "150820: Postal Code Search Value Type": {
                customJS: function() {
                    return universal_variable.analytics["150820: Postal Code Search Value Type"]
                },
                storeLength: "pageview"
            },
            "150820: Product Availability Message": {
                customJS: function() {
                    return universal_variable.analytics["150820: Product Availability Message"]
                },
                storeLength: "pageview"
            },
            "150825: Transaction - Product Category": {
                jsVariable: "universal_variable.transaction.line_items[0].product.category",
                storeLength: "pageview"
            },
            "150825: Transaction - Product ID": {
                jsVariable: "universal_variable.transaction.line_items[0].product.id",
                storeLength: "pageview"
            },
            "150825: Transaction - Product Manufacturer": {
                jsVariable: "universal_variable.transaction.line_items[0].product.manufacturer",
                storeLength: "pageview"
            },
            "150825: Transaction - Product Name": {
                customJS: function() {
                    return universal_variable.transaction.line_items[0].product.name.replace(/"/g, "&#34;")
                },
                storeLength: "pageview"
            },
            "150825: Transaction - Product Segment": {
                jsVariable: "universal_variable.transaction.line_items[0].product.segment",
                storeLength: "pageview"
            },
            "150825: Transaction - Product SKU": {
                jsVariable: "universal_variable.transaction.line_items[0].product.sku_code",
                storeLength: "pageview"
            },
            "150825: Transaction - Product Sub Category": {
                jsVariable: "universal_variable.transaction.line_items[0].product.subcategory",
                storeLength: "pageview"
            },
            "150825: Transaction - Product Unit Price": {
                jsVariable: "universal_variable.transaction.line_items[#].product.unit_price",
                storeLength: "pageview"
            },
            "150825: Transaction - Quantity List": {
                jsVariable: "universal_variable.transaction.line_items[0].quantity",
                storeLength: "pageview"
            },
            "150825: Transaction - Subtotal": {
                jsVariable: "universal_variable.transaction.subtotal",
                storeLength: "pageview"
            },
            "150825: Transaction - Unit Sale Price": {
                jsVariable: "universal_variable.transaction.line_items[0].product.unit_sale_price",
                storeLength: "pageview"
            },
            "150825: Transaction - Universe": {
                jsVariable: "universal_variable.transaction.line_items[0].product.universe",
                storeLength: "pageview"
            },
            "150826: Page category": {
                jsVariable: "universal_variable.page.category",
                storeLength: "pageview"
            },
            "150826: Product Category - EB": {
                jsVariable: "universal_variable.product.category",
                storeLength: "pageview"
            },
            "150826: Product ID - EB": {
                jsVariable: "universal_variable.product.id",
                storeLength: "pageview"
            },
            "150826: Product Manufacturer - EB": {
                jsVariable: "universal_variable.product.manufacturer",
                storeLength: "pageview"
            },
            "150826: Product Name - EB": {
                customJS: function() {
                    return universal_variable.product.name.replace(/"/g, "&#34;")
                },
                storeLength: "pageview"
            },
            "150826: Product Price - EB": {
                jsVariable: "universal_variable.product.unit_sale_price",
                storeLength: "pageview"
            },
            "150826: Product SKU": {
                jsVariable: "universal_variable.product.sku_code",
                storeLength: "pageview"
            },
            "150826: Product Sub Category": {
                customJS: function() {
                    ! function() {
                        var e = [];
                        for (i = 0; i < window.universal_variable.basket.line_items.length; i++) {
                            var t = window.universal_variable.basket.line_items[i].product.subcategory;
                            e.push(t)
                        }
                        e.join("|")
                    }()
                },
                storeLength: "pageview"
            },
            "150826: Universe - EB": {
                jsVariable: "universal_variable.product.universe",
                storeLength: "pageview"
            },
            "150915: FUPID email me": {
                customJS: function() {
                    var e = "";
                    document.location.pathname.includes("pdt.html") ? e = ((universal_variable || {}).product || {}).id || "" : e = document.querySelector(".email-when-back-form #email-fupid").value || "";
                    return e
                },
                storeLength: "pageview"
            },
            "150930: Basket Line Items - Quantity List - EB": {
                jsVariable: "universal_variable.basket.line_items[0].quantity",
                storeLength: "pageview"
            },
            "150930: Basket - Product Category": {
                customJS: function() {
                    var e;
                    return console.log("Adobe DTM: Begin Product Category Data Element Code"), e = function() {
                        var e = [];
                        for (i = 0; i < window.universal_variable.basket.line_items.length; i++) {
                            var t = window.universal_variable.basket.line_items[i].product.category;
                            e.push(t)
                        }
                        return e.join("|")
                    }(), console.log("Adobe DTM: End Product Category Data Element Code"), e
                },
                storeLength: "pageview"
            },
            "150930: Basket - Product ID": {
                customJS: function() {
                    return function() {
                        var e = [];
                        for (i = 0; i < window.universal_variable.basket.line_items.length; i++) {
                            var t = window.universal_variable.basket.line_items[i].product.id;
                            e.push(t)
                        }
                        return e.join("|")
                    }()
                },
                storeLength: "pageview"
            },
            "150930: Basket - Product Manufacturer": {
                jsVariable: "universal_variable.basket.line_items[0].product.manufacturer",
                storeLength: "pageview"
            },
            "150930: Basket - Product Name": {
                customJS: function() {
                    return universal_variable.basket.line_items[0].product.name.replace(/"/g, "&#34;")
                },
                storeLength: "pageview"
            },
            "150930: Basket - Product Segment": {
                jsVariable: "universal_variable.basket.line_items[0].product.segment",
                storeLength: "pageview"
            },
            "150930: Basket - Product SKU List": {
                jsVariable: "universal_variable.basket.line_items[0].product.sku_code",
                storeLength: "pageview"
            },
            "150930: Basket - Product Sub Category": {
                customJS: function() {
                    return function() {
                        var e = [];
                        for (i = 0; i < window.universal_variable.basket.line_items.length; i++) {
                            var t = window.universal_variable.basket.line_items[i].product.subcategory;
                            e.push(t)
                        }
                        return e.join("|")
                    }()
                },
                storeLength: "pageview"
            },
            "150930: Basket - Product Unit Price List": {
                jsVariable: "universal_variable.basket.line_items[0].product.unit_sale_price",
                storeLength: "pageview"
            },
            "150930: Basket - Subtotal": {
                jsVariable: "universal_variable.basket.subtotal",
                storeLength: "pageview"
            },
            "150930: Basket - total": {
                jsVariable: "universal_variable.basket.total",
                storeLength: "pageview"
            },
            "150930: Basket - Universe": {
                jsVariable: "universal_variable.basket.line_items[0].product.universe",
                storeLength: "pageview"
            },
            "160112: Grid Value": {
                customJS: function() {
                    var e, t;
                    return e = (t = window.innerWidth) > 768 ? "4x4" : t < 599 ? "2x2" : "3x3", "grid" == $(".viewSwitch").attr("data-view") ? "" : "|" + e
                },
                storeLength: "pageview"
            },
            "160112: Layout Type": {
                customJS: function() {
                    return "grid" == $(".viewSwitch").attr("data-view") ? "List" : "Grid"
                },
                storeLength: "pageview"
            },
            "160217: Basket - Installation data from href": {
                customJS: function() {
                    for (var e, t = 0, n = document.getElementsByClassName("service-title"); t < n.length; t++) {
                        "Installation" === n[t].getElementsByTagName("H5")[0].innerHTML && (e = n[t].getElementsByTagName("A")[0].getAttribute("href"))
                    }
                    return e
                },
                storeLength: "pageview"
            },
            "160421: Universe:Category": {
                customJS: function() {
                    var e = document.location.pathname.split("/");
                    return e[2] + ":" + e[3]
                },
                storeLength: "pageview"
            },
            "Affiliate Cookie": {
                cookie: "qb_affiliate",
                storeLength: "pageview"
            },
            "Basket Item 1 Category": {
                customJS: function() {
                    if (universal_variable && universal_variable.basket && universal_variable.basket.line_items && universal_variable.basket.line_items[0] && universal_variable.basket.line_items[0].product && universal_variable.basket.line_items[0].product.category) return universal_variable.basket.line_items[0].product.category
                },
                storeLength: "pageview"
            },
            "Basket Item 1 Price": {
                customJS: function() {
                    if (universal_variable && universal_variable.basket && universal_variable.basket.line_items && universal_variable.basket.line_items[0] && universal_variable.basket.line_items[0].product && universal_variable.basket.line_items[0].product.unit_sale_price) return universal_variable.basket.line_items[0].product.unit_sale_price.toString()
                },
                storeLength: "pageview"
            },
            "Basket Item 1 Quantity": {
                customJS: function() {
                    if (universal_variable && universal_variable.basket && universal_variable.basket.line_items && universal_variable.basket.line_items[0] && universal_variable.basket.line_items[0].quantity) return universal_variable.basket.line_items[0].quantity.toString()
                },
                storeLength: "pageview"
            },
            "Basket Items Length": {
                customJS: function() {
                    if (universal_variable && universal_variable.basket && universal_variable.basket.line_items) return universal_variable.basket.line_items.length.toString()
                },
                storeLength: "pageview"
            },
            "Category - pdt.html|criteria.html|c.html": {
                customJS: function() {
                    var e = universal_variable || {};
                    if ("undefined" != typeof e.product) return e.product.category.toLowerCase();
                    var t = window.location.href.substr(window.location.href.lastIndexOf("/") + 1);
                    return (t.indexOf("xx") > -1 ? window.location.pathname.split("/")[3] : t.substring(0, t.indexOf("-"))).toLowerCase()
                },
                storeLength: "pageview"
            },
            "Colour Swatch - data layer": {
                customJS: function() {
                    var e = universal_variable.events || [],
                        t = e.length - 1;
                    return e[t].swatches.chosenSwatch + "|" + e[t].swatches.numberOfSwatches
                },
                storeLength: "pageview"
            },
            "CRD - Delivery Grid - Data Layer": {
                customJS: function() {
                    function e(e) {
                        var t = [];
                        for (var n in e) t.push(n);
                        return t
                    }

                    function t(t, a, i) {
                        for (var o, s = 0; s < a; s++) {
                            i ? (i.push(e(n[t])[s]), o = n[t][i[s]]) : o = n[t][s];
                            var c = o.deliveryDay,
                                l = o.deliveryTime,
                                d = o.daysAway,
                                u = o.availableTimeSlots;
                            r.push(t + "|" + c + "|" + l + "|" + d + "|" + u)
                        }
                    }
                    for (var n = (universal_variable.analytics["150820: Delivery Timeslot"] || [])["CRD2-261"] || [], a = e(n), i = a.length, r = [], o = 0; o < i; o++) {
                        var s = a[o];
                        if ("BB" === s) {
                            t(s, e(n[s]).length)
                        } else {
                            var c = [];
                            t(s, e(n[a[o]]).length, c)
                        }
                    }
                    return r.join(",")
                },
                storeLength: "pageview"
            },
            "CRD - Store Selector - Data Layer": {
                jsVariable: "universal_variable.analytics.storeLogic",
                storeLength: "pageview"
            },
            Criteo_Acct: {
                customJS: function() {
                    var e = document.location.hostname;
                    return e.indexOf("pcworld.co.uk") > -1 ? "23883" : e.indexOf("currys.co.uk") > -1 ? "23730" : "NA"
                },
                storeLength: "pageview",
                forceLowerCase: !0
            },
            "DD - Cart - Base Amount": {
                jsVariable: "window.digitalData.cart.baseAmount",
                storeLength: "pageview"
            },
            "DD - Cart - Big Box Shipping Amount": {
                jsVariable: "window.digitalData.cart.shippingAmountByBoxType.bigBoxDeliveryAmount",
                storeLength: "pageview"
            },
            "DD - Cart - Discount Total Amount": {
                jsVariable: "window.digitalData.cart.discountTotalAmount",
                storeLength: "pageview"
            },
            "DD - Cart - Financing Available": {
                jsVariable: "window.digitalData.cart.financingAvailable",
                storeLength: "pageview"
            },
            "DD - Cart - Order Level Promo Code": {
                jsVariable: "window.digitalData.cart.orderLevelPromoCode",
                storeLength: "pageview"
            },
            "DD - Cart - Order Level Promo Name": {
                jsVariable: "window.digitalData.cart.orderLevelPromoName",
                storeLength: "pageview"
            },
            "DD - Cart - Order Level Promo Total": {
                jsVariable: "window.digitalData.cart.orderLevelPromoTotal",
                storeLength: "pageview"
            },
            "DD - Cart - Payment Methods": {
                customJS: function() {
                    var e = (((window.digitalData || {}).cart || {}).paymentMethods || "").trim();
                    if (e.length) return e
                },
                storeLength: "session",
                cleanText: !0
            },
            "DD - Cart - SBRE Shipping Amount": {
                jsVariable: "window.digitalData.cart.shippingAmountByBoxType.sbreDeliveryAmount",
                storeLength: "pageview"
            },
            "DD - Cart - Shipping Amount": {
                jsVariable: "window.digitalData.cart.shippingAmount",
                storeLength: "pageview"
            },
            "DD - Cart - Small Box Shipping Amount": {
                jsVariable: "window.digitalData.cart.shippingAmountByBoxType.smallBoxDeliveryAmount",
                storeLength: "pageview"
            },
            "DD - Cart - Tax Amount": {
                jsVariable: "window.digitalData.cart.taxAmount",
                storeLength: "pageview"
            },
            "DD - Cart - Total Amount": {
                jsVariable: "window.digitalData.cart.totalAmount",
                storeLength: "pageview"
            },
            "DD - Cart - Tradeplace Shipping Amount": {
                jsVariable: "window.digitalData.cart.shippingAmountByBoxType.tradeplaceDeliveryAmount",
                storeLength: "pageview"
            },
            "DD - Concat UC": {
                customJS: function() {
                    for (var e = [_satellite.getVar("DD - Page - Universe"), _satellite.getVar("DD - Page - Category")], t = [], n = 0; n < e.length; n++) e[n].length && t.push(e[n]);
                    return t.join(": ")
                },
                storeLength: "pageview"
            },
            "DD - Concat UCM": {
                customJS: function() {
                    for (var e = [_satellite.getVar("DD - Page - Universe"), _satellite.getVar("DD - Page - Category"), _satellite.getVar("DD - Page - Market")], t = [], n = 0; n < e.length; n++) e[n].length && t.push(e[n]);
                    return t.join(": ")
                },
                storeLength: "pageview"
            },
            "DD - Concat UCMS": {
                customJS: function() {
                    for (var e = [_satellite.getVar("DD - Page - Universe"), _satellite.getVar("DD - Page - Category"), _satellite.getVar("DD - Page - Market"), _satellite.getVar("DD - Page - Segment")], t = [], n = 0; n < e.length; n++) e[n].length && t.push(e[n]);
                    return t.join(": ")
                },
                storeLength: "pageview"
            },
            "DD - Dynamic Report Suite": {
                customJS: function() {
                    console.log("Customized Page Code Start");
                    var e = window.digitalData.page.pageURL;
                    console.log(e);
                    var t = "";
                    t = t = e.indexOf("currys.co.uk") > -1 ? "dixonsrtcurrysprod2" : e.indexOf("secure.currys.co.uk") > -1 ? "dixonsrtcurrysprod2" : e.indexOf("fo-currys") > -1 ? "dixonsrtcurrysdev2" : e.indexOf("pcworld.co.uk") > -1 ? "dixonsrtpcwprod2" : e.indexOf("secure.pcworld.co.uk") > -1 ? "dixonsrtcurrysdev2" : e.indexOf("fo-pcw") > -1 ? "dixonsrtpcwdev2" : "dixonsrtdtm-test", console.log("Report Suite dynamically set to " + t)
                },
                storeLength: "pageview"
            },
            "DD - Last Event Action": {
                customJS: function() {
                    var e = (window.digitalData || {}).events || [];
                    return (e[e.length - 1] || {}).eventAction || ""
                },
                storeLength: "pageview"
            },
            "DD - Last Event Name": {
                customJS: function() {
                    var e = (window.digitalData || {}).events || [];
                    return (e[e.length - 1] || {}).eventName || ""
                },
                storeLength: "pageview"
            },
            "DD - Page - All Selected Refinements": {
                customJS: function() {
                    for (var e = ((window.digitalData || {}).page || {}).refinement || [], t = [], n = document.location.pathname, a = 0; a < e.length; a++) n.indexOf("search-keywords") > -1 ? t.push(e[a].searchRefinementAttribute + ":" + e[a].searchRefinementValue) : "Product Category" !== e[a].searchRefinementAttribute && t.push(e[a].searchRefinementAttribute + ":" + e[a].searchRefinementValue);
                    return t.join(";")
                },
                storeLength: "pageview"
            },
            "DD - Page - Category": {
                jsVariable: "window.digitalData.page.category.primaryCategory",
                storeLength: "pageview"
            },
            "DD - Page - Market": {
                jsVariable: "window.digitalData.page.category.market",
                storeLength: "pageview"
            },
            "DD - Page - Page Name": {
                jsVariable: "window.digitalData.page.pageName",
                storeLength: "pageview"
            },
            "DD - Page - Page Type": {
                jsVariable: "window.digitalData.page.pageType",
                storeLength: "pageview"
            },
            "DD - Page - Page URL": {
                jsVariable: "window.digitalData.page.pageURL",
                storeLength: "pageview"
            },
            "DD - Page - Query String": {
                jsVariable: "window.digitalData.page.queryString",
                storeLength: "pageview"
            },
            "DD - Page - Rank Action": {
                jsVariable: "window.digitalData.page.rankAction",
                storeLength: "pageview"
            },
            "DD - Page - Rank Method": {
                jsVariable: "window.digitalData.page.rankMethod",
                storeLength: "pageview"
            },
            "DD - Page - Referring URL": {
                jsVariable: "window.digitalData.page.referringURL",
                storeLength: "pageview"
            },
            "DD - Page - Refinement Attributes Selected": {
                customJS: function() {
                    for (var e = ((window.digitalData || {}).page || {}).refinement || [], t = [], n = 0; n < e.length; n++) {
                        var a = e[n].searchRefinementAttribute || "";
                        t.push(a)
                    }
                    return t.join(",")
                },
                storeLength: "pageview"
            },
            "DD - Page - Refinement Values Selected": {
                customJS: function() {
                    for (var e = ((window.digitalData || {}).page || {}).refinement || [], t = [], n = 0; n < e.length; n++) {
                        var a = e[n].searchRefinementValue || "";
                        t.push(a)
                    }
                    return t.join(",")
                },
                storeLength: "pageview"
            },
            "DD - Page - Search Results": {
                jsVariable: "window.digitalData.page.onSiteSearchResults",
                "default": "0",
                storeLength: "pageview"
            },
            "DD - Page - Search Returned Results Term": {
                jsVariable: "window.digitalData.page.onSiteSearchReturnedResultsTerm",
                storeLength: "pageview"
            },
            "DD - Page - Search Term": {
                jsVariable: "window.digitalData.page.onSiteSearchTerm",
                storeLength: "pageview"
            },
            "DD - Page - Search Type": {
                jsVariable: "window.digitalData.page.onSiteSearchType",
                "default": "Not Set",
                storeLength: "pageview"
            },
            "DD - Page - Segment": {
                jsVariable: "window.digitalData.page.category.segment",
                storeLength: "pageview"
            },
            "DD - Page - Show Action": {
                jsVariable: "window.digitalData.page.showAction",
                storeLength: "pageview"
            },
            "DD - Page - Show Method": {
                jsVariable: "window.digitalData.page.showMethod",
                storeLength: "pageview"
            },
            "DD - Page - Universe": {
                jsVariable: "window.digitalData.page.category.universe",
                storeLength: "pageview"
            },
            "DD - Product - Availability Message": {
                customJS: function() {
                    return window.digitalData.product[0].availabilityMessage
                },
                storeLength: "pageview"
            },
            "DD - Product - Bundles Available": {
                customJS: function() {
                    return window.digitalData.product[0].bundlesAvailable
                },
                storeLength: "pageview"
            },
            "DD - Product - Category": {
                customJS: function() {
                    return window.digitalData.product[0].category.primaryCategory
                },
                storeLength: "pageview"
            },
            "DD - Product - Collection Type": {
                customJS: function() {
                    return window.digitalData.product[0].collectionType
                },
                storeLength: "pageview"
            },
            "DD - Product - Countdown - Color": {
                customJS: function() {
                    return window.digitalData.product[0].nextDayDeliveryCountdown.clockColor
                },
                storeLength: "pageview"
            },
            "DD - Product - Countdown - Enabled": {
                customJS: function() {
                    return window.digitalData.product[0].nextDayDeliveryCountdown.enabled
                },
                storeLength: "pageview"
            },
            "DD - Product - Countdown - Time Remaining": {
                customJS: function() {
                    return window.digitalData.product[0].nextDayDeliveryCountdown.timeRemaining
                },
                storeLength: "pageview"
            },
            "DD - Product - Credit JSON String": {
                customJS: function() {
                    var e = (window.digitalData || {}).product || {},
                        t = "";
                    for (var n in e) "undefined" != typeof e[n].credit && (t = JSON.stringify(e[n].credit));
                    return t
                },
                storeLength: "pageview"
            },
            "DD - Product - Current Price": {
                customJS: function() {
                    return window.digitalData.product[0].currentPrice
                },
                storeLength: "pageview"
            },
            "DD - Product - Download Eligible": {
                customJS: function() {
                    return window.digitalData.product[0].downloadEligible
                },
                storeLength: "pageview"
            },
            "DD - Product - Finance Availability": {
                customJS: function() {
                    return window.digitalData.product[0].financingAvailable
                },
                storeLength: "pageview"
            },
            "DD - Product - HD Eligible": {
                customJS: function() {
                    return window.digitalData.product[0].hdEligible
                },
                storeLength: "pageview"
            },
            "DD - Product - Is Forward Order": {
                customJS: function() {
                    return window.digitalData.product[0].isForwardOrder
                },
                storeLength: "pageview"
            },
            "DD - Product - Is Pre Order": {
                customJS: function() {
                    return window.digitalData.product[0].isPreOrder
                },
                storeLength: "pageview"
            },
            "DD - Product - Manufacturer": {
                customJS: function() {
                    return window.digitalData.product[0].manufacturer
                },
                storeLength: "pageview"
            },
            "DD - Product - Market": {
                customJS: function() {
                    return window.digitalData.product[0].category.market
                },
                storeLength: "pageview"
            },
            "DD - Product - Merchandise Area": {
                customJS: function() {
                    return window.digitalData.product[0].category.merchandiseArea
                },
                storeLength: "pageview"
            },
            "DD - Product - Merchandise Area ID": {
                customJS: function() {
                    return window.digitalData.product[0].category.merchandiseAreaID
                },
                storeLength: "pageview"
            },
            "DD - Product - P&C Eligible": {
                customJS: function() {
                    return window.digitalData.product[0].pacEligible
                },
                storeLength: "pageview"
            },
            "DD - Product - Planning Group": {
                customJS: function() {
                    return window.digitalData.product[0].category.planningGroup
                },
                storeLength: "pageview"
            },
            "DD - Product - Planning Group ID": {
                customJS: function() {
                    return window.digitalData.product[0].category.planningGroupID
                },
                storeLength: "pageview"
            },
            "DD - Product - Product ID": {
                customJS: function() {
                    return window.digitalData.product[0].productID
                },
                storeLength: "pageview"
            },
            "DD - Product - Product Name": {
                customJS: function() {
                    return window.digitalData.product[0].productName
                },
                storeLength: "pageview"
            },
            "DD - Product - Product Sku": {
                customJS: function() {
                    return window.digitalData.product[0].productSKU
                },
                storeLength: "pageview"
            },
            "DD - Product - R&C Eligible": {
                customJS: function() {
                    return window.digitalData.product[0].cisEligible
                },
                storeLength: "pageview"
            },
            "DD - Product - Savings Price": {
                customJS: function() {
                    return window.digitalData.product[0].savingsPrice
                },
                storeLength: "pageview"
            },
            "DD - Product - Segment": {
                customJS: function() {
                    return window.digitalData.product[0].category.segment
                },
                storeLength: "pageview"
            },
            "DD - Product - Stock Status": {
                customJS: function() {
                    return window.digitalData.product[0].stockStatus
                },
                storeLength: "pageview"
            },
            "DD - Product - Sub Planning Group": {
                customJS: function() {
                    return window.digitalData.product[0].category.subPlanningGroup
                },
                storeLength: "pageview"
            },
            "DD - Product - Sub Planning Group ID": {
                customJS: function() {
                    return window.digitalData.product[0].category.subPlanningGroupID
                },
                storeLength: "pageview"
            },
            "DD - Product - Universe": {
                customJS: function() {
                    return window.digitalData.product[0].category.universe
                },
                storeLength: "pageview"
            },
            "DD - Product - Was Price": {
                customJS: function() {
                    return window.digitalData.product[0].wasPrice
                },
                storeLength: "pageview"
            },
            "DD - Transaction - Base Amount": {
                jsVariable: "window.digitalData.transaction.baseAmount",
                storeLength: "pageview"
            },
            "DD - Transaction - Big Box Delivery Amount": {
                jsVariable: "window.digitalData.transaction.shippingAmountByBoxType.bigBoxDeliveryAmount",
                storeLength: "pageview"
            },
            "DD - Transaction - Currency": {
                jsVariable: "window.digitalData.transaction.currency",
                storeLength: "pageview"
            },
            "DD - Transaction - Discount Total Amount": {
                jsVariable: "window.digitalData.transaction.discountTotalAmount",
                storeLength: "pageview"
            },
            "DD - Transaction - Financing Available": {
                jsVariable: "window.digitalData.transaction.financingAvailable",
                storeLength: "pageview"
            },
            "DD - Transaction - Hashed Email": {
                jsVariable: "window.digitalData.transaction.user.hashedEmail",
                storeLength: "pageview"
            },
            "DD - Transaction - Order Level Promo Code": {
                jsVariable: "window.digitalData.transaction.orderLevelPromoCode",
                storeLength: "pageview"
            },
            "DD - Transaction - Order Level Promo Name": {
                jsVariable: "window.digitalData.transaction.orderLevelPromoName",
                storeLength: "pageview"
            },
            "DD - Transaction - Order Level Promo Total": {
                jsVariable: "window.digitalData.transaction.orderLevelPromoTotal",
                storeLength: "pageview"
            },
            "DD - Transaction - Order Ref": {
                jsVariable: "window.digitalData.transaction.orderRef",
                storeLength: "pageview"
            },
            "DD - Transaction - Payment Methods": {
                jsVariable: "window.digitalData.transaction.paymentMethods",
                storeLength: "pageview"
            },
            "DD - Transaction - Reservation ID": {
                jsVariable: "window.digitalData.transaction.reservationID",
                storeLength: "pageview"
            },
            "DD - Transaction - SBRE Delivery Amount": {
                jsVariable: "window.digitalData.transaction.shippingAmountByBoxType.sbreDeliveryAmount",
                storeLength: "pageview"
            },
            "DD - Transaction - Shipping Amount": {
                jsVariable: "window.digitalData.transaction.shippingAmount",
                storeLength: "pageview"
            },
            "DD - Transaction - Small Box Delivery Amount": {
                jsVariable: "window.digitalData.transaction.shippingAmountByBoxType.smallBoxDeliveryAmount",
                storeLength: "pageview"
            },
            "DD - Transaction - Tax Amount": {
                jsVariable: "window.digitalData.transaction.taxAmount",
                storeLength: "pageview"
            },
            "DD - Transaction - Total Amount": {
                jsVariable: "window.digitalData.transaction.totalAmount",
                storeLength: "pageview"
            },
            "DD - Transaction - Trade Place Delivery Amount": {
                jsVariable: "window.digitalData.transaction.shippingAmountByBoxType.tradeplaceDeliveryAmount",
                storeLength: "pageview"
            },
            "DD - Transaction - User Type": {
                jsVariable: "window.digitalData.transaction.user.type",
                storeLength: "pageview"
            },
            "DD - User - IP Address": {
                customJS: function() {
                    try {
                        window.digitalData;
                        return (window.users || [])[0].userIP
                    } catch (e) {
                        return _satellite.notify(e, 4), "RACE CONDITION - USER OBJECT"
                    }
                },
                storeLength: "pageview"
            },
            "DD - User - Registered": {
                customJS: function() {
                    return null === (((digitalData || {}).user || [])[0] || {}).hashedEmail ? "not registered" : "registered"
                },
                storeLength: "pageview"
            },
            "difference in days before delivery": {
                customJS: function() {
                    function e(e, t) {
                        return Math.round((t - e) / 864e5)
                    }
                    var t, n = document.getElementById("product-actions"),
                        a = document.getElementById("product-actions-touch");
                    "block" === getComputedStyle(n).display ? t = n : "block" === getComputedStyle(a).display ? t = a : (t = "", console.log("cannot see any product actions"));
                    var i = (t.querySelector("span#selected-delivery-date").innerHTML || "").split(" "),
                        r = i[1];
                    r = r.replace(/\D/g, ""), r = parseInt(r);
                    var o = (new Date).getFullYear(),
                        s = i[0] + " " + r + " " + i[2] + o;
                    return e((new Date).setHours(0, 0, 0, 0), s = new Date(s).setHours(0, 0, 0, 0))
                },
                storeLength: "pageview"
            },
            "Digital Data - Flexometer - Term": {
                customJS: function() {
                    var e = document.location.hostname,
                        t = "";
                    if ("www.currys.co.uk" == e) t = "";
                    else if ("www.pcworld.co.uk" == e) t = "";
                    else try {
                        var n = "";
                        n = window.digitalData.product;
                        for (var a = 0; a < n.length; a++) t = n[a].item.term
                    } catch (i) {
                        _satellite.notify("Product array not defined in data layer.", 4)
                    }
                    return t
                },
                storeLength: "pageview"
            },
            "Digital Data - Online Credit - Decision": {
                customJS: function() {
                    return window.digitalData.transaction[0].item[0].productInfo.decision
                },
                storeLength: "pageview"
            },
            "Digital Data - Online Credit Form - Credit Limit": {
                customJS: function() {
                    return window.digitalData.transaction[0].item[0].productInfo.creditLimit
                },
                storeLength: "pageview"
            },
            "Digital Data - Online Credit Form - Error Field": {
                customJS: function() {
                    try {
                        return window.digitalData.event[0].eventInfo.errorField
                    } catch (e) {
                        _satellite.notify("Object Property Not Available in Data Element: " + e, 4)
                    }
                },
                "default": "null",
                storeLength: "pageview"
            },
            "Digital Data - Online Credit Form - Error Message": {
                customJS: function() {
                    var e = document.location.hostname,
                        t = "";
                    if ("www.currys.co.uk" == e) t = "";
                    else if ("www.pcworld.co.uk" == e) t = "";
                    else try {
                        var n = "";
                        n = window.digitalData.event;
                        for (var a = 0; a < n.length; a++) t = n[a].eventInfo.errorMessage
                    } catch (i) {
                        _satellite.notify("Event array not defined in data layer.", 4)
                    }
                    return t
                },
                "default": "null",
                storeLength: "pageview"
            },
            "Digital Data - Online Credit Form - Error Type": {
                customJS: function() {
                    try {
                        return window.digitalData.event[0].eventInfo.errorType
                    } catch (e) {
                        _satellite.notify("Object Property Not Available in Data Element: " + e, 4)
                    }
                },
                "default": "null",
                storeLength: "pageview"
            },
            "Digital Data - Online Credit Form - Household Income": {
                jsVariable: "window.digitalData.page.pageInfo.applicationHHI",
                storeLength: "pageview"
            },
            "Digital Data - Online Credit Form - Monthly Payment Amount": {
                customJS: function() {
                    return window.digitalData.transaction[0].item[0].productInfo.monthlyPayment
                },
                storeLength: "pageview"
            },
            "Digital Data - Online Credit Form - Payment Holiday": {
                customJS: function() {
                    return window.digitalData.transaction[0].item[0].productInfo.paymentHoliday
                },
                storeLength: "pageview"
            },
            "Digital Data - Online Credit Form - Updated Asset": {
                customJS: function() {
                    try {
                        return window.digitalData.event[0].eventInfo.updatedAsset
                    } catch (e) {
                        _satellite.notify("Object Property Not Available in Data Element: " + e, 4)
                    }
                },
                "default": "null",
                storeLength: "pageview"
            },
            "Digital Data - Online Credit Form - Updated Value": {
                customJS: function() {
                    var e = document.location.hostname,
                        t = "";
                    if ("www.currys.co.uk" == e) t = "";
                    else if ("www.pcworld.co.uk" == e) t = "";
                    else try {
                        var n = "";
                        n = window.digitalData.event;
                        for (var a = 0; a < n.length; a++) t = n[a].eventInfo.updatedValue
                    } catch (i) {
                        _satellite.notify("Event array not defined in data layer.", 4)
                    }
                    return t
                },
                "default": "null",
                storeLength: "pageview"
            },
            "Digital Data - Pages - Page Name": {
                jsVariable: "window.digitalData.page.pageInfo.pageName",
                storeLength: "pageview"
            },
            "Digital Data - Pages - Page Type": {
                jsVariable: "window.digitalData.page.pageInfo.pageType",
                storeLength: "pageview"
            },
            "Digital Data - Page URL": {
                customJS: function() {
                    try {
                        return window.digitalData.page.pageInfo.pageURL
                    } catch (e) {
                        _satellite.notify("Object Property Not Available in Data Element: " + e, 4)
                    }
                },
                storeLength: "pageview"
            },
            "Digital Data - Site": {
                customJS: function() {
                    try {
                        return window.digitalData.siteId
                    } catch (e) {
                        _satellite.notify("Object Property Not Available in Data Element: " + e, 4)
                    }
                },
                storeLength: "pageview"
            },
            "document location hash": {
                customJS: function() {
                    var e = document.location.hash;
                    return ("/" == e.charAt(1) ? e.slice(0, 1) + e.slice(2) : e).substr(1)
                },
                storeLength: "pageview"
            },
            "DTM Rule Fired": {
                jsVariable: "_satellite.configurationSettings.pageLoadRules[0].name",
                storeLength: "pageview"
            },
            "Filter Attribute + Value - Event Label": {
                customJS: function() {
                    var e = (window.digitalData || {}).events || [],
                        t = e[e.length - 1] || {},
                        n = t.data || {};
                    if ("Refinement interaction" === t.eventName) return n.eventRefinementAttribute + " - " + n.eventRefinementValue
                },
                "default": "N/A",
                storeLength: "pageview"
            },
            Fld_Domain: {
                customJS: function() {
                    var e = document.location.hostname;
                    return e.indexOf("pcworld.co.uk") > -1 ? "pcwor0" : e.indexOf("currys.co.uk") > -1 ? "curry0" : "NA"
                },
                storeLength: "pageview",
                forceLowerCase: !0
            },
            "Internal - Link Tracking - b parameter": {
                queryParam: "b",
                storeLength: "pageview",
                forceLowerCase: !0,
                ignoreCase: 1
            },
            "Local Storage - DMP Segments": {
                customJS: function() {
                    return (localStorage || {}).kxdixons_allsegs || ""
                },
                storeLength: "pageview"
            },
            "MCD - Collect In Store Displayed": {
                customJS: function() {
                    var e = (universal_variable || {}).events || [],
                        t = -1,
                        n = [];
                    for (var a in e) {
                        "Collect in Store Displayed" === ((e[a].eventInfo || {}).eventName || "") && (t = a)
                    }
                    if (t > -1) {
                        var i = ((e[t] || {}).eventInfo || {}).eventAttribute || {};
                        for (var a in i) n.push(i[a]);
                        return n.join("|")
                    }
                },
                storeLength: "pageview"
            },
            "MCD - Countdown Clock - Colour": {
                customJS: function() {
                    var e, t = document.querySelector("div#product-actions");
                    return "block" !== getComputedStyle(t).display && (t = document.querySelector("div#product-actions-touch")), (e = t.querySelectorAll("div.countdown-component span.time-items span.item")) && e.length > 0 ? getComputedStyle(e[0]).color : "ERROR: NO COLOR DEFINED"
                },
                storeLength: "pageview"
            },
            "MCD - Countdown Clock - Enabled": {
                customJS: function() {
                    var e, t = document.querySelector("div#product-actions");
                    return (e = "block" === getComputedStyle(t).display ? DCG.$("div#product-actions div.countdown-component:visible") : DCG.$("div#product-actions-touch div.countdown-component:visible")) && e.length > 0 ? "ENABLED" : "DISABLED"
                },
                storeLength: "pageview"
            },
            "MCD - Countdown Clock - Time": {
                customJS: function() {
                    function e(e) {
                        for (var t, n = [], a = 0; a < e.length; a++) t = (e[a].innerText || e[a].textContent).split(" ")[0], n.push(t);
                        return n[0] + ":" + n[1] + ":" + n[2]
                    }
                    var t, n = document.querySelector("div#product-actions");
                    return "block" !== getComputedStyle(n).display && (n = document.querySelector("div#product-actions-touch")), (t = n.querySelectorAll("div.countdown-component span.time-items span.item")) && t.length > 0 ? e(t) : "ERROR: NO TIME DEFINED"
                },
                storeLength: "pageview"
            },
            "MCD - Free delivery button - difference in days before delivery": {
                customJS: function() {
                    function e(e, t) {
                        return Math.round((t - e) / 864e5)
                    }
                    var t, n = document.getElementById("product-actions"),
                        a = document.getElementById("product-actions-touch");
                    "block" === getComputedStyle(n).display ? t = n : "block" === getComputedStyle(a).display ? t = a : (t = "", console.log("cannot see any product actions"));
                    var i = t.querySelector("div.wrapper.free-delivery-button").innerText || t.querySelector("div.wrapper.free-delivery-button").textContent;
                    i = i.match(/[0-9].*/)[0].split(" "), _satellite.notify(i);
                    var r = i[0];
                    r = r.replace(/\D/g, ""), r = parseInt(r);
                    var o = (new Date).getFullYear(),
                        s = r + " " + i[1] + o;
                    return e((new Date).setHours(0, 0, 0, 0), s = new Date(s).setHours(0, 0, 0, 0))
                },
                storeLength: "pageview"
            },
            "MCD - Geolocation / Typed": {
                customJS: function() {
                    var e = universal_variable.analytics.searchType || "";
                    return "Geolocation" === e ? e : "Typed"
                },
                storeLength: "pageview"
            },
            "MCD - Geolocation/Typed/Autocompletion": {
                customJS: function() {
                    var e = universal_variable.analytics.searchType || "",
                        t = universal_variable.analytics["Auto Stock Check Postal Code"];
                    return "Geolocation" === e ? e : "" != t ? "Autocompletion" : "Typed"
                },
                storeLength: "pageview"
            },
            "MCD - Price Promise - isCurrysCheaper": {
                customJS: function() {
                    var e = (((universal_variable || {}).product || {}).pricePromise || {}).isCurryesCheapest;
                    return void 0 !== e ? e + "" : ""
                },
                storeLength: "pageview"
            },
            "MCD - Price Promise - priceMessageType": {
                jsVariable: "universal_variable.product.pricePromise.priceMessageType",
                storeLength: "pageview"
            },
            "MCD - Price Promise - priceTableData": {
                customJS: function() {
                    function e(e, t) {
                        return "matched" == n.priceMessageType ? (e / t).toFixed(2) : undefined
                    }

                    function t(e) {
                        var t = parseFloat(e),
                            n = 100 * parseFloat(1 - t).toFixed(2);
                        if (void 0 !== n) {
                            if (n > .01 && n <= 2.5) return "0 to -2.5";
                            if (n >= 2.51 && n <= 5) return "-2.5 to -5";
                            if (n >= 5.01 && n <= 10) return "-5 to -10";
                            if (n >= 10.01 && n <= 20) return "-10 to -20";
                            if (n > 20) return "< -20";
                            if (0 == n) return "0"
                        }
                    }
                    var n = ((universal_variable || {}).product || {}).pricePromise || {},
                        a = (n.priceTableData || "").split("|"),
                        i = [],
                        r = [],
                        o = [],
                        s = [],
                        c = [],
                        l = [],
                        d = ["", "", "", "", ""],
                        u = [],
                        m = !1,
                        p = [{
                            id: 20,
                            name: "currys.co.uk"
                        }, {
                            id: 30,
                            name: "pcworld.co.uk"
                        }, {
                            id: 40,
                            name: "amazon.co.uk"
                        }, {
                            id: 50,
                            name: "appliancedeals.co.uk"
                        }, {
                            id: 60,
                            name: "ao.com"
                        }, {
                            id: 80,
                            name: "asda.com"
                        }, {
                            id: 130,
                            name: "coopelectricalshop.co.uk"
                        }, {
                            id: 140,
                            name: "dabs.com"
                        }, {
                            id: 170,
                            name: "ebuyer.com"
                        }, {
                            id: 180,
                            name: "game.co.uk"
                        }, {
                            id: 200,
                            name: "jessops.com"
                        }, {
                            id: 210,
                            name: "johnlewis.com"
                        }, {
                            id: 290,
                            name: "richersounds.com"
                        }, {
                            id: 300,
                            name: "sainsburys.co.uk"
                        }, {
                            id: 310,
                            name: "staples.co.uk"
                        }, {
                            id: 320,
                            name: "tesco.com"
                        }, {
                            id: 330,
                            name: "argos.co.uk"
                        }, {
                            id: 390,
                            name: "appliance-world.co.uk"
                        }, {
                            id: 430,
                            name: "halfords.com"
                        }, {
                            id: 440,
                            name: "very.co.uk"
                        }, {
                            id: 460,
                            name: "empiredirectappliances.co.uk"
                        }, {
                            id: 480,
                            name: "electricshop.com"
                        }, {
                            id: 500,
                            name: "argos.ie"
                        }, {
                            id: 510,
                            name: "did.ie"
                        }, {
                            id: 520,
                            name: "powercity.ie"
                        }, {
                            id: 540,
                            name: "harveynorman.ie"
                        }, {
                            id: 560,
                            name: "expert.ie"
                        }, {
                            id: 580,
                            name: "carphonewarehouse.com"
                        }, {
                            id: 600,
                            name: "currys.ie"
                        }, {
                            id: 610,
                            name: "wexphotographic.com"
                        }, {
                            id: 630,
                            name: "debenhams.ie"
                        }, {
                            id: 640,
                            name: "littlewoodsireland.ie"
                        }, {
                            id: 690,
                            name: "appliancesdirect.co.uk"
                        }, {
                            id: 700,
                            name: "365electrical.com"
                        }, {
                            id: 720,
                            name: "hughesdirect.co.uk"
                        }, {
                            id: 730,
                            name: "prcdirect.co.uk"
                        }, {
                            id: 740,
                            name: "rangecookers.co.uk"
                        }, {
                            id: 750,
                            name: "rgbdirect.co.uk"
                        }, {
                            id: 760,
                            name: "parkcameras.com"
                        }],
                        g = [];
                    a.map(function(e) {
                        var t = e.split(":");
                        20 != t[0] && (i.push({
                            id: t[0],
                            price: t[1]
                        }), c.push(t[0]), o.push(parseFloat(t[1]))), r.push({
                            id: t[0],
                            price: t[1]
                        }), l.push(t[0]), s.push(t[1])
                    });
                    var v = 0,
                        f = 0,
                        h = o[0],
                        b = [];
                    for (var y in l) 20 == l[y] && (f = y);
                    for (var y in o) o[y] < h && (v = y);
                    var w = {};
                    w = i[v] > i[b[0]] ? i[b[0]] : i[v];
                    var S = r[f],
                        L = e(S.price, w.price),
                        k = t(L),
                        _ = [w.id, w.price, L, k];
                    if (40 != _[0] && 330 != _[0] && 500 != _[0] && 320 != _[0] && 210 != _[0] && 60 != _[0] || (m = !0), i.map(function(n) {
                            var a = n.id,
                                i = n.price,
                                r = e(S.price, i),
                                o = t(r);
                            40 == a ? (d[0] = {
                                id: a,
                                price: i,
                                diff: r,
                                bucket: o
                            }, u[0] = parseInt(i)) : 330 == a ? (d[1] = {
                                id: a,
                                price: i,
                                diff: r,
                                bucket: o
                            }, u[1] = parseInt(i)) : 500 == a ? (d[1] = {
                                id: a,
                                price: i,
                                diff: r,
                                bucket: o
                            }, u[1] = parseInt(i)) : 320 == a ? (d[2] = {
                                id: a,
                                price: i,
                                diff: r,
                                bucket: o
                            }, u[2] = parseInt(i)) : 210 == a ? (d[3] = {
                                id: a,
                                price: i,
                                diff: r,
                                bucket: o
                            }, u[3] = parseInt(i)) : 60 == a && (d[4] = {
                                id: a,
                                price: i,
                                diff: r,
                                bucket: o
                            }, u[4] = parseInt(i))
                        }), m) A = _;
                    else {
                        var C = 0,
                            D = u[0];
                        for (y = 0; y < u.length; y++) {
                            void 0 === D && (D = u[y]), u[y] < D && u[y] != D && (C = y)
                        }
                        var P = d[C],
                            x = e(S.price, P.price),
                            T = t(x),
                            A = [P.id, P.price, x, T]
                    }
                    p.map(function(e) {
                        _[0] == e.id && (_[0] = e.name.split(".")[0]), A[0] == e.id && (A[0] = e.name.split(".")[0])
                    });
                    for (y = 0; y < d.length; y++) g.push(d[y].price, d[y].diff, d[y].bucket);
                    var I = [S.price, _.join(";"), A.join(";")];
                    return _satellite.setVar("MCD - Price Promise - Primary Competitors", g.join(";")), I.join(";")
                },
                storeLength: "pageview"
            },
            "MCD - Step Page - FUPID": {
                customJS: function() {
                    return window.location.pathname.substring(1).split("/")[2]
                },
                storeLength: "pageview"
            },
            "MCD - Stock Checker - Autocomplete Postcode": {
                customJS: function() {
                    return universal_variable.analytics["Auto Stock Check Postal Code"]
                },
                storeLength: "pageview"
            },
            "MCD - Stock Checker - Deliver/Collect in store default view": {
                customJS: function() {
                    if (window.location.pathname.indexOf("pdt.html") > -1) {
                        var e, t = document.querySelector("#product-actions");
                        return "block" === window.getComputedStyle(t).display ? (e = t, tab1 = e.querySelector("div#mcd-desktop-tab1")) : (e = document.querySelector("#product-actions-touch"), tab1 = e.querySelector("div#mcd-touch-tab1")), "block" === window.getComputedStyle(tab1).display ? "Home delivery" : "Collect in store"
                    }
                    return "Listing Page"
                },
                storeLength: "pageview"
            },
            "MCD - Stock Checker - Error Message": {
                customJS: function() {
                    return "Stock Checker: " + universal_variable.analytics.locationchange.location + "|" + universal_variable.analytics.locationchange.statusText
                },
                storeLength: "pageview"
            },
            "MCD - Stock Checker - Location": {
                jsVariable: "universal_variable.analytics.locationchange.location",
                storeLength: "pageview"
            },
            "MCD - Stock Checker - Post Code": {
                jsVariable: "universal_variable.analytics.locationchange.postcode",
                storeLength: "pageview"
            },
            "MCD - Stock Checker - Search Term": {
                jsVariable: "universal_variable.analytics.locationchange.term",
                storeLength: "pageview"
            },
            "MCD - Stock Checker - Search Term|Location|Postcode|Typed/Geolocated|useCase": {
                customJS: function() {
                    var e = window.universal_variable || {},
                        t = (((l = window.digitalData || {}).page || {}).pageName || "").indexOf("Televisions") > -1,
                        n = e.events || [],
                        a = ((n[n.length - 1] || {}).eventInfo || {}).eventAttribute || {},
                        i = a.term || "",
                        r = a.postcode || "",
                        o = a.location || "",
                        s = a.useCase.description,
                        c = !(document.location.pathname.indexOf("pdt.html") > -1);
                    if (c) {
                        for (var l, d, u = (l = window.digitalData || {}).events || [], m = 0; m < u.length; m++) "Product interaction" === u[m].eventName && "Product Stock Status Check" === u[m].eventAction && (d = u[m]);
                        var p = (d.data || {}).products || [],
                            g = ["", "", "", ""];
                        for (m = 0; m < p.length; m++) {
                            var v = p[m].soonestDelivery + ":" + p[m].soonestFreeDelivery,
                                f = p[m].availabilityStatus.split("|")[0];
                            if ("null:null" !== v && "DELIVERABLE" === f)
                                if (t) {
                                    var h = p[m].productName,
                                        b = parseInt(h.substring(h.indexOf('"') - 2, h.indexOf('"')));
                                    b < 39 && g[2] !== v ? g[2] = v : b >= 39 && g[3] !== v && (g[3] = v)
                                } else g[2] = v;
                            else "null:null" === v && "DELIVERABLE" === f ? "FO" !== g[1] && (g[1] = "FO") : "null:null" === v && "UNDELIVERABLE" === f && "OOS" !== g[0] && (g[0] = "OOS")
                        }
                        p.length < l.products.length && g.indexOf("OOS") < 0 && (g[0] = "OOS")
                    }
                    return [i, r, o, _satellite.getVar("MCD - Geolocation / Typed"), s, c ? g.join(";") : ""].join("|")
                },
                storeLength: "pageview"
            },
            "MCD - Store Locator": {
                customJS: function() {
                    var e = (universal_variable || {}).events || [],
                        t = -1,
                        n = [];
                    for (var a in e) {
                        "Store locator event" === (e[a].eventName || "") && (t = a)
                    }
                    if (t > -1) {
                        var i = ((e[t] || {}).eventInfo || {}).storesReturned || [];
                        for (a = 0; a < 5; a++) n.push(i[a].distance + ":" + i[a].id);
                        return n.join("|")
                    }
                },
                storeLength: "pageview"
            },
            "MCD - View Store Opening Hours": {
                customJS: function() {
                    var e = window.digitalData || {},
                        t = (window.universal_variable || {}).events || {},
                        n = e.events || [],
                        a = n[n.length - 1];
                    if ("object" == typeof a && "View Store Opening Hours" === a.eventAction) {
                        for (var i = parseInt(a.data.storeClicked) || 0, r = {}, o = {}, s = 0; s < n.length; s++) "Store Locator Search" === n[s].eventAction && (r = n[s]);
                        for (s = 0; s < t.length; s++) "Collect in Store Displayed" === t[s].eventInfo.eventName && (o = t[s]);
                        var c = (o.eventInfo || {}).eventAttribute || {},
                            l = [];
                        for (var s in c) l.push(c[s]);
                        var d = (r.data || {}).storesReturned || [],
                            u = i > d.length ? i - 1 : i,
                            m = d[u - 1] || {},
                            p = [u, m.storeId || "", m.storeStatus || "", l[u - 1]];
                        return [a.eventName, a.eventAction, p.join(":")].join("|")
                    }
                },
                storeLength: "pageview"
            },
            "Message Alert - Services Attach": {
                customJS: function() {
                    var e = document.querySelector('div[data-component="alert"][data-type="MESSAGE"]').getElementsByTagName("strong")[0];
                    return e.innerText || e.textContent
                },
                storeLength: "pageview"
            },
            "MO - Basket - Services from s.products": {
                customJS: function() {
                    for (var e = (s.products || "").split(";") || [], t = [], n = 0; n < e.length; n++) {
                        var a = e[n] || "";
                        (a.indexOf("support") > -1 || a.indexOf("installation") > -1 || a.indexOf("promotional discount") > -1) && t.push(a)
                    }
                    return t.join("|")
                },
                storeLength: "pageview"
            },
            "My Account - Availability Check": {
                customJS: function() {
                    var e = (window.digitalData || {}).events || [],
                        t = e[e.length - 1] || {},
                        n = t.eventName || "",
                        a = t.eventAction || "",
                        i = t.data || {};
                    return [n, a, [i.populationType || "", i.searchTerm || ""].join(":")].join("|")
                },
                storeLength: "pageview"
            },
            "My Account - Availability Check Toggle": {
                customJS: function() {
                    var e = (window.digitalData || {}).events || [],
                        t = e[e.length - 1] || {},
                        n = t.eventName || "",
                        a = t.eventAction || "",
                        i = t.data || {};
                    return [n, a, [i.toggle ? "on" : "off", i.success ? "success" : "fail"].join(":")].join("|")
                },
                storeLength: "pageview"
            },
            "My Account - Order Search": {
                customJS: function() {
                    var e = (digitalData || {}).events || [],
                        t = e.length - 1,
                        n = e[t].eventName || "",
                        a = e[t].eventAction || "",
                        i = e[t].ordersSearchTerm || "";
                    return n + "|" + a + "|" + (e[t].ordersSearchType || "") + ":" + i
                },
                storeLength: "pageview"
            },
            "My Account - Price Drop Notify Toggle": {
                customJS: function() {
                    var e = (window.digitalData || {}).events || [],
                        t = e[e.length - 1] || {},
                        n = t.eventName || "",
                        a = t.eventAction || "",
                        i = t.data || {};
                    return [n, a, [i.toggle ? "on" : "off", i.success ? "success" : "fail"].join(":")].join("|")
                },
                storeLength: "pageview"
            },
            "My Account - Tracking Link Clicked": {
                customJS: function() {
                    if ("undefined" == typeof digitalData || "undefined" == typeof digitalData.events) return "";
                    var e = (digitalData || {}).events || [],
                        t = -1;
                    for (var n in e) {
                        "Tracking Link Clicked" == e[n].eventName && (t = n)
                    }
                    return e[t] ? e[t].trackingFupid + "|My Account Interaction|" + e[t].eventName + "|" + t : void 0
                },
                storeLength: "pageview"
            },
            "My Account - Update Personal Details": {
                customJS: function() {
                    var e = (digitalData || {}).events || [],
                        t = e[e.length - 1];
                    return t.eventName + "|" + t.eventAction + "|No Data"
                },
                storeLength: "pageview"
            },
            "Online Credit - bannerOpened": {
                customJS: function() {
                    var e = document.querySelector("div#banner_wrap div.more_content");
                    return window.getComputedStyle(e).display
                },
                storeLength: "pageview"
            },
            "Pathname - universe": {
                customJS: function() {
                    var e = document.location.pathname || "";
                    return ((e.substring(1, e.length) || "").split("/") || [])[1]
                },
                storeLength: "pageview"
            },
            "Postal search value through query selector": {
                customJS: function() {
                    return document.querySelector("input.check-postcode-input").value
                },
                storeLength: "pageview"
            },
            "Price promise opened status": {
                jsVariable: "universal_variable.abTest.pricePromise.priceTable",
                storeLength: "pageview"
            },
            "Product Page - Active Tab": {
                selector: "#product-tabs .tab-active",
                property: "text",
                storeLength: "pageview"
            },
            "Product Page - Flexible Credit Available": {
                selector: "a.bullet-link.anchor-lk",
                property: "href",
                storeLength: "pageview"
            },
            "Product Page Sticker": {
                selector: ".sticker",
                property: "src",
                storeLength: "pageview"
            },
            "Query String - cmpid": {
                queryParam: "cmpid",
                storeLength: "pageview",
                ignoreCase: 1
            },
            "Query String - Email Campaign Tracking Code": {
                queryParam: "emid",
                storeLength: "pageview",
                ignoreCase: 1
            },
            "Query String - Internal Campaigns": {
                queryParam: "intcmp",
                storeLength: "pageview",
                ignoreCase: 1
            },
            "Query String - Search": {
                queryParam: "s",
                storeLength: "pageview",
                ignoreCase: 1
            },
            "Reservation Number": {
                selector: 'span[data-order="reservationNumber"]',
                property: "text",
                storeLength: "pageview",
                forceLowerCase: !0,
                cleanText: !0
            },
            "Search Result Filtering - dataLayer": {
                jsVariable: "universal_variable.analytics.searchFilterTracking",
                storeLength: "pageview"
            },
            "Search Result Sorting - dataLayer": {
                jsVariable: "universal_variable.analytics.searchResultSorting",
                storeLength: "pageview"
            },
            "Software Offer": {
                customJS: function() {
                    var e = _satellite.data.customVars["Software Offer"] || "",
                        t = (universal_variable || {}).events || [];
                    if (t.length > 0) {
                        for (var n = "", a = "", i = "", r = !1, o = [], s = 0; s < t.length; s++) {
                            if (a = t[s].swoffers.offer[0].fupid, i = t[s].swoffers.offer[0].status, e.length > 0) {
                                o = e.split("|");
                                for (var c = 0; c < o.length; c++) - 1 !== o[c].indexOf(a) && (o[c] = a + ":" + i, r = !0)
                            }
                            r || o.push(a + ":" + i), n = o.join("|")
                        }
                        return n
                    }
                },
                storeLength: "session"
            },
            "Step Page FUPID": {
                customJS: function() {
                    return s.products.split(";")[1]
                },
                storeLength: "pageview"
            },
            "TouchComm - Basket Data": {
                customJS: function() {
                    if ("undefined" != typeof window.universal_variable.basket) {
                        for (var e = ((window.universal_variable || {}).basket || {}).line_items || [], t = [], n = [], a = [], i = [], r = 0; r < e.length; r++) {
                            var o = (e[r] || {}).product || {};
                            t.push(o.category), n.push(o.manufacturer), a.push(jQuery.trim(o.segment))
                        }
                        for (r = 0; r < t.length; r++) i.push({
                            category: t[r],
                            manufacturer: n[r],
                            segment: a[r]
                        });
                        return JSON.stringify(i)
                    }
                    if ("0" == (document.querySelector("#cart > span").textContent || basketCout.innerText)) return "[]"
                },
                "default": "[]",
                storeLength: "session"
            },
            "TouchComm - Basket Data (Order Summary)": {
                customJS: function() {
                    if ("undefined" != typeof window.universal_variable.basket) {
                        for (var e = ((window.universal_variable || {}).basket || {}).line_items || [], t = [], n = [], a = [], i = [], r = 0; r < e.length; r++) {
                            var o = (e[r] || {}).product || {};
                            t.push(o.category), n.push(o.manufacturer), a.push(jQuery.trim(o.segment))
                        }
                        for (r = 0; r < t.length; r++) i.push({
                            category: t[r],
                            manufacturer: n[r],
                            segment: a[r]
                        });
                        return JSON.stringify(i)
                    }
                },
                "default": "[]",
                storeLength: "session"
            },
            "TouchComm - Category": {
                jsVariable: "universal_variable.product.category",
                storeLength: "session"
            },
            "TouchComm - Manufacturer": {
                jsVariable: "universal_variable.product.manufacturer",
                storeLength: "session"
            },
            "TouchComm - Segment": {
                jsVariable: "universal_variable.product.segment",
                storeLength: "session",
                cleanText: !0
            },
            "Universal Variable - Order - Payment Type": {
                customJS: function() {
                    return universal_variable.transaction.paymenttype.trim()
                },
                storeLength: "session"
            },
            "URL parameters for target": {
                queryParam: "tntprm",
                storeLength: "pageview",
                ignoreCase: 1
            },
            "UV - Cart - Primary Categories Concat": {
                customJS: function() {
                    for (var e = ((window.universal_variable || {}).basket || {}).line_items || [], t = [], n = 0; n < e.length; n++) {
                        var a = (e[n].product || {}).category || "";
                        t.push(a)
                    }
                    if (e.length) return t.join("|")
                },
                storeLength: "visitor",
                cleanText: !0
            },
            "Was Price": {
                customJS: function() {
                    return (document.querySelectorAll("[data-key='was-price']") || []).length > 0 ? "true" : "false"
                },
                storeLength: "pageview"
            }
        },
        appVersion: "7QN",
        buildDate: "2018-03-19 10:58:19 UTC",
        publishDate: "2018-03-19 10:58:17 UTC"
    })
}(window, document);