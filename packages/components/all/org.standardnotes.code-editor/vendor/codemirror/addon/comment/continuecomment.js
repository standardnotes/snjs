!function(e){"object"==typeof exports&&"object"==typeof module?e(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],e):e(CodeMirror)}((function(e){var n=/\S/g,t=String.prototype.repeat||function(e){return Array(e+1).join(this)};function o(n){if(n.getOption("disableInput"))return e.Pass;for(var o,r=n.listSelections(),c=[],f=0;f<r.length;f++){var a=r[f].head;if(!/\bcomment\b/.test(n.getTokenTypeAt(a)))return e.Pass;var m=n.getModeAt(a);if(o){if(o!=m)return e.Pass}else o=m;var s,u,d=null,p=o.blockCommentStart,h=o.lineComment;if(p&&o.blockCommentContinue){var b=(s=n.getLine(a.line)).lastIndexOf(o.blockCommentEnd,a.ch-o.blockCommentEnd.length);if(-1!=b&&b==a.ch-o.blockCommentEnd.length||h&&(u=s.lastIndexOf(h,a.ch-1))>-1&&/\bcomment\b/.test(n.getTokenTypeAt({line:a.line,ch:u+1})));else if(a.ch>=p.length&&(u=s.lastIndexOf(p,a.ch-p.length))>-1&&u>b)if(i(0,s)>=u)d=s.slice(0,u);else{var g,C=n.options.tabSize;u=e.countColumn(s,u,C),d=n.options.indentWithTabs?t.call("\t",g=Math.floor(u/C))+t.call(" ",u-C*g):t.call(" ",u)}else(u=s.indexOf(o.blockCommentContinue))>-1&&u<=a.ch&&u<=i(0,s)&&(d=s.slice(0,u));null!=d&&(d+=o.blockCommentContinue)}if(null==d&&h&&l(n))if(null==s&&(s=n.getLine(a.line)),u=s.indexOf(h),a.ch||u){if(u>-1&&i(0,s)>=u){if(!(d=i(a.ch,s)>-1)){var v=n.getLine(a.line+1)||"",y=v.indexOf(h);d=y>-1&&i(0,v)>=y||null}d&&(d=s.slice(0,u)+h+s.slice(u+h.length).match(/^\s*/)[0])}}else d="";if(null==d)return e.Pass;c[f]="\n"+d}n.operation((function(){for(var e=r.length-1;e>=0;e--)n.replaceRange(c[e],r[e].from(),r[e].to(),"+insert")}))}function i(e,t){n.lastIndex=e;var o=n.exec(t);return o?o.index:-1}function l(e){var n=e.getOption("continueComments");return!n||"object"!=typeof n||!1!==n.continueLineComment}e.defineOption("continueComments",null,(function(n,t,i){if(i&&i!=e.Init&&n.removeKeyMap("continueComment"),t){var l="Enter";"string"==typeof t?l=t:"object"==typeof t&&t.key&&(l=t.key);var r={name:"continueComment"};r[l]=o,n.addKeyMap(r)}}))}));