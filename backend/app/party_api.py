import uuid

# Mock Database for Party API
# In a real environment, this would call the municipality's Master Data management system
MOCK_PARTIES = {
    "199001011234": {"party_id": str(uuid.uuid4()), "name": "Anna Jenny Pettersson"},
    "198505054321": {"party_id": str(uuid.uuid4()), "name": "Erik Svensson"},
    "5560001111": {"party_id": str(uuid.uuid4()), "name": "Trollhättan AB"}, # Organisation
    
    # Pre-seeded users in our database
    "199201011234": {"party_id": "mock-party-raffi", "name": "Raffi Medzad Aghlian"},
}

def get_or_create_party_id(personnummer: str) -> str:
    """
    Mock service to translate a personnummer into a partyId.
    If the personnummer doesn't exist, it simulates the registration
    by generating a new consistent UUID based on the PN.
    """
    if personnummer in MOCK_PARTIES:
        return MOCK_PARTIES[personnummer]["party_id"]
    
    # Generate a consistent UUID for unknown users just for the prototype
    # In a real scenario, this would be registered in the Master Data system
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, personnummer))
