"""AES-256 encryption for Aadhaar numbers and SHA-256 hashing for dedup."""

import base64
import hashlib
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
import os

from app.config import settings


def _get_key() -> bytes:
    """Derive a 32-byte key from the configured encryption key."""
    key = settings.ENCRYPTION_KEY.encode("utf-8")
    return hashlib.sha256(key).digest()


def encrypt_aadhaar(aadhaar: str) -> str:
    """Encrypt Aadhaar number with AES-256-CBC. Returns base64-encoded ciphertext."""
    key = _get_key()
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()

    # Pad to 16-byte block size
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(aadhaar.encode("utf-8")) + padder.finalize()

    encrypted = encryptor.update(padded_data) + encryptor.finalize()
    # Prepend IV to ciphertext
    return base64.b64encode(iv + encrypted).decode("utf-8")


def decrypt_aadhaar(encrypted_aadhaar: str) -> str:
    """Decrypt AES-256-CBC encrypted Aadhaar number."""
    key = _get_key()
    raw = base64.b64decode(encrypted_aadhaar)
    iv = raw[:16]
    ciphertext = raw[16:]

    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    padded_data = decryptor.update(ciphertext) + decryptor.finalize()

    unpadder = padding.PKCS7(128).unpadder()
    data = unpadder.update(padded_data) + unpadder.finalize()
    return data.decode("utf-8")


def hash_aadhaar(aadhaar: str) -> str:
    """SHA-256 hash of Aadhaar for duplicate detection. No PII in the hash."""
    return hashlib.sha256(aadhaar.encode("utf-8")).hexdigest()


def mask_aadhaar(aadhaar: str) -> str:
    """Mask first 8 digits of Aadhaar: 123456789012 → XXXXXXXX9012"""
    if len(aadhaar) >= 12:
        return "XXXXXXXX" + aadhaar[-4:]
    return "XXXXXXXX" + aadhaar[-4:] if len(aadhaar) >= 4 else "XXXXXXXXXXXX"
