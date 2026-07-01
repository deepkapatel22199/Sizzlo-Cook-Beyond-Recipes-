from pydantic import BaseModel, EmailStr
from typing import List, Optional


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None

class RecipeCreate(BaseModel):
    title: str
    description: Optional[str] = None
    image: Optional[str] = None
    photos: Optional[List[str]] = None
    category: Optional[str] = None
    cook_time: Optional[str] = None
    difficulty: Optional[str] = None
    servings: Optional[str] = None
    diet: Optional[str] = None
    ingredients: List[str]
    steps: List[str]

class RecipeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    photos: Optional[List[str]] = None
    category: Optional[str] = None
    cook_time: Optional[str] = None
    difficulty: Optional[str] = None
    servings: Optional[str] = None
    diet: Optional[str] = None
    ingredients: Optional[List[str]] = None
    steps: Optional[List[str]] = None

class CommentCreate(BaseModel):
    text: str

class ChatCreate(BaseModel):
    user_id: int

class MessageCreate(BaseModel):
    text: str
