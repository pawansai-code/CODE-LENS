import urllib.request, urllib.error

urls = [
    'http://localhost:8001/api/repo/metrics',
    'http://localhost:8001/api/repo/graph',
    'http://localhost:8001/api/repo/files'
]

for url in urls:
    try:
        response = urllib.request.urlopen(url)
        print(f"{url}: Success (Status: {response.getcode()})")
    except urllib.error.HTTPError as e:
        print(f"{url}: HTTPError: {e.getcode()}")
        print(e.read().decode())
    except Exception as e:
        print(f"{url}: Error: {e}")
