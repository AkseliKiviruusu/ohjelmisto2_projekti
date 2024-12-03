from flask import Flask, Response
import json
from connections import connection
from flask_cors import CORS



def get_start_location():
    sql = f'SELECT ident, continent, latitude_deg, longitude_deg FROM airport WHERE ident in(SELECT location FROM game);'
    cursor = connection.cursor()
    cursor.execute(sql)
    start_location = cursor.fetchall()
    return start_location[0]

class Player:

    def __init__(self, name, ident, continent, latitude, longitude, connection, trophys=0, distance=0):
        self.name = name
        self.ident = ident
        self.continent = continent
        self.latitude = f"{latitude:.14f}"
        self.longitude = f"{longitude:.14f}"
        self.connection = connection
        self.trophys = trophys
        self.distance = distance

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



app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route("/player_name/<name>")
def get_player_name(name):
    start_location = get_start_location()
    ident, continent, latitude, longitude = start_location
    pelaaja = Player(name, ident, continent, latitude, longitude, connection)
    vastaus = pelaaja.get_5_locations()
    status = 200
    jsonvast = json.dumps(vastaus)
    return Response(response=jsonvast, status=status, mimetype="application/json")

@app.route("/5airports")
def get_options():
    vastaus = pelaaja.get_5_locations()
    jsonvast = json.dumps(vastaus)
    status = 200
    return Response(response=jsonvast, status=status, mimetype="application/json")

if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=3000)


