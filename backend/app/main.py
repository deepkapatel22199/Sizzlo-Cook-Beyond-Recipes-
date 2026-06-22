from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from .database import engine, SessionLocal
from .models import Base, User
from .schemas import UserCreate, UserLogin
from .auth import hash_password, verify_password, create_access_token

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Sizzlo Backend Running 🚀"}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        return {"error": "Email already exists"}

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "user_id": new_user.id
    }


@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        return {"error": "Invalid email or password"}

    if not verify_password(user.password, db_user.password_hash):
        return {"error": "Invalid email or password"}

    token = create_access_token({"sub": db_user.email})

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer"
    }