import sqlite3
conn = sqlite3.connect('globetrotter.db')
c = conn.cursor()
c.execute("UPDATE cities SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg' WHERE name = 'Paris'")
conn.commit()
print(c.execute('SELECT name, cover_photo_url FROM trips').fetchall())
conn.close()
