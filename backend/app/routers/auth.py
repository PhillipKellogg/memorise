from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login():
    # TODO: implement JWT auth
    return {"detail": "Auth not yet implemented"}


@router.post("/register")
def register():
    # TODO: implement user registration
    return {"detail": "Registration not yet implemented"}


@router.post("/logout")
def logout():
    # TODO: invalidate token / clear cookie
    return {"detail": "Logout not yet implemented"}
