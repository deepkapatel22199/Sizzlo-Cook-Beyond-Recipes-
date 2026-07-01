import os
import shutil
import uuid
from fastapi import FastAPI, Depends, Header, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from jose import jwt
from sqlalchemy import func, or_, text
from sqlalchemy.orm import Session
from .database import engine, SessionLocal
from .models import (
    Base,
    User,
    Recipe,
    RecipePhoto,
    Ingredient,
    Step,
    RecipeLike,
    SavedRecipe,
    UserFollow,
    RecipeComment,
    Chat,
    Message,
)
from .schemas import (
    UserCreate,
    UserLogin,
    RecipeCreate,
    RecipeUpdate,
    UserProfileUpdate,
    CommentCreate,
    ChatCreate,
    MessageCreate,
)
from .auth import SECRET_KEY, ALGORITHM, hash_password, verify_password, create_access_token

Base.metadata.create_all(bind=engine)

app = FastAPI()

AVATAR_UPLOAD_DIR = "uploads/avatars"
RECIPE_UPLOAD_DIR = "uploads/recipes"
os.makedirs(AVATAR_UPLOAD_DIR, exist_ok=True)
os.makedirs(RECIPE_UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

DEFAULT_RECIPE_CATEGORIES = [
    "Vegetarian",
    "Lunch",
    "Dinner",
    "Breakfast",
    "Italian",
    "Salads",
    "Soups",
    "Chicken",
    "Pasta",
    "Desserts",
    "Drinks",
    "Healthy",
    "Quick Meals",
    "Indian",
    "Mexican",
    "Asian",
]


def ensure_profile_columns():
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100)"))
        connection.execute(text("ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP"))
        connection.execute(text("ALTER TABLE recipes ADD COLUMN IF NOT EXISTS category VARCHAR(100)"))


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


def get_optional_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if not authorization:
        return None

    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")

        if not user_id:
            return None

        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None


def serialize_creator(user: User):
    return {
        "id": user.id,
        "name": user.name,
        "avatar_url": user.avatar_url,
    }


def get_recipe_social_state(recipe_id: int, db: Session, current_user: User | None = None):
    likes_count = db.query(RecipeLike).filter(RecipeLike.recipe_id == recipe_id).count()
    comments_count = db.query(RecipeComment).filter(RecipeComment.recipe_id == recipe_id).count()

    is_liked = False
    is_saved = False

    if current_user:
        is_liked = db.query(RecipeLike).filter(
            RecipeLike.recipe_id == recipe_id,
            RecipeLike.user_id == current_user.id,
        ).first() is not None
        is_saved = db.query(SavedRecipe).filter(
            SavedRecipe.recipe_id == recipe_id,
            SavedRecipe.user_id == current_user.id,
        ).first() is not None

    return {
        "likes_count": likes_count,
        "comments_count": comments_count,
        "is_liked": is_liked,
        "is_saved": is_saved,
    }


def normalize_recipe_category(category: str | None, diet: str | None = None):
    for value in (category, diet, "Other"):
        if value and value.strip():
            return value.strip()

    return "Other"


def get_recipe_category(recipe: Recipe):
    return normalize_recipe_category(recipe.category, recipe.diet)


def get_recipe_photos(recipe_id: int, db: Session):
    photos = (
        db.query(RecipePhoto)
        .filter(RecipePhoto.recipe_id == recipe_id)
        .order_by(RecipePhoto.sort_order.asc(), RecipePhoto.created_at.asc())
        .all()
    )

    return [photo.image_url for photo in photos if photo.image_url]


def normalize_category_text(value: str | None):
    return value.strip() if value and value.strip() else None


def serialize_recipe_summary(recipe: Recipe, db: Session, current_user: User | None = None):
    social_state = get_recipe_social_state(recipe.id, db, current_user)

    return {
        "id": recipe.id,
        "title": recipe.title,
        "image": get_recipe_cover_image(recipe),
        "category": get_recipe_category(recipe),
        "diet": recipe.diet,
        "photos": get_recipe_photos(recipe.id, db),
        "cook_time": recipe.cook_time,
        "difficulty": recipe.difficulty,
        "created_at": recipe.created_at,
        "creator": serialize_creator(recipe.creator),
        "creator_id": recipe.creator.id,
        "creator_name": recipe.creator.name,
        "creator_avatar_url": recipe.creator.avatar_url,
        **social_state,
    }


