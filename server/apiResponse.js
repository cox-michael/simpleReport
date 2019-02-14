module.exports = function() {

	const apiResponse = (data={}, success=true, messages=[]) => {
		return {
			isLoggedIn: true,
			success: success,
			messages: messages,
			data: data
		};
	};

  return apiResponse;
};
