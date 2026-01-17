from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

# JWT settings
SECRET_KEY = "supersecretkey123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a plain password."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed one."""
    return pwd_context.verify(plain_password, hashed_password)

def create_token(data: dict) -> str:
    """Create a JWT token from a data dictionary."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)  # <-- no comma

def verify_token(token: str) -> dict:
    """Verify a JWT token and return the payload."""
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload
