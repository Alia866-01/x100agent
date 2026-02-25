"""
JWT Service for Agno OS Authentication

Provides JWT token verification using JWKS (JSON Web Key Set)
from Agno OS platform.
"""

import json
import os
from typing import Dict, Any, Optional
from pathlib import Path
import jwt
from jwt import PyJWKClient
import logging

logger = logging.getLogger(__name__)

# Path to JWKS file
JWKS_PATH = Path(__file__).parent.parent / "config" / "agno_jwks.json"


class JWTService:
    """Service for JWT token verification with Agno JWKS"""

    def __init__(self, jwks_path: Optional[Path] = None):
        self.jwks_path = jwks_path or JWKS_PATH
        self.jwks_data = self._load_jwks()
        logger.info(f"[JWTService] Loaded JWKS from {self.jwks_path}")

    def _load_jwks(self) -> Dict[str, Any]:
        """Load JWKS from file"""
        try:
            with open(self.jwks_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.error(f"[JWTService] JWKS file not found at {self.jwks_path}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"[JWTService] Invalid JSON in JWKS file: {e}")
            raise

    def verify_token(self, token: str, algorithms: list = ["RS256"]) -> Dict[str, Any]:
        """
        Verify JWT token using JWKS

        Args:
            token: JWT token string
            algorithms: List of allowed algorithms (default: RS256)

        Returns:
            Decoded JWT payload

        Raises:
            jwt.InvalidTokenError: If token is invalid
        """
        try:
            # Get the key ID from token header
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")

            if not kid:
                raise jwt.InvalidTokenError("Token missing 'kid' in header")

            # Find matching key in JWKS
            key = None
            for jwk in self.jwks_data.get("keys", []):
                if jwk.get("kid") == kid:
                    key = jwk
                    break

            if not key:
                raise jwt.InvalidTokenError(f"Key ID '{kid}' not found in JWKS")

            # Verify and decode token
            payload = jwt.decode(
                token,
                key=key,
                algorithms=algorithms,
                options={
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_iat": True,
                }
            )

            logger.debug(f"[JWTService] Token verified successfully for user: {payload.get('sub')}")
            return payload

        except jwt.ExpiredSignatureError:
            logger.warning("[JWTService] Token has expired")
            raise
        except jwt.InvalidTokenError as e:
            logger.warning(f"[JWTService] Invalid token: {e}")
            raise
        except Exception as e:
            logger.error(f"[JWTService] Unexpected error during token verification: {e}")
            raise

    def extract_tenant_id(self, payload: Dict[str, Any]) -> Optional[str]:
        """
        Extract tenant_id from JWT payload

        Checks common claim names:
        - tenant_id
        - tenantId
        - org_id
        - organization_id

        Args:
            payload: Decoded JWT payload

        Returns:
            Tenant ID if found, None otherwise
        """
        for key in ["tenant_id", "tenantId", "org_id", "organization_id"]:
            if key in payload:
                return payload[key]

        logger.warning("[JWTService] No tenant_id found in JWT payload")
        return None

    def extract_user_id(self, payload: Dict[str, Any]) -> Optional[str]:
        """
        Extract user_id from JWT payload

        Standard claim: 'sub' (subject)

        Args:
            payload: Decoded JWT payload

        Returns:
            User ID if found, None otherwise
        """
        return payload.get("sub")

    def extract_session_id(self, payload: Dict[str, Any]) -> Optional[str]:
        """
        Extract session_id from JWT payload

        Args:
            payload: Decoded JWT payload

        Returns:
            Session ID if found, None otherwise
        """
        return payload.get("session_id")


# Singleton instance
_jwt_service = None


def get_jwt_service() -> JWTService:
    """Get singleton JWT service instance"""
    global _jwt_service
    if _jwt_service is None:
        _jwt_service = JWTService()
    return _jwt_service


# Example usage
if __name__ == "__main__":
    """
    Test JWT verification with example token

    Usage:
        python backend/services/jwt_service.py
    """
    # Initialize service
    jwt_service = get_jwt_service()

    # Example: Verify a token (replace with real token)
    example_token = "eyJhbGc...your-token-here"

    try:
        payload = jwt_service.verify_token(example_token)
        print(f"✅ Token verified successfully!")
        print(f"   User ID: {jwt_service.extract_user_id(payload)}")
        print(f"   Tenant ID: {jwt_service.extract_tenant_id(payload)}")
        print(f"   Session ID: {jwt_service.extract_session_id(payload)}")
        print(f"   Full payload: {json.dumps(payload, indent=2)}")
    except jwt.InvalidTokenError as e:
        print(f"❌ Token verification failed: {e}")
