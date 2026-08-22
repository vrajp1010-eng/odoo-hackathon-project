import sqlite3

conn = sqlite3.connect('globetrotter.db')
c = conn.cursor()

cities = [
    ("Mumbai", "India", 35, 85, [
        ("Heritage Walk", "sightseeing", 15, 3.0),
        ("Street Food Tour", "food", 10, 2.5),
        ("Bollywood Studio Tour", "adventure", 25, 4.0),
        ("Marine Drive Sunset", "sightseeing", 5, 2.0)
    ]),
    ("Delhi", "India", 30, 80, [
        ("Red Fort Visit", "sightseeing", 12, 3.0),
        ("Old Delhi Food Walk", "food", 8, 2.5),
        ("Qutub Minar Tour", "sightseeing", 10, 2.0),
        ("Dilli Haat Shopping", "adventure", 5, 2.0)
    ]),
    ("Jaipur", "India", 25, 90, [
        ("City Palace & Amber Fort Tour", "sightseeing", 20, 5.0),
        ("Hawa Mahal Visit", "sightseeing", 8, 1.5),
        ("Rajasthani Thali Experience", "food", 12, 2.0),
        ("Hot Air Balloon Ride", "adventure", 80, 2.5)
    ]),
    ("Goa", "India", 40, 95, [
        ("Beach & Water Sports", "adventure", 30, 4.0),
        ("Old Goa Churches Tour", "sightseeing", 15, 3.0),
        ("Seafood Tasting", "food", 25, 2.0),
        ("Dudhsagar Trek", "adventure", 20, 6.0)
    ]),
    ("Udaipur", "India", 30, 85, [
        ("Lake Palace Boat Tour", "sightseeing", 15, 2.0),
        ("City Palace Visit", "sightseeing", 12, 3.0),
        ("Rooftop Dinner", "food", 20, 2.0),
        ("Sajjangarh Fort Sunset", "adventure", 10, 2.5)
    ]),
    ("Kochi", "India", 25, 80, [
        ("Kerala Backwater Houseboat Cruise", "adventure", 50, 6.0),
        ("Fort Kochi Walk", "sightseeing", 5, 2.0),
        ("Kathakali Performance", "sightseeing", 10, 2.0),
        ("Seafood & Spice Tour", "food", 15, 3.0)
    ]),
    ("Agra", "India", 20, 95, [
        ("Taj Mahal Sunrise Tour", "sightseeing", 25, 3.0),
        ("Agra Fort Visit", "sightseeing", 10, 2.5),
        ("Fatehpur Sikri Excursion", "sightseeing", 15, 4.0),
        ("Mughlai Food Tasting", "food", 12, 2.0)
    ]),
    ("Bengaluru", "India", 35, 75, [
        ("Brewery & Pub Crawl", "food", 30, 4.0),
        ("Tech Park Tour", "sightseeing", 10, 2.0),
        ("Nandi Hills Sunrise Drive", "adventure", 15, 5.0),
        ("Mysore Palace Day Trip", "sightseeing", 40, 8.0)
    ])
]

for name, country, cost_index, popularity, acts in cities:
    img_keyword = name.replace(" ", "").lower()
    img_url = f"https://loremflickr.com/400/300/{img_keyword},city,landmark/all"
    
    # Upsert city
    c.execute("SELECT id FROM cities WHERE name=?", (name,))
    row = c.fetchone()
    if not row:
        c.execute("""
            INSERT INTO cities (name, country, cost_index, popularity, image_url)
            VALUES (?, ?, ?, ?, ?)
        """, (name, country, cost_index, popularity, img_url))
        city_id = c.lastrowid
        
        for act_name, category, cost, duration in acts:
            c.execute("""
                INSERT INTO activities (city_id, name, description, category, cost, duration_hours)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (city_id, act_name, f"Enjoy a wonderful {act_name.lower()} in {name}.", category, cost, duration))

conn.commit()
conn.close()
print(f"Added {len(cities)} Indian cities and their custom activities.")
