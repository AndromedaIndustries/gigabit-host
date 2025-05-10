from __future__ import annotations

from pydantic import BaseModel
from typing import Optional


class Attributes(BaseModel):
    cpu_mfg: str
    cpu_type: str
    cpu_model: str
    cpu_assignment: str
    cpu_generation: int
    cpu_cores: int
    memory: int
    storage_size: int
    storage_type: str
    catagory: str
    size: str


class Sku(BaseModel):
    id: str
    sku: str
    stripe_personal_sku: str
    stripe_business_sku: str
    name: str
    sku_type: str
    description: str
    category: str
    price: int
    attributes: Attributes
    popular: Optional[bool]
    available: Optional[bool]
    quantity: int
