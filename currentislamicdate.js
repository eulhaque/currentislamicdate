Module.register("currentislamicdate",{

	/*
	 * This module uses http://api.aladhan.com/gToH?date=DD-MM-YYYY' to
	 * convert Georgian calendar date to islamic calendar date.
	 * This module uses the existing built-in module to copy the code
	 * structure and develop on top of this.
	 */
	defaults: {
		updateInterval: 10 * 60 * 1000, // every 24 hour
		initLoadDelay: 0,
		retryDelay:2500,
		dateApi: 'http://api.aladhan.com/gToH?date=',
		css_class: 'bright medium',
		month_lang: 'ar', // 'en' -> for english month and 'ar' -> arabic
	},

	start: function() {
		Log.info("starting module " + this.name);
		this.loaded = false;
		this.result = null;
		this.scheduleUpdate(this.config.initLoadDelay);
	},
	
	wrap_dir: function(dir, str) {
		if (dir === 'rtl') return '\u202B' + str + '\u202C';
		return '\u202A' + str + '\u202C';
	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
		if (this.loaded) {
			var hijri = this.result['data']['hijri'];
			var isl_day = hijri['day'];
			var isl_month = hijri['month'][this.config.month_lang];
			var isl_year = hijri['year'];
			
			div = document.createElement('div');
			div.className = this.config.css_class;
			str = this.wrap_dir('ltr', 'AH ' + isl_year + ', ');
			str += this.wrap_dir('rtl', isl_month);
			str += this.wrap_dir('ltr', ' ' + isl_day);
			div.innerHTML = str;
			wrapper.appendChild(div);
		}else {
			Log.info("Still not loaded yet");
		}
		
		return wrapper;
	},
	
	processDate: function(data) {
		
		this.loaded = true;
		this.result = data;
		this.updateDom(this.config.animationSpeed);
	},

	updateDate: function() {
		var now = new Date();
		var month = now.getMonth() + 1; //getMonth starts from 0 - 11
		var month_str = month;
		if (month < 10) { 
			month_str = '0' + month;
		}
		var date = now.getDate() + '-' + month_str + '-' + now.getFullYear();

		var url = this.config.dateApi + date;
		var self = this;
		
		var request = new XMLHttpRequest();
		Log.info(url)
		request.open("GET", url, true);
		request.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processDate(JSON.parse(this.response));
				}else {
					Log.error("Got error. Failed to fetch timings");
				}
			}
		};		
		request.send();
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		setTimeout(function() {
			self.updateDate();
		}, nextLoad);
	},
});