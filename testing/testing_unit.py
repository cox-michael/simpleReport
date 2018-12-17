import requests
import json
import unittest

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

class NotLoggedIn(unittest.TestCase):

    def __init__(self):
        print('Testing APIs the user is not logged in')

    def index(self):
        endpoint = 'https://ba.thig.com/sr-dev/'
        response = requests.get(url=endpoint)
        self.assertEqual(response.status_code, 200, endpoint)
        self.assertEqual(response.text, index_html, endpoint)

    def get_api(self):

        endpoints = [
                'https://ba.thig.com/sr-dev/getReports',
                'https://ba.thig.com/sr-dev/getRequests'
        ]
        for endpoint in endpoints:
            response = requests.get(url=endpoint)
            self.assertEqual(response.status_code, 401, endpoint)
            self.assertEqual(json.loads(response.text), notLoggedIn, endpoint)


unittest.main()

if __name__ == "__main__":
    test_sum()
    test_sum_tuple()
    print("Everything passed")







endpoint = 'https://ba.thig.com/sr-dev/getReports'
response = requests.get(url=endpoint)
print('getReports', all([
     response.status_code == 401,
     json.loads(response.text) == notLoggedIn
     ]))

endpoint = 'https://ba.thig.com/sr-dev/getRequests'
response = requests.get(url=endpoint)
print('getRequests', all([
     response.status_code == 401,
     json.loads(response.text) == notLoggedIn
     ]))

endpoint = 'https://ba.thig.com/sr-dev/getSchedules'
response = requests.get(url=endpoint)
print('getSchedules', all([
     response.status_code == 401,
     json.loads(response.text) == notLoggedIn
     ]))

endpoint = 'https://ba.thig.com/sr-dev/mostDownloadedReports'
response = requests.get(url=endpoint)
print('mostDownloadedReports', all([
     response.status_code == 401,
     json.loads(response.text) == notLoggedIn
     ]))

endpoint = 'https://ba.thig.com/sr-dev/mostActiveUsersByDownloads'
response = requests.get(url=endpoint)
print('mostActiveUsersByDownloads', all([
     response.status_code == 401,
     json.loads(response.text) == notLoggedIn
     ]))

endpoint = 'https://ba.thig.com/sr-dev/downloadTest/5bf46573f5c92f6b5383b5bd.xlsx'
response = requests.get(url=endpoint)
print('downloadTest/:filename', all([
     response.status_code == 401,
     json.loads(response.text) == notLoggedIn
     ]))

endpoint = 'https://ba.thig.com/sr-dev/downloadTest/5bf46573f5c92f6b5383b5bd.xlsx'
response = requests.get(url=endpoint)
print('downloadTest/:filename', all([
     response.status_code == 401,
     json.loads(response.text) == notLoggedIn
     ]))

endpoint = 'https://ba.thig.com/sr-dev/downloadReport/5bf9c7a9f464bd04dd621a89'
response = requests.get(url=endpoint)
print('downloadReport/:id', all([
     response.status_code == 200,
     response.text == index_html
     ]))

#%%

endpoint = 'https://ba.thig.com/sr-dev/'
response = requests.get(url=endpoint)

#%%

###############################################################################
print('LOGGED IN; NOT AN ANALYST')
###############################################################################

endpoint = 'https://ba.thig.com/sr-dev/login'
response = requests.post(url=endpoint, data={'username': 'm1cox', 'password':''})
print('index.html', all([
     response.status_code == 200,
     response.text == index_html
     ]))

endpoint = 'https://ba.thig.com/sr-dev/getReports'
response = requests.get(url=endpoint)
print('getReports', all([
     response.status_code == 401,
     json.loads(response.text) == notLoggedIn
     ]))

endpoint = 'https://ba.thig.com/sr-dev/getRequests'
response = requests.get(url=endpoint)
print('getRequests', all([
     response.status_code == 401,
     json.loads(response.text) == notLoggedIn
     ]))

endpoint = 'https://ba.thig.com/sr-dev/getSchedules'
response = requests.get(url=endpoint)
print('getSchedules', all([
     response.status_code == 401,
     json.loads(response.text) == notLoggedIn
     ]))

endpoint = 'https://ba.thig.com/sr-dev/mostDownloadedReports'
response = requests.get(url=endpoint)
print('mostDownloadedReports', all([
     response.status_code == 401,
     json.loads(response.text) == notLoggedIn
     ]))

endpoint = 'https://ba.thig.com/sr-dev/mostActiveUsersByDownloads'
response = requests.get(url=endpoint)
print('mostActiveUsersByDownloads', all([
     response.status_code == 401,
     json.loads(response.text) == notLoggedIn
     ]))

endpoint = 'https://ba.thig.com/sr-dev/downloadTest/5bf46573f5c92f6b5383b5bd.xlsx'
response = requests.get(url=endpoint)
print('downloadTest/:filename', all([
     response.status_code == 401,
     json.loads(response.text) == notLoggedIn
     ]))

endpoint = 'https://ba.thig.com/sr-dev/downloadTest/5bf46573f5c92f6b5383b5bd.xlsx'
response = requests.get(url=endpoint)
print('downloadTest/:filename', all([
     response.status_code == 401,
     json.loads(response.text) == notLoggedIn
     ]))

endpoint = 'https://ba.thig.com/sr-dev/downloadReport/5bf9c7a9f464bd04dd621a89'
response = requests.get(url=endpoint)
print('downloadReport/:id', all([
     response.status_code == 200,
     response.text == index_html
     ]))



#%%



###############################################################################
print('NO SUPERPOWERS')
###############################################################################

#username = 'THIG_PX'
#password = 'bv#gN88p@u$X%3Yg'
#client_id = 'THIG_Client'
#client_secret = 'rjL!VT+Z&M7SjE$&'
#user_id = '26948231-B580-4D7A-93B1-ED4679DCED06'


endpoint = 'https://ba.thig.com/sr-dev/loggedIn'
headers = {
#    'cache-control': 'no-cache',
#    'content-type': 'application/x-www-form-urlencoded',
    'Content-Type': 'application/json',
}

#data = {
#  'username': username,
#  'password': password,
#  'grant_type': 'password',
#  'client_id': client_id,
#  'client_secret': client_secret
#}

#response = requests.post(url=auth_endpoint, headers=headers, data=data, verify=False)
response = requests.get(url=endpoint, headers=headers)
response = requests.get(url=endpoint)

response.status_code
response.text
json.loads(response.text)
