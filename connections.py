import mysql.connector

connection = mysql.connector.connect(
    host='localhost',
    port= 3306,
    database= 'demo_game',
    user= 'riikkoo',
    password= '2001Riikka',
    autocommit=True
    )

apikey = "+"


