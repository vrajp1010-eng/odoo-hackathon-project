"""
seed.py — Run once to populate the database with sample data.
Usage:  python seed.py
"""

import sys
import os
import datetime

# Ensure we can import local modules
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine, Base
import models
from routers.auth import hash_password


def seed():
    # Re-create tables (idempotent if already there)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # ── Guard: skip if already seeded ─────────────────────────────────────
        if db.query(models.City).count() > 0:
            print("[OK] Database already seeded -- skipping.")
            return

        # ── Users ─────────────────────────────────────────────────────────────
        users = [
            models.User(name="Alice Walker",  email="alice@example.com",  password_hash=hash_password("Password1!")),
            models.User(name="Bob Chen",       email="bob@example.com",    password_hash=hash_password("Password2!")),
            models.User(name="Carol Okonkwo",  email="carol@example.com",  password_hash=hash_password("Password3!")),
        ]
        db.add_all(users)
        db.flush()
        alice, bob, carol = users

        # ── Cities ────────────────────────────────────────────────────────────
        cities = [
            models.City(
                name="Paris", country="France",
                cost_index=85.0, popularity=98.0,
                image_url="https://upload.wikimedia.org/wikipedia/commons/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques_000222.jpg",
            ),
            models.City(
                name="Amsterdam", country="Netherlands",
                cost_index=78.0, popularity=91.0,
                image_url="https://upload.wikimedia.org/wikipedia/commons/b/be/KeizersgrachtReguliersgrachtAmsterdam.jpg",
            ),
            models.City(
                name="Berlin", country="Germany",
                cost_index=62.0, popularity=87.0,
                image_url="https://upload.wikimedia.org/wikipedia/commons/a/a6/Brandenburger_Tor_abends.jpg",
            ),
            models.City(
                name="Prague", country="Czech Republic",
                cost_index=44.0, popularity=84.0,
                image_url="https://upload.wikimedia.org/wikipedia/commons/a/a7/Prague_%286365119737%29.jpg",
            ),
            models.City(
                name="Rome", country="Italy",
                cost_index=74.0, popularity=95.0,
                image_url="https://upload.wikimedia.org/wikipedia/commons/d/d8/Colosseum_in_Rome-April_2007-1-_copie_2B.jpg",
            ),
        ]
        db.add_all(cities)
        db.flush()
        paris, amsterdam, berlin, prague, rome = cities

        # ── Activities (10 total) ──────────────────────────────────────────────
        activities = [
            # Paris (3)
            models.Activity(
                city_id=paris.id, name="Eiffel Tower Visit",
                category="sightseeing", cost=28.0, duration_hours=2.5,
                description="Skip the line with a summit-level ticket and take in panoramic views of the city of lights.",
                image_url="https://picsum.photos/seed/eiffel/600/400",
            ),
            models.Activity(
                city_id=paris.id, name="Louvre Museum",
                category="sightseeing", cost=22.0, duration_hours=3.0,
                description="Home to the Mona Lisa, Venus de Milo and 35,000 other works spanning 5,000 years.",
                image_url="https://picsum.photos/seed/louvre/600/400",
            ),
            models.Activity(
                city_id=paris.id, name="French Bistro Dinner (Le Marais)",
                category="food", cost=65.0, duration_hours=2.0,
                description="Three-course dinner with wine pairing at a classic Parisian bistro in the historic Marais district.",
                image_url="https://picsum.photos/seed/bistro/600/400",
            ),
            # Amsterdam (2)
            models.Activity(
                city_id=amsterdam.id, name="Anne Frank House",
                category="sightseeing", cost=16.0, duration_hours=1.5,
                description="Tour the hidden annex where Anne Frank and her family hid during WWII.",
                image_url="https://picsum.photos/seed/annefrank/600/400",
            ),
            models.Activity(
                city_id=amsterdam.id, name="Canal Boat Tour",
                category="adventure", cost=20.0, duration_hours=1.5,
                description="See Amsterdam's Golden Age architecture from the water on a narrated 75-minute cruise.",
                image_url="https://picsum.photos/seed/canal/600/400",
            ),
            # Berlin (2)
            models.Activity(
                city_id=berlin.id, name="Berlin Wall & East Side Gallery",
                category="sightseeing", cost=0.0, duration_hours=2.0,
                description="Walk the longest remaining stretch of the Berlin Wall, covered in world-famous murals. Free to visit.",
                image_url="https://picsum.photos/seed/berlinwall/600/400",
            ),
            models.Activity(
                city_id=berlin.id, name="Markthalle Neun Street Food Market",
                category="food", cost=18.0, duration_hours=1.5,
                description="Thursdays-only street food market in Kreuzberg — bratwurst, döner, craft beer and more.",
                image_url="https://picsum.photos/seed/markthalle/600/400",
            ),
            # Prague (2)
            models.Activity(
                city_id=prague.id, name="Prague Castle Complex",
                category="sightseeing", cost=15.0, duration_hours=3.0,
                description="Largest ancient castle complex in the world — includes St. Vitus Cathedral and Golden Lane.",
                image_url="https://picsum.photos/seed/praguecastle/600/400",
            ),
            models.Activity(
                city_id=prague.id, name="Czech Food & Beer Walking Tour",
                category="food", cost=38.0, duration_hours=3.5,
                description="Sample svíčková, trdelník, and world-class Czech pilsners at 4 stops in Old Town.",
                image_url="https://picsum.photos/seed/czechfood/600/400",
            ),
            # Rome (1)
            models.Activity(
                city_id=rome.id, name="Colosseum & Roman Forum",
                category="sightseeing", cost=18.0, duration_hours=3.0,
                description="Guided tour of the iconic amphitheatre and the ruins of the ancient Forum below.",
                image_url="https://picsum.photos/seed/colosseum/600/400",
            ),
        ]
        db.add_all(activities)
        db.flush()

        eiffel, louvre, bistro, anne_frank, canal, bwall, markthalle, pcastle, czech_food, colosseum = activities

        # ── Trip 1 — Alice: Paris → Amsterdam → Berlin ────────────────────────
        trip1 = models.Trip(
            user_id=alice.id,
            name="Western Europe Highlights",
            start_date=datetime.date(2024, 6, 1),
            end_date=datetime.date(2024, 6, 14),
            description="Three iconic capitals in two glorious weeks — art, architecture, and incredible food.",
            cover_photo_url="https://picsum.photos/seed/europe1/1200/600",
            is_public=True,
            share_slug="eu-highlights",
        )
        db.add(trip1)
        db.flush()

        stop1a = models.TripStop(
            trip_id=trip1.id, city_id=paris.id, order_index=0,
            arrival_date=datetime.date(2024, 6, 1),
            departure_date=datetime.date(2024, 6, 5),
        )
        stop1b = models.TripStop(
            trip_id=trip1.id, city_id=amsterdam.id, order_index=1,
            arrival_date=datetime.date(2024, 6, 5),
            departure_date=datetime.date(2024, 6, 9),
        )
        stop1c = models.TripStop(
            trip_id=trip1.id, city_id=berlin.id, order_index=2,
            arrival_date=datetime.date(2024, 6, 9),
            departure_date=datetime.date(2024, 6, 14),
        )
        db.add_all([stop1a, stop1b, stop1c])
        db.flush()

        db.add_all([
            models.TripActivity(trip_stop_id=stop1a.id, activity_id=eiffel.id,
                                scheduled_date=datetime.date(2024, 6, 2), notes="Book summit ticket online"),
            models.TripActivity(trip_stop_id=stop1a.id, activity_id=louvre.id,
                                scheduled_date=datetime.date(2024, 6, 3)),
            models.TripActivity(trip_stop_id=stop1a.id, activity_id=bistro.id,
                                scheduled_date=datetime.date(2024, 6, 4), notes="Reservation at 7pm"),
            models.TripActivity(trip_stop_id=stop1b.id, activity_id=anne_frank.id,
                                scheduled_date=datetime.date(2024, 6, 6)),
            models.TripActivity(trip_stop_id=stop1b.id, activity_id=canal.id,
                                scheduled_date=datetime.date(2024, 6, 7)),
            models.TripActivity(trip_stop_id=stop1c.id, activity_id=bwall.id,
                                scheduled_date=datetime.date(2024, 6, 10)),
        ])

        # ── Trip 2 — Bob: Rome → Prague ───────────────────────────────────────
        trip2 = models.Trip(
            user_id=bob.id,
            name="Southern & Central Gems",
            start_date=datetime.date(2024, 9, 10),
            end_date=datetime.date(2024, 9, 20),
            description="Ancient Rome meets fairy-tale Prague — history, beer, and unforgettable views.",
            cover_photo_url="https://picsum.photos/seed/europe2/1200/600",
            is_public=False,
            share_slug="sc-gems",
        )
        db.add(trip2)
        db.flush()

        stop2a = models.TripStop(
            trip_id=trip2.id, city_id=rome.id, order_index=0,
            arrival_date=datetime.date(2024, 9, 10),
            departure_date=datetime.date(2024, 9, 15),
        )
        stop2b = models.TripStop(
            trip_id=trip2.id, city_id=prague.id, order_index=1,
            arrival_date=datetime.date(2024, 9, 15),
            departure_date=datetime.date(2024, 9, 20),
        )
        db.add_all([stop2a, stop2b])
        db.flush()

        db.add_all([
            models.TripActivity(trip_stop_id=stop2a.id, activity_id=colosseum.id,
                                scheduled_date=datetime.date(2024, 9, 11), notes="Pre-book via official site"),
            models.TripActivity(trip_stop_id=stop2b.id, activity_id=pcastle.id,
                                scheduled_date=datetime.date(2024, 9, 16)),
            models.TripActivity(trip_stop_id=stop2b.id, activity_id=czech_food.id,
                                scheduled_date=datetime.date(2024, 9, 17)),
        ])

        db.commit()
        print("[SEED] Seed complete!")
        print(f"    Users:      {len(users)}")
        print(f"    Cities:     {len(cities)}")
        print(f"    Activities: {len(activities)}")
        print(f"    Trips:      2 (trip IDs: {trip1.id}, {trip2.id})")
        print()
        print("  Login credentials:")
        for i, u in enumerate(users):
            print(f"    {u.email}  /  Password{i+1}!")

    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed()
