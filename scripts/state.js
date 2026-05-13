(function () {
  'use strict';

  const STORAGE_KEY = 'trickleup.role';

  const state = {
    role: null,
    listeners: new Set(),
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && typeof raw === 'string') {
        state.role = raw;
      }
    } catch (err) {
      // localStorage unavailable - in-memory only
    }
    return state.role;
  }

  function save(roleId) {
    try {
      localStorage.setItem(STORAGE_KEY, roleId);
    } catch (err) {
      // ignore
    }
  }

  function setRole(roleId) {
    state.role = roleId;
    save(roleId);
    notify();
  }

  function getRole() {
    return state.role;
  }

  function subscribe(fn) {
    state.listeners.add(fn);
    return () => state.listeners.delete(fn);
  }

  function notify() {
    state.listeners.forEach((fn) => {
      try {
        fn(state.role);
      } catch (err) {
        console.error('[state] listener failed', err);
      }
    });
  }

  // Auto-load on script init
  load();

  window.TrickleState = {
    load,
    setRole,
    getRole,
    subscribe,
  };
})();
