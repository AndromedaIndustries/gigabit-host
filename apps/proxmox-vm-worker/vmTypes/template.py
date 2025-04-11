from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional
from ulid import ULID
import json


def generate_ulid() -> str:
    # For illustration purposes, we use uuid4. Replace with a ULID generator if needed.
    return ULID().str


class Proxmox(BaseModel):
    vmid: Optional[int] = None
    node: Optional[str] = None
    name: Optional[str] = None


class Metadata(BaseModel):
    distro: Optional[str] = None
    version: Optional[str] = None
    proxmox: Optional[Proxmox] = (
        None  # Made proxmox optional with a default value of None
    )

    @field_validator("proxmox", mode="before")
    def parse_proxmox(cls, value):
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
            except Exception as e:
                raise ValueError("Invalid JSON for proxmox") from e
            if isinstance(parsed, dict):
                return Proxmox(**parsed)
            else:
                raise ValueError("proxmox JSON must be a mapping")
        if isinstance(value, dict):
            return Proxmox(**value)
        return value


class ProxmoxTemplates(BaseModel):
    id: str = Field(default_factory=generate_ulid)
    name: str = ""
    version: str = ""
    proxmox_node: str = ""
    proxmox_vm_id: str = ""
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    deleted_at: Optional[datetime] = None
    metadata: Metadata

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
