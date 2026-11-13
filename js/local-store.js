/* Oritic offline store
 * A small Firestore-compatible database that lives in this browser (IndexedDB).
 * It implements only what the panel uses: doc().set/get/delete/onSnapshot,
 * collection().onSnapshot/get/where().get, batch(), FieldPath and set options
 * {merge} and {mergeFields}. Data never leaves this browser.
 *
 * Mode is chosen in firebase-config.js:  window.ORITIC_MODE = 'local' | 'firebase'
 * In 'local' mode this file replaces window.firebase before the panel boots.
 */
(function(){
  'use strict';
  var MODE = window.ORITIC_MODE || (window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey && !/PASTE|XXXX/.test(window.FIREBASE_CONFIG.apiKey) ? 'firebase' : 'local');
  window.ORITIC_MODE = MODE;
  if (MODE !== 'local') return;

  var DB_NAME = 'oritic-local', STORE = 'docs';
  var mem = {};          // { 'customers': { id: data } }
  var listeners = [];    // { kind:'col'|'doc', col, id, cb }
  var idb = null, ready;
  var chan = ('BroadcastChannel' in window) ? new BroadcastChannel('oritic-local') : null;

  var clone = function(v){ return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); };
  var isObj = function(v){ return v && typeof v === 'object' && !Array.isArray(v); };
  function deepMerge(a, b){ var out = isObj(a) ? clone(a) : {}; Object.keys(b).forEach(function(k){ out[k] = (isObj(b[k]) && isObj(out[k])) ? deepMerge(out[k], b[k]) : clone(b[k]); }); return out; }
  function split(path){ var p = String(path).split('/').filter(Boolean); return { col: p[0], id: p[1] }; }

  function openIdb(){
    return new Promise(function(res){
      if (!window.indexedDB) { res(null); return; }
      var rq = indexedDB.open(DB_NAME, 1);
      rq.onupgradeneeded = function(){ rq.result.createObjectStore(STORE); };
      rq.onsuccess = function(){ res(rq.result); };
      rq.onerror = function(){ console.warn('IndexedDB nahi khula, data sirf is tab me rahega'); res(null); };
    });
  }
  function loadAll(){
    return new Promise(function(res){
      if (!idb) { res(); return; }
      var tx = idb.transaction(STORE, 'readonly'), st = tx.objectStore(STORE), rq = st.openCursor();
      rq.onsuccess = function(){ var c = rq.result; if (c) { var k = split(c.key); (mem[k.col] = mem[k.col] || {})[k.id] = c.value; c.continue(); } else res(); };
      rq.onerror = function(){ res(); };
    });
  }
  function persist(col, id, data){
    if (!idb) return Promise.resolve();
    return new Promise(function(res, rej){
      var tx = idb.transaction(STORE, 'readwrite'), st = tx.objectStore(STORE), key = col + '/' + id;
      if (data === undefined) st.delete(key); else st.put(data, key);
      tx.oncomplete = function(){ res(); }; tx.onerror = function(){ rej(tx.error); }; tx.onabort = function(){ rej(tx.error || new Error('Save nahi hua (browser storage full?)')); };
    });
  }
  ready = openIdb().then(function(d){ idb = d; return loadAll(); });

  function docSnap(col, id){ var d = mem[col] && mem[col][id]; return { id: id, exists: d !== undefined, ref: new DocRef(col + '/' + id), data: function(){ return clone(d); } }; }
  function colSnap(col, filter){
    var m = mem[col] || {}, docs = Object.keys(m).filter(function(id){ return !filter || filter(m[id]); }).map(function(id){ return docSnap(col, id); });
    return { docs: docs, size: docs.length, empty: !docs.length, forEach: function(f){ docs.forEach(f); } };
  }
  var notifyT = {};
  function notify(col, id){
    clearTimeout(notifyT[col]);
    notifyT[col] = setTimeout(function(){ listeners.forEach(function(l){ if (l.col !== col) return; if (l.kind === 'col') l.cb(colSnap(col)); else if (!id || l.id === id) l.cb(docSnap(col, l.id)); }); }, 0);
  }
  function apply(col, id, data, fromOtherTab){
    mem[col] = mem[col] || {};
    if (data === undefined) delete mem[col][id]; else mem[col][id] = data;
    notify(col, id);
    if (!fromOtherTab && chan) chan.postMessage({ col: col, id: id, data: data === undefined ? null : data, del: data === undefined });
    return fromOtherTab ? Promise.resolve() : persist(col, id, data);
  }
  if (chan) chan.onmessage = function(e){ var m = e.data || {}; if (m.col) apply(m.col, m.id, m.del ? undefined : m.data, true); };

  function FieldPath(){ this.segments = Array.prototype.slice.call(arguments); }
  function pathOf(f){ return f instanceof FieldPath ? f.segments : String(f).split('.'); }
  function getPath(o, segs){ for (var i = 0; i < segs.length; i++) { if (!isObj(o)) return undefined; o = o[segs[i]]; } return o; }
  function setPath(o, segs, v){ for (var i = 0; i < segs.length - 1; i++) { if (!isObj(o[segs[i]])) o[segs[i]] = {}; o = o[segs[i]]; } if (v === undefined) delete o[segs[segs.length - 1]]; else o[segs[segs.length - 1]] = clone(v); }
  function computeSet(prev, data, opts){
    data = clone(data) || {};
    if (opts && opts.mergeFields) { var out = clone(prev) || {}; opts.mergeFields.forEach(function(f){ var s = pathOf(f); setPath(out, s, getPath(data, s)); }); return out; }
    if (opts && opts.merge) return deepMerge(prev || {}, data);
    return data;
  }

  function DocRef(path){ var k = split(path); this.path = path; this.id = k.id; this._col = k.col; }
  DocRef.prototype.set = function(data, opts){ var self = this; return ready.then(function(){ var prev = mem[self._col] && mem[self._col][self.id]; return apply(self._col, self.id, computeSet(prev, data, opts)); }); };
  DocRef.prototype.update = function(patch){ var self = this; return ready.then(function(){ var prev = mem[self._col] && mem[self._col][self.id]; if (prev === undefined) throw new Error('Document nahi mila: ' + self.path); var out = clone(prev); Object.keys(patch).forEach(function(k){ setPath(out, k.split('.'), patch[k]); }); return apply(self._col, self.id, out); }); };
  DocRef.prototype.get = function(){ var self = this; return ready.then(function(){ return docSnap(self._col, self.id); }); };
  DocRef.prototype.delete = function(){ var self = this; return ready.then(function(){ return apply(self._col, self.id, undefined); }); };
  DocRef.prototype.onSnapshot = function(cb){ var self = this, l = { kind: 'doc', col: this._col, id: this.id, cb: cb }; listeners.push(l); ready.then(function(){ cb(docSnap(self._col, self.id)); }); return function(){ listeners = listeners.filter(function(x){ return x !== l; }); }; };

  var OPS = { '==': function(a, b){ return a === b; }, '!=': function(a, b){ return a !== b; }, '<': function(a, b){ return a < b; }, '<=': function(a, b){ return a <= b; }, '>': function(a, b){ return a > b; }, '>=': function(a, b){ return a >= b; } };
  function Query(col, filters){ this._col = col; this._f = filters || []; }
  Query.prototype.where = function(field, op, val){ return new Query(this._col, this._f.concat([[field, op, val]])); };
  Query.prototype._match = function(d){ return this._f.every(function(f){ var fn = OPS[f[1]]; return fn ? fn(getPath(d, pathOf(f[0])), f[2]) : true; }); };
  Query.prototype.get = function(){ var self = this; return ready.then(function(){ return colSnap(self._col, function(d){ return self._match(d); }); }); };
  Query.prototype.onSnapshot = function(cb){ var self = this, l = { kind: 'col', col: this._col, cb: function(s){ cb(self._f.length ? colSnap(self._col, function(d){ return self._match(d); }) : s); } }; listeners.push(l); ready.then(function(){ l.cb(colSnap(self._col)); }); return function(){ listeners = listeners.filter(function(x){ return x !== l; }); }; };
  Query.prototype.doc = function(id){ return new DocRef(this._col + '/' + (id || Date.now().toString(36) + Math.random().toString(36).slice(2, 8))); };

  function Batch(){ this._ops = []; }
  Batch.prototype.set = function(ref, data, opts){ this._ops.push(function(){ return ref.set(data, opts); }); return this; };
  Batch.prototype.update = function(ref, patch){ this._ops.push(function(){ return ref.update(patch); }); return this; };
  Batch.prototype.delete = function(ref){ this._ops.push(function(){ return ref.delete(); }); return this; };
  Batch.prototype.commit = function(){ return this._ops.reduce(function(p, op){ return p.then(op); }, Promise.resolve()); };

  var db = {
    doc: function(path){ return new DocRef(path); },
    collection: function(name){ return new Query(name); },
    batch: function(){ return new Batch(); },
    enablePersistence: function(){ return Promise.resolve(); }
  };
  var firestore = function(){ return db; };
  firestore.FieldPath = FieldPath;
  firestore.FieldValue = { delete: function(){ return undefined; } };

  window.firebase = {
    initializeApp: function(){ return {}; },
    firestore: firestore,
    auth: function(){ return { signInAnonymously: function(){ return ready; }, currentUser: { uid: 'local' } }; },
    __local: true
  };
  // panel boot checks FIREBASE_CONFIG.apiKey; give it a harmless local value
  window.FIREBASE_CONFIG = { apiKey: 'local-mode', projectId: 'oritic-local' };

  /* ---------- helpers used by Settings → Data ---------- */
  window.OriticLocal = {
    ready: ready,
    counts: function(){ var o = {}; Object.keys(mem).forEach(function(c){ o[c] = Object.keys(mem[c]).length; }); return o; },
    exportAll: function(){ return clone(mem); },
    importAll: function(all){ return ready.then(function(){ var p = Promise.resolve(); Object.keys(all || {}).forEach(function(col){ Object.keys(all[col] || {}).forEach(function(id){ p = p.then(function(){ return apply(col, id, all[col][id]); }); }); }); return p; }); },
    wipe: function(){ return ready.then(function(){ var p = Promise.resolve(); Object.keys(mem).forEach(function(col){ Object.keys(mem[col]).forEach(function(id){ p = p.then(function(){ return apply(col, id, undefined); }); }); }); return p; }); }
  };
})();
