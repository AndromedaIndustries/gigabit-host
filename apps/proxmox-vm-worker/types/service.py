from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from uuid import UUID
from ulid import ULID


class Service(BaseModel):
    id: ULID
    user_id: UUID
    service_type: str
    hostname: str
    os: str
    public_key: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    sku_id: str
    current_sku_name: str
    initial_sku_name: str
    subscription_active: bool = False
    subscription_id: Optional[str] = None
    initial_checkout_id: Optional[str] = None
    status: str
    status_reason: Optional[str] = None
    payment_ids: List[str]
    payment_status: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    account_id: Optional[str] = Field(None, alias="accountId")
    proxmox_node: Optional[str] = None
    proxmox_vm_id: Optional[str] = None
