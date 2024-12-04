import mysql.connector

connection = mysql.connector.connect(
    host='localhost',
    port= 3306,
    database= 'demo_game',
    user= 'user',
    password= 'salasana',
    autocommit=True
    )

apikey = "+"


