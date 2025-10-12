# 🌌 Nova Console (`js-cmd-inject`)

A lightweight, mobile-first overlay console you can inject into **any web page** with a single bookmarklet or a quick DevTools snippet.  
Nova gives you a minimal UI, a live console mirror, simple network logging, and a mini “Menu” hub with pluggable panels (Weather, Crypto, etc.). It’s framework-free, **XHR-friendly**, and designed to work even when `fetch` is patched or mis-bound.

> Demo loader used by: [Console Utilities](https://openapislop.github.io/js-command-inject-utility/)

---

## ✨ Highlights

- **One-click inject** via bookmarklet (no DevTools required)
- **DevTools quick-load**: paste a single snippet to install from CDN
- **Mobile-first** UI with safe-area support and drag resize
- **Console mirror**: `console.log / warn / error` piped into the overlay
- **Network tab**: auto-captures `fetch` + `XMLHttpRequest` (method, URL, status, ms, size)
- **Menu panels** (extensible): Weather, Crypto, About, Command List
- **Safe JSON helper** `_httpJSON` with **XHR fallback**
- **Clean unmount**: restores `console.*`, `fetch`, `XHR`, viewport meta, and DOM elements

---

## 🔧 Quick Install — Bookmarklet (Recommended)

Create a bookmark named **“Nova Console”** and paste this into the **URL** field:

```javascript
javascript:(function(d,u)%7B%20%20%20if(d.defaultView.nova)%7B%20nova.off();%20return;%20%7D%20%20%20var%20s=d.createElement('script');%20%20%20s.src%20=%20u%20+%20(u.includes('?')%20?%20'&'%20:%20'?')%20+%20'v='%20+%20Date.now();%20%20%20s.defer%20=%201;%20%20%20s.onerror%20=%20function()%7B%20alert('nova%20load%20failed')%20%7D;%20%20%20d.documentElement.appendChild(s);%20%7D)(document,'https://raw.githack.com/OpenAPISlop/js-command-inject/main/script.js');
