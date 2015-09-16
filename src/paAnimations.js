(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _classDirective = require('./class.directive');

var _classDirective2 = _interopRequireDefault(_classDirective);

var _delayDirective = require('./delay.directive');

var _delayDirective2 = _interopRequireDefault(_delayDirective);

var _routerDirective = require('./router.directive');

var _routerDirective2 = _interopRequireDefault(_routerDirective);

var _module = angular.module('pa.animations', ['ngAnimate', _classDirective2['default'].name, _delayDirective2['default'].name, _routerDirective2['default'].name]);

exports['default'] = _module;
module.exports = exports['default'];

},{"./class.directive":2,"./delay.directive":3,"./router.directive":4}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var mod = angular.module('pa.animations.class', []),
    directiveName = 'paClass';

mod.directive(directiveName, ['$animate', '$parse', function ($animate, $parse) {
    return {
        restrict: 'A',
        require: [directiveName, '^?paRouter'],
        controller: ['$q', '$scope', '$attrs', '$element', function ($q, $scope, $attrs, $element) {
            var className = $attrs[directiveName] || directiveName,
                classNameStart = className + '--start',
                statusScopeVar = $attrs.paStatus;

            var status = '',
                deferred = undefined,
                resolve = function resolve() {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                return deferred && deferred.resolve(args);
            },
                setStatus = function setStatus(newStatus) {
                var statusM = undefined;
                if (statusScopeVar) {
                    statusM = $parse(statusScopeVar);
                    statusM.assign($scope, newStatus);
                }
                status = newStatus;
            },
                setUp = function setUp() {
                setStatus('READY');
                $element.addClass(classNameStart);
            },
                clear = function clear() {
                var clearDeferred = $q.defer();
                clearDeferred.resolve();

                if (status === 'RUNNING') {
                    //TODO we might want to reject this to handle this
                    //usecase, needs more cowbell
                    resolve();
                }
                setUp();

                return clearDeferred.promise;
            },
                runAnimation = function runAnimation() {
                setStatus('RUNNING');

                $animate.removeClass($element, classNameStart).then(function () {
                    if (status === 'RUNNING') {
                        setStatus('FINISHED');
                        resolve();
                    }
                });
            },
                play = function play() {
                if (status === 'READY') {
                    deferred = $q.defer();
                    runAnimation();
                }
                return deferred.promise;
            };

            //APIs used by linking function
            this.setUp = setUp;
            this.runAnimation = runAnimation;
            this.resolve = resolve;

            //Public APIs
            this.play = play;
            this.clear = clear;
        }],
        link: function link(scope, element, attrs, controllers) {
            var selfController = controllers[0],
                routerController = controllers[1],
                animationName = attrs.paAnimationName || directiveName;

            if (routerController) {
                routerController.register(animationName, selfController);
            }

            selfController.setUp();
            if (attrs.paActive) {
                scope.$watch(attrs.paActive, function (newVal) {
                    if (newVal) {
                        selfController.runAnimation();
                    } else if (attrs.paUndo) {
                        selfController.setUp();
                    }
                });
            }
        }
    };
}]);

exports['default'] = mod;
module.exports = exports['default'];

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var mod = angular.module('pa.animations.delay', []),
    directiveName = 'paDelay';

mod.directive(directiveName, ['$parse', 'paDelayS', function ($parse, paDelayS) {
    return {
        restrict: 'A',
        require: [directiveName, '^^?paRouter'],
        controller: ['$q', '$scope', '$attrs', function ($q, $scope, $attrs) {
            var millis = parseInt($attrs[directiveName], 10) || 1000,
                statusScopeVar = $attrs.paStatus;

            var status = '',
                deferred = undefined,
                resolve = function resolve() {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                return deferred && deferred.resolve(args);
            },
                setStatus = function setStatus(newStatus) {
                var statusM = undefined;
                if (statusScopeVar) {
                    statusM = $parse(statusScopeVar);
                    statusM.assign($scope, newStatus);
                }
                status = newStatus;
            },
                setUp = function setUp() {
                setStatus('READY');
            },
                clear = function clear() {
                var clearDeferred = $q.defer();
                clearDeferred.resolve();

                if (status === 'RUNNING') {
                    resolve();
                }
                setUp();

                return clearDeferred.promise;
            },
                runAnimation = function runAnimation() {
                setStatus('RUNNING');
                return paDelayS(millis).then(function () {
                    if (status === 'RUNNING') {
                        setStatus('FINISHED');
                        resolve();
                    }
                });
            },
                play = function play() {
                if (status === 'READY') {
                    deferred = $q.defer();
                    runAnimation();
                }
                return deferred.promise;
            };

            //APIs used by linking function
            this.setUp = setUp;
            this.runAnimation = runAnimation;
            this.resolve = resolve;

            //Public APIs
            this.play = play;
            this.clear = clear;
        }],
        link: function link(scope, element, attrs, controllers) {
            var selfController = controllers[0],
                routerController = controllers[1],
                animationName = attrs.paAnimationName || directiveName;

            if (routerController) {
                routerController.register(animationName, selfController);
            }

            selfController.setUp();
            if (attrs.paActive) {
                scope.$watch(attrs.paActive, function (newVal) {
                    if (newVal) {
                        selfController.play();
                    } else if (attrs.paUndo) {
                        selfController.setUp();
                    }
                });
            }
        }
    };
}]);

