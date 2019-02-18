(function() {
	var contentResolver = null;
	var uri = null;
	var loading = false;
	var resorting = false;

	var sortBys = ['balance+', 'balance-', 'lastMsgTime+', 'lastMsgTime-', 'no+'];
	var curByIdx = 0;

	function sort(by) {
		var dir = by.substr(-1) === '-' ? -1 : 1;
		by = by.substr(0, by.length - 1);
		console.log(by + '/' + dir);
		return function(a, b) {
			a = a[by];
			b = b[by];
			if (by === 'balance') {
				a = parseFloat(a);
				b = parseFloat(b);
			}
			if (a < b) {
				return -1 * dir;
			} else if (a > b) {
				return 1 * dir;
			} else {
				return 0;
			}
		};
	}

	var vCardList = new Vue({
		el: '#body',
		data: {
			bankCards: []
		},
		computed: {
			totalAmount: function() {
				return this.bankCards.reduce(function(acc, el) {
					return acc + el.balance * 1;
				}, 0).toFixed(2);
			}
		},
		methods: {
			clear: function(callbak) {
				var self = this;
				if (self.bankCards.length === 0) {
					callbak();
					return;
				}
				var t = setInterval(function() {
					if (self.bankCards.length > 0) {
						self.bankCards.splice(self.bankCards.length - 1);
					} else {
						clearInterval(t);
						callbak();
					}
				}, 400);
			},
			fill: function() {
				var self = this;
				for (var i = 0, j = 10, k = 1; i < bankInfos.length; i++) {
					var cur = plus.android.invoke(contentResolver, 'query', uri, ['_id', 'date', 'body'], 'address=? and protocol=0', [bankInfos[i].number], '_id desc');
					if (plus.android.invoke(cur, 'moveToFirst')) {
						do {
							var id = plus.android.invoke(cur, 'getLong', 0);
							var date = plus.android.invoke(cur, 'getLong', 1);
							var body = plus.android.invoke(cur, 'getString', 2);
							var match = body.match(bankInfos[i].match);
							if (match !== null) {
								(function(i, id, date, match) {
									var s = setInterval(function() {
										clearInterval(s);
										self.bankCards.push({
											no: self.bankCards.length + 1,
											bankName: bankInfos[i].name,
											bankIcon: bankInfos[i].icon,
											lastMsgId: id,
											lastMsgTime: new Date(date).format(),
											tailNum: match[1],
											balance: match[2]
										});
									}, 400 * k++);
								})(i, id, date, match);
								break;
							}
						} while (--j > 0 && plus.android.invoke(cur, 'moveToNext'));
					}
					plus.android.invoke(cur, 'close');
				}
				setTimeout(function() {
					// plus.nativeUI.closeWaiting();
					mui('#body').pullRefresh().endPulldownToRefresh();
					loading = false;
					console.log(JSON.stringify(self.bankCards));
				}, 400 * k);
			},
			refresh: function() {
				loading = true;
				// plus.nativeUI.showWaiting();
				this.clear(this.fill);
			},
			resort: function() {
				resorting = true;
				this.bankCards.sort(sort(sortBys[curByIdx++ % sortBys.length]));
				setTimeout(function() {
					resorting = false;
				}, 400 * this.bankCards.length);
			}
		}
	});

	mui.init({
		pullRefresh: {
			container: '#body',
			down: {
				style: 'circle',
				auto: true,
				callback: vCardList.refresh
			}
		}
	});

	document.addEventListener('plusready', function(e) {
		contentResolver = plus.android.runtimeMainActivity().getContentResolver();
		uri = plus.android.invoke('android.net.Uri', 'parse', 'content://sms/inbox');
		plus.accelerometer.watchAcceleration(function(a) {
			if (!loading && !resorting && Math.max(Math.abs(a.xAxis), Math.abs(a.yAxis)) > 8)
				vCardList.resort();
		});
	});
})();
