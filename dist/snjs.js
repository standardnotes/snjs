(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("SNLibrary", [], factory);
	else if(typeof exports === 'object')
		exports["SNLibrary"] = factory();
	else
		root["SNLibrary"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./lib/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../sncrypto/dist/sncrypto.js":
/*!************************************!*\
  !*** ../sncrypto/dist/sncrypto.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

!function (e, r) {
  "object" == ( false ? undefined : _typeof(exports)) && "object" == ( false ? undefined : _typeof(module)) ? module.exports = r() :  true ? !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (r),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)) : undefined;
}(window, function () {
  return function (e) {
    var r = {};

    function t(n) {
      if (r[n]) return r[n].exports;
      var o = r[n] = {
        i: n,
        l: !1,
        exports: {}
      };
      return e[n].call(o.exports, o, o.exports, t), o.l = !0, o.exports;
    }

    return t.m = e, t.c = r, t.d = function (e, r, n) {
      t.o(e, r) || Object.defineProperty(e, r, {
        enumerable: !0,
        get: n
      });
    }, t.r = function (e) {
      "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
        value: "Module"
      }), Object.defineProperty(e, "__esModule", {
        value: !0
      });
    }, t.t = function (e, r) {
      if (1 & r && (e = t(e)), 8 & r) return e;
      if (4 & r && "object" == _typeof(e) && e && e.__esModule) return e;
      var n = Object.create(null);
      if (t.r(n), Object.defineProperty(n, "default", {
        enumerable: !0,
        value: e
      }), 2 & r && "string" != typeof e) for (var o in e) {
        t.d(n, o, function (r) {
          return e[r];
        }.bind(null, o));
      }
      return n;
    }, t.n = function (e) {
      var r = e && e.__esModule ? function () {
        return e.default;
      } : function () {
        return e;
      };
      return t.d(r, "a", r), r;
    }, t.o = function (e, r) {
      return Object.prototype.hasOwnProperty.call(e, r);
    }, t.p = "", t(t.s = "./lib/main.js");
  }({
    "./lib/crypto/pure_crypto.js":
    /*!***********************************!*\
      !*** ./lib/crypto/pure_crypto.js ***!
      \***********************************/

    /*! exports provided: SNPureCrypto */
    function libCryptoPure_cryptoJs(e, r, t) {
      "use strict";

      t.r(r), t.d(r, "SNPureCrypto", function () {
        return u;
      });
      var n = t(
      /*! @Lib/utils */
      "./lib/utils.js");

      function o(e, r) {
        for (var t = 0; t < r.length; t++) {
          var n = r[t];
          n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
        }
      }

      var u = function () {
        function e() {
          !function (e, r) {
            if (!(e instanceof r)) throw new TypeError("Cannot call a class as a function");
          }(this, e);
        }

        var r, t, u;
        return r = e, (t = [{
          key: "generateUUIDSync",
          value: function value() {
            return Object(n.generateUUIDSync)();
          }
        }, {
          key: "generateUUID",
          value: function value() {
            return regeneratorRuntime.async(function (e) {
              for (;;) {
                switch (e.prev = e.next) {
                  case 0:
                    return e.abrupt("return", Object(n.generateUUIDSync)());

                  case 1:
                  case "end":
                    return e.stop();
                }
              }
            });
          }
        }, {
          key: "timingSafeEqual",
          value: function value(e, r) {
            var t = String(e),
                n = String(r),
                o = t.length,
                u = 0;
            o !== n.length && (n = t, u = 1);

            for (var a = 0; a < o; a++) {
              u |= t.charCodeAt(a) ^ n.charCodeAt(a);
            }

            return 0 === u;
          }
        }, {
          key: "base64",
          value: function value(e) {
            return regeneratorRuntime.async(function (r) {
              for (;;) {
                switch (r.prev = r.next) {
                  case 0:
                    return r.abrupt("return", Object(n.getGlobalScope)().btoa(encodeURIComponent(e).replace(/%([0-9A-F]{2})/g, function (e, r) {
                      return String.fromCharCode("0x" + r);
                    })));

                  case 1:
                  case "end":
                    return r.stop();
                }
              }
            });
          }
        }, {
          key: "base64Decode",
          value: function value(e) {
            return regeneratorRuntime.async(function (r) {
              for (;;) {
                switch (r.prev = r.next) {
                  case 0:
                    return r.abrupt("return", Object(n.getGlobalScope)().atob(e));

                  case 1:
                  case "end":
                    return r.stop();
                }
              }
            });
          }
        }]) && o(r.prototype, t), u && o(r, u), e;
      }();
    },
    "./lib/crypto/react_native_crypto.js":
    /*!*******************************************!*\
      !*** ./lib/crypto/react_native_crypto.js ***!
      \*******************************************/

    /*! exports provided: SNReactNativeCrypto */
    function libCryptoReact_native_cryptoJs(e, r, t) {
      "use strict";

      function n(e) {
        return (n = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (e) {
          return _typeof(e);
        } : function (e) {
          return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : _typeof(e);
        })(e);
      }

      function o(e, r) {
        for (var t = 0; t < r.length; t++) {
          var n = r[t];
          n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
        }
      }

      function u(e, r) {
        return !r || "object" !== n(r) && "function" != typeof r ? function (e) {
          if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
          return e;
        }(e) : r;
      }

      function a(e) {
        return (a = Object.setPrototypeOf ? Object.getPrototypeOf : function (e) {
          return e.__proto__ || Object.getPrototypeOf(e);
        })(e);
      }

      function c(e, r) {
        return (c = Object.setPrototypeOf || function (e, r) {
          return e.__proto__ = r, e;
        })(e, r);
      }

      t.r(r), t.d(r, "SNReactNativeCrypto", function () {
        return i;
      });

      var i = function (e) {
        function r() {
          return function (e, r) {
            if (!(e instanceof r)) throw new TypeError("Cannot call a class as a function");
          }(this, r), u(this, a(r).apply(this, arguments));
        }

        var t, n, i;
        return function (e, r) {
          if ("function" != typeof r && null !== r) throw new TypeError("Super expression must either be null or a function");
          e.prototype = Object.create(r && r.prototype, {
            constructor: {
              value: e,
              writable: !0,
              configurable: !0
            }
          }), r && c(e, r);
        }(r, e), t = r, (n = [{
          key: "setNativeModules",
          value: function value(e) {
            var r = e.aes,
                t = e.base64;
            this.Aes = r, this.base64 = t;
          }
        }, {
          key: "generateUUID",
          value: function value() {
            return regeneratorRuntime.async(function (e) {
              for (;;) {
                switch (e.prev = e.next) {
                  case 0:
                    return e.abrupt("return", this.Aes.randomUuid().then(function (e) {
                      return e.toLowerCase();
                    }));

                  case 1:
                  case "end":
                    return e.stop();
                }
              }
            }, null, this);
          }
        }, {
          key: "pbkdf2",
          value: function value(e, r, t, n) {
            return regeneratorRuntime.async(function (o) {
              for (;;) {
                switch (o.prev = o.next) {
                  case 0:
                    return o.abrupt("return", this.Aes.pbkdf2(e, r, t, n).then(function (e) {
                      return e;
                    }));

                  case 1:
                  case "end":
                    return o.stop();
                }
              }
            }, null, this);
          }
        }, {
          key: "generateRandomKey",
          value: function value(e) {
            return regeneratorRuntime.async(function (r) {
              for (;;) {
                switch (r.prev = r.next) {
                  case 0:
                    return r.abrupt("return", this.Aes.randomKey(e / 8));

                  case 1:
                  case "end":
                    return r.stop();
                }
              }
            }, null, this);
          }
        }, {
          key: "base64",
          value: function value(e) {
            return regeneratorRuntime.async(function (r) {
              for (;;) {
                switch (r.prev = r.next) {
                  case 0:
                    return r.abrupt("return", this.base64.encode(e));

                  case 1:
                  case "end":
                    return r.stop();
                }
              }
            }, null, this);
          }
        }, {
          key: "base64Decode",
          value: function value(e) {
            return regeneratorRuntime.async(function (r) {
              for (;;) {
                switch (r.prev = r.next) {
                  case 0:
                    return r.abrupt("return", this.base64.decode(e));

                  case 1:
                  case "end":
                    return r.stop();
                }
              }
            }, null, this);
          }
        }, {
          key: "sha256",
          value: function value(e) {
            return regeneratorRuntime.async(function (r) {
              for (;;) {
                switch (r.prev = r.next) {
                  case 0:
                    return r.abrupt("return", this.Aes.sha256(e));

                  case 1:
                  case "end":
                    return r.stop();
                }
              }
            }, null, this);
          }
        }, {
          key: "hmac256",
          value: function value(e, r) {
            return regeneratorRuntime.async(function (t) {
              for (;;) {
                switch (t.prev = t.next) {
                  case 0:
                    return t.abrupt("return", this.Aes.hmac256(e, r));

                  case 1:
                  case "end":
                    return t.stop();
                }
              }
            }, null, this);
          }
        }]) && o(t.prototype, n), i && o(t, i), r;
      }(t(
      /*! ./pure_crypto */
      "./lib/crypto/pure_crypto.js").SNPureCrypto);
    },
    "./lib/crypto/webcrypto.js":
    /*!*********************************!*\
      !*** ./lib/crypto/webcrypto.js ***!
      \*********************************/

    /*! exports provided: SNWebCrypto */
    function libCryptoWebcryptoJs(e, r, t) {
      "use strict";

      t.r(r), t.d(r, "SNWebCrypto", function () {
        return p;
      });
      var n = t(
      /*! ./pure_crypto */
      "./lib/crypto/pure_crypto.js"),
          o = t(
      /*! @Lib/utils */
      "./lib/utils.js");

      function u(e) {
        return (u = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (e) {
          return _typeof(e);
        } : function (e) {
          return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : _typeof(e);
        })(e);
      }

      function a(e, r) {
        for (var t = 0; t < r.length; t++) {
          var n = r[t];
          n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
        }
      }

      function c(e, r) {
        return !r || "object" !== u(r) && "function" != typeof r ? function (e) {
          if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
          return e;
        }(e) : r;
      }

      function i(e) {
        return (i = Object.setPrototypeOf ? Object.getPrototypeOf : function (e) {
          return e.__proto__ || Object.getPrototypeOf(e);
        })(e);
      }

      function s(e, r) {
        return (s = Object.setPrototypeOf || function (e, r) {
          return e.__proto__ = r, e;
        })(e, r);
      }

      var f = Object(o.getSubtleCrypto)(),
          p = function (e) {
        function r() {
          return function (e, r) {
            if (!(e instanceof r)) throw new TypeError("Cannot call a class as a function");
          }(this, r), c(this, i(r).apply(this, arguments));
        }

        var t, n, u;
        return function (e, r) {
          if ("function" != typeof r && null !== r) throw new TypeError("Super expression must either be null or a function");
          e.prototype = Object.create(r && r.prototype, {
            constructor: {
              value: e,
              writable: !0,
              configurable: !0
            }
          }), r && s(e, r);
        }(r, e), t = r, (n = [{
          key: "pbkdf2",
          value: function value(e) {
            var r, t, n, o, u;
            return regeneratorRuntime.async(function (a) {
              for (;;) {
                switch (a.prev = a.next) {
                  case 0:
                    return r = e.password, t = e.salt, n = e.iterations, o = e.length, a.next = 3, regeneratorRuntime.awrap(this.webCryptoImportKey(r, "PBKDF2", ["deriveBits"]));

                  case 3:
                    if (u = a.sent) {
                      a.next = 7;
                      break;
                    }

                    return console.log("Key is null, unable to continue"), a.abrupt("return", null);

                  case 7:
                    return a.abrupt("return", this.webCryptoDeriveBits(u, t, n, o));

                  case 8:
                  case "end":
                    return a.stop();
                }
              }
            }, null, this);
          }
        }, {
          key: "generateRandomKey",
          value: function value(e) {
            var r, t;
            return regeneratorRuntime.async(function (n) {
              for (;;) {
                switch (n.prev = n.next) {
                  case 0:
                    return r = e / 8, t = Object(o.getGlobalScope)().crypto.getRandomValues(new Uint8Array(r)), n.abrupt("return", this.arrayBufferToHexString(t));

                  case 3:
                  case "end":
                    return n.stop();
                }
              }
            }, null, this);
          }
        }, {
          key: "aes256CbcEncrypt",
          value: function value(e, r, t) {
            var n, o, u, a, c;
            return regeneratorRuntime.async(function (i) {
              for (;;) {
                switch (i.prev = i.next) {
                  case 0:
                    return n = {
                      name: "AES-CBC",
                      iv: t
                    }, i.next = 3, regeneratorRuntime.awrap(this.webCryptoImportKey(r, n.name, ["encrypt"]));

                  case 3:
                    return o = i.sent, i.next = 6, regeneratorRuntime.awrap(this.stringToArrayBuffer(e));

                  case 6:
                    return u = i.sent, i.next = 9, regeneratorRuntime.awrap(crypto.subtle.encrypt(n, o, u));

                  case 9:
                    return a = i.sent, i.next = 12, regeneratorRuntime.awrap(this.arrayBufferToBase64(a));

                  case 12:
                    return c = i.sent, i.abrupt("return", c);

                  case 14:
                  case "end":
                    return i.stop();
                }
              }
            }, null, this);
          }
        }, {
          key: "aes256CbcDecrypt",
          value: function value(e, r, t) {
            var n,
                o,
                u,
                a = this;
            return regeneratorRuntime.async(function (c) {
              for (;;) {
                switch (c.prev = c.next) {
                  case 0:
                    return n = {
                      name: "AES-CBC",
                      iv: t
                    }, c.next = 3, regeneratorRuntime.awrap(this.webCryptoImportKey(r, n.name, ["decrypt"]));

                  case 3:
                    return o = c.sent, c.next = 6, regeneratorRuntime.awrap(this.base64ToArrayBuffer(e));

                  case 6:
                    return u = c.sent, c.abrupt("return", crypto.subtle.decrypt(n, o, u).then(function (e) {
                      var r;
                      return regeneratorRuntime.async(function (t) {
                        for (;;) {
                          switch (t.prev = t.next) {
                            case 0:
                              return t.next = 2, regeneratorRuntime.awrap(a.arrayBufferToString(e));

                            case 2:
                              return r = t.sent, t.abrupt("return", r);

                            case 4:
                            case "end":
                              return t.stop();
                          }
                        }
                      });
                    }).catch(function (e) {
                      console.error("Error decrypting:", e);
                    }));

                  case 8:
                  case "end":
                    return c.stop();
                }
              }
            }, null, this);
          }
        }, {
          key: "aes256GcmEncrypt",
          value: function value(e, r, t, n) {
            var o, u, a, c, i;
            return regeneratorRuntime.async(function (s) {
              for (;;) {
                switch (s.prev = s.next) {
                  case 0:
                    return o = {
                      name: "AES-GCM",
                      iv: t
                    }, n && (o.additionalData = n), s.next = 4, regeneratorRuntime.awrap(this.webCryptoImportKey(r, o.name, ["encrypt"]));

                  case 4:
                    return u = s.sent, s.next = 7, regeneratorRuntime.awrap(this.stringToArrayBuffer(e));

                  case 7:
                    return a = s.sent, s.next = 10, regeneratorRuntime.awrap(crypto.subtle.encrypt(o, u, a));

                  case 10:
                    return c = s.sent, s.next = 13, regeneratorRuntime.awrap(this.arrayBufferToBase64(c));

                  case 13:
                    return i = s.sent, s.abrupt("return", i);

                  case 15:
                  case "end":
                    return s.stop();
                }
              }
            }, null, this);
          }
        }, {
          key: "aes256GcmDecrypt",
          value: function value(e, r, t, n) {
            var o,
                u,
                a,
                c = this;
            return regeneratorRuntime.async(function (i) {
              for (;;) {
                switch (i.prev = i.next) {
                  case 0:
                    return o = {
                      name: "AES-GCM",
                      iv: t
                    }, n && (o.additionalData = n), i.next = 4, regeneratorRuntime.awrap(this.webCryptoImportKey(r, o.name, ["decrypt"]));

                  case 4:
                    return u = i.sent, i.next = 7, regeneratorRuntime.awrap(this.base64ToArrayBuffer(e));

                  case 7:
                    return a = i.sent, i.abrupt("return", crypto.subtle.decrypt(o, u, a).then(function (e) {
                      var r;
                      return regeneratorRuntime.async(function (t) {
                        for (;;) {
                          switch (t.prev = t.next) {
                            case 0:
                              return t.next = 2, regeneratorRuntime.awrap(c.arrayBufferToString(e));

                            case 2:
                              return r = t.sent, t.abrupt("return", r);

                            case 4:
                            case "end":
                              return t.stop();
                          }
                        }
                      });
                    }).catch(function (e) {
                      console.error("Error decrypting:", e);
                    }));

                  case 9:
                  case "end":
                    return i.stop();
                }
              }
            }, null, this);
          }
        }, {
          key: "hmac256",
          value: function value(e, r) {
            var t,
                n,
                o,
                u = this;
            return regeneratorRuntime.async(function (a) {
              for (;;) {
                switch (a.prev = a.next) {
                  case 0:
                    return a.next = 2, regeneratorRuntime.awrap(this.hexStringToArrayBuffer(r));

                  case 2:
                    return t = a.sent, a.next = 5, regeneratorRuntime.awrap(this.webCryptoImportKey(t, "HMAC", ["sign"], {
                      name: "SHA-256"
                    }));

                  case 5:
                    return n = a.sent, a.next = 8, regeneratorRuntime.awrap(this.stringToArrayBuffer(e));

                  case 8:
                    return o = a.sent, a.abrupt("return", crypto.subtle.sign({
                      name: "HMAC"
                    }, n, o).then(function (e) {
                      var r;
                      return regeneratorRuntime.async(function (t) {
                        for (;;) {
                          switch (t.prev = t.next) {
                            case 0:
                              return t.next = 2, regeneratorRuntime.awrap(u.arrayBufferToHexString(e));

                            case 2:
                              return r = t.sent, t.abrupt("return", r);

                            case 4:
                            case "end":
                              return t.stop();
                          }
                        }
                      });
                    }).catch(function (e) {
                      console.error("Error computing hmac", e);
                    }));

                  case 10:
                  case "end":
                    return a.stop();
                }
              }
            }, null, this);
          }
        }, {
          key: "sha256",
          value: function value(e) {
            var r, t;
            return regeneratorRuntime.async(function (n) {
              for (;;) {
                switch (n.prev = n.next) {
                  case 0:
                    return n.next = 2, regeneratorRuntime.awrap(this.stringToArrayBuffer(e));

                  case 2:
                    return r = n.sent, n.next = 5, regeneratorRuntime.awrap(crypto.subtle.digest("SHA-256", r));

                  case 5:
                    return t = n.sent, n.abrupt("return", this.arrayBufferToHexString(t));

                  case 7:
                  case "end":
                    return n.stop();
                }
              }
            }, null, this);
          }
        }, {
          key: "unsafe_sha1",
          value: function value(e) {
            var r, t;
            return regeneratorRuntime.async(function (n) {
              for (;;) {
                switch (n.prev = n.next) {
                  case 0:
                    return n.next = 2, regeneratorRuntime.awrap(this.stringToArrayBuffer(e));

                  case 2:
                    return r = n.sent, n.next = 5, regeneratorRuntime.awrap(crypto.subtle.digest("SHA-1", r));

                  case 5:
                    return t = n.sent, n.abrupt("return", this.arrayBufferToHexString(t));

                  case 7:
                  case "end":
                    return n.stop();
                }
              }
            }, null, this);
          }
        }, {
          key: "webCryptoImportKey",
          value: function value(e, r, t, n) {
            var o;
            return regeneratorRuntime.async(function (u) {
              for (;;) {
                switch (u.prev = u.next) {
                  case 0:
                    if ("string" != typeof e) {
                      u.next = 6;
                      break;
                    }

                    return u.next = 3, regeneratorRuntime.awrap(this.stringToArrayBuffer(e));

                  case 3:
                    u.t0 = u.sent, u.next = 7;
                    break;

                  case 6:
                    u.t0 = e;

                  case 7:
                    return o = u.t0, u.abrupt("return", f.importKey("raw", o, {
                      name: r,
                      hash: n
                    }, !1, t).then(function (e) {
                      return e;
                    }).catch(function (e) {
                      return console.error(e), null;
                    }));

                  case 9:
                  case "end":
                    return u.stop();
                }
              }
            }, null, this);
          }
        }, {
          key: "webCryptoDeriveBits",
          value: function value(e, r, t, n) {
            var o,
                u = this;
            return regeneratorRuntime.async(function (a) {
              for (;;) {
                switch (a.prev = a.next) {
                  case 0:
                    return a.next = 2, regeneratorRuntime.awrap(this.stringToArrayBuffer(r));

                  case 2:
                    return a.t0 = a.sent, a.t1 = t, a.t2 = {
                      name: "SHA-512"
                    }, o = {
                      name: "PBKDF2",
                      salt: a.t0,
                      iterations: a.t1,
                      hash: a.t2
                    }, a.abrupt("return", f.deriveBits(o, e, n).then(function (e) {
                      var r;
                      return regeneratorRuntime.async(function (t) {
                        for (;;) {
                          switch (t.prev = t.next) {
                            case 0:
                              return t.next = 2, regeneratorRuntime.awrap(u.arrayBufferToHexString(new Uint8Array(e)));

                            case 2:
                              return r = t.sent, t.abrupt("return", r);

                            case 4:
                            case "end":
                              return t.stop();
                          }
                        }
                      });
                    }).catch(function (e) {
                      return console.error(e), null;
                    }));

                  case 7:
                  case "end":
                    return a.stop();
                }
              }
            }, null, this);
          }
        }, {
          key: "stringToArrayBuffer",
          value: function value(e) {
            return regeneratorRuntime.async(function (r) {
              for (;;) {
                switch (r.prev = r.next) {
                  case 0:
                    return r.abrupt("return", new Promise(function (r, t) {
                      var n = new Blob([e]),
                          o = new FileReader();
                      o.onload = function (e) {
                        r(e.target.result);
                      }, o.readAsArrayBuffer(n);
                    }));

                  case 1:
                  case "end":
                    return r.stop();
                }
              }
            });
          }
        }, {
          key: "arrayBufferToString",
          value: function value(e) {
            return regeneratorRuntime.async(function (r) {
              for (;;) {
                switch (r.prev = r.next) {
                  case 0:
                    return r.abrupt("return", new Promise(function (r, t) {
                      var n = new Blob([e]),
                          o = new FileReader();
                      o.onload = function (e) {
                        r(e.target.result);
                      }, o.readAsText(n);
                    }));

                  case 1:
                  case "end":
                    return r.stop();
                }
              }
            });
          }
        }, {
          key: "arrayBufferToHexString",
          value: function value(e) {
            var r, t, n, o;
            return regeneratorRuntime.async(function (u) {
              for (;;) {
                switch (u.prev = u.next) {
                  case 0:
                    for (r = new Uint8Array(e), t = "", o = 0; o < r.byteLength; o++) {
                      (n = r[o].toString(16)).length < 2 && (n = "0" + n), t += n;
                    }

                    return u.abrupt("return", t);

                  case 4:
                  case "end":
                    return u.stop();
                }
              }
            });
          }
        }, {
          key: "hexStringToArrayBuffer",
          value: function value(e) {
            var r, t;
            return regeneratorRuntime.async(function (n) {
              for (;;) {
                switch (n.prev = n.next) {
                  case 0:
                    for (r = [], t = 0; t < e.length; t += 2) {
                      r.push(parseInt(e.substr(t, 2), 16));
                    }

                    return n.abrupt("return", new Uint8Array(r));

                  case 2:
                  case "end":
                    return n.stop();
                }
              }
            });
          }
        }, {
          key: "base64ToArrayBuffer",
          value: function value(e) {
            var r, t, n, o;
            return regeneratorRuntime.async(function (u) {
              for (;;) {
                switch (u.prev = u.next) {
                  case 0:
                    return u.next = 2, regeneratorRuntime.awrap(this.base64Decode(e));

                  case 2:
                    for (r = u.sent, t = r.length, n = new Uint8Array(t), o = 0; o < t; o++) {
                      n[o] = r.charCodeAt(o);
                    }

                    return u.abrupt("return", n.buffer);

                  case 7:
                  case "end":
                    return u.stop();
                }
              }
            }, null, this);
          }
        }, {
          key: "arrayBufferToBase64",
          value: function value(e) {
            return regeneratorRuntime.async(function (r) {
              for (;;) {
                switch (r.prev = r.next) {
                  case 0:
                    return r.abrupt("return", new Promise(function (r, t) {
                      var n = new Blob([e], {
                        type: "application/octet-binary"
                      }),
                          o = new FileReader();
                      o.onload = function (e) {
                        var t = e.target.result;
                        r(t.substr(t.indexOf(",") + 1));
                      }, o.readAsDataURL(n);
                    }));

                  case 1:
                  case "end":
                    return r.stop();
                }
              }
            });
          }
        }]) && a(t.prototype, n), u && a(t, u), r;
      }(n.SNPureCrypto);
    },
    "./lib/main.js":
    /*!*********************!*\
      !*** ./lib/main.js ***!
      \*********************/

    /*! exports provided: SNPureCrypto, SNWebCrypto, SNReactNativeCrypto, isWebCryptoAvailable */
    function libMainJs(e, r, t) {
      "use strict";

      t.r(r);
      var n = t(
      /*! ./crypto/pure_crypto */
      "./lib/crypto/pure_crypto.js");
      t.d(r, "SNPureCrypto", function () {
        return n.SNPureCrypto;
      });
      var o = t(
      /*! ./crypto/webcrypto */
      "./lib/crypto/webcrypto.js");
      t.d(r, "SNWebCrypto", function () {
        return o.SNWebCrypto;
      });
      var u = t(
      /*! ./crypto/react_native_crypto */
      "./lib/crypto/react_native_crypto.js");
      t.d(r, "SNReactNativeCrypto", function () {
        return u.SNReactNativeCrypto;
      });
      var a = t(
      /*! ./utils */
      "./lib/utils.js");
      t.d(r, "isWebCryptoAvailable", function () {
        return a.isWebCryptoAvailable;
      });
    },
    "./lib/utils.js":
    /*!**********************!*\
      !*** ./lib/utils.js ***!
      \**********************/

    /*! exports provided: getGlobalScope, ieOrEdge, isWebCryptoAvailable, getSubtleCrypto, generateUUIDSync */
    function libUtilsJs(e, r, t) {
      "use strict";

      t.r(r), function (e) {
        function n() {
          return "undefined" != typeof window ? window : void 0 !== e ? e : null;
        }

        function o() {
          return "undefined" != typeof document && document.documentMode || /Edge/.test(navigator.userAgent);
        }

        function u() {
          return !o() && n().crypto && n().crypto.subtle;
        }

        function a() {
          return n().crypto ? n().crypto.subtle : null;
        }

        function c() {
          var e = n(),
              r = e.crypto || e.msCrypto;

          if (r) {
            var t = new Uint32Array(4);
            r.getRandomValues(t);
            var o = -1;
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (e) {
              o++;
              var r = t[o >> 3] >> o % 8 * 4 & 15;
              return ("x" == e ? r : 3 & r | 8).toString(16);
            });
          }

          var u = new Date().getTime();
          return e.performance && "function" == typeof e.performance.now && (u += performance.now()), "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (e) {
            var r = (u + 16 * Math.random()) % 16 | 0;
            return u = Math.floor(u / 16), ("x" == e ? r : 3 & r | 8).toString(16);
          });
        }

        t.d(r, "getGlobalScope", function () {
          return n;
        }), t.d(r, "ieOrEdge", function () {
          return o;
        }), t.d(r, "isWebCryptoAvailable", function () {
          return u;
        }), t.d(r, "getSubtleCrypto", function () {
          return a;
        }), t.d(r, "generateUUIDSync", function () {
          return c;
        });
      }.call(this, t(
      /*! ./../node_modules/webpack/buildin/global.js */
      "./node_modules/webpack/buildin/global.js"));
    },
    "./node_modules/webpack/buildin/global.js":
    /*!***********************************!*\
      !*** (webpack)/buildin/global.js ***!
      \***********************************/

    /*! no static exports found */
    function node_modulesWebpackBuildinGlobalJs(e, r) {
      function t(e) {
        return (t = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (e) {
          return _typeof(e);
        } : function (e) {
          return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : _typeof(e);
        })(e);
      }

      var n;

      n = function () {
        return this;
      }();

      try {
        n = n || new Function("return this")();
      } catch (e) {
        "object" === ("undefined" == typeof window ? "undefined" : t(window)) && (n = window);
      }

      e.exports = n;
    }
  });
});
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../snjs/node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./lib/main.js":
/*!*********************!*\
  !*** ./lib/main.js ***!
  \*********************/
/*! exports provided: SNProtocolManager, protocolManager, SNProtocolOperator001, SNProtocolOperator002, SNProtocolOperator003, SNProtocolOperator004, SFItem, SNKeys, SFItemParams, SFPredicate, SNNote, SNTag, SNSmartTag, SNMfa, SNServerExtension, SNComponent, SNEditor, SNExtension, Action, SNTheme, SNEncryptedStorage, SNComponentManager, SFHistorySession, SFItemHistory, SFItemHistoryEntry, SFPrivileges, SNWebCrypto, SNReactNativeCrypto, findInArray, SFModelManager, SFHttpManager, SFStorageManager, SFSyncManager, SFAuthManager, SFMigrationManager, SFAlertManager, SFSessionHistoryManager, SFPrivilegesManager, SFSingletonManager */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Protocol_manager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Protocol/manager */ "./lib/protocol/manager.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SNProtocolManager", function() { return _Protocol_manager__WEBPACK_IMPORTED_MODULE_0__["SNProtocolManager"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "protocolManager", function() { return _Protocol_manager__WEBPACK_IMPORTED_MODULE_0__["protocolManager"]; });

/* harmony import */ var _Protocol_versions_001_operator_001__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @Protocol/versions/001/operator_001 */ "./lib/protocol/versions/001/operator_001.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SNProtocolOperator001", function() { return _Protocol_versions_001_operator_001__WEBPACK_IMPORTED_MODULE_1__["SNProtocolOperator001"]; });

/* harmony import */ var _Protocol_versions_002_operator_002__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @Protocol/versions/002/operator_002 */ "./lib/protocol/versions/002/operator_002.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SNProtocolOperator002", function() { return _Protocol_versions_002_operator_002__WEBPACK_IMPORTED_MODULE_2__["SNProtocolOperator002"]; });

/* harmony import */ var _Protocol_versions_003_operator_003__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Protocol/versions/003/operator_003 */ "./lib/protocol/versions/003/operator_003.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SNProtocolOperator003", function() { return _Protocol_versions_003_operator_003__WEBPACK_IMPORTED_MODULE_3__["SNProtocolOperator003"]; });

/* harmony import */ var _Protocol_versions_004_operator_004__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Protocol/versions/004/operator_004 */ "./lib/protocol/versions/004/operator_004.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SNProtocolOperator004", function() { return _Protocol_versions_004_operator_004__WEBPACK_IMPORTED_MODULE_4__["SNProtocolOperator004"]; });

/* harmony import */ var _models_core_item__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./models/core/item */ "./lib/models/core/item.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SFItem", function() { return _models_core_item__WEBPACK_IMPORTED_MODULE_5__["SFItem"]; });

/* harmony import */ var _models_core_keys__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./models/core/keys */ "./lib/models/core/keys.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SNKeys", function() { return _models_core_keys__WEBPACK_IMPORTED_MODULE_6__["SNKeys"]; });

/* harmony import */ var _models_core_itemParams__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./models/core/itemParams */ "./lib/models/core/itemParams.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SFItemParams", function() { return _models_core_itemParams__WEBPACK_IMPORTED_MODULE_7__["SFItemParams"]; });

/* harmony import */ var _models_core_predicate__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./models/core/predicate */ "./lib/models/core/predicate.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SFPredicate", function() { return _models_core_predicate__WEBPACK_IMPORTED_MODULE_8__["SFPredicate"]; });

/* harmony import */ var _models_app_note__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./models/app/note */ "./lib/models/app/note.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SNNote", function() { return _models_app_note__WEBPACK_IMPORTED_MODULE_9__["SNNote"]; });

/* harmony import */ var _models_app_tag__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./models/app/tag */ "./lib/models/app/tag.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SNTag", function() { return _models_app_tag__WEBPACK_IMPORTED_MODULE_10__["SNTag"]; });

/* harmony import */ var _models_subclasses_smartTag__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./models/subclasses/smartTag */ "./lib/models/subclasses/smartTag.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SNSmartTag", function() { return _models_subclasses_smartTag__WEBPACK_IMPORTED_MODULE_11__["SNSmartTag"]; });

/* harmony import */ var _models_server_mfa__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./models/server/mfa */ "./lib/models/server/mfa.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SNMfa", function() { return _models_server_mfa__WEBPACK_IMPORTED_MODULE_12__["SNMfa"]; });

/* harmony import */ var _models_server_serverExtension__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./models/server/serverExtension */ "./lib/models/server/serverExtension.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SNServerExtension", function() { return _models_server_serverExtension__WEBPACK_IMPORTED_MODULE_13__["SNServerExtension"]; });

/* harmony import */ var _models_app_component__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./models/app/component */ "./lib/models/app/component.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SNComponent", function() { return _models_app_component__WEBPACK_IMPORTED_MODULE_14__["SNComponent"]; });

/* harmony import */ var _models_app_editor__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./models/app/editor */ "./lib/models/app/editor.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SNEditor", function() { return _models_app_editor__WEBPACK_IMPORTED_MODULE_15__["SNEditor"]; });

/* harmony import */ var _models_app_extension__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./models/app/extension */ "./lib/models/app/extension.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SNExtension", function() { return _models_app_extension__WEBPACK_IMPORTED_MODULE_16__["SNExtension"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Action", function() { return _models_app_extension__WEBPACK_IMPORTED_MODULE_16__["Action"]; });

/* harmony import */ var _models_subclasses_theme__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./models/subclasses/theme */ "./lib/models/subclasses/theme.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SNTheme", function() { return _models_subclasses_theme__WEBPACK_IMPORTED_MODULE_17__["SNTheme"]; });

/* harmony import */ var _models_local_encryptedStorage__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./models/local/encryptedStorage */ "./lib/models/local/encryptedStorage.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SNEncryptedStorage", function() { return _models_local_encryptedStorage__WEBPACK_IMPORTED_MODULE_18__["SNEncryptedStorage"]; });

/* harmony import */ var _services_componentManager__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./services/componentManager */ "./lib/services/componentManager.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SNComponentManager", function() { return _services_componentManager__WEBPACK_IMPORTED_MODULE_19__["SNComponentManager"]; });

/* harmony import */ var _models_session_history_historySession__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./models/session_history/historySession */ "./lib/models/session_history/historySession.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SFHistorySession", function() { return _models_session_history_historySession__WEBPACK_IMPORTED_MODULE_20__["SFHistorySession"]; });

/* harmony import */ var _models_session_history_itemHistory__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./models/session_history/itemHistory */ "./lib/models/session_history/itemHistory.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SFItemHistory", function() { return _models_session_history_itemHistory__WEBPACK_IMPORTED_MODULE_21__["SFItemHistory"]; });

/* harmony import */ var _models_session_history_itemHistoryEntry__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./models/session_history/itemHistoryEntry */ "./lib/models/session_history/itemHistoryEntry.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SFItemHistoryEntry", function() { return _models_session_history_itemHistoryEntry__WEBPACK_IMPORTED_MODULE_22__["SFItemHistoryEntry"]; });

/* harmony import */ var _models_privileges_privileges__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./models/privileges/privileges */ "./lib/models/privileges/privileges.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SFPrivileges", function() { return _models_privileges_privileges__WEBPACK_IMPORTED_MODULE_23__["SFPrivileges"]; });

/* harmony import */ var sncrypto__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! sncrypto */ "../sncrypto/dist/sncrypto.js");
/* harmony import */ var sncrypto__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(sncrypto__WEBPACK_IMPORTED_MODULE_24__);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SNWebCrypto", function() { return sncrypto__WEBPACK_IMPORTED_MODULE_24__["SNWebCrypto"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SNReactNativeCrypto", function() { return sncrypto__WEBPACK_IMPORTED_MODULE_24__["SNReactNativeCrypto"]; });

/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./utils */ "./lib/utils.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "findInArray", function() { return _utils__WEBPACK_IMPORTED_MODULE_25__["findInArray"]; });

/* harmony import */ var _services_modelManager__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./services/modelManager */ "./lib/services/modelManager.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SFModelManager", function() { return _services_modelManager__WEBPACK_IMPORTED_MODULE_26__["SFModelManager"]; });

/* harmony import */ var _services_httpManager__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./services/httpManager */ "./lib/services/httpManager.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SFHttpManager", function() { return _services_httpManager__WEBPACK_IMPORTED_MODULE_27__["SFHttpManager"]; });

/* harmony import */ var _services_storageManager__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./services/storageManager */ "./lib/services/storageManager.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SFStorageManager", function() { return _services_storageManager__WEBPACK_IMPORTED_MODULE_28__["SFStorageManager"]; });

/* harmony import */ var _services_syncManager__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./services/syncManager */ "./lib/services/syncManager.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SFSyncManager", function() { return _services_syncManager__WEBPACK_IMPORTED_MODULE_29__["SFSyncManager"]; });

/* harmony import */ var _services_authManager__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./services/authManager */ "./lib/services/authManager.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SFAuthManager", function() { return _services_authManager__WEBPACK_IMPORTED_MODULE_30__["SFAuthManager"]; });

/* harmony import */ var _services_migrationManager__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./services/migrationManager */ "./lib/services/migrationManager.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SFMigrationManager", function() { return _services_migrationManager__WEBPACK_IMPORTED_MODULE_31__["SFMigrationManager"]; });

/* harmony import */ var _services_alertManager__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./services/alertManager */ "./lib/services/alertManager.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SFAlertManager", function() { return _services_alertManager__WEBPACK_IMPORTED_MODULE_32__["SFAlertManager"]; });

/* harmony import */ var _services_session_history_sessionHistoryManager__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./services/session_history/sessionHistoryManager */ "./lib/services/session_history/sessionHistoryManager.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SFSessionHistoryManager", function() { return _services_session_history_sessionHistoryManager__WEBPACK_IMPORTED_MODULE_33__["SFSessionHistoryManager"]; });

/* harmony import */ var _services_privileges_privilegesManager__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ./services/privileges/privilegesManager */ "./lib/services/privileges/privilegesManager.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SFPrivilegesManager", function() { return _services_privileges_privilegesManager__WEBPACK_IMPORTED_MODULE_34__["SFPrivilegesManager"]; });

/* harmony import */ var _services_singletonManager__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ./services/singletonManager */ "./lib/services/singletonManager.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SFSingletonManager", function() { return _services_singletonManager__WEBPACK_IMPORTED_MODULE_35__["SFSingletonManager"]; });






































/***/ }),

/***/ "./lib/models/app/component.js":
/*!*************************************!*\
  !*** ./lib/models/app/component.js ***!
  \*************************************/
/*! exports provided: SNComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNComponent", function() { return SNComponent; });
/* harmony import */ var _core_item__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/item */ "./lib/models/core/item.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }


var SNComponent =
/*#__PURE__*/
function (_SFItem) {
  _inherits(SNComponent, _SFItem);

  function SNComponent(json_obj) {
    var _this;

    _classCallCheck(this, SNComponent);

    // If making a copy of an existing component (usually during sign in if you have a component active in the session),
    // which may have window set, you may get a cross-origin exception since you'll be trying to copy the window. So we clear it here.
    json_obj.window = null;
    _this = _possibleConstructorReturn(this, _getPrototypeOf(SNComponent).call(this, json_obj));

    if (!_this.componentData) {
      _this.componentData = {};
    }

    if (!_this.disassociatedItemIds) {
      _this.disassociatedItemIds = [];
    }

    if (!_this.associatedItemIds) {
      _this.associatedItemIds = [];
    }

    return _this;
  }

  _createClass(SNComponent, [{
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(_getPrototypeOf(SNComponent.prototype), "mapContentToLocalProperties", this).call(this, content);
      /* Legacy */
      // We don't want to set the url directly, as we'd like to phase it out.
      // If the content.url exists, we'll transfer it to legacy_url
      // We'll only need to set this if content.hosted_url is blank, otherwise, hosted_url is the url replacement.


      if (!content.hosted_url) {
        this.legacy_url = content.url;
      }
      /* New */


      this.local_url = content.local_url;
      this.hosted_url = content.hosted_url || content.url;
      this.offlineOnly = content.offlineOnly;

      if (content.valid_until) {
        this.valid_until = new Date(content.valid_until);
      }

      this.name = content.name;
      this.autoupdateDisabled = content.autoupdateDisabled;
      this.package_info = content.package_info; // the location in the view this component is located in. Valid values are currently tags-list, note-tags, and editor-stack`

      this.area = content.area;
      this.permissions = content.permissions;

      if (!this.permissions) {
        this.permissions = [];
      }

      this.active = content.active; // custom data that a component can store in itself

      this.componentData = content.componentData || {}; // items that have requested a component to be disabled in its context

      this.disassociatedItemIds = content.disassociatedItemIds || []; // items that have requested a component to be enabled in its context

      this.associatedItemIds = content.associatedItemIds || [];
    }
  }, {
    key: "handleDeletedContent",
    value: function handleDeletedContent() {
      _get(_getPrototypeOf(SNComponent.prototype), "handleDeletedContent", this).call(this);

      this.active = false;
    }
  }, {
    key: "structureParams",
    value: function structureParams() {
      var params = {
        legacy_url: this.legacy_url,
        hosted_url: this.hosted_url,
        local_url: this.local_url,
        valid_until: this.valid_until,
        offlineOnly: this.offlineOnly,
        name: this.name,
        area: this.area,
        package_info: this.package_info,
        permissions: this.permissions,
        active: this.active,
        autoupdateDisabled: this.autoupdateDisabled,
        componentData: this.componentData,
        disassociatedItemIds: this.disassociatedItemIds,
        associatedItemIds: this.associatedItemIds
      };

      var superParams = _get(_getPrototypeOf(SNComponent.prototype), "structureParams", this).call(this);

      Object.assign(superParams, params);
      return superParams;
    }
  }, {
    key: "isEditor",
    value: function isEditor() {
      return this.area == "editor-editor";
    }
  }, {
    key: "isTheme",
    value: function isTheme() {
      return this.content_type == "SN|Theme" || this.area == "themes";
    }
  }, {
    key: "isDefaultEditor",
    value: function isDefaultEditor() {
      return this.getAppDataItem("defaultEditor") == true;
    }
  }, {
    key: "setLastSize",
    value: function setLastSize(size) {
      this.setAppDataItem("lastSize", size);
    }
  }, {
    key: "getLastSize",
    value: function getLastSize() {
      return this.getAppDataItem("lastSize");
    }
  }, {
    key: "acceptsThemes",
    value: function acceptsThemes() {
      if (this.content.package_info && "acceptsThemes" in this.content.package_info) {
        return this.content.package_info.acceptsThemes;
      }

      return true;
    }
    /*
      The key used to look up data that this component may have saved to an item.
      This key will be look up on the item, and not on itself.
     */

  }, {
    key: "getClientDataKey",
    value: function getClientDataKey() {
      if (this.legacy_url) {
        return this.legacy_url;
      } else {
        return this.uuid;
      }
    }
  }, {
    key: "hasValidHostedUrl",
    value: function hasValidHostedUrl() {
      return this.hosted_url || this.legacy_url;
    }
  }, {
    key: "keysToIgnoreWhenCheckingContentEquality",
    value: function keysToIgnoreWhenCheckingContentEquality() {
      return ["active", "disassociatedItemIds", "associatedItemIds"].concat(_get(_getPrototypeOf(SNComponent.prototype), "keysToIgnoreWhenCheckingContentEquality", this).call(this));
    }
    /*
      An associative component depends on being explicitly activated for a given item, compared to a dissaciative component,
      which is enabled by default in areas unrelated to a certain item.
     */

  }, {
    key: "isAssociative",
    value: function isAssociative() {
      return Component.associativeAreas().includes(this.area);
    }
  }, {
    key: "associateWithItem",
    value: function associateWithItem(item) {
      this.associatedItemIds.push(item.uuid);
    }
  }, {
    key: "isExplicitlyEnabledForItem",
    value: function isExplicitlyEnabledForItem(item) {
      return this.associatedItemIds.indexOf(item.uuid) !== -1;
    }
  }, {
    key: "isExplicitlyDisabledForItem",
    value: function isExplicitlyDisabledForItem(item) {
      return this.disassociatedItemIds.indexOf(item.uuid) !== -1;
    }
  }, {
    key: "content_type",
    get: function get() {
      return "SN|Component";
    }
  }], [{
    key: "associativeAreas",
    value: function associativeAreas() {
      return ["editor-editor"];
    }
  }]);

  return SNComponent;
}(_core_item__WEBPACK_IMPORTED_MODULE_0__["SFItem"]);

/***/ }),

/***/ "./lib/models/app/editor.js":
/*!**********************************!*\
  !*** ./lib/models/app/editor.js ***!
  \**********************************/
/*! exports provided: SNEditor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNEditor", function() { return SNEditor; });
/* harmony import */ var lodash_map__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash/map */ "./node_modules/lodash/map.js");
/* harmony import */ var lodash_map__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash_map__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash_find__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash/find */ "./node_modules/lodash/find.js");
/* harmony import */ var lodash_find__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash_find__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash_pull__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash/pull */ "./node_modules/lodash/pull.js");
/* harmony import */ var lodash_pull__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash_pull__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var lodash_remove__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lodash/remove */ "./node_modules/lodash/remove.js");
/* harmony import */ var lodash_remove__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(lodash_remove__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _core_item__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/item */ "./lib/models/core/item.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }






var SNEditor =
/*#__PURE__*/
function (_SFItem) {
  _inherits(SNEditor, _SFItem);

  function SNEditor(json_obj) {
    var _this;

    _classCallCheck(this, SNEditor);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SNEditor).call(this, json_obj));

    if (!_this.notes) {
      _this.notes = [];
    }

    if (!_this.data) {
      _this.data = {};
    }

    return _this;
  }

  _createClass(SNEditor, [{
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(_getPrototypeOf(SNEditor.prototype), "mapContentToLocalProperties", this).call(this, content);

      this.url = content.url;
      this.name = content.name;
      this.data = content.data || {};
      this.default = content.default;
      this.systemEditor = content.systemEditor;
    }
  }, {
    key: "structureParams",
    value: function structureParams() {
      var params = {
        url: this.url,
        name: this.name,
        data: this.data,
        default: this.default,
        systemEditor: this.systemEditor
      };

      var superParams = _get(_getPrototypeOf(SNEditor.prototype), "structureParams", this).call(this);

      Object.assign(superParams, params);
      return superParams;
    }
  }, {
    key: "referenceParams",
    value: function referenceParams() {
      var references = lodash_map__WEBPACK_IMPORTED_MODULE_0___default()(this.notes, function (note) {
        return {
          uuid: note.uuid,
          content_type: note.content_type
        };
      });
      return references;
    }
  }, {
    key: "addItemAsRelationship",
    value: function addItemAsRelationship(item) {
      if (item.content_type == "Note") {
        if (!lodash_find__WEBPACK_IMPORTED_MODULE_1___default()(this.notes, item)) {
          this.notes.push(item);
        }
      }

      _get(_getPrototypeOf(SNEditor.prototype), "addItemAsRelationship", this).call(this, item);
    }
  }, {
    key: "removeItemAsRelationship",
    value: function removeItemAsRelationship(item) {
      if (item.content_type == "Note") {
        lodash_pull__WEBPACK_IMPORTED_MODULE_2___default()(this.notes, item);
      }

      _get(_getPrototypeOf(SNEditor.prototype), "removeItemAsRelationship", this).call(this, item);
    }
  }, {
    key: "removeAndDirtyAllRelationships",
    value: function removeAndDirtyAllRelationships() {
      _get(_getPrototypeOf(SNEditor.prototype), "removeAndDirtyAllRelationships", this).call(this);

      this.notes = [];
    }
  }, {
    key: "removeReferencesNotPresentIn",
    value: function removeReferencesNotPresentIn(references) {
      _get(_getPrototypeOf(SNEditor.prototype), "removeReferencesNotPresentIn", this).call(this, references);

      var uuids = references.map(function (ref) {
        return ref.uuid;
      });
      this.notes.forEach(function (note) {
        if (!uuids.includes(note.uuid)) {
          lodash_remove__WEBPACK_IMPORTED_MODULE_3___default()(this.notes, {
            uuid: note.uuid
          });
        }
      }.bind(this));
    }
  }, {
    key: "potentialItemOfInterestHasChangedItsUUID",
    value: function potentialItemOfInterestHasChangedItsUUID(newItem, oldUUID, newUUID) {
      if (newItem.content_type === "Note" && lodash_find__WEBPACK_IMPORTED_MODULE_1___default()(this.notes, {
        uuid: oldUUID
      })) {
        lodash_remove__WEBPACK_IMPORTED_MODULE_3___default()(this.notes, {
          uuid: oldUUID
        });
        this.notes.push(newItem);
      }
    }
  }, {
    key: "setData",
    value: function setData(key, value) {
      var dataHasChanged = JSON.stringify(this.data[key]) !== JSON.stringify(value);

      if (dataHasChanged) {
        this.data[key] = value;
        return true;
      }

      return false;
    }
  }, {
    key: "dataForKey",
    value: function dataForKey(key) {
      return this.data[key] || {};
    }
  }, {
    key: "content_type",
    get: function get() {
      return "SN|Editor";
    }
  }]);

  return SNEditor;
}(_core_item__WEBPACK_IMPORTED_MODULE_4__["SFItem"]);

/***/ }),

/***/ "./lib/models/app/extension.js":
/*!*************************************!*\
  !*** ./lib/models/app/extension.js ***!
  \*************************************/
/*! exports provided: Action, SNExtension */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Action", function() { return Action; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNExtension", function() { return SNExtension; });
/* harmony import */ var lodash_merge__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash/merge */ "./node_modules/lodash/merge.js");
/* harmony import */ var lodash_merge__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash_merge__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash_omit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash/omit */ "./node_modules/lodash/omit.js");
/* harmony import */ var lodash_omit__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash_omit__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _Models_core_item__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @Models/core/item */ "./lib/models/core/item.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }




/* This file exports 2 classes */

var Action = function Action(json) {
  _classCallCheck(this, Action);

  lodash_merge__WEBPACK_IMPORTED_MODULE_0___default()(this, json);
  this.running = false; // in case running=true was synced with server since model is uploaded nondiscriminatory

  this.error = false;

  if (this.lastExecuted) {
    // is string
    this.lastExecuted = new Date(this.lastExecuted);
  }
};
var SNExtension =
/*#__PURE__*/
function (_SFItem) {
  _inherits(SNExtension, _SFItem);

  function SNExtension(json) {
    var _this;

    _classCallCheck(this, SNExtension);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SNExtension).call(this, json));

    if (json.actions) {
      _this.actions = json.actions.map(function (action) {
        return new Action(action);
      });
    }

    if (!_this.actions) {
      _this.actions = [];
    }

    return _this;
  }

  _createClass(SNExtension, [{
    key: "actionsWithContextForItem",
    value: function actionsWithContextForItem(item) {
      return this.actions.filter(function (action) {
        return action.context == item.content_type || action.context == "Item";
      });
    }
  }, {
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(_getPrototypeOf(SNExtension.prototype), "mapContentToLocalProperties", this).call(this, content);

      this.description = content.description;
      this.url = content.url;
      this.name = content.name;
      this.package_info = content.package_info;
      this.supported_types = content.supported_types;

      if (content.actions) {
        this.actions = content.actions.map(function (action) {
          return new Action(action);
        });
      }
    }
  }, {
    key: "structureParams",
    value: function structureParams() {
      var params = {
        name: this.name,
        url: this.url,
        package_info: this.package_info,
        description: this.description,
        actions: this.actions.map(function (a) {
          return lodash_omit__WEBPACK_IMPORTED_MODULE_1___default()(a, ["subrows", "subactions"]);
        }),
        supported_types: this.supported_types
      };

      var superParams = _get(_getPrototypeOf(SNExtension.prototype), "structureParams", this).call(this);

      Object.assign(superParams, params);
      return superParams;
    }
  }, {
    key: "content_type",
    get: function get() {
      return "Extension";
    }
  }]);

  return SNExtension;
}(_Models_core_item__WEBPACK_IMPORTED_MODULE_2__["SFItem"]);

/***/ }),

/***/ "./lib/models/app/note.js":
/*!********************************!*\
  !*** ./lib/models/app/note.js ***!
  \********************************/
/*! exports provided: SNNote */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNNote", function() { return SNNote; });
/* harmony import */ var lodash_remove__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash/remove */ "./node_modules/lodash/remove.js");
/* harmony import */ var lodash_remove__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash_remove__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Models_core_item__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @Models/core/item */ "./lib/models/core/item.js");
/* harmony import */ var _Models_app_tag__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @Models/app/tag */ "./lib/models/app/tag.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }




var SNNote =
/*#__PURE__*/
function (_SFItem) {
  _inherits(SNNote, _SFItem);

  function SNNote(json_obj) {
    var _this;

    _classCallCheck(this, SNNote);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SNNote).call(this, json_obj));

    if (!_this.text) {
      // Some external editors can't handle a null value for text.
      // Notes created on mobile with no text have a null value for it,
      // so we'll just set a default here.
      _this.text = "";
    }

    if (!_this.tags) {
      _this.tags = [];
    }

    return _this;
  }

  _createClass(SNNote, [{
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(_getPrototypeOf(SNNote.prototype), "mapContentToLocalProperties", this).call(this, content);

      this.title = content.title;
      this.text = content.text;
    }
  }, {
    key: "structureParams",
    value: function structureParams() {
      var params = {
        title: this.title,
        text: this.text
      };

      var superParams = _get(_getPrototypeOf(SNNote.prototype), "structureParams", this).call(this);

      Object.assign(superParams, params);
      return superParams;
    }
  }, {
    key: "addItemAsRelationship",
    value: function addItemAsRelationship(item) {
      /*
      Legacy.
      Previously, note/tag relationships were bidirectional, however in some cases there
      may be broken links such that a note has references to a tag and not vice versa.
      Now, only tags contain references to notes. For old notes that may have references to tags,
      we want to transfer them over to the tag.
       */
      if (item.content_type == "Tag") {
        item.addItemAsRelationship(this);
      }

      _get(_getPrototypeOf(SNNote.prototype), "addItemAsRelationship", this).call(this, item);
    }
  }, {
    key: "setIsBeingReferencedBy",
    value: function setIsBeingReferencedBy(item) {
      _get(_getPrototypeOf(SNNote.prototype), "setIsBeingReferencedBy", this).call(this, item);

      this.clearSavedTagsString();
    }
  }, {
    key: "setIsNoLongerBeingReferencedBy",
    value: function setIsNoLongerBeingReferencedBy(item) {
      _get(_getPrototypeOf(SNNote.prototype), "setIsNoLongerBeingReferencedBy", this).call(this, item);

      this.clearSavedTagsString();
    }
  }, {
    key: "isBeingRemovedLocally",
    value: function isBeingRemovedLocally() {
      this.tags.forEach(function (tag) {
        lodash_remove__WEBPACK_IMPORTED_MODULE_0___default()(tag.notes, {
          uuid: this.uuid
        });
      }.bind(this));

      _get(_getPrototypeOf(SNNote.prototype), "isBeingRemovedLocally", this).call(this);
    }
  }, {
    key: "informReferencesOfUUIDChange",
    value: function informReferencesOfUUIDChange(oldUUID, newUUID) {
      _get(_getPrototypeOf(SNNote.prototype), "informReferencesOfUUIDChange", this).call(this);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.tags[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var tag = _step.value;
          lodash_remove__WEBPACK_IMPORTED_MODULE_0___default()(tag.notes, {
            uuid: oldUUID
          });
          tag.notes.push(this);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "tagDidFinishSyncing",
    value: function tagDidFinishSyncing(tag) {
      this.clearSavedTagsString();
    }
  }, {
    key: "safeText",
    value: function safeText() {
      return this.text || "";
    }
  }, {
    key: "safeTitle",
    value: function safeTitle() {
      return this.title || "";
    }
  }, {
    key: "clearSavedTagsString",
    value: function clearSavedTagsString() {
      this.savedTagsString = null;
    }
  }, {
    key: "tagsString",
    value: function tagsString() {
      this.savedTagsString = _Models_app_tag__WEBPACK_IMPORTED_MODULE_2__["SNTag"].arrayToDisplayString(this.tags);
      return this.savedTagsString;
    }
  }, {
    key: "content_type",
    get: function get() {
      return "Note";
    }
  }, {
    key: "displayName",
    get: function get() {
      return "Note";
    }
  }], [{
    key: "filterDummyNotes",
    value: function filterDummyNotes(notes) {
      var filtered = notes.filter(function (note) {
        return note.dummy == false || note.dummy == null;
      });
      return filtered;
    }
  }]);

  return SNNote;
}(_Models_core_item__WEBPACK_IMPORTED_MODULE_1__["SFItem"]);

/***/ }),

/***/ "./lib/models/app/tag.js":
/*!*******************************!*\
  !*** ./lib/models/app/tag.js ***!
  \*******************************/
/*! exports provided: SNTag */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNTag", function() { return SNTag; });
/* harmony import */ var lodash_remove__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash/remove */ "./node_modules/lodash/remove.js");
/* harmony import */ var lodash_remove__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash_remove__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Lib_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @Lib/utils */ "./lib/utils.js");
/* harmony import */ var _core_item__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/item */ "./lib/models/core/item.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }




var SNTag =
/*#__PURE__*/
function (_SFItem) {
  _inherits(SNTag, _SFItem);

  function SNTag(json_obj) {
    var _this;

    _classCallCheck(this, SNTag);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SNTag).call(this, json_obj));

    if (!_this.content_type) {
      _this.content_type = "Tag";
    }

    if (!_this.notes) {
      _this.notes = [];
    }

    return _this;
  }

  _createClass(SNTag, [{
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(_getPrototypeOf(SNTag.prototype), "mapContentToLocalProperties", this).call(this, content);

      this.title = content.title;
    }
  }, {
    key: "structureParams",
    value: function structureParams() {
      var params = {
        title: this.title
      };

      var superParams = _get(_getPrototypeOf(SNTag.prototype), "structureParams", this).call(this);

      Object.assign(superParams, params);
      return superParams;
    }
  }, {
    key: "addItemAsRelationship",
    value: function addItemAsRelationship(item) {
      if (item.content_type == "Note") {
        if (!Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_1__["findInArray"])(this.notes, "uuid", item.uuid)) {
          this.notes.push(item);
          item.tags.push(this);
        }
      }

      _get(_getPrototypeOf(SNTag.prototype), "addItemAsRelationship", this).call(this, item);
    }
  }, {
    key: "removeItemAsRelationship",
    value: function removeItemAsRelationship(item) {
      if (item.content_type == "Note") {
        lodash_remove__WEBPACK_IMPORTED_MODULE_0___default()(this.notes, {
          uuid: item.uuid
        });
        lodash_remove__WEBPACK_IMPORTED_MODULE_0___default()(item.tags, {
          uuid: this.uuid
        });
      }

      _get(_getPrototypeOf(SNTag.prototype), "removeItemAsRelationship", this).call(this, item);
    }
  }, {
    key: "updateLocalRelationships",
    value: function updateLocalRelationships() {
      var references = this.content.references;
      var uuids = references.map(function (ref) {
        return ref.uuid;
      });
      this.notes.slice().forEach(function (note) {
        if (!uuids.includes(note.uuid)) {
          lodash_remove__WEBPACK_IMPORTED_MODULE_0___default()(note.tags, {
            uuid: this.uuid
          });
          lodash_remove__WEBPACK_IMPORTED_MODULE_0___default()(this.notes, {
            uuid: note.uuid
          });
          note.setIsNoLongerBeingReferencedBy(this);
        }
      }.bind(this));
    }
  }, {
    key: "isBeingRemovedLocally",
    value: function isBeingRemovedLocally() {
      var _this2 = this;

      this.notes.forEach(function (note) {
        lodash_remove__WEBPACK_IMPORTED_MODULE_0___default()(note.tags, {
          uuid: _this2.uuid
        });
        note.setIsNoLongerBeingReferencedBy(_this2);
      });
      this.notes.length = 0;

      _get(_getPrototypeOf(SNTag.prototype), "isBeingRemovedLocally", this).call(this);
    }
  }, {
    key: "informReferencesOfUUIDChange",
    value: function informReferencesOfUUIDChange(oldUUID, newUUID) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.notes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var note = _step.value;
          lodash_remove__WEBPACK_IMPORTED_MODULE_0___default()(note.tags, {
            uuid: oldUUID
          });
          note.tags.push(this);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "didFinishSyncing",
    value: function didFinishSyncing() {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.notes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var note = _step2.value;
          note.tagDidFinishSyncing(this);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: "isSmartTag",
    value: function isSmartTag() {
      return this.content_type == "SN|SmartTag";
    }
  }, {
    key: "displayName",
    get: function get() {
      return "Tag";
    }
  }], [{
    key: "arrayToDisplayString",
    value: function arrayToDisplayString(tags) {
      return tags.sort(function (a, b) {
        return a.title > b.title;
      }).map(function (tag, i) {
        return "#" + tag.title;
      }).join(" ");
    }
  }]);

  return SNTag;
}(_core_item__WEBPACK_IMPORTED_MODULE_2__["SFItem"]);

/***/ }),

/***/ "./lib/models/core/item.js":
/*!*********************************!*\
  !*** ./lib/models/core/item.js ***!
  \*********************************/
/*! exports provided: SFItem */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SFItem", function() { return SFItem; });
/* harmony import */ var lodash_find__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash/find */ "./node_modules/lodash/find.js");
/* harmony import */ var lodash_find__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash_find__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash_remove__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash/remove */ "./node_modules/lodash/remove.js");
/* harmony import */ var lodash_remove__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash_remove__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash_isArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash/isArray */ "./node_modules/lodash/isArray.js");
/* harmony import */ var lodash_isArray__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash_isArray__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var lodash_mergeWith__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lodash/mergeWith */ "./node_modules/lodash/mergeWith.js");
/* harmony import */ var lodash_mergeWith__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(lodash_mergeWith__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _Protocol_manager__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Protocol/manager */ "./lib/protocol/manager.js");
/* harmony import */ var _Models_core_predicate__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @Models/core/predicate */ "./lib/models/core/predicate.js");
/* harmony import */ var _Lib_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @Lib/utils */ "./lib/utils.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }








var dateFormatter;
var SFItem =
/*#__PURE__*/
function () {
  function SFItem() {
    var json_obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, SFItem);

    this.content = {};
    this.referencingObjects = [];
    this.updateFromJSON(json_obj);

    if (!this.uuid) {
      // on React Native, this method will not exist. UUID gen will be handled manually via async methods.
      if (Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_6__["isWebEnvironment"])()) {
        this.uuid = _Protocol_manager__WEBPACK_IMPORTED_MODULE_4__["protocolManager"].crypto.generateUUIDSync();
      }
    }

    if (_typeof(this.content) === 'object' && !this.content.references) {
      this.content.references = [];
    }
  } // On some platforms, syncrounous uuid generation is not available.
  // Those platforms (mobile) must call this function manually.


  _createClass(SFItem, [{
    key: "initUUID",
    value: function initUUID() {
      return regeneratorRuntime.async(function initUUID$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (this.uuid) {
                _context.next = 4;
                break;
              }

              _context.next = 3;
              return regeneratorRuntime.awrap(_Protocol_manager__WEBPACK_IMPORTED_MODULE_4__["protocolManager"].crypto.generateUUID());

            case 3:
              this.uuid = _context.sent;

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "updateFromJSON",
    value: function updateFromJSON(json) {
      // Don't expect this to ever be the case but we're having a crash with Android and this is the only suspect.
      if (!json) {
        return;
      }

      this.deleted = json.deleted;
      this.uuid = json.uuid;
      this.enc_item_key = json.enc_item_key;
      this.auth_hash = json.auth_hash;
      this.auth_params = json.auth_params; // When updating from server response (as opposed to local json response), these keys will be missing.
      // So we only want to update these values if they are explicitly present.

      var clientKeys = ["errorDecrypting", "dirty", "dirtyCount", "dirtiedDate", "dummy"];

      for (var _i = 0, _clientKeys = clientKeys; _i < _clientKeys.length; _i++) {
        var key = _clientKeys[_i];

        if (json[key] !== undefined) {
          this[key] = json[key];
        }
      }

      if (this.dirtiedDate && typeof this.dirtiedDate === 'string') {
        this.dirtiedDate = new Date(this.dirtiedDate);
      } // Check if object has getter for content_type, and if so, skip


      if (!this.content_type) {
        this.content_type = json.content_type;
      } // this.content = json.content will copy it by reference rather than value. So we need to do a deep merge after.
      // json.content can still be a string here. We copy it to this.content, then do a deep merge to transfer over all values.


      if (json.errorDecrypting) {
        this.content = json.content;
      } else {
        try {
          var parsedContent = typeof json.content === 'string' ? JSON.parse(json.content) : json.content;
          SFItem.deepMerge(this.contentObject, parsedContent);
        } catch (e) {
          console.log("Error while updating item from json", e);
        }
      } // Manually merge top level data instead of wholesale merge


      if (json.created_at) {
        this.created_at = json.created_at;
      } // Could be null if we're mapping from an extension bridge, where we remove this as its a private property.


      if (json.updated_at) {
        this.updated_at = json.updated_at;
      }

      if (this.created_at) {
        this.created_at = new Date(this.created_at);
      } else {
        this.created_at = new Date();
      }

      if (this.updated_at) {
        this.updated_at = new Date(this.updated_at);
      } else {
        this.updated_at = new Date(0);
      } // Epoch
      // Allows the getter to be re-invoked


      this._client_updated_at = null;

      if (json.content) {
        this.mapContentToLocalProperties(this.contentObject);
      } else if (json.deleted == true) {
        this.handleDeletedContent();
      }
    }
  }, {
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(contentObj) {}
    /*
    See note in createContentJSONFromProperties. When setting an item dirty, we want to immediately merge any
    custom properties (like note.title and note.text) into .content, so that any .content operations we apply have
    the latest values.
    */

  }, {
    key: "collapseCustomPropertiesIntoContent",
    value: function collapseCustomPropertiesIntoContent() {
      this.createContentJSONFromProperties();
    }
  }, {
    key: "createContentJSONFromProperties",
    value: function createContentJSONFromProperties() {
      /*
      NOTE: This function does have side effects and WILL modify our content.
       Subclasses will override structureParams, and add their own custom content and properties to the object returned from structureParams
      These are properties that this superclass will not be aware of, like 'title' or 'text'
       When we call createContentJSONFromProperties, we want to update our own inherit 'content' field with the values returned from structureParams,
      so that our content field is up to date.
       Each subclass will call super.structureParams and merge it with its own custom result object.
      Since our own structureParams gets a real-time copy of our content, it should be safe to merge the aggregate value back into our own content field.
      */
      var content = this.structureParams();
      SFItem.deepMerge(this.contentObject, content); // Return the content item copy and not our actual value, as we don't want it to be mutated outside our control.

      return content;
    }
  }, {
    key: "structureParams",
    value: function structureParams() {
      return this.getContentCopy();
    }
    /* Allows the item to handle the case where the item is deleted and the content is null */

  }, {
    key: "handleDeletedContent",
    value: function handleDeletedContent() {// Subclasses can override
    }
  }, {
    key: "setDirty",
    value: function setDirty(dirty, updateClientDate) {
      this.dirty = dirty; // Allows the syncManager to check if an item has been marked dirty after a sync has been started
      // This prevents it from clearing it as a dirty item after sync completion, if someone else has marked it dirty
      // again after an ongoing sync.

      if (!this.dirtyCount) {
        this.dirtyCount = 0;
      }

      if (dirty) {
        this.dirtyCount++;
      } else {
        this.dirtyCount = 0;
      } // Used internally by syncManager to determine if a dirted item needs to be saved offline.
      // You want to set this in both cases, when dirty is true and false. If it's false, we still need
      // to save it to disk as an update.


      this.dirtiedDate = new Date();

      if (dirty && updateClientDate) {
        // Set the client modified date to now if marking the item as dirty
        this.client_updated_at = new Date();
      } else if (!this.hasRawClientUpdatedAtValue()) {
        // if we don't have an explcit raw value, we initialize client_updated_at.
        this.client_updated_at = new Date(this.updated_at);
      }

      this.collapseCustomPropertiesIntoContent();
    }
  }, {
    key: "updateLocalRelationships",
    value: function updateLocalRelationships() {// optional override
    }
  }, {
    key: "addItemAsRelationship",
    value: function addItemAsRelationship(item) {
      item.setIsBeingReferencedBy(this);

      if (this.hasRelationshipWithItem(item)) {
        return;
      }

      var references = this.content.references || [];
      references.push({
        uuid: item.uuid,
        content_type: item.content_type
      });
      this.content.references = references;
    }
  }, {
    key: "removeItemAsRelationship",
    value: function removeItemAsRelationship(item) {
      item.setIsNoLongerBeingReferencedBy(this);
      this.removeReferenceWithUuid(item.uuid);
    } // When another object has a relationship with us, we push that object into memory here.
    // We use this so that when `this` is deleted, we're able to update the references of those other objects.

  }, {
    key: "setIsBeingReferencedBy",
    value: function setIsBeingReferencedBy(item) {
      if (!lodash_find__WEBPACK_IMPORTED_MODULE_0___default()(this.referencingObjects, {
        uuid: item.uuid
      })) {
        this.referencingObjects.push(item);
      }
    }
  }, {
    key: "setIsNoLongerBeingReferencedBy",
    value: function setIsNoLongerBeingReferencedBy(item) {
      lodash_remove__WEBPACK_IMPORTED_MODULE_1___default()(this.referencingObjects, {
        uuid: item.uuid
      }); // Legacy two-way relationships should be handled here

      if (this.hasRelationshipWithItem(item)) {
        this.removeReferenceWithUuid(item.uuid); // We really shouldn't have the authority to set this item as dirty, but it's the only way to save this change.

        this.setDirty(true);
      }
    }
  }, {
    key: "removeReferenceWithUuid",
    value: function removeReferenceWithUuid(uuid) {
      var references = this.content.references || [];
      references = references.filter(function (r) {
        return r.uuid != uuid;
      });
      this.content.references = references;
    }
  }, {
    key: "hasRelationshipWithItem",
    value: function hasRelationshipWithItem(item) {
      var target = this.content.references.find(function (r) {
        return r.uuid == item.uuid;
      });
      return target != null;
    }
  }, {
    key: "isBeingRemovedLocally",
    value: function isBeingRemovedLocally() {}
  }, {
    key: "didFinishSyncing",
    value: function didFinishSyncing() {}
  }, {
    key: "informReferencesOfUUIDChange",
    value: function informReferencesOfUUIDChange(oldUUID, newUUID) {// optional override
    }
  }, {
    key: "potentialItemOfInterestHasChangedItsUUID",
    value: function potentialItemOfInterestHasChangedItsUUID(newItem, oldUUID, newUUID) {
      if (this.errorDecrypting) {
        return;
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.content.references[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var reference = _step.value;

          if (reference.uuid == oldUUID) {
            reference.uuid = newUUID;
            this.setDirty(true);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "doNotEncrypt",
    value: function doNotEncrypt() {
      return false;
    }
    /*
    App Data
    */

  }, {
    key: "setDomainDataItem",
    value: function setDomainDataItem(key, value, domain) {
      if (!domain) {
        console.error("SFItem.AppDomain needs to be set.");
        return;
      }

      if (this.errorDecrypting) {
        return;
      }

      if (!this.content.appData) {
        this.content.appData = {};
      }

      var data = this.content.appData[domain];

      if (!data) {
        data = {};
      }

      data[key] = value;
      this.content.appData[domain] = data;
    }
  }, {
    key: "getDomainDataItem",
    value: function getDomainDataItem(key, domain) {
      if (!domain) {
        console.error("SFItem.AppDomain needs to be set.");
        return;
      }

      if (this.errorDecrypting) {
        return;
      }

      if (!this.content.appData) {
        this.content.appData = {};
      }

      var data = this.content.appData[domain];

      if (data) {
        return data[key];
      } else {
        return null;
      }
    }
  }, {
    key: "setAppDataItem",
    value: function setAppDataItem(key, value) {
      this.setDomainDataItem(key, value, SFItem.AppDomain);
    }
  }, {
    key: "getAppDataItem",
    value: function getAppDataItem(key) {
      return this.getDomainDataItem(key, SFItem.AppDomain);
    }
  }, {
    key: "hasRawClientUpdatedAtValue",
    value: function hasRawClientUpdatedAtValue() {
      return this.getAppDataItem("client_updated_at") != null;
    }
  }, {
    key: "keysToIgnoreWhenCheckingContentEquality",

    /*
      During sync conflicts, when determing whether to create a duplicate for an item, we can omit keys that have no
      meaningful weight and can be ignored. For example, if one component has active = true and another component has active = false,
      it would be silly to duplicate them, so instead we ignore this.
     */
    value: function keysToIgnoreWhenCheckingContentEquality() {
      return [];
    } // Same as above, but keys inside appData[Item.AppDomain]

  }, {
    key: "appDataKeysToIgnoreWhenCheckingContentEquality",
    value: function appDataKeysToIgnoreWhenCheckingContentEquality() {
      return ["client_updated_at"];
    }
  }, {
    key: "getContentCopy",
    value: function getContentCopy() {
      var contentCopy = JSON.parse(JSON.stringify(this.content));
      return contentCopy;
    }
  }, {
    key: "isItemContentEqualWith",
    value: function isItemContentEqualWith(otherItem) {
      return SFItem.AreItemContentsEqual({
        leftContent: this.content,
        rightContent: otherItem.content,
        keysToIgnore: this.keysToIgnoreWhenCheckingContentEquality(),
        appDataKeysToIgnore: this.appDataKeysToIgnoreWhenCheckingContentEquality()
      });
    }
  }, {
    key: "isContentEqualWithNonItemContent",
    value: function isContentEqualWithNonItemContent(otherContent) {
      return SFItem.AreItemContentsEqual({
        leftContent: this.content,
        rightContent: otherContent,
        keysToIgnore: this.keysToIgnoreWhenCheckingContentEquality(),
        appDataKeysToIgnore: this.appDataKeysToIgnoreWhenCheckingContentEquality()
      });
    }
  }, {
    key: "satisfiesPredicate",
    value: function satisfiesPredicate(predicate) {
      /*
      Predicate is an SFPredicate having properties:
      {
        keypath: String,
        operator: String,
        value: object
      }
       */
      return _Models_core_predicate__WEBPACK_IMPORTED_MODULE_5__["SFPredicate"].ItemSatisfiesPredicate(this, predicate);
    }
    /*
    Dates
    */

  }, {
    key: "createdAtString",
    value: function createdAtString() {
      return this.dateToLocalizedString(this.created_at);
    }
  }, {
    key: "updatedAtString",
    value: function updatedAtString() {
      return this.dateToLocalizedString(this.client_updated_at);
    }
  }, {
    key: "updatedAtTimestamp",
    value: function updatedAtTimestamp() {
      return this.updated_at.getTime();
    }
  }, {
    key: "dateToLocalizedString",
    value: function dateToLocalizedString(date) {
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        if (!dateFormatter) {
          var locale = navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language;
          dateFormatter = new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit'
          });
        }

        return dateFormatter.format(date);
      } else {
        // IE < 11, Safari <= 9.0.
        // In English, this generates the string most similar to
        // the toLocaleDateString() result above.
        return date.toDateString() + ' ' + date.toLocaleTimeString();
      }
    }
  }, {
    key: "contentObject",
    get: function get() {
      if (this.errorDecrypting) {
        return this.content;
      }

      if (!this.content) {
        this.content = {};
        return this.content;
      }

      if (this.content !== null && _typeof(this.content) === 'object') {
        // this is the case when mapping localStorage content, in which case the content is already parsed
        return this.content;
      }

      try {
        var content = JSON.parse(this.content);
        this.content = content;
        return this.content;
      } catch (e) {
        console.log("Error parsing json", e, this);
        this.content = {};
        return this.content;
      }
    }
  }, {
    key: "pinned",
    get: function get() {
      return this.getAppDataItem("pinned");
    }
  }, {
    key: "archived",
    get: function get() {
      return this.getAppDataItem("archived");
    }
  }, {
    key: "locked",
    get: function get() {
      return this.getAppDataItem("locked");
    } // May be used by clients to display the human readable type for this item. Should be overriden by subclasses.

  }, {
    key: "displayName",
    get: function get() {
      return "Item";
    }
  }, {
    key: "client_updated_at",
    get: function get() {
      if (!this._client_updated_at) {
        var saved = this.getAppDataItem("client_updated_at");

        if (saved) {
          this._client_updated_at = new Date(saved);
        } else {
          this._client_updated_at = new Date(this.updated_at);
        }
      }

      return this._client_updated_at;
    },
    set: function set(date) {
      this._client_updated_at = date;
      this.setAppDataItem("client_updated_at", date);
    }
  }], [{
    key: "deepMerge",
    value: function deepMerge(a, b) {
      // By default merge will not merge a full array with an empty one.
      // We want to replace arrays wholesale
      function mergeCopyArrays(objValue, srcValue) {
        if (lodash_isArray__WEBPACK_IMPORTED_MODULE_2___default()(objValue)) {
          return srcValue;
        }
      }

      lodash_mergeWith__WEBPACK_IMPORTED_MODULE_3___default()(a, b, mergeCopyArrays);
      return a;
    }
  }, {
    key: "AreItemContentsEqual",
    value: function AreItemContentsEqual(_ref) {
      var leftContent = _ref.leftContent,
          rightContent = _ref.rightContent,
          keysToIgnore = _ref.keysToIgnore,
          appDataKeysToIgnore = _ref.appDataKeysToIgnore;

      var omit = function omit(obj, keys) {
        if (!obj) {
          return obj;
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var key = _step2.value;
            delete obj[key];
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        return obj;
      }; // Create copies of objects before running omit as not to modify source values directly.


      leftContent = JSON.parse(JSON.stringify(leftContent));

      if (leftContent.appData) {
        omit(leftContent.appData[SFItem.AppDomain], appDataKeysToIgnore);
      }

      leftContent = omit(leftContent, keysToIgnore);
      rightContent = JSON.parse(JSON.stringify(rightContent));

      if (rightContent.appData) {
        omit(rightContent.appData[SFItem.AppDomain], appDataKeysToIgnore);
      }

      rightContent = omit(rightContent, keysToIgnore);
      return JSON.stringify(leftContent) === JSON.stringify(rightContent);
    }
  }]);

  return SFItem;
}();

/***/ }),

/***/ "./lib/models/core/itemParams.js":
/*!***************************************!*\
  !*** ./lib/models/core/itemParams.js ***!
  \***************************************/
/*! exports provided: SFItemParams */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SFItemParams", function() { return SFItemParams; });
/* harmony import */ var lodash_omit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash/omit */ "./node_modules/lodash/omit.js");
/* harmony import */ var lodash_omit__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash_omit__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash_merge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash/merge */ "./node_modules/lodash/merge.js");
/* harmony import */ var lodash_merge__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash_merge__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash_pick__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash/pick */ "./node_modules/lodash/pick.js");
/* harmony import */ var lodash_pick__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash_pick__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _Protocol_manager__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Protocol/manager */ "./lib/protocol/manager.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }





var SFItemParams =
/*#__PURE__*/
function () {
  function SFItemParams(item, keys, auth_params) {
    _classCallCheck(this, SFItemParams);

    this.item = item;
    this.keys = keys;
    this.auth_params = auth_params;

    if (this.keys && !this.auth_params) {
      throw "SFItemParams.auth_params must be supplied if supplying keys.";
    }

    if (this.auth_params && !this.auth_params.version) {
      throw "SFItemParams.auth_params is missing version";
    }
  }

  _createClass(SFItemParams, [{
    key: "paramsForExportFile",
    value: function paramsForExportFile(includeDeleted) {
      var result;
      return regeneratorRuntime.async(function paramsForExportFile$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              this.forExportFile = true;

              if (!includeDeleted) {
                _context.next = 5;
                break;
              }

              return _context.abrupt("return", this.__params());

            case 5:
              _context.next = 7;
              return regeneratorRuntime.awrap(this.__params());

            case 7:
              result = _context.sent;
              return _context.abrupt("return", lodash_omit__WEBPACK_IMPORTED_MODULE_0___default()(result, ["deleted"]));

            case 9:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "paramsForExtension",
    value: function paramsForExtension() {
      return regeneratorRuntime.async(function paramsForExtension$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", this.paramsForExportFile());

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "paramsForLocalStorage",
    value: function paramsForLocalStorage() {
      return regeneratorRuntime.async(function paramsForLocalStorage$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              this.additionalFields = ["dirty", "dirtiedDate", "errorDecrypting"];
              this.forExportFile = true;
              return _context3.abrupt("return", this.__params());

            case 3:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "paramsForSync",
    value: function paramsForSync() {
      return regeneratorRuntime.async(function paramsForSync$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", this.__params());

            case 1:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "__params",
    value: function __params() {
      var params, doNotEncrypt, encryptedParams;
      return regeneratorRuntime.async(function __params$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              params = {
                uuid: this.item.uuid,
                content_type: this.item.content_type,
                deleted: this.item.deleted,
                created_at: this.item.created_at,
                updated_at: this.item.updated_at
              };

              if (this.item.errorDecrypting) {
                _context5.next = 23;
                break;
              }

              // Items should always be encrypted for export files. Only respect item.doNotEncrypt for remote sync params.
              doNotEncrypt = this.item.doNotEncrypt() && !this.forExportFile;

              if (!(this.keys && !doNotEncrypt)) {
                _context5.next = 11;
                break;
              }

              _context5.next = 6;
              return regeneratorRuntime.awrap(_Protocol_manager__WEBPACK_IMPORTED_MODULE_3__["protocolManager"].encryptItem({
                item: this.item,
                keys: this.keys,
                authParams: this.auth_params
              }));

            case 6:
              encryptedParams = _context5.sent;
              lodash_merge__WEBPACK_IMPORTED_MODULE_1___default()(params, encryptedParams);

              if (this.auth_params.version !== "001") {
                params.auth_hash = null;
              }

              _context5.next = 21;
              break;

            case 11:
              if (!this.forExportFile) {
                _context5.next = 15;
                break;
              }

              _context5.t0 = this.item.createContentJSONFromProperties();
              _context5.next = 19;
              break;

            case 15:
              _context5.next = 17;
              return regeneratorRuntime.awrap(_Protocol_manager__WEBPACK_IMPORTED_MODULE_3__["protocolManager"].crypto.base64(JSON.stringify(this.item.createContentJSONFromProperties())));

            case 17:
              _context5.t1 = _context5.sent;
              _context5.t0 = "000" + _context5.t1;

            case 19:
              params.content = _context5.t0;

              if (!this.forExportFile) {
                params.enc_item_key = null;
                params.auth_hash = null;
              }

            case 21:
              _context5.next = 26;
              break;

            case 23:
              // Error decrypting, keep "content" and related fields as is (and do not try to encrypt, otherwise that would be undefined behavior)
              params.content = this.item.content;
              params.enc_item_key = this.item.enc_item_key;
              params.auth_hash = this.item.auth_hash;

            case 26:
              if (this.additionalFields) {
                lodash_merge__WEBPACK_IMPORTED_MODULE_1___default()(params, lodash_pick__WEBPACK_IMPORTED_MODULE_2___default()(this.item, this.additionalFields));
              }

              return _context5.abrupt("return", params);

            case 28:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }]);

  return SFItemParams;
}();

/***/ }),

/***/ "./lib/models/core/keys.js":
/*!*********************************!*\
  !*** ./lib/models/core/keys.js ***!
  \*********************************/
/*! exports provided: SNKeys */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNKeys", function() { return SNKeys; });
/* harmony import */ var _core_item__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/item */ "./lib/models/core/item.js");
/* harmony import */ var _Protocol_versions_004_keys_content_004__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @Protocol/versions/004/keys_content_004 */ "./lib/protocol/versions/004/keys_content_004.js");
/* harmony import */ var _Protocol_versions_003_keys_content_003__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @Protocol/versions/003/keys_content_003 */ "./lib/protocol/versions/003/keys_content_003.js");
/* harmony import */ var _Protocol_versions_002_keys_content_002__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Protocol/versions/002/keys_content_002 */ "./lib/protocol/versions/002/keys_content_002.js");
/* harmony import */ var _Protocol_versions_001_keys_content_001__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Protocol/versions/001/keys_content_001 */ "./lib/protocol/versions/001/keys_content_001.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }






/**
 * Rather than creating a different content_type/item for every key version, thus making storage
 * and retrieval more difficult, we store all keys under the main SNKeys item, and instead use
 * versioned memory-only (non-SFItem) SNKeyContent items to handle versioned API.
*/

var SNKeys =
/*#__PURE__*/
function (_SFItem) {
  _inherits(SNKeys, _SFItem);

  function SNKeys(json_obj) {
    _classCallCheck(this, SNKeys);

    return _possibleConstructorReturn(this, _getPrototypeOf(SNKeys).call(this, json_obj));
  }

  _createClass(SNKeys, [{
    key: "updateFromJSON",
    value: function updateFromJSON(json_obj) {
      _get(_getPrototypeOf(SNKeys.prototype), "updateFromJSON", this).call(this, json_obj);

      if (!this.content.version) {
        if (this.content.ak) {
          // If there's no version stored, it must be either 001 or 002.
          // If there's an ak, it has to be 002. Otherwise it's 001.
          this.content.version = "002";
        } else {
          this.content.version = "001";
        }
      }

      switch (this.content.version) {
        case '001':
          this.keysContent = new _Protocol_versions_001_keys_content_001__WEBPACK_IMPORTED_MODULE_4__["SNKeysContent001"](json_obj.content);
          break;

        case '002':
          this.keysContent = new _Protocol_versions_002_keys_content_002__WEBPACK_IMPORTED_MODULE_3__["SNKeysContent002"](json_obj.content);
          break;

        case '003':
          this.keysContent = new _Protocol_versions_003_keys_content_003__WEBPACK_IMPORTED_MODULE_2__["SNKeysContent003"](json_obj.content);
          break;

        case '004':
          this.keysContent = new _Protocol_versions_004_keys_content_004__WEBPACK_IMPORTED_MODULE_1__["SNKeysContent004"](json_obj.content);
          break;

        default:
          break;
      }
    }
    /**
     * Compares two sets of keys for equality
     * @returns Boolean
    */

  }, {
    key: "compare",
    value: function compare(otherKey) {
      if (this.version !== otherKey.version) {
        return false;
      }

      return this.keysContent.compare(otherKey.keysContent);
    }
    /**
     * Because this is a traditional SFItem, the constructor expects an object with a .content
     * property. FromRaw allows you to send in an unwrapped raw keys hash instead.
    */

  }, {
    key: "version",
    get: function get() {
      return this.content.version;
    }
  }, {
    key: "content_type",
    get: function get() {
      return "SN|Keys";
    }
  }, {
    key: "itemsMasterKey",
    get: function get() {
      return this.keysContent.itemsMasterKey;
    }
  }, {
    key: "masterKey",
    get: function get() {
      return this.keysContent.masterKey;
    }
  }, {
    key: "serverAuthenticationValue",
    get: function get() {
      return this.keysContent.serverAuthenticationValue;
    }
  }, {
    key: "encryptionAuthenticationKey",
    get: function get() {
      return this.keysContent.encryptionAuthenticationKey;
    }
  }], [{
    key: "FromRaw",
    value: function FromRaw(keys) {
      return new SNKeys({
        content: keys
      });
    }
  }]);

  return SNKeys;
}(_core_item__WEBPACK_IMPORTED_MODULE_0__["SFItem"]);

/***/ }),

/***/ "./lib/models/core/predicate.js":
/*!**************************************!*\
  !*** ./lib/models/core/predicate.js ***!
  \**************************************/
/*! exports provided: SFPredicate */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SFPredicate", function() { return SFPredicate; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SFPredicate =
/*#__PURE__*/
function () {
  function SFPredicate(keypath, operator, value) {
    _classCallCheck(this, SFPredicate);

    this.keypath = keypath;
    this.operator = operator;
    this.value = value; // Preprocessing to make predicate evaluation faster.
    // Won't recurse forever, but with arbitrarily large input could get stuck. Hope there are input size limits
    // somewhere else.

    if (SFPredicate.IsRecursiveOperator(this.operator)) {
      this.value = this.value.map(SFPredicate.fromArray);
    }
  }

  _createClass(SFPredicate, null, [{
    key: "fromArray",
    value: function fromArray(array) {
      return new SFPredicate(array[0], array[1], array[2]);
    }
  }, {
    key: "ObjectSatisfiesPredicate",
    value: function ObjectSatisfiesPredicate(object, predicate) {
      // Predicates may not always be created using the official constructor
      // so if it's still an array here, convert to object
      if (Array.isArray(predicate)) {
        predicate = this.fromArray(predicate);
      }

      if (SFPredicate.IsRecursiveOperator(predicate.operator)) {
        if (predicate.operator === "and") {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = predicate.value[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var subPredicate = _step.value;

              if (!this.ObjectSatisfiesPredicate(object, subPredicate)) {
                return false;
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          return true;
        }

        if (predicate.operator === "or") {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = predicate.value[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var subPredicate = _step2.value;

              if (this.ObjectSatisfiesPredicate(object, subPredicate)) {
                return true;
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }

          return false;
        }
      }

      var predicateValue = predicate.value;

      if (typeof predicateValue == 'string' && predicateValue.includes(".ago")) {
        predicateValue = this.DateFromString(predicateValue);
      }

      var valueAtKeyPath = predicate.keypath.split('.').reduce(function (previous, current) {
        return previous && previous[current];
      }, object);
      var falseyValues = [false, "", null, undefined, NaN]; // If the value at keyPath is undefined, either because the property is nonexistent or the value is null.

      if (valueAtKeyPath == undefined) {
        if (predicate.operator == "!=") {
          return !falseyValues.includes(predicate.value);
        } else {
          return falseyValues.includes(predicate.value);
        }
      }

      if (predicate.operator == "=") {
        // Use array comparison
        if (Array.isArray(valueAtKeyPath)) {
          return JSON.stringify(valueAtKeyPath) == JSON.stringify(predicateValue);
        } else {
          return valueAtKeyPath == predicateValue;
        }
      } else if (predicate.operator == "!=") {
        // Use array comparison
        if (Array.isArray(valueAtKeyPath)) {
          return JSON.stringify(valueAtKeyPath) != JSON.stringify(predicateValue);
        } else {
          return valueAtKeyPath !== predicateValue;
        }
      } else if (predicate.operator == "<") {
        return valueAtKeyPath < predicateValue;
      } else if (predicate.operator == ">") {
        return valueAtKeyPath > predicateValue;
      } else if (predicate.operator == "<=") {
        return valueAtKeyPath <= predicateValue;
      } else if (predicate.operator == ">=") {
        return valueAtKeyPath >= predicateValue;
      } else if (predicate.operator == "startsWith") {
        return valueAtKeyPath.startsWith(predicateValue);
      } else if (predicate.operator == "in") {
        return predicateValue.indexOf(valueAtKeyPath) != -1;
      } else if (predicate.operator == "includes") {
        return this.resolveIncludesPredicate(valueAtKeyPath, predicateValue);
      } else if (predicate.operator == "matches") {
        var regex = new RegExp(predicateValue);
        return regex.test(valueAtKeyPath);
      }

      return false;
    }
  }, {
    key: "resolveIncludesPredicate",
    value: function resolveIncludesPredicate(valueAtKeyPath, predicateValue) {
      // includes can be a string  or a predicate (in array form)
      if (typeof predicateValue == 'string') {
        // if string, simply check if the valueAtKeyPath includes the predicate value
        return valueAtKeyPath.includes(predicateValue);
      } else {
        // is a predicate array or predicate object
        var innerPredicate;

        if (Array.isArray(predicateValue)) {
          innerPredicate = SFPredicate.fromArray(predicateValue);
        } else {
          innerPredicate = predicateValue;
        }

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = valueAtKeyPath[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var obj = _step3.value;

            if (this.ObjectSatisfiesPredicate(obj, innerPredicate)) {
              return true;
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        return false;
      }
    }
  }, {
    key: "ItemSatisfiesPredicate",
    value: function ItemSatisfiesPredicate(item, predicate) {
      if (Array.isArray(predicate)) {
        predicate = SFPredicate.fromArray(predicate);
      }

      return this.ObjectSatisfiesPredicate(item, predicate);
    }
  }, {
    key: "ItemSatisfiesPredicates",
    value: function ItemSatisfiesPredicates(item, predicates) {
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = predicates[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var predicate = _step4.value;

          if (!this.ItemSatisfiesPredicate(item, predicate)) {
            return false;
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return true;
    }
  }, {
    key: "DateFromString",
    value: function DateFromString(string) {
      // x.days.ago, x.hours.ago
      var comps = string.split(".");
      var unit = comps[1];
      var date = new Date();
      var offset = parseInt(comps[0]);

      if (unit == "days") {
        date.setDate(date.getDate() - offset);
      } else if (unit == "hours") {
        date.setHours(date.getHours() - offset);
      }

      return date;
    }
  }, {
    key: "IsRecursiveOperator",
    value: function IsRecursiveOperator(operator) {
      return ["and", "or"].includes(operator);
    }
  }]);

  return SFPredicate;
}();

/***/ }),

/***/ "./lib/models/local/encryptedStorage.js":
/*!**********************************************!*\
  !*** ./lib/models/local/encryptedStorage.js ***!
  \**********************************************/
/*! exports provided: SNEncryptedStorage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNEncryptedStorage", function() { return SNEncryptedStorage; });
/* harmony import */ var _core_item__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/item */ "./lib/models/core/item.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }


var SNEncryptedStorage =
/*#__PURE__*/
function (_SFItem) {
  _inherits(SNEncryptedStorage, _SFItem);

  function SNEncryptedStorage() {
    _classCallCheck(this, SNEncryptedStorage);

    return _possibleConstructorReturn(this, _getPrototypeOf(SNEncryptedStorage).apply(this, arguments));
  }

  _createClass(SNEncryptedStorage, [{
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(_getPrototypeOf(SNEncryptedStorage.prototype), "mapContentToLocalProperties", this).call(this, content);

      this.storage = content.storage;
    }
  }, {
    key: "content_type",
    get: function get() {
      return "SN|EncryptedStorage";
    }
  }]);

  return SNEncryptedStorage;
}(_core_item__WEBPACK_IMPORTED_MODULE_0__["SFItem"]);

/***/ }),

/***/ "./lib/models/privileges/privileges.js":
/*!*********************************************!*\
  !*** ./lib/models/privileges/privileges.js ***!
  \*********************************************/
/*! exports provided: SFPrivileges */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SFPrivileges", function() { return SFPrivileges; });
/* harmony import */ var lodash_pull__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash/pull */ "./node_modules/lodash/pull.js");
/* harmony import */ var lodash_pull__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash_pull__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _core_item__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/item */ "./lib/models/core/item.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }



var SFPrivileges =
/*#__PURE__*/
function (_SFItem) {
  _inherits(SFPrivileges, _SFItem);

  _createClass(SFPrivileges, null, [{
    key: "contentType",
    value: function contentType() {
      // It has prefix SN since it was originally imported from SN codebase
      return "SN|Privileges";
    }
  }]);

  function SFPrivileges(json_obj) {
    var _this;

    _classCallCheck(this, SFPrivileges);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SFPrivileges).call(this, json_obj));

    if (!_this.content.desktopPrivileges) {
      _this.content.desktopPrivileges = {};
    }

    return _this;
  }

  _createClass(SFPrivileges, [{
    key: "setCredentialsForAction",
    value: function setCredentialsForAction(action, credentials) {
      this.content.desktopPrivileges[action] = credentials;
    }
  }, {
    key: "getCredentialsForAction",
    value: function getCredentialsForAction(action) {
      return this.content.desktopPrivileges[action] || [];
    }
  }, {
    key: "toggleCredentialForAction",
    value: function toggleCredentialForAction(action, credential) {
      if (this.isCredentialRequiredForAction(action, credential)) {
        this.removeCredentialForAction(action, credential);
      } else {
        this.addCredentialForAction(action, credential);
      }
    }
  }, {
    key: "removeCredentialForAction",
    value: function removeCredentialForAction(action, credential) {
      lodash_pull__WEBPACK_IMPORTED_MODULE_0___default()(this.content.desktopPrivileges[action], credential);
    }
  }, {
    key: "addCredentialForAction",
    value: function addCredentialForAction(action, credential) {
      var credentials = this.getCredentialsForAction(action);
      credentials.push(credential);
      this.setCredentialsForAction(action, credentials);
    }
  }, {
    key: "isCredentialRequiredForAction",
    value: function isCredentialRequiredForAction(action, credential) {
      var credentialsRequired = this.getCredentialsForAction(action);
      return credentialsRequired.includes(credential);
    }
  }]);

  return SFPrivileges;
}(_core_item__WEBPACK_IMPORTED_MODULE_1__["SFItem"]);

/***/ }),

/***/ "./lib/models/server/mfa.js":
/*!**********************************!*\
  !*** ./lib/models/server/mfa.js ***!
  \**********************************/
/*! exports provided: SNMfa */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNMfa", function() { return SNMfa; });
/* harmony import */ var _core_item__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/item */ "./lib/models/core/item.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }


var SNMfa =
/*#__PURE__*/
function (_SFItem) {
  _inherits(SNMfa, _SFItem);

  function SNMfa(json_obj) {
    _classCallCheck(this, SNMfa);

    return _possibleConstructorReturn(this, _getPrototypeOf(SNMfa).call(this, json_obj));
  }

  _createClass(SNMfa, [{
    key: "doNotEncrypt",
    value: function doNotEncrypt() {
      return true;
    }
  }, {
    key: "content_type",
    get: function get() {
      return "SF|MFA";
    }
  }]);

  return SNMfa;
}(_core_item__WEBPACK_IMPORTED_MODULE_0__["SFItem"]);

/***/ }),

/***/ "./lib/models/server/serverExtension.js":
/*!**********************************************!*\
  !*** ./lib/models/server/serverExtension.js ***!
  \**********************************************/
/*! exports provided: SNServerExtension */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNServerExtension", function() { return SNServerExtension; });
/* harmony import */ var _core_item__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/item */ "./lib/models/core/item.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }


var SNServerExtension =
/*#__PURE__*/
function (_SFItem) {
  _inherits(SNServerExtension, _SFItem);

  function SNServerExtension() {
    _classCallCheck(this, SNServerExtension);

    return _possibleConstructorReturn(this, _getPrototypeOf(SNServerExtension).apply(this, arguments));
  }

  _createClass(SNServerExtension, [{
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(_getPrototypeOf(SNServerExtension.prototype), "mapContentToLocalProperties", this).call(this, content);

      this.url = content.url;
    }
  }, {
    key: "doNotEncrypt",
    value: function doNotEncrypt() {
      return true;
    }
  }, {
    key: "content_type",
    get: function get() {
      return "SF|Extension";
    }
  }]);

  return SNServerExtension;
}(_core_item__WEBPACK_IMPORTED_MODULE_0__["SFItem"]);

/***/ }),

/***/ "./lib/models/session_history/historySession.js":
/*!******************************************************!*\
  !*** ./lib/models/session_history/historySession.js ***!
  \******************************************************/
/*! exports provided: SFHistorySession */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SFHistorySession", function() { return SFHistorySession; });
/* harmony import */ var _Models_core_item__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Models/core/item */ "./lib/models/core/item.js");
/* harmony import */ var _Models_session_history_itemHistory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @Models/session_history/itemHistory */ "./lib/models/session_history/itemHistory.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/*
  Important: This is the only object in the session history domain that is persistable.

  A history session contains one main content object:
  the itemUUIDToItemHistoryMapping. This is a dictionary whose keys are item uuids,
  and each value is an SFItemHistory object.

  Each SFItemHistory object contains an array called `entires` which contain `SFItemHistory` entries (or subclasses, if the
  `SFItemHistory.HistoryEntryClassMapping` class property value is set.)
 */
// See default class values at bottom of this file, including `SFHistorySession.LargeItemEntryAmountThreshold`.


var SFHistorySession =
/*#__PURE__*/
function (_SFItem) {
  _inherits(SFHistorySession, _SFItem);

  function SFHistorySession(json_obj) {
    var _this;

    _classCallCheck(this, SFHistorySession);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SFHistorySession).call(this, json_obj));
    /*
      Our .content params:
      {
        itemUUIDToItemHistoryMapping
      }
     */

    if (!_this.content.itemUUIDToItemHistoryMapping) {
      _this.content.itemUUIDToItemHistoryMapping = {};
    } // When initializing from a json_obj, we want to deserialize the item history JSON into SFItemHistory objects.


    var uuids = Object.keys(_this.content.itemUUIDToItemHistoryMapping);
    uuids.forEach(function (itemUUID) {
      var itemHistory = _this.content.itemUUIDToItemHistoryMapping[itemUUID];
      _this.content.itemUUIDToItemHistoryMapping[itemUUID] = new _Models_session_history_itemHistory__WEBPACK_IMPORTED_MODULE_1__["SFItemHistory"](itemHistory);
    });
    return _this;
  }

  _createClass(SFHistorySession, [{
    key: "addEntryForItem",
    value: function addEntryForItem(item) {
      var itemHistory = this.historyForItem(item);
      var entry = itemHistory.addHistoryEntryForItem(item);
      return entry;
    }
  }, {
    key: "historyForItem",
    value: function historyForItem(item) {
      var history = this.content.itemUUIDToItemHistoryMapping[item.uuid];

      if (!history) {
        history = this.content.itemUUIDToItemHistoryMapping[item.uuid] = new _Models_session_history_itemHistory__WEBPACK_IMPORTED_MODULE_1__["SFItemHistory"]();
      }

      return history;
    }
  }, {
    key: "clearItemHistory",
    value: function clearItemHistory(item) {
      this.historyForItem(item).clear();
    }
  }, {
    key: "clearAllHistory",
    value: function clearAllHistory() {
      this.content.itemUUIDToItemHistoryMapping = {};
    }
  }, {
    key: "optimizeHistoryForItem",
    value: function optimizeHistoryForItem(item) {
      // Clean up if there are too many revisions. Note SFHistorySession.LargeItemEntryAmountThreshold is the amount of revisions which above, call
      // for an optimization. An optimization may not remove entries above this threshold. It will determine what it should keep and what it shouldn't.
      // So, it is possible to have a threshold of 60 but have 600 entries, if the item history deems those worth keeping.
      var itemHistory = this.historyForItem(item);

      if (itemHistory.entries.length > SFHistorySession.LargeItemEntryAmountThreshold) {
        itemHistory.optimize();
      }
    }
  }]);

  return SFHistorySession;
}(_Models_core_item__WEBPACK_IMPORTED_MODULE_0__["SFItem"]); // See comment in `this.optimizeHistoryForItem`

SFHistorySession.LargeItemEntryAmountThreshold = 60;

/***/ }),

/***/ "./lib/models/session_history/itemHistory.js":
/*!***************************************************!*\
  !*** ./lib/models/session_history/itemHistory.js ***!
  \***************************************************/
/*! exports provided: SFItemHistory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SFItemHistory", function() { return SFItemHistory; });
/* harmony import */ var _Models_session_history_itemHistoryEntry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Models/session_history/itemHistoryEntry */ "./lib/models/session_history/itemHistoryEntry.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// See default class values at bottom of this file, including `SFItemHistory.LargeEntryDeltaThreshold`.

var SFItemHistory =
/*#__PURE__*/
function () {
  function SFItemHistory() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, SFItemHistory);

    if (!this.entries) {
      this.entries = [];
    } // Deserialize the entries into entry objects.


    if (params.entries) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = params.entries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var entryParams = _step.value;
          var entry = this.createEntryForItem(entryParams.item);
          entry.setPreviousEntry(this.getLastEntry());
          this.entries.push(entry);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }

  _createClass(SFItemHistory, [{
    key: "createEntryForItem",
    value: function createEntryForItem(item) {
      var historyItemClass = SFItemHistory.HistoryEntryClassMapping && SFItemHistory.HistoryEntryClassMapping[item.content_type];

      if (!historyItemClass) {
        historyItemClass = _Models_session_history_itemHistoryEntry__WEBPACK_IMPORTED_MODULE_0__["SFItemHistoryEntry"];
      }

      var entry = new historyItemClass(item);
      return entry;
    }
  }, {
    key: "getLastEntry",
    value: function getLastEntry() {
      return this.entries[this.entries.length - 1];
    }
  }, {
    key: "addHistoryEntryForItem",
    value: function addHistoryEntryForItem(item) {
      var prospectiveEntry = this.createEntryForItem(item);
      var previousEntry = this.getLastEntry();
      prospectiveEntry.setPreviousEntry(previousEntry); // Don't add first revision if text length is 0, as this means it's a new note.
      // Actually, nevermind. If we do this, the first character added to a new note
      // will be displayed as "1 characters loaded".
      // if(!previousRevision && prospectiveRevision.textCharDiffLength == 0) {
      //   return;
      // }
      // Don't add if text is the same

      if (prospectiveEntry.isSameAsEntry(previousEntry)) {
        return;
      }

      this.entries.push(prospectiveEntry);
      return prospectiveEntry;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.entries.length = 0;
    }
  }, {
    key: "optimize",
    value: function optimize() {
      var _this = this;

      var keepEntries = [];

      var isEntrySignificant = function isEntrySignificant(entry) {
        return entry.deltaSize() > SFItemHistory.LargeEntryDeltaThreshold;
      };

      var processEntry = function processEntry(entry, index, keep) {
        // Entries may be processed retrospectively, meaning it can be decided to be deleted, then an upcoming processing can change that.
        if (keep) {
          keepEntries.push(entry);
        } else {
          // Remove if in keep
          var index = keepEntries.indexOf(entry);

          if (index !== -1) {
            keepEntries.splice(index, 1);
          }
        }

        if (keep && isEntrySignificant(entry) && entry.operationVector() == -1) {
          // This is a large negative change. Hang on to the previous entry.
          var previousEntry = _this.entries[index - 1];

          if (previousEntry) {
            keepEntries.push(previousEntry);
          }
        }
      };

      this.entries.forEach(function (entry, index) {
        if (index == 0 || index == _this.entries.length - 1) {
          // Keep the first and last
          processEntry(entry, index, true);
        } else {
          var significant = isEntrySignificant(entry);
          processEntry(entry, index, significant);
        }
      });
      this.entries = this.entries.filter(function (entry, index) {
        return keepEntries.indexOf(entry) !== -1;
      });
    }
  }]);

  return SFItemHistory;
}(); // The amount of characters added or removed that constitute a keepable entry after optimization.

SFItemHistory.LargeEntryDeltaThreshold = 15;

/***/ }),

/***/ "./lib/models/session_history/itemHistoryEntry.js":
/*!********************************************************!*\
  !*** ./lib/models/session_history/itemHistoryEntry.js ***!
  \********************************************************/
/*! exports provided: SFItemHistoryEntry */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SFItemHistoryEntry", function() { return SFItemHistoryEntry; });
/* harmony import */ var _Models_core_item__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Models/core/item */ "./lib/models/core/item.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }


var SFItemHistoryEntry =
/*#__PURE__*/
function () {
  function SFItemHistoryEntry(item) {
    _classCallCheck(this, SFItemHistoryEntry);

    // Whatever values `item` has will be persisted, so be sure that the values are picked beforehand.
    this.item = _Models_core_item__WEBPACK_IMPORTED_MODULE_0__["SFItem"].deepMerge({}, item); // We'll assume a `text` content value to diff on. If it doesn't exist, no problem.

    this.defaultContentKeyToDiffOn = "text"; // Default value

    this.textCharDiffLength = 0;

    if (typeof this.item.updated_at == 'string') {
      this.item.updated_at = new Date(this.item.updated_at);
    }
  }

  _createClass(SFItemHistoryEntry, [{
    key: "setPreviousEntry",
    value: function setPreviousEntry(previousEntry) {
      this.hasPreviousEntry = previousEntry != null; // we'll try to compute the delta based on an assumed content property of `text`, if it exists.

      if (this.item.content[this.defaultContentKeyToDiffOn]) {
        if (previousEntry) {
          this.textCharDiffLength = this.item.content[this.defaultContentKeyToDiffOn].length - previousEntry.item.content[this.defaultContentKeyToDiffOn].length;
        } else {
          this.textCharDiffLength = this.item.content[this.defaultContentKeyToDiffOn].length;
        }
      }
    }
  }, {
    key: "operationVector",
    value: function operationVector() {
      // We'll try to use the value of `textCharDiffLength` to help determine this, if it's set
      if (this.textCharDiffLength != undefined) {
        if (!this.hasPreviousEntry || this.textCharDiffLength == 0) {
          return 0;
        } else if (this.textCharDiffLength < 0) {
          return -1;
        } else {
          return 1;
        }
      } // Otherwise use a default value of 1


      return 1;
    }
  }, {
    key: "deltaSize",
    value: function deltaSize() {
      // Up to the subclass to determine how large the delta was, i.e number of characters changed.
      // But this general class won't be able to determine which property it should diff on, or even its format.
      // We can return the `textCharDiffLength` if it's set, otherwise, just return 1;
      if (this.textCharDiffLength != undefined) {
        return Math.abs(this.textCharDiffLength);
      } // Otherwise return 1 here to constitute a basic positive delta.
      // The value returned should always be positive. override `operationVector` to return the direction of the delta.


      return 1;
    }
  }, {
    key: "isSameAsEntry",
    value: function isSameAsEntry(entry) {
      if (!entry) {
        return false;
      }

      var lhs = new _Models_core_item__WEBPACK_IMPORTED_MODULE_0__["SFItem"](this.item);
      var rhs = new _Models_core_item__WEBPACK_IMPORTED_MODULE_0__["SFItem"](entry.item);
      return lhs.isItemContentEqualWith(rhs);
    }
  }]);

  return SFItemHistoryEntry;
}();

/***/ }),

/***/ "./lib/models/subclasses/smartTag.js":
/*!*******************************************!*\
  !*** ./lib/models/subclasses/smartTag.js ***!
  \*******************************************/
/*! exports provided: SNSmartTag */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNSmartTag", function() { return SNSmartTag; });
/* harmony import */ var _Models_app_tag__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Models/app/tag */ "./lib/models/app/tag.js");
/* harmony import */ var _Models_core_predicate__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @Models/core/predicate */ "./lib/models/core/predicate.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }



var SNSmartTag =
/*#__PURE__*/
function (_SNTag) {
  _inherits(SNSmartTag, _SNTag);

  function SNSmartTag(json_ob) {
    var _this;

    _classCallCheck(this, SNSmartTag);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SNSmartTag).call(this, json_ob));
    _this.content_type = "SN|SmartTag";
    return _this;
  }

  _createClass(SNSmartTag, null, [{
    key: "systemSmartTags",
    value: function systemSmartTags() {
      return [new SNSmartTag({
        uuid: SNSmartTag.SystemSmartTagIdAllNotes,
        dummy: true,
        content: {
          title: "All notes",
          isSystemTag: true,
          isAllTag: true,
          predicate: new _Models_core_predicate__WEBPACK_IMPORTED_MODULE_1__["SFPredicate"].fromArray(["content_type", "=", "Note"])
        }
      }), new SNSmartTag({
        uuid: SNSmartTag.SystemSmartTagIdArchivedNotes,
        dummy: true,
        content: {
          title: "Archived",
          isSystemTag: true,
          isArchiveTag: true,
          predicate: new _Models_core_predicate__WEBPACK_IMPORTED_MODULE_1__["SFPredicate"].fromArray(["archived", "=", true])
        }
      }), new SNSmartTag({
        uuid: SNSmartTag.SystemSmartTagIdTrashedNotes,
        dummy: true,
        content: {
          title: "Trash",
          isSystemTag: true,
          isTrashTag: true,
          predicate: new _Models_core_predicate__WEBPACK_IMPORTED_MODULE_1__["SFPredicate"].fromArray(["content.trashed", "=", true])
        }
      })];
    }
  }]);

  return SNSmartTag;
}(_Models_app_tag__WEBPACK_IMPORTED_MODULE_0__["SNTag"]);
SNSmartTag.SystemSmartTagIdAllNotes = "all-notes";
SNSmartTag.SystemSmartTagIdArchivedNotes = "archived-notes";
SNSmartTag.SystemSmartTagIdTrashedNotes = "trashed-notes";

/***/ }),

/***/ "./lib/models/subclasses/theme.js":
/*!****************************************!*\
  !*** ./lib/models/subclasses/theme.js ***!
  \****************************************/
/*! exports provided: SNTheme */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNTheme", function() { return SNTheme; });
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../app/component */ "./lib/models/app/component.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }


var SNTheme =
/*#__PURE__*/
function (_SNComponent) {
  _inherits(SNTheme, _SNComponent);

  function SNTheme(json_obj) {
    var _this;

    _classCallCheck(this, SNTheme);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SNTheme).call(this, json_obj));
    _this.area = "themes";
    return _this;
  }

  _createClass(SNTheme, [{
    key: "isLayerable",
    value: function isLayerable() {
      return this.package_info && this.package_info.layerable;
    }
  }, {
    key: "setMobileRules",
    value: function setMobileRules(rules) {
      this.setAppDataItem("mobileRules", rules);
    }
  }, {
    key: "getMobileRules",
    value: function getMobileRules() {
      return this.getAppDataItem("mobileRules") || {
        constants: {},
        rules: {}
      };
    } // Same as getMobileRules but without default value

  }, {
    key: "hasMobileRules",
    value: function hasMobileRules() {
      return this.getAppDataItem("mobileRules");
    }
  }, {
    key: "setNotAvailOnMobile",
    value: function setNotAvailOnMobile(na) {
      this.setAppDataItem("notAvailableOnMobile", na);
    }
  }, {
    key: "getNotAvailOnMobile",
    value: function getNotAvailOnMobile() {
      return this.getAppDataItem("notAvailableOnMobile");
    }
    /* We must not use .active because if you set that to true, it will also activate that theme on desktop/web */

  }, {
    key: "setMobileActive",
    value: function setMobileActive(active) {
      this.setAppDataItem("mobileActive", active);
    }
  }, {
    key: "isMobileActive",
    value: function isMobileActive() {
      return this.getAppDataItem("mobileActive");
    }
  }, {
    key: "content_type",
    get: function get() {
      return "SN|Theme";
    }
  }, {
    key: "displayName",
    get: function get() {
      return "Theme";
    }
  }]);

  return SNTheme;
}(_app_component__WEBPACK_IMPORTED_MODULE_0__["SNComponent"]);

/***/ }),

/***/ "./lib/protocol/manager.js":
/*!*********************************!*\
  !*** ./lib/protocol/manager.js ***!
  \*********************************/
/*! exports provided: SNProtocolManager, protocolManager */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNProtocolManager", function() { return SNProtocolManager; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "protocolManager", function() { return protocolManager; });
/* harmony import */ var sncrypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! sncrypto */ "../sncrypto/dist/sncrypto.js");
/* harmony import */ var sncrypto__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(sncrypto__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Protocol_versions_001_operator_001__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @Protocol/versions/001/operator_001 */ "./lib/protocol/versions/001/operator_001.js");
/* harmony import */ var _Protocol_versions_002_operator_002__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @Protocol/versions/002/operator_002 */ "./lib/protocol/versions/002/operator_002.js");
/* harmony import */ var _Protocol_versions_003_operator_003__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Protocol/versions/003/operator_003 */ "./lib/protocol/versions/003/operator_003.js");
/* harmony import */ var _Protocol_versions_004_operator_004__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Protocol/versions/004/operator_004 */ "./lib/protocol/versions/004/operator_004.js");
/* harmony import */ var _Protocol_versions_001_auth_params_001__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @Protocol/versions/001/auth_params_001 */ "./lib/protocol/versions/001/auth_params_001.js");
/* harmony import */ var _Protocol_versions_002_auth_params_002__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @Protocol/versions/002/auth_params_002 */ "./lib/protocol/versions/002/auth_params_002.js");
/* harmony import */ var _Protocol_versions_003_auth_params_003__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @Protocol/versions/003/auth_params_003 */ "./lib/protocol/versions/003/auth_params_003.js");
/* harmony import */ var _Protocol_versions_004_auth_params_004__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @Protocol/versions/004/auth_params_004 */ "./lib/protocol/versions/004/auth_params_004.js");
/* harmony import */ var _Lib_utils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @Lib/utils */ "./lib/utils.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }











var SNProtocolManager =
/*#__PURE__*/
function () {
  function SNProtocolManager(cryptoInstance) {
    _classCallCheck(this, SNProtocolManager);

    this.operators = [];

    if (!cryptoInstance && Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_9__["isWebEnvironment"])()) {
      // IE and Edge do not support pbkdf2 in WebCrypto.
      if (Object(sncrypto__WEBPACK_IMPORTED_MODULE_0__["isWebCryptoAvailable"])()) {
        this.crypto = new sncrypto__WEBPACK_IMPORTED_MODULE_0__["SNWebCrypto"]();
      } else {
        console.error("WebCrypto is not available.");
      }
    } else {
      this.crypto = cryptoInstance;
    }
  }

  _createClass(SNProtocolManager, [{
    key: "version",
    value: function version() {
      return "004";
    }
  }, {
    key: "supportsPasswordDerivationCost",
    value: function supportsPasswordDerivationCost(cost) {
      // Some passwords are created on platforms with stronger pbkdf2 capabilities, like iOS or WebCrypto,
      // if user has high password cost and is using browser that doesn't support WebCrypto,
      // we want to tell them that they can't login with this browser.
      if (cost > 5000) {
        return this.crypto instanceof sncrypto__WEBPACK_IMPORTED_MODULE_0__["SNWebCrypto"];
      } else {
        return true;
      }
    }
    /**
     * @returns  The versions that this library supports.
    */

  }, {
    key: "supportedVersions",
    value: function supportedVersions() {
      return ["001", "002", "003", "004"];
    }
  }, {
    key: "isVersionNewerThanLibraryVersion",
    value: function isVersionNewerThanLibraryVersion(version) {
      var libraryVersion = this.version();
      return parseInt(version) > parseInt(libraryVersion);
    }
  }, {
    key: "isProtocolVersionOutdated",
    value: function isProtocolVersionOutdated(version) {
      // YYYY-MM-DD
      var expirationDates = {
        "001": Date.parse("2018-01-01"),
        "002": Date.parse("2020-01-01")
      };
      var date = expirationDates[version];

      if (!date) {
        // No expiration date, is active version
        return false;
      }

      var expired = new Date() > date;
      return expired;
    }
  }, {
    key: "costMinimumForVersion",
    value: function costMinimumForVersion(version) {
      return {
        "001": _Protocol_versions_001_operator_001__WEBPACK_IMPORTED_MODULE_1__["SNProtocolOperator001"].pwCost(),
        "002": _Protocol_versions_002_operator_002__WEBPACK_IMPORTED_MODULE_2__["SNProtocolOperator002"].pwCost(),
        "003": _Protocol_versions_003_operator_003__WEBPACK_IMPORTED_MODULE_3__["SNProtocolOperator003"].pwCost(),
        "004": _Protocol_versions_004_operator_004__WEBPACK_IMPORTED_MODULE_4__["SNProtocolOperator004"].kdfIterations()
      }[version];
    }
  }, {
    key: "versionForItem",
    value: function versionForItem(item) {
      return item.content.substring(0, 3);
    }
  }, {
    key: "createOperatorForLatestVersion",
    value: function createOperatorForLatestVersion() {
      return this.createOperatorForVersion(this.version());
    }
  }, {
    key: "createOperatorForVersion",
    value: function createOperatorForVersion(version) {
      if (version === "001") {
        return new _Protocol_versions_001_operator_001__WEBPACK_IMPORTED_MODULE_1__["SNProtocolOperator001"](this.crypto);
      } else if (version === "002") {
        return new _Protocol_versions_002_operator_002__WEBPACK_IMPORTED_MODULE_2__["SNProtocolOperator002"](this.crypto);
      } else if (version === "003") {
        return new _Protocol_versions_003_operator_003__WEBPACK_IMPORTED_MODULE_3__["SNProtocolOperator003"](this.crypto);
      } else if (version === "004") {
        return new _Protocol_versions_004_operator_004__WEBPACK_IMPORTED_MODULE_4__["SNProtocolOperator004"](this.crypto);
      } else if (version === "000") {
        return this.createOperatorForLatestVersion();
      } else {
        throw "Unable to find operator for version ".concat(version);
      }
    }
  }, {
    key: "operatorForVersion",
    value: function operatorForVersion(version) {
      var operatorKey = version;
      var operator = this.operators[operatorKey];

      if (!operator) {
        operator = this.createOperatorForVersion(version);
        this.operators[operatorKey] = operator;
      }

      return operator;
    }
  }, {
    key: "defaultOperator",
    value: function defaultOperator() {
      return this.operatorForVersion(this.version());
    }
  }, {
    key: "computeEncryptionKeys",
    value: function computeEncryptionKeys(_ref) {
      var password, authParams, version, operator;
      return regeneratorRuntime.async(function computeEncryptionKeys$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              password = _ref.password, authParams = _ref.authParams;
              version = authParams.version;
              operator = this.operatorForVersion(version);
              return _context.abrupt("return", operator.computeEncryptionKeys({
                password: password,
                authParams: authParams
              }));

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "createKeysAndAuthParams",
    value: function createKeysAndAuthParams(_ref2) {
      var identifier, password, operator;
      return regeneratorRuntime.async(function createKeysAndAuthParams$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              identifier = _ref2.identifier, password = _ref2.password;
              operator = this.defaultOperator();
              return _context2.abrupt("return", operator.createKeysAndAuthParams({
                identifier: identifier,
                password: password
              }));

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "decryptItem",
    value: function decryptItem(_ref3) {
      var item, keys, version, operator;
      return regeneratorRuntime.async(function decryptItem$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              item = _ref3.item, keys = _ref3.keys;
              version = this.versionForItem(item);
              operator = this.operatorForVersion(version);
              return _context3.abrupt("return", operator.decryptItem({
                item: item,
                keys: keys
              }));

            case 4:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "encryptItem",
    value: function encryptItem(_ref4) {
      var item, keys, authParams, version, operator;
      return regeneratorRuntime.async(function encryptItem$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              item = _ref4.item, keys = _ref4.keys, authParams = _ref4.authParams;
              version = authParams.version;
              operator = this.operatorForVersion(version);
              return _context4.abrupt("return", operator.encryptItem({
                item: item,
                keys: keys,
                authParams: authParams
              }));

            case 4:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
    /**
     * Compares two sets of keys for equality
     * @returns Boolean
    */

  }, {
    key: "compareKeys",
    value: function compareKeys(keysA, keysB) {
      return regeneratorRuntime.async(function compareKeys$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt("return", keysA.compare(keysB));

            case 1:
            case "end":
              return _context5.stop();
          }
        }
      });
    }
  }, {
    key: "decryptMultipleItems",
    value: function decryptMultipleItems(items, keys, throws) {
      var _this = this;

      var decrypt;
      return regeneratorRuntime.async(function decryptMultipleItems$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              decrypt = function decrypt(item) {
                var isString;
                return regeneratorRuntime.async(function decrypt$(_context6) {
                  while (1) {
                    switch (_context6.prev = _context6.next) {
                      case 0:
                        if (item) {
                          _context6.next = 2;
                          break;
                        }

                        return _context6.abrupt("return");

                      case 2:
                        if (!(item.deleted === true && item.content === null)) {
                          _context6.next = 4;
                          break;
                        }

                        return _context6.abrupt("return");

                      case 4:
                        isString = typeof item.content === 'string' || item.content instanceof String;

                        if (!isString) {
                          _context6.next = 19;
                          break;
                        }

                        _context6.prev = 6;
                        _context6.next = 9;
                        return regeneratorRuntime.awrap(_this.decryptItem({
                          item: item,
                          keys: keys
                        }));

                      case 9:
                        _context6.next = 19;
                        break;

                      case 11:
                        _context6.prev = 11;
                        _context6.t0 = _context6["catch"](6);

                        if (!item.errorDecrypting) {
                          item.errorDecryptingValueChanged = true;
                        }

                        item.errorDecrypting = true;

                        if (!throws) {
                          _context6.next = 17;
                          break;
                        }

                        throw _context6.t0;

                      case 17:
                        console.error("Error decrypting item", item, _context6.t0);
                        return _context6.abrupt("return");

                      case 19:
                      case "end":
                        return _context6.stop();
                    }
                  }
                }, null, null, [[6, 11]]);
              };

              return _context7.abrupt("return", Promise.all(items.map(function (item) {
                return decrypt(item);
              })));

            case 2:
            case "end":
              return _context7.stop();
          }
        }
      });
    }
  }, {
    key: "createVersionedAuthParams",
    value: function createVersionedAuthParams(authParams) {
      // 002 doesn't have version automatically, newer versions do.
      var version = authParams.version || "002";

      switch (version) {
        case "001":
          return new _Protocol_versions_001_auth_params_001__WEBPACK_IMPORTED_MODULE_5__["SNAuthParams001"](authParams);

        case "002":
          return new _Protocol_versions_002_auth_params_002__WEBPACK_IMPORTED_MODULE_6__["SNAuthParams002"](authParams);

        case "003":
          return new _Protocol_versions_003_auth_params_003__WEBPACK_IMPORTED_MODULE_7__["SNAuthParams003"](authParams);

        case "004":
          return new _Protocol_versions_004_auth_params_004__WEBPACK_IMPORTED_MODULE_8__["SNAuthParams004"](authParams);
      }

      throw "No auth params version found.";
    }
  }]);

  return SNProtocolManager;
}();
var protocolManager = new SNProtocolManager();


/***/ }),

/***/ "./lib/protocol/versions/001/auth_params_001.js":
/*!******************************************************!*\
  !*** ./lib/protocol/versions/001/auth_params_001.js ***!
  \******************************************************/
/*! exports provided: SNAuthParams001 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNAuthParams001", function() { return SNAuthParams001; });
/* harmony import */ var _Protocol_versions_auth_params__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Protocol/versions/auth_params */ "./lib/protocol/versions/auth_params.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }


var SNAuthParams001 =
/*#__PURE__*/
function (_SNAuthParams) {
  _inherits(SNAuthParams001, _SNAuthParams);

  function SNAuthParams001() {
    _classCallCheck(this, SNAuthParams001);

    return _possibleConstructorReturn(this, _getPrototypeOf(SNAuthParams001).apply(this, arguments));
  }

  _createClass(SNAuthParams001, [{
    key: "kdfIterations",
    get: function get() {
      return this.content.pw_cost;
    }
  }, {
    key: "seed",
    get: function get() {
      return this.content.pw_nonce;
    }
  }, {
    key: "version",
    get: function get() {
      return this.content.version;
    }
  }, {
    key: "identifier",
    get: function get() {
      return this.content.email;
    }
  }]);

  return SNAuthParams001;
}(_Protocol_versions_auth_params__WEBPACK_IMPORTED_MODULE_0__["SNAuthParams"]);

/***/ }),

/***/ "./lib/protocol/versions/001/keys_content_001.js":
/*!*******************************************************!*\
  !*** ./lib/protocol/versions/001/keys_content_001.js ***!
  \*******************************************************/
/*! exports provided: SNKeysContent001 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNKeysContent001", function() { return SNKeysContent001; });
/* harmony import */ var _Protocol_versions_keys_content__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Protocol/versions/keys_content */ "./lib/protocol/versions/keys_content.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }


var SNKeysContent001 =
/*#__PURE__*/
function (_SNKeysContent) {
  _inherits(SNKeysContent001, _SNKeysContent);

  function SNKeysContent001(content) {
    var _this;

    _classCallCheck(this, SNKeysContent001);

    _this.content = content;
    return _possibleConstructorReturn(_this);
  }

  _createClass(SNKeysContent001, [{
    key: "itemsMasterKey",
    get: function get() {
      return this.content.mk;
    }
  }, {
    key: "masterKey",
    get: function get() {
      return this.content.mk;
    }
  }, {
    key: "serverAuthenticationValue",
    get: function get() {
      return this.content.pw;
    }
  }, {
    key: "encryptionAuthenticationKey",
    get: function get() {
      throw "Should not attempt to access this value using this protocol version.";
      return null;
    }
  }]);

  return SNKeysContent001;
}(_Protocol_versions_keys_content__WEBPACK_IMPORTED_MODULE_0__["SNKeysContent"]);

/***/ }),

/***/ "./lib/protocol/versions/001/operator_001.js":
/*!***************************************************!*\
  !*** ./lib/protocol/versions/001/operator_001.js ***!
  \***************************************************/
/*! exports provided: SNProtocolOperator001 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNProtocolOperator001", function() { return SNProtocolOperator001; });
/* harmony import */ var _Protocol_versions_operator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Protocol/versions/operator */ "./lib/protocol/versions/operator.js");
/* harmony import */ var _Protocol_versions_001_auth_params_001__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @Protocol/versions/001/auth_params_001 */ "./lib/protocol/versions/001/auth_params_001.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _readOnlyError(name) { throw new Error("\"" + name + "\" is read-only"); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }



var SNProtocolOperator001 =
/*#__PURE__*/
function (_SNProtocolOperator) {
  _inherits(SNProtocolOperator001, _SNProtocolOperator);

  function SNProtocolOperator001() {
    _classCallCheck(this, SNProtocolOperator001);

    return _possibleConstructorReturn(this, _getPrototypeOf(SNProtocolOperator001).apply(this, arguments));
  }

  _createClass(SNProtocolOperator001, [{
    key: "createKeysAndAuthParams",

    /**
     * @public
     */
    value: function createKeysAndAuthParams(_ref) {
      var identifier, password, version, pw_cost, pw_nonce, pw_salt, keys, authParams;
      return regeneratorRuntime.async(function createKeysAndAuthParams$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              identifier = _ref.identifier, password = _ref.password;
              version = this.constructor.versionString();
              pw_cost = this.constructor.pwCost();
              _context.next = 5;
              return regeneratorRuntime.awrap(this.crypto.generateRandomKey(128));

            case 5:
              pw_nonce = _context.sent;
              _context.next = 8;
              return regeneratorRuntime.awrap(this.crypto.unsafe_sha1(identifier + "SN" + pw_nonce));

            case 8:
              pw_salt = _context.sent;
              _context.next = 11;
              return regeneratorRuntime.awrap(this.deriveKeys({
                password: password,
                pw_salt: pw_salt,
                pw_cost: pw_cost
              }));

            case 11:
              keys = _context.sent;
              authParams = new _Protocol_versions_001_auth_params_001__WEBPACK_IMPORTED_MODULE_1__["SNAuthParams001"]({
                pw_nonce: pw_nonce,
                pw_cost: pw_cost,
                pw_salt: pw_salt,
                email: identifier
              });
              return _context.abrupt("return", {
                keys: keys,
                authParams: authParams
              });

            case 14:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "computeEncryptionKeys",
    value: function computeEncryptionKeys(_ref2) {
      var password, authParams, pw_salt, keys;
      return regeneratorRuntime.async(function computeEncryptionKeys$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              password = _ref2.password, authParams = _ref2.authParams;
              // Salt is returned from server
              pw_salt = authParams.pw_salt;
              _context2.next = 4;
              return regeneratorRuntime.awrap(this.deriveKeys({
                password: password,
                pw_salt: pw_salt,
                pw_cost: authParams.pw_cost
              }));

            case 4:
              keys = _context2.sent;
              return _context2.abrupt("return", keys);

            case 6:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "decryptText",
    value: function decryptText() {
      var _ref3,
          ciphertextToAuth,
          contentCiphertext,
          encryptionKey,
          iv,
          authHash,
          authKey,
          requiresAuth,
          localAuthHash,
          keyData,
          ivData,
          _args3 = arguments;

      return regeneratorRuntime.async(function decryptText$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _ref3 = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : {}, ciphertextToAuth = _ref3.ciphertextToAuth, contentCiphertext = _ref3.contentCiphertext, encryptionKey = _ref3.encryptionKey, iv = _ref3.iv, authHash = _ref3.authHash, authKey = _ref3.authKey;
              requiresAuth = _args3.length > 1 ? _args3[1] : undefined;

              if (!(requiresAuth && !authHash)) {
                _context3.next = 5;
                break;
              }

              console.error("Auth hash is required.");
              return _context3.abrupt("return");

            case 5:
              if (!authHash) {
                _context3.next = 12;
                break;
              }

              _context3.next = 8;
              return regeneratorRuntime.awrap(this.crypto.hmac256(ciphertextToAuth, authKey));

            case 8:
              localAuthHash = _context3.sent;

              if (!(this.crypto.timingSafeEqual(authHash, localAuthHash) === false)) {
                _context3.next = 12;
                break;
              }

              console.error("Auth hash does not match, returning null.");
              return _context3.abrupt("return", null);

            case 12:
              _context3.next = 14;
              return regeneratorRuntime.awrap(this.crypto.hexStringToArrayBuffer(encryptionKey));

            case 14:
              keyData = _context3.sent;
              _context3.next = 17;
              return regeneratorRuntime.awrap(this.crypto.hexStringToArrayBuffer(iv || ""));

            case 17:
              ivData = _context3.sent;

              if (!ivData) {
                // in 001, iv can be null, so we'll initialize to an empty array buffer instead
                ivData = (_readOnlyError("ivData"), new ArrayBuffer(16));
              }

              return _context3.abrupt("return", this.crypto.aes256CbcDecrypt(contentCiphertext, keyData, ivData));

            case 20:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "encryptText",
    value: function encryptText(text, key, iv) {
      var keyData, ivData;
      return regeneratorRuntime.async(function encryptText$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return regeneratorRuntime.awrap(this.crypto.hexStringToArrayBuffer(key));

            case 2:
              keyData = _context4.sent;
              _context4.next = 5;
              return regeneratorRuntime.awrap(this.crypto.hexStringToArrayBuffer(iv || ""));

            case 5:
              ivData = _context4.sent;

              if (!ivData) {
                // in 001, iv can be null, so we'll initialize to an empty array buffer instead
                ivData = (_readOnlyError("ivData"), new ArrayBuffer(16));
              }

              return _context4.abrupt("return", this.crypto.aes256CbcEncrypt(text, keyData, ivData));

            case 8:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "encryptItem",
    value: function encryptItem(_ref4) {
      var item, keys, authParams, EncryptionKeyLength, params, item_key, ek, ak, ciphertext, authHash;
      return regeneratorRuntime.async(function encryptItem$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              item = _ref4.item, keys = _ref4.keys, authParams = _ref4.authParams;
              EncryptionKeyLength = 512;
              params = {}; // encrypt item key

              _context5.next = 5;
              return regeneratorRuntime.awrap(this.crypto.generateRandomKey(EncryptionKeyLength));

            case 5:
              item_key = _context5.sent;
              _context5.next = 8;
              return regeneratorRuntime.awrap(this.encryptText(item_key, keys.mk, null));

            case 8:
              params.enc_item_key = _context5.sent;
              _context5.next = 11;
              return regeneratorRuntime.awrap(this.firstHalfOfKey(item_key));

            case 11:
              ek = _context5.sent;
              _context5.next = 14;
              return regeneratorRuntime.awrap(this.secondHalfOfKey(item_key));

            case 14:
              ak = _context5.sent;
              _context5.next = 17;
              return regeneratorRuntime.awrap(this._private_encryptString(JSON.stringify(item.createContentJSONFromProperties()), ek, ak, item.uuid, authParams));

            case 17:
              ciphertext = _context5.sent;
              _context5.next = 20;
              return regeneratorRuntime.awrap(this.crypto.hmac256(ciphertext, ak));

            case 20:
              authHash = _context5.sent;
              params.auth_hash = authHash;
              params.content = ciphertext;
              return _context5.abrupt("return", params);

            case 24:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "decryptItem",
    value: function decryptItem(_ref5) {
      var item, keys, encryptedItemKey, requiresAuth, keyParams, item_key, ek, ak, itemParams, content;
      return regeneratorRuntime.async(function decryptItem$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              item = _ref5.item, keys = _ref5.keys;

              if (!(typeof item.content != "string")) {
                _context6.next = 3;
                break;
              }

              return _context6.abrupt("return");

            case 3:
              if (!item.content.startsWith("000")) {
                _context6.next = 15;
                break;
              }

              _context6.prev = 4;
              _context6.t0 = JSON;
              _context6.next = 8;
              return regeneratorRuntime.awrap(this.crypto.base64Decode(item.content.substring(3, item.content.length)));

            case 8:
              _context6.t1 = _context6.sent;
              item.content = _context6.t0.parse.call(_context6.t0, _context6.t1);
              _context6.next = 14;
              break;

            case 12:
              _context6.prev = 12;
              _context6.t2 = _context6["catch"](4);

            case 14:
              return _context6.abrupt("return");

            case 15:
              if (item.enc_item_key) {
                _context6.next = 18;
                break;
              }

              // This needs to be here to continue, return otherwise
              console.log("Missing item encryption key, skipping decryption.");
              return _context6.abrupt("return");

            case 18:
              // decrypt encrypted key
              encryptedItemKey = item.enc_item_key;
              requiresAuth = true;
              encryptedItemKey = "001" + encryptedItemKey;
              requiresAuth = false;
              keyParams = this.encryptionComponentsFromString(encryptedItemKey, keys.itemsMasterKey, keys.encryptionAuthenticationKey); // return if uuid in auth hash does not match item uuid. Signs of tampering.

              if (!(keyParams.uuid && keyParams.uuid !== item.uuid)) {
                _context6.next = 28;
                break;
              }

              console.error("Item key params UUID does not match item UUID");

              if (!item.errorDecrypting) {
                item.errorDecryptingValueChanged = true;
              }

              item.errorDecrypting = true;
              return _context6.abrupt("return");

            case 28:
              _context6.next = 30;
              return regeneratorRuntime.awrap(this.decryptText(keyParams, requiresAuth));

            case 30:
              item_key = _context6.sent;

              if (item_key) {
                _context6.next = 36;
                break;
              }

              console.log("Error decrypting item", item);

              if (!item.errorDecrypting) {
                item.errorDecryptingValueChanged = true;
              }

              item.errorDecrypting = true;
              return _context6.abrupt("return");

            case 36:
              _context6.next = 38;
              return regeneratorRuntime.awrap(this.firstHalfOfKey(item_key));

            case 38:
              ek = _context6.sent;
              _context6.next = 41;
              return regeneratorRuntime.awrap(this.secondHalfOfKey(item_key));

            case 41:
              ak = _context6.sent;
              itemParams = this.encryptionComponentsFromString(item.content, ek, ak);
              _context6.prev = 43;
              _context6.t3 = JSON;
              _context6.next = 47;
              return regeneratorRuntime.awrap(this.crypto.base64Decode(itemParams.authParams));

            case 47:
              _context6.t4 = _context6.sent;
              item.auth_params = _context6.t3.parse.call(_context6.t3, _context6.t4);
              _context6.next = 53;
              break;

            case 51:
              _context6.prev = 51;
              _context6.t5 = _context6["catch"](43);

            case 53:
              if (!(itemParams.uuid && itemParams.uuid !== item.uuid)) {
                _context6.next = 57;
                break;
              }

              if (!item.errorDecrypting) {
                item.errorDecryptingValueChanged = true;
              }

              item.errorDecrypting = true;
              return _context6.abrupt("return");

            case 57:
              if (!itemParams.authHash) {
                itemParams.authHash = item.auth_hash;
              }

              _context6.next = 60;
              return regeneratorRuntime.awrap(this.decryptText(itemParams, true));

            case 60:
              content = _context6.sent;

              if (!content) {
                if (!item.errorDecrypting) {
                  item.errorDecryptingValueChanged = true;
                }

                item.errorDecrypting = true;
              } else {
                if (item.errorDecrypting == true) {
                  item.errorDecryptingValueChanged = true;
                } // Content should only be set if it was successfully decrypted, and should otherwise remain unchanged.


                item.errorDecrypting = false;
                item.content = content;
              }

            case 62:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this, [[4, 12], [43, 51]]);
    }
    /**
     * @private
     */

  }, {
    key: "encryptionComponentsFromString",
    value: function encryptionComponentsFromString(string, encryptionKey, authKey) {
      var encryptionVersion = string.substring(0, 3);
      return {
        contentCiphertext: string.substring(3, string.length),
        encryptionVersion: encryptionVersion,
        ciphertextToAuth: string,
        iv: null,
        authHash: null,
        encryptionKey: encryptionKey,
        authKey: authKey
      };
    }
  }, {
    key: "deriveKeys",
    value: function deriveKeys() {
      var _ref6,
          password,
          pw_salt,
          pw_cost,
          PBKDF2OutputKeyLength,
          derivedKey,
          partitions,
          keys,
          _args7 = arguments;

      return regeneratorRuntime.async(function deriveKeys$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _ref6 = _args7.length > 0 && _args7[0] !== undefined ? _args7[0] : {}, password = _ref6.password, pw_salt = _ref6.pw_salt, pw_cost = _ref6.pw_cost;
              PBKDF2OutputKeyLength = 512;
              _context7.next = 4;
              return regeneratorRuntime.awrap(this.crypto.pbkdf2({
                password: password,
                salt: pw_salt,
                iterations: pw_cost,
                length: PBKDF2OutputKeyLength
              }));

            case 4:
              derivedKey = _context7.sent;
              _context7.next = 7;
              return regeneratorRuntime.awrap(this.splitKey({
                key: derivedKey,
                numParts: 2
              }));

            case 7:
              partitions = _context7.sent;
              keys = SNKeys.FromRaw({
                pw: partitions[0],
                mk: partitions[1],
                version: this.constructor.versionString()
              });
              return _context7.abrupt("return", keys);

            case 10:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "_private_encryptString",
    value: function _private_encryptString(string, encryptionKey, authKey, uuid, authParams) {
      var fullCiphertext, contentCiphertext;
      return regeneratorRuntime.async(function _private_encryptString$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return regeneratorRuntime.awrap(this.encryptText(string, encryptionKey, null));

            case 2:
              contentCiphertext = _context8.sent;
              fullCiphertext = authParams.version + contentCiphertext;
              return _context8.abrupt("return", fullCiphertext);

            case 5:
            case "end":
              return _context8.stop();
          }
        }
      }, null, this);
    }
  }], [{
    key: "pwCost",
    value: function pwCost() {
      return 3000;
    }
  }, {
    key: "versionString",
    value: function versionString() {
      return "001";
    }
  }]);

  return SNProtocolOperator001;
}(_Protocol_versions_operator__WEBPACK_IMPORTED_MODULE_0__["SNProtocolOperator"]);

/***/ }),

/***/ "./lib/protocol/versions/002/auth_params_002.js":
/*!******************************************************!*\
  !*** ./lib/protocol/versions/002/auth_params_002.js ***!
  \******************************************************/
/*! exports provided: SNAuthParams002 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNAuthParams002", function() { return SNAuthParams002; });
/* harmony import */ var _Protocol_versions_auth_params__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Protocol/versions/auth_params */ "./lib/protocol/versions/auth_params.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }


var SNAuthParams002 =
/*#__PURE__*/
function (_SNAuthParams) {
  _inherits(SNAuthParams002, _SNAuthParams);

  function SNAuthParams002() {
    _classCallCheck(this, SNAuthParams002);

    return _possibleConstructorReturn(this, _getPrototypeOf(SNAuthParams002).apply(this, arguments));
  }

  _createClass(SNAuthParams002, [{
    key: "kdfIterations",
    get: function get() {
      return this.content.pw_cost;
    }
  }, {
    key: "seed",
    get: function get() {
      return this.content.pw_nonce;
    }
  }, {
    key: "version",
    get: function get() {
      return this.content.version;
    }
  }, {
    key: "identifier",
    get: function get() {
      return this.content.email;
    }
  }]);

  return SNAuthParams002;
}(_Protocol_versions_auth_params__WEBPACK_IMPORTED_MODULE_0__["SNAuthParams"]);

/***/ }),

/***/ "./lib/protocol/versions/002/keys_content_002.js":
/*!*******************************************************!*\
  !*** ./lib/protocol/versions/002/keys_content_002.js ***!
  \*******************************************************/
/*! exports provided: SNKeysContent002 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNKeysContent002", function() { return SNKeysContent002; });
/* harmony import */ var _Protocol_versions_keys_content__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Protocol/versions/keys_content */ "./lib/protocol/versions/keys_content.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }


var SNKeysContent002 =
/*#__PURE__*/
function (_SNKeysContent) {
  _inherits(SNKeysContent002, _SNKeysContent);

  function SNKeysContent002(content) {
    var _this;

    _classCallCheck(this, SNKeysContent002);

    _this.content = content;
    return _possibleConstructorReturn(_this);
  }

  _createClass(SNKeysContent002, [{
    key: "itemsMasterKey",
    get: function get() {
      return this.content.mk;
    }
  }, {
    key: "masterKey",
    get: function get() {
      return this.content.mk;
    }
  }, {
    key: "serverAuthenticationValue",
    get: function get() {
      return this.content.pw;
    }
  }, {
    key: "encryptionAuthenticationKey",
    get: function get() {
      return this.content.ak;
    }
  }]);

  return SNKeysContent002;
}(_Protocol_versions_keys_content__WEBPACK_IMPORTED_MODULE_0__["SNKeysContent"]);

/***/ }),

/***/ "./lib/protocol/versions/002/operator_002.js":
/*!***************************************************!*\
  !*** ./lib/protocol/versions/002/operator_002.js ***!
  \***************************************************/
/*! exports provided: SNProtocolOperator002 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNProtocolOperator002", function() { return SNProtocolOperator002; });
/* harmony import */ var _Protocol_versions_operator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Protocol/versions/operator */ "./lib/protocol/versions/operator.js");
/* harmony import */ var _Protocol_versions_002_auth_params_002__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @Protocol/versions/002/auth_params_002 */ "./lib/protocol/versions/002/auth_params_002.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }



var SNProtocolOperator002 =
/*#__PURE__*/
function (_SNProtocolOperator) {
  _inherits(SNProtocolOperator002, _SNProtocolOperator);

  function SNProtocolOperator002() {
    _classCallCheck(this, SNProtocolOperator002);

    return _possibleConstructorReturn(this, _getPrototypeOf(SNProtocolOperator002).apply(this, arguments));
  }

  _createClass(SNProtocolOperator002, [{
    key: "createKeysAndAuthParams",

    /**
     * @public
     */
    value: function createKeysAndAuthParams(_ref) {
      var identifier, password, version, pw_cost, pw_nonce, pw_salt, keys, authParams;
      return regeneratorRuntime.async(function createKeysAndAuthParams$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              identifier = _ref.identifier, password = _ref.password;
              version = this.constructor.versionString();
              pw_cost = this.constructor.pwCost();
              _context.next = 5;
              return regeneratorRuntime.awrap(this.crypto.generateRandomKey(128));

            case 5:
              pw_nonce = _context.sent;
              _context.next = 8;
              return regeneratorRuntime.awrap(this.crypto.unsafe_sha1(identifier + ":" + pw_nonce));

            case 8:
              pw_salt = _context.sent;
              _context.next = 11;
              return regeneratorRuntime.awrap(this.deriveKeys({
                password: password,
                pw_salt: pw_salt,
                pw_cost: pw_cost
              }));

            case 11:
              keys = _context.sent;
              authParams = new _Protocol_versions_002_auth_params_002__WEBPACK_IMPORTED_MODULE_1__["SNAuthParams002"]({
                pw_nonce: pw_nonce,
                pw_cost: pw_cost,
                pw_salt: pw_salt,
                email: identifier
              });
              return _context.abrupt("return", {
                keys: keys,
                authParams: authParams
              });

            case 14:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "computeEncryptionKeys",
    value: function computeEncryptionKeys(_ref2) {
      var password, authParams, pw_salt, keys;
      return regeneratorRuntime.async(function computeEncryptionKeys$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              password = _ref2.password, authParams = _ref2.authParams;
              // Salt is returned from server
              pw_salt = authParams.pw_salt;
              _context2.next = 4;
              return regeneratorRuntime.awrap(this.deriveKeys({
                password: password,
                pw_salt: pw_salt,
                pw_cost: authParams.pw_cost
              }));

            case 4:
              keys = _context2.sent;
              return _context2.abrupt("return", keys);

            case 6:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "decryptText",
    value: function decryptText() {
      var _ref3,
          ciphertextToAuth,
          contentCiphertext,
          encryptionKey,
          iv,
          authHash,
          authKey,
          requiresAuth,
          localAuthHash,
          keyData,
          ivData,
          _args3 = arguments;

      return regeneratorRuntime.async(function decryptText$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _ref3 = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : {}, ciphertextToAuth = _ref3.ciphertextToAuth, contentCiphertext = _ref3.contentCiphertext, encryptionKey = _ref3.encryptionKey, iv = _ref3.iv, authHash = _ref3.authHash, authKey = _ref3.authKey;
              requiresAuth = _args3.length > 1 ? _args3[1] : undefined;

              if (!(requiresAuth && !authHash)) {
                _context3.next = 5;
                break;
              }

              console.error("Auth hash is required.");
              return _context3.abrupt("return");

            case 5:
              if (!authHash) {
                _context3.next = 12;
                break;
              }

              _context3.next = 8;
              return regeneratorRuntime.awrap(this.crypto.hmac256(ciphertextToAuth, authKey));

            case 8:
              localAuthHash = _context3.sent;

              if (!(this.crypto.timingSafeEqual(authHash, localAuthHash) === false)) {
                _context3.next = 12;
                break;
              }

              console.error("Auth hash does not match, returning null.");
              return _context3.abrupt("return", null);

            case 12:
              _context3.next = 14;
              return regeneratorRuntime.awrap(this.crypto.hexStringToArrayBuffer(encryptionKey));

            case 14:
              keyData = _context3.sent;
              _context3.next = 17;
              return regeneratorRuntime.awrap(this.crypto.hexStringToArrayBuffer(iv || ""));

            case 17:
              ivData = _context3.sent;
              return _context3.abrupt("return", this.crypto.aes256CbcDecrypt(contentCiphertext, keyData, ivData));

            case 19:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "encryptText",
    value: function encryptText(text, key, iv) {
      var keyData, ivData;
      return regeneratorRuntime.async(function encryptText$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return regeneratorRuntime.awrap(this.crypto.hexStringToArrayBuffer(key));

            case 2:
              keyData = _context4.sent;
              _context4.next = 5;
              return regeneratorRuntime.awrap(this.crypto.hexStringToArrayBuffer(iv || ""));

            case 5:
              ivData = _context4.sent;
              return _context4.abrupt("return", this.crypto.aes256CbcEncrypt(text, keyData, ivData));

            case 7:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "encryptItem",
    value: function encryptItem(_ref4) {
      var item, keys, authParams, EncryptionKeyLength, params, item_key, ek, ak, ciphertext;
      return regeneratorRuntime.async(function encryptItem$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              item = _ref4.item, keys = _ref4.keys, authParams = _ref4.authParams;
              EncryptionKeyLength = 512;
              params = {}; // encrypt item key

              _context5.next = 5;
              return regeneratorRuntime.awrap(this.crypto.generateRandomKey(EncryptionKeyLength));

            case 5:
              item_key = _context5.sent;
              _context5.next = 8;
              return regeneratorRuntime.awrap(this._private_encryptString(item_key, keys.mk, keys.ak, item.uuid, authParams));

            case 8:
              params.enc_item_key = _context5.sent;
              _context5.next = 11;
              return regeneratorRuntime.awrap(this.firstHalfOfKey(item_key));

            case 11:
              ek = _context5.sent;
              _context5.next = 14;
              return regeneratorRuntime.awrap(this.secondHalfOfKey(item_key));

            case 14:
              ak = _context5.sent;
              _context5.next = 17;
              return regeneratorRuntime.awrap(this._private_encryptString(JSON.stringify(item.createContentJSONFromProperties()), ek, ak, item.uuid, authParams));

            case 17:
              ciphertext = _context5.sent;
              params.content = ciphertext;
              return _context5.abrupt("return", params);

            case 20:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "decryptItem",
    value: function decryptItem(_ref5) {
      var item, keys, encryptedItemKey, requiresAuth, keyParams, item_key, ek, ak, itemParams, content;
      return regeneratorRuntime.async(function decryptItem$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              item = _ref5.item, keys = _ref5.keys;

              if (!(typeof item.content != "string")) {
                _context6.next = 3;
                break;
              }

              return _context6.abrupt("return");

            case 3:
              if (!item.content.startsWith("000")) {
                _context6.next = 15;
                break;
              }

              _context6.prev = 4;
              _context6.t0 = JSON;
              _context6.next = 8;
              return regeneratorRuntime.awrap(this.crypto.base64Decode(item.content.substring(3, item.content.length)));

            case 8:
              _context6.t1 = _context6.sent;
              item.content = _context6.t0.parse.call(_context6.t0, _context6.t1);
              _context6.next = 14;
              break;

            case 12:
              _context6.prev = 12;
              _context6.t2 = _context6["catch"](4);

            case 14:
              return _context6.abrupt("return");

            case 15:
              if (item.enc_item_key) {
                _context6.next = 18;
                break;
              }

              // This needs to be here to continue, return otherwise
              console.log("Missing item encryption key, skipping decryption.");
              return _context6.abrupt("return");

            case 18:
              // decrypt encrypted key
              encryptedItemKey = item.enc_item_key;
              requiresAuth = true;
              keyParams = this.encryptionComponentsFromString(encryptedItemKey, keys.mk, keys.ak); // return if uuid in auth hash does not match item uuid. Signs of tampering.

              if (!(keyParams.uuid && keyParams.uuid !== item.uuid)) {
                _context6.next = 26;
                break;
              }

              console.error("Item key params UUID does not match item UUID");

              if (!item.errorDecrypting) {
                item.errorDecryptingValueChanged = true;
              }

              item.errorDecrypting = true;
              return _context6.abrupt("return");

            case 26:
              _context6.next = 28;
              return regeneratorRuntime.awrap(this.decryptText(keyParams, requiresAuth));

            case 28:
              item_key = _context6.sent;

              if (item_key) {
                _context6.next = 34;
                break;
              }

              console.log("Error decrypting item", item);

              if (!item.errorDecrypting) {
                item.errorDecryptingValueChanged = true;
              }

              item.errorDecrypting = true;
              return _context6.abrupt("return");

            case 34:
              _context6.next = 36;
              return regeneratorRuntime.awrap(this.firstHalfOfKey(item_key));

            case 36:
              ek = _context6.sent;
              _context6.next = 39;
              return regeneratorRuntime.awrap(this.secondHalfOfKey(item_key));

            case 39:
              ak = _context6.sent;
              itemParams = this.encryptionComponentsFromString(item.content, ek, ak);
              _context6.prev = 41;
              _context6.t3 = JSON;
              _context6.next = 45;
              return regeneratorRuntime.awrap(this.crypto.base64Decode(itemParams.authParams));

            case 45:
              _context6.t4 = _context6.sent;
              item.auth_params = _context6.t3.parse.call(_context6.t3, _context6.t4);
              _context6.next = 51;
              break;

            case 49:
              _context6.prev = 49;
              _context6.t5 = _context6["catch"](41);

            case 51:
              if (!(itemParams.uuid && itemParams.uuid !== item.uuid)) {
                _context6.next = 55;
                break;
              }

              if (!item.errorDecrypting) {
                item.errorDecryptingValueChanged = true;
              }

              item.errorDecrypting = true;
              return _context6.abrupt("return");

            case 55:
              _context6.next = 57;
              return regeneratorRuntime.awrap(this.decryptText(itemParams, true));

            case 57:
              content = _context6.sent;

              if (!content) {
                if (!item.errorDecrypting) {
                  item.errorDecryptingValueChanged = true;
                }

                item.errorDecrypting = true;
              } else {
                if (item.errorDecrypting == true) {
                  item.errorDecryptingValueChanged = true;
                } // Content should only be set if it was successfully decrypted, and should otherwise remain unchanged.


                item.errorDecrypting = false;
                item.content = content;
              }

            case 59:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this, [[4, 12], [41, 49]]);
    }
    /**
     * @private
     */

  }, {
    key: "deriveKeys",
    value: function deriveKeys() {
      var _ref6,
          password,
          pw_salt,
          pw_cost,
          PBKDF2OutputKeyLength,
          derivedKey,
          partitions,
          keys,
          _args7 = arguments;

      return regeneratorRuntime.async(function deriveKeys$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _ref6 = _args7.length > 0 && _args7[0] !== undefined ? _args7[0] : {}, password = _ref6.password, pw_salt = _ref6.pw_salt, pw_cost = _ref6.pw_cost;
              PBKDF2OutputKeyLength = 768;
              _context7.next = 4;
              return regeneratorRuntime.awrap(this.crypto.pbkdf2({
                password: password,
                salt: pw_salt,
                iterations: pw_cost,
                length: PBKDF2OutputKeyLength
              }));

            case 4:
              derivedKey = _context7.sent;
              _context7.next = 7;
              return regeneratorRuntime.awrap(this.splitKey({
                key: derivedKey,
                numParts: 3
              }));

            case 7:
              partitions = _context7.sent;
              keys = SNKeys.FromRaw({
                pw: partitions[0],
                mk: partitions[1],
                ak: partitions[2],
                version: this.constructor.versionString()
              });
              return _context7.abrupt("return", keys);

            case 10:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "_private_encryptString",
    value: function _private_encryptString(string, encryptionKey, authKey, uuid, authParams) {
      var fullCiphertext, contentCiphertext, iv, ciphertextToAuth, authHash, authParamsString;
      return regeneratorRuntime.async(function _private_encryptString$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return regeneratorRuntime.awrap(this.crypto.generateRandomKey(128));

            case 2:
              iv = _context8.sent;
              _context8.next = 5;
              return regeneratorRuntime.awrap(this.encryptText(string, encryptionKey, iv));

            case 5:
              contentCiphertext = _context8.sent;
              ciphertextToAuth = [authParams.version, uuid, iv, contentCiphertext].join(":");
              _context8.next = 9;
              return regeneratorRuntime.awrap(this.crypto.hmac256(ciphertextToAuth, authKey));

            case 9:
              authHash = _context8.sent;
              _context8.next = 12;
              return regeneratorRuntime.awrap(this.crypto.base64(JSON.stringify(authParams)));

            case 12:
              authParamsString = _context8.sent;
              fullCiphertext = [authParams.version, authHash, uuid, iv, contentCiphertext, authParamsString].join(":");
              return _context8.abrupt("return", fullCiphertext);

            case 15:
            case "end":
              return _context8.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "encryptionComponentsFromString",
    value: function encryptionComponentsFromString(string, encryptionKey, authKey) {
      var encryptionVersion = string.substring(0, 3);
      var components = string.split(":");
      return {
        encryptionVersion: components[0],
        authHash: components[1],
        uuid: components[2],
        iv: components[3],
        contentCiphertext: components[4],
        authParams: components[5],
        ciphertextToAuth: [components[0], components[2], components[3], components[4]].join(":"),
        encryptionKey: encryptionKey,
        authKey: authKey
      };
    }
  }], [{
    key: "pwCost",
    value: function pwCost() {
      return 3000;
    }
  }, {
    key: "versionString",
    value: function versionString() {
      return "002";
    }
  }]);

  return SNProtocolOperator002;
}(_Protocol_versions_operator__WEBPACK_IMPORTED_MODULE_0__["SNProtocolOperator"]);

/***/ }),

/***/ "./lib/protocol/versions/003/auth_params_003.js":
/*!******************************************************!*\
  !*** ./lib/protocol/versions/003/auth_params_003.js ***!
  \******************************************************/
/*! exports provided: SNAuthParams003 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNAuthParams003", function() { return SNAuthParams003; });
/* harmony import */ var _Protocol_versions_auth_params__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Protocol/versions/auth_params */ "./lib/protocol/versions/auth_params.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }


var SNAuthParams003 =
/*#__PURE__*/
function (_SNAuthParams) {
  _inherits(SNAuthParams003, _SNAuthParams);

  function SNAuthParams003() {
    _classCallCheck(this, SNAuthParams003);

    return _possibleConstructorReturn(this, _getPrototypeOf(SNAuthParams003).apply(this, arguments));
  }

  _createClass(SNAuthParams003, [{
    key: "kdfIterations",
    get: function get() {
      return this.content.pw_cost;
    }
  }, {
    key: "seed",
    get: function get() {
      return this.content.pw_nonce;
    }
  }, {
    key: "version",
    get: function get() {
      return this.content.version;
    }
  }, {
    key: "identifier",
    get: function get() {
      return this.content.identifier;
    }
  }]);

  return SNAuthParams003;
}(_Protocol_versions_auth_params__WEBPACK_IMPORTED_MODULE_0__["SNAuthParams"]);

/***/ }),

/***/ "./lib/protocol/versions/003/keys_content_003.js":
/*!*******************************************************!*\
  !*** ./lib/protocol/versions/003/keys_content_003.js ***!
  \*******************************************************/
/*! exports provided: SNKeysContent003 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNKeysContent003", function() { return SNKeysContent003; });
/* harmony import */ var _Protocol_versions_keys_content__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Protocol/versions/keys_content */ "./lib/protocol/versions/keys_content.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }


var SNKeysContent003 =
/*#__PURE__*/
function (_SNKeysContent) {
  _inherits(SNKeysContent003, _SNKeysContent);

  function SNKeysContent003(content) {
    var _this;

    _classCallCheck(this, SNKeysContent003);

    _this.content = content;
    return _possibleConstructorReturn(_this);
  }

  _createClass(SNKeysContent003, [{
    key: "itemsMasterKey",
    get: function get() {
      return this.content.mk;
    }
  }, {
    key: "masterKey",
    get: function get() {
      return this.content.mk;
    }
  }, {
    key: "serverAuthenticationValue",
    get: function get() {
      return this.content.pw;
    }
  }, {
    key: "encryptionAuthenticationKey",
    get: function get() {
      return this.content.ak;
    }
  }]);

  return SNKeysContent003;
}(_Protocol_versions_keys_content__WEBPACK_IMPORTED_MODULE_0__["SNKeysContent"]);

/***/ }),

/***/ "./lib/protocol/versions/003/operator_003.js":
/*!***************************************************!*\
  !*** ./lib/protocol/versions/003/operator_003.js ***!
  \***************************************************/
/*! exports provided: SNProtocolOperator003 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNProtocolOperator003", function() { return SNProtocolOperator003; });
/* harmony import */ var _Protocol_versions_operator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Protocol/versions/operator */ "./lib/protocol/versions/operator.js");
/* harmony import */ var _Protocol_versions_003_auth_params_003__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @Protocol/versions/003/auth_params_003 */ "./lib/protocol/versions/003/auth_params_003.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }



var SNProtocolOperator003 =
/*#__PURE__*/
function (_SNProtocolOperator) {
  _inherits(SNProtocolOperator003, _SNProtocolOperator);

  function SNProtocolOperator003() {
    _classCallCheck(this, SNProtocolOperator003);

    return _possibleConstructorReturn(this, _getPrototypeOf(SNProtocolOperator003).apply(this, arguments));
  }

  _createClass(SNProtocolOperator003, [{
    key: "computeEncryptionKeys",

    /**
     * @public
     */
    value: function computeEncryptionKeys(_ref) {
      var password, authParams, pw_salt, keys;
      return regeneratorRuntime.async(function computeEncryptionKeys$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              password = _ref.password, authParams = _ref.authParams;
              _context.next = 3;
              return regeneratorRuntime.awrap(this.generateSalt(authParams.identifier, authParams.version, authParams.pw_cost, authParams.pw_nonce));

            case 3:
              pw_salt = _context.sent;
              _context.next = 6;
              return regeneratorRuntime.awrap(this.deriveKeys({
                password: password,
                pw_salt: pw_salt,
                pw_cost: authParams.pw_cost
              }));

            case 6:
              keys = _context.sent;
              return _context.abrupt("return", keys);

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "createKeysAndAuthParams",
    value: function createKeysAndAuthParams(_ref2) {
      var identifier, password, version, pw_cost, pw_nonce, pw_salt, keys, authParams;
      return regeneratorRuntime.async(function createKeysAndAuthParams$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              identifier = _ref2.identifier, password = _ref2.password;
              version = this.constructor.versionString();
              pw_cost = this.constructor.pwCost();
              _context2.next = 5;
              return regeneratorRuntime.awrap(this.crypto.generateRandomKey(256));

            case 5:
              pw_nonce = _context2.sent;
              _context2.next = 8;
              return regeneratorRuntime.awrap(this.generateSalt(identifier, version, pw_cost, pw_nonce));

            case 8:
              pw_salt = _context2.sent;
              _context2.next = 11;
              return regeneratorRuntime.awrap(this.deriveKeys({
                password: password,
                pw_salt: pw_salt,
                pw_cost: pw_cost
              }));

            case 11:
              keys = _context2.sent;
              authParams = new _Protocol_versions_003_auth_params_003__WEBPACK_IMPORTED_MODULE_1__["SNAuthParams003"]({
                pw_nonce: pw_nonce,
                pw_cost: pw_cost,
                identifier: identifier,
                version: version
              });
              return _context2.abrupt("return", {
                keys: keys,
                authParams: authParams
              });

            case 14:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "decryptText",
    value: function decryptText() {
      var _ref3,
          ciphertextToAuth,
          contentCiphertext,
          encryptionKey,
          iv,
          authHash,
          authKey,
          requiresAuth,
          localAuthHash,
          keyData,
          ivData,
          _args3 = arguments;

      return regeneratorRuntime.async(function decryptText$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _ref3 = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : {}, ciphertextToAuth = _ref3.ciphertextToAuth, contentCiphertext = _ref3.contentCiphertext, encryptionKey = _ref3.encryptionKey, iv = _ref3.iv, authHash = _ref3.authHash, authKey = _ref3.authKey;
              requiresAuth = _args3.length > 1 ? _args3[1] : undefined;

              if (!(requiresAuth && !authHash)) {
                _context3.next = 5;
                break;
              }

              console.error("Auth hash is required.");
              return _context3.abrupt("return");

            case 5:
              if (!authHash) {
                _context3.next = 12;
                break;
              }

              _context3.next = 8;
              return regeneratorRuntime.awrap(this.crypto.hmac256(ciphertextToAuth, authKey));

            case 8:
              localAuthHash = _context3.sent;

              if (!(this.crypto.timingSafeEqual(authHash, localAuthHash) === false)) {
                _context3.next = 12;
                break;
              }

              console.error("Auth hash does not match, returning null.");
              return _context3.abrupt("return", null);

            case 12:
              _context3.next = 14;
              return regeneratorRuntime.awrap(this.crypto.hexStringToArrayBuffer(encryptionKey));

            case 14:
              keyData = _context3.sent;
              _context3.next = 17;
              return regeneratorRuntime.awrap(this.crypto.hexStringToArrayBuffer(iv || ""));

            case 17:
              ivData = _context3.sent;
              return _context3.abrupt("return", this.crypto.aes256CbcDecrypt(contentCiphertext, keyData, ivData));

            case 19:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "encryptText",
    value: function encryptText(text, key, iv) {
      var keyData, ivData;
      return regeneratorRuntime.async(function encryptText$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return regeneratorRuntime.awrap(this.crypto.hexStringToArrayBuffer(key));

            case 2:
              keyData = _context4.sent;
              _context4.next = 5;
              return regeneratorRuntime.awrap(this.crypto.hexStringToArrayBuffer(iv || ""));

            case 5:
              ivData = _context4.sent;
              return _context4.abrupt("return", this.crypto.aes256CbcEncrypt(text, keyData, ivData));

            case 7:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "encryptItem",
    value: function encryptItem(_ref4) {
      var item, keys, authParams, EncryptionKeyLength, params, item_key, ek, ak, ciphertext;
      return regeneratorRuntime.async(function encryptItem$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              item = _ref4.item, keys = _ref4.keys, authParams = _ref4.authParams;
              EncryptionKeyLength = 512;
              params = {}; // encrypt item key

              _context5.next = 5;
              return regeneratorRuntime.awrap(this.crypto.generateRandomKey(EncryptionKeyLength));

            case 5:
              item_key = _context5.sent;
              _context5.next = 8;
              return regeneratorRuntime.awrap(this._private_encryptString(item_key, keys.mk, keys.ak, item.uuid, authParams));

            case 8:
              params.enc_item_key = _context5.sent;
              _context5.next = 11;
              return regeneratorRuntime.awrap(this.firstHalfOfKey(item_key));

            case 11:
              ek = _context5.sent;
              _context5.next = 14;
              return regeneratorRuntime.awrap(this.secondHalfOfKey(item_key));

            case 14:
              ak = _context5.sent;
              _context5.next = 17;
              return regeneratorRuntime.awrap(this._private_encryptString(JSON.stringify(item.createContentJSONFromProperties()), ek, ak, item.uuid, authParams));

            case 17:
              ciphertext = _context5.sent;
              params.content = ciphertext;
              return _context5.abrupt("return", params);

            case 20:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "decryptItem",
    value: function decryptItem(_ref5) {
      var item, keys, encryptedItemKey, requiresAuth, keyParams, item_key, ek, ak, itemParams, content;
      return regeneratorRuntime.async(function decryptItem$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              item = _ref5.item, keys = _ref5.keys;

              if (!(typeof item.content != "string")) {
                _context6.next = 3;
                break;
              }

              return _context6.abrupt("return");

            case 3:
              if (!item.content.startsWith("000")) {
                _context6.next = 15;
                break;
              }

              _context6.prev = 4;
              _context6.t0 = JSON;
              _context6.next = 8;
              return regeneratorRuntime.awrap(this.crypto.base64Decode(item.content.substring(3, item.content.length)));

            case 8:
              _context6.t1 = _context6.sent;
              item.content = _context6.t0.parse.call(_context6.t0, _context6.t1);
              _context6.next = 14;
              break;

            case 12:
              _context6.prev = 12;
              _context6.t2 = _context6["catch"](4);

            case 14:
              return _context6.abrupt("return");

            case 15:
              if (item.enc_item_key) {
                _context6.next = 18;
                break;
              }

              // This needs to be here to continue, return otherwise
              console.log("Missing item encryption key, skipping decryption.");
              return _context6.abrupt("return");

            case 18:
              // decrypt encrypted key
              encryptedItemKey = item.enc_item_key;
              requiresAuth = true;
              keyParams = this.encryptionComponentsFromString(encryptedItemKey, keys.mk, keys.ak); // return if uuid in auth hash does not match item uuid. Signs of tampering.

              if (!(keyParams.uuid && keyParams.uuid !== item.uuid)) {
                _context6.next = 26;
                break;
              }

              console.error("Item key params UUID does not match item UUID");

              if (!item.errorDecrypting) {
                item.errorDecryptingValueChanged = true;
              }

              item.errorDecrypting = true;
              return _context6.abrupt("return");

            case 26:
              _context6.next = 28;
              return regeneratorRuntime.awrap(this.decryptText(keyParams, requiresAuth));

            case 28:
              item_key = _context6.sent;

              if (item_key) {
                _context6.next = 34;
                break;
              }

              console.log("Error decrypting item", item);

              if (!item.errorDecrypting) {
                item.errorDecryptingValueChanged = true;
              }

              item.errorDecrypting = true;
              return _context6.abrupt("return");

            case 34:
              _context6.next = 36;
              return regeneratorRuntime.awrap(this.firstHalfOfKey(item_key));

            case 36:
              ek = _context6.sent;
              _context6.next = 39;
              return regeneratorRuntime.awrap(this.secondHalfOfKey(item_key));

            case 39:
              ak = _context6.sent;
              itemParams = this.encryptionComponentsFromString(item.content, ek, ak);
              _context6.prev = 41;
              _context6.t3 = JSON;
              _context6.next = 45;
              return regeneratorRuntime.awrap(this.crypto.base64Decode(itemParams.authParams));

            case 45:
              _context6.t4 = _context6.sent;
              item.auth_params = _context6.t3.parse.call(_context6.t3, _context6.t4);
              _context6.next = 51;
              break;

            case 49:
              _context6.prev = 49;
              _context6.t5 = _context6["catch"](41);

            case 51:
              if (!(itemParams.uuid && itemParams.uuid !== item.uuid)) {
                _context6.next = 55;
                break;
              }

              if (!item.errorDecrypting) {
                item.errorDecryptingValueChanged = true;
              }

              item.errorDecrypting = true;
              return _context6.abrupt("return");

            case 55:
              _context6.next = 57;
              return regeneratorRuntime.awrap(this.decryptText(itemParams, true));

            case 57:
              content = _context6.sent;

              if (!content) {
                if (!item.errorDecrypting) {
                  item.errorDecryptingValueChanged = true;
                }

                item.errorDecrypting = true;
              } else {
                if (item.errorDecrypting == true) {
                  item.errorDecryptingValueChanged = true;
                } // Content should only be set if it was successfully decrypted, and should otherwise remain unchanged.


                item.errorDecrypting = false;
                item.content = content;
              }

            case 59:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this, [[4, 12], [41, 49]]);
    }
    /**
     * @private
     */

  }, {
    key: "generateSalt",
    value: function generateSalt(identifier, version, cost, nonce) {
      var result;
      return regeneratorRuntime.async(function generateSalt$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return regeneratorRuntime.awrap(this.crypto.sha256([identifier, "SF", version, cost, nonce].join(":")));

            case 2:
              result = _context7.sent;
              return _context7.abrupt("return", result);

            case 4:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "deriveKeys",
    value: function deriveKeys() {
      var _ref6,
          password,
          pw_salt,
          pw_cost,
          PBKDF2OutputKeyLength,
          derivedKey,
          partitions,
          keys,
          _args8 = arguments;

      return regeneratorRuntime.async(function deriveKeys$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _ref6 = _args8.length > 0 && _args8[0] !== undefined ? _args8[0] : {}, password = _ref6.password, pw_salt = _ref6.pw_salt, pw_cost = _ref6.pw_cost;
              PBKDF2OutputKeyLength = 768;
              _context8.next = 4;
              return regeneratorRuntime.awrap(this.crypto.pbkdf2({
                password: password,
                salt: pw_salt,
                iterations: pw_cost,
                length: PBKDF2OutputKeyLength
              }));

            case 4:
              derivedKey = _context8.sent;
              _context8.next = 7;
              return regeneratorRuntime.awrap(this.splitKey({
                key: derivedKey,
                numParts: 3
              }));

            case 7:
              partitions = _context8.sent;
              keys = SNKeys.FromRaw({
                pw: partitions[0],
                mk: partitions[1],
                ak: partitions[2],
                version: this.constructor.versionString()
              });
              return _context8.abrupt("return", keys);

            case 10:
            case "end":
              return _context8.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "_private_encryptString",
    value: function _private_encryptString(string, encryptionKey, authKey, uuid, authParams) {
      var fullCiphertext, contentCiphertext, iv, ciphertextToAuth, authHash, authParamsString;
      return regeneratorRuntime.async(function _private_encryptString$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return regeneratorRuntime.awrap(this.crypto.generateRandomKey(128));

            case 2:
              iv = _context9.sent;
              _context9.next = 5;
              return regeneratorRuntime.awrap(this.encryptText(string, encryptionKey, iv));

            case 5:
              contentCiphertext = _context9.sent;
              ciphertextToAuth = [authParams.version, uuid, iv, contentCiphertext].join(":");
              _context9.next = 9;
              return regeneratorRuntime.awrap(this.crypto.hmac256(ciphertextToAuth, authKey));

            case 9:
              authHash = _context9.sent;
              _context9.next = 12;
              return regeneratorRuntime.awrap(this.crypto.base64(JSON.stringify(authParams)));

            case 12:
              authParamsString = _context9.sent;
              fullCiphertext = [authParams.version, authHash, uuid, iv, contentCiphertext, authParamsString].join(":");
              return _context9.abrupt("return", fullCiphertext);

            case 15:
            case "end":
              return _context9.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "encryptionComponentsFromString",
    value: function encryptionComponentsFromString(string, encryptionKey, authKey) {
      var encryptionVersion = string.substring(0, 3);
      var components = string.split(":");
      return {
        encryptionVersion: components[0],
        authHash: components[1],
        uuid: components[2],
        iv: components[3],
        contentCiphertext: components[4],
        authParams: components[5],
        ciphertextToAuth: [components[0], components[2], components[3], components[4]].join(":"),
        encryptionKey: encryptionKey,
        authKey: authKey
      };
    }
  }], [{
    key: "pwCost",
    value: function pwCost() {
      return 110000;
    }
  }, {
    key: "versionString",
    value: function versionString() {
      return "003";
    }
  }]);

  return SNProtocolOperator003;
}(_Protocol_versions_operator__WEBPACK_IMPORTED_MODULE_0__["SNProtocolOperator"]);

/***/ }),

/***/ "./lib/protocol/versions/004/auth_params_004.js":
/*!******************************************************!*\
  !*** ./lib/protocol/versions/004/auth_params_004.js ***!
  \******************************************************/
/*! exports provided: SNAuthParams004 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNAuthParams004", function() { return SNAuthParams004; });
/* harmony import */ var _Protocol_versions_auth_params__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Protocol/versions/auth_params */ "./lib/protocol/versions/auth_params.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }


var SNAuthParams004 =
/*#__PURE__*/
function (_SNAuthParams) {
  _inherits(SNAuthParams004, _SNAuthParams);

  function SNAuthParams004() {
    _classCallCheck(this, SNAuthParams004);

    return _possibleConstructorReturn(this, _getPrototypeOf(SNAuthParams004).apply(this, arguments));
  }

  _createClass(SNAuthParams004, [{
    key: "kdfIterations",
    get: function get() {
      return this.content.iterations;
    }
  }, {
    key: "seed",
    get: function get() {
      return this.content.seed;
    }
  }, {
    key: "version",
    get: function get() {
      return this.content.version;
    }
  }, {
    key: "identifier",
    get: function get() {
      return this.content.identifier;
    }
  }]);

  return SNAuthParams004;
}(_Protocol_versions_auth_params__WEBPACK_IMPORTED_MODULE_0__["SNAuthParams"]);

/***/ }),

/***/ "./lib/protocol/versions/004/keys_content_004.js":
/*!*******************************************************!*\
  !*** ./lib/protocol/versions/004/keys_content_004.js ***!
  \*******************************************************/
/*! exports provided: SNKeysContent004 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNKeysContent004", function() { return SNKeysContent004; });
/* harmony import */ var _Protocol_versions_keys_content__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Protocol/versions/keys_content */ "./lib/protocol/versions/keys_content.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }


var SNKeysContent004 =
/*#__PURE__*/
function (_SNKeysContent) {
  _inherits(SNKeysContent004, _SNKeysContent);

  function SNKeysContent004(content) {
    var _this;

    _classCallCheck(this, SNKeysContent004);

    _this.content = content;
    return _possibleConstructorReturn(_this);
  }

  _createClass(SNKeysContent004, [{
    key: "itemsMasterKey",
    get: function get() {
      return this.content.itemsMasterKey;
    }
  }, {
    key: "masterKey",
    get: function get() {
      return this.content.masterKey;
    }
  }, {
    key: "serverAuthenticationValue",
    get: function get() {
      return this.content.serverPassword;
    }
  }, {
    key: "encryptionAuthenticationKey",
    get: function get() {
      throw "Should not attempt to access this value using this protocol version.";
      return null;
    }
  }]);

  return SNKeysContent004;
}(_Protocol_versions_keys_content__WEBPACK_IMPORTED_MODULE_0__["SNKeysContent"]);

/***/ }),

/***/ "./lib/protocol/versions/004/operator_004.js":
/*!***************************************************!*\
  !*** ./lib/protocol/versions/004/operator_004.js ***!
  \***************************************************/
/*! exports provided: SNProtocolOperator004 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNProtocolOperator004", function() { return SNProtocolOperator004; });
/* harmony import */ var _Protocol_versions_operator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Protocol/versions/operator */ "./lib/protocol/versions/operator.js");
/* harmony import */ var _Models_core_keys__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @Models/core/keys */ "./lib/models/core/keys.js");
/* harmony import */ var _Protocol_versions_004_auth_params_004__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @Protocol/versions/004/auth_params_004 */ "./lib/protocol/versions/004/auth_params_004.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }




var SNProtocolOperator004 =
/*#__PURE__*/
function (_SNProtocolOperator) {
  _inherits(SNProtocolOperator004, _SNProtocolOperator);

  function SNProtocolOperator004() {
    _classCallCheck(this, SNProtocolOperator004);

    return _possibleConstructorReturn(this, _getPrototypeOf(SNProtocolOperator004).apply(this, arguments));
  }

  _createClass(SNProtocolOperator004, [{
    key: "generateSalt",

    /**
     * @public
     */

    /**
     * We require both a client-side component and a server-side component in generating a salt.
     * This way, a comprimised server cannot benefit from sending the same seed value for every user.
     * We mix a client-controlled value that is globally unique (their identifier), with a server controlled value
     * to produce a salt for our KDF.
     *
    */
    value: function generateSalt(_ref) {
      var identifier, seed, result;
      return regeneratorRuntime.async(function generateSalt$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              identifier = _ref.identifier, seed = _ref.seed;
              _context.next = 3;
              return regeneratorRuntime.awrap(this.crypto.sha256([identifier, seed].join(":")));

            case 3:
              result = _context.sent;
              return _context.abrupt("return", result);

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "computeEncryptionKeys",
    value: function computeEncryptionKeys(_ref2) {
      var password, authParams, salt, keys;
      return regeneratorRuntime.async(function computeEncryptionKeys$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              password = _ref2.password, authParams = _ref2.authParams;
              _context2.next = 3;
              return regeneratorRuntime.awrap(this.generateSalt({
                identifier: authParams.identifier,
                seed: authParams.seed
              }));

            case 3:
              salt = _context2.sent;
              _context2.next = 6;
              return regeneratorRuntime.awrap(this.deriveKeys({
                password: password,
                salt: salt,
                iterations: authParams.iterations
              }));

            case 6:
              keys = _context2.sent;
              return _context2.abrupt("return", keys);

            case 8:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "createKeysAndAuthParams",
    value: function createKeysAndAuthParams(_ref3) {
      var identifier, password, version, iterations, seed, salt, keys, authParams;
      return regeneratorRuntime.async(function createKeysAndAuthParams$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              identifier = _ref3.identifier, password = _ref3.password;
              version = this.constructor.versionString();
              iterations = this.constructor.kdfIterations();
              _context3.next = 5;
              return regeneratorRuntime.awrap(this.crypto.generateRandomKey(256));

            case 5:
              seed = _context3.sent;
              _context3.next = 8;
              return regeneratorRuntime.awrap(this.generateSalt({
                identifier: identifier,
                seed: seed
              }));

            case 8:
              salt = _context3.sent;
              _context3.next = 11;
              return regeneratorRuntime.awrap(this.deriveKeys({
                password: password,
                salt: salt,
                iterations: iterations,
                generateItemsKey: true
              }));

            case 11:
              keys = _context3.sent;
              authParams = new _Protocol_versions_004_auth_params_004__WEBPACK_IMPORTED_MODULE_2__["SNAuthParams004"]({
                version: version,
                identifier: identifier,
                iterations: iterations,
                seed: seed
              });
              return _context3.abrupt("return", {
                keys: keys,
                authParams: authParams
              });

            case 14:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
    /**
     * @param plaintext  The plaintext to encrypt.
     * @param key  The key to use to encrypt the plaintext.
     * @param iv  The initialization vector for encryption.
     * @param aad  JavaScript object (will be stringified) representing
                  'Additional authenticated data' — data you want to be included in authentication.
     */

  }, {
    key: "encryptText",
    value: function encryptText(_ref4) {
      var plaintext, key, iv, aad, keyData, ivData, aadData;
      return regeneratorRuntime.async(function encryptText$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              plaintext = _ref4.plaintext, key = _ref4.key, iv = _ref4.iv, aad = _ref4.aad;
              _context4.next = 3;
              return regeneratorRuntime.awrap(this.crypto.hexStringToArrayBuffer(key));

            case 3:
              keyData = _context4.sent;
              _context4.next = 6;
              return regeneratorRuntime.awrap(this.crypto.hexStringToArrayBuffer(iv));

            case 6:
              ivData = _context4.sent;

              if (!aad) {
                _context4.next = 13;
                break;
              }

              _context4.next = 10;
              return regeneratorRuntime.awrap(this.crypto.stringToArrayBuffer(JSON.stringify(aad)));

            case 10:
              _context4.t0 = _context4.sent;
              _context4.next = 14;
              break;

            case 13:
              _context4.t0 = null;

            case 14:
              aadData = _context4.t0;
              return _context4.abrupt("return", this.crypto.aes256GcmEncrypt(plaintext, keyData, ivData, aadData));

            case 16:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
    /**
     * @param ciphertext  The encrypred text to decrypt.
     * @param key  The key to use to decrypt the ciphertext.
     * @param iv  The initialization vector for decryption.
     * @param aad  JavaScript object (will be stringified) representing
                  'Additional authenticated data' — data you want to be included in authentication.
     */

  }, {
    key: "decryptText",
    value: function decryptText(_ref5) {
      var ciphertext, key, iv, aad, keyData, ivData, aadData;
      return regeneratorRuntime.async(function decryptText$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              ciphertext = _ref5.ciphertext, key = _ref5.key, iv = _ref5.iv, aad = _ref5.aad;
              _context5.next = 3;
              return regeneratorRuntime.awrap(this.crypto.hexStringToArrayBuffer(key));

            case 3:
              keyData = _context5.sent;
              _context5.next = 6;
              return regeneratorRuntime.awrap(this.crypto.hexStringToArrayBuffer(iv));

            case 6:
              ivData = _context5.sent;

              if (!aad) {
                _context5.next = 13;
                break;
              }

              _context5.next = 10;
              return regeneratorRuntime.awrap(this.crypto.stringToArrayBuffer(JSON.stringify(aad)));

            case 10:
              _context5.t0 = _context5.sent;
              _context5.next = 14;
              break;

            case 13:
              _context5.t0 = null;

            case 14:
              aadData = _context5.t0;
              return _context5.abrupt("return", this.crypto.aes256GcmDecrypt(ciphertext, keyData, ivData, aadData));

            case 16:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "encryptItem",
    value: function encryptItem(_ref6) {
      var item, keys, EncryptionKeyLength, item_key, contentPlaintext, encryptedPayloadString, encryptedItemKey;
      return regeneratorRuntime.async(function encryptItem$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              item = _ref6.item, keys = _ref6.keys;
              EncryptionKeyLength = 256;
              _context6.next = 4;
              return regeneratorRuntime.awrap(this.crypto.generateRandomKey(EncryptionKeyLength));

            case 4:
              item_key = _context6.sent;
              // Encrypt content with item_key
              contentPlaintext = JSON.stringify(item.createContentJSONFromProperties());
              _context6.next = 8;
              return regeneratorRuntime.awrap(this.generateEncryptedPayloadString({
                plaintext: contentPlaintext,
                key: item_key,
                itemUuid: item.uuid
              }));

            case 8:
              encryptedPayloadString = _context6.sent;
              _context6.next = 11;
              return regeneratorRuntime.awrap(this.generateEncryptedPayloadString({
                plaintext: item_key,
                key: keys.itemsMasterKey,
                itemUuid: item.uuid
              }));

            case 11:
              encryptedItemKey = _context6.sent;
              return _context6.abrupt("return", {
                content: encryptedPayloadString,
                enc_item_key: encryptedItemKey
              });

            case 13:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this);
    }
    /**
     * Decrypts item.content in-place, meaning the passed-in item's .content property will be modified
     * to be a decrypted JSON string.
     */

  }, {
    key: "decryptItem",
    value: function decryptItem(_ref7) {
      var item, keys, itemKeyParams, item_key, itemParams, content;
      return regeneratorRuntime.async(function decryptItem$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              item = _ref7.item, keys = _ref7.keys;

              if (!(typeof item.content != "string")) {
                _context7.next = 3;
                break;
              }

              return _context7.abrupt("return");

            case 3:
              if (!item.content.startsWith("000")) {
                _context7.next = 15;
                break;
              }

              _context7.prev = 4;
              _context7.t0 = JSON;
              _context7.next = 8;
              return regeneratorRuntime.awrap(this.crypto.base64Decode(item.content.substring(3, item.content.length)));

            case 8:
              _context7.t1 = _context7.sent;
              item.content = _context7.t0.parse.call(_context7.t0, _context7.t1);
              _context7.next = 14;
              break;

            case 12:
              _context7.prev = 12;
              _context7.t2 = _context7["catch"](4);

            case 14:
              return _context7.abrupt("return");

            case 15:
              // Decrypt item_key payload.
              itemKeyParams = this.deconstructEncryptedPayloadString(item.enc_item_key); // return if uuid in auth hash does not match item uuid. Signs of tampering.

              if (!(itemKeyParams.uuid && itemKeyParams.uuid !== item.uuid)) {
                _context7.next = 21;
                break;
              }

              console.error("Item key params UUID does not match item UUID");

              if (!item.errorDecrypting) {
                item.errorDecryptingValueChanged = true;
              }

              item.errorDecrypting = true;
              return _context7.abrupt("return");

            case 21:
              _context7.next = 23;
              return regeneratorRuntime.awrap(this.decryptText({
                ciphertext: itemKeyParams.ciphertext,
                key: keys.itemsMasterKey,
                iv: itemKeyParams.iv,
                aad: {
                  u: item.uuid,
                  v: itemKeyParams.version
                }
              }));

            case 23:
              item_key = _context7.sent;

              if (item_key) {
                _context7.next = 29;
                break;
              }

              console.error("Error decrypting item", item);

              if (!item.errorDecrypting) {
                item.errorDecryptingValueChanged = true;
              }

              item.errorDecrypting = true;
              return _context7.abrupt("return");

            case 29:
              // Decrypt content payload.
              itemParams = this.deconstructEncryptedPayloadString(item.content); // return if uuid in auth hash does not match item uuid. Signs of tampering.

              if (!(itemParams.uuid && itemParams.uuid !== item.uuid)) {
                _context7.next = 34;
                break;
              }

              if (!item.errorDecrypting) {
                item.errorDecryptingValueChanged = true;
              }

              item.errorDecrypting = true;
              return _context7.abrupt("return");

            case 34:
              _context7.next = 36;
              return regeneratorRuntime.awrap(this.decryptText({
                ciphertext: itemParams.ciphertext,
                key: item_key,
                iv: itemParams.iv,
                aad: {
                  u: itemUuid,
                  v: itemParams.version
                }
              }));

            case 36:
              content = _context7.sent;

              if (!content) {
                if (!item.errorDecrypting) {
                  item.errorDecryptingValueChanged = true;
                }

                item.errorDecrypting = true;
              } else {
                if (item.errorDecrypting == true) {
                  item.errorDecryptingValueChanged = true;
                } // Content should only be set if it was successfully decrypted, and should otherwise remain unchanged.


                item.errorDecrypting = false;
                item.content = content;
              }

            case 38:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this, [[4, 12]]);
    }
    /**
     * @private
     */

  }, {
    key: "deconstructEncryptedPayloadString",
    value: function deconstructEncryptedPayloadString(payloadString) {
      var encryptionVersion = string.substring(0, this.constructor.versionString().length);
      var components = string.split(":");
      return {
        version: components[0],
        uuid: components[1],
        iv: components[2],
        ciphertext: components[3]
      };
    }
  }, {
    key: "generateEncryptedPayloadString",
    value: function generateEncryptedPayloadString(_ref8) {
      var plaintext, key, itemUuid, version, iv, ciphertext, payload;
      return regeneratorRuntime.async(function generateEncryptedPayloadString$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              plaintext = _ref8.plaintext, key = _ref8.key, itemUuid = _ref8.itemUuid;
              version = this.constructor.versionString();
              _context8.next = 4;
              return regeneratorRuntime.awrap(this.crypto.generateRandomKey(96));

            case 4:
              iv = _context8.sent;
              _context8.next = 7;
              return regeneratorRuntime.awrap(this.encryptText({
                plaintext: plaintext,
                key: key,
                iv: iv,
                aad: {
                  u: itemUuid,
                  v: version
                }
              }));

            case 7:
              ciphertext = _context8.sent;
              payload = [version, itemUuid, iv, ciphertext].join(":");
              return _context8.abrupt("return", payload);

            case 10:
            case "end":
              return _context8.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "deriveKeys",
    value: function deriveKeys() {
      var _ref9,
          password,
          salt,
          iterations,
          generateItemsKey,
          PBKDF2OutputKeyLength,
          derivedKey,
          partitions,
          masterKey,
          serverPassword,
          params,
          keys,
          _args9 = arguments;

      return regeneratorRuntime.async(function deriveKeys$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _ref9 = _args9.length > 0 && _args9[0] !== undefined ? _args9[0] : {}, password = _ref9.password, salt = _ref9.salt, iterations = _ref9.iterations, generateItemsKey = _ref9.generateItemsKey;
              PBKDF2OutputKeyLength = 512;
              _context9.next = 4;
              return regeneratorRuntime.awrap(this.crypto.pbkdf2({
                password: password,
                salt: salt,
                iterations: iterations,
                length: PBKDF2OutputKeyLength
              }));

            case 4:
              derivedKey = _context9.sent;
              _context9.next = 7;
              return regeneratorRuntime.awrap(this.splitKey({
                key: derivedKey,
                numParts: 2
              }));

            case 7:
              partitions = _context9.sent;
              masterKey = partitions[0];
              serverPassword = partitions[1];
              params = {
                masterKey: masterKey,
                serverPassword: serverPassword,
                version: this.constructor.versionString()
              };

              if (!generateItemsKey) {
                _context9.next = 15;
                break;
              }

              _context9.next = 14;
              return regeneratorRuntime.awrap(this.crypto.generateRandomKey(256));

            case 14:
              params.itemsMasterKey = _context9.sent;

            case 15:
              // TODO: HKDF each key to domain-seperate.
              keys = _Models_core_keys__WEBPACK_IMPORTED_MODULE_1__["SNKeys"].FromRaw(params);
              return _context9.abrupt("return", keys);

            case 17:
            case "end":
              return _context9.stop();
          }
        }
      }, null, this);
    }
  }], [{
    key: "versionString",

    /**
     * The protocol version. Will be prefixed to encrypted payloads.
     */
    value: function versionString() {
      return "004";
    }
    /**
     * The number of PBKDF2 iterations.
     */

  }, {
    key: "kdfIterations",
    value: function kdfIterations() {
      return 500000;
    }
  }, {
    key: "encryptionAlgorithm",
    value: function encryptionAlgorithm() {
      return "AES-GCM";
    }
  }]);

  return SNProtocolOperator004;
}(_Protocol_versions_operator__WEBPACK_IMPORTED_MODULE_0__["SNProtocolOperator"]);

/***/ }),

/***/ "./lib/protocol/versions/auth_params.js":
/*!**********************************************!*\
  !*** ./lib/protocol/versions/auth_params.js ***!
  \**********************************************/
/*! exports provided: SNAuthParams */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNAuthParams", function() { return SNAuthParams; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SNAuthParams = function SNAuthParams(content) {
  _classCallCheck(this, SNAuthParams);

  this.content = content;
  Object.assign(this, content);
};

/***/ }),

/***/ "./lib/protocol/versions/keys_content.js":
/*!***********************************************!*\
  !*** ./lib/protocol/versions/keys_content.js ***!
  \***********************************************/
/*! exports provided: SNKeysContent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNKeysContent", function() { return SNKeysContent; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SNKeysContent =
/*#__PURE__*/
function () {
  function SNKeysContent(content) {
    _classCallCheck(this, SNKeysContent);

    this.content = content;
  }
  /**
   * Compares two sets of keys for equality
   * @returns Boolean
  */


  _createClass(SNKeysContent, [{
    key: "compare",
    value: function compare(otherContents) {
      return;
      this.masterKey === otherContents.masterKey && this.itemsMasterKey === otherContents.itemsMasterKey && this.serverAuthenticationValue === otherContents.serverAuthenticationValue;
    }
  }]);

  return SNKeysContent;
}();

/***/ }),

/***/ "./lib/protocol/versions/operator.js":
/*!*******************************************!*\
  !*** ./lib/protocol/versions/operator.js ***!
  \*******************************************/
/*! exports provided: SNProtocolOperator */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNProtocolOperator", function() { return SNProtocolOperator; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SNProtocolOperator =
/*#__PURE__*/
function () {
  function SNProtocolOperator(crypto) {
    _classCallCheck(this, SNProtocolOperator);

    this.crypto = crypto;
  }

  _createClass(SNProtocolOperator, [{
    key: "firstHalfOfKey",
    value: function firstHalfOfKey(key) {
      return regeneratorRuntime.async(function firstHalfOfKey$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", key.substring(0, key.length / 2));

            case 1:
            case "end":
              return _context.stop();
          }
        }
      });
    }
  }, {
    key: "secondHalfOfKey",
    value: function secondHalfOfKey(key) {
      return regeneratorRuntime.async(function secondHalfOfKey$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", key.substring(key.length / 2, key.length));

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      });
    }
  }, {
    key: "splitKey",
    value: function splitKey(_ref) {
      var key, numParts, outputLength, partLength, parts, i, part;
      return regeneratorRuntime.async(function splitKey$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              key = _ref.key, numParts = _ref.numParts;
              outputLength = key.length;
              partLength = outputLength / numParts;
              parts = [];

              for (i = 0; i < numParts; i++) {
                part = key.slice(partLength * i, partLength * (i + 1));
                parts.push(part);
              }

              return _context3.abrupt("return", parts);

            case 6:
            case "end":
              return _context3.stop();
          }
        }
      });
    }
  }]);

  return SNProtocolOperator;
}();

/***/ }),

/***/ "./lib/services/alertManager.js":
/*!**************************************!*\
  !*** ./lib/services/alertManager.js ***!
  \**************************************/
/*! exports provided: SFAlertManager */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SFAlertManager", function() { return SFAlertManager; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SFAlertManager =
/*#__PURE__*/
function () {
  function SFAlertManager() {
    _classCallCheck(this, SFAlertManager);
  }

  _createClass(SFAlertManager, [{
    key: "alert",
    value: function alert(params) {
      return regeneratorRuntime.async(function alert$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", new Promise(function (resolve, reject) {
                window.alert(params.text);
                resolve();
              }));

            case 1:
            case "end":
              return _context.stop();
          }
        }
      });
    }
  }, {
    key: "confirm",
    value: function confirm(params) {
      return regeneratorRuntime.async(function confirm$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", new Promise(function (resolve, reject) {
                if (window.confirm(params.text)) {
                  resolve();
                } else {
                  reject();
                }
              }));

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      });
    }
  }]);

  return SFAlertManager;
}();

/***/ }),

/***/ "./lib/services/authManager.js":
/*!*************************************!*\
  !*** ./lib/services/authManager.js ***!
  \*************************************/
/*! exports provided: SFAuthManager */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SFAuthManager", function() { return SFAuthManager; });
/* harmony import */ var lodash_pull__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash/pull */ "./node_modules/lodash/pull.js");
/* harmony import */ var lodash_pull__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash_pull__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash_merge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash/merge */ "./node_modules/lodash/merge.js");
/* harmony import */ var lodash_merge__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash_merge__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _Protocol_manager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @Protocol/manager */ "./lib/protocol/manager.js");
/* harmony import */ var _Services_alertManager__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Services/alertManager */ "./lib/services/alertManager.js");
/* harmony import */ var _Services_httpManager__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Services/httpManager */ "./lib/services/httpManager.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }






var SFAuthManager =
/*#__PURE__*/
function () {
  function SFAuthManager(storageManager, httpManager, alertManager, timeout) {
    _classCallCheck(this, SFAuthManager);

    SFAuthManager.DidSignOutEvent = "DidSignOutEvent";
    SFAuthManager.WillSignInEvent = "WillSignInEvent";
    SFAuthManager.DidSignInEvent = "DidSignInEvent";
    this.httpManager = httpManager;
    this.storageManager = storageManager;
    this.alertManager = alertManager || new _Services_alertManager__WEBPACK_IMPORTED_MODULE_3__["SFAlertManager"]();
    this.$timeout = timeout || setTimeout.bind(window);
    this.eventHandlers = [];
  }

  _createClass(SFAuthManager, [{
    key: "addEventHandler",
    value: function addEventHandler(handler) {
      this.eventHandlers.push(handler);
      return handler;
    }
  }, {
    key: "removeEventHandler",
    value: function removeEventHandler(handler) {
      lodash_pull__WEBPACK_IMPORTED_MODULE_0___default()(this.eventHandlers, handler);
    }
  }, {
    key: "notifyEvent",
    value: function notifyEvent(event, data) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.eventHandlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var handler = _step.value;
          handler(event, data || {});
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "saveKeys",
    value: function saveKeys(keys) {
      return regeneratorRuntime.async(function saveKeys$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              this._keys = keys;
              _context.next = 3;
              return regeneratorRuntime.awrap(this.storageManager.setItem("mk", keys.mk));

            case 3:
              _context.next = 5;
              return regeneratorRuntime.awrap(this.storageManager.setItem("ak", keys.ak));

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "signout",
    value: function signout(clearAllData) {
      var _this = this;

      return regeneratorRuntime.async(function signout$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              this._keys = null;
              this._authParams = null;

              if (!clearAllData) {
                _context2.next = 6;
                break;
              }

              return _context2.abrupt("return", this.storageManager.clearAllData().then(function () {
                _this.notifyEvent(SFAuthManager.DidSignOutEvent);
              }));

            case 6:
              this.notifyEvent(SFAuthManager.DidSignOutEvent);

            case 7:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "keys",
    value: function keys() {
      var mk;
      return regeneratorRuntime.async(function keys$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (this._keys) {
                _context3.next = 11;
                break;
              }

              _context3.next = 3;
              return regeneratorRuntime.awrap(this.storageManager.getItem("mk"));

            case 3:
              mk = _context3.sent;

              if (mk) {
                _context3.next = 6;
                break;
              }

              return _context3.abrupt("return", null);

            case 6:
              _context3.t0 = mk;
              _context3.next = 9;
              return regeneratorRuntime.awrap(this.storageManager.getItem("ak"));

            case 9:
              _context3.t1 = _context3.sent;
              this._keys = {
                mk: _context3.t0,
                ak: _context3.t1
              };

            case 11:
              return _context3.abrupt("return", this._keys);

            case 12:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "getAuthParams",
    value: function getAuthParams() {
      var data;
      return regeneratorRuntime.async(function getAuthParams$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (this._authParams) {
                _context4.next = 5;
                break;
              }

              _context4.next = 3;
              return regeneratorRuntime.awrap(this.storageManager.getItem("auth_params"));

            case 3:
              data = _context4.sent;
              this._authParams = JSON.parse(data);

            case 5:
              if (!(this._authParams && !this._authParams.version)) {
                _context4.next = 9;
                break;
              }

              _context4.next = 8;
              return regeneratorRuntime.awrap(this.defaultProtocolVersion());

            case 8:
              this._authParams.version = _context4.sent;

            case 9:
              return _context4.abrupt("return", this._authParams);

            case 10:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "defaultProtocolVersion",
    value: function defaultProtocolVersion() {
      var keys;
      return regeneratorRuntime.async(function defaultProtocolVersion$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return regeneratorRuntime.awrap(this.keys());

            case 2:
              keys = _context5.sent;

              if (!(keys && keys.ak)) {
                _context5.next = 7;
                break;
              }

              return _context5.abrupt("return", "002");

            case 7:
              return _context5.abrupt("return", "001");

            case 8:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "protocolVersion",
    value: function protocolVersion() {
      var authParams;
      return regeneratorRuntime.async(function protocolVersion$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return regeneratorRuntime.awrap(this.getAuthParams());

            case 2:
              authParams = _context6.sent;

              if (!(authParams && authParams.version)) {
                _context6.next = 5;
                break;
              }

              return _context6.abrupt("return", authParams.version);

            case 5:
              return _context6.abrupt("return", this.defaultProtocolVersion());

            case 6:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "getAuthParamsForEmail",
    value: function getAuthParamsForEmail(url, email, extraParams) {
      var _this2 = this;

      var params;
      return regeneratorRuntime.async(function getAuthParamsForEmail$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              params = lodash_merge__WEBPACK_IMPORTED_MODULE_1___default()({
                email: email
              }, extraParams);
              params['api'] = _Services_httpManager__WEBPACK_IMPORTED_MODULE_4__["SFHttpManager"].getApiVersion();
              return _context7.abrupt("return", new Promise(function (resolve, reject) {
                var requestUrl = url + "/auth/params";

                _this2.httpManager.getAbsolute(requestUrl, params, function (response) {
                  var versionedAuthParams = _Protocol_manager__WEBPACK_IMPORTED_MODULE_2__["protocolManager"].createVersionedAuthParams(response);
                  resolve(versionedAuthParams);
                }, function (response) {
                  console.error("Error getting auth params", response);

                  if (_typeof(response) !== 'object') {
                    response = {
                      error: {
                        message: "A server error occurred while trying to sign in. Please try again."
                      }
                    };
                  }

                  resolve(response);
                });
              }));

            case 3:
            case "end":
              return _context7.stop();
          }
        }
      });
    }
  }, {
    key: "lock",
    value: function lock() {
      this.locked = true;
    }
  }, {
    key: "unlock",
    value: function unlock() {
      this.locked = false;
    }
  }, {
    key: "isLocked",
    value: function isLocked() {
      return this.locked == true;
    }
  }, {
    key: "unlockAndResolve",
    value: function unlockAndResolve(resolve, param) {
      this.unlock();
      resolve(param);
    }
  }, {
    key: "login",
    value: function login(url, email, password, strictSignin, extraParams) {
      var _this3 = this;

      return regeneratorRuntime.async(function login$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              return _context10.abrupt("return", new Promise(function _callee2(resolve, reject) {
                var existingKeys, authParams, message, _message, abort, _message2, minimum, _message3, latestVersion, _message4, keys, requestUrl, params;

                return regeneratorRuntime.async(function _callee2$(_context9) {
                  while (1) {
                    switch (_context9.prev = _context9.next) {
                      case 0:
                        _context9.next = 2;
                        return regeneratorRuntime.awrap(_this3.keys());

                      case 2:
                        existingKeys = _context9.sent;

                        if (!(existingKeys != null)) {
                          _context9.next = 6;
                          break;
                        }

                        resolve({
                          error: {
                            message: "Cannot log in because already signed in."
                          }
                        });
                        return _context9.abrupt("return");

                      case 6:
                        if (!_this3.isLocked()) {
                          _context9.next = 9;
                          break;
                        }

                        resolve({
                          error: {
                            message: "Login already in progress."
                          }
                        });
                        return _context9.abrupt("return");

                      case 9:
                        _this3.lock();

                        _this3.notifyEvent(SFAuthManager.WillSignInEvent);

                        _context9.next = 13;
                        return regeneratorRuntime.awrap(_this3.getAuthParamsForEmail(url, email, extraParams));

                      case 13:
                        authParams = _context9.sent;

                        if (!authParams.error) {
                          _context9.next = 17;
                          break;
                        }

                        _this3.unlockAndResolve(resolve, authParams);

                        return _context9.abrupt("return");

                      case 17:
                        if (!(!authParams || !authParams.kdfIterations)) {
                          _context9.next = 20;
                          break;
                        }

                        _this3.unlockAndResolve(resolve, {
                          error: {
                            message: "Invalid email or password."
                          }
                        });

                        return _context9.abrupt("return");

                      case 20:
                        if (_Protocol_manager__WEBPACK_IMPORTED_MODULE_2__["protocolManager"].supportedVersions().includes(authParams.version)) {
                          _context9.next = 24;
                          break;
                        }

                        if (_Protocol_manager__WEBPACK_IMPORTED_MODULE_2__["protocolManager"].isVersionNewerThanLibraryVersion(authParams.version)) {
                          // The user has a new account type, but is signing in to an older client.
                          message = "This version of the application does not support your newer account type. Please upgrade to the latest version of Standard Notes to sign in.";
                        } else {
                          // The user has a very old account type, which is no longer supported by this client
                          message = "The protocol version associated with your account is outdated and no longer supported by this application. Please visit standardnotes.org/help/security for more information.";
                        }

                        _this3.unlockAndResolve(resolve, {
                          error: {
                            message: message
                          }
                        });

                        return _context9.abrupt("return");

                      case 24:
                        if (!_Protocol_manager__WEBPACK_IMPORTED_MODULE_2__["protocolManager"].isProtocolVersionOutdated(authParams.version)) {
                          _context9.next = 31;
                          break;
                        }

                        _message = "The encryption version for your account, ".concat(authParams.version, ", is outdated and requires upgrade. You may proceed with login, but are advised to perform a security update using the web or desktop application. Please visit standardnotes.org/help/security for more information.");
                        abort = false;
                        _context9.next = 29;
                        return regeneratorRuntime.awrap(_this3.alertManager.confirm({
                          title: "Update Needed",
                          text: _message,
                          confirmButtonText: "Sign In"
                        }).catch(function () {
                          _this3.unlockAndResolve(resolve, {
                            error: {}
                          });

                          abort = true;
                        }));

                      case 29:
                        if (!abort) {
                          _context9.next = 31;
                          break;
                        }

                        return _context9.abrupt("return");

                      case 31:
                        if (_Protocol_manager__WEBPACK_IMPORTED_MODULE_2__["protocolManager"].supportsPasswordDerivationCost(authParams.kdfIterations)) {
                          _context9.next = 35;
                          break;
                        }

                        _message2 = "Your account was created on a platform with higher security capabilities than this browser supports. " + "If we attempted to generate your login keys here, it would take hours. " + "Please use a browser with more up to date security capabilities, like Google Chrome or Firefox, to log in.";

                        _this3.unlockAndResolve(resolve, {
                          error: {
                            message: _message2
                          }
                        });

                        return _context9.abrupt("return");

                      case 35:
                        minimum = _Protocol_manager__WEBPACK_IMPORTED_MODULE_2__["protocolManager"].costMinimumForVersion(authParams.version);

                        if (!(authParams.kdfIterations < minimum)) {
                          _context9.next = 40;
                          break;
                        }

                        _message3 = "Unable to login due to insecure password parameters. Please visit standardnotes.org/help/security for more information.";

                        _this3.unlockAndResolve(resolve, {
                          error: {
                            message: _message3
                          }
                        });

                        return _context9.abrupt("return");

                      case 40:
                        if (!strictSignin) {
                          _context9.next = 46;
                          break;
                        }

                        // Refuse sign in if authParams.version is anything but the latest version
                        latestVersion = _Protocol_manager__WEBPACK_IMPORTED_MODULE_2__["protocolManager"].version();

                        if (!(authParams.version !== latestVersion)) {
                          _context9.next = 46;
                          break;
                        }

                        _message4 = "Strict sign in refused server sign in parameters. The latest security version is ".concat(latestVersion, ", but your account is reported to have version ").concat(authParams.version, ". If you'd like to proceed with sign in anyway, please disable strict sign in and try again.");

                        _this3.unlockAndResolve(resolve, {
                          error: {
                            message: _message4
                          }
                        });

                        return _context9.abrupt("return");

                      case 46:
                        _context9.next = 48;
                        return regeneratorRuntime.awrap(_Protocol_manager__WEBPACK_IMPORTED_MODULE_2__["protocolManager"].computeEncryptionKeys({
                          password: password,
                          authParams: authParams
                        }));

                      case 48:
                        keys = _context9.sent;
                        requestUrl = url + "/auth/sign_in";
                        params = lodash_merge__WEBPACK_IMPORTED_MODULE_1___default()({
                          password: keys.serverAuthenticationValue,
                          email: email
                        }, extraParams);
                        params['api'] = _Services_httpManager__WEBPACK_IMPORTED_MODULE_4__["SFHttpManager"].getApiVersion();

                        _this3.httpManager.postAbsolute(requestUrl, params, function _callee(response) {
                          return regeneratorRuntime.async(function _callee$(_context8) {
                            while (1) {
                              switch (_context8.prev = _context8.next) {
                                case 0:
                                  _context8.next = 2;
                                  return regeneratorRuntime.awrap(_this3.handleAuthResponse(response, email, url, authParams, keys));

                                case 2:
                                  _this3.notifyEvent(SFAuthManager.DidSignInEvent);

                                  _this3.$timeout(function () {
                                    return _this3.unlockAndResolve(resolve, response);
                                  });

                                case 4:
                                case "end":
                                  return _context8.stop();
                              }
                            }
                          });
                        }, function (response) {
                          console.error("Error logging in", response);

                          if (_typeof(response) !== 'object') {
                            response = {
                              error: {
                                message: "A server error occurred while trying to sign in. Please try again."
                              }
                            };
                          }

                          _this3.$timeout(function () {
                            return _this3.unlockAndResolve(resolve, response);
                          });
                        });

                      case 53:
                      case "end":
                        return _context9.stop();
                    }
                  }
                });
              }));

            case 1:
            case "end":
              return _context10.stop();
          }
        }
      });
    }
  }, {
    key: "register",
    value: function register(url, email, password) {
      var _this4 = this;

      return new Promise(function _callee4(resolve, reject) {
        var MinPasswordLength, message, results, keys, authParams, requestUrl, params;
        return regeneratorRuntime.async(function _callee4$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                if (!_this4.isLocked()) {
                  _context12.next = 3;
                  break;
                }

                resolve({
                  error: {
                    message: "Register already in progress."
                  }
                });
                return _context12.abrupt("return");

              case 3:
                MinPasswordLength = 8;

                if (!(password.length < MinPasswordLength)) {
                  _context12.next = 8;
                  break;
                }

                message = "Your password must be at least ".concat(MinPasswordLength, " characters in length. For your security, please choose a longer password or, ideally, a passphrase, and try again.");
                resolve({
                  error: {
                    message: message
                  }
                });
                return _context12.abrupt("return");

              case 8:
                _this4.lock();

                _context12.next = 11;
                return regeneratorRuntime.awrap(_Protocol_manager__WEBPACK_IMPORTED_MODULE_2__["protocolManager"].createKeysAndAuthParams({
                  identifier: email,
                  password: password
                }));

              case 11:
                results = _context12.sent;
                keys = results.keys;
                authParams = results.authParams;
                requestUrl = url + "/auth";
                params = lodash_merge__WEBPACK_IMPORTED_MODULE_1___default()({
                  password: keys.serverAuthenticationValue,
                  email: email
                }, authParams);
                params['api'] = _Services_httpManager__WEBPACK_IMPORTED_MODULE_4__["SFHttpManager"].getApiVersion();

                _this4.httpManager.postAbsolute(requestUrl, params, function _callee3(response) {
                  return regeneratorRuntime.async(function _callee3$(_context11) {
                    while (1) {
                      switch (_context11.prev = _context11.next) {
                        case 0:
                          _context11.next = 2;
                          return regeneratorRuntime.awrap(_this4.handleAuthResponse(response, email, url, authParams, keys));

                        case 2:
                          _this4.unlockAndResolve(resolve, response);

                        case 3:
                        case "end":
                          return _context11.stop();
                      }
                    }
                  });
                }, function (response) {
                  console.error("Registration error", response);

                  if (_typeof(response) !== 'object') {
                    response = {
                      error: {
                        message: "A server error occurred while trying to register. Please try again."
                      }
                    };
                  }

                  _this4.unlockAndResolve(resolve, response);
                });

              case 18:
              case "end":
                return _context12.stop();
            }
          }
        });
      });
    }
  }, {
    key: "changePassword",
    value: function changePassword(url, email, current_server_pw, newKeys, newAuthParams) {
      var _this5 = this;

      return regeneratorRuntime.async(function changePassword$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              return _context15.abrupt("return", new Promise(function _callee6(resolve, reject) {
                var newServerPw, requestUrl, params;
                return regeneratorRuntime.async(function _callee6$(_context14) {
                  while (1) {
                    switch (_context14.prev = _context14.next) {
                      case 0:
                        if (!_this5.isLocked()) {
                          _context14.next = 3;
                          break;
                        }

                        resolve({
                          error: {
                            message: "Change password already in progress."
                          }
                        });
                        return _context14.abrupt("return");

                      case 3:
                        _this5.lock();

                        newServerPw = newKeys.serverAuthenticationValue;
                        requestUrl = url + "/auth/change_pw";
                        params = lodash_merge__WEBPACK_IMPORTED_MODULE_1___default()({
                          new_password: newServerPw,
                          current_password: current_server_pw
                        }, newAuthParams);
                        params['api'] = _Services_httpManager__WEBPACK_IMPORTED_MODULE_4__["SFHttpManager"].getApiVersion();

                        _this5.httpManager.postAuthenticatedAbsolute(requestUrl, params, function _callee5(response) {
                          return regeneratorRuntime.async(function _callee5$(_context13) {
                            while (1) {
                              switch (_context13.prev = _context13.next) {
                                case 0:
                                  _context13.next = 2;
                                  return regeneratorRuntime.awrap(_this5.handleAuthResponse(response, email, null, newAuthParams, newKeys));

                                case 2:
                                  _this5.unlockAndResolve(resolve, response);

                                case 3:
                                case "end":
                                  return _context13.stop();
                              }
                            }
                          });
                        }, function (response) {
                          if (_typeof(response) !== 'object') {
                            response = {
                              error: {
                                message: "Something went wrong while changing your password. Your password was not changed. Please try again."
                              }
                            };
                          }

                          _this5.unlockAndResolve(resolve, response);
                        });

                      case 9:
                      case "end":
                        return _context14.stop();
                    }
                  }
                });
              }));

            case 1:
            case "end":
              return _context15.stop();
          }
        }
      });
    }
  }, {
    key: "handleAuthResponse",
    value: function handleAuthResponse(response, email, url, authParams, keys) {
      return regeneratorRuntime.async(function handleAuthResponse$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              if (!url) {
                _context16.next = 3;
                break;
              }

              _context16.next = 3;
              return regeneratorRuntime.awrap(this.storageManager.setItem("server", url));

            case 3:
              this._authParams = authParams;
              _context16.next = 6;
              return regeneratorRuntime.awrap(this.storageManager.setItem("auth_params", JSON.stringify(authParams)));

            case 6:
              _context16.next = 8;
              return regeneratorRuntime.awrap(this.storageManager.setItem("jwt", response.token));

            case 8:
              return _context16.abrupt("return", this.saveKeys(keys));

            case 9:
            case "end":
              return _context16.stop();
          }
        }
      }, null, this);
    }
  }]);

  return SFAuthManager;
}();

/***/ }),

/***/ "./lib/services/componentManager.js":
/*!******************************************!*\
  !*** ./lib/services/componentManager.js ***!
  \******************************************/
/*! exports provided: SNComponentManager */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SNComponentManager", function() { return SNComponentManager; });
/* harmony import */ var lodash_find__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash/find */ "./node_modules/lodash/find.js");
/* harmony import */ var lodash_find__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash_find__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash_pull__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash/pull */ "./node_modules/lodash/pull.js");
/* harmony import */ var lodash_pull__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash_pull__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash_uniq__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash/uniq */ "./node_modules/lodash/uniq.js");
/* harmony import */ var lodash_uniq__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash_uniq__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var lodash_remove__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lodash/remove */ "./node_modules/lodash/remove.js");
/* harmony import */ var lodash_remove__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(lodash_remove__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _Protocol_manager__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Protocol/manager */ "./lib/protocol/manager.js");
/* harmony import */ var _Services_modelManager__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @Services/modelManager */ "./lib/services/modelManager.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }







var SNComponentManager =
/*#__PURE__*/
function () {
  /**
   * @param environment  One of [web, desktop, mobile]
   * @param platform  One of [ios, android, linux-${environment}, mac-${environment}, windows-${environment}]
   */
  function SNComponentManager(_ref) {
    var modelManager = _ref.modelManager,
        syncManager = _ref.syncManager,
        desktopManager = _ref.desktopManager,
        nativeExtManager = _ref.nativeExtManager,
        alertManager = _ref.alertManager,
        $uiRunner = _ref.$uiRunner,
        $timeout = _ref.$timeout,
        environment = _ref.environment,
        platform = _ref.platform;

    _classCallCheck(this, SNComponentManager);

    /* This domain will be used to save context item client data */
    SNComponentManager.ClientDataDomain = "org.standardnotes.sn.components"; // Some actions need to be run on the ui thread (desktop/web only)

    this.$uiRunner = $uiRunner || function (fn) {
      fn();
    };

    this.$timeout = $timeout || setTimeout.bind(window);
    this.modelManager = modelManager;
    this.syncManager = syncManager;
    this.desktopManager = desktopManager;
    this.nativeExtManager = nativeExtManager;
    this.alertManager = alertManager;
    this.streamObservers = [];
    this.contextStreamObservers = [];
    this.activeComponents = [];
    this.environment = environment;
    this.platform = platform;
    this.isDesktop = this.environment == "desktop";
    this.isMobile = this.environment == "mobile";

    if (environment != "mobile") {
      this.configureForNonMobileUsage();
    }

    this.configureForGeneralUsage(); // this.loggingEnabled = true;

    this.permissionDialogs = [];
    this.handlers = [];
  }

  _createClass(SNComponentManager, [{
    key: "configureForGeneralUsage",
    value: function configureForGeneralUsage() {
      var _this = this;

      this.modelManager.addItemSyncObserver("component-manager", "*", function (allItems, validItems, deletedItems, source, sourceKey) {
        var syncedComponents = allItems.filter(function (item) {
          return item.content_type === "SN|Component" || item.content_type == "SN|Theme";
        });
        /* We only want to sync if the item source is Retrieved, not MappingSourceRemoteSaved to avoid
          recursion caused by the component being modified and saved after it is updated.
        */

        if (syncedComponents.length > 0 && source != _Services_modelManager__WEBPACK_IMPORTED_MODULE_5__["SFModelManager"].MappingSourceRemoteSaved) {
          // Ensure any component in our data is installed by the system
          if (_this.isDesktop) {
            _this.desktopManager.syncComponentsInstallation(syncedComponents);
          }
        }

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = syncedComponents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var component = _step.value;
            var activeComponent = lodash_find__WEBPACK_IMPORTED_MODULE_0___default()(_this.activeComponents, {
              uuid: component.uuid
            });

            if (component.active && !component.deleted && !activeComponent) {
              _this.activateComponent(component);
            } else if (!component.active && activeComponent) {
              _this.deactivateComponent(component);
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          var _loop = function _loop() {
            var observer = _step2.value;

            if (sourceKey && sourceKey == observer.component.uuid) {
              // Don't notify source of change, as it is the originator, doesn't need duplicate event.
              return "continue";
            }

            var relevantItems = allItems.filter(function (item) {
              return observer.contentTypes.indexOf(item.content_type) !== -1;
            });

            if (relevantItems.length == 0) {
              return "continue";
            }

            var requiredPermissions = [{
              name: "stream-items",
              content_types: observer.contentTypes.sort()
            }];

            _this.runWithPermissions(observer.component, requiredPermissions, function () {
              _this.sendItemsInReply(observer.component, relevantItems, observer.originalMessage);
            });
          };

          for (var _iterator2 = _this.streamObservers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _ret = _loop();

            if (_ret === "continue") continue;
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        var requiredContextPermissions = [{
          name: "stream-context-item"
        }];
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          var _loop2 = function _loop2() {
            var observer = _step3.value;

            if (sourceKey && sourceKey == observer.component.uuid) {
              // Don't notify source of change, as it is the originator, doesn't need duplicate event.
              return "continue";
            }

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
              for (var _iterator4 = _this.handlers[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var handler = _step4.value;

                if (!handler.areas.includes(observer.component.area) && !handler.areas.includes("*")) {
                  continue;
                }

                if (handler.contextRequestHandler) {
                  itemInContext = handler.contextRequestHandler(observer.component);

                  if (itemInContext) {
                    matchingItem = lodash_find__WEBPACK_IMPORTED_MODULE_0___default()(allItems, {
                      uuid: itemInContext.uuid
                    });

                    if (matchingItem) {
                      _this.runWithPermissions(observer.component, requiredContextPermissions, function () {
                        _this.sendContextItemInReply(observer.component, matchingItem, observer.originalMessage, source);
                      });
                    }
                  }
                }
              }
            } catch (err) {
              _didIteratorError4 = true;
              _iteratorError4 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
                  _iterator4.return();
                }
              } finally {
                if (_didIteratorError4) {
                  throw _iteratorError4;
                }
              }
            }
          };

          for (var _iterator3 = _this.contextStreamObservers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var itemInContext;
            var matchingItem;

            var _ret2 = _loop2();

            if (_ret2 === "continue") continue;
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      });
    }
  }, {
    key: "configureForNonMobileUsage",
    value: function configureForNonMobileUsage() {
      var _this2 = this;

      var detectFocusChange = function detectFocusChange(event) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = _this2.activeComponents[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var component = _step5.value;

            if (document.activeElement == _this2.iframeForComponent(component)) {
              _this2.$timeout(function () {
                _this2.focusChangedForComponent(component);
              });

              break;
            }
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }
      };

      window.addEventListener ? window.addEventListener('focus', detectFocusChange, true) : window.attachEvent('onfocusout', detectFocusChange);
      window.addEventListener ? window.addEventListener('blur', detectFocusChange, true) : window.attachEvent('onblur', detectFocusChange);
      this.desktopManager.registerUpdateObserver(function (component) {
        // Reload theme if active
        if (component.active && component.isTheme()) {
          _this2.postActiveThemesToAllComponents();
        }
      }); // On mobile, events listeners are handled by a respective component

      window.addEventListener("message", function (event) {
        if (_this2.loggingEnabled) {
          console.log("Web app: received message", event);
        } // Make sure this message is for us


        if (event.data.sessionKey) {
          _this2.handleMessage(_this2.componentForSessionKey(event.data.sessionKey), event.data);
        }
      }, false);
    }
  }, {
    key: "postActiveThemesToAllComponents",
    value: function postActiveThemesToAllComponents() {
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = this.components[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var component = _step6.value;

          // Skip over components that are themes themselves,
          // or components that are not active, or components that don't have a window
          if (component.isTheme() || !component.active || !component.window) {
            continue;
          }

          this.postActiveThemesToComponent(component);
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }
    }
  }, {
    key: "getActiveThemes",
    value: function getActiveThemes() {
      return this.componentsForArea("themes").filter(function (theme) {
        return theme.active;
      });
    }
  }, {
    key: "urlsForActiveThemes",
    value: function urlsForActiveThemes() {
      var _this3 = this;

      var themes = this.getActiveThemes();
      return themes.map(function (theme) {
        return _this3.urlForComponent(theme);
      });
    }
  }, {
    key: "postActiveThemesToComponent",
    value: function postActiveThemesToComponent(component) {
      var urls = this.urlsForActiveThemes();
      var data = {
        themes: urls
      };
      this.sendMessageToComponent(component, {
        action: "themes",
        data: data
      });
    }
  }, {
    key: "contextItemDidChangeInArea",
    value: function contextItemDidChangeInArea(area) {
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = this.handlers[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var handler = _step7.value;

          if (handler.areas.includes(area) === false && !handler.areas.includes("*")) {
            continue;
          }

          var observers = this.contextStreamObservers.filter(function (observer) {
            return observer.component.area === area;
          });
          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = observers[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var observer = _step8.value;

              if (handler.contextRequestHandler) {
                var itemInContext = handler.contextRequestHandler(observer.component);

                if (itemInContext) {
                  this.sendContextItemInReply(observer.component, itemInContext, observer.originalMessage);
                }
              }
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8.return != null) {
                _iterator8.return();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }
    }
  }, {
    key: "setComponentHidden",
    value: function setComponentHidden(component, hidden) {
      /*
        A hidden component will not receive messages.
        However, when a component is unhidden, we need to send it any items it may have
        registered streaming for.
      */
      if (hidden) {
        component.hidden = true;
      } else if (component.hidden) {
        // Only enter this condition if component is hidden to make this note have double side effects.
        component.hidden = false; // streamContextItem

        var contextObserver = lodash_find__WEBPACK_IMPORTED_MODULE_0___default()(this.contextStreamObservers, {
          identifier: component.uuid
        });

        if (contextObserver) {
          this.handleStreamContextItemMessage(component, contextObserver.originalMessage);
        } // streamItems


        var streamObserver = lodash_find__WEBPACK_IMPORTED_MODULE_0___default()(this.streamObservers, {
          identifier: component.uuid
        });

        if (streamObserver) {
          this.handleStreamItemsMessage(component, streamObserver.originalMessage);
        }
      }
    }
  }, {
    key: "jsonForItem",
    value: function jsonForItem(item, component, source) {
      var params = {
        uuid: item.uuid,
        content_type: item.content_type,
        created_at: item.created_at,
        updated_at: item.updated_at,
        deleted: item.deleted
      };
      params.content = item.createContentJSONFromProperties();
      params.clientData = item.getDomainDataItem(component.getClientDataKey(), SNComponentManager.ClientDataDomain) || {}; // isMetadataUpdate implies that the extension should make reference of updated metadata,
      // but not update content values as they may be stale relative to what the extension currently has
      // Changes are always metadata updates if the mapping source is SFModelManager.MappingSourceRemoteSaved || source == SFModelManager.MappingSourceLocalSaved.
      //

      if (source && (source == _Services_modelManager__WEBPACK_IMPORTED_MODULE_5__["SFModelManager"].MappingSourceRemoteSaved || source == _Services_modelManager__WEBPACK_IMPORTED_MODULE_5__["SFModelManager"].MappingSourceLocalSaved)) {
        params.isMetadataUpdate = true;
      }

      this.removePrivatePropertiesFromResponseItems([params], component, {
        type: "outgoing"
      });
      return params;
    }
  }, {
    key: "sendItemsInReply",
    value: function sendItemsInReply(component, items, message, source) {
      var _this4 = this;

      if (this.loggingEnabled) {
        console.log("Web|componentManager|sendItemsInReply", component, items, message);
      }

      ;
      var response = {
        items: {}
      };
      var mapped = items.map(function (item) {
        return _this4.jsonForItem(item, component, source);
      });
      response.items = mapped;
      this.replyToMessage(component, message, response);
    }
  }, {
    key: "sendContextItemInReply",
    value: function sendContextItemInReply(component, item, originalMessage, source) {
      if (this.loggingEnabled) {
        console.log("Web|componentManager|sendContextItemInReply", component, item, originalMessage);
      }

      ;
      var response = {
        item: this.jsonForItem(item, component, source)
      };
      this.replyToMessage(component, originalMessage, response);
    }
  }, {
    key: "replyToMessage",
    value: function replyToMessage(component, originalMessage, replyData) {
      var reply = {
        action: "reply",
        original: originalMessage,
        data: replyData
      };
      this.sendMessageToComponent(component, reply);
    }
  }, {
    key: "sendMessageToComponent",
    value: function sendMessageToComponent(component, message) {
      var permissibleActionsWhileHidden = ["component-registered", "themes"];

      if (component.hidden && !permissibleActionsWhileHidden.includes(message.action)) {
        if (this.loggingEnabled) {
          console.log("Component disabled for current item, not sending any messages.", component.name);
        }

        return;
      }

      if (this.loggingEnabled) {
        console.log("Web|sendMessageToComponent", component, message);
      }

      var origin = this.urlForComponent(component);

      if (!origin.startsWith("http") && !origin.startsWith("file")) {
        // Native extension running in web, prefix current host
        origin = window.location.href + origin;
      }

      if (!component.window) {
        this.alertManager.alert({
          text: "Standard Notes is trying to communicate with ".concat(component.name, ", but an error is occurring. Please restart this extension and try again.")
        });
      } // Mobile messaging requires json


      if (this.isMobile) {
        message = JSON.stringify(message);
      }

      component.window.postMessage(message, origin);
    }
  }, {
    key: "componentsForArea",
    value: function componentsForArea(area) {
      return this.components.filter(function (component) {
        return component.area === area;
      });
    }
  }, {
    key: "urlForComponent",
    value: function urlForComponent(component) {
      // offlineOnly is available only on desktop, and not on web or mobile.
      if (component.offlineOnly && !this.isDesktop) {
        return null;
      }

      if (component.offlineOnly || this.isDesktop && component.local_url) {
        return component.local_url && component.local_url.replace("sn://", this.desktopManager.getExtServerHost());
      } else {
        var url = component.hosted_url || component.legacy_url;

        if (this.isMobile) {
          var localReplacement = this.platform == "ios" ? "localhost" : "10.0.2.2";
          url = url.replace("localhost", localReplacement).replace("sn.local", localReplacement);
        }

        return url;
      }
    }
  }, {
    key: "componentForUrl",
    value: function componentForUrl(url) {
      return this.components.filter(function (component) {
        return component.hosted_url === url || component.legacy_url === url;
      })[0];
    }
  }, {
    key: "componentForSessionKey",
    value: function componentForSessionKey(key) {
      var component = lodash_find__WEBPACK_IMPORTED_MODULE_0___default()(this.components, {
        sessionKey: key
      });

      if (!component) {
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = this.handlers[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var handler = _step9.value;

            if (handler.componentForSessionKeyHandler) {
              component = handler.componentForSessionKeyHandler(key);

              if (component) {
                break;
              }
            }
          }
        } catch (err) {
          _didIteratorError9 = true;
          _iteratorError9 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion9 && _iterator9.return != null) {
              _iterator9.return();
            }
          } finally {
            if (_didIteratorError9) {
              throw _iteratorError9;
            }
          }
        }
      }

      return component;
    }
  }, {
    key: "handleMessage",
    value: function handleMessage(component, message) {
      var _this5 = this;

      if (!component) {
        console.log("Component not defined for message, returning", message);
        this.alertManager.alert({
          text: "An extension is trying to communicate with Standard Notes, but there is an error establishing a bridge. Please restart the app and try again."
        });
        return;
      } // Actions that won't succeeed with readonly mode


      var readwriteActions = ["save-items", "associate-item", "deassociate-item", "create-item", "create-items", "delete-items", "set-component-data"];

      if (component.readonly && readwriteActions.includes(message.action)) {
        // A component can be marked readonly if changes should not be saved.
        // Particullary used for revision preview windows where the notes should not be savable.
        this.alertManager.alert({
          text: "The extension ".concat(component.name, " is trying to save, but it is in a locked state and cannot accept changes.")
        });
        return;
      }
      /**
      Possible Messages:
        set-size
        stream-items
        stream-context-item
        save-items
        select-item
        associate-item
        deassociate-item
        clear-selection
        create-item
        create-items
        delete-items
        set-component-data
        install-local-component
        toggle-activate-component
        request-permissions
        present-conflict-resolution
      */


      if (message.action === "stream-items") {
        this.handleStreamItemsMessage(component, message);
      } else if (message.action === "stream-context-item") {
        this.handleStreamContextItemMessage(component, message);
      } else if (message.action === "set-component-data") {
        this.handleSetComponentDataMessage(component, message);
      } else if (message.action === "delete-items") {
        this.handleDeleteItemsMessage(component, message);
      } else if (message.action === "create-items" || message.action === "create-item") {
        this.handleCreateItemsMessage(component, message);
      } else if (message.action === "save-items") {
        this.handleSaveItemsMessage(component, message);
      } else if (message.action === "toggle-activate-component") {
        var componentToToggle = this.modelManager.findItem(message.data.uuid);
        this.handleToggleComponentMessage(component, componentToToggle, message);
      } else if (message.action === "request-permissions") {
        this.handleRequestPermissionsMessage(component, message);
      } else if (message.action === "install-local-component") {
        this.handleInstallLocalComponentMessage(component, message);
      } else if (message.action === "duplicate-item") {
        this.handleDuplicateItemMessage(component, message);
      } // Notify observers


      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        var _loop3 = function _loop3() {
          var handler = _step10.value;

          if (handler.actionHandler && (handler.areas.includes(component.area) || handler.areas.includes("*"))) {
            _this5.$timeout(function () {
              handler.actionHandler(component, message.action, message.data);
            });
          }
        };

        for (var _iterator10 = this.handlers[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          _loop3();
        }
      } catch (err) {
        _didIteratorError10 = true;
        _iteratorError10 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion10 && _iterator10.return != null) {
            _iterator10.return();
          }
        } finally {
          if (_didIteratorError10) {
            throw _iteratorError10;
          }
        }
      }
    }
  }, {
    key: "removePrivatePropertiesFromResponseItems",
    value: function removePrivatePropertiesFromResponseItems(responseItems, component) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      // can be 'incoming' or 'outgoing'. We want to remove updated_at if incoming, but keep it if outgoing
      if (options.type == "incoming") {
        var privateTopLevelProperties = ["updated_at"]; // Maintaining our own updated_at value is imperative for sync to work properly, we ignore any incoming value.

        var _iteratorNormalCompletion11 = true;
        var _didIteratorError11 = false;
        var _iteratorError11 = undefined;

        try {
          for (var _iterator11 = responseItems[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
            var responseItem = _step11.value;

            if (typeof responseItem.setDirty === 'function') {
              console.error("Attempting to pass object. Use JSON.");
              continue;
            }

            var _iteratorNormalCompletion12 = true;
            var _didIteratorError12 = false;
            var _iteratorError12 = undefined;

            try {
              for (var _iterator12 = privateTopLevelProperties[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                var privateProperty = _step12.value;
                delete responseItem[privateProperty];
              }
            } catch (err) {
              _didIteratorError12 = true;
              _iteratorError12 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion12 && _iterator12.return != null) {
                  _iterator12.return();
                }
              } finally {
                if (_didIteratorError12) {
                  throw _iteratorError12;
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError11 = true;
          _iteratorError11 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion11 && _iterator11.return != null) {
              _iterator11.return();
            }
          } finally {
            if (_didIteratorError11) {
              throw _iteratorError11;
            }
          }
        }
      }

      if (component) {
        // System extensions can bypass this step
        if (this.nativeExtManager && this.nativeExtManager.isSystemExtension(component)) {
          return;
        }
      } // Don't allow component to overwrite these properties.


      var privateContentProperties = ["autoupdateDisabled", "permissions", "active"];

      if (options) {
        if (options.includeUrls) {
          privateContentProperties = privateContentProperties.concat(["url", "hosted_url", "local_url"]);
        }
      }

      var _iteratorNormalCompletion13 = true;
      var _didIteratorError13 = false;
      var _iteratorError13 = undefined;

      try {
        for (var _iterator13 = responseItems[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
          var _responseItem = _step13.value;

          // Do not pass in actual items here, otherwise that would be destructive.
          // Instead, generic JS/JSON objects should be passed.
          if (typeof _responseItem.setDirty === 'function') {
            console.error("Attempting to pass object. Use JSON.");
            continue;
          }

          var _iteratorNormalCompletion14 = true;
          var _didIteratorError14 = false;
          var _iteratorError14 = undefined;

          try {
            for (var _iterator14 = privateContentProperties[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
              var prop = _step14.value;
              delete _responseItem.content[prop];
            }
          } catch (err) {
            _didIteratorError14 = true;
            _iteratorError14 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion14 && _iterator14.return != null) {
                _iterator14.return();
              }
            } finally {
              if (_didIteratorError14) {
                throw _iteratorError14;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError13 = true;
        _iteratorError13 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion13 && _iterator13.return != null) {
            _iterator13.return();
          }
        } finally {
          if (_didIteratorError13) {
            throw _iteratorError13;
          }
        }
      }
    }
  }, {
    key: "handleStreamItemsMessage",
    value: function handleStreamItemsMessage(component, message) {
      var _this6 = this;

      var requiredPermissions = [{
        name: "stream-items",
        content_types: message.data.content_types.sort()
      }];
      this.runWithPermissions(component, requiredPermissions, function () {
        if (!lodash_find__WEBPACK_IMPORTED_MODULE_0___default()(_this6.streamObservers, {
          identifier: component.uuid
        })) {
          // for pushing laster as changes come in
          _this6.streamObservers.push({
            identifier: component.uuid,
            component: component,
            originalMessage: message,
            contentTypes: message.data.content_types
          });
        } // push immediately now


        var items = [];
        var _iteratorNormalCompletion15 = true;
        var _didIteratorError15 = false;
        var _iteratorError15 = undefined;

        try {
          for (var _iterator15 = message.data.content_types[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
            var contentType = _step15.value;
            items = items.concat(_this6.modelManager.validItemsForContentType(contentType));
          }
        } catch (err) {
          _didIteratorError15 = true;
          _iteratorError15 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion15 && _iterator15.return != null) {
              _iterator15.return();
            }
          } finally {
            if (_didIteratorError15) {
              throw _iteratorError15;
            }
          }
        }

        _this6.sendItemsInReply(component, items, message);
      });
    }
  }, {
    key: "handleStreamContextItemMessage",
    value: function handleStreamContextItemMessage(component, message) {
      var _this7 = this;

      var requiredPermissions = [{
        name: "stream-context-item"
      }];
      this.runWithPermissions(component, requiredPermissions, function () {
        if (!lodash_find__WEBPACK_IMPORTED_MODULE_0___default()(_this7.contextStreamObservers, {
          identifier: component.uuid
        })) {
          // for pushing laster as changes come in
          _this7.contextStreamObservers.push({
            identifier: component.uuid,
            component: component,
            originalMessage: message
          });
        } // push immediately now


        var _iteratorNormalCompletion16 = true;
        var _didIteratorError16 = false;
        var _iteratorError16 = undefined;

        try {
          for (var _iterator16 = _this7.handlersForArea(component.area)[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
            var handler = _step16.value;

            if (handler.contextRequestHandler) {
              var itemInContext = handler.contextRequestHandler(component);

              if (itemInContext) {
                _this7.sendContextItemInReply(component, itemInContext, message);
              }
            }
          }
        } catch (err) {
          _didIteratorError16 = true;
          _iteratorError16 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion16 && _iterator16.return != null) {
              _iterator16.return();
            }
          } finally {
            if (_didIteratorError16) {
              throw _iteratorError16;
            }
          }
        }
      });
    }
  }, {
    key: "isItemIdWithinComponentContextJurisdiction",
    value: function isItemIdWithinComponentContextJurisdiction(uuid, component) {
      var itemIdsInJurisdiction = this.itemIdsInContextJurisdictionForComponent(component);
      return itemIdsInJurisdiction.includes(uuid);
    }
    /* Returns items that given component has context permissions for */

  }, {
    key: "itemIdsInContextJurisdictionForComponent",
    value: function itemIdsInContextJurisdictionForComponent(component) {
      var itemIds = [];
      var _iteratorNormalCompletion17 = true;
      var _didIteratorError17 = false;
      var _iteratorError17 = undefined;

      try {
        for (var _iterator17 = this.handlersForArea(component.area)[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
          var handler = _step17.value;

          if (handler.contextRequestHandler) {
            var itemInContext = handler.contextRequestHandler(component);

            if (itemInContext) {
              itemIds.push(itemInContext.uuid);
            }
          }
        }
      } catch (err) {
        _didIteratorError17 = true;
        _iteratorError17 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion17 && _iterator17.return != null) {
            _iterator17.return();
          }
        } finally {
          if (_didIteratorError17) {
            throw _iteratorError17;
          }
        }
      }

      return itemIds;
    }
  }, {
    key: "handlersForArea",
    value: function handlersForArea(area) {
      return this.handlers.filter(function (candidate) {
        return candidate.areas.includes(area);
      });
    }
  }, {
    key: "handleSaveItemsMessage",
    value: function handleSaveItemsMessage(component, message) {
      var _this8 = this;

      var responseItems, requiredPermissions, itemIdsInContextJurisdiction, pendingResponseItems, _iteratorNormalCompletion18, _didIteratorError18, _iteratorError18, _iterator18, _step18, responseItem, requiredContentTypes;

      return regeneratorRuntime.async(function handleSaveItemsMessage$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              responseItems = message.data.items;
              requiredPermissions = [];
              itemIdsInContextJurisdiction = this.itemIdsInContextJurisdictionForComponent(component); // Pending as in needed to be accounted for in permissions.

              pendingResponseItems = responseItems.slice();
              _iteratorNormalCompletion18 = true;
              _didIteratorError18 = false;
              _iteratorError18 = undefined;
              _context2.prev = 7;
              _iterator18 = responseItems.slice()[Symbol.iterator]();

            case 9:
              if (_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done) {
                _context2.next = 18;
                break;
              }

              responseItem = _step18.value;

              if (!itemIdsInContextJurisdiction.includes(responseItem.uuid)) {
                _context2.next = 15;
                break;
              }

              requiredPermissions.push({
                name: "stream-context-item"
              });
              lodash_pull__WEBPACK_IMPORTED_MODULE_1___default()(pendingResponseItems, responseItem); // We break because there can only be one context item

              return _context2.abrupt("break", 18);

            case 15:
              _iteratorNormalCompletion18 = true;
              _context2.next = 9;
              break;

            case 18:
              _context2.next = 24;
              break;

            case 20:
              _context2.prev = 20;
              _context2.t0 = _context2["catch"](7);
              _didIteratorError18 = true;
              _iteratorError18 = _context2.t0;

            case 24:
              _context2.prev = 24;
              _context2.prev = 25;

              if (!_iteratorNormalCompletion18 && _iterator18.return != null) {
                _iterator18.return();
              }

            case 27:
              _context2.prev = 27;

              if (!_didIteratorError18) {
                _context2.next = 30;
                break;
              }

              throw _iteratorError18;

            case 30:
              return _context2.finish(27);

            case 31:
              return _context2.finish(24);

            case 32:
              // Check to see if additional privileges are required
              if (pendingResponseItems.length > 0) {
                requiredContentTypes = lodash_uniq__WEBPACK_IMPORTED_MODULE_2___default()(pendingResponseItems.map(function (i) {
                  return i.content_type;
                })).sort();
                requiredPermissions.push({
                  name: "stream-items",
                  content_types: requiredContentTypes
                });
              }

              this.runWithPermissions(component, requiredPermissions, function _callee() {
                var ids, items, lockedCount, _iteratorNormalCompletion19, _didIteratorError19, _iteratorError19, _iterator19, _step19, item, itemNoun, auxVerb, localItems, _iteratorNormalCompletion20, _didIteratorError20, _iteratorError20, _iterator20, _step20, responseItem, _item;

                return regeneratorRuntime.async(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _this8.removePrivatePropertiesFromResponseItems(responseItems, component, {
                          includeUrls: true,
                          type: "incoming"
                        });
                        /*
                        We map the items here because modelManager is what updates the UI. If you were to instead get the items directly,
                        this would update them server side via sync, but would never make its way back to the UI.
                        */
                        // Filter locked items


                        ids = responseItems.map(function (i) {
                          return i.uuid;
                        });
                        items = _this8.modelManager.findItems(ids);
                        lockedCount = 0;
                        _iteratorNormalCompletion19 = true;
                        _didIteratorError19 = false;
                        _iteratorError19 = undefined;
                        _context.prev = 7;

                        for (_iterator19 = items[Symbol.iterator](); !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
                          item = _step19.value;

                          if (item.locked) {
                            lodash_remove__WEBPACK_IMPORTED_MODULE_3___default()(responseItems, {
                              uuid: item.uuid
                            });
                            lockedCount++;
                          }
                        }

                        _context.next = 15;
                        break;

                      case 11:
                        _context.prev = 11;
                        _context.t0 = _context["catch"](7);
                        _didIteratorError19 = true;
                        _iteratorError19 = _context.t0;

                      case 15:
                        _context.prev = 15;
                        _context.prev = 16;

                        if (!_iteratorNormalCompletion19 && _iterator19.return != null) {
                          _iterator19.return();
                        }

                      case 18:
                        _context.prev = 18;

                        if (!_didIteratorError19) {
                          _context.next = 21;
                          break;
                        }

                        throw _iteratorError19;

                      case 21:
                        return _context.finish(18);

                      case 22:
                        return _context.finish(15);

                      case 23:
                        if (lockedCount > 0) {
                          itemNoun = lockedCount == 1 ? "item" : "items";
                          auxVerb = lockedCount == 1 ? "is" : "are";

                          _this8.alertManager.alert({
                            title: 'Items Locked',
                            text: "".concat(lockedCount, " ").concat(itemNoun, " you are attempting to save ").concat(auxVerb, " locked and cannot be edited.")
                          });
                        }

                        _context.next = 26;
                        return regeneratorRuntime.awrap(_this8.modelManager.mapResponseItemsToLocalModels(responseItems, _Services_modelManager__WEBPACK_IMPORTED_MODULE_5__["SFModelManager"].MappingSourceComponentRetrieved, component.uuid));

                      case 26:
                        localItems = _context.sent;
                        _iteratorNormalCompletion20 = true;
                        _didIteratorError20 = false;
                        _iteratorError20 = undefined;
                        _context.prev = 30;
                        _iterator20 = responseItems[Symbol.iterator]();

                      case 32:
                        if (_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done) {
                          _context.next = 42;
                          break;
                        }

                        responseItem = _step20.value;
                        _item = lodash_find__WEBPACK_IMPORTED_MODULE_0___default()(localItems, {
                          uuid: responseItem.uuid
                        });

                        if (_item) {
                          _context.next = 38;
                          break;
                        }

                        // An item this extension is trying to save was possibly removed locally, notify user
                        _this8.alertManager.alert({
                          text: "The extension ".concat(component.name, " is trying to save an item with type ").concat(responseItem.content_type, ", but that item does not exist. Please restart this extension and try again.")
                        });

                        return _context.abrupt("continue", 39);

                      case 38:
                        if (!_item.locked) {
                          if (responseItem.clientData) {
                            _item.setDomainDataItem(component.getClientDataKey(), responseItem.clientData, SNComponentManager.ClientDataDomain);
                          }

                          _this8.modelManager.setItemDirty(_item, true, true, _Services_modelManager__WEBPACK_IMPORTED_MODULE_5__["SFModelManager"].MappingSourceComponentRetrieved, component.uuid);
                        }

                      case 39:
                        _iteratorNormalCompletion20 = true;
                        _context.next = 32;
                        break;

                      case 42:
                        _context.next = 48;
                        break;

                      case 44:
                        _context.prev = 44;
                        _context.t1 = _context["catch"](30);
                        _didIteratorError20 = true;
                        _iteratorError20 = _context.t1;

                      case 48:
                        _context.prev = 48;
                        _context.prev = 49;

                        if (!_iteratorNormalCompletion20 && _iterator20.return != null) {
                          _iterator20.return();
                        }

                      case 51:
                        _context.prev = 51;

                        if (!_didIteratorError20) {
                          _context.next = 54;
                          break;
                        }

                        throw _iteratorError20;

                      case 54:
                        return _context.finish(51);

                      case 55:
                        return _context.finish(48);

                      case 56:
                        _this8.syncManager.sync().then(function (response) {
                          // Allow handlers to be notified when a save begins and ends, to update the UI
                          var saveMessage = Object.assign({}, message);
                          saveMessage.action = response && response.error ? "save-error" : "save-success";

                          _this8.replyToMessage(component, message, {
                            error: response && response.error
                          });

                          _this8.handleMessage(component, saveMessage);
                        });

                      case 57:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, null, null, [[7, 11, 15, 23], [16,, 18, 22], [30, 44, 48, 56], [49,, 51, 55]]);
              });

            case 34:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this, [[7, 20, 24, 32], [25,, 27, 31]]);
    }
  }, {
    key: "handleDuplicateItemMessage",
    value: function handleDuplicateItemMessage(component, message) {
      var _this9 = this;

      var itemParams = message.data.item;
      var item = this.modelManager.findItem(itemParams.uuid);
      var requiredPermissions = [{
        name: "stream-items",
        content_types: [item.content_type]
      }];
      this.runWithPermissions(component, requiredPermissions, function () {
        var duplicate = _this9.modelManager.duplicateItemAndAdd(item);

        _this9.syncManager.sync();

        _this9.replyToMessage(component, message, {
          item: _this9.jsonForItem(duplicate, component)
        });
      });
    }
  }, {
    key: "handleCreateItemsMessage",
    value: function handleCreateItemsMessage(component, message) {
      var _this10 = this;

      var responseItems = message.data.item ? [message.data.item] : message.data.items;
      var uniqueContentTypes = lodash_uniq__WEBPACK_IMPORTED_MODULE_2___default()(responseItems.map(function (item) {
        return item.content_type;
      }));
      var requiredPermissions = [{
        name: "stream-items",
        content_types: uniqueContentTypes
      }];
      this.runWithPermissions(component, requiredPermissions, function () {
        _this10.removePrivatePropertiesFromResponseItems(responseItems, component, {
          type: "incoming"
        });

        var processedItems = [];
        var _iteratorNormalCompletion21 = true;
        var _didIteratorError21 = false;
        var _iteratorError21 = undefined;

        try {
          for (var _iterator21 = responseItems[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
            var responseItem = _step21.value;

            var item = _this10.modelManager.createItem(responseItem);

            if (responseItem.clientData) {
              item.setDomainDataItem(component.getClientDataKey(), responseItem.clientData, SNComponentManager.ClientDataDomain);
            }

            _this10.modelManager.addItem(item);

            _this10.modelManager.resolveReferencesForItem(item, true);

            _this10.modelManager.setItemDirty(item, true);

            processedItems.push(item);
          }
        } catch (err) {
          _didIteratorError21 = true;
          _iteratorError21 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion21 && _iterator21.return != null) {
              _iterator21.return();
            }
          } finally {
            if (_didIteratorError21) {
              throw _iteratorError21;
            }
          }
        }

        _this10.syncManager.sync(); // "create-item" or "create-items" are possible messages handled here


        var reply = message.action == "create-item" ? {
          item: _this10.jsonForItem(processedItems[0], component)
        } : {
          items: processedItems.map(function (item) {
            return _this10.jsonForItem(item, component);
          })
        };

        _this10.replyToMessage(component, message, reply);
      });
    }
  }, {
    key: "handleDeleteItemsMessage",
    value: function handleDeleteItemsMessage(component, message) {
      var _this11 = this;

      var requiredContentTypes = lodash_uniq__WEBPACK_IMPORTED_MODULE_2___default()(message.data.items.map(function (i) {
        return i.content_type;
      })).sort();
      var requiredPermissions = [{
        name: "stream-items",
        content_types: requiredContentTypes
      }];
      this.runWithPermissions(component, requiredPermissions, function _callee2() {
        var itemsData, noun, reply, didConfirm, _iteratorNormalCompletion22, _didIteratorError22, _iteratorError22, _iterator22, _step22, itemData, model;

        return regeneratorRuntime.async(function _callee2$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                itemsData = message.data.items;
                noun = itemsData.length == 1 ? "item" : "items";
                reply = null;
                didConfirm = true;
                _context3.next = 6;
                return regeneratorRuntime.awrap(_this11.alertManager.confirm({
                  text: "Are you sure you want to delete ".concat(itemsData.length, " ").concat(noun, "?")
                }).catch(function () {
                  didConfirm = false;
                }));

              case 6:
                if (!didConfirm) {
                  _context3.next = 42;
                  break;
                }

                // Filter for any components and deactivate before deleting
                _iteratorNormalCompletion22 = true;
                _didIteratorError22 = false;
                _iteratorError22 = undefined;
                _context3.prev = 10;
                _iterator22 = itemsData[Symbol.iterator]();

              case 12:
                if (_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done) {
                  _context3.next = 24;
                  break;
                }

                itemData = _step22.value;
                model = _this11.modelManager.findItem(itemData.uuid);

                if (model) {
                  _context3.next = 18;
                  break;
                }

                _this11.alertManager.alert({
                  text: "The item you are trying to delete cannot be found."
                });

                return _context3.abrupt("continue", 21);

              case 18:
                if (["SN|Component", "SN|Theme"].includes(model.content_type)) {
                  _this11.deactivateComponent(model, true);
                }

                _this11.modelManager.setItemToBeDeleted(model); // Currently extensions are not notified of association until a full server sync completes.
                // We manually notify observers.


                _this11.modelManager.notifySyncObserversOfModels([model], _Services_modelManager__WEBPACK_IMPORTED_MODULE_5__["SFModelManager"].MappingSourceRemoteSaved);

              case 21:
                _iteratorNormalCompletion22 = true;
                _context3.next = 12;
                break;

              case 24:
                _context3.next = 30;
                break;

              case 26:
                _context3.prev = 26;
                _context3.t0 = _context3["catch"](10);
                _didIteratorError22 = true;
                _iteratorError22 = _context3.t0;

              case 30:
                _context3.prev = 30;
                _context3.prev = 31;

                if (!_iteratorNormalCompletion22 && _iterator22.return != null) {
                  _iterator22.return();
                }

              case 33:
                _context3.prev = 33;

                if (!_didIteratorError22) {
                  _context3.next = 36;
                  break;
                }

                throw _iteratorError22;

              case 36:
                return _context3.finish(33);

              case 37:
                return _context3.finish(30);

              case 38:
                _this11.syncManager.sync();

                reply = {
                  deleted: true
                };
                _context3.next = 43;
                break;

              case 42:
                // Rejected by user
                reply = {
                  deleted: false
                };

              case 43:
                _this11.replyToMessage(component, message, reply);

              case 44:
              case "end":
                return _context3.stop();
            }
          }
        }, null, null, [[10, 26, 30, 38], [31,, 33, 37]]);
      });
    }
  }, {
    key: "handleRequestPermissionsMessage",
    value: function handleRequestPermissionsMessage(component, message) {
      var _this12 = this;

      this.runWithPermissions(component, message.data.permissions, function () {
        _this12.replyToMessage(component, message, {
          approved: true
        });
      });
    }
  }, {
    key: "handleSetComponentDataMessage",
    value: function handleSetComponentDataMessage(component, message) {
      var _this13 = this;

      // A component setting its own data does not require special permissions
      this.runWithPermissions(component, [], function () {
        component.componentData = message.data.componentData;

        _this13.modelManager.setItemDirty(component, true);

        _this13.syncManager.sync();
      });
    }
  }, {
    key: "handleToggleComponentMessage",
    value: function handleToggleComponentMessage(sourceComponent, targetComponent, message) {
      this.toggleComponent(targetComponent);
    }
  }, {
    key: "toggleComponent",
    value: function toggleComponent(component) {
      var _this14 = this;

      if (component.area == "modal") {
        this.openModalComponent(component);
      } else {
        if (component.active) {
          this.deactivateComponent(component);
        } else {
          if (component.content_type == "SN|Theme") {
            // Deactive currently active theme if new theme is not layerable
            var activeThemes = this.getActiveThemes(); // Activate current before deactivating others, so as not to flicker

            this.activateComponent(component);

            if (!component.isLayerable()) {
              setTimeout(function () {
                var _iteratorNormalCompletion23 = true;
                var _didIteratorError23 = false;
                var _iteratorError23 = undefined;

                try {
                  for (var _iterator23 = activeThemes[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
                    var theme = _step23.value;

                    if (theme && !theme.isLayerable()) {
                      _this14.deactivateComponent(theme);
                    }
                  }
                } catch (err) {
                  _didIteratorError23 = true;
                  _iteratorError23 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion23 && _iterator23.return != null) {
                      _iterator23.return();
                    }
                  } finally {
                    if (_didIteratorError23) {
                      throw _iteratorError23;
                    }
                  }
                }
              }, 10);
            }
          } else {
            this.activateComponent(component);
          }
        }
      }
    }
  }, {
    key: "handleInstallLocalComponentMessage",
    value: function handleInstallLocalComponentMessage(sourceComponent, message) {
      // Only extensions manager has this permission
      if (this.nativeExtManager && !this.nativeExtManager.isSystemExtension(sourceComponent)) {
        return;
      }

      var targetComponent = this.modelManager.findItem(message.data.uuid);
      this.desktopManager.installComponent(targetComponent);
    }
  }, {
    key: "runWithPermissions",
    value: function runWithPermissions(component, requiredPermissions, runFunction) {
      if (!component.permissions) {
        component.permissions = [];
      } // Make copy as not to mutate input values


      requiredPermissions = JSON.parse(JSON.stringify(requiredPermissions));
      var acquiredPermissions = component.permissions;
      var _iteratorNormalCompletion24 = true;
      var _didIteratorError24 = false;
      var _iteratorError24 = undefined;

      try {
        var _loop4 = function _loop4() {
          var required = _step24.value;
          // Remove anything we already have
          var respectiveAcquired = acquiredPermissions.find(function (candidate) {
            return candidate.name == required.name;
          });

          if (!respectiveAcquired) {
            return "continue";
          } // We now match on name, lets substract from required.content_types anything we have in acquired.


          var requiredContentTypes = required.content_types;

          if (!requiredContentTypes) {
            // If this permission does not require any content types (i.e stream-context-item)
            // then we can remove this from required since we match by name (respectiveAcquired.name == required.name)
            lodash_pull__WEBPACK_IMPORTED_MODULE_1___default()(requiredPermissions, required);
            return "continue";
          }

          var _iteratorNormalCompletion25 = true;
          var _didIteratorError25 = false;
          var _iteratorError25 = undefined;

          try {
            for (var _iterator25 = respectiveAcquired.content_types[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
              var acquiredContentType = _step25.value;
              // console.log("Removing content_type", acquiredContentType, "from", requiredContentTypes);
              lodash_pull__WEBPACK_IMPORTED_MODULE_1___default()(requiredContentTypes, acquiredContentType);
            }
          } catch (err) {
            _didIteratorError25 = true;
            _iteratorError25 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion25 && _iterator25.return != null) {
                _iterator25.return();
              }
            } finally {
              if (_didIteratorError25) {
                throw _iteratorError25;
              }
            }
          }

          if (requiredContentTypes.length == 0) {
            // We've removed all acquired and end up with zero, means we already have all these permissions
            lodash_pull__WEBPACK_IMPORTED_MODULE_1___default()(requiredPermissions, required);
          }
        };

        for (var _iterator24 = requiredPermissions.slice()[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
          var _ret3 = _loop4();

          if (_ret3 === "continue") continue;
        }
      } catch (err) {
        _didIteratorError24 = true;
        _iteratorError24 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion24 && _iterator24.return != null) {
            _iterator24.return();
          }
        } finally {
          if (_didIteratorError24) {
            throw _iteratorError24;
          }
        }
      }

      if (requiredPermissions.length > 0) {
        this.promptForPermissions(component, requiredPermissions, function (approved) {
          if (approved) {
            runFunction();
          }
        });
      } else {
        runFunction();
      }
    }
  }, {
    key: "promptForPermissions",
    value: function promptForPermissions(component, permissions, callback) {
      var _this15 = this;

      var params = {};
      params.component = component;
      params.permissions = permissions;
      params.permissionsString = this.permissionsStringForPermissions(permissions, component);
      params.actionBlock = callback;

      params.callback = function (approved) {
        if (approved) {
          var _iteratorNormalCompletion26 = true;
          var _didIteratorError26 = false;
          var _iteratorError26 = undefined;

          try {
            var _loop5 = function _loop5() {
              var permission = _step26.value;
              var matchingPermission = component.permissions.find(function (candidate) {
                return candidate.name == permission.name;
              });

              if (!matchingPermission) {
                component.permissions.push(permission);
              } else {
                // Permission already exists, but content_types may have been expanded
                var contentTypes = matchingPermission.content_types || [];
                matchingPermission.content_types = lodash_uniq__WEBPACK_IMPORTED_MODULE_2___default()(contentTypes.concat(permission.content_types));
              }
            };

            for (var _iterator26 = permissions[Symbol.iterator](), _step26; !(_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done); _iteratorNormalCompletion26 = true) {
              _loop5();
            }
          } catch (err) {
            _didIteratorError26 = true;
            _iteratorError26 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion26 && _iterator26.return != null) {
                _iterator26.return();
              }
            } finally {
              if (_didIteratorError26) {
                throw _iteratorError26;
              }
            }
          }

          _this15.modelManager.setItemDirty(component, true);

          _this15.syncManager.sync();
        }

        _this15.permissionDialogs = _this15.permissionDialogs.filter(function (pendingDialog) {
          // Remove self
          if (pendingDialog == params) {
            pendingDialog.actionBlock && pendingDialog.actionBlock(approved);
            return false;
          }

          var containsObjectSubset = function containsObjectSubset(source, target) {
            return !target.some(function (val) {
              return !source.find(function (candidate) {
                return JSON.stringify(candidate) === JSON.stringify(val);
              });
            });
          };

          if (pendingDialog.component == component) {
            // remove pending dialogs that are encapsulated by already approved permissions, and run its function
            if (pendingDialog.permissions == permissions || containsObjectSubset(permissions, pendingDialog.permissions)) {
              // If approved, run the action block. Otherwise, if canceled, cancel any pending ones as well, since the user was
              // explicit in their intentions
              if (approved) {
                pendingDialog.actionBlock && pendingDialog.actionBlock(approved);
              }

              return false;
            }
          }

          return true;
        });

        if (_this15.permissionDialogs.length > 0) {
          _this15.presentPermissionsDialog(_this15.permissionDialogs[0]);
        }
      }; // since these calls are asyncronous, multiple dialogs may be requested at the same time. We only want to present one and trigger all callbacks based on one modal result


      var existingDialog = lodash_find__WEBPACK_IMPORTED_MODULE_0___default()(this.permissionDialogs, {
        component: component
      });
      this.permissionDialogs.push(params);

      if (!existingDialog) {
        this.presentPermissionsDialog(params);
      } else {
        console.log("Existing dialog, not presenting.");
      }
    }
  }, {
    key: "presentPermissionsDialog",
    value: function presentPermissionsDialog(dialog) {
      console.error("Must override");
    }
  }, {
    key: "openModalComponent",
    value: function openModalComponent(component) {
      console.error("Must override");
    }
  }, {
    key: "registerHandler",
    value: function registerHandler(handler) {
      this.handlers.push(handler);
    }
  }, {
    key: "deregisterHandler",
    value: function deregisterHandler(identifier) {
      var handler = lodash_find__WEBPACK_IMPORTED_MODULE_0___default()(this.handlers, {
        identifier: identifier
      });

      if (!handler) {
        console.log("Attempting to deregister non-existing handler");
        return;
      }

      this.handlers.splice(this.handlers.indexOf(handler), 1);
    } // Called by other views when the iframe is ready

  }, {
    key: "registerComponentWindow",
    value: function registerComponentWindow(component, componentWindow) {
      return regeneratorRuntime.async(function registerComponentWindow$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (component.window === componentWindow) {
                if (this.loggingEnabled) {
                  console.log("Web|componentManager", "attempting to re-register same component window.");
                }
              }

              if (this.loggingEnabled) {
                console.log("Web|componentManager|registerComponentWindow", component);
              }

              component.window = componentWindow;
              _context4.next = 5;
              return regeneratorRuntime.awrap(_Protocol_manager__WEBPACK_IMPORTED_MODULE_4__["protocolManager"].crypto.generateUUID());

            case 5:
              component.sessionKey = _context4.sent;
              this.sendMessageToComponent(component, {
                action: "component-registered",
                sessionKey: component.sessionKey,
                componentData: component.componentData,
                data: {
                  uuid: component.uuid,
                  environment: this.environment,
                  platform: this.platform,
                  activeThemeUrls: this.urlsForActiveThemes()
                }
              });
              this.postActiveThemesToComponent(component);

              if (this.desktopManager) {
                this.desktopManager.notifyComponentActivation(component);
              }

            case 9:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "activateComponent",
    value: function activateComponent(component) {
      var _this16 = this;

      var dontSync = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var didChange = component.active != true;
      component.active = true;
      var _iteratorNormalCompletion27 = true;
      var _didIteratorError27 = false;
      var _iteratorError27 = undefined;

      try {
        var _loop6 = function _loop6() {
          var handler = _step27.value;

          if (handler.areas.includes(component.area) || handler.areas.includes("*")) {
            // We want to run the handler in a $timeout so the UI updates, but we also don't want it to run asyncronously
            // so that the steps below this one are run before the handler. So we run in a waitTimeout.
            // Update 12/18: We were using this.waitTimeout previously, however, that caused the iframe.onload callback to never be called
            // for some reason for iframes on desktop inside the revision-preview-modal. So we'll use safeApply instead. I'm not quite sure
            // where the original "so the UI updates" comment applies to, but we'll have to keep an eye out to see if this causes problems somewhere else.
            _this16.$uiRunner(function () {
              handler.activationHandler && handler.activationHandler(component);
            });
          }
        };

        for (var _iterator27 = this.handlers[Symbol.iterator](), _step27; !(_iteratorNormalCompletion27 = (_step27 = _iterator27.next()).done); _iteratorNormalCompletion27 = true) {
          _loop6();
        }
      } catch (err) {
        _didIteratorError27 = true;
        _iteratorError27 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion27 && _iterator27.return != null) {
            _iterator27.return();
          }
        } finally {
          if (_didIteratorError27) {
            throw _iteratorError27;
          }
        }
      }

      if (didChange && !dontSync) {
        this.modelManager.setItemDirty(component, true);
        this.syncManager.sync();
      }

      if (!this.activeComponents.includes(component)) {
        this.activeComponents.push(component);
      }

      if (component.area == "themes") {
        this.postActiveThemesToAllComponents();
      }
    }
  }, {
    key: "deactivateComponent",
    value: function deactivateComponent(component) {
      var _this17 = this;

      var dontSync = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var didChange = component.active != false;
      component.active = false;
      component.sessionKey = null;
      var _iteratorNormalCompletion28 = true;
      var _didIteratorError28 = false;
      var _iteratorError28 = undefined;

      try {
        var _loop7 = function _loop7() {
          var handler = _step28.value;

          if (handler.areas.includes(component.area) || handler.areas.includes("*")) {
            // See comment in activateComponent regarding safeApply and awaitTimeout
            _this17.$uiRunner(function () {
              handler.activationHandler && handler.activationHandler(component);
            });
          }
        };

        for (var _iterator28 = this.handlers[Symbol.iterator](), _step28; !(_iteratorNormalCompletion28 = (_step28 = _iterator28.next()).done); _iteratorNormalCompletion28 = true) {
          _loop7();
        }
      } catch (err) {
        _didIteratorError28 = true;
        _iteratorError28 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion28 && _iterator28.return != null) {
            _iterator28.return();
          }
        } finally {
          if (_didIteratorError28) {
            throw _iteratorError28;
          }
        }
      }

      if (didChange && !dontSync) {
        this.modelManager.setItemDirty(component, true);
        this.syncManager.sync();
      }

      lodash_pull__WEBPACK_IMPORTED_MODULE_1___default()(this.activeComponents, component);
      this.streamObservers = this.streamObservers.filter(function (o) {
        return o.component !== component;
      });
      this.contextStreamObservers = this.contextStreamObservers.filter(function (o) {
        return o.component !== component;
      });

      if (component.area == "themes") {
        this.postActiveThemesToAllComponents();
      }
    }
  }, {
    key: "reloadComponent",
    value: function reloadComponent(component) {
      var _this18 = this;

      var _iteratorNormalCompletion29, _didIteratorError29, _iteratorError29, _loop8, _iterator29, _step29;

      return regeneratorRuntime.async(function reloadComponent$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              //
              // Do soft deactivate
              //
              component.active = false;
              _iteratorNormalCompletion29 = true;
              _didIteratorError29 = false;
              _iteratorError29 = undefined;
              _context5.prev = 4;

              _loop8 = function _loop8() {
                var handler = _step29.value;

                if (handler.areas.includes(component.area) || handler.areas.includes("*")) {
                  // See comment in activateComponent regarding safeApply and awaitTimeout
                  _this18.$uiRunner(function () {
                    handler.activationHandler && handler.activationHandler(component);
                  });
                }
              };

              for (_iterator29 = this.handlers[Symbol.iterator](); !(_iteratorNormalCompletion29 = (_step29 = _iterator29.next()).done); _iteratorNormalCompletion29 = true) {
                _loop8();
              }

              _context5.next = 13;
              break;

            case 9:
              _context5.prev = 9;
              _context5.t0 = _context5["catch"](4);
              _didIteratorError29 = true;
              _iteratorError29 = _context5.t0;

            case 13:
              _context5.prev = 13;
              _context5.prev = 14;

              if (!_iteratorNormalCompletion29 && _iterator29.return != null) {
                _iterator29.return();
              }

            case 16:
              _context5.prev = 16;

              if (!_didIteratorError29) {
                _context5.next = 19;
                break;
              }

              throw _iteratorError29;

            case 19:
              return _context5.finish(16);

            case 20:
              return _context5.finish(13);

            case 21:
              this.streamObservers = this.streamObservers.filter(function (o) {
                return o.component !== component;
              });
              this.contextStreamObservers = this.contextStreamObservers.filter(function (o) {
                return o.component !== component;
              });

              if (component.area == "themes") {
                this.postActiveThemesToAllComponents();
              } //
              // Do soft activate
              //


              return _context5.abrupt("return", new Promise(function (resolve, reject) {
                _this18.$timeout(function () {
                  component.active = true;
                  var _iteratorNormalCompletion30 = true;
                  var _didIteratorError30 = false;
                  var _iteratorError30 = undefined;

                  try {
                    for (var _iterator30 = _this18.handlers[Symbol.iterator](), _step30; !(_iteratorNormalCompletion30 = (_step30 = _iterator30.next()).done); _iteratorNormalCompletion30 = true) {
                      var handler = _step30.value;

                      if (handler.areas.includes(component.area) || handler.areas.includes("*")) {
                        // See comment in activateComponent regarding safeApply and awaitTimeout
                        _this18.$uiRunner(function () {
                          handler.activationHandler && handler.activationHandler(component);
                          resolve();
                        });
                      }
                    }
                  } catch (err) {
                    _didIteratorError30 = true;
                    _iteratorError30 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion30 && _iterator30.return != null) {
                        _iterator30.return();
                      }
                    } finally {
                      if (_didIteratorError30) {
                        throw _iteratorError30;
                      }
                    }
                  }

                  if (!_this18.activeComponents.includes(component)) {
                    _this18.activeComponents.push(component);
                  }

                  if (component.area == "themes") {
                    _this18.postActiveThemesToAllComponents();
                  } // Resolve again in case first resolve in for loop isn't reached.
                  // Should be no effect if resolved twice, only first will be used.


                  resolve();
                });
              }));

            case 25:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this, [[4, 9, 13, 21], [14,, 16, 20]]);
    }
  }, {
    key: "deleteComponent",
    value: function deleteComponent(component) {
      this.modelManager.setItemToBeDeleted(component);
      this.syncManager.sync();
    }
  }, {
    key: "isComponentActive",
    value: function isComponentActive(component) {
      return component.active;
    }
  }, {
    key: "iframeForComponent",
    value: function iframeForComponent(component) {
      for (var _i = 0, _Array$from = Array.from(document.getElementsByTagName("iframe")); _i < _Array$from.length; _i++) {
        var frame = _Array$from[_i];
        var componentId = frame.dataset.componentId;

        if (componentId === component.uuid) {
          return frame;
        }
      }
    }
  }, {
    key: "focusChangedForComponent",
    value: function focusChangedForComponent(component) {
      var focused = document.activeElement == this.iframeForComponent(component);
      var _iteratorNormalCompletion31 = true;
      var _didIteratorError31 = false;
      var _iteratorError31 = undefined;

      try {
        for (var _iterator31 = this.handlers[Symbol.iterator](), _step31; !(_iteratorNormalCompletion31 = (_step31 = _iterator31.next()).done); _iteratorNormalCompletion31 = true) {
          var handler = _step31.value;
          // Notify all handlers, and not just ones that match this component type
          handler.focusHandler && handler.focusHandler(component, focused);
        }
      } catch (err) {
        _didIteratorError31 = true;
        _iteratorError31 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion31 && _iterator31.return != null) {
            _iterator31.return();
          }
        } finally {
          if (_didIteratorError31) {
            throw _iteratorError31;
          }
        }
      }
    }
  }, {
    key: "handleSetSizeEvent",
    value: function handleSetSizeEvent(component, data) {
      var setSize = function setSize(element, size) {
        var widthString = typeof size.width === 'string' ? size.width : "".concat(data.width, "px");
        var heightString = typeof size.height === 'string' ? size.height : "".concat(data.height, "px");

        if (element) {
          element.setAttribute("style", "width:".concat(widthString, "; height:").concat(heightString, ";"));
        }
      };

      if (component.area == "rooms" || component.area == "modal") {
        var selector = component.area == "rooms" ? "inner" : "outer";
        var content = document.getElementById("component-content-".concat(selector, "-").concat(component.uuid));

        if (content) {
          setSize(content, data);
        }
      } else {
        var iframe = this.iframeForComponent(component);

        if (!iframe) {
          return;
        }

        setSize(iframe, data); // On Firefox, resizing a component iframe does not seem to have an effect with editor-stack extensions.
        // Sizing the parent does the trick, however, we can't do this globally, otherwise, areas like the note-tags will
        // not be able to expand outside of the bounds (to display autocomplete, for example).

        if (component.area == "editor-stack") {
          var parent = iframe.parentElement;

          if (parent) {
            setSize(parent, data);
          }
        } // content object in this case is === to the iframe object above. This is probably
        // legacy code from when we would size content and container individually, which we no longer do.
        // var content = document.getElementById(`component-iframe-${component.uuid}`);
        // console.log("content === iframe", content == iframe);
        // if(content) {
        //   setSize(content, data);
        // }

      }
    }
  }, {
    key: "editorForNote",
    value: function editorForNote(note) {
      var editors = this.componentsForArea("editor-editor");
      var _iteratorNormalCompletion32 = true;
      var _didIteratorError32 = false;
      var _iteratorError32 = undefined;

      try {
        for (var _iterator32 = editors[Symbol.iterator](), _step32; !(_iteratorNormalCompletion32 = (_step32 = _iterator32.next()).done); _iteratorNormalCompletion32 = true) {
          var editor = _step32.value;

          if (editor.isExplicitlyEnabledForItem(note)) {
            return editor;
          }
        } // No editor found for note. Use default editor, if note does not prefer system editor

      } catch (err) {
        _didIteratorError32 = true;
        _iteratorError32 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion32 && _iterator32.return != null) {
            _iterator32.return();
          }
        } finally {
          if (_didIteratorError32) {
            throw _iteratorError32;
          }
        }
      }

      if (this.isMobile) {
        if (!note.content.mobilePrefersPlainEditor) {
          return this.getDefaultEditor();
        }
      } else {
        if (!note.getAppDataItem("prefersPlainEditor")) {
          return editors.filter(function (e) {
            return e.isDefaultEditor();
          })[0];
        }
      }
    }
  }, {
    key: "permissionsStringForPermissions",
    value: function permissionsStringForPermissions(permissions, component) {
      var _this19 = this;

      var finalString = "";
      var permissionsCount = permissions.length;

      var addSeparator = function addSeparator(index, length) {
        if (index > 0) {
          if (index == length - 1) {
            if (length == 2) {
              return " and ";
            } else {
              return ", and ";
            }
          } else {
            return ", ";
          }
        }

        return "";
      };

      permissions.forEach(function (permission, index) {
        if (permission.name === "stream-items") {
          var types = permission.content_types.map(function (type) {
            var desc = _this19.modelManager.humanReadableDisplayForContentType(type);

            if (desc) {
              return desc + "s";
            } else {
              return "items of type " + type;
            }
          });
          var typesString = "";

          for (var i = 0; i < types.length; i++) {
            var type = types[i];
            typesString += addSeparator(i, types.length + permissionsCount - index - 1);
            typesString += type;
          }

          finalString += addSeparator(index, permissionsCount);
          finalString += typesString;

          if (types.length >= 2 && index < permissionsCount - 1) {
            // If you have a list of types, and still an additional root-level permission coming up, add a comma
            finalString += ", ";
          }
        } else if (permission.name === "stream-context-item") {
          var mapping = {
            "editor-stack": "working note",
            "note-tags": "working note",
            "editor-editor": "working note"
          };
          finalString += addSeparator(index, permissionsCount, true);
          finalString += mapping[component.area];
        }
      });
      return finalString + ".";
    }
  }, {
    key: "components",
    get: function get() {
      return this.modelManager.allItemsMatchingTypes(["SN|Component", "SN|Theme"]);
    }
  }]);

  return SNComponentManager;
}();

/***/ }),

/***/ "./lib/services/httpManager.js":
/*!*************************************!*\
  !*** ./lib/services/httpManager.js ***!
  \*************************************/
/*! exports provided: SFHttpManager */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SFHttpManager", function() { return SFHttpManager; });
/* harmony import */ var _Lib_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Lib/utils */ "./lib/utils.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }


var SFHttpManager =
/*#__PURE__*/
function () {
  _createClass(SFHttpManager, null, [{
    key: "getApiVersion",
    value: function getApiVersion() {
      // Applicable only to Standard Notes requests. Requests to external acitons should not use this.
      // syncManager and authManager must include this API version as part of its request params.
      return "20190520";
    }
  }]);

  function SFHttpManager(timeout, apiVersion) {
    _classCallCheck(this, SFHttpManager);

    // calling callbacks in a $timeout allows UI to update
    this.$timeout = timeout || setTimeout.bind(Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_0__["getGlobalScope"])());
  }

  _createClass(SFHttpManager, [{
    key: "setJWTRequestHandler",
    value: function setJWTRequestHandler(handler) {
      this.jwtRequestHandler = handler;
    }
  }, {
    key: "setAuthHeadersForRequest",
    value: function setAuthHeadersForRequest(request) {
      var token;
      return regeneratorRuntime.async(function setAuthHeadersForRequest$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return regeneratorRuntime.awrap(this.jwtRequestHandler());

            case 2:
              token = _context.sent;

              if (token) {
                request.setRequestHeader('Authorization', 'Bearer ' + token);
              }

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "postAbsolute",
    value: function postAbsolute(url, params, onsuccess, onerror) {
      return regeneratorRuntime.async(function postAbsolute$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", this.httpRequest("post", url, params, onsuccess, onerror));

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "postAuthenticatedAbsolute",
    value: function postAuthenticatedAbsolute(url, params, onsuccess, onerror) {
      return regeneratorRuntime.async(function postAuthenticatedAbsolute$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt("return", this.httpRequest("post", url, params, onsuccess, onerror, true));

            case 1:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "patchAbsolute",
    value: function patchAbsolute(url, params, onsuccess, onerror) {
      return regeneratorRuntime.async(function patchAbsolute$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", this.httpRequest("patch", url, params, onsuccess, onerror));

            case 1:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "getAbsolute",
    value: function getAbsolute(url, params, onsuccess, onerror) {
      return regeneratorRuntime.async(function getAbsolute$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt("return", this.httpRequest("get", url, params, onsuccess, onerror));

            case 1:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "httpRequest",
    value: function httpRequest(verb, url, params, onsuccess, onerror) {
      var _this = this;

      var authenticated,
          _args7 = arguments;
      return regeneratorRuntime.async(function httpRequest$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              authenticated = _args7.length > 5 && _args7[5] !== undefined ? _args7[5] : false;
              return _context7.abrupt("return", new Promise(function _callee(resolve, reject) {
                var xmlhttp;
                return regeneratorRuntime.async(function _callee$(_context6) {
                  while (1) {
                    switch (_context6.prev = _context6.next) {
                      case 0:
                        xmlhttp = new XMLHttpRequest();

                        xmlhttp.onreadystatechange = function () {
                          if (xmlhttp.readyState == 4) {
                            var response = xmlhttp.responseText;

                            if (response) {
                              try {
                                response = JSON.parse(response);
                              } catch (e) {}
                            }

                            if (xmlhttp.status >= 200 && xmlhttp.status <= 299) {
                              _this.$timeout(function () {
                                onsuccess(response);
                                resolve(response);
                              });
                            } else {
                              console.error("Request error:", response);

                              _this.$timeout(function () {
                                onerror(response, xmlhttp.status);
                                reject(response);
                              });
                            }
                          }
                        };

                        if (verb == "get" && Object.keys(params).length > 0) {
                          url = _this.urlForUrlAndParams(url, params);
                        }

                        xmlhttp.open(verb, url, true);
                        xmlhttp.setRequestHeader('Content-type', 'application/json');

                        if (!authenticated) {
                          _context6.next = 8;
                          break;
                        }

                        _context6.next = 8;
                        return regeneratorRuntime.awrap(_this.setAuthHeadersForRequest(xmlhttp));

                      case 8:
                        if (verb == "post" || verb == "patch") {
                          xmlhttp.send(JSON.stringify(params));
                        } else {
                          xmlhttp.send();
                        }

                      case 9:
                      case "end":
                        return _context6.stop();
                    }
                  }
                });
              }));

            case 2:
            case "end":
              return _context7.stop();
          }
        }
      });
    }
  }, {
    key: "urlForUrlAndParams",
    value: function urlForUrlAndParams(url, params) {
      var keyValueString = Object.keys(params).map(function (key) {
        return key + "=" + encodeURIComponent(params[key]);
      }).join("&");

      if (url.includes("?")) {
        return url + "&" + keyValueString;
      } else {
        return url + "?" + keyValueString;
      }
    }
  }]);

  return SFHttpManager;
}();

/***/ }),

/***/ "./lib/services/migrationManager.js":
/*!******************************************!*\
  !*** ./lib/services/migrationManager.js ***!
  \******************************************/
/*! exports provided: SFMigrationManager */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SFMigrationManager", function() { return SFMigrationManager; });
/* harmony import */ var lodash_pull__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash/pull */ "./node_modules/lodash/pull.js");
/* harmony import */ var lodash_pull__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash_pull__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Services_authManager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @Services/authManager */ "./lib/services/authManager.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }



var SFMigrationManager =
/*#__PURE__*/
function () {
  function SFMigrationManager(modelManager, syncManager, storageManager, authManager) {
    var _this = this;

    _classCallCheck(this, SFMigrationManager);

    this.modelManager = modelManager;
    this.syncManager = syncManager;
    this.storageManager = storageManager;
    this.completionHandlers = [];
    this.loadMigrations(); // The syncManager used to dispatch a param called 'initialSync' in the 'sync:completed' event
    // to let us know of the first sync completion after login.
    // however it was removed as it was deemed to be unreliable (returned wrong value when a single sync request repeats on completion for pagination)
    // We'll now use authManager's events instead

    var didReceiveSignInEvent = false;
    var signInHandler = authManager.addEventHandler(function (event) {
      if (event == _Services_authManager__WEBPACK_IMPORTED_MODULE_1__["SFAuthManager"].DidSignInEvent) {
        didReceiveSignInEvent = true;
      }
    });
    this.receivedLocalDataEvent = syncManager.initialDataLoaded();
    this.syncManager.addEventHandler(function _callee(event, data) {
      var dataLoadedEvent, syncCompleteEvent, completedList, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, migrationName, migration;

      return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              dataLoadedEvent = event == "local-data-loaded";
              syncCompleteEvent = event == "sync:completed";

              if (!(dataLoadedEvent || syncCompleteEvent)) {
                _context.next = 40;
                break;
              }

              if (dataLoadedEvent) {
                _this.receivedLocalDataEvent = true;
              } else if (syncCompleteEvent) {
                _this.receivedSyncCompletedEvent = true;
              } // We want to run pending migrations only after local data has been loaded, and a sync has been completed.


              if (!(_this.receivedLocalDataEvent && _this.receivedSyncCompletedEvent)) {
                _context.next = 40;
                break;
              }

              if (!didReceiveSignInEvent) {
                _context.next = 39;
                break;
              }

              // Reset our collected state about sign in
              didReceiveSignInEvent = false;
              authManager.removeEventHandler(signInHandler); // If initial online sync, clear any completed migrations that occurred while offline,
              // so they can run again now that we have updated user items. Only clear migrations that
              // don't have `runOnlyOnce` set

              _context.next = 10;
              return regeneratorRuntime.awrap(_this.getCompletedMigrations());

            case 10:
              completedList = _context.sent.slice();
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context.prev = 14;
              _iterator = completedList[Symbol.iterator]();

            case 16:
              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                _context.next = 25;
                break;
              }

              migrationName = _step.value;
              _context.next = 20;
              return regeneratorRuntime.awrap(_this.migrationForEncodedName(migrationName));

            case 20:
              migration = _context.sent;

              if (!migration.runOnlyOnce) {
                lodash_pull__WEBPACK_IMPORTED_MODULE_0___default()(_this._completed, migrationName);
              }

            case 22:
              _iteratorNormalCompletion = true;
              _context.next = 16;
              break;

            case 25:
              _context.next = 31;
              break;

            case 27:
              _context.prev = 27;
              _context.t0 = _context["catch"](14);
              _didIteratorError = true;
              _iteratorError = _context.t0;

            case 31:
              _context.prev = 31;
              _context.prev = 32;

              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }

            case 34:
              _context.prev = 34;

              if (!_didIteratorError) {
                _context.next = 37;
                break;
              }

              throw _iteratorError;

            case 37:
              return _context.finish(34);

            case 38:
              return _context.finish(31);

            case 39:
              _this.runPendingMigrations();

            case 40:
            case "end":
              return _context.stop();
          }
        }
      }, null, null, [[14, 27, 31, 39], [32,, 34, 38]]);
    });
  }

  _createClass(SFMigrationManager, [{
    key: "addCompletionHandler",
    value: function addCompletionHandler(handler) {
      this.completionHandlers.push(handler);
    }
  }, {
    key: "removeCompletionHandler",
    value: function removeCompletionHandler(handler) {
      lodash_pull__WEBPACK_IMPORTED_MODULE_0___default()(this.completionHandlers, handler);
    }
  }, {
    key: "migrationForEncodedName",
    value: function migrationForEncodedName(name) {
      var decoded;
      return regeneratorRuntime.async(function migrationForEncodedName$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return regeneratorRuntime.awrap(this.decode(name));

            case 2:
              decoded = _context2.sent;
              return _context2.abrupt("return", this.migrations.find(function (migration) {
                return migration.name == decoded;
              }));

            case 4:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "loadMigrations",
    value: function loadMigrations() {
      this.migrations = this.registeredMigrations();
    }
  }, {
    key: "registeredMigrations",
    value: function registeredMigrations() {// Subclasses should return an array of migrations here.
      // Migrations should have a unique `name`, `content_type`,
      // and `handler`, which is a function that accepts an array of matching items to migration.
    }
  }, {
    key: "runPendingMigrations",
    value: function runPendingMigrations() {
      var pending, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, migration, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, item, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, handler;

      return regeneratorRuntime.async(function runPendingMigrations$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return regeneratorRuntime.awrap(this.getPendingMigrations());

            case 2:
              pending = _context3.sent;
              // run in pre loop, keeping in mind that a migration may be run twice: when offline then again when signing in.
              // we need to reset the items to a new array.
              _iteratorNormalCompletion2 = true;
              _didIteratorError2 = false;
              _iteratorError2 = undefined;
              _context3.prev = 6;

              for (_iterator2 = pending[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                migration = _step2.value;
                migration.items = [];
              }

              _context3.next = 14;
              break;

            case 10:
              _context3.prev = 10;
              _context3.t0 = _context3["catch"](6);
              _didIteratorError2 = true;
              _iteratorError2 = _context3.t0;

            case 14:
              _context3.prev = 14;
              _context3.prev = 15;

              if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                _iterator2.return();
              }

            case 17:
              _context3.prev = 17;

              if (!_didIteratorError2) {
                _context3.next = 20;
                break;
              }

              throw _iteratorError2;

            case 20:
              return _context3.finish(17);

            case 21:
              return _context3.finish(14);

            case 22:
              _iteratorNormalCompletion3 = true;
              _didIteratorError3 = false;
              _iteratorError3 = undefined;
              _context3.prev = 25;
              _iterator3 = this.modelManager.allNondummyItems[Symbol.iterator]();

            case 27:
              if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                _context3.next = 51;
                break;
              }

              item = _step3.value;
              _iteratorNormalCompletion6 = true;
              _didIteratorError6 = false;
              _iteratorError6 = undefined;
              _context3.prev = 32;

              for (_iterator6 = pending[Symbol.iterator](); !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                migration = _step6.value;

                if (item.content_type == migration.content_type) {
                  migration.items.push(item);
                }
              }

              _context3.next = 40;
              break;

            case 36:
              _context3.prev = 36;
              _context3.t1 = _context3["catch"](32);
              _didIteratorError6 = true;
              _iteratorError6 = _context3.t1;

            case 40:
              _context3.prev = 40;
              _context3.prev = 41;

              if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
                _iterator6.return();
              }

            case 43:
              _context3.prev = 43;

              if (!_didIteratorError6) {
                _context3.next = 46;
                break;
              }

              throw _iteratorError6;

            case 46:
              return _context3.finish(43);

            case 47:
              return _context3.finish(40);

            case 48:
              _iteratorNormalCompletion3 = true;
              _context3.next = 27;
              break;

            case 51:
              _context3.next = 57;
              break;

            case 53:
              _context3.prev = 53;
              _context3.t2 = _context3["catch"](25);
              _didIteratorError3 = true;
              _iteratorError3 = _context3.t2;

            case 57:
              _context3.prev = 57;
              _context3.prev = 58;

              if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
                _iterator3.return();
              }

            case 60:
              _context3.prev = 60;

              if (!_didIteratorError3) {
                _context3.next = 63;
                break;
              }

              throw _iteratorError3;

            case 63:
              return _context3.finish(60);

            case 64:
              return _context3.finish(57);

            case 65:
              _iteratorNormalCompletion4 = true;
              _didIteratorError4 = false;
              _iteratorError4 = undefined;
              _context3.prev = 68;
              _iterator4 = pending[Symbol.iterator]();

            case 70:
              if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                _context3.next = 81;
                break;
              }

              migration = _step4.value;

              if (!(migration.items && migration.items.length > 0 || migration.customHandler)) {
                _context3.next = 77;
                break;
              }

              _context3.next = 75;
              return regeneratorRuntime.awrap(this.runMigration(migration, migration.items));

            case 75:
              _context3.next = 78;
              break;

            case 77:
              this.markMigrationCompleted(migration);

            case 78:
              _iteratorNormalCompletion4 = true;
              _context3.next = 70;
              break;

            case 81:
              _context3.next = 87;
              break;

            case 83:
              _context3.prev = 83;
              _context3.t3 = _context3["catch"](68);
              _didIteratorError4 = true;
              _iteratorError4 = _context3.t3;

            case 87:
              _context3.prev = 87;
              _context3.prev = 88;

              if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
                _iterator4.return();
              }

            case 90:
              _context3.prev = 90;

              if (!_didIteratorError4) {
                _context3.next = 93;
                break;
              }

              throw _iteratorError4;

            case 93:
              return _context3.finish(90);

            case 94:
              return _context3.finish(87);

            case 95:
              _iteratorNormalCompletion5 = true;
              _didIteratorError5 = false;
              _iteratorError5 = undefined;
              _context3.prev = 98;

              for (_iterator5 = this.completionHandlers[Symbol.iterator](); !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                handler = _step5.value;
                handler();
              }

              _context3.next = 106;
              break;

            case 102:
              _context3.prev = 102;
              _context3.t4 = _context3["catch"](98);
              _didIteratorError5 = true;
              _iteratorError5 = _context3.t4;

            case 106:
              _context3.prev = 106;
              _context3.prev = 107;

              if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
                _iterator5.return();
              }

            case 109:
              _context3.prev = 109;

              if (!_didIteratorError5) {
                _context3.next = 112;
                break;
              }

              throw _iteratorError5;

            case 112:
              return _context3.finish(109);

            case 113:
              return _context3.finish(106);

            case 114:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this, [[6, 10, 14, 22], [15,, 17, 21], [25, 53, 57, 65], [32, 36, 40, 48], [41,, 43, 47], [58,, 60, 64], [68, 83, 87, 95], [88,, 90, 94], [98, 102, 106, 114], [107,, 109, 113]]);
    }
  }, {
    key: "encode",
    value: function encode(text) {
      return regeneratorRuntime.async(function encode$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", window.btoa(text));

            case 1:
            case "end":
              return _context4.stop();
          }
        }
      });
    }
  }, {
    key: "decode",
    value: function decode(text) {
      return regeneratorRuntime.async(function decode$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt("return", window.atob(text));

            case 1:
            case "end":
              return _context5.stop();
          }
        }
      });
    }
  }, {
    key: "getCompletedMigrations",
    value: function getCompletedMigrations() {
      var rawCompleted;
      return regeneratorRuntime.async(function getCompletedMigrations$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              if (this._completed) {
                _context6.next = 5;
                break;
              }

              _context6.next = 3;
              return regeneratorRuntime.awrap(this.storageManager.getItem("migrations"));

            case 3:
              rawCompleted = _context6.sent;

              if (rawCompleted) {
                this._completed = JSON.parse(rawCompleted);
              } else {
                this._completed = [];
              }

            case 5:
              return _context6.abrupt("return", this._completed);

            case 6:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "getPendingMigrations",
    value: function getPendingMigrations() {
      var completed, pending, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, migration;

      return regeneratorRuntime.async(function getPendingMigrations$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return regeneratorRuntime.awrap(this.getCompletedMigrations());

            case 2:
              completed = _context7.sent;
              pending = [];
              _iteratorNormalCompletion7 = true;
              _didIteratorError7 = false;
              _iteratorError7 = undefined;
              _context7.prev = 7;
              _iterator7 = this.migrations[Symbol.iterator]();

            case 9:
              if (_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done) {
                _context7.next = 22;
                break;
              }

              migration = _step7.value;
              _context7.t0 = completed;
              _context7.next = 14;
              return regeneratorRuntime.awrap(this.encode(migration.name));

            case 14:
              _context7.t1 = _context7.sent;
              _context7.t2 = _context7.t0.indexOf.call(_context7.t0, _context7.t1);
              _context7.t3 = -1;

              if (!(_context7.t2 == _context7.t3)) {
                _context7.next = 19;
                break;
              }

              pending.push(migration);

            case 19:
              _iteratorNormalCompletion7 = true;
              _context7.next = 9;
              break;

            case 22:
              _context7.next = 28;
              break;

            case 24:
              _context7.prev = 24;
              _context7.t4 = _context7["catch"](7);
              _didIteratorError7 = true;
              _iteratorError7 = _context7.t4;

            case 28:
              _context7.prev = 28;
              _context7.prev = 29;

              if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
                _iterator7.return();
              }

            case 31:
              _context7.prev = 31;

              if (!_didIteratorError7) {
                _context7.next = 34;
                break;
              }

              throw _iteratorError7;

            case 34:
              return _context7.finish(31);

            case 35:
              return _context7.finish(28);

            case 36:
              return _context7.abrupt("return", pending);

            case 37:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this, [[7, 24, 28, 36], [29,, 31, 35]]);
    }
  }, {
    key: "markMigrationCompleted",
    value: function markMigrationCompleted(migration) {
      var completed;
      return regeneratorRuntime.async(function markMigrationCompleted$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return regeneratorRuntime.awrap(this.getCompletedMigrations());

            case 2:
              completed = _context8.sent;
              _context8.t0 = completed;
              _context8.next = 6;
              return regeneratorRuntime.awrap(this.encode(migration.name));

            case 6:
              _context8.t1 = _context8.sent;

              _context8.t0.push.call(_context8.t0, _context8.t1);

              this.storageManager.setItem("migrations", JSON.stringify(completed));
              migration.running = false;

            case 10:
            case "end":
              return _context8.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "runMigration",
    value: function runMigration(migration, items) {
      var _this2 = this;

      return regeneratorRuntime.async(function runMigration$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              if (!migration.running) {
                _context9.next = 2;
                break;
              }

              return _context9.abrupt("return");

            case 2:
              console.log("Running migration:", migration.name);
              migration.running = true;

              if (!migration.customHandler) {
                _context9.next = 8;
                break;
              }

              return _context9.abrupt("return", migration.customHandler().then(function () {
                _this2.markMigrationCompleted(migration);
              }));

            case 8:
              return _context9.abrupt("return", migration.handler(items).then(function () {
                _this2.markMigrationCompleted(migration);
              }));

            case 9:
            case "end":
              return _context9.stop();
          }
        }
      });
    }
  }]);

  return SFMigrationManager;
}();

/***/ }),

/***/ "./lib/services/modelManager.js":
/*!**************************************!*\
  !*** ./lib/services/modelManager.js ***!
  \**************************************/
/*! exports provided: SFModelManager */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SFModelManager", function() { return SFModelManager; });
/* harmony import */ var lodash_remove__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash/remove */ "./node_modules/lodash/remove.js");
/* harmony import */ var lodash_remove__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash_remove__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash_find__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash/find */ "./node_modules/lodash/find.js");
/* harmony import */ var lodash_find__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash_find__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash_includes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash/includes */ "./node_modules/lodash/includes.js");
/* harmony import */ var lodash_includes__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash_includes__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _Protocol_manager__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Protocol/manager */ "./lib/protocol/manager.js");
/* harmony import */ var _Models_core_item__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Models/core/item */ "./lib/models/core/item.js");
/* harmony import */ var _Models_core_keys__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @Models/core/keys */ "./lib/models/core/keys.js");
/* harmony import */ var _Models_core_predicate__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @Models/core/predicate */ "./lib/models/core/predicate.js");
/* harmony import */ var _Models_app_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @Models/app/component */ "./lib/models/app/component.js");
/* harmony import */ var _Models_app_editor__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @Models/app/editor */ "./lib/models/app/editor.js");
/* harmony import */ var _Models_app_extension__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @Models/app/extension */ "./lib/models/app/extension.js");
/* harmony import */ var _Models_app_note__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @Models/app/note */ "./lib/models/app/note.js");
/* harmony import */ var _Models_app_tag__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @Models/app/tag */ "./lib/models/app/tag.js");
/* harmony import */ var _Models_privileges_privileges__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @Models/privileges/privileges */ "./lib/models/privileges/privileges.js");
/* harmony import */ var _Models_server_mfa__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @Models/server/mfa */ "./lib/models/server/mfa.js");
/* harmony import */ var _Models_server_serverExtension__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @Models/server/serverExtension */ "./lib/models/server/serverExtension.js");
/* harmony import */ var _Models_subclasses_smartTag__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @Models/subclasses/smartTag */ "./lib/models/subclasses/smartTag.js");
/* harmony import */ var _Models_subclasses_theme__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @Models/subclasses/theme */ "./lib/models/subclasses/theme.js");
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }


















var SFModelManager =
/*#__PURE__*/
function () {
  function SFModelManager(timeout) {
    _classCallCheck(this, SFModelManager);

    SFModelManager.MappingSourceRemoteRetrieved = "MappingSourceRemoteRetrieved";
    SFModelManager.MappingSourceRemoteSaved = "MappingSourceRemoteSaved";
    SFModelManager.MappingSourceLocalSaved = "MappingSourceLocalSaved";
    SFModelManager.MappingSourceLocalRetrieved = "MappingSourceLocalRetrieved";
    SFModelManager.MappingSourceLocalDirtied = "MappingSourceLocalDirtied";
    SFModelManager.MappingSourceComponentRetrieved = "MappingSourceComponentRetrieved";
    SFModelManager.MappingSourceDesktopInstalled = "MappingSourceDesktopInstalled"; // When a component is installed by the desktop and some of its values change

    SFModelManager.MappingSourceRemoteActionRetrieved = "MappingSourceRemoteActionRetrieved";
    /* aciton-based Extensions like note history */

    SFModelManager.MappingSourceFileImport = "MappingSourceFileImport";
    SFModelManager.ContentTypeClassMapping = {
      "Note": _Models_app_note__WEBPACK_IMPORTED_MODULE_10__["SNNote"],
      "Tag": _Models_app_tag__WEBPACK_IMPORTED_MODULE_11__["SNTag"],
      "SN|Keys": _Models_core_keys__WEBPACK_IMPORTED_MODULE_5__["SNKeys"],
      "SN|SmartTag": _Models_subclasses_smartTag__WEBPACK_IMPORTED_MODULE_15__["SNSmartTag"],
      "Extension": _Models_app_extension__WEBPACK_IMPORTED_MODULE_9__["SNExtension"],
      "SN|Editor": _Models_app_editor__WEBPACK_IMPORTED_MODULE_8__["SNEditor"],
      "SN|Theme": _Models_subclasses_theme__WEBPACK_IMPORTED_MODULE_16__["SNTheme"],
      "SN|Component": _Models_app_component__WEBPACK_IMPORTED_MODULE_7__["SNComponent"],
      "SF|Extension": _Models_server_serverExtension__WEBPACK_IMPORTED_MODULE_14__["SNServerExtension"],
      "SF|MFA": _Models_server_mfa__WEBPACK_IMPORTED_MODULE_13__["SNMfa"],
      "SN|Privileges": _Models_privileges_privileges__WEBPACK_IMPORTED_MODULE_12__["SFPrivileges"]
    };

    SFModelManager.isMappingSourceRetrieved = function (source) {
      return [SFModelManager.MappingSourceRemoteRetrieved, SFModelManager.MappingSourceComponentRetrieved, SFModelManager.MappingSourceRemoteActionRetrieved].includes(source);
    };

    this.$timeout = timeout || setTimeout.bind(window);
    this.itemSyncObservers = [];
    this.items = [];
    this.itemsHash = {};
    this.missedReferences = {};
    this.uuidChangeObservers = [];
  }

  _createClass(SFModelManager, [{
    key: "handleSignout",
    value: function handleSignout() {
      this.items.length = 0;
      this.itemsHash = {};
      this.missedReferences = {};
    }
  }, {
    key: "addModelUuidChangeObserver",
    value: function addModelUuidChangeObserver(id, callback) {
      this.uuidChangeObservers.push({
        id: id,
        callback: callback
      });
    }
  }, {
    key: "notifyObserversOfUuidChange",
    value: function notifyObserversOfUuidChange(oldItem, newItem) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.uuidChangeObservers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var observer = _step.value;

          try {
            observer.callback(oldItem, newItem);
          } catch (e) {
            console.error("Notify observers of uuid change exception:", e);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "alternateUUIDForItem",
    value: function alternateUUIDForItem(item) {
      var newItem, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, referencingObject;

      return regeneratorRuntime.async(function alternateUUIDForItem$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              // We need to clone this item and give it a new uuid, then delete item with old uuid from db (you can't modify uuid's in our indexeddb setup)
              newItem = this.createItem(item);
              _context.next = 3;
              return regeneratorRuntime.awrap(_Protocol_manager__WEBPACK_IMPORTED_MODULE_3__["protocolManager"].crypto.generateUUID());

            case 3:
              newItem.uuid = _context.sent;
              // Update uuids of relationships
              newItem.informReferencesOfUUIDChange(item.uuid, newItem.uuid);
              this.informModelsOfUUIDChangeForItem(newItem, item.uuid, newItem.uuid); // the new item should inherit the original's relationships

              _iteratorNormalCompletion2 = true;
              _didIteratorError2 = false;
              _iteratorError2 = undefined;
              _context.prev = 9;

              for (_iterator2 = item.referencingObjects[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                referencingObject = _step2.value;
                referencingObject.setIsNoLongerBeingReferencedBy(item);
                item.setIsNoLongerBeingReferencedBy(referencingObject);
                referencingObject.addItemAsRelationship(newItem);
              }

              _context.next = 17;
              break;

            case 13:
              _context.prev = 13;
              _context.t0 = _context["catch"](9);
              _didIteratorError2 = true;
              _iteratorError2 = _context.t0;

            case 17:
              _context.prev = 17;
              _context.prev = 18;

              if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                _iterator2.return();
              }

            case 20:
              _context.prev = 20;

              if (!_didIteratorError2) {
                _context.next = 23;
                break;
              }

              throw _iteratorError2;

            case 23:
              return _context.finish(20);

            case 24:
              return _context.finish(17);

            case 25:
              this.setItemsDirty(item.referencingObjects, true); // Used to set up referencingObjects for new item (so that other items can now properly reference this new item)

              this.resolveReferencesForItem(newItem);

              if (this.loggingEnabled) {
                console.log(item.uuid, "-->", newItem.uuid);
              } // Set to deleted, then run through mapping function so that observers can be notified


              item.deleted = true;
              item.content.references = []; // Don't set dirty, because we don't need to sync old item. alternating uuid only occurs in two cases:
              // signing in and merging offline data, or when a uuid-conflict occurs. In both cases, the original item never
              // saves to a server, so doesn't need to be synced.
              // informModelsOfUUIDChangeForItem may set this object to dirty, but we want to undo that here, so that the item gets deleted
              // right away through the mapping function.

              this.setItemDirty(item, false, false, SFModelManager.MappingSourceLocalSaved);
              _context.next = 33;
              return regeneratorRuntime.awrap(this.mapResponseItemsToLocalModels([item], SFModelManager.MappingSourceLocalSaved));

            case 33:
              // add new item
              this.addItem(newItem);
              this.setItemDirty(newItem, true, true, SFModelManager.MappingSourceLocalSaved);
              this.notifyObserversOfUuidChange(item, newItem);
              return _context.abrupt("return", newItem);

            case 37:
            case "end":
              return _context.stop();
          }
        }
      }, null, this, [[9, 13, 17, 25], [18,, 20, 24]]);
    }
  }, {
    key: "informModelsOfUUIDChangeForItem",
    value: function informModelsOfUUIDChangeForItem(newItem, oldUUID, newUUID) {
      // some models that only have one-way relationships might be interested to hear that an item has changed its uuid
      // for example, editors have a one way relationship with notes. When a note changes its UUID, it has no way to inform the editor
      // to update its relationships
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.items[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var model = _step3.value;
          model.potentialItemOfInterestHasChangedItsUUID(newItem, oldUUID, newUUID);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }, {
    key: "didSyncModelsOffline",
    value: function didSyncModelsOffline(items) {
      this.notifySyncObserversOfModels(items, SFModelManager.MappingSourceLocalSaved);
    }
  }, {
    key: "mapResponseItemsToLocalModels",
    value: function mapResponseItemsToLocalModels(items, source, sourceKey) {
      return regeneratorRuntime.async(function mapResponseItemsToLocalModels$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", this.mapResponseItemsToLocalModelsWithOptions({
                items: items,
                source: source,
                sourceKey: sourceKey
              }));

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "mapResponseItemsToLocalModelsOmittingFields",
    value: function mapResponseItemsToLocalModelsOmittingFields(items, omitFields, source, sourceKey) {
      return regeneratorRuntime.async(function mapResponseItemsToLocalModelsOmittingFields$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt("return", this.mapResponseItemsToLocalModelsWithOptions({
                items: items,
                omitFields: omitFields,
                source: source,
                sourceKey: sourceKey
              }));

            case 1:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "mapResponseItemsToLocalModelsWithOptions",
    value: function mapResponseItemsToLocalModelsWithOptions(_ref) {
      var items, omitFields, source, sourceKey, options, models, processedObjects, modelsToNotifyObserversOf, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, json_obj, isMissingContent, isCorrupt, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, key, item, contentType, unknownContentType, isDirtyItemPendingDelete, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, _step5$value, index, _json_obj, model, missedRefs, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _loop, _iterator6, _step6;

      return regeneratorRuntime.async(function mapResponseItemsToLocalModelsWithOptions$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              items = _ref.items, omitFields = _ref.omitFields, source = _ref.source, sourceKey = _ref.sourceKey, options = _ref.options;
              models = [], processedObjects = [], modelsToNotifyObserversOf = []; // first loop should add and process items

              _iteratorNormalCompletion4 = true;
              _didIteratorError4 = false;
              _iteratorError4 = undefined;
              _context4.prev = 5;
              _iterator4 = items[Symbol.iterator]();

            case 7:
              if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                _context4.next = 58;
                break;
              }

              json_obj = _step4.value;

              if (json_obj) {
                _context4.next = 11;
                break;
              }

              return _context4.abrupt("continue", 55);

            case 11:
              // content is missing if it has been sucessfullly decrypted but no content
              isMissingContent = !json_obj.content && !json_obj.errorDecrypting;
              isCorrupt = !json_obj.content_type || !json_obj.uuid;

              if (!((isCorrupt || isMissingContent) && !json_obj.deleted)) {
                _context4.next = 16;
                break;
              }

              // An item that is not deleted should never have empty content
              console.error("Server response item is corrupt:", json_obj);
              return _context4.abrupt("continue", 55);

            case 16:
              if (!Array.isArray(omitFields)) {
                _context4.next = 36;
                break;
              }

              _iteratorNormalCompletion7 = true;
              _didIteratorError7 = false;
              _iteratorError7 = undefined;
              _context4.prev = 20;

              for (_iterator7 = omitFields[Symbol.iterator](); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                key = _step7.value;
                delete json_obj[key];
              }

              _context4.next = 28;
              break;

            case 24:
              _context4.prev = 24;
              _context4.t0 = _context4["catch"](20);
              _didIteratorError7 = true;
              _iteratorError7 = _context4.t0;

            case 28:
              _context4.prev = 28;
              _context4.prev = 29;

              if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
                _iterator7.return();
              }

            case 31:
              _context4.prev = 31;

              if (!_didIteratorError7) {
                _context4.next = 34;
                break;
              }

              throw _iteratorError7;

            case 34:
              return _context4.finish(31);

            case 35:
              return _context4.finish(28);

            case 36:
              item = this.findItem(json_obj.uuid);

              if (item) {
                item.updateFromJSON(json_obj); // If an item goes through mapping, it can no longer be a dummy.

                item.dummy = false;
              }

              contentType = json_obj["content_type"] || item && item.content_type;
              unknownContentType = this.acceptableContentTypes && !this.acceptableContentTypes.includes(contentType);

              if (!unknownContentType) {
                _context4.next = 42;
                break;
              }

              return _context4.abrupt("continue", 55);

            case 42:
              isDirtyItemPendingDelete = false;

              if (!(json_obj.deleted == true)) {
                _context4.next = 50;
                break;
              }

              if (!json_obj.dirty) {
                _context4.next = 48;
                break;
              }

              // Item was marked as deleted but not yet synced (in offline scenario)
              // We need to create this item as usual, but just not add it to individual arrays
              // i.e add to this.items but not this.notes (so that it can be retrieved with getDirtyItems)
              isDirtyItemPendingDelete = true;
              _context4.next = 50;
              break;

            case 48:
              if (item) {
                // We still want to return this item to the caller so they know it was handled.
                models.push(item);
                modelsToNotifyObserversOf.push(item);
                this.removeItemLocally(item);
              }

              return _context4.abrupt("continue", 55);

            case 50:
              if (!item) {
                item = this.createItem(json_obj);
              }

              this.addItem(item, isDirtyItemPendingDelete); // Observers do not need to handle items that errored while decrypting.

              if (!item.errorDecrypting) {
                modelsToNotifyObserversOf.push(item);
              }

              models.push(item);
              processedObjects.push(json_obj);

            case 55:
              _iteratorNormalCompletion4 = true;
              _context4.next = 7;
              break;

            case 58:
              _context4.next = 64;
              break;

            case 60:
              _context4.prev = 60;
              _context4.t1 = _context4["catch"](5);
              _didIteratorError4 = true;
              _iteratorError4 = _context4.t1;

            case 64:
              _context4.prev = 64;
              _context4.prev = 65;

              if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
                _iterator4.return();
              }

            case 67:
              _context4.prev = 67;

              if (!_didIteratorError4) {
                _context4.next = 70;
                break;
              }

              throw _iteratorError4;

            case 70:
              return _context4.finish(67);

            case 71:
              return _context4.finish(64);

            case 72:
              // second loop should process references
              _iteratorNormalCompletion5 = true;
              _didIteratorError5 = false;
              _iteratorError5 = undefined;
              _context4.prev = 75;

              for (_iterator5 = processedObjects.entries()[Symbol.iterator](); !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                _step5$value = _slicedToArray(_step5.value, 2), index = _step5$value[0], _json_obj = _step5$value[1];
                model = models[index];

                if (_json_obj.content) {
                  this.resolveReferencesForItem(model);
                }

                model.didFinishSyncing();
              }

              _context4.next = 83;
              break;

            case 79:
              _context4.prev = 79;
              _context4.t2 = _context4["catch"](75);
              _didIteratorError5 = true;
              _iteratorError5 = _context4.t2;

            case 83:
              _context4.prev = 83;
              _context4.prev = 84;

              if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
                _iterator5.return();
              }

            case 86:
              _context4.prev = 86;

              if (!_didIteratorError5) {
                _context4.next = 89;
                break;
              }

              throw _iteratorError5;

            case 89:
              return _context4.finish(86);

            case 90:
              return _context4.finish(83);

            case 91:
              missedRefs = this.popMissedReferenceStructsForObjects(processedObjects);
              _iteratorNormalCompletion6 = true;
              _didIteratorError6 = false;
              _iteratorError6 = undefined;
              _context4.prev = 95;

              _loop = function _loop() {
                var ref = _step6.value;
                var model = models.find(function (candidate) {
                  return candidate.uuid == ref.reference_uuid;
                }); // Model should 100% be defined here, but let's not be too overconfident

                if (model) {
                  var itemWaitingForTheValueInThisCurrentLoop = ref.for_item;
                  itemWaitingForTheValueInThisCurrentLoop.addItemAsRelationship(model);
                }
              };

              for (_iterator6 = missedRefs[Symbol.iterator](); !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                _loop();
              }

              _context4.next = 104;
              break;

            case 100:
              _context4.prev = 100;
              _context4.t3 = _context4["catch"](95);
              _didIteratorError6 = true;
              _iteratorError6 = _context4.t3;

            case 104:
              _context4.prev = 104;
              _context4.prev = 105;

              if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
                _iterator6.return();
              }

            case 107:
              _context4.prev = 107;

              if (!_didIteratorError6) {
                _context4.next = 110;
                break;
              }

              throw _iteratorError6;

            case 110:
              return _context4.finish(107);

            case 111:
              return _context4.finish(104);

            case 112:
              _context4.next = 114;
              return regeneratorRuntime.awrap(this.notifySyncObserversOfModels(modelsToNotifyObserversOf, source, sourceKey));

            case 114:
              return _context4.abrupt("return", models);

            case 115:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this, [[5, 60, 64, 72], [20, 24, 28, 36], [29,, 31, 35], [65,, 67, 71], [75, 79, 83, 91], [84,, 86, 90], [95, 100, 104, 112], [105,, 107, 111]]);
    }
  }, {
    key: "missedReferenceBuildKey",
    value: function missedReferenceBuildKey(referenceId, objectId) {
      return "".concat(referenceId, ":").concat(objectId);
    }
  }, {
    key: "popMissedReferenceStructsForObjects",
    value: function popMissedReferenceStructsForObjects(objects) {
      if (!objects || objects.length == 0) {
        return [];
      }

      var results = [];
      var toDelete = [];
      var uuids = objects.map(function (item) {
        return item.uuid;
      });
      var genericUuidLength = uuids[0].length;
      var keys = Object.keys(this.missedReferences);

      for (var _i2 = 0, _keys = keys; _i2 < _keys.length; _i2++) {
        var candidateKey = _keys[_i2];

        /*
        We used to do string.split to get at the UUID, but surprisingly,
        the performance of this was about 20x worse then just getting the substring.
         let matches = candidateKey.split(":")[0] == object.uuid;
        */
        var matches = uuids.includes(candidateKey.substring(0, genericUuidLength));

        if (matches) {
          results.push(this.missedReferences[candidateKey]);
          toDelete.push(candidateKey);
        }
      } // remove from hash


      for (var _i3 = 0, _toDelete = toDelete; _i3 < _toDelete.length; _i3++) {
        var key = _toDelete[_i3];
        delete this.missedReferences[key];
      }

      return results;
    }
  }, {
    key: "resolveReferencesForItem",
    value: function resolveReferencesForItem(item) {
      var markReferencesDirty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (item.errorDecrypting) {
        return;
      }

      var contentObject = item.contentObject; // If another client removes an item's references, this client won't pick up the removal unless
      // we remove everything not present in the current list of references

      item.updateLocalRelationships();

      if (!contentObject.references) {
        return;
      }

      var references = contentObject.references.slice(); // make copy, references will be modified in array

      var referencesIds = references.map(function (ref) {
        return ref.uuid;
      });
      var includeBlanks = true;
      var referencesObjectResults = this.findItems(referencesIds, includeBlanks);
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = referencesObjectResults.entries()[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var _step8$value = _slicedToArray(_step8.value, 2),
              index = _step8$value[0],
              referencedItem = _step8$value[1];

          if (referencedItem) {
            item.addItemAsRelationship(referencedItem);

            if (markReferencesDirty) {
              this.setItemDirty(referencedItem, true);
            }
          } else {
            var missingRefId = referencesIds[index]; // Allows mapper to check when missing reference makes it through the loop,
            // and then runs resolveReferencesForItem again for the original item.

            var mappingKey = this.missedReferenceBuildKey(missingRefId, item.uuid);

            if (!this.missedReferences[mappingKey]) {
              var missedRef = {
                reference_uuid: missingRefId,
                for_item: item
              };
              this.missedReferences[mappingKey] = missedRef;
            }
          }
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8.return != null) {
            _iterator8.return();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }
    }
    /* Note that this function is public, and can also be called manually (desktopManager uses it) */

  }, {
    key: "notifySyncObserversOfModels",
    value: function notifySyncObserversOfModels(models, source, sourceKey) {
      var _this = this;

      var observers, _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _loop2, _iterator9, _step9;

      return regeneratorRuntime.async(function notifySyncObserversOfModels$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              // Make sure `let` is used in the for loops instead of `var`, as we will be using a timeout below.
              observers = this.itemSyncObservers.sort(function (a, b) {
                // sort by priority
                return a.priority < b.priority ? -1 : 1;
              });
              _iteratorNormalCompletion9 = true;
              _didIteratorError9 = false;
              _iteratorError9 = undefined;
              _context6.prev = 4;

              _loop2 = function _loop2() {
                var observer, allRelevantItems, validItems, deletedItems, _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, item;

                return regeneratorRuntime.async(function _loop2$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        observer = _step9.value;
                        allRelevantItems = observer.types.includes("*") ? models : models.filter(function (item) {
                          return observer.types.includes(item.content_type);
                        });
                        validItems = [], deletedItems = [];
                        _iteratorNormalCompletion10 = true;
                        _didIteratorError10 = false;
                        _iteratorError10 = undefined;
                        _context5.prev = 6;

                        for (_iterator10 = allRelevantItems[Symbol.iterator](); !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                          item = _step10.value;

                          if (item.deleted) {
                            deletedItems.push(item);
                          } else {
                            validItems.push(item);
                          }
                        }

                        _context5.next = 14;
                        break;

                      case 10:
                        _context5.prev = 10;
                        _context5.t0 = _context5["catch"](6);
                        _didIteratorError10 = true;
                        _iteratorError10 = _context5.t0;

                      case 14:
                        _context5.prev = 14;
                        _context5.prev = 15;

                        if (!_iteratorNormalCompletion10 && _iterator10.return != null) {
                          _iterator10.return();
                        }

                      case 17:
                        _context5.prev = 17;

                        if (!_didIteratorError10) {
                          _context5.next = 20;
                          break;
                        }

                        throw _iteratorError10;

                      case 20:
                        return _context5.finish(17);

                      case 21:
                        return _context5.finish(14);

                      case 22:
                        if (!(allRelevantItems.length > 0)) {
                          _context5.next = 25;
                          break;
                        }

                        _context5.next = 25;
                        return regeneratorRuntime.awrap(_this._callSyncObserverCallbackWithTimeout(observer, allRelevantItems, validItems, deletedItems, source, sourceKey));

                      case 25:
                      case "end":
                        return _context5.stop();
                    }
                  }
                }, null, null, [[6, 10, 14, 22], [15,, 17, 21]]);
              };

              _iterator9 = observers[Symbol.iterator]();

            case 7:
              if (_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done) {
                _context6.next = 13;
                break;
              }

              _context6.next = 10;
              return regeneratorRuntime.awrap(_loop2());

            case 10:
              _iteratorNormalCompletion9 = true;
              _context6.next = 7;
              break;

            case 13:
              _context6.next = 19;
              break;

            case 15:
              _context6.prev = 15;
              _context6.t0 = _context6["catch"](4);
              _didIteratorError9 = true;
              _iteratorError9 = _context6.t0;

            case 19:
              _context6.prev = 19;
              _context6.prev = 20;

              if (!_iteratorNormalCompletion9 && _iterator9.return != null) {
                _iterator9.return();
              }

            case 22:
              _context6.prev = 22;

              if (!_didIteratorError9) {
                _context6.next = 25;
                break;
              }

              throw _iteratorError9;

            case 25:
              return _context6.finish(22);

            case 26:
              return _context6.finish(19);

            case 27:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this, [[4, 15, 19, 27], [20,, 22, 26]]);
    }
    /*
      Rather than running this inline in a for loop, which causes problems and requires all variables to be declared with `let`,
      we'll do it here so it's more explicit and less confusing.
     */

  }, {
    key: "_callSyncObserverCallbackWithTimeout",
    value: function _callSyncObserverCallbackWithTimeout(observer, allRelevantItems, validItems, deletedItems, source, sourceKey) {
      var _this2 = this;

      return regeneratorRuntime.async(function _callSyncObserverCallbackWithTimeout$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              return _context7.abrupt("return", new Promise(function (resolve, reject) {
                _this2.$timeout(function () {
                  try {
                    observer.callback(allRelevantItems, validItems, deletedItems, source, sourceKey);
                  } catch (e) {
                    console.error("Sync observer exception", e);
                  } finally {
                    resolve();
                  }
                });
              }));

            case 1:
            case "end":
              return _context7.stop();
          }
        }
      });
    } // When a client sets an item as dirty, it means its values has changed, and everyone should know about it.
    // Particularly extensions. For example, if you edit the title of a note, extensions won't be notified until the save sync completes.
    // With this, they'll be notified immediately.

  }, {
    key: "setItemDirty",
    value: function setItemDirty(item) {
      var dirty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var updateClientDate = arguments.length > 2 ? arguments[2] : undefined;
      var source = arguments.length > 3 ? arguments[3] : undefined;
      var sourceKey = arguments.length > 4 ? arguments[4] : undefined;
      this.setItemsDirty([item], dirty, updateClientDate, source, sourceKey);
    }
  }, {
    key: "setItemsDirty",
    value: function setItemsDirty(items) {
      var dirty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var updateClientDate = arguments.length > 2 ? arguments[2] : undefined;
      var source = arguments.length > 3 ? arguments[3] : undefined;
      var sourceKey = arguments.length > 4 ? arguments[4] : undefined;
      var _iteratorNormalCompletion11 = true;
      var _didIteratorError11 = false;
      var _iteratorError11 = undefined;

      try {
        for (var _iterator11 = items[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
          var item = _step11.value;
          item.setDirty(dirty, updateClientDate);
        }
      } catch (err) {
        _didIteratorError11 = true;
        _iteratorError11 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion11 && _iterator11.return != null) {
            _iterator11.return();
          }
        } finally {
          if (_didIteratorError11) {
            throw _iteratorError11;
          }
        }
      }

      this.notifySyncObserversOfModels(items, source || SFModelManager.MappingSourceLocalDirtied, sourceKey);
    }
  }, {
    key: "createItem",
    value: function createItem(json_obj) {
      var itemClass = SFModelManager.ContentTypeClassMapping && SFModelManager.ContentTypeClassMapping[json_obj.content_type];

      if (!itemClass) {
        itemClass = _Models_core_item__WEBPACK_IMPORTED_MODULE_4__["SFItem"];
      }

      var item = new itemClass(json_obj);
      return item;
    }
    /*
      Be sure itemResponse is a generic Javascript object, and not an Item.
      An Item needs to collapse its properties into its content object before it can be duplicated.
      Note: the reason we need this function is specificallty for the call to resolveReferencesForItem.
      This method creates but does not add the item to the global inventory. It's used by syncManager
      to check if this prospective duplicate item is identical to another item, including the references.
     */

  }, {
    key: "createDuplicateItemFromResponseItem",
    value: function createDuplicateItemFromResponseItem(itemResponse) {
      var itemResponseCopy, duplicate;
      return regeneratorRuntime.async(function createDuplicateItemFromResponseItem$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              if (!(typeof itemResponse.setDirty === 'function')) {
                _context8.next = 3;
                break;
              }

              // You should never pass in objects here, as we will modify the itemResponse's uuid below (update: we now make a copy of input value).
              console.error("Attempting to create conflicted copy of non-response item.");
              return _context8.abrupt("return", null);

            case 3:
              // Make a copy so we don't modify input value.
              itemResponseCopy = JSON.parse(JSON.stringify(itemResponse));
              _context8.next = 6;
              return regeneratorRuntime.awrap(_Protocol_manager__WEBPACK_IMPORTED_MODULE_3__["protocolManager"].crypto.generateUUID());

            case 6:
              itemResponseCopy.uuid = _context8.sent;
              duplicate = this.createItem(itemResponseCopy);
              return _context8.abrupt("return", duplicate);

            case 9:
            case "end":
              return _context8.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "duplicateItemAndAddAsConflict",
    value: function duplicateItemAndAddAsConflict(duplicateOf) {
      return this.duplicateItemWithCustomContentAndAddAsConflict({
        content: duplicateOf.content,
        duplicateOf: duplicateOf
      });
    }
  }, {
    key: "duplicateItemWithCustomContentAndAddAsConflict",
    value: function duplicateItemWithCustomContentAndAddAsConflict(_ref2) {
      var content = _ref2.content,
          duplicateOf = _ref2.duplicateOf;
      var copy = this.duplicateItemWithCustomContent({
        content: content,
        duplicateOf: duplicateOf
      });
      this.addDuplicatedItemAsConflict({
        duplicate: copy,
        duplicateOf: duplicateOf
      });
      return copy;
    }
  }, {
    key: "addDuplicatedItemAsConflict",
    value: function addDuplicatedItemAsConflict(_ref3) {
      var duplicate = _ref3.duplicate,
          duplicateOf = _ref3.duplicateOf;
      this.addDuplicatedItem(duplicate, duplicateOf);
      duplicate.content.conflict_of = duplicateOf.uuid;
    }
  }, {
    key: "duplicateItemWithCustomContent",
    value: function duplicateItemWithCustomContent(_ref4) {
      var content = _ref4.content,
          duplicateOf = _ref4.duplicateOf;
      var copy = new duplicateOf.constructor({
        content: content
      });
      copy.created_at = duplicateOf.created_at;

      if (!copy.content_type) {
        copy.content_type = duplicateOf.content_type;
      }

      return copy;
    }
  }, {
    key: "duplicateItemAndAdd",
    value: function duplicateItemAndAdd(item) {
      var copy = this.duplicateItemWithoutAdding(item);
      this.addDuplicatedItem(copy, item);
      return copy;
    }
  }, {
    key: "duplicateItemWithoutAdding",
    value: function duplicateItemWithoutAdding(item) {
      var copy = new item.constructor({
        content: item.content
      });
      copy.created_at = item.created_at;

      if (!copy.content_type) {
        copy.content_type = item.content_type;
      }

      return copy;
    }
  }, {
    key: "addDuplicatedItem",
    value: function addDuplicatedItem(duplicate, original) {
      this.addItem(duplicate); // the duplicate should inherit the original's relationships

      var _iteratorNormalCompletion12 = true;
      var _didIteratorError12 = false;
      var _iteratorError12 = undefined;

      try {
        for (var _iterator12 = original.referencingObjects[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
          var referencingObject = _step12.value;
          referencingObject.addItemAsRelationship(duplicate);
          this.setItemDirty(referencingObject, true);
        }
      } catch (err) {
        _didIteratorError12 = true;
        _iteratorError12 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion12 && _iterator12.return != null) {
            _iterator12.return();
          }
        } finally {
          if (_didIteratorError12) {
            throw _iteratorError12;
          }
        }
      }

      this.resolveReferencesForItem(duplicate);
      this.setItemDirty(duplicate, true);
    }
  }, {
    key: "addItem",
    value: function addItem(item) {
      var globalOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.addItems([item], globalOnly);
    }
  }, {
    key: "addItems",
    value: function addItems(items) {
      var _this3 = this;

      var globalOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      items.forEach(function (item) {
        if (!_this3.itemsHash[item.uuid]) {
          _this3.itemsHash[item.uuid] = item;

          _this3.items.push(item);
        }
      });
    }
    /* Notifies observers when an item has been synced or mapped from a remote response */

  }, {
    key: "addItemSyncObserver",
    value: function addItemSyncObserver(id, types, callback) {
      this.addItemSyncObserverWithPriority({
        id: id,
        types: types,
        callback: callback,
        priority: 1
      });
    }
  }, {
    key: "addItemSyncObserverWithPriority",
    value: function addItemSyncObserverWithPriority(_ref5) {
      var id = _ref5.id,
          priority = _ref5.priority,
          types = _ref5.types,
          callback = _ref5.callback;

      if (!Array.isArray(types)) {
        types = [types];
      }

      this.itemSyncObservers.push({
        id: id,
        types: types,
        priority: priority,
        callback: callback
      });
    }
  }, {
    key: "removeItemSyncObserver",
    value: function removeItemSyncObserver(id) {
      lodash_remove__WEBPACK_IMPORTED_MODULE_0___default()(this.itemSyncObservers, lodash_find__WEBPACK_IMPORTED_MODULE_1___default()(this.itemSyncObservers, {
        id: id
      }));
    }
  }, {
    key: "getDirtyItems",
    value: function getDirtyItems() {
      return this.items.filter(function (item) {
        // An item that has an error decrypting can be synced only if it is being deleted.
        // Otherwise, we don't want to send corrupt content up to the server.
        return item.dirty == true && !item.dummy && (!item.errorDecrypting || item.deleted);
      });
    }
  }, {
    key: "clearDirtyItems",
    value: function clearDirtyItems(items) {
      var _iteratorNormalCompletion13 = true;
      var _didIteratorError13 = false;
      var _iteratorError13 = undefined;

      try {
        for (var _iterator13 = items[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
          var item = _step13.value;
          item.setDirty(false);
        }
      } catch (err) {
        _didIteratorError13 = true;
        _iteratorError13 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion13 && _iterator13.return != null) {
            _iterator13.return();
          }
        } finally {
          if (_didIteratorError13) {
            throw _iteratorError13;
          }
        }
      }
    }
  }, {
    key: "removeAndDirtyAllRelationshipsForItem",
    value: function removeAndDirtyAllRelationshipsForItem(item) {
      // Handle direct relationships
      // An item with errorDecrypting will not have valid content field
      if (!item.errorDecrypting) {
        var _iteratorNormalCompletion14 = true;
        var _didIteratorError14 = false;
        var _iteratorError14 = undefined;

        try {
          for (var _iterator14 = item.content.references[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
            var reference = _step14.value;
            var relationship = this.findItem(reference.uuid);

            if (relationship) {
              item.removeItemAsRelationship(relationship);

              if (relationship.hasRelationshipWithItem(item)) {
                relationship.removeItemAsRelationship(item);
                this.setItemDirty(relationship, true);
              }
            }
          }
        } catch (err) {
          _didIteratorError14 = true;
          _iteratorError14 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion14 && _iterator14.return != null) {
              _iterator14.return();
            }
          } finally {
            if (_didIteratorError14) {
              throw _iteratorError14;
            }
          }
        }
      } // Handle indirect relationships


      var _iteratorNormalCompletion15 = true;
      var _didIteratorError15 = false;
      var _iteratorError15 = undefined;

      try {
        for (var _iterator15 = item.referencingObjects[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
          var object = _step15.value;
          object.removeItemAsRelationship(item);
          this.setItemDirty(object, true);
        }
      } catch (err) {
        _didIteratorError15 = true;
        _iteratorError15 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion15 && _iterator15.return != null) {
            _iterator15.return();
          }
        } finally {
          if (_didIteratorError15) {
            throw _iteratorError15;
          }
        }
      }

      item.referencingObjects = [];
    }
    /* Used when changing encryption key */

  }, {
    key: "setAllItemsDirty",
    value: function setAllItemsDirty() {
      var relevantItems = this.allItems;
      this.setItemsDirty(relevantItems, true);
    }
  }, {
    key: "setItemToBeDeleted",
    value: function setItemToBeDeleted(item) {
      item.deleted = true;

      if (!item.dummy) {
        this.setItemDirty(item, true);
      }

      this.removeAndDirtyAllRelationshipsForItem(item);
    }
  }, {
    key: "removeItemLocally",
    value: function removeItemLocally(item) {
      return regeneratorRuntime.async(function removeItemLocally$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              lodash_remove__WEBPACK_IMPORTED_MODULE_0___default()(this.items, {
                uuid: item.uuid
              });
              delete this.itemsHash[item.uuid];
              item.isBeingRemovedLocally();

            case 3:
            case "end":
              return _context9.stop();
          }
        }
      }, null, this);
    }
    /* Searching */

  }, {
    key: "allItemsMatchingTypes",
    value: function allItemsMatchingTypes(contentTypes) {
      return this.allItems.filter(function (item) {
        return (lodash_includes__WEBPACK_IMPORTED_MODULE_2___default()(contentTypes, item.content_type) || lodash_includes__WEBPACK_IMPORTED_MODULE_2___default()(contentTypes, "*")) && !item.dummy;
      });
    }
  }, {
    key: "invalidItems",
    value: function invalidItems() {
      return this.allItems.filter(function (item) {
        return item.errorDecrypting;
      });
    }
  }, {
    key: "validItemsForContentType",
    value: function validItemsForContentType(contentType) {
      return this.allItems.filter(function (item) {
        return item.content_type == contentType && !item.errorDecrypting;
      });
    }
  }, {
    key: "findItem",
    value: function findItem(itemId) {
      return this.itemsHash[itemId];
    }
  }, {
    key: "findItems",
    value: function findItems(ids) {
      var includeBlanks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var results = [];
      var _iteratorNormalCompletion16 = true;
      var _didIteratorError16 = false;
      var _iteratorError16 = undefined;

      try {
        for (var _iterator16 = ids[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
          var id = _step16.value;
          var item = this.itemsHash[id];

          if (item || includeBlanks) {
            results.push(item);
          }
        }
      } catch (err) {
        _didIteratorError16 = true;
        _iteratorError16 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion16 && _iterator16.return != null) {
            _iterator16.return();
          }
        } finally {
          if (_didIteratorError16) {
            throw _iteratorError16;
          }
        }
      }

      return results;
    }
  }, {
    key: "itemsMatchingPredicate",
    value: function itemsMatchingPredicate(predicate) {
      return this.itemsMatchingPredicates([predicate]);
    }
  }, {
    key: "itemsMatchingPredicates",
    value: function itemsMatchingPredicates(predicates) {
      return this.filterItemsWithPredicates(this.allItems, predicates);
    }
  }, {
    key: "filterItemsWithPredicates",
    value: function filterItemsWithPredicates(items, predicates) {
      var results = items.filter(function (item) {
        var _iteratorNormalCompletion17 = true;
        var _didIteratorError17 = false;
        var _iteratorError17 = undefined;

        try {
          for (var _iterator17 = predicates[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
            var predicate = _step17.value;

            if (!item.satisfiesPredicate(predicate)) {
              return false;
            }
          }
        } catch (err) {
          _didIteratorError17 = true;
          _iteratorError17 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion17 && _iterator17.return != null) {
              _iterator17.return();
            }
          } finally {
            if (_didIteratorError17) {
              throw _iteratorError17;
            }
          }
        }

        return true;
      });
      return results;
    }
    /*
    Archives
    */

  }, {
    key: "importItems",
    value: function importItems(externalItems) {
      var itemsToBeMapped, localValues, _iteratorNormalCompletion18, _didIteratorError18, _iteratorError18, _iterator18, _step18, itemData, localItem, frozenValue, _iteratorNormalCompletion19, _didIteratorError19, _iteratorError19, _iterator19, _step19, _itemData, _localValues$_itemDat, _frozenValue, itemRef, duplicate, items, _iteratorNormalCompletion20, _didIteratorError20, _iteratorError20, _iterator20, _step20, item;

      return regeneratorRuntime.async(function importItems$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              itemsToBeMapped = []; // Get local values before doing any processing. This way, if a note change below modifies a tag,
              // and the tag is going to be iterated on in the same loop, then we don't want this change to be compared
              // to the local value.

              localValues = {};
              _iteratorNormalCompletion18 = true;
              _didIteratorError18 = false;
              _iteratorError18 = undefined;
              _context10.prev = 5;
              _iterator18 = externalItems[Symbol.iterator]();

            case 7:
              if (_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done) {
                _context10.next = 18;
                break;
              }

              itemData = _step18.value;
              localItem = this.findItem(itemData.uuid);

              if (localItem) {
                _context10.next = 13;
                break;
              }

              localValues[itemData.uuid] = {};
              return _context10.abrupt("continue", 15);

            case 13:
              frozenValue = this.duplicateItemWithoutAdding(localItem);
              localValues[itemData.uuid] = {
                frozenValue: frozenValue,
                itemRef: localItem
              };

            case 15:
              _iteratorNormalCompletion18 = true;
              _context10.next = 7;
              break;

            case 18:
              _context10.next = 24;
              break;

            case 20:
              _context10.prev = 20;
              _context10.t0 = _context10["catch"](5);
              _didIteratorError18 = true;
              _iteratorError18 = _context10.t0;

            case 24:
              _context10.prev = 24;
              _context10.prev = 25;

              if (!_iteratorNormalCompletion18 && _iterator18.return != null) {
                _iterator18.return();
              }

            case 27:
              _context10.prev = 27;

              if (!_didIteratorError18) {
                _context10.next = 30;
                break;
              }

              throw _iteratorError18;

            case 30:
              return _context10.finish(27);

            case 31:
              return _context10.finish(24);

            case 32:
              _iteratorNormalCompletion19 = true;
              _didIteratorError19 = false;
              _iteratorError19 = undefined;
              _context10.prev = 35;
              _iterator19 = externalItems[Symbol.iterator]();

            case 37:
              if (_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done) {
                _context10.next = 52;
                break;
              }

              _itemData = _step19.value;
              _localValues$_itemDat = localValues[_itemData.uuid], _frozenValue = _localValues$_itemDat.frozenValue, itemRef = _localValues$_itemDat.itemRef;

              if (!(_frozenValue && !itemRef.errorDecrypting)) {
                _context10.next = 47;
                break;
              }

              _context10.next = 43;
              return regeneratorRuntime.awrap(this.createDuplicateItemFromResponseItem(_itemData));

            case 43:
              duplicate = _context10.sent;

              if (!_itemData.deleted && !_frozenValue.isItemContentEqualWith(duplicate)) {
                // Data differs
                this.addDuplicatedItemAsConflict({
                  duplicate: duplicate,
                  duplicateOf: itemRef
                });
                itemsToBeMapped.push(duplicate);
              }

              _context10.next = 49;
              break;

            case 47:
              // it doesn't exist, push it into items to be mapped
              itemsToBeMapped.push(_itemData);

              if (itemRef && itemRef.errorDecrypting) {
                itemRef.errorDecrypting = false;
              }

            case 49:
              _iteratorNormalCompletion19 = true;
              _context10.next = 37;
              break;

            case 52:
              _context10.next = 58;
              break;

            case 54:
              _context10.prev = 54;
              _context10.t1 = _context10["catch"](35);
              _didIteratorError19 = true;
              _iteratorError19 = _context10.t1;

            case 58:
              _context10.prev = 58;
              _context10.prev = 59;

              if (!_iteratorNormalCompletion19 && _iterator19.return != null) {
                _iterator19.return();
              }

            case 61:
              _context10.prev = 61;

              if (!_didIteratorError19) {
                _context10.next = 64;
                break;
              }

              throw _iteratorError19;

            case 64:
              return _context10.finish(61);

            case 65:
              return _context10.finish(58);

            case 66:
              _context10.next = 68;
              return regeneratorRuntime.awrap(this.mapResponseItemsToLocalModels(itemsToBeMapped, SFModelManager.MappingSourceFileImport));

            case 68:
              items = _context10.sent;
              _iteratorNormalCompletion20 = true;
              _didIteratorError20 = false;
              _iteratorError20 = undefined;
              _context10.prev = 72;

              for (_iterator20 = items[Symbol.iterator](); !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
                item = _step20.value;
                this.setItemDirty(item, true, false);
                item.deleted = false;
              }

              _context10.next = 80;
              break;

            case 76:
              _context10.prev = 76;
              _context10.t2 = _context10["catch"](72);
              _didIteratorError20 = true;
              _iteratorError20 = _context10.t2;

            case 80:
              _context10.prev = 80;
              _context10.prev = 81;

              if (!_iteratorNormalCompletion20 && _iterator20.return != null) {
                _iterator20.return();
              }

            case 83:
              _context10.prev = 83;

              if (!_didIteratorError20) {
                _context10.next = 86;
                break;
              }

              throw _iteratorError20;

            case 86:
              return _context10.finish(83);

            case 87:
              return _context10.finish(80);

            case 88:
              return _context10.abrupt("return", items);

            case 89:
            case "end":
              return _context10.stop();
          }
        }
      }, null, this, [[5, 20, 24, 32], [25,, 27, 31], [35, 54, 58, 66], [59,, 61, 65], [72, 76, 80, 88], [81,, 83, 87]]);
    }
  }, {
    key: "getAllItemsJSONData",
    value: function getAllItemsJSONData(keys, authParams, returnNullIfEmpty) {
      return regeneratorRuntime.async(function getAllItemsJSONData$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              return _context11.abrupt("return", this.getJSONDataForItems(this.allItems, keys, authParams, returnNullIfEmpty));

            case 1:
            case "end":
              return _context11.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "getJSONDataForItems",
    value: function getJSONDataForItems(items, keys, authParams, returnNullIfEmpty) {
      return regeneratorRuntime.async(function getJSONDataForItems$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              return _context12.abrupt("return", Promise.all(items.map(function (item) {
                var itemParams = new SFItemParams(item, keys, authParams);
                return itemParams.paramsForExportFile();
              })).then(function (items) {
                if (returnNullIfEmpty && items.length == 0) {
                  return null;
                }

                var data = {
                  items: items
                };

                if (keys) {
                  // auth params are only needed when encrypted with a standard notes key
                  data["auth_params"] = authParams;
                }

                return JSON.stringify(data, null, 2
                /* pretty print */
                );
              }));

            case 1:
            case "end":
              return _context12.stop();
          }
        }
      });
    }
  }, {
    key: "computeDataIntegrityHash",
    value: function computeDataIntegrityHash() {
      var items, dates, string, hash;
      return regeneratorRuntime.async(function computeDataIntegrityHash$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.prev = 0;
              items = this.allNondummyItems.sort(function (a, b) {
                return b.updated_at - a.updated_at;
              });
              dates = items.map(function (item) {
                return item.updatedAtTimestamp();
              });
              string = dates.join(",");
              _context13.next = 6;
              return regeneratorRuntime.awrap(_Protocol_manager__WEBPACK_IMPORTED_MODULE_3__["protocolManager"].crypto.sha256(string));

            case 6:
              hash = _context13.sent;
              return _context13.abrupt("return", hash);

            case 10:
              _context13.prev = 10;
              _context13.t0 = _context13["catch"](0);
              console.error("Error computing data integrity hash", _context13.t0);
              return _context13.abrupt("return", null);

            case 14:
            case "end":
              return _context13.stop();
          }
        }
      }, null, this, [[0, 10]]);
    }
  }, {
    key: "allItems",
    get: function get() {
      return this.items.slice();
    }
  }, {
    key: "allNondummyItems",
    get: function get() {
      return this.items.filter(function (item) {
        return !item.dummy;
      });
    }
  }]);

  return SFModelManager;
}();

/***/ }),

/***/ "./lib/services/privileges/privilegesManager.js":
/*!******************************************************!*\
  !*** ./lib/services/privileges/privilegesManager.js ***!
  \******************************************************/
/*! exports provided: SFPrivilegesManager */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SFPrivilegesManager", function() { return SFPrivilegesManager; });
/* harmony import */ var _Protocol_manager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Protocol/manager */ "./lib/protocol/manager.js");
/* harmony import */ var _Models_privileges_privileges__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @Models/privileges/privileges */ "./lib/models/privileges/privileges.js");
/* harmony import */ var _Models_core_predicate__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @Models/core/predicate */ "./lib/models/core/predicate.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }




var SFPrivilegesManager =
/*#__PURE__*/
function () {
  function SFPrivilegesManager(modelManager, syncManager, singletonManager) {
    _classCallCheck(this, SFPrivilegesManager);

    this.modelManager = modelManager;
    this.syncManager = syncManager;
    this.singletonManager = singletonManager;
    this.loadPrivileges();
    SFPrivilegesManager.CredentialAccountPassword = "CredentialAccountPassword";
    SFPrivilegesManager.CredentialLocalPasscode = "CredentialLocalPasscode";
    SFPrivilegesManager.ActionManageExtensions = "ActionManageExtensions";
    SFPrivilegesManager.ActionManageBackups = "ActionManageBackups";
    SFPrivilegesManager.ActionViewProtectedNotes = "ActionViewProtectedNotes";
    SFPrivilegesManager.ActionManagePrivileges = "ActionManagePrivileges";
    SFPrivilegesManager.ActionManagePasscode = "ActionManagePasscode";
    SFPrivilegesManager.ActionDeleteNote = "ActionDeleteNote";
    SFPrivilegesManager.SessionExpiresAtKey = "SessionExpiresAtKey";
    SFPrivilegesManager.SessionLengthKey = "SessionLengthKey";
    SFPrivilegesManager.SessionLengthNone = 0;
    SFPrivilegesManager.SessionLengthFiveMinutes = 300;
    SFPrivilegesManager.SessionLengthOneHour = 3600;
    SFPrivilegesManager.SessionLengthOneWeek = 604800;
    this.availableActions = [SFPrivilegesManager.ActionViewProtectedNotes, SFPrivilegesManager.ActionDeleteNote, SFPrivilegesManager.ActionManagePasscode, SFPrivilegesManager.ActionManageBackups, SFPrivilegesManager.ActionManageExtensions, SFPrivilegesManager.ActionManagePrivileges];
    this.availableCredentials = [SFPrivilegesManager.CredentialAccountPassword, SFPrivilegesManager.CredentialLocalPasscode];
    this.sessionLengths = [SFPrivilegesManager.SessionLengthNone, SFPrivilegesManager.SessionLengthFiveMinutes, SFPrivilegesManager.SessionLengthOneHour, SFPrivilegesManager.SessionLengthOneWeek, SFPrivilegesManager.SessionLengthIndefinite];
  }
  /*
  async delegate.isOffline()
  async delegate.hasLocalPasscode()
  async delegate.saveToStorage(key, value)
  async delegate.getFromStorage(key)
  async delegate.verifyAccountPassword
  async delegate.verifyLocalPasscode
  */


  _createClass(SFPrivilegesManager, [{
    key: "setDelegate",
    value: function setDelegate(delegate) {
      this.delegate = delegate;
    }
  }, {
    key: "getAvailableActions",
    value: function getAvailableActions() {
      return this.availableActions;
    }
  }, {
    key: "getAvailableCredentials",
    value: function getAvailableCredentials() {
      return this.availableCredentials;
    }
  }, {
    key: "netCredentialsForAction",
    value: function netCredentialsForAction(action) {
      var credentials, netCredentials, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, cred, isOffline, hasLocalPasscode;

      return regeneratorRuntime.async(function netCredentialsForAction$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return regeneratorRuntime.awrap(this.getPrivileges());

            case 2:
              _context.t0 = action;
              credentials = _context.sent.getCredentialsForAction(_context.t0);
              netCredentials = [];
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context.prev = 8;
              _iterator = credentials[Symbol.iterator]();

            case 10:
              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                _context.next = 27;
                break;
              }

              cred = _step.value;

              if (!(cred == SFPrivilegesManager.CredentialAccountPassword)) {
                _context.next = 19;
                break;
              }

              _context.next = 15;
              return regeneratorRuntime.awrap(this.delegate.isOffline());

            case 15:
              isOffline = _context.sent;

              if (!isOffline) {
                netCredentials.push(cred);
              }

              _context.next = 24;
              break;

            case 19:
              if (!(cred == SFPrivilegesManager.CredentialLocalPasscode)) {
                _context.next = 24;
                break;
              }

              _context.next = 22;
              return regeneratorRuntime.awrap(this.delegate.hasLocalPasscode());

            case 22:
              hasLocalPasscode = _context.sent;

              if (hasLocalPasscode) {
                netCredentials.push(cred);
              }

            case 24:
              _iteratorNormalCompletion = true;
              _context.next = 10;
              break;

            case 27:
              _context.next = 33;
              break;

            case 29:
              _context.prev = 29;
              _context.t1 = _context["catch"](8);
              _didIteratorError = true;
              _iteratorError = _context.t1;

            case 33:
              _context.prev = 33;
              _context.prev = 34;

              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }

            case 36:
              _context.prev = 36;

              if (!_didIteratorError) {
                _context.next = 39;
                break;
              }

              throw _iteratorError;

            case 39:
              return _context.finish(36);

            case 40:
              return _context.finish(33);

            case 41:
              return _context.abrupt("return", netCredentials);

            case 42:
            case "end":
              return _context.stop();
          }
        }
      }, null, this, [[8, 29, 33, 41], [34,, 36, 40]]);
    }
  }, {
    key: "loadPrivileges",
    value: function loadPrivileges() {
      var _this = this;

      return regeneratorRuntime.async(function loadPrivileges$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (!this.loadPromise) {
                _context3.next = 2;
                break;
              }

              return _context3.abrupt("return", this.loadPromise);

            case 2:
              this.loadPromise = new Promise(function (resolve, reject) {
                var privsContentType = _Models_privileges_privileges__WEBPACK_IMPORTED_MODULE_1__["SFPrivileges"].contentType();
                var contentTypePredicate = new _Models_core_predicate__WEBPACK_IMPORTED_MODULE_2__["SFPredicate"]("content_type", "=", privsContentType);

                _this.singletonManager.registerSingleton([contentTypePredicate], function (resolvedSingleton) {
                  _this.privileges = resolvedSingleton;
                  resolve(resolvedSingleton);
                }, function _callee(valueCallback) {
                  var privs;
                  return regeneratorRuntime.async(function _callee$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          // Safe to create. Create and return object.
                          privs = new _Models_privileges_privileges__WEBPACK_IMPORTED_MODULE_1__["SFPrivileges"]({
                            content_type: privsContentType
                          });

                          if (_Protocol_manager__WEBPACK_IMPORTED_MODULE_0__["protocolManager"].crypto.generateUUIDSync) {
                            _context2.next = 4;
                            break;
                          }

                          _context2.next = 4;
                          return regeneratorRuntime.awrap(privs.initUUID());

                        case 4:
                          _this.modelManager.addItem(privs);

                          _this.modelManager.setItemDirty(privs, true);

                          _this.syncManager.sync();

                          valueCallback(privs);
                          resolve(privs);

                        case 9:
                        case "end":
                          return _context2.stop();
                      }
                    }
                  });
                });
              });
              return _context3.abrupt("return", this.loadPromise);

            case 4:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "getPrivileges",
    value: function getPrivileges() {
      return regeneratorRuntime.async(function getPrivileges$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (!this.privileges) {
                _context4.next = 4;
                break;
              }

              return _context4.abrupt("return", this.privileges);

            case 4:
              return _context4.abrupt("return", this.loadPrivileges());

            case 5:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "displayInfoForCredential",
    value: function displayInfoForCredential(credential) {
      var metadata = {};
      metadata[SFPrivilegesManager.CredentialAccountPassword] = {
        label: "Account Password",
        prompt: "Please enter your account password."
      };
      metadata[SFPrivilegesManager.CredentialLocalPasscode] = {
        label: "Local Passcode",
        prompt: "Please enter your local passcode."
      };
      return metadata[credential];
    }
  }, {
    key: "displayInfoForAction",
    value: function displayInfoForAction(action) {
      var metadata = {};
      metadata[SFPrivilegesManager.ActionManageExtensions] = {
        label: "Manage Extensions"
      };
      metadata[SFPrivilegesManager.ActionManageBackups] = {
        label: "Download/Import Backups"
      };
      metadata[SFPrivilegesManager.ActionViewProtectedNotes] = {
        label: "View Protected Notes"
      };
      metadata[SFPrivilegesManager.ActionManagePrivileges] = {
        label: "Manage Privileges"
      };
      metadata[SFPrivilegesManager.ActionManagePasscode] = {
        label: "Manage Passcode"
      };
      metadata[SFPrivilegesManager.ActionDeleteNote] = {
        label: "Delete Notes"
      };
      return metadata[action];
    }
  }, {
    key: "getSessionLengthOptions",
    value: function getSessionLengthOptions() {
      return [{
        value: SFPrivilegesManager.SessionLengthNone,
        label: "Don't Remember"
      }, {
        value: SFPrivilegesManager.SessionLengthFiveMinutes,
        label: "5 Minutes"
      }, {
        value: SFPrivilegesManager.SessionLengthOneHour,
        label: "1 Hour"
      }, {
        value: SFPrivilegesManager.SessionLengthOneWeek,
        label: "1 Week"
      }];
    }
  }, {
    key: "setSessionLength",
    value: function setSessionLength(length) {
      var addToNow, expiresAt;
      return regeneratorRuntime.async(function setSessionLength$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              addToNow = function addToNow(seconds) {
                var date = new Date();
                date.setSeconds(date.getSeconds() + seconds);
                return date;
              };

              expiresAt = addToNow(length);
              return _context5.abrupt("return", Promise.all([this.delegate.saveToStorage(SFPrivilegesManager.SessionExpiresAtKey, JSON.stringify(expiresAt)), this.delegate.saveToStorage(SFPrivilegesManager.SessionLengthKey, JSON.stringify(length))]));

            case 3:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "clearSession",
    value: function clearSession() {
      return regeneratorRuntime.async(function clearSession$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              return _context6.abrupt("return", this.setSessionLength(SFPrivilegesManager.SessionLengthNone));

            case 1:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "getSelectedSessionLength",
    value: function getSelectedSessionLength() {
      var length;
      return regeneratorRuntime.async(function getSelectedSessionLength$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return regeneratorRuntime.awrap(this.delegate.getFromStorage(SFPrivilegesManager.SessionLengthKey));

            case 2:
              length = _context7.sent;

              if (!length) {
                _context7.next = 7;
                break;
              }

              return _context7.abrupt("return", JSON.parse(length));

            case 7:
              return _context7.abrupt("return", SFPrivilegesManager.SessionLengthNone);

            case 8:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "getSessionExpirey",
    value: function getSessionExpirey() {
      var expiresAt;
      return regeneratorRuntime.async(function getSessionExpirey$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return regeneratorRuntime.awrap(this.delegate.getFromStorage(SFPrivilegesManager.SessionExpiresAtKey));

            case 2:
              expiresAt = _context8.sent;

              if (!expiresAt) {
                _context8.next = 7;
                break;
              }

              return _context8.abrupt("return", new Date(JSON.parse(expiresAt)));

            case 7:
              return _context8.abrupt("return", new Date());

            case 8:
            case "end":
              return _context8.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "actionHasPrivilegesConfigured",
    value: function actionHasPrivilegesConfigured(action) {
      return regeneratorRuntime.async(function actionHasPrivilegesConfigured$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return regeneratorRuntime.awrap(this.netCredentialsForAction(action));

            case 2:
              _context9.t0 = _context9.sent.length;
              return _context9.abrupt("return", _context9.t0 > 0);

            case 4:
            case "end":
              return _context9.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "actionRequiresPrivilege",
    value: function actionRequiresPrivilege(action) {
      var expiresAt, netCredentials;
      return regeneratorRuntime.async(function actionRequiresPrivilege$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return regeneratorRuntime.awrap(this.getSessionExpirey());

            case 2:
              expiresAt = _context10.sent;

              if (!(expiresAt > new Date())) {
                _context10.next = 5;
                break;
              }

              return _context10.abrupt("return", false);

            case 5:
              _context10.next = 7;
              return regeneratorRuntime.awrap(this.netCredentialsForAction(action));

            case 7:
              netCredentials = _context10.sent;
              return _context10.abrupt("return", netCredentials.length > 0);

            case 9:
            case "end":
              return _context10.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "savePrivileges",
    value: function savePrivileges() {
      var privs;
      return regeneratorRuntime.async(function savePrivileges$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return regeneratorRuntime.awrap(this.getPrivileges());

            case 2:
              privs = _context11.sent;
              this.modelManager.setItemDirty(privs, true);
              this.syncManager.sync();

            case 5:
            case "end":
              return _context11.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "authenticateAction",
    value: function authenticateAction(action, credentialAuthMapping) {
      var requiredCredentials, successfulCredentials, failedCredentials, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, requiredCredential, passesAuth;

      return regeneratorRuntime.async(function authenticateAction$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _context12.next = 2;
              return regeneratorRuntime.awrap(this.netCredentialsForAction(action));

            case 2:
              requiredCredentials = _context12.sent;
              successfulCredentials = [], failedCredentials = [];
              _iteratorNormalCompletion2 = true;
              _didIteratorError2 = false;
              _iteratorError2 = undefined;
              _context12.prev = 7;
              _iterator2 = requiredCredentials[Symbol.iterator]();

            case 9:
              if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                _context12.next = 18;
                break;
              }

              requiredCredential = _step2.value;
              _context12.next = 13;
              return regeneratorRuntime.awrap(this._verifyAuthenticationParameters(requiredCredential, credentialAuthMapping[requiredCredential]));

            case 13:
              passesAuth = _context12.sent;

              if (passesAuth) {
                successfulCredentials.push(requiredCredential);
              } else {
                failedCredentials.push(requiredCredential);
              }

            case 15:
              _iteratorNormalCompletion2 = true;
              _context12.next = 9;
              break;

            case 18:
              _context12.next = 24;
              break;

            case 20:
              _context12.prev = 20;
              _context12.t0 = _context12["catch"](7);
              _didIteratorError2 = true;
              _iteratorError2 = _context12.t0;

            case 24:
              _context12.prev = 24;
              _context12.prev = 25;

              if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                _iterator2.return();
              }

            case 27:
              _context12.prev = 27;

              if (!_didIteratorError2) {
                _context12.next = 30;
                break;
              }

              throw _iteratorError2;

            case 30:
              return _context12.finish(27);

            case 31:
              return _context12.finish(24);

            case 32:
              return _context12.abrupt("return", {
                success: failedCredentials.length == 0,
                successfulCredentials: successfulCredentials,
                failedCredentials: failedCredentials
              });

            case 33:
            case "end":
              return _context12.stop();
          }
        }
      }, null, this, [[7, 20, 24, 32], [25,, 27, 31]]);
    }
  }, {
    key: "_verifyAuthenticationParameters",
    value: function _verifyAuthenticationParameters(credential, value) {
      var _this2 = this;

      var verifyAccountPassword, verifyLocalPasscode;
      return regeneratorRuntime.async(function _verifyAuthenticationParameters$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              verifyAccountPassword = function verifyAccountPassword(password) {
                return regeneratorRuntime.async(function verifyAccountPassword$(_context13) {
                  while (1) {
                    switch (_context13.prev = _context13.next) {
                      case 0:
                        return _context13.abrupt("return", _this2.delegate.verifyAccountPassword(password));

                      case 1:
                      case "end":
                        return _context13.stop();
                    }
                  }
                });
              };

              verifyLocalPasscode = function verifyLocalPasscode(passcode) {
                return regeneratorRuntime.async(function verifyLocalPasscode$(_context14) {
                  while (1) {
                    switch (_context14.prev = _context14.next) {
                      case 0:
                        return _context14.abrupt("return", _this2.delegate.verifyLocalPasscode(passcode));

                      case 1:
                      case "end":
                        return _context14.stop();
                    }
                  }
                });
              };

              if (!(credential == SFPrivilegesManager.CredentialAccountPassword)) {
                _context15.next = 6;
                break;
              }

              return _context15.abrupt("return", verifyAccountPassword(value));

            case 6:
              if (!(credential == SFPrivilegesManager.CredentialLocalPasscode)) {
                _context15.next = 8;
                break;
              }

              return _context15.abrupt("return", verifyLocalPasscode(value));

            case 8:
            case "end":
              return _context15.stop();
          }
        }
      });
    }
  }]);

  return SFPrivilegesManager;
}();

/***/ }),

/***/ "./lib/services/session_history/sessionHistoryManager.js":
/*!***************************************************************!*\
  !*** ./lib/services/session_history/sessionHistoryManager.js ***!
  \***************************************************************/
/*! exports provided: SFSessionHistoryManager */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SFSessionHistoryManager", function() { return SFSessionHistoryManager; });
/* harmony import */ var _Protocol_manager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Protocol/manager */ "./lib/protocol/manager.js");
/* harmony import */ var _Services_modelManager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @Services/modelManager */ "./lib/services/modelManager.js");
/* harmony import */ var _Models_core_itemParams__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @Models/core/itemParams */ "./lib/models/core/itemParams.js");
/* harmony import */ var _Models_session_history_historySession__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Models/session_history/historySession */ "./lib/models/session_history/historySession.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }





var SessionHistoryPersistKey = "sessionHistory_persist";
var SessionHistoryRevisionsKey = "sessionHistory_revisions";
var SessionHistoryAutoOptimizeKey = "sessionHistory_autoOptimize";
var SFSessionHistoryManager =
/*#__PURE__*/
function () {
  function SFSessionHistoryManager(modelManager, storageManager, keyRequestHandler, contentTypes, timeout) {
    var _this = this;

    _classCallCheck(this, SFSessionHistoryManager);

    this.modelManager = modelManager;
    this.storageManager = storageManager;
    this.$timeout = timeout || setTimeout.bind(window); // Required to persist the encrypted form of SFHistorySession

    this.keyRequestHandler = keyRequestHandler;
    this.loadFromDisk().then(function () {
      _this.modelManager.addItemSyncObserver("session-history", contentTypes, function (allItems, validItems, deletedItems, source, sourceKey) {
        if (source === _Services_modelManager__WEBPACK_IMPORTED_MODULE_1__["SFModelManager"].MappingSourceLocalDirtied) {
          return;
        }

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = allItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;

            try {
              _this.addHistoryEntryForItem(item);
            } catch (e) {
              console.log("Caught exception while trying to add item history entry", e);
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      });
    });
  }

  _createClass(SFSessionHistoryManager, [{
    key: "encryptionParams",
    value: function encryptionParams() {
      return regeneratorRuntime.async(function encryptionParams$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", this.keyRequestHandler());

            case 1:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "addHistoryEntryForItem",
    value: function addHistoryEntryForItem(item) {
      var _this2 = this;

      var persistableItemParams = {
        uuid: item.uuid,
        content_type: item.content_type,
        updated_at: item.updated_at,
        content: item.getContentCopy()
      };
      var entry = this.historySession.addEntryForItem(persistableItemParams);

      if (this.autoOptimize) {
        this.historySession.optimizeHistoryForItem(item);
      }

      if (entry && this.diskEnabled) {
        // Debounce, clear existing timeout
        if (this.diskTimeout) {
          if (this.$timeout.hasOwnProperty("cancel")) {
            this.$timeout.cancel(this.diskTimeout);
          } else {
            clearTimeout(this.diskTimeout);
          }
        }

        ;
        this.diskTimeout = this.$timeout(function () {
          _this2.saveToDisk();
        }, 2000);
      }
    }
  }, {
    key: "historyForItem",
    value: function historyForItem(item) {
      return this.historySession.historyForItem(item);
    }
  }, {
    key: "clearHistoryForItem",
    value: function clearHistoryForItem(item) {
      return regeneratorRuntime.async(function clearHistoryForItem$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              this.historySession.clearItemHistory(item);
              return _context2.abrupt("return", this.saveToDisk());

            case 2:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "clearAllHistory",
    value: function clearAllHistory() {
      return regeneratorRuntime.async(function clearAllHistory$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              this.historySession.clearAllHistory();
              return _context3.abrupt("return", this.storageManager.removeItem(SessionHistoryRevisionsKey));

            case 2:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "toggleDiskSaving",
    value: function toggleDiskSaving() {
      return regeneratorRuntime.async(function toggleDiskSaving$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              this.diskEnabled = !this.diskEnabled;

              if (!this.diskEnabled) {
                _context4.next = 6;
                break;
              }

              this.storageManager.setItem(SessionHistoryPersistKey, JSON.stringify(true));
              this.saveToDisk();
              _context4.next = 8;
              break;

            case 6:
              this.storageManager.setItem(SessionHistoryPersistKey, JSON.stringify(false));
              return _context4.abrupt("return", this.storageManager.removeItem(SessionHistoryRevisionsKey));

            case 8:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "saveToDisk",
    value: function saveToDisk() {
      var _this3 = this;

      var encryptionParams, itemParams;
      return regeneratorRuntime.async(function saveToDisk$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              if (this.diskEnabled) {
                _context5.next = 2;
                break;
              }

              return _context5.abrupt("return");

            case 2:
              _context5.next = 4;
              return regeneratorRuntime.awrap(this.encryptionParams());

            case 4:
              encryptionParams = _context5.sent;
              itemParams = new _Models_core_itemParams__WEBPACK_IMPORTED_MODULE_2__["SFItemParams"](this.historySession, encryptionParams.keys, encryptionParams.auth_params);
              itemParams.paramsForSync().then(function (syncParams) {
                // console.log("Saving to disk", syncParams);
                _this3.storageManager.setItem(SessionHistoryRevisionsKey, JSON.stringify(syncParams));
              });

            case 7:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "loadFromDisk",
    value: function loadFromDisk() {
      var diskValue, historyValue, encryptionParams, historySession, autoOptimizeValue;
      return regeneratorRuntime.async(function loadFromDisk$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return regeneratorRuntime.awrap(this.storageManager.getItem(SessionHistoryPersistKey));

            case 2:
              diskValue = _context6.sent;

              if (diskValue) {
                this.diskEnabled = JSON.parse(diskValue);
              }

              _context6.next = 6;
              return regeneratorRuntime.awrap(this.storageManager.getItem(SessionHistoryRevisionsKey));

            case 6:
              historyValue = _context6.sent;

              if (!historyValue) {
                _context6.next = 18;
                break;
              }

              historyValue = JSON.parse(historyValue);
              _context6.next = 11;
              return regeneratorRuntime.awrap(this.encryptionParams());

            case 11:
              encryptionParams = _context6.sent;
              _context6.next = 14;
              return regeneratorRuntime.awrap(_Protocol_manager__WEBPACK_IMPORTED_MODULE_0__["protocolManager"].decryptItem({
                item: historyValue,
                keys: encryptionParams.keys
              }));

            case 14:
              historySession = new _Models_session_history_historySession__WEBPACK_IMPORTED_MODULE_3__["SFHistorySession"](historyValue);
              this.historySession = historySession;
              _context6.next = 19;
              break;

            case 18:
              this.historySession = new _Models_session_history_historySession__WEBPACK_IMPORTED_MODULE_3__["SFHistorySession"]();

            case 19:
              _context6.next = 21;
              return regeneratorRuntime.awrap(this.storageManager.getItem(SessionHistoryAutoOptimizeKey));

            case 21:
              autoOptimizeValue = _context6.sent;

              if (autoOptimizeValue) {
                this.autoOptimize = JSON.parse(autoOptimizeValue);
              } else {
                // default value is true
                this.autoOptimize = true;
              }

            case 23:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "toggleAutoOptimize",
    value: function toggleAutoOptimize() {
      return regeneratorRuntime.async(function toggleAutoOptimize$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              this.autoOptimize = !this.autoOptimize;

              if (this.autoOptimize) {
                this.storageManager.setItem(SessionHistoryAutoOptimizeKey, JSON.stringify(true));
              } else {
                this.storageManager.setItem(SessionHistoryAutoOptimizeKey, JSON.stringify(false));
              }

            case 2:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this);
    }
  }]);

  return SFSessionHistoryManager;
}();

/***/ }),

/***/ "./lib/services/singletonManager.js":
/*!******************************************!*\
  !*** ./lib/services/singletonManager.js ***!
  \******************************************/
/*! exports provided: SFSingletonManager */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SFSingletonManager", function() { return SFSingletonManager; });
/* harmony import */ var _Services_modelManager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @Services/modelManager */ "./lib/services/modelManager.js");
/* harmony import */ var _Models_core_predicate__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @Models/core/predicate */ "./lib/models/core/predicate.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * The SingletonManager allows controllers to register an item as a singleton, which means only one instance of that model
 * should exist, both on the server and on the client. When the SingletonManager detects multiple items matching the singleton predicate,
 * the earliest created_at wins, and the rest are deleted.
 */


var SFSingletonManager =
/*#__PURE__*/
function () {
  function SFSingletonManager(modelManager, syncManager) {
    var _this = this;

    _classCallCheck(this, SFSingletonManager);

    this.syncManager = syncManager;
    this.modelManager = modelManager;
    this.singletonHandlers = []; // We use sync observer instead of syncEvent `local-data-incremental-load`, because we want singletons
    // to resolve with the first priority, because they generally dictate app state.

    modelManager.addItemSyncObserverWithPriority({
      id: "sf-singleton-manager",
      types: "*",
      priority: -1,
      callback: function callback(allItems, validItems, deletedItems, source, sourceKey) {
        // Inside resolveSingletons, we are going to set items as dirty. If we don't stop here it result in infinite recursion.
        if (source === _Services_modelManager__WEBPACK_IMPORTED_MODULE_0__["SFModelManager"].MappingSourceLocalDirtied) {
          return;
        }

        _this.resolveSingletons(modelManager.allNondummyItems, true);
      }
    });
    syncManager.addEventHandler(function (syncEvent, data) {
      if (syncEvent == "local-data-loaded") {
        _this.resolveSingletons(modelManager.allNondummyItems, true);

        _this.initialDataLoaded = true;
      } else if (syncEvent == "sync:completed") {
        // Wait for initial data load before handling any sync. If we don't want for initial data load,
        // then the singleton resolver won't have the proper items to work with to determine whether to resolve or create.
        if (!_this.initialDataLoaded) {
          return;
        }

        _this.resolveSingletons(data.retrievedItems);
      }
    }); // If an item alternates its uuid on account registration, singletonHandlers might need to update
    // their local reference to the object, since the object reference will change on uuid alternation

    modelManager.addModelUuidChangeObserver("singleton-manager", function (oldModel, newModel) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _this.singletonHandlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var handler = _step.value;

          if (handler.singleton && _Models_core_predicate__WEBPACK_IMPORTED_MODULE_1__["SFPredicate"].ItemSatisfiesPredicates(newModel, handler.predicates)) {
            // Reference is now invalid, calling resolveSingleton should update it
            handler.singleton = null;

            _this.resolveSingletons([newModel]);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    });
  }
  /**
   * @param predicate  A key/value pair that specifies properties that should match in order for an item to be considered a predicate
   * @param resolveCallback  Called when one or more items are deleted and a new item becomes the reigning singleton
   * @param createBlock  Called when a sync is complete and no items are found. The createBlock should create the item and return it.
   */


  _createClass(SFSingletonManager, [{
    key: "registerSingleton",
    value: function registerSingleton(predicates, resolveCallback, createBlock) {
      this.singletonHandlers.push({
        predicates: predicates,
        resolutionCallback: resolveCallback,
        createBlock: createBlock
      });
    }
  }, {
    key: "resolveSingletons",
    value: function resolveSingletons(retrievedItems, initialLoad) {
      var _this2 = this;

      retrievedItems = retrievedItems || [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        var _loop = function _loop() {
          var singletonHandler = _step2.value;
          var predicates = singletonHandler.predicates.slice();

          var retrievedSingletonItems = _this2.modelManager.filterItemsWithPredicates(retrievedItems, predicates);

          var handleCreation = function handleCreation() {
            if (singletonHandler.createBlock) {
              singletonHandler.pendingCreateBlockCallback = true;
              singletonHandler.createBlock(function (created) {
                singletonHandler.singleton = created;
                singletonHandler.pendingCreateBlockCallback = false;
                singletonHandler.resolutionCallback && singletonHandler.resolutionCallback(created);
              });
            }
          };

          if (retrievedSingletonItems.length > 0) {
            // Check local inventory and make sure only 1 similar item exists. If more than 1, keep oldest, delete rest.
            var allExtantItemsMatchingPredicate = _this2.modelManager.itemsMatchingPredicates(predicates); // Delete all but the earliest created


            if (allExtantItemsMatchingPredicate.length >= 2) {
              var sorted = allExtantItemsMatchingPredicate.sort(function (a, b) {
                // If compareFunction(a, b) is less than 0, sort a to an index lower than b, i.e. a comes first.
                // If compareFunction(a, b) is greater than 0, sort b to an index lower than a, i.e. b comes first.
                if (a.errorDecrypting) {
                  return 1;
                }

                if (b.errorDecrypting) {
                  return -1;
                }

                return a.created_at < b.created_at ? -1 : 1;
              });
              var winningItem = sorted[0]; // Delete all items after first one

              var itemsToDelete = sorted.slice(1, sorted.length);
              var _iteratorNormalCompletion3 = true;
              var _didIteratorError3 = false;
              var _iteratorError3 = undefined;

              try {
                for (var _iterator3 = itemsToDelete[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                  var deleteItem = _step3.value;

                  _this2.modelManager.setItemToBeDeleted(deleteItem);
                }
              } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
                    _iterator3.return();
                  }
                } finally {
                  if (_didIteratorError3) {
                    throw _iteratorError3;
                  }
                }
              }

              _this2.syncManager.sync(); // Send remaining item to callback


              singletonHandler.singleton = winningItem;
              singletonHandler.resolutionCallback && singletonHandler.resolutionCallback(winningItem);
            } else if (allExtantItemsMatchingPredicate.length == 1) {
              var singleton = allExtantItemsMatchingPredicate[0];

              if (singleton.errorDecrypting) {
                // Delete the current singleton and create a new one
                _this2.modelManager.setItemToBeDeleted(singleton);

                handleCreation();
              } else if (!singletonHandler.singleton || singletonHandler.singleton !== singleton) {
                // Not yet notified interested parties of object
                singletonHandler.singleton = singleton;
                singletonHandler.resolutionCallback && singletonHandler.resolutionCallback(singleton);
              }
            }
          } else {
            // Retrieved items does not include any items of interest. If we don't have a singleton registered to this handler,
            // we need to create one. Only do this on actual sync completetions and not on initial data load. Because we want
            // to get the latest from the server before making the decision to create a new item
            if (!singletonHandler.singleton && !initialLoad && !singletonHandler.pendingCreateBlockCallback) {
              handleCreation();
            }
          }
        };

        for (var _iterator2 = this.singletonHandlers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          _loop();
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }]);

  return SFSingletonManager;
}();

/***/ }),

/***/ "./lib/services/storageManager.js":
/*!****************************************!*\
  !*** ./lib/services/storageManager.js ***!
  \****************************************/
/*! exports provided: SFStorageManager */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SFStorageManager", function() { return SFStorageManager; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * SFStorageManager should be subclassed, and all the methods below overriden.
 */
var SFStorageManager =
/*#__PURE__*/
function () {
  function SFStorageManager() {
    _classCallCheck(this, SFStorageManager);
  }

  _createClass(SFStorageManager, [{
    key: "setItem",
    value: function setItem(key, value) {
      return regeneratorRuntime.async(function setItem$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
            case "end":
              return _context.stop();
          }
        }
      });
    }
  }, {
    key: "getItem",
    value: function getItem(key) {
      return regeneratorRuntime.async(function getItem$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
            case "end":
              return _context2.stop();
          }
        }
      });
    }
  }, {
    key: "removeItem",
    value: function removeItem(key) {
      return regeneratorRuntime.async(function removeItem$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
            case "end":
              return _context3.stop();
          }
        }
      });
    }
  }, {
    key: "clear",
    value: function clear() {
      return regeneratorRuntime.async(function clear$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
            case "end":
              return _context4.stop();
          }
        }
      });
    }
  }, {
    key: "getAllModels",

    /**
     * Model Storage
     */
    value: function getAllModels() {
      return regeneratorRuntime.async(function getAllModels$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
            case "end":
              return _context5.stop();
          }
        }
      });
    }
  }, {
    key: "saveModel",
    value: function saveModel(item) {
      return regeneratorRuntime.async(function saveModel$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              return _context6.abrupt("return", this.saveModels([item]));

            case 1:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "saveModels",
    value: function saveModels(items) {
      return regeneratorRuntime.async(function saveModels$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
            case "end":
              return _context7.stop();
          }
        }
      });
    }
  }, {
    key: "deleteModel",
    value: function deleteModel(item) {
      return regeneratorRuntime.async(function deleteModel$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
            case "end":
              return _context8.stop();
          }
        }
      });
    }
  }, {
    key: "clearAllModels",
    value: function clearAllModels() {
      return regeneratorRuntime.async(function clearAllModels$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
            case "end":
              return _context9.stop();
          }
        }
      });
    }
  }, {
    key: "clearAllData",

    /**
     * General
     */
    value: function clearAllData() {
      return regeneratorRuntime.async(function clearAllData$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              return _context10.abrupt("return", Promise.all([this.clear(), this.clearAllModels()]));

            case 1:
            case "end":
              return _context10.stop();
          }
        }
      }, null, this);
    }
  }]);

  return SFStorageManager;
}();

/***/ }),

/***/ "./lib/services/syncManager.js":
/*!*************************************!*\
  !*** ./lib/services/syncManager.js ***!
  \*************************************/
/*! exports provided: SFSyncManager */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SFSyncManager", function() { return SFSyncManager; });
/* harmony import */ var lodash_pull__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash/pull */ "./node_modules/lodash/pull.js");
/* harmony import */ var lodash_pull__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash_pull__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Protocol_manager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @Protocol/manager */ "./lib/protocol/manager.js");
/* harmony import */ var _Services_modelManager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @Services/modelManager */ "./lib/services/modelManager.js");
/* harmony import */ var _Models_core_itemParams__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @Models/core/itemParams */ "./lib/models/core/itemParams.js");
/* harmony import */ var _Services_httpManager__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @Services/httpManager */ "./lib/services/httpManager.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }






var SFSyncManager =
/*#__PURE__*/
function () {
  function SFSyncManager(modelManager, storageManager, httpManager, timeout, interval) {
    _classCallCheck(this, SFSyncManager);

    SFSyncManager.KeyRequestLoadLocal = "KeyRequestLoadLocal";
    SFSyncManager.KeyRequestSaveLocal = "KeyRequestSaveLocal";
    SFSyncManager.KeyRequestLoadSaveAccount = "KeyRequestLoadSaveAccount";
    this.httpManager = httpManager;
    this.modelManager = modelManager;
    this.storageManager = storageManager; // Allows you to set your own interval/timeout function (i.e if you're using angular and want to use $timeout)

    this.$interval = interval || setInterval.bind(window);
    this.$timeout = timeout || setTimeout.bind(window);
    this.syncStatus = {};
    this.syncStatusObservers = [];
    this.eventHandlers = []; // this.loggingEnabled = true;

    this.PerSyncItemUploadLimit = 150;
    this.ServerItemDownloadLimit = 150; // The number of changed items that constitute a major change
    // This is used by the desktop app to create backups

    this.MajorDataChangeThreshold = 15; // Sync integrity checking
    // If X consective sync requests return mismatching hashes, then we officially enter out-of-sync.

    this.MaxDiscordanceBeforeOutOfSync = 5; // How many consective sync results have had mismatching hashes. This value can never exceed this.MaxDiscordanceBeforeOutOfSync.

    this.syncDiscordance = 0;
    this.outOfSync = false; // Content types appearing first are always mapped first

    this.contentTypeLoadPriority = ["SN|UserPreferences", "SN|Privileges", "SN|Component", "SN|Theme"];
  }

  _createClass(SFSyncManager, [{
    key: "handleServerIntegrityHash",
    value: function handleServerIntegrityHash(serverHash) {
      var localHash;
      return regeneratorRuntime.async(function handleServerIntegrityHash$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(!serverHash || serverHash.length == 0)) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return", true);

            case 2:
              _context.next = 4;
              return regeneratorRuntime.awrap(this.modelManager.computeDataIntegrityHash());

            case 4:
              localHash = _context.sent;

              if (localHash) {
                _context.next = 7;
                break;
              }

              return _context.abrupt("return", true);

            case 7:
              if (!(localHash !== serverHash)) {
                _context.next = 13;
                break;
              }

              this.syncDiscordance++;

              if (this.syncDiscordance >= this.MaxDiscordanceBeforeOutOfSync) {
                if (!this.outOfSync) {
                  this.outOfSync = true;
                  this.notifyEvent("enter-out-of-sync");
                }
              }

              return _context.abrupt("return", false);

            case 13:
              // Integrity matches
              if (this.outOfSync) {
                this.outOfSync = false;
                this.notifyEvent("exit-out-of-sync");
              }

              this.syncDiscordance = 0;
              return _context.abrupt("return", true);

            case 16:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "isOutOfSync",
    value: function isOutOfSync() {
      // Once we are outOfSync, it's up to the client to display UI to the user to instruct them
      // to take action. The client should present a reconciliation wizard.
      return this.outOfSync;
    }
  }, {
    key: "getServerURL",
    value: function getServerURL() {
      return regeneratorRuntime.async(function getServerURL$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return regeneratorRuntime.awrap(this.storageManager.getItem("server"));

            case 2:
              _context2.t0 = _context2.sent;

              if (_context2.t0) {
                _context2.next = 5;
                break;
              }

              _context2.t0 = window._default_sf_server;

            case 5:
              return _context2.abrupt("return", _context2.t0);

            case 6:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "getSyncURL",
    value: function getSyncURL() {
      return regeneratorRuntime.async(function getSyncURL$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return regeneratorRuntime.awrap(this.getServerURL());

            case 2:
              _context3.t0 = _context3.sent;
              return _context3.abrupt("return", _context3.t0 + "/items/sync");

            case 4:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "registerSyncStatusObserver",
    value: function registerSyncStatusObserver(callback) {
      var observer = {
        key: new Date(),
        callback: callback
      };
      this.syncStatusObservers.push(observer);
      return observer;
    }
  }, {
    key: "removeSyncStatusObserver",
    value: function removeSyncStatusObserver(observer) {
      lodash_pull__WEBPACK_IMPORTED_MODULE_0___default()(this.syncStatusObservers, observer);
    }
  }, {
    key: "syncStatusDidChange",
    value: function syncStatusDidChange() {
      var _this = this;

      this.syncStatusObservers.forEach(function (observer) {
        observer.callback(_this.syncStatus);
      });
    }
    /**
     * Events include:
     *  sync:completed
     *  sync:taking-too-long
     *  sync:updated_token
     *  sync:error
     *  major-data-change
     *  local-data-loaded
     *  sync-session-invalid
     *  sync-exception
     */

  }, {
    key: "addEventHandler",
    value: function addEventHandler(handler) {
      this.eventHandlers.push(handler);
      return handler;
    }
  }, {
    key: "removeEventHandler",
    value: function removeEventHandler(handler) {
      lodash_pull__WEBPACK_IMPORTED_MODULE_0___default()(this.eventHandlers, handler);
    }
  }, {
    key: "notifyEvent",
    value: function notifyEvent(syncEvent, data) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.eventHandlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var handler = _step.value;
          handler(syncEvent, data || {});
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "setKeyRequestHandler",
    value: function setKeyRequestHandler(handler) {
      this.keyRequestHandler = handler;
    }
    /**
     * @param request  One of [KeyRequestSaveLocal, KeyRequestLoadLocal, KeyRequestLoadSaveAccount]
     * keyRequestHandler is set externally by using class. It should return an object of this format:
     * {
     *  keys: {pw, mk, ak}
     *  auth_params: Object,
     *  offline: Boolean
     * }
     */

  }, {
    key: "getActiveKeyInfo",
    value: function getActiveKeyInfo(request) {
      return regeneratorRuntime.async(function getActiveKeyInfo$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", this.keyRequestHandler(request));

            case 1:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "initialDataLoaded",
    value: function initialDataLoaded() {
      return this._initialDataLoaded === true;
    }
  }, {
    key: "_sortLocalItems",
    value: function _sortLocalItems(items) {
      var _this2 = this;

      return items.sort(function (a, b) {
        var dateResult = new Date(b.updated_at) - new Date(a.updated_at);
        var priorityList = _this2.contentTypeLoadPriority;
        var aPriority = 0,
            bPriority = 0;

        if (priorityList) {
          aPriority = priorityList.indexOf(a.content_type);
          bPriority = priorityList.indexOf(b.content_type);

          if (aPriority == -1) {
            // Not found in list, not prioritized. Set it to max value
            aPriority = priorityList.length;
          }

          if (bPriority == -1) {
            // Not found in list, not prioritized. Set it to max value
            bPriority = priorityList.length;
          }
        }

        if (aPriority == bPriority) {
          return dateResult;
        }

        if (aPriority < bPriority) {
          return -1;
        } else {
          return 1;
        } // aPriority < bPriority means a should come first


        return aPriority < bPriority ? -1 : 1;
      });
    }
  }, {
    key: "loadLocalItems",
    value: function loadLocalItems() {
      var _this3 = this;

      var _ref,
          incrementalCallback,
          batchSize,
          options,
          latency,
          _args6 = arguments;

      return regeneratorRuntime.async(function loadLocalItems$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _ref = _args6.length > 0 && _args6[0] !== undefined ? _args6[0] : {}, incrementalCallback = _ref.incrementalCallback, batchSize = _ref.batchSize, options = _ref.options;

              if (!(options && options.simulateHighLatency)) {
                _context6.next = 5;
                break;
              }

              latency = options.simulatedLatency || 1000;
              _context6.next = 5;
              return regeneratorRuntime.awrap(this._awaitSleep(latency));

            case 5:
              if (!this.loadLocalDataPromise) {
                _context6.next = 7;
                break;
              }

              return _context6.abrupt("return", this.loadLocalDataPromise);

            case 7:
              if (!batchSize) {
                batchSize = 100;
              }

              this.loadLocalDataPromise = this.storageManager.getAllModels().then(function (items) {
                // put most recently updated at beginning, sorted by priority
                items = _this3._sortLocalItems(items); // Filter out any items that exist in the local model mapping and have a lower dirtied date than the local dirtiedDate.

                items = items.filter(function (nonDecryptedItem) {
                  var localItem = _this3.modelManager.findItem(nonDecryptedItem.uuid);

                  if (!localItem) {
                    return true;
                  }

                  return new Date(nonDecryptedItem.dirtiedDate) > localItem.dirtiedDate;
                }); // break it up into chunks to make interface more responsive for large item counts

                var total = items.length;
                var current = 0;
                var processed = [];

                var decryptNext = function decryptNext() {
                  var subitems, processedSubitems;
                  return regeneratorRuntime.async(function decryptNext$(_context5) {
                    while (1) {
                      switch (_context5.prev = _context5.next) {
                        case 0:
                          subitems = items.slice(current, current + batchSize);
                          _context5.next = 3;
                          return regeneratorRuntime.awrap(_this3.handleItemsResponse(subitems, null, _Services_modelManager__WEBPACK_IMPORTED_MODULE_2__["SFModelManager"].MappingSourceLocalRetrieved, SFSyncManager.KeyRequestLoadLocal));

                        case 3:
                          processedSubitems = _context5.sent;
                          processed.push(processedSubitems);
                          current += subitems.length;

                          if (!(current < total)) {
                            _context5.next = 10;
                            break;
                          }

                          return _context5.abrupt("return", new Promise(function (innerResolve, innerReject) {
                            _this3.$timeout(function () {
                              _this3.notifyEvent("local-data-incremental-load");

                              incrementalCallback && incrementalCallback(current, total);
                              decryptNext().then(innerResolve);
                            });
                          }));

                        case 10:
                          // Completed
                          _this3._initialDataLoaded = true;

                          _this3.notifyEvent("local-data-loaded");

                        case 12:
                        case "end":
                          return _context5.stop();
                      }
                    }
                  });
                };

                return decryptNext();
              });
              return _context6.abrupt("return", this.loadLocalDataPromise);

            case 10:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "writeItemsToLocalStorage",
    value: function writeItemsToLocalStorage(items, offlineOnly) {
      var _this4 = this;

      return regeneratorRuntime.async(function writeItemsToLocalStorage$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              if (!(items.length == 0)) {
                _context10.next = 2;
                break;
              }

              return _context10.abrupt("return");

            case 2:
              return _context10.abrupt("return", new Promise(function _callee3(resolve, reject) {
                var nonDeletedItems, deletedItems, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, item, info, params;

                return regeneratorRuntime.async(function _callee3$(_context9) {
                  while (1) {
                    switch (_context9.prev = _context9.next) {
                      case 0:
                        nonDeletedItems = [], deletedItems = [];
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context9.prev = 4;

                        for (_iterator2 = items[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                          item = _step2.value;

                          // if the item is deleted and dirty it means we still need to sync it.
                          if (item.deleted === true && !item.dirty) {
                            deletedItems.push(item);
                          } else {
                            nonDeletedItems.push(item);
                          }
                        }

                        _context9.next = 12;
                        break;

                      case 8:
                        _context9.prev = 8;
                        _context9.t0 = _context9["catch"](4);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context9.t0;

                      case 12:
                        _context9.prev = 12;
                        _context9.prev = 13;

                        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                          _iterator2.return();
                        }

                      case 15:
                        _context9.prev = 15;

                        if (!_didIteratorError2) {
                          _context9.next = 18;
                          break;
                        }

                        throw _iteratorError2;

                      case 18:
                        return _context9.finish(15);

                      case 19:
                        return _context9.finish(12);

                      case 20:
                        if (!(deletedItems.length > 0)) {
                          _context9.next = 23;
                          break;
                        }

                        _context9.next = 23;
                        return regeneratorRuntime.awrap(Promise.all(deletedItems.map(function _callee(deletedItem) {
                          return regeneratorRuntime.async(function _callee$(_context7) {
                            while (1) {
                              switch (_context7.prev = _context7.next) {
                                case 0:
                                  return _context7.abrupt("return", _this4.storageManager.deleteModel(deletedItem));

                                case 1:
                                case "end":
                                  return _context7.stop();
                              }
                            }
                          });
                        })));

                      case 23:
                        _context9.next = 25;
                        return regeneratorRuntime.awrap(_this4.getActiveKeyInfo(SFSyncManager.KeyRequestSaveLocal));

                      case 25:
                        info = _context9.sent;

                        if (!(nonDeletedItems.length > 0)) {
                          _context9.next = 33;
                          break;
                        }

                        _context9.next = 29;
                        return regeneratorRuntime.awrap(Promise.all(nonDeletedItems.map(function _callee2(item) {
                          var itemParams;
                          return regeneratorRuntime.async(function _callee2$(_context8) {
                            while (1) {
                              switch (_context8.prev = _context8.next) {
                                case 0:
                                  itemParams = new _Models_core_itemParams__WEBPACK_IMPORTED_MODULE_3__["SFItemParams"](item, info.keys, info.auth_params);
                                  _context8.next = 3;
                                  return regeneratorRuntime.awrap(itemParams.paramsForLocalStorage());

                                case 3:
                                  itemParams = _context8.sent;

                                  if (offlineOnly) {
                                    delete itemParams.dirty;
                                  }

                                  return _context8.abrupt("return", itemParams);

                                case 6:
                                case "end":
                                  return _context8.stop();
                              }
                            }
                          });
                        })).catch(function (e) {
                          return reject(e);
                        }));

                      case 29:
                        params = _context9.sent;
                        _context9.next = 32;
                        return regeneratorRuntime.awrap(_this4.storageManager.saveModels(params).catch(function (error) {
                          console.error("Error writing items", error);
                          _this4.syncStatus.localError = error;

                          _this4.syncStatusDidChange();

                          reject();
                        }));

                      case 32:
                        // on success
                        if (_this4.syncStatus.localError) {
                          _this4.syncStatus.localError = null;

                          _this4.syncStatusDidChange();
                        }

                      case 33:
                        resolve();

                      case 34:
                      case "end":
                        return _context9.stop();
                    }
                  }
                }, null, null, [[4, 8, 12, 20], [13,, 15, 19]]);
              }));

            case 3:
            case "end":
              return _context10.stop();
          }
        }
      });
    }
  }, {
    key: "syncOffline",
    value: function syncOffline(items) {
      var _this5 = this;

      var _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, item;

      return regeneratorRuntime.async(function syncOffline$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              // Update all items updated_at to now
              _iteratorNormalCompletion3 = true;
              _didIteratorError3 = false;
              _iteratorError3 = undefined;
              _context11.prev = 3;

              for (_iterator3 = items[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                item = _step3.value;
                item.updated_at = new Date();
              }

              _context11.next = 11;
              break;

            case 7:
              _context11.prev = 7;
              _context11.t0 = _context11["catch"](3);
              _didIteratorError3 = true;
              _iteratorError3 = _context11.t0;

            case 11:
              _context11.prev = 11;
              _context11.prev = 12;

              if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
                _iterator3.return();
              }

            case 14:
              _context11.prev = 14;

              if (!_didIteratorError3) {
                _context11.next = 17;
                break;
              }

              throw _iteratorError3;

            case 17:
              return _context11.finish(14);

            case 18:
              return _context11.finish(11);

            case 19:
              return _context11.abrupt("return", this.writeItemsToLocalStorage(items, true).then(function (responseItems) {
                // delete anything needing to be deleted
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                  for (var _iterator4 = items[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var item = _step4.value;

                    if (item.deleted) {
                      _this5.modelManager.removeItemLocally(item);
                    }
                  }
                } catch (err) {
                  _didIteratorError4 = true;
                  _iteratorError4 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
                      _iterator4.return();
                    }
                  } finally {
                    if (_didIteratorError4) {
                      throw _iteratorError4;
                    }
                  }
                }

                _this5.modelManager.clearDirtyItems(items); // Required in order for modelManager to notify sync observers


                _this5.modelManager.didSyncModelsOffline(items);

                _this5.notifyEvent("sync:completed", {
                  savedItems: items
                });

                return {
                  saved_items: items
                };
              }));

            case 20:
            case "end":
              return _context11.stop();
          }
        }
      }, null, this, [[3, 7, 11, 19], [12,, 14, 18]]);
    }
    /*
      In the case of signing in and merging local data, we alternative UUIDs
      to avoid overwriting data a user may retrieve that has the same UUID.
      Alternating here forces us to to create duplicates of the items instead.
     */

  }, {
    key: "markAllItemsDirtyAndSaveOffline",
    value: function markAllItemsDirtyAndSaveOffline(alternateUUIDs) {
      var originalItems, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, item, allItems, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _item;

      return regeneratorRuntime.async(function markAllItemsDirtyAndSaveOffline$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              if (!alternateUUIDs) {
                _context12.next = 28;
                break;
              }

              // use a copy, as alternating uuid will affect array
              originalItems = this.modelManager.allNondummyItems.filter(function (item) {
                return !item.errorDecrypting;
              }).slice();
              _iteratorNormalCompletion5 = true;
              _didIteratorError5 = false;
              _iteratorError5 = undefined;
              _context12.prev = 5;
              _iterator5 = originalItems[Symbol.iterator]();

            case 7:
              if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                _context12.next = 14;
                break;
              }

              item = _step5.value;
              _context12.next = 11;
              return regeneratorRuntime.awrap(this.modelManager.alternateUUIDForItem(item));

            case 11:
              _iteratorNormalCompletion5 = true;
              _context12.next = 7;
              break;

            case 14:
              _context12.next = 20;
              break;

            case 16:
              _context12.prev = 16;
              _context12.t0 = _context12["catch"](5);
              _didIteratorError5 = true;
              _iteratorError5 = _context12.t0;

            case 20:
              _context12.prev = 20;
              _context12.prev = 21;

              if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
                _iterator5.return();
              }

            case 23:
              _context12.prev = 23;

              if (!_didIteratorError5) {
                _context12.next = 26;
                break;
              }

              throw _iteratorError5;

            case 26:
              return _context12.finish(23);

            case 27:
              return _context12.finish(20);

            case 28:
              allItems = this.modelManager.allNondummyItems;
              _iteratorNormalCompletion6 = true;
              _didIteratorError6 = false;
              _iteratorError6 = undefined;
              _context12.prev = 32;

              for (_iterator6 = allItems[Symbol.iterator](); !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                _item = _step6.value;

                _item.setDirty(true);
              }

              _context12.next = 40;
              break;

            case 36:
              _context12.prev = 36;
              _context12.t1 = _context12["catch"](32);
              _didIteratorError6 = true;
              _iteratorError6 = _context12.t1;

            case 40:
              _context12.prev = 40;
              _context12.prev = 41;

              if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
                _iterator6.return();
              }

            case 43:
              _context12.prev = 43;

              if (!_didIteratorError6) {
                _context12.next = 46;
                break;
              }

              throw _iteratorError6;

            case 46:
              return _context12.finish(43);

            case 47:
              return _context12.finish(40);

            case 48:
              return _context12.abrupt("return", this.writeItemsToLocalStorage(allItems, false));

            case 49:
            case "end":
              return _context12.stop();
          }
        }
      }, null, this, [[5, 16, 20, 28], [21,, 23, 27], [32, 36, 40, 48], [41,, 43, 47]]);
    }
  }, {
    key: "setSyncToken",
    value: function setSyncToken(token) {
      return regeneratorRuntime.async(function setSyncToken$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              this._syncToken = token;
              _context13.next = 3;
              return regeneratorRuntime.awrap(this.storageManager.setItem("syncToken", token));

            case 3:
            case "end":
              return _context13.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "getSyncToken",
    value: function getSyncToken() {
      return regeneratorRuntime.async(function getSyncToken$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              if (this._syncToken) {
                _context14.next = 4;
                break;
              }

              _context14.next = 3;
              return regeneratorRuntime.awrap(this.storageManager.getItem("syncToken"));

            case 3:
              this._syncToken = _context14.sent;

            case 4:
              return _context14.abrupt("return", this._syncToken);

            case 5:
            case "end":
              return _context14.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "setCursorToken",
    value: function setCursorToken(token) {
      return regeneratorRuntime.async(function setCursorToken$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              this._cursorToken = token;

              if (!token) {
                _context15.next = 6;
                break;
              }

              _context15.next = 4;
              return regeneratorRuntime.awrap(this.storageManager.setItem("cursorToken", token));

            case 4:
              _context15.next = 8;
              break;

            case 6:
              _context15.next = 8;
              return regeneratorRuntime.awrap(this.storageManager.removeItem("cursorToken"));

            case 8:
            case "end":
              return _context15.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "getCursorToken",
    value: function getCursorToken() {
      return regeneratorRuntime.async(function getCursorToken$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              if (this._cursorToken) {
                _context16.next = 4;
                break;
              }

              _context16.next = 3;
              return regeneratorRuntime.awrap(this.storageManager.getItem("cursorToken"));

            case 3:
              this._cursorToken = _context16.sent;

            case 4:
              return _context16.abrupt("return", this._cursorToken);

            case 5:
            case "end":
              return _context16.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "clearQueuedCallbacks",
    value: function clearQueuedCallbacks() {
      this._queuedCallbacks = [];
    }
  }, {
    key: "callQueuedCallbacks",
    value: function callQueuedCallbacks(response) {
      var allCallbacks = this.queuedCallbacks;

      if (allCallbacks.length) {
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = allCallbacks[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var eachCallback = _step7.value;
            eachCallback(response);
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
              _iterator7.return();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }

        this.clearQueuedCallbacks();
      }
    }
  }, {
    key: "beginCheckingIfSyncIsTakingTooLong",
    value: function beginCheckingIfSyncIsTakingTooLong() {
      if (this.syncStatus.checker) {
        this.stopCheckingIfSyncIsTakingTooLong();
      }

      this.syncStatus.checker = this.$interval(function () {
        // check to see if the ongoing sync is taking too long, alert the user
        var secondsPassed = (new Date() - this.syncStatus.syncStart) / 1000;
        var warningThreshold = 5.0; // seconds

        if (secondsPassed > warningThreshold) {
          this.notifyEvent("sync:taking-too-long");
          this.stopCheckingIfSyncIsTakingTooLong();
        }
      }.bind(this), 500);
    }
  }, {
    key: "stopCheckingIfSyncIsTakingTooLong",
    value: function stopCheckingIfSyncIsTakingTooLong() {
      if (this.$interval.hasOwnProperty("cancel")) {
        this.$interval.cancel(this.syncStatus.checker);
      } else {
        clearInterval(this.syncStatus.checker);
      }

      this.syncStatus.checker = null;
    }
  }, {
    key: "lockSyncing",
    value: function lockSyncing() {
      this.syncLocked = true;
    }
  }, {
    key: "unlockSyncing",
    value: function unlockSyncing() {
      this.syncLocked = false;
    }
  }, {
    key: "sync",
    value: function sync() {
      var _this6 = this;

      var options,
          _args18 = arguments;
      return regeneratorRuntime.async(function sync$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              options = _args18.length > 0 && _args18[0] !== undefined ? _args18[0] : {};

              if (!this.syncLocked) {
                _context18.next = 4;
                break;
              }

              console.log("Sync Locked, Returning;");
              return _context18.abrupt("return");

            case 4:
              return _context18.abrupt("return", new Promise(function _callee4(resolve, reject) {
                var allDirtyItems, dirtyItemsNotYetSaved, info, isSyncInProgress, initialDataLoaded, isContinuationSync, submitLimit, subItems, params, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, item;

                return regeneratorRuntime.async(function _callee4$(_context17) {
                  while (1) {
                    switch (_context17.prev = _context17.next) {
                      case 0:
                        if (!options) options = {};
                        allDirtyItems = _this6.modelManager.getDirtyItems();
                        dirtyItemsNotYetSaved = allDirtyItems.filter(function (candidate) {
                          return !_this6.lastDirtyItemsSave || candidate.dirtiedDate > _this6.lastDirtyItemsSave;
                        });
                        _context17.next = 5;
                        return regeneratorRuntime.awrap(_this6.getActiveKeyInfo(SFSyncManager.KeyRequestLoadSaveAccount));

                      case 5:
                        info = _context17.sent;
                        isSyncInProgress = _this6.syncStatus.syncOpInProgress;
                        initialDataLoaded = _this6.initialDataLoaded();

                        if (!(isSyncInProgress || !initialDataLoaded)) {
                          _context17.next = 16;
                          break;
                        }

                        _this6.performSyncAgainOnCompletion = true;
                        _this6.lastDirtyItemsSave = new Date();
                        _context17.next = 13;
                        return regeneratorRuntime.awrap(_this6.writeItemsToLocalStorage(dirtyItemsNotYetSaved, false));

                      case 13:
                        if (isSyncInProgress) {
                          _this6.queuedCallbacks.push(resolve);

                          if (_this6.loggingEnabled) {
                            console.warn("Attempting to sync while existing sync is in progress.");
                          }
                        }

                        if (!initialDataLoaded) {
                          if (_this6.loggingEnabled) {
                            console.warn("(1) Attempting to perform online sync before local data has loaded");
                          } // Resolve right away, as we can't be sure when local data will be called by consumer.


                          resolve();
                        }

                        return _context17.abrupt("return");

                      case 16:
                        // Set this value immediately after checking it above, to avoid race conditions.
                        _this6.syncStatus.syncOpInProgress = true;

                        if (!info.offline) {
                          _context17.next = 19;
                          break;
                        }

                        return _context17.abrupt("return", _this6.syncOffline(allDirtyItems).then(function (response) {
                          _this6.syncStatus.syncOpInProgress = false;
                          resolve(response);
                        }).catch(function (e) {
                          _this6.notifyEvent("sync-exception", e);
                        }));

                      case 19:
                        if (_this6.initialDataLoaded()) {
                          _context17.next = 22;
                          break;
                        }

                        console.error("Attempting to perform online sync before local data has loaded");
                        return _context17.abrupt("return");

                      case 22:
                        if (_this6.loggingEnabled) {
                          console.log("Syncing online user.");
                        }

                        isContinuationSync = _this6.syncStatus.needsMoreSync;
                        _this6.syncStatus.syncStart = new Date();

                        _this6.beginCheckingIfSyncIsTakingTooLong();

                        submitLimit = _this6.PerSyncItemUploadLimit;
                        subItems = allDirtyItems.slice(0, submitLimit);

                        if (subItems.length < allDirtyItems.length) {
                          // more items left to be synced, repeat
                          _this6.syncStatus.needsMoreSync = true;
                        } else {
                          _this6.syncStatus.needsMoreSync = false;
                        }

                        if (!isContinuationSync) {
                          _this6.syncStatus.total = allDirtyItems.length;
                          _this6.syncStatus.current = 0;
                        } // If items are marked as dirty during a long running sync request, total isn't updated
                        // This happens mostly in the case of large imports and sync conflicts where duplicated items are created


                        if (_this6.syncStatus.current > _this6.syncStatus.total) {
                          _this6.syncStatus.total = _this6.syncStatus.current;
                        }

                        _this6.syncStatusDidChange(); // Perform save after you've updated all status signals above. Presync save can take several seconds in some cases.
                        // Write to local storage before beginning sync.
                        // This way, if they close the browser before the sync request completes, local changes will not be lost


                        _context17.next = 34;
                        return regeneratorRuntime.awrap(_this6.writeItemsToLocalStorage(dirtyItemsNotYetSaved, false));

                      case 34:
                        _this6.lastDirtyItemsSave = new Date();

                        if (options.onPreSyncSave) {
                          options.onPreSyncSave();
                        } // when doing a sync request that returns items greater than the limit, and thus subsequent syncs are required,
                        // we want to keep track of all retreived items, then save to local storage only once all items have been retrieved,
                        // so that relationships remain intact
                        // Update 12/18: I don't think we need to do this anymore, since relationships will now retroactively resolve their relationships,
                        // if an item they were looking for hasn't been pulled in yet.


                        if (!_this6.allRetreivedItems) {
                          _this6.allRetreivedItems = [];
                        } // We also want to do this for savedItems


                        if (!_this6.allSavedItems) {
                          _this6.allSavedItems = [];
                        }

                        params = {};
                        params.limit = _this6.ServerItemDownloadLimit;

                        if (options.performIntegrityCheck) {
                          params.compute_integrity = true;
                        }

                        _context17.prev = 41;
                        _context17.next = 44;
                        return regeneratorRuntime.awrap(Promise.all(subItems.map(function (item) {
                          var itemParams = new _Models_core_itemParams__WEBPACK_IMPORTED_MODULE_3__["SFItemParams"](item, info.keys, info.auth_params);
                          itemParams.additionalFields = options.additionalFields;
                          return itemParams.paramsForSync();
                        })).then(function (itemsParams) {
                          params.items = itemsParams;
                        }));

                      case 44:
                        _context17.next = 49;
                        break;

                      case 46:
                        _context17.prev = 46;
                        _context17.t0 = _context17["catch"](41);

                        _this6.notifyEvent("sync-exception", _context17.t0);

                      case 49:
                        _iteratorNormalCompletion8 = true;
                        _didIteratorError8 = false;
                        _iteratorError8 = undefined;
                        _context17.prev = 52;

                        for (_iterator8 = subItems[Symbol.iterator](); !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                          item = _step8.value;
                          // Reset dirty counter to 0, since we're about to sync it.
                          // This means anyone marking the item as dirty after this will cause it so sync again and not be cleared on sync completion.
                          item.dirtyCount = 0;
                        }

                        _context17.next = 60;
                        break;

                      case 56:
                        _context17.prev = 56;
                        _context17.t1 = _context17["catch"](52);
                        _didIteratorError8 = true;
                        _iteratorError8 = _context17.t1;

                      case 60:
                        _context17.prev = 60;
                        _context17.prev = 61;

                        if (!_iteratorNormalCompletion8 && _iterator8.return != null) {
                          _iterator8.return();
                        }

                      case 63:
                        _context17.prev = 63;

                        if (!_didIteratorError8) {
                          _context17.next = 66;
                          break;
                        }

                        throw _iteratorError8;

                      case 66:
                        return _context17.finish(63);

                      case 67:
                        return _context17.finish(60);

                      case 68:
                        _context17.next = 70;
                        return regeneratorRuntime.awrap(_this6.getSyncToken());

                      case 70:
                        params.sync_token = _context17.sent;
                        _context17.next = 73;
                        return regeneratorRuntime.awrap(_this6.getCursorToken());

                      case 73:
                        params.cursor_token = _context17.sent;
                        params['api'] = _Services_httpManager__WEBPACK_IMPORTED_MODULE_4__["SFHttpManager"].getApiVersion();

                        if (_this6.loggingEnabled) {
                          console.log("Syncing with params", params);
                        }

                        _context17.prev = 76;
                        _context17.t2 = _this6.httpManager;
                        _context17.next = 80;
                        return regeneratorRuntime.awrap(_this6.getSyncURL());

                      case 80:
                        _context17.t3 = _context17.sent;
                        _context17.t4 = params;

                        _context17.t5 = function (response) {
                          _this6.handleSyncSuccess(subItems, response, options).then(function () {
                            resolve(response);
                          }).catch(function (e) {
                            console.log("Caught sync success exception:", e);

                            _this6.handleSyncError(e, null, allDirtyItems).then(function (errorResponse) {
                              _this6.notifyEvent("sync-exception", e);

                              resolve(errorResponse);
                            });
                          });
                        };

                        _context17.t6 = function (response, statusCode) {
                          _this6.handleSyncError(response, statusCode, allDirtyItems).then(function (errorResponse) {
                            resolve(errorResponse);
                          });
                        };

                        _context17.t2.postAuthenticatedAbsolute.call(_context17.t2, _context17.t3, _context17.t4, _context17.t5, _context17.t6);

                        _context17.next = 90;
                        break;

                      case 87:
                        _context17.prev = 87;
                        _context17.t7 = _context17["catch"](76);
                        console.log("Sync exception caught:", _context17.t7);

                      case 90:
                      case "end":
                        return _context17.stop();
                    }
                  }
                }, null, null, [[41, 46], [52, 56, 60, 68], [61,, 63, 67], [76, 87]]);
              }));

            case 5:
            case "end":
              return _context18.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "_awaitSleep",
    value: function _awaitSleep(durationInMs) {
      return regeneratorRuntime.async(function _awaitSleep$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              console.warn("Simulating high latency sync request", durationInMs);
              return _context19.abrupt("return", new Promise(function (resolve, reject) {
                setTimeout(function () {
                  resolve();
                }, durationInMs);
              }));

            case 2:
            case "end":
              return _context19.stop();
          }
        }
      });
    }
  }, {
    key: "handleSyncSuccess",
    value: function handleSyncSuccess(syncedItems, response, options) {
      var _this7 = this;

      var latency, allSavedUUIDs, currentRequestSavedUUIDs, potentialRetrievedConflicts, itemsToClearAsDirty, _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, item, conflictsNeedingSave, keys, _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, remoteItem, localItem, remoteContent, tempServerItem, retrieved, omitFields, saved, deprecated_unsaved, handledConflicts, matches, cursorToken;

      return regeneratorRuntime.async(function handleSyncSuccess$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              if (!options.simulateHighLatency) {
                _context20.next = 4;
                break;
              }

              latency = options.simulatedLatency || 1000;
              _context20.next = 4;
              return regeneratorRuntime.awrap(this._awaitSleep(latency));

            case 4:
              this.syncStatus.error = null;

              if (this.loggingEnabled) {
                console.log("Sync response", response);
              }

              allSavedUUIDs = this.allSavedItems.map(function (item) {
                return item.uuid;
              });
              currentRequestSavedUUIDs = response.saved_items.map(function (savedResponse) {
                return savedResponse.uuid;
              });
              potentialRetrievedConflicts = []; // If we have retrieved an item that has or is being saved, or if the item is locally dirty,
              // filter it out of retrieved_items, and add to potential conflicts.

              response.retrieved_items = response.retrieved_items.filter(function (retrievedItem) {
                var isInPreviousSaved = allSavedUUIDs.includes(retrievedItem.uuid);
                var isInCurrentSaved = currentRequestSavedUUIDs.includes(retrievedItem.uuid);

                if (isInPreviousSaved || isInCurrentSaved) {
                  potentialRetrievedConflicts.push(retrievedItem);
                  return false;
                }

                var localItem = _this7.modelManager.findItem(retrievedItem.uuid);

                if (localItem && localItem.dirty) {
                  potentialRetrievedConflicts.push(retrievedItem);
                  return false;
                }

                return true;
              }); // Clear dirty items after we've finish filtering retrieved_items above, since that depends on dirty items.
              // Check to make sure any subItem hasn't been marked as dirty again while a sync was ongoing

              itemsToClearAsDirty = [];
              _iteratorNormalCompletion9 = true;
              _didIteratorError9 = false;
              _iteratorError9 = undefined;
              _context20.prev = 14;

              for (_iterator9 = syncedItems[Symbol.iterator](); !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                item = _step9.value;

                if (item.dirtyCount == 0) {
                  // Safe to clear as dirty
                  itemsToClearAsDirty.push(item);
                }
              }

              _context20.next = 22;
              break;

            case 18:
              _context20.prev = 18;
              _context20.t0 = _context20["catch"](14);
              _didIteratorError9 = true;
              _iteratorError9 = _context20.t0;

            case 22:
              _context20.prev = 22;
              _context20.prev = 23;

              if (!_iteratorNormalCompletion9 && _iterator9.return != null) {
                _iterator9.return();
              }

            case 25:
              _context20.prev = 25;

              if (!_didIteratorError9) {
                _context20.next = 28;
                break;
              }

              throw _iteratorError9;

            case 28:
              return _context20.finish(25);

            case 29:
              return _context20.finish(22);

            case 30:
              this.modelManager.clearDirtyItems(itemsToClearAsDirty);
              conflictsNeedingSave = []; // Any retrieved_items that were filtered from the above retrieved_items.filter should now be
              // looped on to make sure we create conflicts for any retrieved content that differs from local values.

              if (!(potentialRetrievedConflicts.length > 0)) {
                _context20.next = 72;
                break;
              }

              _context20.next = 35;
              return regeneratorRuntime.awrap(this.getActiveKeyInfo(SFSyncManager.KeyRequestLoadSaveAccount));

            case 35:
              keys = _context20.sent.keys;
              _context20.next = 38;
              return regeneratorRuntime.awrap(_Protocol_manager__WEBPACK_IMPORTED_MODULE_1__["protocolManager"].decryptMultipleItems(potentialRetrievedConflicts, keys));

            case 38:
              _iteratorNormalCompletion10 = true;
              _didIteratorError10 = false;
              _iteratorError10 = undefined;
              _context20.prev = 41;
              _iterator10 = potentialRetrievedConflicts[Symbol.iterator]();

            case 43:
              if (_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done) {
                _context20.next = 58;
                break;
              }

              remoteItem = _step10.value;
              localItem = this.modelManager.findItem(remoteItem.uuid);
              remoteContent = JSON.parse(remoteItem.content);

              if (!(!localItem || !remoteContent)) {
                _context20.next = 49;
                break;
              }

              return _context20.abrupt("continue", 55);

            case 49:
              if (!(localItem && !localItem.isContentEqualWithNonItemContent(remoteContent))) {
                _context20.next = 55;
                break;
              }

              _context20.next = 52;
              return regeneratorRuntime.awrap(this.modelManager.createDuplicateItemFromResponseItem(remoteItem));

            case 52:
              tempServerItem = _context20.sent;
              this.modelManager.addDuplicatedItemAsConflict({
                duplicate: tempServerItem,
                duplicateOf: localItem
              });
              conflictsNeedingSave.push(tempServerItem);

            case 55:
              _iteratorNormalCompletion10 = true;
              _context20.next = 43;
              break;

            case 58:
              _context20.next = 64;
              break;

            case 60:
              _context20.prev = 60;
              _context20.t1 = _context20["catch"](41);
              _didIteratorError10 = true;
              _iteratorError10 = _context20.t1;

            case 64:
              _context20.prev = 64;
              _context20.prev = 65;

              if (!_iteratorNormalCompletion10 && _iterator10.return != null) {
                _iterator10.return();
              }

            case 67:
              _context20.prev = 67;

              if (!_didIteratorError10) {
                _context20.next = 70;
                break;
              }

              throw _iteratorError10;

            case 70:
              return _context20.finish(67);

            case 71:
              return _context20.finish(64);

            case 72:
              _context20.next = 74;
              return regeneratorRuntime.awrap(this.handleItemsResponse(response.retrieved_items, null, _Services_modelManager__WEBPACK_IMPORTED_MODULE_2__["SFModelManager"].MappingSourceRemoteRetrieved, SFSyncManager.KeyRequestLoadSaveAccount));

            case 74:
              retrieved = _context20.sent;
              // Append items to master list of retrieved items for this ongoing sync operation
              this.allRetreivedItems = this.allRetreivedItems.concat(retrieved);
              this.syncStatus.retrievedCount = this.allRetreivedItems.length; // Merge only metadata for saved items
              // we write saved items to disk now because it clears their dirty status then saves
              // if we saved items before completion, we had have to save them as dirty and save them again on success as clean

              omitFields = ["content", "auth_hash"]; // Map saved items to local data

              _context20.next = 80;
              return regeneratorRuntime.awrap(this.handleItemsResponse(response.saved_items, omitFields, _Services_modelManager__WEBPACK_IMPORTED_MODULE_2__["SFModelManager"].MappingSourceRemoteSaved, SFSyncManager.KeyRequestLoadSaveAccount));

            case 80:
              saved = _context20.sent;
              // Append items to master list of saved items for this ongoing sync operation
              this.allSavedItems = this.allSavedItems.concat(saved); // 'unsaved' is deprecated and replaced with 'conflicts' in newer version.

              deprecated_unsaved = response.unsaved;
              _context20.next = 85;
              return regeneratorRuntime.awrap(this.deprecated_handleUnsavedItemsResponse(deprecated_unsaved));

            case 85:
              _context20.next = 87;
              return regeneratorRuntime.awrap(this.handleConflictsResponse(response.conflicts));

            case 87:
              _context20.t2 = _context20.sent;

              if (_context20.t2) {
                _context20.next = 90;
                break;
              }

              _context20.t2 = [];

            case 90:
              handledConflicts = _context20.t2;
              conflictsNeedingSave = conflictsNeedingSave.concat(handledConflicts);

              if (!(conflictsNeedingSave.length > 0)) {
                _context20.next = 95;
                break;
              }

              _context20.next = 95;
              return regeneratorRuntime.awrap(this.writeItemsToLocalStorage(conflictsNeedingSave, false));

            case 95:
              _context20.next = 97;
              return regeneratorRuntime.awrap(this.writeItemsToLocalStorage(saved, false));

            case 97:
              _context20.next = 99;
              return regeneratorRuntime.awrap(this.writeItemsToLocalStorage(retrieved, false));

            case 99:
              if (!(response.integrity_hash && !response.cursor_token)) {
                _context20.next = 104;
                break;
              }

              _context20.next = 102;
              return regeneratorRuntime.awrap(this.handleServerIntegrityHash(response.integrity_hash));

            case 102:
              matches = _context20.sent;

              if (!matches) {
                // If the server hash doesn't match our local hash, we want to continue syncing until we reach
                // the max discordance threshold
                if (this.syncDiscordance < this.MaxDiscordanceBeforeOutOfSync) {
                  this.performSyncAgainOnCompletion = true;
                }
              }

            case 104:
              this.syncStatus.syncOpInProgress = false;
              this.syncStatus.current += syncedItems.length;
              this.syncStatusDidChange(); // set the sync token at the end, so that if any errors happen above, you can resync

              this.setSyncToken(response.sync_token);
              this.setCursorToken(response.cursor_token);
              this.stopCheckingIfSyncIsTakingTooLong();
              _context20.next = 112;
              return regeneratorRuntime.awrap(this.getCursorToken());

            case 112:
              cursorToken = _context20.sent;

              if (!(cursorToken || this.syncStatus.needsMoreSync)) {
                _context20.next = 117;
                break;
              }

              return _context20.abrupt("return", new Promise(function (resolve, reject) {
                setTimeout(function () {
                  this.sync(options).then(resolve);
                }.bind(_this7), 10); // wait 10ms to allow UI to update
              }));

            case 117:
              if (!(conflictsNeedingSave.length > 0)) {
                _context20.next = 122;
                break;
              }

              // We'll use the conflict sync as the next sync, so performSyncAgainOnCompletion can be turned off.
              this.performSyncAgainOnCompletion = false; // Include as part of await/resolve chain

              return _context20.abrupt("return", new Promise(function (resolve, reject) {
                setTimeout(function () {
                  _this7.sync(options).then(resolve);
                }, 10); // wait 10ms to allow UI to update
              }));

            case 122:
              this.syncStatus.retrievedCount = 0; // current and total represent what's going up, not what's come down or saved.

              this.syncStatus.current = 0;
              this.syncStatus.total = 0;
              this.syncStatusDidChange();

              if (this.allRetreivedItems.length >= this.majorDataChangeThreshold || saved.length >= this.majorDataChangeThreshold || deprecated_unsaved && deprecated_unsaved.length >= this.majorDataChangeThreshold || conflictsNeedingSave && conflictsNeedingSave.length >= this.majorDataChangeThreshold) {
                this.notifyEvent("major-data-change");
              }

              this.callQueuedCallbacks(response);
              this.notifyEvent("sync:completed", {
                retrievedItems: this.allRetreivedItems,
                savedItems: this.allSavedItems
              });
              this.allRetreivedItems = [];
              this.allSavedItems = [];

              if (this.performSyncAgainOnCompletion) {
                this.performSyncAgainOnCompletion = false;
                setTimeout(function () {
                  _this7.sync(options);
                }, 10); // wait 10ms to allow UI to update
              }

              return _context20.abrupt("return", response);

            case 133:
            case "end":
              return _context20.stop();
          }
        }
      }, null, this, [[14, 18, 22, 30], [23,, 25, 29], [41, 60, 64, 72], [65,, 67, 71]]);
    }
  }, {
    key: "handleSyncError",
    value: function handleSyncError(response, statusCode, allDirtyItems) {
      return regeneratorRuntime.async(function handleSyncError$(_context21) {
        while (1) {
          switch (_context21.prev = _context21.next) {
            case 0:
              console.log("Sync error: ", response);

              if (statusCode == 401) {
                this.notifyEvent("sync-session-invalid");
              }

              if (!response) {
                response = {
                  error: {
                    message: "Could not connect to server."
                  }
                };
              } else if (typeof response == 'string') {
                response = {
                  error: {
                    message: response
                  }
                };
              }

              this.syncStatus.syncOpInProgress = false;
              this.syncStatus.error = response.error;
              this.syncStatusDidChange();
              this.writeItemsToLocalStorage(allDirtyItems, false);
              this.modelManager.didSyncModelsOffline(allDirtyItems);
              this.stopCheckingIfSyncIsTakingTooLong();
              this.notifyEvent("sync:error", response.error);
              this.callQueuedCallbacks({
                error: "Sync error"
              });
              return _context21.abrupt("return", response);

            case 12:
            case "end":
              return _context21.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "handleItemsResponse",
    value: function handleItemsResponse(responseItems, omitFields, source, keyRequest) {
      var keys, items, itemsWithErrorStatusChange;
      return regeneratorRuntime.async(function handleItemsResponse$(_context22) {
        while (1) {
          switch (_context22.prev = _context22.next) {
            case 0:
              _context22.next = 2;
              return regeneratorRuntime.awrap(this.getActiveKeyInfo(keyRequest));

            case 2:
              keys = _context22.sent.keys;
              _context22.next = 5;
              return regeneratorRuntime.awrap(_Protocol_manager__WEBPACK_IMPORTED_MODULE_1__["protocolManager"].decryptMultipleItems(responseItems, keys));

            case 5:
              _context22.next = 7;
              return regeneratorRuntime.awrap(this.modelManager.mapResponseItemsToLocalModelsOmittingFields(responseItems, omitFields, source));

            case 7:
              items = _context22.sent;
              // During the decryption process, items may be marked as "errorDecrypting". If so, we want to be sure
              // to persist this new state by writing these items back to local storage. When an item's "errorDecrypting"
              // flag is changed, its "errorDecryptingValueChanged" flag will be set, so we can find these items by filtering (then unsetting) below:
              itemsWithErrorStatusChange = items.filter(function (item) {
                var valueChanged = item.errorDecryptingValueChanged; // unset after consuming value

                item.errorDecryptingValueChanged = false;
                return valueChanged;
              });

              if (itemsWithErrorStatusChange.length > 0) {
                this.writeItemsToLocalStorage(itemsWithErrorStatusChange, false);
              }

              return _context22.abrupt("return", items);

            case 11:
            case "end":
              return _context22.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "refreshErroredItems",
    value: function refreshErroredItems() {
      var erroredItems;
      return regeneratorRuntime.async(function refreshErroredItems$(_context23) {
        while (1) {
          switch (_context23.prev = _context23.next) {
            case 0:
              erroredItems = this.modelManager.allNondummyItems.filter(function (item) {
                return item.errorDecrypting == true;
              });

              if (!(erroredItems.length > 0)) {
                _context23.next = 3;
                break;
              }

              return _context23.abrupt("return", this.handleItemsResponse(erroredItems, null, _Services_modelManager__WEBPACK_IMPORTED_MODULE_2__["SFModelManager"].MappingSourceLocalRetrieved, SFSyncManager.KeyRequestLoadSaveAccount));

            case 3:
            case "end":
              return _context23.stop();
          }
        }
      }, null, this);
    }
    /*
    The difference between 'unsaved' (deprecated_handleUnsavedItemsResponse) and 'conflicts' (handleConflictsResponse) is that
    with unsaved items, the local copy is triumphant on the server, and we check the server copy to see if we should
    create it as a duplicate. This is for the legacy API where it would save what you sent the server no matter its value,
    and the client would decide what to do with the previous server value.
     handleConflictsResponse on the other hand handles where the local copy save was not triumphant on the server.
    Instead the conflict includes the server item. Here we immediately map the server value onto our local value,
    but before that, we give our local value a chance to duplicate itself if it differs from the server value.
    */

  }, {
    key: "handleConflictsResponse",
    value: function handleConflictsResponse(conflicts) {
      var localValues, _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _iterator11, _step11, conflict, serverItemResponse, localItem, frozenCurrentContent, itemsNeedingLocalSave, _iteratorNormalCompletion12, _didIteratorError12, _iteratorError12, _iterator12, _step12, _conflict, _serverItemResponse, _localValues$_serverI, _frozenCurrentContent, itemRef, newItem, tempServerItem, tempCurrentItemWithFrozenValues, frozenContentDiffers, currentContentDiffers, duplicateLocal, duplicateServer, keepLocal, keepServer, IsActiveItemSecondsThreshold, isActivelyBeingEdited, contentExcludingReferencesDiffers, isOnlyReferenceChange, localDuplicate;

      return regeneratorRuntime.async(function handleConflictsResponse$(_context24) {
        while (1) {
          switch (_context24.prev = _context24.next) {
            case 0:
              if (!(!conflicts || conflicts.length == 0)) {
                _context24.next = 2;
                break;
              }

              return _context24.abrupt("return");

            case 2:
              if (this.loggingEnabled) {
                console.log("Handle Conflicted Items:", conflicts);
              } // Get local values before doing any processing. This way, if a note change below modifies a tag,
              // and the tag is going to be iterated on in the same loop, then we don't want this change to be compared
              // to the local value.


              localValues = {};
              _iteratorNormalCompletion11 = true;
              _didIteratorError11 = false;
              _iteratorError11 = undefined;
              _context24.prev = 7;
              _iterator11 = conflicts[Symbol.iterator]();

            case 9:
              if (_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done) {
                _context24.next = 21;
                break;
              }

              conflict = _step11.value;
              serverItemResponse = conflict.server_item || conflict.unsaved_item;
              localItem = this.modelManager.findItem(serverItemResponse.uuid);

              if (localItem) {
                _context24.next = 16;
                break;
              }

              localValues[serverItemResponse.uuid] = {};
              return _context24.abrupt("continue", 18);

            case 16:
              frozenCurrentContent = localItem.getContentCopy();
              localValues[serverItemResponse.uuid] = {
                frozenCurrentContent: frozenCurrentContent,
                itemRef: localItem
              };

            case 18:
              _iteratorNormalCompletion11 = true;
              _context24.next = 9;
              break;

            case 21:
              _context24.next = 27;
              break;

            case 23:
              _context24.prev = 23;
              _context24.t0 = _context24["catch"](7);
              _didIteratorError11 = true;
              _iteratorError11 = _context24.t0;

            case 27:
              _context24.prev = 27;
              _context24.prev = 28;

              if (!_iteratorNormalCompletion11 && _iterator11.return != null) {
                _iterator11.return();
              }

            case 30:
              _context24.prev = 30;

              if (!_didIteratorError11) {
                _context24.next = 33;
                break;
              }

              throw _iteratorError11;

            case 33:
              return _context24.finish(30);

            case 34:
              return _context24.finish(27);

            case 35:
              // Any item that's newly created here or updated will need to be persisted
              itemsNeedingLocalSave = [];
              _iteratorNormalCompletion12 = true;
              _didIteratorError12 = false;
              _iteratorError12 = undefined;
              _context24.prev = 39;
              _iterator12 = conflicts[Symbol.iterator]();

            case 41:
              if (_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done) {
                _context24.next = 93;
                break;
              }

              _conflict = _step12.value;
              // if sync_conflict, we receive conflict.server_item.
              // If uuid_conflict, we receive the value we attempted to save.
              _serverItemResponse = _conflict.server_item || _conflict.unsaved_item;
              _context24.t1 = regeneratorRuntime;
              _context24.t2 = _Protocol_manager__WEBPACK_IMPORTED_MODULE_1__["protocolManager"];
              _context24.t3 = [_serverItemResponse];
              _context24.next = 49;
              return regeneratorRuntime.awrap(this.getActiveKeyInfo(SFSyncManager.KeyRequestLoadSaveAccount));

            case 49:
              _context24.t4 = _context24.sent.keys;
              _context24.t5 = _context24.t2.decryptMultipleItems.call(_context24.t2, _context24.t3, _context24.t4);
              _context24.next = 53;
              return _context24.t1.awrap.call(_context24.t1, _context24.t5);

            case 53:
              _localValues$_serverI = localValues[_serverItemResponse.uuid], _frozenCurrentContent = _localValues$_serverI.frozenCurrentContent, itemRef = _localValues$_serverI.itemRef; // Could be deleted

              if (itemRef) {
                _context24.next = 56;
                break;
              }

              return _context24.abrupt("continue", 90);

            case 56:
              // Item ref is always added, since it's value will have changed below, either by mapping, being set to dirty,
              // or being set undirty by the caller but the caller not saving because they're waiting on us.
              itemsNeedingLocalSave.push(itemRef);

              if (!(_conflict.type === "uuid_conflict")) {
                _context24.next = 64;
                break;
              }

              _context24.next = 60;
              return regeneratorRuntime.awrap(this.modelManager.alternateUUIDForItem(itemRef));

            case 60:
              newItem = _context24.sent;
              itemsNeedingLocalSave.push(newItem);
              _context24.next = 90;
              break;

            case 64:
              if (!(_conflict.type === "sync_conflict")) {
                _context24.next = 88;
                break;
              }

              _context24.next = 67;
              return regeneratorRuntime.awrap(this.modelManager.createDuplicateItemFromResponseItem(_serverItemResponse));

            case 67:
              tempServerItem = _context24.sent;
              // Convert to an object simply so we can have access to the `isItemContentEqualWith` function.
              tempCurrentItemWithFrozenValues = this.modelManager.duplicateItemWithCustomContent({
                content: _frozenCurrentContent,
                duplicateOf: itemRef
              }); // if !frozenContentDiffers && currentContentDiffers, it means values have changed as we were looping through conflicts here.

              frozenContentDiffers = !tempCurrentItemWithFrozenValues.isItemContentEqualWith(tempServerItem);
              currentContentDiffers = !itemRef.isItemContentEqualWith(tempServerItem);
              duplicateLocal = false;
              duplicateServer = false;
              keepLocal = false;
              keepServer = false;

              if (_serverItemResponse.deleted || itemRef.deleted) {
                keepServer = true;
              } else if (frozenContentDiffers) {
                IsActiveItemSecondsThreshold = 20;
                isActivelyBeingEdited = (new Date() - itemRef.client_updated_at) / 1000 < IsActiveItemSecondsThreshold;

                if (isActivelyBeingEdited) {
                  keepLocal = true;
                  duplicateServer = true;
                } else {
                  duplicateLocal = true;
                  keepServer = true;
                }
              } else if (currentContentDiffers) {
                contentExcludingReferencesDiffers = !SFItem.AreItemContentsEqual({
                  leftContent: itemRef.content,
                  rightContent: tempServerItem.content,
                  keysToIgnore: itemRef.keysToIgnoreWhenCheckingContentEquality().concat(["references"]),
                  appDataKeysToIgnore: itemRef.appDataKeysToIgnoreWhenCheckingContentEquality()
                });
                isOnlyReferenceChange = !contentExcludingReferencesDiffers;

                if (isOnlyReferenceChange) {
                  keepLocal = true;
                } else {
                  duplicateLocal = true;
                  keepServer = true;
                }
              } else {
                // items are exactly equal
                keepServer = true;
              }

              if (!duplicateLocal) {
                _context24.next = 81;
                break;
              }

              _context24.next = 79;
              return regeneratorRuntime.awrap(this.modelManager.duplicateItemWithCustomContentAndAddAsConflict({
                content: _frozenCurrentContent,
                duplicateOf: itemRef
              }));

            case 79:
              localDuplicate = _context24.sent;
              itemsNeedingLocalSave.push(localDuplicate);

            case 81:
              if (duplicateServer) {
                this.modelManager.addDuplicatedItemAsConflict({
                  duplicate: tempServerItem,
                  duplicateOf: itemRef
                });
                itemsNeedingLocalSave.push(tempServerItem);
              }

              if (!keepServer) {
                _context24.next = 85;
                break;
              }

              _context24.next = 85;
              return regeneratorRuntime.awrap(this.modelManager.mapResponseItemsToLocalModelsOmittingFields([_serverItemResponse], null, _Services_modelManager__WEBPACK_IMPORTED_MODULE_2__["SFModelManager"].MappingSourceRemoteRetrieved));

            case 85:
              if (keepLocal) {
                itemRef.updated_at = tempServerItem.updated_at;
                itemRef.setDirty(true);
              }

              _context24.next = 90;
              break;

            case 88:
              console.error("Unsupported conflict type", _conflict.type);
              return _context24.abrupt("continue", 90);

            case 90:
              _iteratorNormalCompletion12 = true;
              _context24.next = 41;
              break;

            case 93:
              _context24.next = 99;
              break;

            case 95:
              _context24.prev = 95;
              _context24.t6 = _context24["catch"](39);
              _didIteratorError12 = true;
              _iteratorError12 = _context24.t6;

            case 99:
              _context24.prev = 99;
              _context24.prev = 100;

              if (!_iteratorNormalCompletion12 && _iterator12.return != null) {
                _iterator12.return();
              }

            case 102:
              _context24.prev = 102;

              if (!_didIteratorError12) {
                _context24.next = 105;
                break;
              }

              throw _iteratorError12;

            case 105:
              return _context24.finish(102);

            case 106:
              return _context24.finish(99);

            case 107:
              return _context24.abrupt("return", itemsNeedingLocalSave);

            case 108:
            case "end":
              return _context24.stop();
          }
        }
      }, null, this, [[7, 23, 27, 35], [28,, 30, 34], [39, 95, 99, 107], [100,, 102, 106]]);
    } // Legacy API

  }, {
    key: "deprecated_handleUnsavedItemsResponse",
    value: function deprecated_handleUnsavedItemsResponse(unsaved) {
      var _iteratorNormalCompletion13, _didIteratorError13, _iteratorError13, _iterator13, _step13, mapping, itemResponse, item, error, dup;

      return regeneratorRuntime.async(function deprecated_handleUnsavedItemsResponse$(_context25) {
        while (1) {
          switch (_context25.prev = _context25.next) {
            case 0:
              if (!(!unsaved || unsaved.length == 0)) {
                _context25.next = 2;
                break;
              }

              return _context25.abrupt("return");

            case 2:
              if (this.loggingEnabled) {
                console.log("Handle Unsaved Items:", unsaved);
              }

              _iteratorNormalCompletion13 = true;
              _didIteratorError13 = false;
              _iteratorError13 = undefined;
              _context25.prev = 6;
              _iterator13 = unsaved[Symbol.iterator]();

            case 8:
              if (_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done) {
                _context25.next = 37;
                break;
              }

              mapping = _step13.value;
              itemResponse = mapping.item;
              _context25.t0 = regeneratorRuntime;
              _context25.t1 = _Protocol_manager__WEBPACK_IMPORTED_MODULE_1__["protocolManager"];
              _context25.t2 = [itemResponse];
              _context25.next = 16;
              return regeneratorRuntime.awrap(this.getActiveKeyInfo(SFSyncManager.KeyRequestLoadSaveAccount));

            case 16:
              _context25.t3 = _context25.sent.keys;
              _context25.t4 = _context25.t1.decryptMultipleItems.call(_context25.t1, _context25.t2, _context25.t3);
              _context25.next = 20;
              return _context25.t0.awrap.call(_context25.t0, _context25.t4);

            case 20:
              item = this.modelManager.findItem(itemResponse.uuid); // Could be deleted

              if (item) {
                _context25.next = 23;
                break;
              }

              return _context25.abrupt("continue", 34);

            case 23:
              error = mapping.error;

              if (!(error.tag === "uuid_conflict")) {
                _context25.next = 29;
                break;
              }

              _context25.next = 27;
              return regeneratorRuntime.awrap(this.modelManager.alternateUUIDForItem(item));

            case 27:
              _context25.next = 34;
              break;

            case 29:
              if (!(error.tag === "sync_conflict")) {
                _context25.next = 34;
                break;
              }

              _context25.next = 32;
              return regeneratorRuntime.awrap(this.modelManager.createDuplicateItemFromResponseItem(itemResponse));

            case 32:
              dup = _context25.sent;

              if (!itemResponse.deleted && !item.isItemContentEqualWith(dup)) {
                this.modelManager.addDuplicatedItemAsConflict({
                  duplicate: dup,
                  duplicateOf: item
                });
              }

            case 34:
              _iteratorNormalCompletion13 = true;
              _context25.next = 8;
              break;

            case 37:
              _context25.next = 43;
              break;

            case 39:
              _context25.prev = 39;
              _context25.t5 = _context25["catch"](6);
              _didIteratorError13 = true;
              _iteratorError13 = _context25.t5;

            case 43:
              _context25.prev = 43;
              _context25.prev = 44;

              if (!_iteratorNormalCompletion13 && _iterator13.return != null) {
                _iterator13.return();
              }

            case 46:
              _context25.prev = 46;

              if (!_didIteratorError13) {
                _context25.next = 49;
                break;
              }

              throw _iteratorError13;

            case 49:
              return _context25.finish(46);

            case 50:
              return _context25.finish(43);

            case 51:
            case "end":
              return _context25.stop();
          }
        }
      }, null, this, [[6, 39, 43, 51], [44,, 46, 50]]);
    }
    /*
      Executes a sync request with a blank sync token and high download limit. It will download all items,
      but won't do anything with them other than decrypting, creating respective objects, and returning them to caller. (it does not map them nor establish their relationships)
      The use case came primarly for clients who had ignored a certain content_type in sync, but later issued an update
      indicated they actually did want to start handling that content type. In that case, they would need to download all items
      freshly from the server.
    */

  }, {
    key: "stateless_downloadAllItems",
    value: function stateless_downloadAllItems() {
      var _this8 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return new Promise(function _callee6(resolve, reject) {
        var params;
        return regeneratorRuntime.async(function _callee6$(_context27) {
          while (1) {
            switch (_context27.prev = _context27.next) {
              case 0:
                params = {
                  limit: options.limit || 500,
                  sync_token: options.syncToken,
                  cursor_token: options.cursorToken,
                  content_type: options.contentType,
                  event: options.event,
                  api: _Services_httpManager__WEBPACK_IMPORTED_MODULE_4__["SFHttpManager"].getApiVersion()
                };
                _context27.prev = 1;
                _context27.t0 = _this8.httpManager;
                _context27.next = 5;
                return regeneratorRuntime.awrap(_this8.getSyncURL());

              case 5:
                _context27.t1 = _context27.sent;
                _context27.t2 = params;

                _context27.t3 = function _callee5(response) {
                  var incomingItems, keys;
                  return regeneratorRuntime.async(function _callee5$(_context26) {
                    while (1) {
                      switch (_context26.prev = _context26.next) {
                        case 0:
                          if (!options.retrievedItems) {
                            options.retrievedItems = [];
                          }

                          incomingItems = response.retrieved_items;
                          _context26.next = 4;
                          return regeneratorRuntime.awrap(_this8.getActiveKeyInfo(SFSyncManager.KeyRequestLoadSaveAccount));

                        case 4:
                          keys = _context26.sent.keys;
                          _context26.next = 7;
                          return regeneratorRuntime.awrap(_Protocol_manager__WEBPACK_IMPORTED_MODULE_1__["protocolManager"].decryptMultipleItems(incomingItems, keys));

                        case 7:
                          options.retrievedItems = options.retrievedItems.concat(incomingItems.map(function (incomingItem) {
                            // Create model classes
                            return _this8.modelManager.createItem(incomingItem);
                          }));
                          options.syncToken = response.sync_token;
                          options.cursorToken = response.cursor_token;

                          if (options.cursorToken) {
                            _this8.stateless_downloadAllItems(options).then(resolve);
                          } else {
                            resolve(options.retrievedItems);
                          }

                        case 11:
                        case "end":
                          return _context26.stop();
                      }
                    }
                  });
                };

                _context27.t4 = function (response, statusCode) {
                  reject(response);
                };

                _context27.t0.postAuthenticatedAbsolute.call(_context27.t0, _context27.t1, _context27.t2, _context27.t3, _context27.t4);

                _context27.next = 16;
                break;

              case 12:
                _context27.prev = 12;
                _context27.t5 = _context27["catch"](1);
                console.log("Download all items exception caught:", _context27.t5);
                reject(_context27.t5);

              case 16:
              case "end":
                return _context27.stop();
            }
          }
        }, null, null, [[1, 12]]);
      });
    }
  }, {
    key: "resolveOutOfSync",
    value: function resolveOutOfSync() {
      var _this9 = this;

      return regeneratorRuntime.async(function resolveOutOfSync$(_context29) {
        while (1) {
          switch (_context29.prev = _context29.next) {
            case 0:
              return _context29.abrupt("return", this.stateless_downloadAllItems({
                event: "resolve-out-of-sync"
              }).then(function _callee7(downloadedItems) {
                var itemsToMap, _iteratorNormalCompletion14, _didIteratorError14, _iteratorError14, _iterator14, _step14, downloadedItem, existingItem, contentDoesntMatch;

                return regeneratorRuntime.async(function _callee7$(_context28) {
                  while (1) {
                    switch (_context28.prev = _context28.next) {
                      case 0:
                        itemsToMap = [];
                        _iteratorNormalCompletion14 = true;
                        _didIteratorError14 = false;
                        _iteratorError14 = undefined;
                        _context28.prev = 4;
                        _iterator14 = downloadedItems[Symbol.iterator]();

                      case 6:
                        if (_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done) {
                          _context28.next = 18;
                          break;
                        }

                        downloadedItem = _step14.value;
                        // Note that deleted items will not be sent back by the server.
                        existingItem = _this9.modelManager.findItem(downloadedItem.uuid);

                        if (!existingItem) {
                          _context28.next = 14;
                          break;
                        }

                        // Check if the content differs. If it does, create a new item, and do not map downloadedItem.
                        contentDoesntMatch = !downloadedItem.isItemContentEqualWith(existingItem);

                        if (!contentDoesntMatch) {
                          _context28.next = 14;
                          break;
                        }

                        _context28.next = 14;
                        return regeneratorRuntime.awrap(_this9.modelManager.duplicateItemAndAddAsConflict(existingItem));

                      case 14:
                        // Map the downloadedItem as authoritive content. If client copy at all differed, we would have created a duplicate of it above and synced it.
                        // This is also neccessary to map the updated_at value from the server
                        itemsToMap.push(downloadedItem);

                      case 15:
                        _iteratorNormalCompletion14 = true;
                        _context28.next = 6;
                        break;

                      case 18:
                        _context28.next = 24;
                        break;

                      case 20:
                        _context28.prev = 20;
                        _context28.t0 = _context28["catch"](4);
                        _didIteratorError14 = true;
                        _iteratorError14 = _context28.t0;

                      case 24:
                        _context28.prev = 24;
                        _context28.prev = 25;

                        if (!_iteratorNormalCompletion14 && _iterator14.return != null) {
                          _iterator14.return();
                        }

                      case 27:
                        _context28.prev = 27;

                        if (!_didIteratorError14) {
                          _context28.next = 30;
                          break;
                        }

                        throw _iteratorError14;

                      case 30:
                        return _context28.finish(27);

                      case 31:
                        return _context28.finish(24);

                      case 32:
                        _context28.next = 34;
                        return regeneratorRuntime.awrap(_this9.modelManager.mapResponseItemsToLocalModelsWithOptions({
                          items: itemsToMap,
                          source: _Services_modelManager__WEBPACK_IMPORTED_MODULE_2__["SFModelManager"].MappingSourceRemoteRetrieved
                        }));

                      case 34:
                        _context28.next = 36;
                        return regeneratorRuntime.awrap(_this9.writeItemsToLocalStorage(_this9.modelManager.allNondummyItems));

                      case 36:
                        return _context28.abrupt("return", _this9.sync({
                          performIntegrityCheck: true
                        }));

                      case 37:
                      case "end":
                        return _context28.stop();
                    }
                  }
                }, null, null, [[4, 20, 24, 32], [25,, 27, 31]]);
              }));

            case 1:
            case "end":
              return _context29.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "handleSignout",
    value: function handleSignout() {
      return regeneratorRuntime.async(function handleSignout$(_context30) {
        while (1) {
          switch (_context30.prev = _context30.next) {
            case 0:
              this.outOfSync = false;
              this.loadLocalDataPromise = null;
              this.performSyncAgainOnCompletion = false;
              this.syncStatus.syncOpInProgress = false;
              this._queuedCallbacks = [];
              this.syncStatus = {};
              return _context30.abrupt("return", this.clearSyncToken());

            case 7:
            case "end":
              return _context30.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "clearSyncToken",
    value: function clearSyncToken() {
      return regeneratorRuntime.async(function clearSyncToken$(_context31) {
        while (1) {
          switch (_context31.prev = _context31.next) {
            case 0:
              this._syncToken = null;
              this._cursorToken = null;
              return _context31.abrupt("return", this.storageManager.removeItem("syncToken"));

            case 3:
            case "end":
              return _context31.stop();
          }
        }
      }, null, this);
    } // Only used by unit test

  }, {
    key: "__setLocalDataNotLoaded",
    value: function __setLocalDataNotLoaded() {
      this.loadLocalDataPromise = null;
      this._initialDataLoaded = false;
    }
  }, {
    key: "queuedCallbacks",
    get: function get() {
      if (!this._queuedCallbacks) {
        this._queuedCallbacks = [];
      }

      return this._queuedCallbacks;
    }
  }]);

  return SFSyncManager;
}();

/***/ }),

/***/ "./lib/utils.js":
/*!**********************!*\
  !*** ./lib/utils.js ***!
  \**********************/
/*! exports provided: getGlobalScope, isWebEnvironment, findInArray */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(global) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getGlobalScope", function() { return getGlobalScope; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isWebEnvironment", function() { return isWebEnvironment; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findInArray", function() { return findInArray; });
function getGlobalScope() {
  return typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : null;
}
function isWebEnvironment() {
  return getGlobalScope() !== null;
}
function findInArray(array, key, value) {
  return array.find(function (item) {
    return item[key] === value;
  });
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/lodash/_DataView.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_DataView.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");
/* Built-in method references that are verified to be native. */


var DataView = getNative(root, 'DataView');
module.exports = DataView;

/***/ }),

/***/ "./node_modules/lodash/_Hash.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/_Hash.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var hashClear = __webpack_require__(/*! ./_hashClear */ "./node_modules/lodash/_hashClear.js"),
    hashDelete = __webpack_require__(/*! ./_hashDelete */ "./node_modules/lodash/_hashDelete.js"),
    hashGet = __webpack_require__(/*! ./_hashGet */ "./node_modules/lodash/_hashGet.js"),
    hashHas = __webpack_require__(/*! ./_hashHas */ "./node_modules/lodash/_hashHas.js"),
    hashSet = __webpack_require__(/*! ./_hashSet */ "./node_modules/lodash/_hashSet.js");
/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */


function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();

  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
} // Add methods to `Hash`.


Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;
module.exports = Hash;

/***/ }),

/***/ "./node_modules/lodash/_ListCache.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_ListCache.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var listCacheClear = __webpack_require__(/*! ./_listCacheClear */ "./node_modules/lodash/_listCacheClear.js"),
    listCacheDelete = __webpack_require__(/*! ./_listCacheDelete */ "./node_modules/lodash/_listCacheDelete.js"),
    listCacheGet = __webpack_require__(/*! ./_listCacheGet */ "./node_modules/lodash/_listCacheGet.js"),
    listCacheHas = __webpack_require__(/*! ./_listCacheHas */ "./node_modules/lodash/_listCacheHas.js"),
    listCacheSet = __webpack_require__(/*! ./_listCacheSet */ "./node_modules/lodash/_listCacheSet.js");
/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */


function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();

  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
} // Add methods to `ListCache`.


ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;
module.exports = ListCache;

/***/ }),

/***/ "./node_modules/lodash/_Map.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/_Map.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");
/* Built-in method references that are verified to be native. */


var Map = getNative(root, 'Map');
module.exports = Map;

/***/ }),

/***/ "./node_modules/lodash/_MapCache.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_MapCache.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var mapCacheClear = __webpack_require__(/*! ./_mapCacheClear */ "./node_modules/lodash/_mapCacheClear.js"),
    mapCacheDelete = __webpack_require__(/*! ./_mapCacheDelete */ "./node_modules/lodash/_mapCacheDelete.js"),
    mapCacheGet = __webpack_require__(/*! ./_mapCacheGet */ "./node_modules/lodash/_mapCacheGet.js"),
    mapCacheHas = __webpack_require__(/*! ./_mapCacheHas */ "./node_modules/lodash/_mapCacheHas.js"),
    mapCacheSet = __webpack_require__(/*! ./_mapCacheSet */ "./node_modules/lodash/_mapCacheSet.js");
/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */


function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();

  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
} // Add methods to `MapCache`.


MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;
module.exports = MapCache;

/***/ }),

/***/ "./node_modules/lodash/_Promise.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_Promise.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");
/* Built-in method references that are verified to be native. */


var Promise = getNative(root, 'Promise');
module.exports = Promise;

/***/ }),

/***/ "./node_modules/lodash/_Set.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/_Set.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");
/* Built-in method references that are verified to be native. */


var Set = getNative(root, 'Set');
module.exports = Set;

/***/ }),

/***/ "./node_modules/lodash/_SetCache.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_SetCache.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var MapCache = __webpack_require__(/*! ./_MapCache */ "./node_modules/lodash/_MapCache.js"),
    setCacheAdd = __webpack_require__(/*! ./_setCacheAdd */ "./node_modules/lodash/_setCacheAdd.js"),
    setCacheHas = __webpack_require__(/*! ./_setCacheHas */ "./node_modules/lodash/_setCacheHas.js");
/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */


function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;
  this.__data__ = new MapCache();

  while (++index < length) {
    this.add(values[index]);
  }
} // Add methods to `SetCache`.


SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;
module.exports = SetCache;

/***/ }),

/***/ "./node_modules/lodash/_Stack.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/_Stack.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js"),
    stackClear = __webpack_require__(/*! ./_stackClear */ "./node_modules/lodash/_stackClear.js"),
    stackDelete = __webpack_require__(/*! ./_stackDelete */ "./node_modules/lodash/_stackDelete.js"),
    stackGet = __webpack_require__(/*! ./_stackGet */ "./node_modules/lodash/_stackGet.js"),
    stackHas = __webpack_require__(/*! ./_stackHas */ "./node_modules/lodash/_stackHas.js"),
    stackSet = __webpack_require__(/*! ./_stackSet */ "./node_modules/lodash/_stackSet.js");
/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */


function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
} // Add methods to `Stack`.


Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;
module.exports = Stack;

/***/ }),

/***/ "./node_modules/lodash/_Symbol.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/_Symbol.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");
/** Built-in value references. */


var _Symbol = root.Symbol;
module.exports = _Symbol;

/***/ }),

/***/ "./node_modules/lodash/_Uint8Array.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_Uint8Array.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");
/** Built-in value references. */


var Uint8Array = root.Uint8Array;
module.exports = Uint8Array;

/***/ }),

/***/ "./node_modules/lodash/_WeakMap.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_WeakMap.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js"),
    root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");
/* Built-in method references that are verified to be native. */


var WeakMap = getNative(root, 'WeakMap');
module.exports = WeakMap;

/***/ }),

/***/ "./node_modules/lodash/_apply.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/_apply.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);

    case 1:
      return func.call(thisArg, args[0]);

    case 2:
      return func.call(thisArg, args[0], args[1]);

    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }

  return func.apply(thisArg, args);
}

module.exports = apply;

/***/ }),

/***/ "./node_modules/lodash/_arrayEach.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_arrayEach.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }

  return array;
}

module.exports = arrayEach;

/***/ }),

/***/ "./node_modules/lodash/_arrayFilter.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_arrayFilter.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];

    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }

  return result;
}

module.exports = arrayFilter;

/***/ }),

/***/ "./node_modules/lodash/_arrayIncludes.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_arrayIncludes.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseIndexOf = __webpack_require__(/*! ./_baseIndexOf */ "./node_modules/lodash/_baseIndexOf.js");
/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */


function arrayIncludes(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && baseIndexOf(array, value, 0) > -1;
}

module.exports = arrayIncludes;

/***/ }),

/***/ "./node_modules/lodash/_arrayIncludesWith.js":
/*!***************************************************!*\
  !*** ./node_modules/lodash/_arrayIncludesWith.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * This function is like `arrayIncludes` except that it accepts a comparator.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludesWith(array, value, comparator) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }

  return false;
}

module.exports = arrayIncludesWith;

/***/ }),

/***/ "./node_modules/lodash/_arrayLikeKeys.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_arrayLikeKeys.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseTimes = __webpack_require__(/*! ./_baseTimes */ "./node_modules/lodash/_baseTimes.js"),
    isArguments = __webpack_require__(/*! ./isArguments */ "./node_modules/lodash/isArguments.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isBuffer = __webpack_require__(/*! ./isBuffer */ "./node_modules/lodash/isBuffer.js"),
    isIndex = __webpack_require__(/*! ./_isIndex */ "./node_modules/lodash/_isIndex.js"),
    isTypedArray = __webpack_require__(/*! ./isTypedArray */ "./node_modules/lodash/isTypedArray.js");
/** Used for built-in method references. */


var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */

function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && ( // Safari 9 has enumerable `arguments.length` in strict mode.
    key == 'length' || // Node.js 0.10 has enumerable non-index properties on buffers.
    isBuff && (key == 'offset' || key == 'parent') || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') || // Skip index properties.
    isIndex(key, length)))) {
      result.push(key);
    }
  }

  return result;
}

module.exports = arrayLikeKeys;

/***/ }),

/***/ "./node_modules/lodash/_arrayMap.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_arrayMap.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }

  return result;
}

module.exports = arrayMap;

/***/ }),

/***/ "./node_modules/lodash/_arrayPush.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_arrayPush.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }

  return array;
}

module.exports = arrayPush;

/***/ }),

/***/ "./node_modules/lodash/_arraySome.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_arraySome.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }

  return false;
}

module.exports = arraySome;

/***/ }),

/***/ "./node_modules/lodash/_assignMergeValue.js":
/*!**************************************************!*\
  !*** ./node_modules/lodash/_assignMergeValue.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseAssignValue = __webpack_require__(/*! ./_baseAssignValue */ "./node_modules/lodash/_baseAssignValue.js"),
    eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js");
/**
 * This function is like `assignValue` except that it doesn't assign
 * `undefined` values.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */


function assignMergeValue(object, key, value) {
  if (value !== undefined && !eq(object[key], value) || value === undefined && !(key in object)) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignMergeValue;

/***/ }),

/***/ "./node_modules/lodash/_assignValue.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_assignValue.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseAssignValue = __webpack_require__(/*! ./_baseAssignValue */ "./node_modules/lodash/_baseAssignValue.js"),
    eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js");
/** Used for built-in method references. */


var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */

function assignValue(object, key, value) {
  var objValue = object[key];

  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === undefined && !(key in object)) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignValue;

/***/ }),

/***/ "./node_modules/lodash/_assocIndexOf.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_assocIndexOf.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js");
/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */


function assocIndexOf(array, key) {
  var length = array.length;

  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }

  return -1;
}

module.exports = assocIndexOf;

/***/ }),

/***/ "./node_modules/lodash/_baseAssign.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseAssign.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__(/*! ./_copyObject */ "./node_modules/lodash/_copyObject.js"),
    keys = __webpack_require__(/*! ./keys */ "./node_modules/lodash/keys.js");
/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */


function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

module.exports = baseAssign;

/***/ }),

/***/ "./node_modules/lodash/_baseAssignIn.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_baseAssignIn.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__(/*! ./_copyObject */ "./node_modules/lodash/_copyObject.js"),
    keysIn = __webpack_require__(/*! ./keysIn */ "./node_modules/lodash/keysIn.js");
/**
 * The base implementation of `_.assignIn` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */


function baseAssignIn(object, source) {
  return object && copyObject(source, keysIn(source), object);
}

module.exports = baseAssignIn;

/***/ }),

/***/ "./node_modules/lodash/_baseAssignValue.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_baseAssignValue.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var defineProperty = __webpack_require__(/*! ./_defineProperty */ "./node_modules/lodash/_defineProperty.js");
/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */


function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

module.exports = baseAssignValue;

/***/ }),

/***/ "./node_modules/lodash/_baseClone.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseClone.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Stack = __webpack_require__(/*! ./_Stack */ "./node_modules/lodash/_Stack.js"),
    arrayEach = __webpack_require__(/*! ./_arrayEach */ "./node_modules/lodash/_arrayEach.js"),
    assignValue = __webpack_require__(/*! ./_assignValue */ "./node_modules/lodash/_assignValue.js"),
    baseAssign = __webpack_require__(/*! ./_baseAssign */ "./node_modules/lodash/_baseAssign.js"),
    baseAssignIn = __webpack_require__(/*! ./_baseAssignIn */ "./node_modules/lodash/_baseAssignIn.js"),
    cloneBuffer = __webpack_require__(/*! ./_cloneBuffer */ "./node_modules/lodash/_cloneBuffer.js"),
    copyArray = __webpack_require__(/*! ./_copyArray */ "./node_modules/lodash/_copyArray.js"),
    copySymbols = __webpack_require__(/*! ./_copySymbols */ "./node_modules/lodash/_copySymbols.js"),
    copySymbolsIn = __webpack_require__(/*! ./_copySymbolsIn */ "./node_modules/lodash/_copySymbolsIn.js"),
    getAllKeys = __webpack_require__(/*! ./_getAllKeys */ "./node_modules/lodash/_getAllKeys.js"),
    getAllKeysIn = __webpack_require__(/*! ./_getAllKeysIn */ "./node_modules/lodash/_getAllKeysIn.js"),
    getTag = __webpack_require__(/*! ./_getTag */ "./node_modules/lodash/_getTag.js"),
    initCloneArray = __webpack_require__(/*! ./_initCloneArray */ "./node_modules/lodash/_initCloneArray.js"),
    initCloneByTag = __webpack_require__(/*! ./_initCloneByTag */ "./node_modules/lodash/_initCloneByTag.js"),
    initCloneObject = __webpack_require__(/*! ./_initCloneObject */ "./node_modules/lodash/_initCloneObject.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isBuffer = __webpack_require__(/*! ./isBuffer */ "./node_modules/lodash/isBuffer.js"),
    isMap = __webpack_require__(/*! ./isMap */ "./node_modules/lodash/isMap.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    isSet = __webpack_require__(/*! ./isSet */ "./node_modules/lodash/isSet.js"),
    keys = __webpack_require__(/*! ./keys */ "./node_modules/lodash/keys.js");
/** Used to compose bitmasks for cloning. */


var CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4;
/** `Object#toString` result references. */

var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';
var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';
/** Used to identify `toStringTag` values supported by `_.clone`. */

var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Deep clone
 *  2 - Flatten inherited properties
 *  4 - Clone symbols
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */

function baseClone(value, bitmask, customizer, key, object, stack) {
  var result,
      isDeep = bitmask & CLONE_DEEP_FLAG,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }

  if (result !== undefined) {
    return result;
  }

  if (!isObject(value)) {
    return value;
  }

  var isArr = isArray(value);

  if (isArr) {
    result = initCloneArray(value);

    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }

    if (tag == objectTag || tag == argsTag || isFunc && !object) {
      result = isFlat || isFunc ? {} : initCloneObject(value);

      if (!isDeep) {
        return isFlat ? copySymbolsIn(value, baseAssignIn(result, value)) : copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }

      result = initCloneByTag(value, tag, isDeep);
    }
  } // Check for circular references and return its corresponding clone.


  stack || (stack = new Stack());
  var stacked = stack.get(value);

  if (stacked) {
    return stacked;
  }

  stack.set(value, result);

  if (isSet(value)) {
    value.forEach(function (subValue) {
      result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
    });
  } else if (isMap(value)) {
    value.forEach(function (subValue, key) {
      result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
  }

  var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
  var props = isArr ? undefined : keysFunc(value);
  arrayEach(props || value, function (subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    } // Recursively populate clone (susceptible to call stack limits).


    assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
  });
  return result;
}

module.exports = baseClone;

/***/ }),

/***/ "./node_modules/lodash/_baseCreate.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseCreate.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js");
/** Built-in value references. */


var objectCreate = Object.create;
/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */

var baseCreate = function () {
  function object() {}

  return function (proto) {
    if (!isObject(proto)) {
      return {};
    }

    if (objectCreate) {
      return objectCreate(proto);
    }

    object.prototype = proto;
    var result = new object();
    object.prototype = undefined;
    return result;
  };
}();

module.exports = baseCreate;

/***/ }),

/***/ "./node_modules/lodash/_baseEach.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_baseEach.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseForOwn = __webpack_require__(/*! ./_baseForOwn */ "./node_modules/lodash/_baseForOwn.js"),
    createBaseEach = __webpack_require__(/*! ./_createBaseEach */ "./node_modules/lodash/_createBaseEach.js");
/**
 * The base implementation of `_.forEach` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 */


var baseEach = createBaseEach(baseForOwn);
module.exports = baseEach;

/***/ }),

/***/ "./node_modules/lodash/_baseFindIndex.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_baseFindIndex.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while (fromRight ? index-- : ++index < length) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }

  return -1;
}

module.exports = baseFindIndex;

/***/ }),

/***/ "./node_modules/lodash/_baseFlatten.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_baseFlatten.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayPush = __webpack_require__(/*! ./_arrayPush */ "./node_modules/lodash/_arrayPush.js"),
    isFlattenable = __webpack_require__(/*! ./_isFlattenable */ "./node_modules/lodash/_isFlattenable.js");
/**
 * The base implementation of `_.flatten` with support for restricting flattening.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {number} depth The maximum recursion depth.
 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */


function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1,
      length = array.length;
  predicate || (predicate = isFlattenable);
  result || (result = []);

  while (++index < length) {
    var value = array[index];

    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }

  return result;
}

module.exports = baseFlatten;

/***/ }),

/***/ "./node_modules/lodash/_baseFor.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_baseFor.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var createBaseFor = __webpack_require__(/*! ./_createBaseFor */ "./node_modules/lodash/_createBaseFor.js");
/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */


var baseFor = createBaseFor();
module.exports = baseFor;

/***/ }),

/***/ "./node_modules/lodash/_baseForOwn.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseForOwn.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseFor = __webpack_require__(/*! ./_baseFor */ "./node_modules/lodash/_baseFor.js"),
    keys = __webpack_require__(/*! ./keys */ "./node_modules/lodash/keys.js");
/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */


function baseForOwn(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}

module.exports = baseForOwn;

/***/ }),

/***/ "./node_modules/lodash/_baseGet.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_baseGet.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var castPath = __webpack_require__(/*! ./_castPath */ "./node_modules/lodash/_castPath.js"),
    toKey = __webpack_require__(/*! ./_toKey */ "./node_modules/lodash/_toKey.js");
/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */


function baseGet(object, path) {
  path = castPath(path, object);
  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }

  return index && index == length ? object : undefined;
}

module.exports = baseGet;

/***/ }),

/***/ "./node_modules/lodash/_baseGetAllKeys.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_baseGetAllKeys.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayPush = __webpack_require__(/*! ./_arrayPush */ "./node_modules/lodash/_arrayPush.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js");
/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */


function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

module.exports = baseGetAllKeys;

/***/ }),

/***/ "./node_modules/lodash/_baseGetTag.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseGetTag.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var _Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js"),
    getRawTag = __webpack_require__(/*! ./_getRawTag */ "./node_modules/lodash/_getRawTag.js"),
    objectToString = __webpack_require__(/*! ./_objectToString */ "./node_modules/lodash/_objectToString.js");
/** `Object#toString` result references. */


var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';
/** Built-in value references. */

var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;
/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */

function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }

  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}

module.exports = baseGetTag;

/***/ }),

/***/ "./node_modules/lodash/_baseHasIn.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseHasIn.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

module.exports = baseHasIn;

/***/ }),

/***/ "./node_modules/lodash/_baseIndexOf.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_baseIndexOf.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseFindIndex = __webpack_require__(/*! ./_baseFindIndex */ "./node_modules/lodash/_baseFindIndex.js"),
    baseIsNaN = __webpack_require__(/*! ./_baseIsNaN */ "./node_modules/lodash/_baseIsNaN.js"),
    strictIndexOf = __webpack_require__(/*! ./_strictIndexOf */ "./node_modules/lodash/_strictIndexOf.js");
/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */


function baseIndexOf(array, value, fromIndex) {
  return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
}

module.exports = baseIndexOf;

/***/ }),

/***/ "./node_modules/lodash/_baseIndexOfWith.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_baseIndexOfWith.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * This function is like `baseIndexOf` except that it accepts a comparator.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOfWith(array, value, fromIndex, comparator) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (comparator(array[index], value)) {
      return index;
    }
  }

  return -1;
}

module.exports = baseIndexOfWith;

/***/ }),

/***/ "./node_modules/lodash/_baseIsArguments.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_baseIsArguments.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");
/** `Object#toString` result references. */


var argsTag = '[object Arguments]';
/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */

function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

module.exports = baseIsArguments;

/***/ }),

/***/ "./node_modules/lodash/_baseIsEqual.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_baseIsEqual.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseIsEqualDeep = __webpack_require__(/*! ./_baseIsEqualDeep */ "./node_modules/lodash/_baseIsEqualDeep.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");
/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */


function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }

  if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
    return value !== value && other !== other;
  }

  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

module.exports = baseIsEqual;

/***/ }),

/***/ "./node_modules/lodash/_baseIsEqualDeep.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_baseIsEqualDeep.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Stack = __webpack_require__(/*! ./_Stack */ "./node_modules/lodash/_Stack.js"),
    equalArrays = __webpack_require__(/*! ./_equalArrays */ "./node_modules/lodash/_equalArrays.js"),
    equalByTag = __webpack_require__(/*! ./_equalByTag */ "./node_modules/lodash/_equalByTag.js"),
    equalObjects = __webpack_require__(/*! ./_equalObjects */ "./node_modules/lodash/_equalObjects.js"),
    getTag = __webpack_require__(/*! ./_getTag */ "./node_modules/lodash/_getTag.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isBuffer = __webpack_require__(/*! ./isBuffer */ "./node_modules/lodash/isBuffer.js"),
    isTypedArray = __webpack_require__(/*! ./isTypedArray */ "./node_modules/lodash/isTypedArray.js");
/** Used to compose bitmasks for value comparisons. */


var COMPARE_PARTIAL_FLAG = 1;
/** `Object#toString` result references. */

var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    objectTag = '[object Object]';
/** Used for built-in method references. */

var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */

function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = objIsArr ? arrayTag : getTag(object),
      othTag = othIsArr ? arrayTag : getTag(other);
  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;
  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }

    objIsArr = true;
    objIsObj = false;
  }

  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack());
    return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }

  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;
      stack || (stack = new Stack());
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }

  if (!isSameTag) {
    return false;
  }

  stack || (stack = new Stack());
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

module.exports = baseIsEqualDeep;

/***/ }),

/***/ "./node_modules/lodash/_baseIsMap.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseIsMap.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getTag = __webpack_require__(/*! ./_getTag */ "./node_modules/lodash/_getTag.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");
/** `Object#toString` result references. */


var mapTag = '[object Map]';
/**
 * The base implementation of `_.isMap` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 */

function baseIsMap(value) {
  return isObjectLike(value) && getTag(value) == mapTag;
}

module.exports = baseIsMap;

/***/ }),

/***/ "./node_modules/lodash/_baseIsMatch.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_baseIsMatch.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Stack = __webpack_require__(/*! ./_Stack */ "./node_modules/lodash/_Stack.js"),
    baseIsEqual = __webpack_require__(/*! ./_baseIsEqual */ "./node_modules/lodash/_baseIsEqual.js");
/** Used to compose bitmasks for value comparisons. */


var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;
/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */

function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }

  object = Object(object);

  while (index--) {
    var data = matchData[index];

    if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
      return false;
    }
  }

  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack();

      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }

      if (!(result === undefined ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result)) {
        return false;
      }
    }
  }

  return true;
}

module.exports = baseIsMatch;

/***/ }),

/***/ "./node_modules/lodash/_baseIsNaN.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseIsNaN.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

module.exports = baseIsNaN;

/***/ }),

/***/ "./node_modules/lodash/_baseIsNative.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_baseIsNative.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__(/*! ./isFunction */ "./node_modules/lodash/isFunction.js"),
    isMasked = __webpack_require__(/*! ./_isMasked */ "./node_modules/lodash/_isMasked.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    toSource = __webpack_require__(/*! ./_toSource */ "./node_modules/lodash/_toSource.js");
/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */


var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
/** Used to detect host constructors (Safari). */

var reIsHostCtor = /^\[object .+?Constructor\]$/;
/** Used for built-in method references. */

var funcProto = Function.prototype,
    objectProto = Object.prototype;
/** Used to resolve the decompiled source of functions. */

var funcToString = funcProto.toString;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/** Used to detect if a method is native. */

var reIsNative = RegExp('^' + funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */

function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }

  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;

/***/ }),

/***/ "./node_modules/lodash/_baseIsSet.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseIsSet.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getTag = __webpack_require__(/*! ./_getTag */ "./node_modules/lodash/_getTag.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");
/** `Object#toString` result references. */


var setTag = '[object Set]';
/**
 * The base implementation of `_.isSet` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 */

function baseIsSet(value) {
  return isObjectLike(value) && getTag(value) == setTag;
}

module.exports = baseIsSet;

/***/ }),

/***/ "./node_modules/lodash/_baseIsTypedArray.js":
/*!**************************************************!*\
  !*** ./node_modules/lodash/_baseIsTypedArray.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    isLength = __webpack_require__(/*! ./isLength */ "./node_modules/lodash/isLength.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");
/** `Object#toString` result references. */


var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';
var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';
/** Used to identify `toStringTag` values of typed arrays. */

var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */

function baseIsTypedArray(value) {
  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

module.exports = baseIsTypedArray;

/***/ }),

/***/ "./node_modules/lodash/_baseIteratee.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_baseIteratee.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var baseMatches = __webpack_require__(/*! ./_baseMatches */ "./node_modules/lodash/_baseMatches.js"),
    baseMatchesProperty = __webpack_require__(/*! ./_baseMatchesProperty */ "./node_modules/lodash/_baseMatchesProperty.js"),
    identity = __webpack_require__(/*! ./identity */ "./node_modules/lodash/identity.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    property = __webpack_require__(/*! ./property */ "./node_modules/lodash/property.js");
/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */


function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }

  if (value == null) {
    return identity;
  }

  if (_typeof(value) == 'object') {
    return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
  }

  return property(value);
}

module.exports = baseIteratee;

/***/ }),

/***/ "./node_modules/lodash/_baseKeys.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_baseKeys.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isPrototype = __webpack_require__(/*! ./_isPrototype */ "./node_modules/lodash/_isPrototype.js"),
    nativeKeys = __webpack_require__(/*! ./_nativeKeys */ "./node_modules/lodash/_nativeKeys.js");
/** Used for built-in method references. */


var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */

function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }

  var result = [];

  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }

  return result;
}

module.exports = baseKeys;

/***/ }),

/***/ "./node_modules/lodash/_baseKeysIn.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseKeysIn.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    isPrototype = __webpack_require__(/*! ./_isPrototype */ "./node_modules/lodash/_isPrototype.js"),
    nativeKeysIn = __webpack_require__(/*! ./_nativeKeysIn */ "./node_modules/lodash/_nativeKeysIn.js");
/** Used for built-in method references. */


var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */

function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }

  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }

  return result;
}

module.exports = baseKeysIn;

/***/ }),

/***/ "./node_modules/lodash/_baseMap.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_baseMap.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseEach = __webpack_require__(/*! ./_baseEach */ "./node_modules/lodash/_baseEach.js"),
    isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js");
/**
 * The base implementation of `_.map` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */


function baseMap(collection, iteratee) {
  var index = -1,
      result = isArrayLike(collection) ? Array(collection.length) : [];
  baseEach(collection, function (value, key, collection) {
    result[++index] = iteratee(value, key, collection);
  });
  return result;
}

module.exports = baseMap;

/***/ }),

/***/ "./node_modules/lodash/_baseMatches.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_baseMatches.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseIsMatch = __webpack_require__(/*! ./_baseIsMatch */ "./node_modules/lodash/_baseIsMatch.js"),
    getMatchData = __webpack_require__(/*! ./_getMatchData */ "./node_modules/lodash/_getMatchData.js"),
    matchesStrictComparable = __webpack_require__(/*! ./_matchesStrictComparable */ "./node_modules/lodash/_matchesStrictComparable.js");
/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */


function baseMatches(source) {
  var matchData = getMatchData(source);

  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }

  return function (object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}

module.exports = baseMatches;

/***/ }),

/***/ "./node_modules/lodash/_baseMatchesProperty.js":
/*!*****************************************************!*\
  !*** ./node_modules/lodash/_baseMatchesProperty.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseIsEqual = __webpack_require__(/*! ./_baseIsEqual */ "./node_modules/lodash/_baseIsEqual.js"),
    get = __webpack_require__(/*! ./get */ "./node_modules/lodash/get.js"),
    hasIn = __webpack_require__(/*! ./hasIn */ "./node_modules/lodash/hasIn.js"),
    isKey = __webpack_require__(/*! ./_isKey */ "./node_modules/lodash/_isKey.js"),
    isStrictComparable = __webpack_require__(/*! ./_isStrictComparable */ "./node_modules/lodash/_isStrictComparable.js"),
    matchesStrictComparable = __webpack_require__(/*! ./_matchesStrictComparable */ "./node_modules/lodash/_matchesStrictComparable.js"),
    toKey = __webpack_require__(/*! ./_toKey */ "./node_modules/lodash/_toKey.js");
/** Used to compose bitmasks for value comparisons. */


var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;
/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */

function baseMatchesProperty(path, srcValue) {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue);
  }

  return function (object) {
    var objValue = get(object, path);
    return objValue === undefined && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
  };
}

module.exports = baseMatchesProperty;

/***/ }),

/***/ "./node_modules/lodash/_baseMerge.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseMerge.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Stack = __webpack_require__(/*! ./_Stack */ "./node_modules/lodash/_Stack.js"),
    assignMergeValue = __webpack_require__(/*! ./_assignMergeValue */ "./node_modules/lodash/_assignMergeValue.js"),
    baseFor = __webpack_require__(/*! ./_baseFor */ "./node_modules/lodash/_baseFor.js"),
    baseMergeDeep = __webpack_require__(/*! ./_baseMergeDeep */ "./node_modules/lodash/_baseMergeDeep.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    keysIn = __webpack_require__(/*! ./keysIn */ "./node_modules/lodash/keysIn.js"),
    safeGet = __webpack_require__(/*! ./_safeGet */ "./node_modules/lodash/_safeGet.js");
/**
 * The base implementation of `_.merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */


function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }

  baseFor(source, function (srcValue, key) {
    stack || (stack = new Stack());

    if (isObject(srcValue)) {
      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    } else {
      var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + '', object, source, stack) : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }

      assignMergeValue(object, key, newValue);
    }
  }, keysIn);
}

module.exports = baseMerge;

/***/ }),

/***/ "./node_modules/lodash/_baseMergeDeep.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_baseMergeDeep.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var assignMergeValue = __webpack_require__(/*! ./_assignMergeValue */ "./node_modules/lodash/_assignMergeValue.js"),
    cloneBuffer = __webpack_require__(/*! ./_cloneBuffer */ "./node_modules/lodash/_cloneBuffer.js"),
    cloneTypedArray = __webpack_require__(/*! ./_cloneTypedArray */ "./node_modules/lodash/_cloneTypedArray.js"),
    copyArray = __webpack_require__(/*! ./_copyArray */ "./node_modules/lodash/_copyArray.js"),
    initCloneObject = __webpack_require__(/*! ./_initCloneObject */ "./node_modules/lodash/_initCloneObject.js"),
    isArguments = __webpack_require__(/*! ./isArguments */ "./node_modules/lodash/isArguments.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isArrayLikeObject = __webpack_require__(/*! ./isArrayLikeObject */ "./node_modules/lodash/isArrayLikeObject.js"),
    isBuffer = __webpack_require__(/*! ./isBuffer */ "./node_modules/lodash/isBuffer.js"),
    isFunction = __webpack_require__(/*! ./isFunction */ "./node_modules/lodash/isFunction.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    isPlainObject = __webpack_require__(/*! ./isPlainObject */ "./node_modules/lodash/isPlainObject.js"),
    isTypedArray = __webpack_require__(/*! ./isTypedArray */ "./node_modules/lodash/isTypedArray.js"),
    safeGet = __webpack_require__(/*! ./_safeGet */ "./node_modules/lodash/_safeGet.js"),
    toPlainObject = __webpack_require__(/*! ./toPlainObject */ "./node_modules/lodash/toPlainObject.js");
/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */


function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = safeGet(object, key),
      srcValue = safeGet(source, key),
      stacked = stack.get(srcValue);

  if (stacked) {
    assignMergeValue(object, key, stacked);
    return;
  }

  var newValue = customizer ? customizer(objValue, srcValue, key + '', object, source, stack) : undefined;
  var isCommon = newValue === undefined;

  if (isCommon) {
    var isArr = isArray(srcValue),
        isBuff = !isArr && isBuffer(srcValue),
        isTyped = !isArr && !isBuff && isTypedArray(srcValue);
    newValue = srcValue;

    if (isArr || isBuff || isTyped) {
      if (isArray(objValue)) {
        newValue = objValue;
      } else if (isArrayLikeObject(objValue)) {
        newValue = copyArray(objValue);
      } else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer(srcValue, true);
      } else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray(srcValue, true);
      } else {
        newValue = [];
      }
    } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      newValue = objValue;

      if (isArguments(objValue)) {
        newValue = toPlainObject(objValue);
      } else if (!isObject(objValue) || isFunction(objValue)) {
        newValue = initCloneObject(srcValue);
      }
    } else {
      isCommon = false;
    }
  }

  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }

  assignMergeValue(object, key, newValue);
}

module.exports = baseMergeDeep;

/***/ }),

/***/ "./node_modules/lodash/_basePick.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_basePick.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var basePickBy = __webpack_require__(/*! ./_basePickBy */ "./node_modules/lodash/_basePickBy.js"),
    hasIn = __webpack_require__(/*! ./hasIn */ "./node_modules/lodash/hasIn.js");
/**
 * The base implementation of `_.pick` without support for individual
 * property identifiers.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} paths The property paths to pick.
 * @returns {Object} Returns the new object.
 */


function basePick(object, paths) {
  return basePickBy(object, paths, function (value, path) {
    return hasIn(object, path);
  });
}

module.exports = basePick;

/***/ }),

/***/ "./node_modules/lodash/_basePickBy.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_basePickBy.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGet = __webpack_require__(/*! ./_baseGet */ "./node_modules/lodash/_baseGet.js"),
    baseSet = __webpack_require__(/*! ./_baseSet */ "./node_modules/lodash/_baseSet.js"),
    castPath = __webpack_require__(/*! ./_castPath */ "./node_modules/lodash/_castPath.js");
/**
 * The base implementation of  `_.pickBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} paths The property paths to pick.
 * @param {Function} predicate The function invoked per property.
 * @returns {Object} Returns the new object.
 */


function basePickBy(object, paths, predicate) {
  var index = -1,
      length = paths.length,
      result = {};

  while (++index < length) {
    var path = paths[index],
        value = baseGet(object, path);

    if (predicate(value, path)) {
      baseSet(result, castPath(path, object), value);
    }
  }

  return result;
}

module.exports = basePickBy;

/***/ }),

/***/ "./node_modules/lodash/_baseProperty.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_baseProperty.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function (object) {
    return object == null ? undefined : object[key];
  };
}

module.exports = baseProperty;

/***/ }),

/***/ "./node_modules/lodash/_basePropertyDeep.js":
/*!**************************************************!*\
  !*** ./node_modules/lodash/_basePropertyDeep.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGet = __webpack_require__(/*! ./_baseGet */ "./node_modules/lodash/_baseGet.js");
/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */


function basePropertyDeep(path) {
  return function (object) {
    return baseGet(object, path);
  };
}

module.exports = basePropertyDeep;

/***/ }),

/***/ "./node_modules/lodash/_basePullAll.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_basePullAll.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayMap = __webpack_require__(/*! ./_arrayMap */ "./node_modules/lodash/_arrayMap.js"),
    baseIndexOf = __webpack_require__(/*! ./_baseIndexOf */ "./node_modules/lodash/_baseIndexOf.js"),
    baseIndexOfWith = __webpack_require__(/*! ./_baseIndexOfWith */ "./node_modules/lodash/_baseIndexOfWith.js"),
    baseUnary = __webpack_require__(/*! ./_baseUnary */ "./node_modules/lodash/_baseUnary.js"),
    copyArray = __webpack_require__(/*! ./_copyArray */ "./node_modules/lodash/_copyArray.js");
/** Used for built-in method references. */


var arrayProto = Array.prototype;
/** Built-in value references. */

var splice = arrayProto.splice;
/**
 * The base implementation of `_.pullAllBy` without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to remove.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns `array`.
 */

function basePullAll(array, values, iteratee, comparator) {
  var indexOf = comparator ? baseIndexOfWith : baseIndexOf,
      index = -1,
      length = values.length,
      seen = array;

  if (array === values) {
    values = copyArray(values);
  }

  if (iteratee) {
    seen = arrayMap(array, baseUnary(iteratee));
  }

  while (++index < length) {
    var fromIndex = 0,
        value = values[index],
        computed = iteratee ? iteratee(value) : value;

    while ((fromIndex = indexOf(seen, computed, fromIndex, comparator)) > -1) {
      if (seen !== array) {
        splice.call(seen, fromIndex, 1);
      }

      splice.call(array, fromIndex, 1);
    }
  }

  return array;
}

module.exports = basePullAll;

/***/ }),

/***/ "./node_modules/lodash/_basePullAt.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_basePullAt.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseUnset = __webpack_require__(/*! ./_baseUnset */ "./node_modules/lodash/_baseUnset.js"),
    isIndex = __webpack_require__(/*! ./_isIndex */ "./node_modules/lodash/_isIndex.js");
/** Used for built-in method references. */


var arrayProto = Array.prototype;
/** Built-in value references. */

var splice = arrayProto.splice;
/**
 * The base implementation of `_.pullAt` without support for individual
 * indexes or capturing the removed elements.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {number[]} indexes The indexes of elements to remove.
 * @returns {Array} Returns `array`.
 */

function basePullAt(array, indexes) {
  var length = array ? indexes.length : 0,
      lastIndex = length - 1;

  while (length--) {
    var index = indexes[length];

    if (length == lastIndex || index !== previous) {
      var previous = index;

      if (isIndex(index)) {
        splice.call(array, index, 1);
      } else {
        baseUnset(array, index);
      }
    }
  }

  return array;
}

module.exports = basePullAt;

/***/ }),

/***/ "./node_modules/lodash/_baseRest.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_baseRest.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var identity = __webpack_require__(/*! ./identity */ "./node_modules/lodash/identity.js"),
    overRest = __webpack_require__(/*! ./_overRest */ "./node_modules/lodash/_overRest.js"),
    setToString = __webpack_require__(/*! ./_setToString */ "./node_modules/lodash/_setToString.js");
/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */


function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

module.exports = baseRest;

/***/ }),

/***/ "./node_modules/lodash/_baseSet.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_baseSet.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var assignValue = __webpack_require__(/*! ./_assignValue */ "./node_modules/lodash/_assignValue.js"),
    castPath = __webpack_require__(/*! ./_castPath */ "./node_modules/lodash/_castPath.js"),
    isIndex = __webpack_require__(/*! ./_isIndex */ "./node_modules/lodash/_isIndex.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    toKey = __webpack_require__(/*! ./_toKey */ "./node_modules/lodash/_toKey.js");
/**
 * The base implementation of `_.set`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {*} value The value to set.
 * @param {Function} [customizer] The function to customize path creation.
 * @returns {Object} Returns `object`.
 */


function baseSet(object, path, value, customizer) {
  if (!isObject(object)) {
    return object;
  }

  path = castPath(path, object);
  var index = -1,
      length = path.length,
      lastIndex = length - 1,
      nested = object;

  while (nested != null && ++index < length) {
    var key = toKey(path[index]),
        newValue = value;

    if (index != lastIndex) {
      var objValue = nested[key];
      newValue = customizer ? customizer(objValue, key, nested) : undefined;

      if (newValue === undefined) {
        newValue = isObject(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
      }
    }

    assignValue(nested, key, newValue);
    nested = nested[key];
  }

  return object;
}

module.exports = baseSet;

/***/ }),

/***/ "./node_modules/lodash/_baseSetToString.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_baseSetToString.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var constant = __webpack_require__(/*! ./constant */ "./node_modules/lodash/constant.js"),
    defineProperty = __webpack_require__(/*! ./_defineProperty */ "./node_modules/lodash/_defineProperty.js"),
    identity = __webpack_require__(/*! ./identity */ "./node_modules/lodash/identity.js");
/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */


var baseSetToString = !defineProperty ? identity : function (func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};
module.exports = baseSetToString;

/***/ }),

/***/ "./node_modules/lodash/_baseSlice.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseSlice.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : length + start;
  }

  end = end > length ? length : end;

  if (end < 0) {
    end += length;
  }

  length = start > end ? 0 : end - start >>> 0;
  start >>>= 0;
  var result = Array(length);

  while (++index < length) {
    result[index] = array[index + start];
  }

  return result;
}

module.exports = baseSlice;

/***/ }),

/***/ "./node_modules/lodash/_baseTimes.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseTimes.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }

  return result;
}

module.exports = baseTimes;

/***/ }),

/***/ "./node_modules/lodash/_baseToString.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_baseToString.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var _Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js"),
    arrayMap = __webpack_require__(/*! ./_arrayMap */ "./node_modules/lodash/_arrayMap.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isSymbol = __webpack_require__(/*! ./isSymbol */ "./node_modules/lodash/isSymbol.js");
/** Used as references for various `Number` constants. */


var INFINITY = 1 / 0;
/** Used to convert symbols to primitives and strings. */

var symbolProto = _Symbol ? _Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;
/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */

function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }

  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }

  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }

  var result = value + '';
  return result == '0' && 1 / value == -INFINITY ? '-0' : result;
}

module.exports = baseToString;

/***/ }),

/***/ "./node_modules/lodash/_baseUnary.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseUnary.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function (value) {
    return func(value);
  };
}

module.exports = baseUnary;

/***/ }),

/***/ "./node_modules/lodash/_baseUniq.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_baseUniq.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var SetCache = __webpack_require__(/*! ./_SetCache */ "./node_modules/lodash/_SetCache.js"),
    arrayIncludes = __webpack_require__(/*! ./_arrayIncludes */ "./node_modules/lodash/_arrayIncludes.js"),
    arrayIncludesWith = __webpack_require__(/*! ./_arrayIncludesWith */ "./node_modules/lodash/_arrayIncludesWith.js"),
    cacheHas = __webpack_require__(/*! ./_cacheHas */ "./node_modules/lodash/_cacheHas.js"),
    createSet = __webpack_require__(/*! ./_createSet */ "./node_modules/lodash/_createSet.js"),
    setToArray = __webpack_require__(/*! ./_setToArray */ "./node_modules/lodash/_setToArray.js");
/** Used as the size to enable large array optimizations. */


var LARGE_ARRAY_SIZE = 200;
/**
 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */

function baseUniq(array, iteratee, comparator) {
  var index = -1,
      includes = arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;

  if (comparator) {
    isCommon = false;
    includes = arrayIncludesWith;
  } else if (length >= LARGE_ARRAY_SIZE) {
    var set = iteratee ? null : createSet(array);

    if (set) {
      return setToArray(set);
    }

    isCommon = false;
    includes = cacheHas;
    seen = new SetCache();
  } else {
    seen = iteratee ? [] : result;
  }

  outer: while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;
    value = comparator || value !== 0 ? value : 0;

    if (isCommon && computed === computed) {
      var seenIndex = seen.length;

      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }

      if (iteratee) {
        seen.push(computed);
      }

      result.push(value);
    } else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed);
      }

      result.push(value);
    }
  }

  return result;
}

module.exports = baseUniq;

/***/ }),

/***/ "./node_modules/lodash/_baseUnset.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_baseUnset.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var castPath = __webpack_require__(/*! ./_castPath */ "./node_modules/lodash/_castPath.js"),
    last = __webpack_require__(/*! ./last */ "./node_modules/lodash/last.js"),
    parent = __webpack_require__(/*! ./_parent */ "./node_modules/lodash/_parent.js"),
    toKey = __webpack_require__(/*! ./_toKey */ "./node_modules/lodash/_toKey.js");
/**
 * The base implementation of `_.unset`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The property path to unset.
 * @returns {boolean} Returns `true` if the property is deleted, else `false`.
 */


function baseUnset(object, path) {
  path = castPath(path, object);
  object = parent(object, path);
  return object == null || delete object[toKey(last(path))];
}

module.exports = baseUnset;

/***/ }),

/***/ "./node_modules/lodash/_baseValues.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_baseValues.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayMap = __webpack_require__(/*! ./_arrayMap */ "./node_modules/lodash/_arrayMap.js");
/**
 * The base implementation of `_.values` and `_.valuesIn` which creates an
 * array of `object` property values corresponding to the property names
 * of `props`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} props The property names to get values for.
 * @returns {Object} Returns the array of property values.
 */


function baseValues(object, props) {
  return arrayMap(props, function (key) {
    return object[key];
  });
}

module.exports = baseValues;

/***/ }),

/***/ "./node_modules/lodash/_cacheHas.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_cacheHas.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

module.exports = cacheHas;

/***/ }),

/***/ "./node_modules/lodash/_castPath.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_castPath.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isKey = __webpack_require__(/*! ./_isKey */ "./node_modules/lodash/_isKey.js"),
    stringToPath = __webpack_require__(/*! ./_stringToPath */ "./node_modules/lodash/_stringToPath.js"),
    toString = __webpack_require__(/*! ./toString */ "./node_modules/lodash/toString.js");
/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */


function castPath(value, object) {
  if (isArray(value)) {
    return value;
  }

  return isKey(value, object) ? [value] : stringToPath(toString(value));
}

module.exports = castPath;

/***/ }),

/***/ "./node_modules/lodash/_cloneArrayBuffer.js":
/*!**************************************************!*\
  !*** ./node_modules/lodash/_cloneArrayBuffer.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Uint8Array = __webpack_require__(/*! ./_Uint8Array */ "./node_modules/lodash/_Uint8Array.js");
/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */


function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

module.exports = cloneArrayBuffer;

/***/ }),

/***/ "./node_modules/lodash/_cloneBuffer.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_cloneBuffer.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");
/** Detect free variable `exports`. */


var freeExports = ( false ? undefined : _typeof(exports)) == 'object' && exports && !exports.nodeType && exports;
/** Detect free variable `module`. */

var freeModule = freeExports && ( false ? undefined : _typeof(module)) == 'object' && module && !module.nodeType && module;
/** Detect the popular CommonJS extension `module.exports`. */

var moduleExports = freeModule && freeModule.exports === freeExports;
/** Built-in value references. */

var Buffer = moduleExports ? root.Buffer : undefined,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;
/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */

function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }

  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
  buffer.copy(result);
  return result;
}

module.exports = cloneBuffer;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./node_modules/lodash/_cloneDataView.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_cloneDataView.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var cloneArrayBuffer = __webpack_require__(/*! ./_cloneArrayBuffer */ "./node_modules/lodash/_cloneArrayBuffer.js");
/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */


function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

module.exports = cloneDataView;

/***/ }),

/***/ "./node_modules/lodash/_cloneRegExp.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_cloneRegExp.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;
/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */

function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

module.exports = cloneRegExp;

/***/ }),

/***/ "./node_modules/lodash/_cloneSymbol.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_cloneSymbol.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var _Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js");
/** Used to convert symbols to primitives and strings. */


var symbolProto = _Symbol ? _Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */

function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

module.exports = cloneSymbol;

/***/ }),

/***/ "./node_modules/lodash/_cloneTypedArray.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_cloneTypedArray.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var cloneArrayBuffer = __webpack_require__(/*! ./_cloneArrayBuffer */ "./node_modules/lodash/_cloneArrayBuffer.js");
/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */


function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

module.exports = cloneTypedArray;

/***/ }),

/***/ "./node_modules/lodash/_copyArray.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_copyArray.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;
  array || (array = Array(length));

  while (++index < length) {
    array[index] = source[index];
  }

  return array;
}

module.exports = copyArray;

/***/ }),

/***/ "./node_modules/lodash/_copyObject.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_copyObject.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var assignValue = __webpack_require__(/*! ./_assignValue */ "./node_modules/lodash/_assignValue.js"),
    baseAssignValue = __webpack_require__(/*! ./_baseAssignValue */ "./node_modules/lodash/_baseAssignValue.js");
/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */


function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});
  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];
    var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }

    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }

  return object;
}

module.exports = copyObject;

/***/ }),

/***/ "./node_modules/lodash/_copySymbols.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_copySymbols.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__(/*! ./_copyObject */ "./node_modules/lodash/_copyObject.js"),
    getSymbols = __webpack_require__(/*! ./_getSymbols */ "./node_modules/lodash/_getSymbols.js");
/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */


function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

module.exports = copySymbols;

/***/ }),

/***/ "./node_modules/lodash/_copySymbolsIn.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_copySymbolsIn.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__(/*! ./_copyObject */ "./node_modules/lodash/_copyObject.js"),
    getSymbolsIn = __webpack_require__(/*! ./_getSymbolsIn */ "./node_modules/lodash/_getSymbolsIn.js");
/**
 * Copies own and inherited symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */


function copySymbolsIn(source, object) {
  return copyObject(source, getSymbolsIn(source), object);
}

module.exports = copySymbolsIn;

/***/ }),

/***/ "./node_modules/lodash/_coreJsData.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_coreJsData.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js");
/** Used to detect overreaching core-js shims. */


var coreJsData = root['__core-js_shared__'];
module.exports = coreJsData;

/***/ }),

/***/ "./node_modules/lodash/_createAssigner.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_createAssigner.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseRest = __webpack_require__(/*! ./_baseRest */ "./node_modules/lodash/_baseRest.js"),
    isIterateeCall = __webpack_require__(/*! ./_isIterateeCall */ "./node_modules/lodash/_isIterateeCall.js");
/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */


function createAssigner(assigner) {
  return baseRest(function (object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;
    customizer = assigner.length > 3 && typeof customizer == 'function' ? (length--, customizer) : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }

    object = Object(object);

    while (++index < length) {
      var source = sources[index];

      if (source) {
        assigner(object, source, index, customizer);
      }
    }

    return object;
  });
}

module.exports = createAssigner;

/***/ }),

/***/ "./node_modules/lodash/_createBaseEach.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_createBaseEach.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js");
/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */


function createBaseEach(eachFunc, fromRight) {
  return function (collection, iteratee) {
    if (collection == null) {
      return collection;
    }

    if (!isArrayLike(collection)) {
      return eachFunc(collection, iteratee);
    }

    var length = collection.length,
        index = fromRight ? length : -1,
        iterable = Object(collection);

    while (fromRight ? index-- : ++index < length) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }

    return collection;
  };
}

module.exports = createBaseEach;

/***/ }),

/***/ "./node_modules/lodash/_createBaseFor.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_createBaseFor.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function (object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];

      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }

    return object;
  };
}

module.exports = createBaseFor;

/***/ }),

/***/ "./node_modules/lodash/_createFind.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_createFind.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseIteratee = __webpack_require__(/*! ./_baseIteratee */ "./node_modules/lodash/_baseIteratee.js"),
    isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js"),
    keys = __webpack_require__(/*! ./keys */ "./node_modules/lodash/keys.js");
/**
 * Creates a `_.find` or `_.findLast` function.
 *
 * @private
 * @param {Function} findIndexFunc The function to find the collection index.
 * @returns {Function} Returns the new find function.
 */


function createFind(findIndexFunc) {
  return function (collection, predicate, fromIndex) {
    var iterable = Object(collection);

    if (!isArrayLike(collection)) {
      var iteratee = baseIteratee(predicate, 3);
      collection = keys(collection);

      predicate = function predicate(key) {
        return iteratee(iterable[key], key, iterable);
      };
    }

    var index = findIndexFunc(collection, predicate, fromIndex);
    return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
  };
}

module.exports = createFind;

/***/ }),

/***/ "./node_modules/lodash/_createSet.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_createSet.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Set = __webpack_require__(/*! ./_Set */ "./node_modules/lodash/_Set.js"),
    noop = __webpack_require__(/*! ./noop */ "./node_modules/lodash/noop.js"),
    setToArray = __webpack_require__(/*! ./_setToArray */ "./node_modules/lodash/_setToArray.js");
/** Used as references for various `Number` constants. */


var INFINITY = 1 / 0;
/**
 * Creates a set object of `values`.
 *
 * @private
 * @param {Array} values The values to add to the set.
 * @returns {Object} Returns the new set.
 */

var createSet = !(Set && 1 / setToArray(new Set([, -0]))[1] == INFINITY) ? noop : function (values) {
  return new Set(values);
};
module.exports = createSet;

/***/ }),

/***/ "./node_modules/lodash/_customOmitClone.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_customOmitClone.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isPlainObject = __webpack_require__(/*! ./isPlainObject */ "./node_modules/lodash/isPlainObject.js");
/**
 * Used by `_.omit` to customize its `_.cloneDeep` use to only clone plain
 * objects.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {string} key The key of the property to inspect.
 * @returns {*} Returns the uncloned value or `undefined` to defer cloning to `_.cloneDeep`.
 */


function customOmitClone(value) {
  return isPlainObject(value) ? undefined : value;
}

module.exports = customOmitClone;

/***/ }),

/***/ "./node_modules/lodash/_defineProperty.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_defineProperty.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js");

var defineProperty = function () {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}();

module.exports = defineProperty;

/***/ }),

/***/ "./node_modules/lodash/_equalArrays.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_equalArrays.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var SetCache = __webpack_require__(/*! ./_SetCache */ "./node_modules/lodash/_SetCache.js"),
    arraySome = __webpack_require__(/*! ./_arraySome */ "./node_modules/lodash/_arraySome.js"),
    cacheHas = __webpack_require__(/*! ./_cacheHas */ "./node_modules/lodash/_cacheHas.js");
/** Used to compose bitmasks for value comparisons. */


var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;
/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */

function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  } // Assume cyclic values are equal.


  var stacked = stack.get(array);

  if (stacked && stack.get(other)) {
    return stacked == other;
  }

  var index = -1,
      result = true,
      seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : undefined;
  stack.set(array, other);
  stack.set(other, array); // Ignore non-index properties.

  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
    }

    if (compared !== undefined) {
      if (compared) {
        continue;
      }

      result = false;
      break;
    } // Recursively compare arrays (susceptible to call stack limits).


    if (seen) {
      if (!arraySome(other, function (othValue, othIndex) {
        if (!cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
          return seen.push(othIndex);
        }
      })) {
        result = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
      result = false;
      break;
    }
  }

  stack['delete'](array);
  stack['delete'](other);
  return result;
}

module.exports = equalArrays;

/***/ }),

/***/ "./node_modules/lodash/_equalByTag.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_equalByTag.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var _Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js"),
    Uint8Array = __webpack_require__(/*! ./_Uint8Array */ "./node_modules/lodash/_Uint8Array.js"),
    eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js"),
    equalArrays = __webpack_require__(/*! ./_equalArrays */ "./node_modules/lodash/_equalArrays.js"),
    mapToArray = __webpack_require__(/*! ./_mapToArray */ "./node_modules/lodash/_mapToArray.js"),
    setToArray = __webpack_require__(/*! ./_setToArray */ "./node_modules/lodash/_setToArray.js");
/** Used to compose bitmasks for value comparisons. */


var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;
/** `Object#toString` result references. */

var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';
var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]';
/** Used to convert symbols to primitives and strings. */

var symbolProto = _Symbol ? _Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */

function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }

      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }

      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == other + '';

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      } // Assume cyclic values are equal.


      var stacked = stack.get(object);

      if (stacked) {
        return stacked == other;
      }

      bitmask |= COMPARE_UNORDERED_FLAG; // Recursively compare objects (susceptible to call stack limits).

      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }

  }

  return false;
}

module.exports = equalByTag;

/***/ }),

/***/ "./node_modules/lodash/_equalObjects.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_equalObjects.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getAllKeys = __webpack_require__(/*! ./_getAllKeys */ "./node_modules/lodash/_getAllKeys.js");
/** Used to compose bitmasks for value comparisons. */


var COMPARE_PARTIAL_FLAG = 1;
/** Used for built-in method references. */

var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */

function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }

  var index = objLength;

  while (index--) {
    var key = objProps[index];

    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  } // Assume cyclic values are equal.


  var stacked = stack.get(object);

  if (stacked && stack.get(other)) {
    return stacked == other;
  }

  var result = true;
  stack.set(object, other);
  stack.set(other, object);
  var skipCtor = isPartial;

  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
    } // Recursively compare objects (susceptible to call stack limits).


    if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
      result = false;
      break;
    }

    skipCtor || (skipCtor = key == 'constructor');
  }

  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor; // Non `Object` object instances with different constructors are not equal.

    if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }

  stack['delete'](object);
  stack['delete'](other);
  return result;
}

module.exports = equalObjects;

/***/ }),

/***/ "./node_modules/lodash/_flatRest.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_flatRest.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var flatten = __webpack_require__(/*! ./flatten */ "./node_modules/lodash/flatten.js"),
    overRest = __webpack_require__(/*! ./_overRest */ "./node_modules/lodash/_overRest.js"),
    setToString = __webpack_require__(/*! ./_setToString */ "./node_modules/lodash/_setToString.js");
/**
 * A specialized version of `baseRest` which flattens the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @returns {Function} Returns the new function.
 */


function flatRest(func) {
  return setToString(overRest(func, undefined, flatten), func + '');
}

module.exports = flatRest;

/***/ }),

/***/ "./node_modules/lodash/_freeGlobal.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_freeGlobal.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/** Detect free variable `global` from Node.js. */
var freeGlobal = (typeof global === "undefined" ? "undefined" : _typeof(global)) == 'object' && global && global.Object === Object && global;
module.exports = freeGlobal;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/lodash/_getAllKeys.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_getAllKeys.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGetAllKeys = __webpack_require__(/*! ./_baseGetAllKeys */ "./node_modules/lodash/_baseGetAllKeys.js"),
    getSymbols = __webpack_require__(/*! ./_getSymbols */ "./node_modules/lodash/_getSymbols.js"),
    keys = __webpack_require__(/*! ./keys */ "./node_modules/lodash/keys.js");
/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */


function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

module.exports = getAllKeys;

/***/ }),

/***/ "./node_modules/lodash/_getAllKeysIn.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_getAllKeysIn.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGetAllKeys = __webpack_require__(/*! ./_baseGetAllKeys */ "./node_modules/lodash/_baseGetAllKeys.js"),
    getSymbolsIn = __webpack_require__(/*! ./_getSymbolsIn */ "./node_modules/lodash/_getSymbolsIn.js"),
    keysIn = __webpack_require__(/*! ./keysIn */ "./node_modules/lodash/keysIn.js");
/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */


function getAllKeysIn(object) {
  return baseGetAllKeys(object, keysIn, getSymbolsIn);
}

module.exports = getAllKeysIn;

/***/ }),

/***/ "./node_modules/lodash/_getMapData.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_getMapData.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isKeyable = __webpack_require__(/*! ./_isKeyable */ "./node_modules/lodash/_isKeyable.js");
/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */


function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
}

module.exports = getMapData;

/***/ }),

/***/ "./node_modules/lodash/_getMatchData.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_getMatchData.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isStrictComparable = __webpack_require__(/*! ./_isStrictComparable */ "./node_modules/lodash/_isStrictComparable.js"),
    keys = __webpack_require__(/*! ./keys */ "./node_modules/lodash/keys.js");
/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */


function getMatchData(object) {
  var result = keys(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];
    result[length] = [key, value, isStrictComparable(value)];
  }

  return result;
}

module.exports = getMatchData;

/***/ }),

/***/ "./node_modules/lodash/_getNative.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_getNative.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseIsNative = __webpack_require__(/*! ./_baseIsNative */ "./node_modules/lodash/_baseIsNative.js"),
    getValue = __webpack_require__(/*! ./_getValue */ "./node_modules/lodash/_getValue.js");
/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */


function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;

/***/ }),

/***/ "./node_modules/lodash/_getPrototype.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_getPrototype.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var overArg = __webpack_require__(/*! ./_overArg */ "./node_modules/lodash/_overArg.js");
/** Built-in value references. */


var getPrototype = overArg(Object.getPrototypeOf, Object);
module.exports = getPrototype;

/***/ }),

/***/ "./node_modules/lodash/_getRawTag.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_getRawTag.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var _Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js");
/** Used for built-in method references. */


var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */

var nativeObjectToString = objectProto.toString;
/** Built-in value references. */

var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;
/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */

function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);

  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }

  return result;
}

module.exports = getRawTag;

/***/ }),

/***/ "./node_modules/lodash/_getSymbols.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_getSymbols.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayFilter = __webpack_require__(/*! ./_arrayFilter */ "./node_modules/lodash/_arrayFilter.js"),
    stubArray = __webpack_require__(/*! ./stubArray */ "./node_modules/lodash/stubArray.js");
/** Used for built-in method references. */


var objectProto = Object.prototype;
/** Built-in value references. */

var propertyIsEnumerable = objectProto.propertyIsEnumerable;
/* Built-in method references for those with the same name as other `lodash` methods. */

var nativeGetSymbols = Object.getOwnPropertySymbols;
/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */

var getSymbols = !nativeGetSymbols ? stubArray : function (object) {
  if (object == null) {
    return [];
  }

  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function (symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};
module.exports = getSymbols;

/***/ }),

/***/ "./node_modules/lodash/_getSymbolsIn.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_getSymbolsIn.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayPush = __webpack_require__(/*! ./_arrayPush */ "./node_modules/lodash/_arrayPush.js"),
    getPrototype = __webpack_require__(/*! ./_getPrototype */ "./node_modules/lodash/_getPrototype.js"),
    getSymbols = __webpack_require__(/*! ./_getSymbols */ "./node_modules/lodash/_getSymbols.js"),
    stubArray = __webpack_require__(/*! ./stubArray */ "./node_modules/lodash/stubArray.js");
/* Built-in method references for those with the same name as other `lodash` methods. */


var nativeGetSymbols = Object.getOwnPropertySymbols;
/**
 * Creates an array of the own and inherited enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */

var getSymbolsIn = !nativeGetSymbols ? stubArray : function (object) {
  var result = [];

  while (object) {
    arrayPush(result, getSymbols(object));
    object = getPrototype(object);
  }

  return result;
};
module.exports = getSymbolsIn;

/***/ }),

/***/ "./node_modules/lodash/_getTag.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/_getTag.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var DataView = __webpack_require__(/*! ./_DataView */ "./node_modules/lodash/_DataView.js"),
    Map = __webpack_require__(/*! ./_Map */ "./node_modules/lodash/_Map.js"),
    Promise = __webpack_require__(/*! ./_Promise */ "./node_modules/lodash/_Promise.js"),
    Set = __webpack_require__(/*! ./_Set */ "./node_modules/lodash/_Set.js"),
    WeakMap = __webpack_require__(/*! ./_WeakMap */ "./node_modules/lodash/_WeakMap.js"),
    baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    toSource = __webpack_require__(/*! ./_toSource */ "./node_modules/lodash/_toSource.js");
/** `Object#toString` result references. */


var mapTag = '[object Map]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    setTag = '[object Set]',
    weakMapTag = '[object WeakMap]';
var dataViewTag = '[object DataView]';
/** Used to detect maps, sets, and weakmaps. */

var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);
/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */

var getTag = baseGetTag; // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.

if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise && getTag(Promise.resolve()) != promiseTag || Set && getTag(new Set()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
  getTag = function getTag(value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag;

        case mapCtorString:
          return mapTag;

        case promiseCtorString:
          return promiseTag;

        case setCtorString:
          return setTag;

        case weakMapCtorString:
          return weakMapTag;
      }
    }

    return result;
  };
}

module.exports = getTag;

/***/ }),

/***/ "./node_modules/lodash/_getValue.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_getValue.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;

/***/ }),

/***/ "./node_modules/lodash/_hasPath.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_hasPath.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var castPath = __webpack_require__(/*! ./_castPath */ "./node_modules/lodash/_castPath.js"),
    isArguments = __webpack_require__(/*! ./isArguments */ "./node_modules/lodash/isArguments.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isIndex = __webpack_require__(/*! ./_isIndex */ "./node_modules/lodash/_isIndex.js"),
    isLength = __webpack_require__(/*! ./isLength */ "./node_modules/lodash/isLength.js"),
    toKey = __webpack_require__(/*! ./_toKey */ "./node_modules/lodash/_toKey.js");
/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */


function hasPath(object, path, hasFunc) {
  path = castPath(path, object);
  var index = -1,
      length = path.length,
      result = false;

  while (++index < length) {
    var key = toKey(path[index]);

    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }

    object = object[key];
  }

  if (result || ++index != length) {
    return result;
  }

  length = object == null ? 0 : object.length;
  return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
}

module.exports = hasPath;

/***/ }),

/***/ "./node_modules/lodash/_hashClear.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_hashClear.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");
/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */


function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

module.exports = hashClear;

/***/ }),

/***/ "./node_modules/lodash/_hashDelete.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_hashDelete.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = hashDelete;

/***/ }),

/***/ "./node_modules/lodash/_hashGet.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_hashGet.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");
/** Used to stand-in for `undefined` hash values. */


var HASH_UNDEFINED = '__lodash_hash_undefined__';
/** Used for built-in method references. */

var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */

function hashGet(key) {
  var data = this.__data__;

  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }

  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

module.exports = hashGet;

/***/ }),

/***/ "./node_modules/lodash/_hashHas.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_hashHas.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");
/** Used for built-in method references. */


var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */

function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

module.exports = hashHas;

/***/ }),

/***/ "./node_modules/lodash/_hashSet.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_hashSet.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(/*! ./_nativeCreate */ "./node_modules/lodash/_nativeCreate.js");
/** Used to stand-in for `undefined` hash values. */


var HASH_UNDEFINED = '__lodash_hash_undefined__';
/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */

function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
  return this;
}

module.exports = hashSet;

/***/ }),

/***/ "./node_modules/lodash/_initCloneArray.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_initCloneArray.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */

function initCloneArray(array) {
  var length = array.length,
      result = new array.constructor(length); // Add properties assigned by `RegExp#exec`.

  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }

  return result;
}

module.exports = initCloneArray;

/***/ }),

/***/ "./node_modules/lodash/_initCloneByTag.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_initCloneByTag.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var cloneArrayBuffer = __webpack_require__(/*! ./_cloneArrayBuffer */ "./node_modules/lodash/_cloneArrayBuffer.js"),
    cloneDataView = __webpack_require__(/*! ./_cloneDataView */ "./node_modules/lodash/_cloneDataView.js"),
    cloneRegExp = __webpack_require__(/*! ./_cloneRegExp */ "./node_modules/lodash/_cloneRegExp.js"),
    cloneSymbol = __webpack_require__(/*! ./_cloneSymbol */ "./node_modules/lodash/_cloneSymbol.js"),
    cloneTypedArray = __webpack_require__(/*! ./_cloneTypedArray */ "./node_modules/lodash/_cloneTypedArray.js");
/** `Object#toString` result references. */


var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';
var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';
/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */

function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;

  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag:
    case float64Tag:
    case int8Tag:
    case int16Tag:
    case int32Tag:
    case uint8Tag:
    case uint8ClampedTag:
    case uint16Tag:
    case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return new Ctor();

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return new Ctor();

    case symbolTag:
      return cloneSymbol(object);
  }
}

module.exports = initCloneByTag;

/***/ }),

/***/ "./node_modules/lodash/_initCloneObject.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_initCloneObject.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseCreate = __webpack_require__(/*! ./_baseCreate */ "./node_modules/lodash/_baseCreate.js"),
    getPrototype = __webpack_require__(/*! ./_getPrototype */ "./node_modules/lodash/_getPrototype.js"),
    isPrototype = __webpack_require__(/*! ./_isPrototype */ "./node_modules/lodash/_isPrototype.js");
/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */


function initCloneObject(object) {
  return typeof object.constructor == 'function' && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
}

module.exports = initCloneObject;

/***/ }),

/***/ "./node_modules/lodash/_isFlattenable.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_isFlattenable.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var _Symbol = __webpack_require__(/*! ./_Symbol */ "./node_modules/lodash/_Symbol.js"),
    isArguments = __webpack_require__(/*! ./isArguments */ "./node_modules/lodash/isArguments.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js");
/** Built-in value references. */


var spreadableSymbol = _Symbol ? _Symbol.isConcatSpreadable : undefined;
/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */

function isFlattenable(value) {
  return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
}

module.exports = isFlattenable;

/***/ }),

/***/ "./node_modules/lodash/_isIndex.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_isIndex.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;
/** Used to detect unsigned integer values. */

var reIsUint = /^(?:0|[1-9]\d*)$/;
/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */

function isIndex(value, length) {
  var type = _typeof(value);

  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (type == 'number' || type != 'symbol' && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
}

module.exports = isIndex;

/***/ }),

/***/ "./node_modules/lodash/_isIterateeCall.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_isIterateeCall.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var eq = __webpack_require__(/*! ./eq */ "./node_modules/lodash/eq.js"),
    isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js"),
    isIndex = __webpack_require__(/*! ./_isIndex */ "./node_modules/lodash/_isIndex.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js");
/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */


function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }

  var type = _typeof(index);

  if (type == 'number' ? isArrayLike(object) && isIndex(index, object.length) : type == 'string' && index in object) {
    return eq(object[index], value);
  }

  return false;
}

module.exports = isIterateeCall;

/***/ }),

/***/ "./node_modules/lodash/_isKey.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/_isKey.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isSymbol = __webpack_require__(/*! ./isSymbol */ "./node_modules/lodash/isSymbol.js");
/** Used to match property names within property paths. */


var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;
/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */

function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }

  var type = _typeof(value);

  if (type == 'number' || type == 'symbol' || type == 'boolean' || value == null || isSymbol(value)) {
    return true;
  }

  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
}

module.exports = isKey;

/***/ }),

/***/ "./node_modules/lodash/_isKeyable.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/_isKeyable.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = _typeof(value);

  return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
}

module.exports = isKeyable;

/***/ }),

/***/ "./node_modules/lodash/_isMasked.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_isMasked.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var coreJsData = __webpack_require__(/*! ./_coreJsData */ "./node_modules/lodash/_coreJsData.js");
/** Used to detect methods masquerading as native. */


var maskSrcKey = function () {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? 'Symbol(src)_1.' + uid : '';
}();
/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */


function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}

module.exports = isMasked;

/***/ }),

/***/ "./node_modules/lodash/_isPrototype.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_isPrototype.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;
/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */

function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = typeof Ctor == 'function' && Ctor.prototype || objectProto;
  return value === proto;
}

module.exports = isPrototype;

/***/ }),

/***/ "./node_modules/lodash/_isStrictComparable.js":
/*!****************************************************!*\
  !*** ./node_modules/lodash/_isStrictComparable.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js");
/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */


function isStrictComparable(value) {
  return value === value && !isObject(value);
}

module.exports = isStrictComparable;

/***/ }),

/***/ "./node_modules/lodash/_listCacheClear.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_listCacheClear.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

module.exports = listCacheClear;

/***/ }),

/***/ "./node_modules/lodash/_listCacheDelete.js":
/*!*************************************************!*\
  !*** ./node_modules/lodash/_listCacheDelete.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");
/** Used for built-in method references. */


var arrayProto = Array.prototype;
/** Built-in value references. */

var splice = arrayProto.splice;
/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */

function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }

  var lastIndex = data.length - 1;

  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }

  --this.size;
  return true;
}

module.exports = listCacheDelete;

/***/ }),

/***/ "./node_modules/lodash/_listCacheGet.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_listCacheGet.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");
/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */


function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);
  return index < 0 ? undefined : data[index][1];
}

module.exports = listCacheGet;

/***/ }),

/***/ "./node_modules/lodash/_listCacheHas.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_listCacheHas.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");
/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */


function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

module.exports = listCacheHas;

/***/ }),

/***/ "./node_modules/lodash/_listCacheSet.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_listCacheSet.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(/*! ./_assocIndexOf */ "./node_modules/lodash/_assocIndexOf.js");
/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */


function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }

  return this;
}

module.exports = listCacheSet;

/***/ }),

/***/ "./node_modules/lodash/_mapCacheClear.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_mapCacheClear.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var Hash = __webpack_require__(/*! ./_Hash */ "./node_modules/lodash/_Hash.js"),
    ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js"),
    Map = __webpack_require__(/*! ./_Map */ "./node_modules/lodash/_Map.js");
/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */


function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash(),
    'map': new (Map || ListCache)(),
    'string': new Hash()
  };
}

module.exports = mapCacheClear;

/***/ }),

/***/ "./node_modules/lodash/_mapCacheDelete.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_mapCacheDelete.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");
/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */


function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = mapCacheDelete;

/***/ }),

/***/ "./node_modules/lodash/_mapCacheGet.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_mapCacheGet.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");
/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */


function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

module.exports = mapCacheGet;

/***/ }),

/***/ "./node_modules/lodash/_mapCacheHas.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_mapCacheHas.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");
/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */


function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

module.exports = mapCacheHas;

/***/ }),

/***/ "./node_modules/lodash/_mapCacheSet.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_mapCacheSet.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(/*! ./_getMapData */ "./node_modules/lodash/_getMapData.js");
/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */


function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

module.exports = mapCacheSet;

/***/ }),

/***/ "./node_modules/lodash/_mapToArray.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_mapToArray.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);
  map.forEach(function (value, key) {
    result[++index] = [key, value];
  });
  return result;
}

module.exports = mapToArray;

/***/ }),

/***/ "./node_modules/lodash/_matchesStrictComparable.js":
/*!*********************************************************!*\
  !*** ./node_modules/lodash/_matchesStrictComparable.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function matchesStrictComparable(key, srcValue) {
  return function (object) {
    if (object == null) {
      return false;
    }

    return object[key] === srcValue && (srcValue !== undefined || key in Object(object));
  };
}

module.exports = matchesStrictComparable;

/***/ }),

/***/ "./node_modules/lodash/_memoizeCapped.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_memoizeCapped.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var memoize = __webpack_require__(/*! ./memoize */ "./node_modules/lodash/memoize.js");
/** Used as the maximum memoize cache size. */


var MAX_MEMOIZE_SIZE = 500;
/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */

function memoizeCapped(func) {
  var result = memoize(func, function (key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }

    return key;
  });
  var cache = result.cache;
  return result;
}

module.exports = memoizeCapped;

/***/ }),

/***/ "./node_modules/lodash/_nativeCreate.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_nativeCreate.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(/*! ./_getNative */ "./node_modules/lodash/_getNative.js");
/* Built-in method references that are verified to be native. */


var nativeCreate = getNative(Object, 'create');
module.exports = nativeCreate;

/***/ }),

/***/ "./node_modules/lodash/_nativeKeys.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_nativeKeys.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var overArg = __webpack_require__(/*! ./_overArg */ "./node_modules/lodash/_overArg.js");
/* Built-in method references for those with the same name as other `lodash` methods. */


var nativeKeys = overArg(Object.keys, Object);
module.exports = nativeKeys;

/***/ }),

/***/ "./node_modules/lodash/_nativeKeysIn.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_nativeKeysIn.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];

  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }

  return result;
}

module.exports = nativeKeysIn;

/***/ }),

/***/ "./node_modules/lodash/_nodeUtil.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_nodeUtil.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var freeGlobal = __webpack_require__(/*! ./_freeGlobal */ "./node_modules/lodash/_freeGlobal.js");
/** Detect free variable `exports`. */


var freeExports = ( false ? undefined : _typeof(exports)) == 'object' && exports && !exports.nodeType && exports;
/** Detect free variable `module`. */

var freeModule = freeExports && ( false ? undefined : _typeof(module)) == 'object' && module && !module.nodeType && module;
/** Detect the popular CommonJS extension `module.exports`. */

var moduleExports = freeModule && freeModule.exports === freeExports;
/** Detect free variable `process` from Node.js. */

var freeProcess = moduleExports && freeGlobal.process;
/** Used to access faster Node.js helpers. */

var nodeUtil = function () {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    } // Legacy `process.binding('util')` for Node.js < 10.


    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}();

module.exports = nodeUtil;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./node_modules/lodash/_objectToString.js":
/*!************************************************!*\
  !*** ./node_modules/lodash/_objectToString.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;
/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */

var nativeObjectToString = objectProto.toString;
/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */

function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;

/***/ }),

/***/ "./node_modules/lodash/_overArg.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_overArg.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function (arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;

/***/ }),

/***/ "./node_modules/lodash/_overRest.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_overRest.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var apply = __webpack_require__(/*! ./_apply */ "./node_modules/lodash/_apply.js");
/* Built-in method references for those with the same name as other `lodash` methods. */


var nativeMax = Math.max;
/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */

function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? func.length - 1 : start, 0);
  return function () {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }

    index = -1;
    var otherArgs = Array(start + 1);

    while (++index < start) {
      otherArgs[index] = args[index];
    }

    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

module.exports = overRest;

/***/ }),

/***/ "./node_modules/lodash/_parent.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/_parent.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGet = __webpack_require__(/*! ./_baseGet */ "./node_modules/lodash/_baseGet.js"),
    baseSlice = __webpack_require__(/*! ./_baseSlice */ "./node_modules/lodash/_baseSlice.js");
/**
 * Gets the parent value at `path` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} path The path to get the parent value of.
 * @returns {*} Returns the parent value.
 */


function parent(object, path) {
  return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
}

module.exports = parent;

/***/ }),

/***/ "./node_modules/lodash/_root.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/_root.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var freeGlobal = __webpack_require__(/*! ./_freeGlobal */ "./node_modules/lodash/_freeGlobal.js");
/** Detect free variable `self`. */


var freeSelf = (typeof self === "undefined" ? "undefined" : _typeof(self)) == 'object' && self && self.Object === Object && self;
/** Used as a reference to the global object. */

var root = freeGlobal || freeSelf || Function('return this')();
module.exports = root;

/***/ }),

/***/ "./node_modules/lodash/_safeGet.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/_safeGet.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Gets the value at `key`, unless `key` is "__proto__" or "constructor".
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function safeGet(object, key) {
  if (key === 'constructor' && typeof object[key] === 'function') {
    return;
  }

  if (key == '__proto__') {
    return;
  }

  return object[key];
}

module.exports = safeGet;

/***/ }),

/***/ "./node_modules/lodash/_setCacheAdd.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_setCacheAdd.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';
/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */

function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);

  return this;
}

module.exports = setCacheAdd;

/***/ }),

/***/ "./node_modules/lodash/_setCacheHas.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_setCacheHas.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

module.exports = setCacheHas;

/***/ }),

/***/ "./node_modules/lodash/_setToArray.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_setToArray.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);
  set.forEach(function (value) {
    result[++index] = value;
  });
  return result;
}

module.exports = setToArray;

/***/ }),

/***/ "./node_modules/lodash/_setToString.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_setToString.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseSetToString = __webpack_require__(/*! ./_baseSetToString */ "./node_modules/lodash/_baseSetToString.js"),
    shortOut = __webpack_require__(/*! ./_shortOut */ "./node_modules/lodash/_shortOut.js");
/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */


var setToString = shortOut(baseSetToString);
module.exports = setToString;

/***/ }),

/***/ "./node_modules/lodash/_shortOut.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_shortOut.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;
/* Built-in method references for those with the same name as other `lodash` methods. */

var nativeNow = Date.now;
/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */

function shortOut(func) {
  var count = 0,
      lastCalled = 0;
  return function () {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);
    lastCalled = stamp;

    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }

    return func.apply(undefined, arguments);
  };
}

module.exports = shortOut;

/***/ }),

/***/ "./node_modules/lodash/_stackClear.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/_stackClear.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js");
/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */


function stackClear() {
  this.__data__ = new ListCache();
  this.size = 0;
}

module.exports = stackClear;

/***/ }),

/***/ "./node_modules/lodash/_stackDelete.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/_stackDelete.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);
  this.size = data.size;
  return result;
}

module.exports = stackDelete;

/***/ }),

/***/ "./node_modules/lodash/_stackGet.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_stackGet.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

module.exports = stackGet;

/***/ }),

/***/ "./node_modules/lodash/_stackHas.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_stackHas.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

module.exports = stackHas;

/***/ }),

/***/ "./node_modules/lodash/_stackSet.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_stackSet.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var ListCache = __webpack_require__(/*! ./_ListCache */ "./node_modules/lodash/_ListCache.js"),
    Map = __webpack_require__(/*! ./_Map */ "./node_modules/lodash/_Map.js"),
    MapCache = __webpack_require__(/*! ./_MapCache */ "./node_modules/lodash/_MapCache.js");
/** Used as the size to enable large array optimizations. */


var LARGE_ARRAY_SIZE = 200;
/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */

function stackSet(key, value) {
  var data = this.__data__;

  if (data instanceof ListCache) {
    var pairs = data.__data__;

    if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }

    data = this.__data__ = new MapCache(pairs);
  }

  data.set(key, value);
  this.size = data.size;
  return this;
}

module.exports = stackSet;

/***/ }),

/***/ "./node_modules/lodash/_strictIndexOf.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash/_strictIndexOf.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * A specialized version of `_.indexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }

  return -1;
}

module.exports = strictIndexOf;

/***/ }),

/***/ "./node_modules/lodash/_stringToPath.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/_stringToPath.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var memoizeCapped = __webpack_require__(/*! ./_memoizeCapped */ "./node_modules/lodash/_memoizeCapped.js");
/** Used to match property names within property paths. */


var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
/** Used to match backslashes in property paths. */

var reEscapeChar = /\\(\\)?/g;
/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */

var stringToPath = memoizeCapped(function (string) {
  var result = [];

  if (string.charCodeAt(0) === 46
  /* . */
  ) {
      result.push('');
    }

  string.replace(rePropName, function (match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, '$1') : number || match);
  });
  return result;
});
module.exports = stringToPath;

/***/ }),

/***/ "./node_modules/lodash/_toKey.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/_toKey.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isSymbol = __webpack_require__(/*! ./isSymbol */ "./node_modules/lodash/isSymbol.js");
/** Used as references for various `Number` constants. */


var INFINITY = 1 / 0;
/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */

function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }

  var result = value + '';
  return result == '0' && 1 / value == -INFINITY ? '-0' : result;
}

module.exports = toKey;

/***/ }),

/***/ "./node_modules/lodash/_toSource.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/_toSource.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var funcProto = Function.prototype;
/** Used to resolve the decompiled source of functions. */

var funcToString = funcProto.toString;
/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */

function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}

    try {
      return func + '';
    } catch (e) {}
  }

  return '';
}

module.exports = toSource;

/***/ }),

/***/ "./node_modules/lodash/constant.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/constant.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function () {
    return value;
  };
}

module.exports = constant;

/***/ }),

/***/ "./node_modules/lodash/eq.js":
/*!***********************************!*\
  !*** ./node_modules/lodash/eq.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || value !== value && other !== other;
}

module.exports = eq;

/***/ }),

/***/ "./node_modules/lodash/find.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/find.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var createFind = __webpack_require__(/*! ./_createFind */ "./node_modules/lodash/_createFind.js"),
    findIndex = __webpack_require__(/*! ./findIndex */ "./node_modules/lodash/findIndex.js");
/**
 * Iterates over elements of `collection`, returning the first element
 * `predicate` returns truthy for. The predicate is invoked with three
 * arguments: (value, index|key, collection).
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to inspect.
 * @param {Function} [predicate=_.identity] The function invoked per iteration.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {*} Returns the matched element, else `undefined`.
 * @example
 *
 * var users = [
 *   { 'user': 'barney',  'age': 36, 'active': true },
 *   { 'user': 'fred',    'age': 40, 'active': false },
 *   { 'user': 'pebbles', 'age': 1,  'active': true }
 * ];
 *
 * _.find(users, function(o) { return o.age < 40; });
 * // => object for 'barney'
 *
 * // The `_.matches` iteratee shorthand.
 * _.find(users, { 'age': 1, 'active': true });
 * // => object for 'pebbles'
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.find(users, ['active', false]);
 * // => object for 'fred'
 *
 * // The `_.property` iteratee shorthand.
 * _.find(users, 'active');
 * // => object for 'barney'
 */


var find = createFind(findIndex);
module.exports = find;

/***/ }),

/***/ "./node_modules/lodash/findIndex.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/findIndex.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseFindIndex = __webpack_require__(/*! ./_baseFindIndex */ "./node_modules/lodash/_baseFindIndex.js"),
    baseIteratee = __webpack_require__(/*! ./_baseIteratee */ "./node_modules/lodash/_baseIteratee.js"),
    toInteger = __webpack_require__(/*! ./toInteger */ "./node_modules/lodash/toInteger.js");
/* Built-in method references for those with the same name as other `lodash` methods. */


var nativeMax = Math.max;
/**
 * This method is like `_.find` except that it returns the index of the first
 * element `predicate` returns truthy for instead of the element itself.
 *
 * @static
 * @memberOf _
 * @since 1.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {Function} [predicate=_.identity] The function invoked per iteration.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {number} Returns the index of the found element, else `-1`.
 * @example
 *
 * var users = [
 *   { 'user': 'barney',  'active': false },
 *   { 'user': 'fred',    'active': false },
 *   { 'user': 'pebbles', 'active': true }
 * ];
 *
 * _.findIndex(users, function(o) { return o.user == 'barney'; });
 * // => 0
 *
 * // The `_.matches` iteratee shorthand.
 * _.findIndex(users, { 'user': 'fred', 'active': false });
 * // => 1
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.findIndex(users, ['active', false]);
 * // => 0
 *
 * // The `_.property` iteratee shorthand.
 * _.findIndex(users, 'active');
 * // => 2
 */

function findIndex(array, predicate, fromIndex) {
  var length = array == null ? 0 : array.length;

  if (!length) {
    return -1;
  }

  var index = fromIndex == null ? 0 : toInteger(fromIndex);

  if (index < 0) {
    index = nativeMax(length + index, 0);
  }

  return baseFindIndex(array, baseIteratee(predicate, 3), index);
}

module.exports = findIndex;

/***/ }),

/***/ "./node_modules/lodash/flatten.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/flatten.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseFlatten = __webpack_require__(/*! ./_baseFlatten */ "./node_modules/lodash/_baseFlatten.js");
/**
 * Flattens `array` a single level deep.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to flatten.
 * @returns {Array} Returns the new flattened array.
 * @example
 *
 * _.flatten([1, [2, [3, [4]], 5]]);
 * // => [1, 2, [3, [4]], 5]
 */


function flatten(array) {
  var length = array == null ? 0 : array.length;
  return length ? baseFlatten(array, 1) : [];
}

module.exports = flatten;

/***/ }),

/***/ "./node_modules/lodash/get.js":
/*!************************************!*\
  !*** ./node_modules/lodash/get.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGet = __webpack_require__(/*! ./_baseGet */ "./node_modules/lodash/_baseGet.js");
/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */


function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

module.exports = get;

/***/ }),

/***/ "./node_modules/lodash/hasIn.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/hasIn.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseHasIn = __webpack_require__(/*! ./_baseHasIn */ "./node_modules/lodash/_baseHasIn.js"),
    hasPath = __webpack_require__(/*! ./_hasPath */ "./node_modules/lodash/_hasPath.js");
/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */


function hasIn(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}

module.exports = hasIn;

/***/ }),

/***/ "./node_modules/lodash/identity.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/identity.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;

/***/ }),

/***/ "./node_modules/lodash/includes.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/includes.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseIndexOf = __webpack_require__(/*! ./_baseIndexOf */ "./node_modules/lodash/_baseIndexOf.js"),
    isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js"),
    isString = __webpack_require__(/*! ./isString */ "./node_modules/lodash/isString.js"),
    toInteger = __webpack_require__(/*! ./toInteger */ "./node_modules/lodash/toInteger.js"),
    values = __webpack_require__(/*! ./values */ "./node_modules/lodash/values.js");
/* Built-in method references for those with the same name as other `lodash` methods. */


var nativeMax = Math.max;
/**
 * Checks if `value` is in `collection`. If `collection` is a string, it's
 * checked for a substring of `value`, otherwise
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * is used for equality comparisons. If `fromIndex` is negative, it's used as
 * the offset from the end of `collection`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object|string} collection The collection to inspect.
 * @param {*} value The value to search for.
 * @param {number} [fromIndex=0] The index to search from.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
 * @returns {boolean} Returns `true` if `value` is found, else `false`.
 * @example
 *
 * _.includes([1, 2, 3], 1);
 * // => true
 *
 * _.includes([1, 2, 3], 1, 2);
 * // => false
 *
 * _.includes({ 'a': 1, 'b': 2 }, 1);
 * // => true
 *
 * _.includes('abcd', 'bc');
 * // => true
 */

function includes(collection, value, fromIndex, guard) {
  collection = isArrayLike(collection) ? collection : values(collection);
  fromIndex = fromIndex && !guard ? toInteger(fromIndex) : 0;
  var length = collection.length;

  if (fromIndex < 0) {
    fromIndex = nativeMax(length + fromIndex, 0);
  }

  return isString(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf(collection, value, fromIndex) > -1;
}

module.exports = includes;

/***/ }),

/***/ "./node_modules/lodash/isArguments.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/isArguments.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseIsArguments = __webpack_require__(/*! ./_baseIsArguments */ "./node_modules/lodash/_baseIsArguments.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");
/** Used for built-in method references. */


var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/** Built-in value references. */

var propertyIsEnumerable = objectProto.propertyIsEnumerable;
/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */

var isArguments = baseIsArguments(function () {
  return arguments;
}()) ? baseIsArguments : function (value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
};
module.exports = isArguments;

/***/ }),

/***/ "./node_modules/lodash/isArray.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/isArray.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;
module.exports = isArray;

/***/ }),

/***/ "./node_modules/lodash/isArrayLike.js":
/*!********************************************!*\
  !*** ./node_modules/lodash/isArrayLike.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__(/*! ./isFunction */ "./node_modules/lodash/isFunction.js"),
    isLength = __webpack_require__(/*! ./isLength */ "./node_modules/lodash/isLength.js");
/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */


function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;

/***/ }),

/***/ "./node_modules/lodash/isArrayLikeObject.js":
/*!**************************************************!*\
  !*** ./node_modules/lodash/isArrayLikeObject.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");
/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */


function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

module.exports = isArrayLikeObject;

/***/ }),

/***/ "./node_modules/lodash/isBuffer.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/isBuffer.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var root = __webpack_require__(/*! ./_root */ "./node_modules/lodash/_root.js"),
    stubFalse = __webpack_require__(/*! ./stubFalse */ "./node_modules/lodash/stubFalse.js");
/** Detect free variable `exports`. */


var freeExports = ( false ? undefined : _typeof(exports)) == 'object' && exports && !exports.nodeType && exports;
/** Detect free variable `module`. */

var freeModule = freeExports && ( false ? undefined : _typeof(module)) == 'object' && module && !module.nodeType && module;
/** Detect the popular CommonJS extension `module.exports`. */

var moduleExports = freeModule && freeModule.exports === freeExports;
/** Built-in value references. */

var Buffer = moduleExports ? root.Buffer : undefined;
/* Built-in method references for those with the same name as other `lodash` methods. */

var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;
/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */

var isBuffer = nativeIsBuffer || stubFalse;
module.exports = isBuffer;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./node_modules/lodash/isFunction.js":
/*!*******************************************!*\
  !*** ./node_modules/lodash/isFunction.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js");
/** `Object#toString` result references. */


var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';
/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */

function isFunction(value) {
  if (!isObject(value)) {
    return false;
  } // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.


  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;

/***/ }),

/***/ "./node_modules/lodash/isLength.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/isLength.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;
/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */

function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;

/***/ }),

/***/ "./node_modules/lodash/isMap.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/isMap.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseIsMap = __webpack_require__(/*! ./_baseIsMap */ "./node_modules/lodash/_baseIsMap.js"),
    baseUnary = __webpack_require__(/*! ./_baseUnary */ "./node_modules/lodash/_baseUnary.js"),
    nodeUtil = __webpack_require__(/*! ./_nodeUtil */ "./node_modules/lodash/_nodeUtil.js");
/* Node.js helper references. */


var nodeIsMap = nodeUtil && nodeUtil.isMap;
/**
 * Checks if `value` is classified as a `Map` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 * @example
 *
 * _.isMap(new Map);
 * // => true
 *
 * _.isMap(new WeakMap);
 * // => false
 */

var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
module.exports = isMap;

/***/ }),

/***/ "./node_modules/lodash/isObject.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/isObject.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = _typeof(value);

  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;

/***/ }),

/***/ "./node_modules/lodash/isObjectLike.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/isObjectLike.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && _typeof(value) == 'object';
}

module.exports = isObjectLike;

/***/ }),

/***/ "./node_modules/lodash/isPlainObject.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/isPlainObject.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    getPrototype = __webpack_require__(/*! ./_getPrototype */ "./node_modules/lodash/_getPrototype.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");
/** `Object#toString` result references. */


var objectTag = '[object Object]';
/** Used for built-in method references. */

var funcProto = Function.prototype,
    objectProto = Object.prototype;
/** Used to resolve the decompiled source of functions. */

var funcToString = funcProto.toString;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/** Used to infer the `Object` constructor. */

var objectCtorString = funcToString.call(Object);
/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */

function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }

  var proto = getPrototype(value);

  if (proto === null) {
    return true;
  }

  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
}

module.exports = isPlainObject;

/***/ }),

/***/ "./node_modules/lodash/isSet.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/isSet.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseIsSet = __webpack_require__(/*! ./_baseIsSet */ "./node_modules/lodash/_baseIsSet.js"),
    baseUnary = __webpack_require__(/*! ./_baseUnary */ "./node_modules/lodash/_baseUnary.js"),
    nodeUtil = __webpack_require__(/*! ./_nodeUtil */ "./node_modules/lodash/_nodeUtil.js");
/* Node.js helper references. */


var nodeIsSet = nodeUtil && nodeUtil.isSet;
/**
 * Checks if `value` is classified as a `Set` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 * @example
 *
 * _.isSet(new Set);
 * // => true
 *
 * _.isSet(new WeakSet);
 * // => false
 */

var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
module.exports = isSet;

/***/ }),

/***/ "./node_modules/lodash/isString.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/isString.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");
/** `Object#toString` result references. */


var stringTag = '[object String]';
/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */

function isString(value) {
  return typeof value == 'string' || !isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
}

module.exports = isString;

/***/ }),

/***/ "./node_modules/lodash/isSymbol.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/isSymbol.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "./node_modules/lodash/_baseGetTag.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "./node_modules/lodash/isObjectLike.js");
/** `Object#toString` result references. */


var symbolTag = '[object Symbol]';
/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */

function isSymbol(value) {
  return _typeof(value) == 'symbol' || isObjectLike(value) && baseGetTag(value) == symbolTag;
}

module.exports = isSymbol;

/***/ }),

/***/ "./node_modules/lodash/isTypedArray.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash/isTypedArray.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseIsTypedArray = __webpack_require__(/*! ./_baseIsTypedArray */ "./node_modules/lodash/_baseIsTypedArray.js"),
    baseUnary = __webpack_require__(/*! ./_baseUnary */ "./node_modules/lodash/_baseUnary.js"),
    nodeUtil = __webpack_require__(/*! ./_nodeUtil */ "./node_modules/lodash/_nodeUtil.js");
/* Node.js helper references. */


var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */

var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
module.exports = isTypedArray;

/***/ }),

/***/ "./node_modules/lodash/keys.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/keys.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayLikeKeys = __webpack_require__(/*! ./_arrayLikeKeys */ "./node_modules/lodash/_arrayLikeKeys.js"),
    baseKeys = __webpack_require__(/*! ./_baseKeys */ "./node_modules/lodash/_baseKeys.js"),
    isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js");
/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */


function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

module.exports = keys;

/***/ }),

/***/ "./node_modules/lodash/keysIn.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/keysIn.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayLikeKeys = __webpack_require__(/*! ./_arrayLikeKeys */ "./node_modules/lodash/_arrayLikeKeys.js"),
    baseKeysIn = __webpack_require__(/*! ./_baseKeysIn */ "./node_modules/lodash/_baseKeysIn.js"),
    isArrayLike = __webpack_require__(/*! ./isArrayLike */ "./node_modules/lodash/isArrayLike.js");
/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */


function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

module.exports = keysIn;

/***/ }),

/***/ "./node_modules/lodash/last.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/last.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Gets the last element of `array`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * _.last([1, 2, 3]);
 * // => 3
 */
function last(array) {
  var length = array == null ? 0 : array.length;
  return length ? array[length - 1] : undefined;
}

module.exports = last;

/***/ }),

/***/ "./node_modules/lodash/map.js":
/*!************************************!*\
  !*** ./node_modules/lodash/map.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayMap = __webpack_require__(/*! ./_arrayMap */ "./node_modules/lodash/_arrayMap.js"),
    baseIteratee = __webpack_require__(/*! ./_baseIteratee */ "./node_modules/lodash/_baseIteratee.js"),
    baseMap = __webpack_require__(/*! ./_baseMap */ "./node_modules/lodash/_baseMap.js"),
    isArray = __webpack_require__(/*! ./isArray */ "./node_modules/lodash/isArray.js");
/**
 * Creates an array of values by running each element in `collection` thru
 * `iteratee`. The iteratee is invoked with three arguments:
 * (value, index|key, collection).
 *
 * Many lodash methods are guarded to work as iteratees for methods like
 * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
 *
 * The guarded methods are:
 * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
 * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
 * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
 * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 * @example
 *
 * function square(n) {
 *   return n * n;
 * }
 *
 * _.map([4, 8], square);
 * // => [16, 64]
 *
 * _.map({ 'a': 4, 'b': 8 }, square);
 * // => [16, 64] (iteration order is not guaranteed)
 *
 * var users = [
 *   { 'user': 'barney' },
 *   { 'user': 'fred' }
 * ];
 *
 * // The `_.property` iteratee shorthand.
 * _.map(users, 'user');
 * // => ['barney', 'fred']
 */


function map(collection, iteratee) {
  var func = isArray(collection) ? arrayMap : baseMap;
  return func(collection, baseIteratee(iteratee, 3));
}

module.exports = map;

/***/ }),

/***/ "./node_modules/lodash/memoize.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/memoize.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var MapCache = __webpack_require__(/*! ./_MapCache */ "./node_modules/lodash/_MapCache.js");
/** Error message constants. */


var FUNC_ERROR_TEXT = 'Expected a function';
/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */

function memoize(func, resolver) {
  if (typeof func != 'function' || resolver != null && typeof resolver != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }

  var memoized = function memoized() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }

    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };

  memoized.cache = new (memoize.Cache || MapCache)();
  return memoized;
} // Expose `MapCache`.


memoize.Cache = MapCache;
module.exports = memoize;

/***/ }),

/***/ "./node_modules/lodash/merge.js":
/*!**************************************!*\
  !*** ./node_modules/lodash/merge.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseMerge = __webpack_require__(/*! ./_baseMerge */ "./node_modules/lodash/_baseMerge.js"),
    createAssigner = __webpack_require__(/*! ./_createAssigner */ "./node_modules/lodash/_createAssigner.js");
/**
 * This method is like `_.assign` except that it recursively merges own and
 * inherited enumerable string keyed properties of source objects into the
 * destination object. Source properties that resolve to `undefined` are
 * skipped if a destination value exists. Array and plain object properties
 * are merged recursively. Other objects and value types are overridden by
 * assignment. Source objects are applied from left to right. Subsequent
 * sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 0.5.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = {
 *   'a': [{ 'b': 2 }, { 'd': 4 }]
 * };
 *
 * var other = {
 *   'a': [{ 'c': 3 }, { 'e': 5 }]
 * };
 *
 * _.merge(object, other);
 * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
 */


var merge = createAssigner(function (object, source, srcIndex) {
  baseMerge(object, source, srcIndex);
});
module.exports = merge;

/***/ }),

/***/ "./node_modules/lodash/mergeWith.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/mergeWith.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseMerge = __webpack_require__(/*! ./_baseMerge */ "./node_modules/lodash/_baseMerge.js"),
    createAssigner = __webpack_require__(/*! ./_createAssigner */ "./node_modules/lodash/_createAssigner.js");
/**
 * This method is like `_.merge` except that it accepts `customizer` which
 * is invoked to produce the merged values of the destination and source
 * properties. If `customizer` returns `undefined`, merging is handled by the
 * method instead. The `customizer` is invoked with six arguments:
 * (objValue, srcValue, key, object, source, stack).
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} sources The source objects.
 * @param {Function} customizer The function to customize assigned values.
 * @returns {Object} Returns `object`.
 * @example
 *
 * function customizer(objValue, srcValue) {
 *   if (_.isArray(objValue)) {
 *     return objValue.concat(srcValue);
 *   }
 * }
 *
 * var object = { 'a': [1], 'b': [2] };
 * var other = { 'a': [3], 'b': [4] };
 *
 * _.mergeWith(object, other, customizer);
 * // => { 'a': [1, 3], 'b': [2, 4] }
 */


var mergeWith = createAssigner(function (object, source, srcIndex, customizer) {
  baseMerge(object, source, srcIndex, customizer);
});
module.exports = mergeWith;

/***/ }),

/***/ "./node_modules/lodash/noop.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/noop.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {// No operation performed.
}

module.exports = noop;

/***/ }),

/***/ "./node_modules/lodash/omit.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/omit.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayMap = __webpack_require__(/*! ./_arrayMap */ "./node_modules/lodash/_arrayMap.js"),
    baseClone = __webpack_require__(/*! ./_baseClone */ "./node_modules/lodash/_baseClone.js"),
    baseUnset = __webpack_require__(/*! ./_baseUnset */ "./node_modules/lodash/_baseUnset.js"),
    castPath = __webpack_require__(/*! ./_castPath */ "./node_modules/lodash/_castPath.js"),
    copyObject = __webpack_require__(/*! ./_copyObject */ "./node_modules/lodash/_copyObject.js"),
    customOmitClone = __webpack_require__(/*! ./_customOmitClone */ "./node_modules/lodash/_customOmitClone.js"),
    flatRest = __webpack_require__(/*! ./_flatRest */ "./node_modules/lodash/_flatRest.js"),
    getAllKeysIn = __webpack_require__(/*! ./_getAllKeysIn */ "./node_modules/lodash/_getAllKeysIn.js");
/** Used to compose bitmasks for cloning. */


var CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4;
/**
 * The opposite of `_.pick`; this method creates an object composed of the
 * own and inherited enumerable property paths of `object` that are not omitted.
 *
 * **Note:** This method is considerably slower than `_.pick`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {...(string|string[])} [paths] The property paths to omit.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.omit(object, ['a', 'c']);
 * // => { 'b': '2' }
 */

var omit = flatRest(function (object, paths) {
  var result = {};

  if (object == null) {
    return result;
  }

  var isDeep = false;
  paths = arrayMap(paths, function (path) {
    path = castPath(path, object);
    isDeep || (isDeep = path.length > 1);
    return path;
  });
  copyObject(object, getAllKeysIn(object), result);

  if (isDeep) {
    result = baseClone(result, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
  }

  var length = paths.length;

  while (length--) {
    baseUnset(result, paths[length]);
  }

  return result;
});
module.exports = omit;

/***/ }),

/***/ "./node_modules/lodash/pick.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/pick.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var basePick = __webpack_require__(/*! ./_basePick */ "./node_modules/lodash/_basePick.js"),
    flatRest = __webpack_require__(/*! ./_flatRest */ "./node_modules/lodash/_flatRest.js");
/**
 * Creates an object composed of the picked `object` properties.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {...(string|string[])} [paths] The property paths to pick.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.pick(object, ['a', 'c']);
 * // => { 'a': 1, 'c': 3 }
 */


var pick = flatRest(function (object, paths) {
  return object == null ? {} : basePick(object, paths);
});
module.exports = pick;

/***/ }),

/***/ "./node_modules/lodash/property.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/property.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseProperty = __webpack_require__(/*! ./_baseProperty */ "./node_modules/lodash/_baseProperty.js"),
    basePropertyDeep = __webpack_require__(/*! ./_basePropertyDeep */ "./node_modules/lodash/_basePropertyDeep.js"),
    isKey = __webpack_require__(/*! ./_isKey */ "./node_modules/lodash/_isKey.js"),
    toKey = __webpack_require__(/*! ./_toKey */ "./node_modules/lodash/_toKey.js");
/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */


function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}

module.exports = property;

/***/ }),

/***/ "./node_modules/lodash/pull.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/pull.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseRest = __webpack_require__(/*! ./_baseRest */ "./node_modules/lodash/_baseRest.js"),
    pullAll = __webpack_require__(/*! ./pullAll */ "./node_modules/lodash/pullAll.js");
/**
 * Removes all given values from `array` using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * **Note:** Unlike `_.without`, this method mutates `array`. Use `_.remove`
 * to remove elements from an array by predicate.
 *
 * @static
 * @memberOf _
 * @since 2.0.0
 * @category Array
 * @param {Array} array The array to modify.
 * @param {...*} [values] The values to remove.
 * @returns {Array} Returns `array`.
 * @example
 *
 * var array = ['a', 'b', 'c', 'a', 'b', 'c'];
 *
 * _.pull(array, 'a', 'c');
 * console.log(array);
 * // => ['b', 'b']
 */


var pull = baseRest(pullAll);
module.exports = pull;

/***/ }),

/***/ "./node_modules/lodash/pullAll.js":
/*!****************************************!*\
  !*** ./node_modules/lodash/pullAll.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var basePullAll = __webpack_require__(/*! ./_basePullAll */ "./node_modules/lodash/_basePullAll.js");
/**
 * This method is like `_.pull` except that it accepts an array of values to remove.
 *
 * **Note:** Unlike `_.difference`, this method mutates `array`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to modify.
 * @param {Array} values The values to remove.
 * @returns {Array} Returns `array`.
 * @example
 *
 * var array = ['a', 'b', 'c', 'a', 'b', 'c'];
 *
 * _.pullAll(array, ['a', 'c']);
 * console.log(array);
 * // => ['b', 'b']
 */


function pullAll(array, values) {
  return array && array.length && values && values.length ? basePullAll(array, values) : array;
}

module.exports = pullAll;

/***/ }),

/***/ "./node_modules/lodash/remove.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/remove.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseIteratee = __webpack_require__(/*! ./_baseIteratee */ "./node_modules/lodash/_baseIteratee.js"),
    basePullAt = __webpack_require__(/*! ./_basePullAt */ "./node_modules/lodash/_basePullAt.js");
/**
 * Removes all elements from `array` that `predicate` returns truthy for
 * and returns an array of the removed elements. The predicate is invoked
 * with three arguments: (value, index, array).
 *
 * **Note:** Unlike `_.filter`, this method mutates `array`. Use `_.pull`
 * to pull elements from an array by value.
 *
 * @static
 * @memberOf _
 * @since 2.0.0
 * @category Array
 * @param {Array} array The array to modify.
 * @param {Function} [predicate=_.identity] The function invoked per iteration.
 * @returns {Array} Returns the new array of removed elements.
 * @example
 *
 * var array = [1, 2, 3, 4];
 * var evens = _.remove(array, function(n) {
 *   return n % 2 == 0;
 * });
 *
 * console.log(array);
 * // => [1, 3]
 *
 * console.log(evens);
 * // => [2, 4]
 */


function remove(array, predicate) {
  var result = [];

  if (!(array && array.length)) {
    return result;
  }

  var index = -1,
      indexes = [],
      length = array.length;
  predicate = baseIteratee(predicate, 3);

  while (++index < length) {
    var value = array[index];

    if (predicate(value, index, array)) {
      result.push(value);
      indexes.push(index);
    }
  }

  basePullAt(array, indexes);
  return result;
}

module.exports = remove;

/***/ }),

/***/ "./node_modules/lodash/stubArray.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/stubArray.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

module.exports = stubArray;

/***/ }),

/***/ "./node_modules/lodash/stubFalse.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/stubFalse.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = stubFalse;

/***/ }),

/***/ "./node_modules/lodash/toFinite.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/toFinite.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var toNumber = __webpack_require__(/*! ./toNumber */ "./node_modules/lodash/toNumber.js");
/** Used as references for various `Number` constants. */


var INFINITY = 1 / 0,
    MAX_INTEGER = 1.7976931348623157e+308;
/**
 * Converts `value` to a finite number.
 *
 * @static
 * @memberOf _
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * _.toFinite(3.2);
 * // => 3.2
 *
 * _.toFinite(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toFinite(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toFinite('3.2');
 * // => 3.2
 */

function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }

  value = toNumber(value);

  if (value === INFINITY || value === -INFINITY) {
    var sign = value < 0 ? -1 : 1;
    return sign * MAX_INTEGER;
  }

  return value === value ? value : 0;
}

module.exports = toFinite;

/***/ }),

/***/ "./node_modules/lodash/toInteger.js":
/*!******************************************!*\
  !*** ./node_modules/lodash/toInteger.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var toFinite = __webpack_require__(/*! ./toFinite */ "./node_modules/lodash/toFinite.js");
/**
 * Converts `value` to an integer.
 *
 * **Note:** This method is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3.2);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3.2');
 * // => 3
 */


function toInteger(value) {
  var result = toFinite(value),
      remainder = result % 1;
  return result === result ? remainder ? result - remainder : result : 0;
}

module.exports = toInteger;

/***/ }),

/***/ "./node_modules/lodash/toNumber.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/toNumber.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ./isObject */ "./node_modules/lodash/isObject.js"),
    isSymbol = __webpack_require__(/*! ./isSymbol */ "./node_modules/lodash/isSymbol.js");
/** Used as references for various `Number` constants. */


var NAN = 0 / 0;
/** Used to match leading and trailing whitespace. */

var reTrim = /^\s+|\s+$/g;
/** Used to detect bad signed hexadecimal string values. */

var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
/** Used to detect binary string values. */

var reIsBinary = /^0b[01]+$/i;
/** Used to detect octal string values. */

var reIsOctal = /^0o[0-7]+$/i;
/** Built-in method references without a dependency on `root`. */

var freeParseInt = parseInt;
/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */

function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }

  if (isSymbol(value)) {
    return NAN;
  }

  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? other + '' : other;
  }

  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }

  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
}

module.exports = toNumber;

/***/ }),

/***/ "./node_modules/lodash/toPlainObject.js":
/*!**********************************************!*\
  !*** ./node_modules/lodash/toPlainObject.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__(/*! ./_copyObject */ "./node_modules/lodash/_copyObject.js"),
    keysIn = __webpack_require__(/*! ./keysIn */ "./node_modules/lodash/keysIn.js");
/**
 * Converts `value` to a plain object flattening inherited enumerable string
 * keyed properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */


function toPlainObject(value) {
  return copyObject(value, keysIn(value));
}

module.exports = toPlainObject;

/***/ }),

/***/ "./node_modules/lodash/toString.js":
/*!*****************************************!*\
  !*** ./node_modules/lodash/toString.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseToString = __webpack_require__(/*! ./_baseToString */ "./node_modules/lodash/_baseToString.js");
/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */


function toString(value) {
  return value == null ? '' : baseToString(value);
}

module.exports = toString;

/***/ }),

/***/ "./node_modules/lodash/uniq.js":
/*!*************************************!*\
  !*** ./node_modules/lodash/uniq.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseUniq = __webpack_require__(/*! ./_baseUniq */ "./node_modules/lodash/_baseUniq.js");
/**
 * Creates a duplicate-free version of an array, using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons, in which only the first occurrence of each element
 * is kept. The order of result values is determined by the order they occur
 * in the array.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * _.uniq([2, 1, 2]);
 * // => [2, 1]
 */


function uniq(array) {
  return array && array.length ? baseUniq(array) : [];
}

module.exports = uniq;

/***/ }),

/***/ "./node_modules/lodash/values.js":
/*!***************************************!*\
  !*** ./node_modules/lodash/values.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var baseValues = __webpack_require__(/*! ./_baseValues */ "./node_modules/lodash/_baseValues.js"),
    keys = __webpack_require__(/*! ./keys */ "./node_modules/lodash/keys.js");
/**
 * Creates an array of the own enumerable string keyed property values of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property values.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.values(new Foo);
 * // => [1, 2] (iteration order is not guaranteed)
 *
 * _.values('hi');
 * // => ['h', 'i']
 */


function values(object) {
  return object == null ? [] : baseValues(object, keys(object));
}

module.exports = values;

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var g; // This works in non-strict mode

g = function () {
  return this;
}();

try {
  // This works if eval is allowed (see CSP)
  g = g || new Function("return this")();
} catch (e) {
  // This works if the window reference is available
  if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "object") g = window;
} // g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}


module.exports = g;

/***/ }),

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function (module) {
  if (!module.webpackPolyfill) {
    module.deprecate = function () {};

    module.paths = []; // module.parent = undefined by default

    if (!module.children) module.children = [];
    Object.defineProperty(module, "loaded", {
      enumerable: true,
      get: function get() {
        return module.l;
      }
    });
    Object.defineProperty(module, "id", {
      enumerable: true,
      get: function get() {
        return module.i;
      }
    });
    module.webpackPolyfill = 1;
  }

  return module;
};

/***/ })

/******/ });
});
//# sourceMappingURL=snjs.js.map