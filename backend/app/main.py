import os
import shutil
import uuid
from fastapi import FastAPI, Depends, Header, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from jose import jwt
from sqlalchemy import text
from sqlalchemy.orm import Session
from .database import engine, SessionLocal
from .models import Base, User, Recipe, Ingredient, Step
from .schemas import UserCreate, UserLogin, RecipeCreate, UserProfileUpdate
from .auth import SECRET_KEY, ALGORITHM, hash_password, verify_password, create_access_token

Base.metadata.create_all(bind=engine)

app = FastAPI()

UPLOAD_DIR = "uploads/avatars"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]


def ensure_profile_columns():
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100)"))


ensure_profile_columns()


@app.get("/")
def root():
    return {"message": "Sizzlo Backend Running"}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.replace("Bearer ", "")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


def serialize_recipe_summary(recipe: Recipe):
    return {
        "id": recipe.id,
        "title": recipe.title,
        "image": recipe.image,
        "diet": recipe.diet,
        "cook_time": recipe.cook_time,
        "difficulty": recipe.difficulty,
    }


def serialize_user_profile(user: User, recipes):
    username = user.username or user.email.split("@")[0]

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "username": username,
        "bio": user.bio or "Recipe creator on Sizzlo",
        "avatar_url": user.avatar_url,
        "avatar": user.avatar_url,
        "recipes_count": len(recipes),
        "saved_count": 0,
        "recipes": [serialize_recipe_summary(recipe) for recipe in recipes],
    }


def get_user_recipes(db: Session, user_id: int):
    return (
        db.query(Recipe)
        .filter(Recipe.user_id == user_id)
        .order_by(Recipe.created_at.desc())
        .all()
    )


def save_avatar_file_locally(file: UploadFile, user_id: int):
    # Keep avatar storage isolated so this function can later be replaced with S3 upload.
    file_extension = file.filename.split(".")[-1].lower()
    filename = f"user_{user_id}_{uuid.uuid4().hex}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return f"/uploads/avatars/{filename}"


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
        username=user.email.split("@")[0],
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
    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        return {"error": "Invalid email or password"}

    if not verify_password(
        user.password,
        db_user.password_hash
    ):
        return {"error": "Invalid email or password"}

    token = create_access_token({
        "sub": db_user.email,
        "user_id": db_user.id
    })

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user_id": db_user.id,
        "name": db_user.name,
        "avatar_url": db_user.avatar_url
    }


@app.get("/users/me/profile")
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recipes = get_user_recipes(db, current_user.id)
    return serialize_user_profile(current_user, recipes)


@app.put("/users/me/profile")
def update_my_profile(
    profile: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if profile.name is not None:
        current_user.name = profile.name

    if profile.username is not None:
        current_user.username = profile.username

    if profile.bio is not None:
        current_user.bio = profile.bio

    db.commit()
    db.refresh(current_user)

    recipes = get_user_recipes(db, current_user.id)
    return serialize_user_profile(current_user, recipes)


@app.post("/recipes")
def create_recipe(
    recipe: RecipeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_recipe = Recipe(
        user_id=current_user.id,
        title=recipe.title,
        description=recipe.description,
        image=recipe.image,
        cook_time=recipe.cook_time,
        difficulty=recipe.difficulty,
        servings=recipe.servings,
        diet=recipe.diet,
    )

    db.add(new_recipe)
    db.commit()
    db.refresh(new_recipe)

    for item in recipe.ingredients:
        db.add(
            Ingredient(
                recipe_id=new_recipe.id,
                name=item
            )
        )

    for index, step in enumerate(recipe.steps):
        db.add(
            Step(
                recipe_id=new_recipe.id,
                step_number=index + 1,
                instruction=step
            )
        )

    db.commit()

    return {
        "message": "Recipe created successfully",
        "recipe_id": new_recipe.id
    }


@app.get("/recipes")
def get_recipes(db: Session = Depends(get_db)):
    recipes = db.query(Recipe).order_by(Recipe.created_at.desc()).all()

    return [
        {
            "id": recipe.id,
            "title": recipe.title,
            "description": recipe.description,
            "image": recipe.image,
            "cook_time": recipe.cook_time,
            "difficulty": recipe.difficulty,
            "servings": recipe.servings,
            "diet": recipe.diet,
            "creator": recipe.creator.name,
            "creator_id": recipe.creator.id,
            "creator_avatar_url": recipe.creator.avatar_url,
        }
        for recipe in recipes
    ]


@app.get("/recipes/{recipe_id}")
def get_recipe_detail(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()

    if not recipe:
        return {"error": "Recipe not found"}

    ingredients = db.query(Ingredient).filter(
        Ingredient.recipe_id == recipe.id
    ).all()

    steps = db.query(Step).filter(
        Step.recipe_id == recipe.id
    ).order_by(Step.step_number).all()

    return {
        "id": recipe.id,
        "title": recipe.title,
        "description": recipe.description,
        "image": recipe.image,
        "cook_time": recipe.cook_time,
        "difficulty": recipe.difficulty,
        "servings": recipe.servings,
        "diet": recipe.diet,
        "creator": recipe.creator.name,
        "creator_id": recipe.creator.id,
        "creator_avatar_url": recipe.creator.avatar_url,
        "ingredients": [item.name for item in ingredients],
        "steps": [step.instruction for step in steps],
    }


@app.get("/users/{user_id}/profile")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return {"error": "User not found"}

    recipes = get_user_recipes(db, user.id)
    return serialize_user_profile(user, recipes)


@app.post("/users/me/avatar")
def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, or WEBP images are allowed"
        )

    avatar_url = save_avatar_file_locally(file, current_user.id)

    current_user.avatar_url = avatar_url
    db.commit()
    db.refresh(current_user)

    return {
        "message": "Avatar uploaded successfully",
        "avatar_url": avatar_url
    }
