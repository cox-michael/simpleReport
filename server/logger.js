module.exports = function () {

  const log = (req) => {
  	var d = new Date();
  	var timestamp = (
  		d.getFullYear().toString() +
  		"-" + ((d.getMonth()+1).toString().length==2?(d.getMonth()+1).toString():"0"+(d.getMonth()+1).toString()) +
  		"-" + (d.getDate().toString().length==2?d.getDate().toString():"0"+d.getDate().toString()) +
  		" " + (d.getHours().toString().length==2?d.getHours().toString():"0"+d.getHours().toString()) +
  		":" + (d.getMinutes().toString().length==2?d.getMinutes().toString():"0"+d.getMinutes().toString()) +
  		":" + (d.getSeconds().toString().length==2?d.getSeconds().toString():"0"+d.getSeconds().toString())
  	);

  	if (typeof(req.session) !== "undefined" &&
  	 		typeof(req.session.realUn) !== "undefined") {
  		var user = req.session.realUn;
  	} else {
  		var user = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  	}

  
  	var msg = '[' + timestamp + ']'
  	msg += ' ' + user;
  	msg += ' ' + req.originalUrl;

  	console.log(msg)
  }

  return log;
}
