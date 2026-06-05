import bcrypt
def hash_password(password: str) -> bytes:
    salt = bcrypt.gensalt()
    pwd_bytes: bytes = password.encode()
    return bcrypt.hashpw(password=pwd_bytes, salt=salt)

# hashed = hash_password("9876543211")
# hashed = hash_password("9998887766")
hashed = hash_password("12345678")
print(hashed) # байтовая строка, например b'$2b$12$...'
hex_str = "\\\\x" + hashed.hex()
print(hex_str)