exports['default'] = mod;
module.exports = exports['default'];

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var mod = angular.module('pa.animations.router', []),
    directiveName = 'paRouter';

mod.directive(directiveName, ['$parse', function ($parse) {
    return {
        restrict: 'A',
        require: [directiveName, '^^?paRouter'],
        controller: ['$q', '$scope', '$attrs', function ($q, $scope, $attrs) {
            var statusScopeVar = $attrs.paStatus;

            var animations = [],
                customAnimationQueue = undefined,
                animationsMap = {},
                deferred = $q.defer(),
                status = '',
                register = function register(name, controller) {
                var order = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

                animations.push({
                    name: name,
                    controller: controller,
                    order: order,
                    pushOrder: animations.length
                });
                animationsMap[name] = controller;
            },
                setStatus = function setStatus(newStatus) {
                var statusM = undefined;
                if (statusScopeVar) {
                    statusM = $parse(statusScopeVar);
                    statusM.assign($scope, newStatus);
                }
                status = newStatus;
            },
                clear = function clear() {
                if (status === 'RUNNING') {
                    deferred.resolve();
                }

                setStatus('CLEARING');

                return $q.all(animations.map(function (animation) {
                    return animation.controller.clear();
                })).then(function () {
                    setStatus('READY');
                });
            },
                setUp = function setUp() {
                setStatus('READY');
            },
                runAnimation = function runAnimation() {
                var animationPromise = undefined,
                    ordered = animations.slice().sort(function (a, b) {
                    var delta = a.order - b.order;
                    return delta ? delta : a.pushOrder - b.pushOrder;
                }),
                    initDeferred = $q.defer();

                setStatus('RUNNING');
                initDeferred.resolve();

                if (!customAnimationQueue) {
                    //Used for init purposes only.
                    animationPromise = ordered.reduce(function (prev, curr) {
                        return prev.then(
                        //Prevent animation to run if cleared
                        function () {
                            return status === 'RUNNING' ? curr.controller.play() : prev;
                        });
                    }, initDeferred.promise).then(setStatus.bind(undefined, 'FINISHED'));
                } else {
                    animationPromise = customAnimationQueue(initDeferred).then(setStatus.bind(undefined, 'FINISHED'));
                }

                return animationPromise;
            },
                setCustomAnimation = function setCustomAnimation(animationQueue) {
                customAnimationQueue = animationQueue;
            },
                play = function play() {
                if (status === 'READY') {
                    deferred = $q.defer();
                    runAnimation().then(deferred.resolve.bind(deferred));
                }
                return deferred.promise;
            },
                getAnimation = function getAnimation(animationName) {
                return animationsMap[animationName];
            },
                getAllAnimations = function getAllAnimations() {
                return animationsMap;
            };

            //APIs used by linking function
            this.setUp = setUp;
            this.runAnimation = runAnimation;

            //Public APIs
            this.play = play;
            this.clear = clear;
            this.register = register;
            this.getAnimation = getAnimation;
            this.getAllAnimations = getAllAnimations;
            this.setCustomAnimation = setCustomAnimation;
        }],
        link: function link(scope, element, attrs, controllers) {
            var selfController = controllers[0],
                routerController = controllers[1],
                animationName = attrs.paAnimationName || directiveName;

            if (routerController) {
                routerController.register(animationName, selfController);
            }

            selfController.setUp();

            if (attrs.paActive) {
                scope.$watch(attrs.paActive, function (newVal) {
                    if (newVal) {
                        selfController.runAnimation();
                    } else if (attrs.paUndo) {
                        selfController.clear();
                    }
                });
            }
        }
    };
}]);

