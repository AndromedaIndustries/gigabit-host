import os
from supabase import create_client, Client
import psycopg2


def get_supabase_client() -> Client:
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    supabase: Client = create_client(url, key)
    return supabase


def get_database_connection() -> psycopg2._psycopg.connection:
    # Fetch variables
    USER = os.getenv("user")
    PASSWORD = os.getenv("password")
    HOST = os.getenv("host")
    PORT = os.getenv("port")
    DBNAME = os.getenv("dbname")

    # Connect to the database
    try:
        connection = psycopg2.connect(
            user=USER, password=PASSWORD, host=HOST, port=PORT, dbname=DBNAME
        )
        if os.environ.get("DEBUG") == "true":
            print("Connection successful!")

        return connection

    except Exception as e:
        print(f"Failed to connect: {e}")
