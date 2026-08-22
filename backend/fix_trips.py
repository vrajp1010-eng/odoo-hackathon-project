import sqlite3
conn = sqlite3.connect('globetrotter.db')
c = conn.cursor()
c.execute("UPDATE trips SET cover_photo_url = NULL WHERE cover_photo_url LIKE '%wikimedia%'")
conn.commit()
conn.close()
