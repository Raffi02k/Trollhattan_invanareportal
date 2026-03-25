"""
API Routers - separated by concern
"""

from . import local_auth
from . import oidc_auth
from . import api as api_router
from . import mock_services
from . import bff

__all__ = [
    "local_auth",
    "oidc_auth",
    "api_router",
    "mock_services",
    "bff",
]