def serialize_recipe_feed_item(recipe: Recipe, db: Session, current_user: User | None = None):
    return {
        "id": recipe.id,
        "title": recipe.title,
        "description": recipe.description,
        "image": get_recipe_cover_image(recipe),
        "photos": get_recipe_photos(recipe.id, db),
        "category": get_recipe_category(recipe),
        "cook_time": recipe.cook_time,
        "difficulty": recipe.difficulty,
        "servings": recipe.servings,
        "diet": recipe.diet,
        "created_at": recipe.created_at,
        "creator": serialize_creator(recipe.creator),
        "creator_name": recipe.creator.name,
        "creator_id": recipe.creator.id,
        "creator_avatar_url": recipe.creator.avatar_url,
        **get_recipe_social_state(recipe.id, db, current_user),
    }


def get_recipe_cover_image(recipe: Recipe):
    image = recipe.image.strip() if recipe.image else None

    if not image or image.startswith("file:") or image.startswith("content:"):
        return None

    return image


def normalize_recipe_image(image: str | None):
    normalized_image = image.strip() if image else None

    if not normalized_image or normalized_image.startswith("file:") or normalized_image.startswith("content:"):
        return None

    return normalized_image


def serialize_user_profile(user: User, recipes, db: Session, current_user: User | None = None):
    username = user.username or user.email.split("@")[0]
    recipe_ids = [recipe.id for recipe in recipes]
    followers_count = db.query(UserFollow).filter(UserFollow.following_id == user.id).count()
    following_count = db.query(UserFollow).filter(UserFollow.follower_id == user.id).count()
    saved_count = db.query(SavedRecipe).filter(SavedRecipe.user_id == user.id).count()
    likes_count = (
        db.query(RecipeLike)
        .filter(RecipeLike.recipe_id.in_(recipe_ids))
        .count()
        if recipe_ids
        else 0
    )
    is_following = False

    if current_user and current_user.id != user.id:
        is_following = db.query(UserFollow).filter(
            UserFollow.follower_id == current_user.id,
            UserFollow.following_id == user.id,
        ).first() is not None

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "username": username,
        "bio": user.bio or "Recipe creator on Sizzlo",
        "avatar_url": user.avatar_url,
        "avatar": user.avatar_url,
        "recipes_count": len(recipes),
        "saved_count": saved_count,
        "followers_count": followers_count,
        "following_count": following_count,
        "likes_count": likes_count,
        "is_following": is_following,
        "recipes": [serialize_recipe_summary(recipe, db, current_user) for recipe in recipes],
    }


