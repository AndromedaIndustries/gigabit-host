from __future__ import annotations

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SshKey(BaseModel):
    id: str
    user_id: str
    name: str
    public_key: str
    avaliable: bool
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]