exports['default'] = mod;
module.exports = exports['default'];

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _scrollSpyScrollSpyModule = require('./scroll-spy/scroll-spy.module');

var _scrollSpyScrollSpyModule2 = _interopRequireDefault(_scrollSpyScrollSpyModule);

var _animationsAnimationsModule = require('./animations/animations.module');

var _animationsAnimationsModule2 = _interopRequireDefault(_animationsAnimationsModule);

var _utilsDelayService = require('./utils/delay.service');

var _utilsDelayService2 = _interopRequireDefault(_utilsDelayService);

var _module = angular.module('paAnimations', ['ngAnimate', _animationsAnimationsModule2['default'].name, _utilsDelayService2['default'].name, _scrollSpyScrollSpyModule2['default'].name]);

exports['default'] = _module;
module.exports = exports['default'];

},{"./animations/animations.module":1,"./scroll-spy/scroll-spy.module":7,"./utils/delay.service":10}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilsDebounceService = require('../utils/debounce.service');

var _utilsDebounceService2 = _interopRequireDefault(_utilsDebounceService);

var _utilsWindowScrollHelperService = require('../utils/window-scroll-helper.service');

var _utilsWindowScrollHelperService2 = _interopRequireDefault(_utilsWindowScrollHelperService);

var mod = angular.module('pa.scrollSpy.scrollContainer', [_utilsDebounceService2['default'].name, _utilsWindowScrollHelperService2['default'].name]);

mod.directive('paScrollContainer', ['$window', '$timeout', 'paDebounce', 'windowScrollGetter', function ($window, $timeout, paDebounce, windowScrollGetter) {
    return {
        restrict: 'A',
        controller: ['$scope', '$element', function ($scope, $element) {
            var _this = this;

            this.spies = [];
            this.registerSpy = function (spy) {
                _this.spies.push(spy);
            };

            this.getScrollContainer = function () {
                return $element[0];
            };
        }],
        link: function link(scope, elem, attrs, selfCtrl) {
            var afTimeout = 200;
            var vpHeight = undefined,
                $aWindow = angular.element($window),
                $scrollTopReference = elem[0].tagName === 'BODY' ? windowScrollGetter() : elem,
                $scroller = elem[0].tagName === 'BODY' ? $aWindow : elem,
                animationFrame = undefined,
                lastScrollTimestamp = 0,
                prevTimestamp = 0;

            function onScroll() {
                lastScrollTimestamp = $window.performance.now();
                if (!animationFrame) {
                    animationFrame = $window.requestAnimationFrame(onAnimationFrame);
                }
            }

            function onResize() {
                vpHeight = Math.max($window.document.documentElement.clientHeight, window.innerHeight || 0);
                selfCtrl.spies.forEach(function (spy) {
                    spy.updateClientRect();
                });
                onScroll();
            }

            function onAnimationFrame() {
                var viewportRect = getViewportRect(),
                    timestamp = $window.performance.now(),
                    delta = timestamp - prevTimestamp;

                selfCtrl.spies.forEach(function (spy) {
                    spy.update(viewportRect);
                });

                prevTimestamp = timestamp;
                prevTimestamp = timestamp;
                if (delta < afTimeout) {
                    queueAf();
                } else {
                    cancelAf();
                }
            }

            function getViewportRect() {
                var currentScroll = $scrollTopReference[0].scrollTop;
                return {
                    top: currentScroll,
                    height: vpHeight
                };
            }

            function queueAf() {
                animationFrame = $window.requestAnimationFrame(onAnimationFrame);
            }

            function cancelAf() {
                $window.cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }

            $aWindow.on('resize', paDebounce(onResize, 300));
            $scroller.on('scroll', onScroll);
            $timeout(onResize);
        }
    };
}]);

exports['default'] = mod;
module.exports = exports['default'];

},{"../utils/debounce.service":9,"../utils/window-scroll-helper.service":11}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _scrollContainerDirective = require('./scroll-container.directive');

