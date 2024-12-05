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

    def get_random_location(self, deg, min, max):
        sql = (
            f'SELECT airport.ident, airport.name AS airport, country.name AS country, airport.continent, airport.latitude_deg, airport.longitude_deg FROM airport JOIN country ON airport.iso_country = country.iso_country WHERE {deg} > %s AND {deg} < %s ORDER BY RAND() LIMIT 1;')
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
        location_north = self.get_random_location("latitude_deg", str(float(self.latitude) + 10),
                                                  str(float(self.latitude) + 20))
        location_south = self.get_random_location("latitude_deg", str(float(self.latitude) - 20),
                                                  str(float(self.latitude) - 10))
        location_east = self.get_random_location("longitude_deg", str(float(self.longitude) + 10),
                                                 str(float(self.longitude) + 20))
        location_west = self.get_random_location("longitude_deg", str(float(self.longitude) - 20),
                                                 str(float(self.longitude) - 10))
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
        haku = "https://api.openweathermap.org/data/2.5/weather?lat=" + str(self.latitude) + "&lon=" + str(
            self.longitude) + "&appid=" + str(apikey) + "&units=metric&lang=Fi"
        json_weather = None
        try:
            vastaus = requests.get(haku)
            if vastaus.status_code == 200:
                vast = vastaus.json()
                description = vast["weather"][0]["description"]
                weather_id = vast["weather"][0]["id"]
                json_weather = {"description": description, "id": weather_id}
        except requests.exceptions.RequestException as e:
            json_weather = {}
            print(e)
        return json_weather

    def get_weather_points(self, weather_id):
        sql = f'SELECT points FROM weathers where ID = %s;'
        cursor = self.connection.cursor()
        cursor.execute(sql, (weather_id,))
        points = cursor.fetchone()
        return points[0] if points else 0

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
    weather_points = 0
    if weather != None:
        weather_points = pelaaja.get_weather_points(weather['id'])
        return weather_points
    event = pelaaja.get_random_event()
    point_change = weather_points + event["points"]
    pelaaja.adjust_points(point_change)
    vastaus = {
        "weather": weather,
        "event_string": event["string"],
        "point_change": point_change,
        "player_points": pelaaja.points,
        "player_distance": pelaaja.distance
    }

    status = 200
    jsonvast = json.dumps(vastaus)
    return Response(response=jsonvast, status=status, mimetype="application/json")


# Palauttaa tarinan tekstin:
@app.route('/story')
def get_story():
    story = {
        'story_text': 'Oletko valmis lähtemään ennennäkemättömälle matkalle?<br>'
                      '<br>'
                      'Olet jo kauan suunnnittelu tekeväsi aivan ennennäkemättömän lomakiertomatkan<br>'
                      'ymprärin maailmaa, mutta olet ollut huolissasi lentämisen vaikutuksista ympäristölle.<br>'
                      'Lentotekniikka on tulevaisuudessa kehittynyt niin paljon, ettei lentämisen vaikutukset<br>'
                      'ympäristölle ole enää yhtä voimakkaita. Aiot nyt toteuttaa suunnitelmasi.<br>'
                      '<br>'
                      'Haluat matkasi olevan ikimuistoinen, sillä et ole varma, voitko lähteä kiertomatkalle<br>'
                      'enää toiste. Aioit kerätä uniikkeja ja  merkityksellisiä matkamuistoja kohteista,<br>'
                      'tutustua paikallisiin nähtävyyksiin sekä kokea mahdollisimman paljon.<br>'
                      '<br>'
                      'Kestävä kehitys on sinulle tärkeää. Haluat matkasi olevan kestävän kehityksen näkökulmasta<br>'
                      'mahdollisimman kannattava, mutta tiedostat, ettei se ole realistinen tavoite, kun ottaa huomioon<br>'
                      'kuluttamisen ja lentämisen vaikutukset ympäristölle. Varaudut siihen, miten tämä tulee<br>'
                      'varjostamaan matkaasi.<br>'
                      '<br>'
                      'Pakkaa matkalaukkusi, sillä ensimmäinen lentosi odottaa!<br>'
                      '<br>'
                      'Maailma, täältä tullaan!'
    }
    return story


