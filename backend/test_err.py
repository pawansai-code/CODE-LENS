import urllib.request, urllib.error
try:
    urllib.request.urlopen('http://localhost:8000/api/repo/metrics')
except urllib.error.HTTPError as e:
    print(e.read().decode())
