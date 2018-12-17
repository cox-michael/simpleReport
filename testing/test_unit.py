import requests
import json

index_html = """<title>simpleReport</title>\r\n<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500">\r\n<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">\r\n<div id="root"></div>\r\n<script src="/sr-dev/dist/main.js"></script>\r\n"""

notLoggedIn = {
	'isLoggedIn': False,
	'success': False,
	'messages': ['Not logged in']
}

#%%

###############################################################################
print('NOT LOGGED IN')
###############################################################################


def test_index():
    endpoint = 'https://ba.thig.com/sr-dev/'
    response = requests.get(url=endpoint)
    assert response.status_code == 200, endpoint
    assert response.text == index_html, endpoint

def test_get_api():

    endpoints = [
            'https://ba.thig.com/sr-dev/api/getReports',
            'https://ba.thig.com/sr-dev/api/getRequests'
    ]
    for endpoint in endpoints:
        response = requests.get(url=endpoint)
        assert response.status_code == 401, endpoint
#        assert json.loads(response.text) == notLoggedIn, endpoint




