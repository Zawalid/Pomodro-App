"use strict";const staticCache="static-cache-v0";const dynamicCache="dynamic-cache-v0";const urlsToCache=["/","/index.html","/style.min.css","/script.min.js","/icon.png","/icons8-time-80.png","/manifest.json","https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"];self.addEventListener("install",event=>{event.waitUntil(caches.open(staticCache).then(cache=>{cache.addAll(urlsToCache)}).catch(err=>console.log(err)))});self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>{return Promise.all(keys.filter(key=>key!==staticCache&&key!==dynamicCache).map(key=>caches.delete(key)))}))});self.addEventListener("fetch",event=>{event.respondWith(caches.match(event.request).then(cacheRes=>{return cacheRes||fetch(event.request).then(fetchRes=>{return caches.open(dynamicCache).then(cache=>{cache.put(event.request.url,fetchRes.clone());return fetchRes})})}))});