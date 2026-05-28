from __future__ import annotations

import datetime
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

import mongo_api as api  # noqa: E402


def test_resolve_jwt_secret_enforces_length_in_prod():
    try:
        api.resolve_jwt_secret('short-secret', 'production')
        assert False, 'Expected RuntimeError for short production JWT secret'
    except RuntimeError as e:
        assert 'at least 32 characters' in str(e)


def test_resolve_jwt_secret_dev_fallback_and_padding():
    secret = api.resolve_jwt_secret('', 'development')
    assert isinstance(secret, str)
    assert len(secret) >= 32

    padded = api.resolve_jwt_secret('tiny', 'test')
    assert len(padded) >= 32


def test_utc_now_timezone_aware():
    now = api.utc_now()
    assert isinstance(now, datetime.datetime)
    assert now.tzinfo is not None
    assert now.utcoffset() == datetime.timedelta(0)
