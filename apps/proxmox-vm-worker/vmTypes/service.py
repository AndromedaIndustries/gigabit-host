from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from uuid import UUID
from ulid import ULID
import json


def generate_ulid() -> str:
    # For illustration purposes, we use uuid4. Replace with a ULID generator if needed.
    return ULID().str


class Metadata(BaseModel):
    initial_sku: str
    initial_price: int


class Service(BaseModel):
    id: str = Field(default_factory=generate_ulid)
    user_id: UUID
    service_type: str
    hostname: str
    template_id: str
    os_name: str
    os_version: str
    public_key_id: str
    username: str
    metadata: Metadata
    sku_id: str
    current_sku_id: str
    initial_sku_id: str
    subscription_active: bool = False
    subscription_id: Optional[str] = None
    initial_checkout_id: Optional[str] = None
    status: str
    status_reason: Optional[str] = None
    payment_ids: List[str]
    payment_status: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    deleted_at: Optional[datetime] = None
    accountId: Optional[str] = Field(None)
    proxmox_node: Optional[str] = None
    proxmox_vm_id: Optional[str] = None

    @field_validator("metadata", mode="before")
    def parse_metadata(cls, value):
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
            except Exception as e:
                raise ValueError("Invalid JSON for metadata") from e
            # Handle double-encoded JSON strings
            if isinstance(parsed, str):
                try:
                    parsed = json.loads(parsed)
                except Exception as e:
                    raise ValueError("Invalid nested JSON for metadata") from e
            if isinstance(parsed, dict):
                return Metadata(**parsed)
            else:
                raise ValueError("metadata JSON must be a mapping")
        if isinstance(value, dict):
            return Metadata(**value)
        return value

    model_config = {
        "json_encoders": {
            ULID: lambda v: str(v),
            datetime: lambda dt: dt.isoformat(),
        }
    }
