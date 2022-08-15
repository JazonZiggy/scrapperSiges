const checkFileType = function (arg, callback) {
	if (typeof arg !=='number'){
		return callback("not a number")
	}
	callback(null,"yes it is a number");
}

checkFileType("arroz", function(err, data){
	if(err){
		console.log(err)
	} else {
		console.log(data)
	}
})