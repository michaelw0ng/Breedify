(this.webpackJsonpbreedify=this.webpackJsonpbreedify||[]).push([[0],{21:function(e,t,r){},31:function(e,t,r){"use strict";r.r(t);var o=r(0),n=r.n(o),c=r(13),s=r.n(c),i=r(16),a=(r(21),r(2));function d(e){var t=e.video;return Object(a.jsx)("div",{children:Object(a.jsx)("iframe",{width:"560",height:"315",src:"https://www.youtube.com/embed/".concat(t),title:"YouTube video player",frameBorder:"0",allow:"fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"})})}function u(e){return e.videos.map((function(e){return Object(a.jsx)(d,{video:e},e)}))}var l=r(1);var h=function(){var e=[],t=Object(l.e)(),r="",n=Object(o.useState)([]),c=Object(i.a)(n,2),s=c[0],d=c[1];return Object(a.jsxs)("div",{id:"border",children:[Object(a.jsx)("h1",{id:"font",children:"Breedify"}),Object(a.jsx)("p",{children:"Click search for video from a random dog breed"}),Object(a.jsx)("p",{id:"smalltext",children:"(Press search again after authentication. Youtube API only allows 100 searches a day. If you don't see a video, the Youtube API very likely has ran out of free credits.)"}),Object(a.jsx)("button",{id:"search",onClick:function(){e=[];var o=new XMLHttpRequest;o.addEventListener("load",(function(){console.log(o.responseText+"hello"),o.responseText.length>20&&(r=o.responseText),"works"!==o.responseText&&o.responseText.length<20&&(e.push(o.responseText),console.log(e),e.forEach((function(e){return d((function(){return[e]}))}))),""!==r&&t.push("/google")})),o.open("POST","https://breedify.herokuapp.com"),o.send()},children:"Search"}),Object(a.jsx)("h1",{children:" "}),Object(a.jsx)(u,{videos:s}),Object(a.jsx)(l.a,{path:"/google",component:function(){return window.location.href="".concat(r),null}})]})},b=r(9);s.a.render(Object(a.jsx)(n.a.StrictMode,{children:Object(a.jsx)(b.a,{children:Object(a.jsx)(h,{})})}),document.getElementById("root"))}},[[31,1,2]]]);
//# sourceMappingURL=main.4c1fd3c1.chunk.js.map