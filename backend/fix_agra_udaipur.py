import sqlite3
conn = sqlite3.connect('globetrotter.db')
c = conn.cursor()
c.execute("UPDATE cities SET image_url = '/images/agra.png' WHERE name = 'Agra'")
c.execute("UPDATE cities SET image_url = '/images/udaipur.png' WHERE name = 'Udaipur'")
conn.commit()
conn.close()
print('Agra and Udaipur images updated successfully!')
