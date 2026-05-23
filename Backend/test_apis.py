import urllib.request

url = "https://www.olx.ua/api/v1/categories"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    print(response.read().decode())
