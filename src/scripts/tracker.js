// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.



import Analytics from './google-analytics.js';

/**
 * Add your Analytics tracking ID here.
 */
var _AnalyticsCode = 'UA-57909309-4';

/**
 * Track a click on a button using the asynchronous tracking API.
 *
 * See http://code.google.com/apis/analytics/docs/tracking/asyncTracking.html
 * for information on how to use the asynchronous tracking API.
 */
export function wayixia_track_button_click(e) {
  Analytics.fireEvent('click_button', { id: e.id });
}

export function wayixia_track_event(id, from) {
  Analytics.fireEvent(from, { id: id });
}


// Fire a page view event on load
window.addEventListener('load', () => {
  Analytics.firePageViewEvent(document.title, document.location.href);
});


/*
// Listen globally for all button events
document.addEventListener('click', (event) => {
  if (event.target instanceof HTMLButtonElement) {
    Analytics.fireEvent('click_button', { id: event.target.id });
  }
});
*/


