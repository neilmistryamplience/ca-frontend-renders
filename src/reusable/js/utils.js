(function() {
    'use strict';
    var Utils = function() {
        this.retries = 0;
        this.timeout = 100;
    };

    Utils.prototype = {
        baseAjax: function(params) {
            //url, callback, formatData, errorCallback
            var self = this;
            var xhr = new XMLHttpRequest();
            var mime = params.mime ? params.mime : "application/json"
            xhr.overrideMimeType(mime);
            xhr.open('GET', params.url, true);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    var data = params.formatData ? params.formatData(xhr.responseText) : xhr.responseText;
                    if (data.length > 0) {
                        return params.callback(data);
                    } else {
                        console.error('Error retrieving data', xhr.responseText);
                        return params.callback(false);
                    }
                } else {
                    if (self.retries < 9) {
                        setTimeout(function() {
                            params.errorCallback(xhr.status);
                            self.timeout *= 2;
                            self.retries += 1;
                        }, self.timeout);
                    } else {
                        console.error('Error retrieving data', xhr.responseText);
                    }
                }
            };
            xhr.onerror = function() {
                console.error('Error xhr request');
            };
            xhr.send(null);
        },
        drawAmpImageMeta: function(){
            var images = document.querySelectorAll("[data-amp-image-actions]");
   for( var i=0; i<images.length; i++){
        var image = images[i];
        AmpCa.utils.getCaData({
            url:image.getAttribute("data-amp-image-actions"),
            context:image,
            manualLoadVis:true,
            callback: function (data, context) {
                var data = JSON.parse(data);

                // Lets find the hotspots first
                if( data && data.metadata && data.metadata.hotSpots){
                    if( (data.metadata.hotSpots.hasPoint ||  data.metadata.hotSpots.hasPolygon) && data.metadata.hotSpots.hotSpots.list){
                       var hotspots = data.metadata.hotSpots.hotSpots.list;
                       // Is there a polygon in the data? If so, create a map container
                       if( data.metadata.hotSpots.hasPolygon ){
                          // PUT BACK: $(theimg).append("<map name='" + $(this).data('mapname') + "' id='" + $(this).data('mapname') + "'></map>");
                       }
                       // Go through the hotspots
                       for( var i=0; i< hotspots.length; i++){
                          var hotspot = hotspots[i];
                          // Check for a type
                          if( hotspot.points.x && hotspot.points.y){
                             // This is a hotspot
                             var newx = 100 * hotspot.points.x;
                             var newy = 100 * hotspot.points.y;
                             // take away the size of the button to center...
                             //newx = newx - 15;
                             //newy = newy - 15;
                            var z = document.createElement('span');
                            z.setAttribute("class", "amp-ca-spot");
                            z.setAttribute("style", "left:" + newx + "%; top:" + newy + "%;");
                            var toolstring = "";
                            var hstext = "+"
                            var hsclass = "amp-ca-spot-btn";
                            if(hotspot.selector =='info'){
                                hstext = "i";
                                hsclass = "amp-ca-spot-btn tooltip-toggle";
                                toolstring = "data-tooltip='" + hotspot.target + "'";
                            }
                            z.innerHTML = "<a class='" + hsclass + "'" + toolstring + " data-amp-data='" + hotspot.selector + "' href='#' onclick='doAmplienceAction(" + JSON.stringify(hotspot) + ")' title='" + hotspot.target + "'>" + hstext + "</a>";
                            context.appendChild(z);
                          } else {

                            if( hotspot.points.length == 4){
                                // we have a square image map - get the percentages
                                var topperc = hotspot.points[0].y * 100;
                                var leftperc = hotspot.points[0].x * 100;
                                var wperc = ( hotspot.points[1].x -  hotspot.points[0].x) * 100;
                                var hperc = ( hotspot.points[2].y -  hotspot.points[0].y) * 100;

                                var p = document.createElement('a');
                                p.setAttribute("class", "amp-ca-poly");
                                p.setAttribute("style", "left:" + leftperc + "%; top:" + topperc + "%; width: " + wperc + "%; height: " + hperc + "%;");
                                p.setAttribute("title", hotspot.target);
                                p.setAttribute("alt", hotspot.target);
                                p.setAttribute("href", hotspot.target);
                                // add to node
                                context.appendChild(p);
                            }
                          }  
                       }
                    }
                 }

                /** Need to lay out data..... **/
                //var template = Handlebars.template(AmpCa.templates.image);
                //document.querySelectorAll(".js_image_wrap")[0].innerHTML = template(data[0]);

                /* Draw Hotspots*/
                //drawAmpImageMeta();

            }
        });
    }
        },







        getQueryVar: function(variable){
            var query = window.location.search.substring(1);
                 
            var vars = query.split('&');
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('=');
                if (decodeURIComponent(pair[0]) == variable) {
                    var caurl = decodeURIComponent(pair[1]);
                    return decodeURIComponent(pair[1]);
                }
            }
            return false;
        },

        getCaData: function(params) {
            var self = this;
            var retries = 0;

            // Function to have a sngle codebase for visualisations & live
            if(!params.manualLoadVis){

                var contentDeliveryUrl = this.getQueryVar('src');
                if( contentDeliveryUrl) params.url = contentDeliveryUrl;

                // Additions for Dynamic Content parameters
                var contentapi = this.getQueryVar('api');
                var contentid = this.getQueryVar('content');
                if(contentapi){
                    if(!contentid) contentid = params.auth.id;
                }

                if( contentapi && contentid){
                    params.url = encodeURI('//' + contentapi + '/cms/content/query?fullBodyObject=true&scope=tree&store=' +
                    params.auth.store + '&query={"sys.iri":"http://content.cms.amplience.com/' +
                    contentid + '"}&v=' + Date.now());
                }



            }
            /** End addition for loading visualisations **/

            var url = params.url ? params.url :
                encodeURI(params.auth.baseUrl + '/cms/content/query?fullBodyObject=true&scope=tree&store=' +
                    params.auth.store + '&query={"sys.iri":"http://content.cms.amplience.com/' +
                    params.auth.id + '"}&v=' + Date.now());

            return this.baseAjax({
                url: url,
                callback: function (data) {
                    // This logic ensures that the same content can be used in Live, Visualisations and Preview
                    if(!params.manualLoadVis){
                        if(data && data[0] && data[0]._meta && data[0]._meta.edition && data[0].Content)
                        {
                            params.callback(data[0].Content, params.context);
                        } else {
                            if(data && data[0] && data[0]._meta && data[0]._meta.schema && (data[0]._meta.schema.indexOf('/slots/') >= 0)){
                                params.callback(data[0].Content, params.context);
                            } else{
                               params.callback(data[0], params.context); 
                            }
                        }
                        // Hotspots on all images
                        self.drawAmpImageMeta();
                    }else{
                        params.callback(data, params.context);
                        
                    }
                    
                },
                errorCallback: function () {
                    self.getCaData(params);
                },
                formatData: function (data) {
                    return (params.formatData ? params.formatData(data) : data);
                }
            });
        },
        postProcessing: {
            exec: function(renderName, params) {
                var self = this;
                self.dependencies[renderName].forEach(function(fixName) {
                    self.handlers[fixName](params);
                });
            },
            dependencies: {
                slider: ['fixVideoButton', 'fixAndroidSwipeOverTheVideo'],
                video: ['fixVideoButton'],
                splitBlock: ['fixVideoButton'],
                blog: ['fixVideoButton'],
                container: ['fixVideoButton', 'fixAndroidSwipeOverTheVideo'],
            },
            handlers: {
                fixAndroidSwipeOverTheVideo: function() {
                    if (navigator.userAgent.match(/Android/i)) {
                        var videos = document.querySelectorAll('.amp-ca-slider .amp-ca-video');
                        videos = Array.prototype.slice.call(videos, 0);
                        videos.forEach(function(video, ix) {
                            var overlay = document.createElement('div');
                            overlay.style.width = video.clientWidth + 'px';
                            overlay.style.height = video.clientHeight - 30 + 'px';
                            overlay.style.marginBottom = -video.clientHeight + 30 + 'px';
                            overlay.className = 'inactive-video';
                            video.parentNode.parentNode.insertBefore(overlay, video.parentNode);
                            overlay.addEventListener('click', function() {
                                overlay.classList.add('no-overlay');
                                video.play();
                            });
                            video.addEventListener('pause', function() {
                                overlay.classList.remove('no-overlay');
                            });
                            window.addEventListener('resize', function() {
                                overlay.style.width = video.clientWidth + 'px';
                                overlay.style.height = video.clientHeight - 30 + 'px';
                                overlay.style.marginBottom = -video.clientHeight + 30 + 'px';
                            });
                        });

                    }
                },
                fixVideoButton: function() {
                    var videos = document.querySelectorAll('.amp-ca-video');
                    videos = Array.prototype.slice.call(videos, 0);
                    var pauseButtons = document.querySelectorAll('.pause-button');
                    pauseButtons = Array.prototype.slice.call(pauseButtons, 0);
                    var ev = 'click';
                    if (navigator.userAgent.match(/(iPad)|(iPhone)|(Android)/i)) {
                        ev = 'touchstart';
                    } else {
                        pauseButtons.forEach(function(item) {
                            item.classList.remove('inactive');
                        });
                    }
                    if (navigator.userAgent.match(/Android/i)) {
                        videos.forEach(function(video) {
                            video.addEventListener(ev, function() {
                                var self = this;
                                self.paused ? setTimeout(function() { self.play(); }, 1) : setTimeout(function() { self.pause(); }, 1);
                            });
                        });
                    } else {
                        var lock = [];
                        var lockInit = function(ix) {
                            lock[ix] = true;
                            setTimeout(function() {
                                lock[ix] = false;
                            }, 200);
                        };
                        videos.forEach(function(video, ix) {
                            lock[ix] = false;
                            video.addEventListener(ev, (function() {
                                return function() {
                                    if (!lock[ix]) {
                                        if (videos[ix].paused) {
                                            lockInit(ix);
                                            setTimeout(function() {
                                                videos[ix].paused ? videos[ix].play() : '';
                                            }, 200);
                                        } else {
                                            lockInit(ix);
                                            setTimeout(function() {
                                                videos[ix].pause();
                                            }, 200);
                                        }
                                    }
                                };
                            })(ix));
                            video.addEventListener('pause', function() {
                                pauseButtons[ix].classList.remove('inactive');
                            });
                            video.addEventListener('play', function() {
                                pauseButtons[ix].classList.add('inactive');

                            });
                            pauseButtons[ix].addEventListener(ev, function() {
                                if (!lock[ix]) {
                                    videos[ix].paused ? setTimeout(function() { videos[ix].play(); }, 1) : setTimeout(function() { videos[ix].pause(); }, 1);
                                    lockInit(ix);
                                }

                            });
                        });
                    }
                },
            }
        },
        constructor: Utils
    };

    window.AmpCa = window.AmpCa || {};
    window.AmpCa.Utils = Utils;
})();

/*===========================
 Utils AMD Export
 ===========================*/
if (typeof(module) !== 'undefined') {
    module.exports = window.AmpCa.Utils;
} else if (typeof define === 'function' && define.amd) {
    define([], function() {
        'use strict';
        return window.AmpCa.Utils;
    });
}