# Palauttaa ohjeet tekstinä:
@app.route('/instructions')
def get_instructions():
    instructions = {
        "instructions_text": "Tavoitteenasi on kerätä seitsemän (7) matkamuistoa ja <br>"
                             "mahdollisimman paljon pisteitä matkustelemalla eri kohteisiin.<br>"
                             "<br>"
                             "Koet ja näet matkan aikana kaikenlaista, ja riippuen kokemuksesta,<br>"
                             "voit joko saada tai menettää pisteitä. Myös matkakohteen säällä on<br>"
                             "vaikutus pisteisiisi.<br> "
                             "<br>"
                             "Jokaisessa kohteessa sinun on mahdollista kerätä matkamuisto,<br>"
                             "mutta tämä ei ole pakollista, eli voit jatkaa matkaa seuraavaan kohteeseen<br>"
                             "keräämättä matkamuistoa.<br>"
                             "Matkamuistoista saa sitä enemmän pisteitä mitä kauempana olet kotoa.<br>"
                             "<br>"
                             "Muista kuitenkin, että matkan kokonaispituus vaikuttaa negatiivisesti sinun lopullisiin<br>"
                             "pisteisiin. Mitä enemmän kilometrejä keräsit, sitä enemmän pisteitä menetät.<br>"
                             "<br>"
                             "Palaat kotiin, kun olet kerännyt seitsemän (7) matkamuistoa.<br>"
                             "<br>Onnea matkaan!"
    }
    return instructions


# Laskee matkamuiston pistearvon
# aloituslentokentän ja tämän hetkisen lentokentän välisen etäisyyden avulla. Päivittää lasketun pistearvon tietokantaan.
# Päivittää tietokantaan myös matkamuistojen määrän.
# Palauttaa tiedon tehdystä tapahtumasta:
@app.route('/trophy_updates')
def calculate_trophy_points_and_update_points():
    # Laskee matkamuiston pistearvon:
    select_start_lat_long = (
        f'SELECT latitude_deg, longitude_deg FROM airport,game '
        f'WHERE ident = game.start_location AND game.id = 1;'
    )
    cursor = connection.cursor()
    cursor.execute(select_start_lat_long)
    start_lat_long = cursor.fetchall()

    start_lat, start_long = start_lat_long[0]
    current_lat_long = (players[-1].latitude, players[-1].longitude)
    start_to_current_distance = distance.distance(
        (start_lat, start_long),
        (current_lat_long[0], current_lat_long[1])
    ).km
    trophy_points = 30 + int(start_to_current_distance / 125)

    # Päivittää pisteet:
    players[-1].points = players[-1].points + trophy_points
    # print(players[0].points)

    # Päivittää tämänhetkisten matkamuistojen määrän:
    players[-1].trophys = players[-1].trophys + 1
    # print(players[0].trophys)

    response = {
        'Trophy points calculated. Points and trophies updated': True
    }
    return response


# Vertaa max_trophyn arvoa current_trophyn arvoon. Paluttaa True/False arvon,
# jolla voidaan katsoa, jatkuuko looppi eli peli:
@app.route('/trophy_status')
def check_trophy_status():
    select_max_trophy = f'SELECT max_trophy FROM game WHERE game.id = 1;'
    cursor = connection.cursor()
    cursor.execute(select_max_trophy)
    max = cursor.fetchall()

    current_trophy = players[0].trophys
    print(current_trophy)
    if max[0][0] == current_trophy:
        response = {
            'trophy_status': True
        }
    else:
        response = {
            'trophy_status': False
        }
    return response


@app.route("/5airports")
def get_options():
    pelaaja = players[-1]
    vastaus = pelaaja.get_5_locations()
    jsonvast = json.dumps(vastaus)
    status = 200
    return Response(response=jsonvast, status=status, mimetype="application/json")


if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=3000)
