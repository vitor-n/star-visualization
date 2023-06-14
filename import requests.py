import requests
from bs4 import BeautifulSoup
import pandas as pd
from urllib.request import urlopen
import re
import json
import csv
import copy

file_path = "output.json"

url = "http://www.stellar-database.com/Scripts/search_star.exe?ID=200"
page = urlopen(url)

html_bytes = page.read()
html = html_bytes.decode("ISO-8859-1")

soup = BeautifulSoup(html, "html.parser")

text = soup.get_text()

def content_getter(column):
    pattern = re.compile(fr"{column} (.*)")
    matches = re.findall(pattern, text)
    if matches:
        content = matches[0]
    else:
        content = ""
    return content

columns = ["Distance from Sol:", "Diameter:", "Luminosity Class:", "Apparent visual magnitude:", "Absolute visual magnitude:", "Visual luminosity:", "Color indices:"]
dict_original = {"star_name": []}

for column in columns:
        dict_original[column] = []


myFile = open('Demo.csv', 'r+')

id = 100

while True:
    
    dict_star = copy.deepcopy(dict_original)

    url = f"http://www.stellar-database.com/Scripts/search_star.exe?ID={id}"
    page = urlopen(url)
    html_bytes = page.read()
    html = html_bytes.decode("ISO-8859-1")

    soup = BeautifulSoup(html, "html.parser")

    text = soup.get_text()
    
    for column in columns:
        dict_star[column].append(content_getter(column))

    first_h1 = soup.find('h1')

    if first_h1:
        h1_content = first_h1.text
        dict_star["star_name"].append(h1_content)
    else:
        print("No 'h1' tag found.")
        break

    id += 100
    true_id = id * 100

    writer = csv.writer(myFile)
    writer.writerow(dict_star.values())
    print(id)
    dict_star = {}