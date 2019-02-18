if (!Date.prototype.format) {
	Date.prototype.format = function(fmt) {
		fmt = fmt || 'Y-M-D H:N:S';
		var year = this.getFullYear() + '';
		var month = this.getMonth() + 1 + '';
		var date = this.getDate() + '';
		var hour = this.getHours() + '';
		var minute = this.getMinutes() + '';
		var second = this.getSeconds() + '';
		var milliSecond = this.getMilliseconds() + '';
		var weekDay = this.getDay() + '';
		return fmt.replace(/Y/g, year).replace(/y/g, year.substr(-2)).replace(/M/g, ('00' + month).substr(-2)).replace(/m/g, month).replace(/D/g, ('00' + date).substr(-2)).replace(/d/g, date)
			.replace(/H/g, ('00' + hour).substr(-2)).replace(/h/g, hour).replace(/N/g, ('00' + minute).substr(-2)).replace(/n/g, minute).replace(/S/g, ('00' + second).substr(-2)).replace(/s/g, second)
			.replace(/T/g, ('000' + milliSecond).substr(-3)).replace(/t/g, milliSecond).replace(/W/g, ['日', '一', '二', '三', '四', '五', '六'][weekDay]).replace(/w/g, weekDay);
	};
}
