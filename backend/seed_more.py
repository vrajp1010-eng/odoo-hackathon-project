import sqlite3
import random

conn = sqlite3.connect('globetrotter.db')
c = conn.cursor()

cities = [
    # Europe
    ("London", "United Kingdom", 92, 98),
    ("Barcelona", "Spain", 75, 95),
    ("Vienna", "Austria", 80, 85),
    ("Lisbon", "Portugal", 65, 88),
    ("Copenhagen", "Denmark", 90, 80),
    ("Zurich", "Switzerland", 100, 75),
    ("Budapest", "Hungary", 55, 82),
    ("Athens", "Greece", 60, 85),
    
    # Asia
    ("Tokyo", "Japan", 88, 99),
    ("Bangkok", "Thailand", 40, 95),
    ("Singapore", "Singapore", 95, 90),
    ("Dubai", "United Arab Emirates", 90, 92),
    ("Bali", "Indonesia", 45, 96),
    ("Seoul", "South Korea", 82, 88),
    ("Kyoto", "Japan", 85, 94),
    ("Hong Kong", "China", 95, 85),
    
    # Americas
    ("New York", "United States", 100, 99),
    ("Los Angeles", "United States", 95, 95),
    ("Mexico City", "Mexico", 45, 88),
    ("Rio de Janeiro", "Brazil", 55, 85),
    ("Toronto", "Canada", 85, 80),
    ("Buenos Aires", "Argentina", 40, 82),
    
    # Oceania/Africa
    ("Sydney", "Australia", 90, 90),
    ("Melbourne", "Australia", 88, 85),
    ("Cape Town", "South Africa", 55, 85),
    ("Marrakech", "Morocco", 45, 80),
]

for name, country, cost_index, popularity in cities:
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
        
        # Add activities based on cost
        acts = [
            ("City Tour", "sightseeing", int(cost_index * 0.8), 3.0),
            ("Museum Visit", "sightseeing", int(cost_index * 0.5), 2.5),
            ("Local Food Tasting", "food", int(cost_index * 0.6), 2.0),
            ("Outdoor Adventure", "adventure", int(cost_index * 1.2), 4.0),
            ("Fine Dining", "food", int(cost_index * 1.5), 2.5)
        ]
        
        for act_name, category, cost, duration in acts:
            c.execute("""
                INSERT INTO activities (city_id, name, description, category, cost, duration_hours)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (city_id, f"{name} {act_name}", f"Enjoy a wonderful {act_name.lower()} in {name}.", category, cost, duration))

conn.commit()
conn.close()
print(f"Added {len(cities)} cities and activities.")