var _scrollContainerDirective2 = _interopRequireDefault(_scrollContainerDirective);

var _visibleDirective = require('./visible.directive');

var _visibleDirective2 = _interopRequireDefault(_visibleDirective);

var mod = angular.module('pa.scrollSpy', [_scrollContainerDirective2['default'].name, _visibleDirective2['default'].name]);

//TODO: The current implementation works for scroll spies on the
// body element and for scroll divs when no parents are scrollable.
// The case where we have nested scroll elements has to be investigated.

exports['default'] = mod;
module.exports = exports['default'];

},{"./scroll-container.directive":6,"./visible.directive":8}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var mod = angular.module('pa.scrollSpy.visible', []);

mod.directive('paVisible', ['$window', function ($window) {
    return {
        restrict: 'A',
        require: '^^paScrollContainer',
        link: function link(scope, elem, attrs, ctrl) {
            var rect = {},
                scrollContainer = undefined,
                api = {
                updateClientRect: function updateClientRect() {
                    var clientRect = elem[0].getBoundingClientRect();
                    rect.top = clientRect.top + scrollContainer.scrollTop;
                    rect.left = clientRect.left + scrollContainer.scrollLeft;
                    rect.width = clientRect.width;
                    rect.height = clientRect.height;
                },
                update: function update(viewportRect) {
                    var isFullyVisible = rect.top >= viewportRect.top && //Top border in viewport
                    rect.top + rect.height <= viewportRect.top + viewportRect.height || //Bottom border in viewport
                    rect.top < viewportRect.top && rect.height >= viewportRect.height,
                        // Bigger than viewport

                    isFullyHidden = !isFullyVisible && rect.top > viewportRect.top + viewportRect.height || //Top border below viewport bottom
                    viewportRect.top + viewportRect.height < viewportRect.top; //Bottom border above viewport top

                    //Only change state when fully visible/hidden
                    if (isFullyVisible) {
                        api.setInView(true);
                    } else if (isFullyHidden) {
                        api.setInView(false);
                    }
                },
                getRect: function getRect() {
                    return rect;
                },
                setInView: function setInView(inView) {
                    if (scope[attrs.paVisible] !== inView) {
                        scope.$evalAsync(function () {
                            scope[attrs.paVisible] = inView;
                        });
                    }
                }
            };
            scrollContainer = ctrl.getScrollContainer() || $window.document.body;
            ctrl.registerSpy(api);
            api.updateClientRect();
        }
    };
}]);

exports['default'] = mod;
module.exports = exports['default'];

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var mod = angular.module('pa.utils.debounce', []);

mod.factory('paDebounce', ['$timeout', '$q', function ($timeout, $q) {
    return function (func, wait, immediate) {
        var timeout = undefined,
            deferred = $q.defer();

        return function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var context = undefined,
                later = function later() {
                timeout = null;
                if (!immediate) {
                    deferred.resolve(func.apply(context, args));
                    deferred = $q.defer();
                }
            },
                callNow = immediate && !timeout;
            if (timeout) {
                $timeout.cancel(timeout);
            }
            timeout = $timeout(later, wait);
            if (callNow) {
                deferred.resolve(func.apply(context, args));
                deferred = $q.defer();
            }
            return deferred.promise;
        };
    };
}]);

exports['default'] = mod;
module.exports = exports['default'];

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var mod = angular.module('pa.utils.delay', []);

mod.factory('paDelayS', ['$timeout', '$q', function ($timeout, $q) {
    return function (millis) {
        var deferred = $q.defer();
        $timeout(deferred.resolve.bind(deferred, millis), millis);
        return deferred.promise;
    };
}]);

exports['default'] = mod;
module.exports = exports['default'];

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var mod = angular.module('pa.utils.windowScrollHelper', []);

mod.factory('windowScrollGetter', ['$window', function ($window) {
    return function () {
        var docEl = $window.document.documentElement;
        var scrollContainer = undefined;

        docEl.scrollTop = 1;

        if (docEl.scrollTop === 1) {
            docEl.scrollTop = 0;
            scrollContainer = docEl;
        } else {
            scrollContainer = $window.document.body;
        }

        return angular.element(scrollContainer);
    };
}]);

exports['default'] = mod;
module.exports = exports['default'];

},{}]},{},[5])
//# sourceMappingURL=paAnimations.js.map
