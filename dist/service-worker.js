"use strict";const staticCache="static-cache-v1";const dynamicCache="dynamic-cache-v1";const urlsToCache=["/","/index.html","/style.min.css","/script.min.js","/Logo.png","/icons8-time-80.png","favicon.ico","/icons/favicon-16x16.png","/icons/favicon-32x32.png","/manifest.json","https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css","/beep.mp3","/bell.mp3","/click.mp3","/digit.mp3","/fast ticking.mp3","/slow ticking.mp3","/mechanic.mp3"];self.addEventListener("install",event=>{event.waitUntil(caches.open(staticCache).then(cache=>{cache.addAll(urlsToCache)}).catch(err=>console.log(err)))});self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>{return Promise.all(keys.filter(key=>key!==staticCache&&key!==dynamicCache).map(key=>caches.delete(key)))}))});self.addEventListener("fetch",event=>{event.respondWith(caches.match(event.request).then(cacheRes=>{return cacheRes||fetch(event.request).then(fetchRes=>{return caches.open(dynamicCache).then(cache=>{cache.put(event.request.url,fetchRes.clone());return fetchRes})})}))});