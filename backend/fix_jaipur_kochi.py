import sqlite3
conn = sqlite3.connect('globetrotter.db')
c = conn.cursor()
c.execute("UPDATE cities SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/500px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg' WHERE name = 'Jaipur'")
c.execute("UPDATE cities SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Kochi_Skyline.jpg/500px-Kochi_Skyline.jpg' WHERE name = 'Kochi'")
conn.commit()
conn.close()
print('Images updated successfully!')
