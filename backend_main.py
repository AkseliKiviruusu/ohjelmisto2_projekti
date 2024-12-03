from flask import Flask, Response
import json
from connections import connection, apikey
from flask_cors import CORS
from geopy import distance
import requests



def get_start_location():
    sql = f'SELECT ident, continent, latitude_deg, longitude_deg FROM airport WHERE ident in(SELECT location FROM game);'
    cursor = connection.cursor()
    cursor.execute(sql)
    start_location = cursor.fetchall()
    return start_location[0]

class Player:

    def __init__(self, name, ident, continent, latitude, longitude, connection, trophys=0, distance=0, points=0):
        self.name = name
        self.ident = ident
        self.continent = continent
        self.latitude = f"{latitude:.14f}"
        self.longitude = f"{longitude:.14f}"
        self.connection = connection
        self.trophys = trophys
        self.distance = distance
        self.points = points

    def get_random_location(self,deg, min, max):
        sql = (f'SELECT airport.ident, airport.name AS airport, country.name AS country, airport.continent, airport.latitude_deg, airport.longitude_deg FROM airport JOIN country ON airport.iso_country = country.iso_country WHERE {deg} > %s AND {deg} < %s ORDER BY RAND() LIMIT 1;')
        cursor = self.connection.cursor(dictionary=True)
        cursor.execute(sql, (min, max))
        random_location = cursor.fetchall()
        if len(random_location) == 0:
            random_location = self.get_location_on_same_continent()
        return random_location

    def get_location_on_same_continent(self):
        sql = f'SELECT airport.ident, airport.name AS airport, country.name AS country, airport.continent, airport.latitude_deg, airport.longitude_deg FROM airport JOIN country ON airport.iso_country = country.iso_country WHERE airport.continent = (SELECT continent FROM airport WHERE ident = %s) ORDER BY RAND() LIMIT 1;'
        cursor = self.connection.cursor(dictionary=True)
        cursor.execute(sql, (self.ident,))
        random_location = cursor.fetchall()
        return random_location

    def get_5_locations(self):
        location_north = self.get_random_location("latitude_deg", str(float(self.latitude) + 10), str(float(self.latitude) + 20))
        location_south = self.get_random_location("latitude_deg", str(float(self.latitude) - 20), str(float(self.latitude) - 10))
        location_east = self.get_random_location("longitude_deg", str(float(self.longitude) + 10), str(float(self.longitude) + 20))
        location_west = self.get_random_location("longitude_deg", str(float(self.longitude) - 20), str(float(self.longitude) - 10))
        location_same_continent = self.get_location_on_same_continent()
        locations = [location_north, location_south, location_east, location_west, location_same_continent]
        return locations

    def calculate_distance(self, ident):
        sql = f'SELECT latitude_deg, longitude_deg FROM airport WHERE ident = %s'
        cursor = connection.cursor()
        cursor.execute(sql, (ident,))
        location_cordinates = cursor.fetchall()
        distance_to = distance.distance(location_cordinates, (self.latitude, self.longitude)).meters
        return distance_to

    def set_new_location(self, ident):
        sql = f'SELECT ident, continent, latitude_deg, longitude_deg FROM airport WHERE ident = %s ;'
        cursor = self.connection.cursor(dictionary=True)
        cursor.execute(sql, (ident,))
        newlocation = cursor.fetchone()
        self.ident = newlocation['ident']
        self.continent = newlocation['continent']
        self.latitude = newlocation['latitude_deg']
        self.longitude = newlocation['longitude_deg']
        return

    def adjust_points(self, points):
        self.points += points

    def get_location_weather(self):
        haku = "https://api.openweathermap.org/data/2.5/weather?lat=" + str(self.latitude) + "&lon=" + str(self.longitude) + "&appid=" + str(apikey) + "&units=metric&lang=Fi"
        json_weather = None
        try:
            vastaus = requests.get(haku)
            if vastaus.status_code == 200:
                vast = vastaus.json()
                json_weather = vast["weather"][0]["description"]
        except requests.exceptions.RequestException as e:
            json_weather = {}
            print(e)
        return json_weather

    def get_random_event(self):
        sql = "SELECT text, points FROM random_events ORDER BY RAND() LIMIT 1;"
        cursor = connection.cursor()
        cursor.execute(sql)
        res = cursor.fetchone()
        return {"points": res[1], "string": res[0]}


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
players = []

@app.route("/player_name/<name>")
def get_player_name(name):
    start_location = get_start_location()
    ident, continent, latitude, longitude = start_location
    pelaaja = Player(name, ident, continent, latitude, longitude, connection)
    players.append(pelaaja)
    vastaus = pelaaja.get_5_locations()
    status = 200
    jsonvast = json.dumps(vastaus)
    return Response(response=jsonvast, status=status, mimetype="application/json")

@app.route("/new_location/<ident>")
def new_location(ident):
    pelaaja = players[-1]
    distance_to = pelaaja.calculate_distance(ident)
    pelaaja.distance += distance_to
    pelaaja.set_new_location(ident)
    weather = pelaaja.get_location_weather()
    event = pelaaja.get_random_event()
    pelaaja.adjust_points(event["points"])
    vastaus = weather, event["string"], pelaaja.points, pelaaja.distance
    status = 200
    jsonvast = json.dumps(vastaus)
    return Response(response=jsonvast, status=status, mimetype="application/json")





@app.route("/5airports")
def get_options():
    pelaaja = players[-1]
    vastaus = pelaaja.get_5_locations()
    jsonvast = json.dumps(vastaus)
    status = 200
    return Response(response=jsonvast, status=status, mimetype="application/json")

if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=3000)


