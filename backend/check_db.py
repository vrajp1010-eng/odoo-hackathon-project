import sqlite3
conn = sqlite3.connect('globetrotter.db')
c = conn.cursor()
print(c.execute("SELECT name, image_url FROM cities WHERE name IN ('Agra', 'Udaipur')").fetchall())
