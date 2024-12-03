import random

class Game:
    def __init__(self, name, weather=None):

        self.name = name
        self.players = []  # Pelaajien lista
        self.score = {}   # Sanakirja pelaajien pisteille
        self.is_active = False  # Pelin tila (aktiivinen vai ei)
        self.weather = weather or self.random_weather()  # Asettaa satunnainen sää