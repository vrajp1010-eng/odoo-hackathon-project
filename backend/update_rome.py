import sqlite3
conn = sqlite3.connect('globetrotter.db')
c = conn.cursor()
c.execute("UPDATE cities SET image_url='https://picsum.photos/seed/colosseum123/800/500' WHERE name='Rome'")
conn.commit()
print("Updated Rome image")