def serialize_recipe_detail(recipe: Recipe, db: Session, current_user: User | None = None):
    ingredients = db.query(Ingredient).filter(
        Ingredient.recipe_id == recipe.id
    ).all()

    steps = db.query(Step).filter(
        Step.recipe_id == recipe.id
    ).order_by(Step.step_number).all()

    social_state = get_recipe_social_state(recipe.id, db, current_user)

    return {
        "id": recipe.id,
        "title": recipe.title,
        "description": recipe.description,
        "image": get_recipe_cover_image(recipe),
        "photos": get_recipe_photos(recipe.id, db),
        "category": get_recipe_category(recipe),
        "cook_time": recipe.cook_time,
        "difficulty": recipe.difficulty,
        "servings": recipe.servings,
        "diet": recipe.diet,
        "created_at": recipe.created_at,
        "creator": serialize_creator(recipe.creator),
        "creator_name": recipe.creator.name,
        "creator_id": recipe.creator.id,
        "creator_avatar_url": recipe.creator.avatar_url,
        "ingredients": [item.name for item in ingredients],
        "steps": [step.instruction for step in steps],
        "is_owner": bool(current_user and recipe.user_id == current_user.id),
        **social_state,
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
    file_path = os.path.join(AVATAR_UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return f"/uploads/avatars/{filename}"


def save_recipe_image_file_locally(file: UploadFile, user_id: int):
    # Keep recipe image storage isolated so this can later be replaced with cloud storage.
    extension_by_type = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
    }
    fallback_extension = extension_by_type.get(file.content_type, "jpg")
    file_extension = (
        file.filename.split(".")[-1].lower()
        if file.filename and "." in file.filename
        else fallback_extension
    )
    filename = f"recipe_{user_id}_{uuid.uuid4().hex}.{file_extension}"
    file_path = os.path.join(RECIPE_UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return f"/uploads/recipes/{filename}"


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
    return serialize_user_profile(current_user, recipes, db, current_user)


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
    return serialize_user_profile(current_user, recipes, db, current_user)


@app.post("/recipes")
def create_recipe(
    recipe: RecipeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    normalized_category = normalize_recipe_category(recipe.category, recipe.diet)
    cover_image = normalize_recipe_image(recipe.image)

    new_recipe = Recipe(
        user_id=current_user.id,
        title=recipe.title,
        description=recipe.description,
        image=cover_image,
        category=normalized_category,
        cook_time=recipe.cook_time,
        difficulty=recipe.difficulty,
        servings=recipe.servings,
        diet=normalized_category,
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

    for index, photo_url in enumerate(recipe.photos or []):
        normalized_photo = normalize_recipe_image(photo_url)
        if not normalized_photo:
            continue

        db.add(
            RecipePhoto(
                recipe_id=new_recipe.id,
                image_url=normalized_photo,
                sort_order=index,
            )
        )

    db.commit()

    return {
        "message": "Recipe created successfully",
        "recipe_id": new_recipe.id,
        "image": get_recipe_cover_image(new_recipe),
        "photos": get_recipe_photos(new_recipe.id, db),
    }


@app.put("/recipes/{recipe_id}")
def update_recipe(
    recipe_id: int,
    recipe_update: RecipeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    if recipe.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to edit this recipe."
        )

    update_data = recipe_update.model_dump(exclude_unset=True)

    for field in ["title", "description", "cook_time", "difficulty", "servings"]:
        if field in update_data:
            setattr(recipe, field, update_data[field])

    if "category" in update_data or "diet" in update_data:
        normalized_category = normalize_recipe_category(
            update_data.get("category"),
            update_data.get("diet"),
        )
        recipe.category = normalized_category
        recipe.diet = normalized_category

    if "image" in update_data:
        recipe.image = normalize_recipe_image(update_data["image"])

    if "photos" in update_data and update_data["photos"] is not None:
        db.query(RecipePhoto).filter(RecipePhoto.recipe_id == recipe.id).delete()
        for index, photo_url in enumerate(update_data["photos"]):
            normalized_photo = normalize_recipe_image(photo_url)
            if not normalized_photo:
                continue

            db.add(
                RecipePhoto(
                    recipe_id=recipe.id,
                    image_url=normalized_photo,
                    sort_order=index,
                )
            )

    if "ingredients" in update_data and update_data["ingredients"] is not None:
        db.query(Ingredient).filter(Ingredient.recipe_id == recipe.id).delete()

        for item in update_data["ingredients"]:
            db.add(Ingredient(recipe_id=recipe.id, name=item))

    if "steps" in update_data and update_data["steps"] is not None:
        db.query(Step).filter(Step.recipe_id == recipe.id).delete()

        for index, step in enumerate(update_data["steps"]):
            db.add(
                Step(
                    recipe_id=recipe.id,
                    step_number=index + 1,
                    instruction=step
                )
            )

    db.commit()
    db.refresh(recipe)

    return serialize_recipe_detail(recipe, db, current_user)


@app.delete("/recipes/{recipe_id}")
def delete_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    if recipe.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to delete this recipe."
        )

    db.query(RecipeLike).filter(RecipeLike.recipe_id == recipe.id).delete()
    db.query(SavedRecipe).filter(SavedRecipe.recipe_id == recipe.id).delete()
    db.query(RecipeComment).filter(RecipeComment.recipe_id == recipe.id).delete()
    db.query(RecipePhoto).filter(RecipePhoto.recipe_id == recipe.id).delete()
    db.query(Ingredient).filter(Ingredient.recipe_id == recipe.id).delete()
    db.query(Step).filter(Step.recipe_id == recipe.id).delete()
    db.delete(recipe)
    db.commit()

    return {"message": "Recipe deleted successfully"}


@app.post("/recipes/image")
def upload_recipe_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, or WEBP images are allowed"
        )

    image_url = save_recipe_image_file_locally(file, current_user.id)

    return {
        "message": "Recipe image uploaded successfully",
        "image_url": image_url
    }


@app.put("/recipes/{recipe_id}/image")
def update_recipe_image(
    recipe_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    if recipe.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own recipes")

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, or WEBP images are allowed"
        )

    image_url = save_recipe_image_file_locally(file, current_user.id)
    recipe.image = image_url
    db.commit()
    db.refresh(recipe)

    return {
        "message": "Recipe image updated successfully",
        "image_url": image_url
    }


@app.post("/recipes/{recipe_id}/like")
def like_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    existing_like = db.query(RecipeLike).filter(
        RecipeLike.recipe_id == recipe_id,
        RecipeLike.user_id == current_user.id,
    ).first()

    if not existing_like:
        db.add(RecipeLike(recipe_id=recipe_id, user_id=current_user.id))
        db.commit()

    return get_recipe_social_state(recipe_id, db, current_user)


@app.delete("/recipes/{recipe_id}/like")
def unlike_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(RecipeLike).filter(
        RecipeLike.recipe_id == recipe_id,
        RecipeLike.user_id == current_user.id,
    ).delete()
    db.commit()

    return get_recipe_social_state(recipe_id, db, current_user)


@app.post("/recipes/{recipe_id}/save")
def save_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    existing_save = db.query(SavedRecipe).filter(
        SavedRecipe.recipe_id == recipe_id,
        SavedRecipe.user_id == current_user.id,
    ).first()

    if not existing_save:
        db.add(SavedRecipe(recipe_id=recipe_id, user_id=current_user.id))
        db.commit()

    return get_recipe_social_state(recipe_id, db, current_user)


@app.delete("/recipes/{recipe_id}/save")
def unsave_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(SavedRecipe).filter(
        SavedRecipe.recipe_id == recipe_id,
        SavedRecipe.user_id == current_user.id,
    ).delete()
    db.commit()

    return get_recipe_social_state(recipe_id, db, current_user)


@app.get("/users/me/saved-recipes")
def get_my_saved_recipes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    saved_items = (
        db.query(SavedRecipe)
        .filter(SavedRecipe.user_id == current_user.id)
        .order_by(SavedRecipe.created_at.desc())
        .all()
    )
    recipe_ids = [item.recipe_id for item in saved_items]

    if not recipe_ids:
        return []

    recipes_by_id = {
        recipe.id: recipe
        for recipe in db.query(Recipe).filter(Recipe.id.in_(recipe_ids)).all()
    }

    return [
        serialize_recipe_summary(recipes_by_id[recipe_id], db, current_user)
        for recipe_id in recipe_ids
        if recipe_id in recipes_by_id
    ]


@app.post("/users/{user_id}/follow")
def follow_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot follow yourself")

    user_to_follow = db.query(User).filter(User.id == user_id).first()

    if not user_to_follow:
        raise HTTPException(status_code=404, detail="User not found")

    existing_follow = db.query(UserFollow).filter(
        UserFollow.follower_id == current_user.id,
        UserFollow.following_id == user_id,
    ).first()

    if not existing_follow:
        db.add(UserFollow(follower_id=current_user.id, following_id=user_id))
        db.commit()

    return {
        "followers_count": db.query(UserFollow).filter(UserFollow.following_id == user_id).count(),
        "following_count": db.query(UserFollow).filter(UserFollow.follower_id == user_id).count(),
        "is_following": True,
    }


@app.delete("/users/{user_id}/follow")
def unfollow_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(UserFollow).filter(
        UserFollow.follower_id == current_user.id,
        UserFollow.following_id == user_id,
    ).delete()
    db.commit()

    return {
        "followers_count": db.query(UserFollow).filter(UserFollow.following_id == user_id).count(),
        "following_count": db.query(UserFollow).filter(UserFollow.follower_id == user_id).count(),
        "is_following": False,
    }


def serialize_comment(comment: RecipeComment):
    return {
        "id": comment.id,
        "text": comment.text,
        "created_at": comment.created_at,
        "user_id": comment.user_id,
        "user": serialize_creator(comment.user),
    }


@app.get("/recipes/{recipe_id}/comments")
def get_recipe_comments(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    comments = (
        db.query(RecipeComment)
        .filter(RecipeComment.recipe_id == recipe_id)
        .order_by(RecipeComment.created_at.asc())
        .all()
    )

    return [serialize_comment(comment) for comment in comments]


@app.post("/recipes/{recipe_id}/comments")
def add_recipe_comment(
    recipe_id: int,
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    text_value = comment.text.strip()

    if not text_value:
        raise HTTPException(status_code=400, detail="Comment cannot be empty")

    new_comment = RecipeComment(
        recipe_id=recipe_id,
        user_id=current_user.id,
        text=text_value,
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return serialize_comment(new_comment)


@app.delete("/comments/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = db.query(RecipeComment).filter(RecipeComment.id == comment_id).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own comments")

    db.delete(comment)
    db.commit()

    return {"message": "Comment deleted successfully"}


def serialize_chat(chat: Chat, current_user: User, db: Session):
    other_user_id = chat.user2_id if chat.user1_id == current_user.id else chat.user1_id
    other_user = db.query(User).filter(User.id == other_user_id).first()
    last_message = (
        db.query(Message)
        .filter(Message.chat_id == chat.id)
        .order_by(Message.created_at.desc())
        .first()
    )
    unread_count = (
        db.query(Message)
        .filter(
            Message.chat_id == chat.id,
            Message.sender_id != current_user.id,
            Message.read_at.is_(None),
        )
        .count()
    )

    return {
        "id": chat.id,
        "created_at": chat.created_at,
        "other_user": serialize_creator(other_user) if other_user else None,
        "last_message": last_message.text if last_message else None,
        "unread_count": unread_count,
    }


@app.get("/chats")
def get_chats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chats = (
        db.query(Chat)
        .filter(or_(Chat.user1_id == current_user.id, Chat.user2_id == current_user.id))
        .order_by(Chat.created_at.desc())
        .all()
    )

    return [serialize_chat(chat, current_user, db) for chat in chats]


@app.post("/chats")
def create_chat(
    chat_create: ChatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if chat_create.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot chat with yourself")

    other_user = db.query(User).filter(User.id == chat_create.user_id).first()

    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")

    user1_id, user2_id = sorted([current_user.id, other_user.id])
    chat = db.query(Chat).filter(
        Chat.user1_id == user1_id,
        Chat.user2_id == user2_id,
    ).first()

    if not chat:
        chat = Chat(user1_id=user1_id, user2_id=user2_id)
        db.add(chat)
        db.commit()
        db.refresh(chat)

    return serialize_chat(chat, current_user, db)


def get_owned_chat(chat_id: int, current_user: User, db: Session):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    if current_user.id not in [chat.user1_id, chat.user2_id]:
        raise HTTPException(status_code=403, detail="You are not allowed to view this chat")

    return chat


def serialize_message(message: Message):
    return {
        "id": message.id,
        "chat_id": message.chat_id,
        "sender_id": message.sender_id,
        "text": message.text,
        "read_at": message.read_at,
        "created_at": message.created_at,
        "sender": serialize_creator(message.sender),
    }


@app.get("/chats/{chat_id}/messages")
def get_chat_messages(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_owned_chat(chat_id, current_user, db)
    db.query(Message).filter(
        Message.chat_id == chat_id,
        Message.sender_id != current_user.id,
        Message.read_at.is_(None),
    ).update({"read_at": text("CURRENT_TIMESTAMP")}, synchronize_session=False)
    db.commit()

    messages = (
        db.query(Message)
        .filter(Message.chat_id == chat_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    return [serialize_message(message) for message in messages]


@app.post("/chats/{chat_id}/messages")
def send_chat_message(
    chat_id: int,
    message_create: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_owned_chat(chat_id, current_user, db)
    text_value = message_create.text.strip()

    if not text_value:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    message = Message(
        chat_id=chat_id,
        sender_id=current_user.id,
        text=text_value,
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    return serialize_message(message)


@app.get("/recipes")
def get_recipes(
    category: str | None = None,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    recipes_query = db.query(Recipe)

    if category:
        normalized_category = normalize_category_text(category)
        if normalized_category:
            normalized_category_expr = func.lower(
                func.coalesce(
                    func.nullif(func.trim(Recipe.category), ""),
                    func.nullif(func.trim(Recipe.diet), ""),
                    "Other",
                )
            )
            recipes_query = recipes_query.filter(
                normalized_category_expr == normalized_category.lower()
            )

    recipes = recipes_query.order_by(Recipe.created_at.desc()).all()

    return [
        serialize_recipe_feed_item(recipe, db, current_user)
        for recipe in recipes
    ]


@app.get("/recipes/latest")
def get_latest_recipes(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    safe_limit = max(1, min(limit, 50))
    recipes = db.query(Recipe).order_by(Recipe.created_at.desc()).limit(safe_limit).all()

    return [
        serialize_recipe_feed_item(recipe, db, current_user)
        for recipe in recipes
    ]


@app.get("/recipes/categories")
def get_recipe_categories(db: Session = Depends(get_db)):
    recipes = db.query(Recipe.category, Recipe.diet).all()
    categories_by_key: dict[str, str] = {}

    for category, diet in recipes:
        value = normalize_recipe_category(category, diet)
        if not value or value == "Other":
            continue

        key = value.strip().lower()
        if key not in categories_by_key:
            categories_by_key[key] = value.strip()

    categories = sorted(categories_by_key.values(), key=lambda item: item.lower())

    if not categories:
        categories = DEFAULT_RECIPE_CATEGORIES

    return {"categories": categories}


@app.get("/recipes/recommended")
def get_recommended_recipes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    followed_ids = [
        row.following_id
        for row in db.query(UserFollow.following_id)
        .filter(UserFollow.follower_id == current_user.id)
        .all()
    ]

    followed_recipes = []
    other_recipes = []
    own_recipes = []

    if followed_ids:
        followed_recipes = (
            db.query(Recipe)
            .filter(Recipe.user_id.in_(followed_ids), Recipe.user_id != current_user.id)
            .order_by(Recipe.created_at.desc())
            .all()
        )

        other_recipes = (
            db.query(Recipe)
            .filter(
                Recipe.user_id != current_user.id,
                ~Recipe.user_id.in_(followed_ids),
            )
            .order_by(func.random())
            .all()
        )
    else:
        other_recipes = (
            db.query(Recipe)
            .filter(Recipe.user_id != current_user.id)
            .order_by(func.random())
            .all()
        )

    own_recipes = (
        db.query(Recipe)
        .filter(Recipe.user_id == current_user.id)
        .order_by(func.random())
        .all()
    )

    ordered_recipes = []
    seen_recipe_ids: set[int] = set()

    for recipe in [*followed_recipes, *other_recipes, *own_recipes]:
        if recipe.id in seen_recipe_ids:
            continue
        seen_recipe_ids.add(recipe.id)
        ordered_recipes.append(recipe)

    return [
        serialize_recipe_feed_item(recipe, db, current_user)
        for recipe in ordered_recipes[:12]
    ]


@app.get("/recipes/{recipe_id}")
def get_recipe_detail(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    return serialize_recipe_detail(recipe, db, current_user)


@app.get("/users/{user_id}/profile")
def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return {"error": "User not found"}

    recipes = get_user_recipes(db, user.id)
    return serialize_user_profile(user, recipes, db, current_user)


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
