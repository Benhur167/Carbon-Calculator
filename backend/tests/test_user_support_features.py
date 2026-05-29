from __future__ import annotations

import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

import mongo_api as api  # noqa: E402


def test_registration_notification_success(monkeypatch):
    monkeypatch.setenv('SUSTAIN_QUALITY_NOTIFY_EMAIL', 'ops@example.com')

    sent = {'count': 0}

    def fake_send(subject, text, to_addr, html=None):
        sent['count'] += 1
        assert 'New organization signup' in subject
        assert 'ops@example.com' == to_addr
        assert 'test@example.com' in text
        assert html is not None

    monkeypatch.setattr(api, '_send_notification_email', fake_send)
    ok = api.notify_sustain_quality_new_registration(
        'test@example.com',
        'OrgX',
        'User X',
        username='userx',
        registration_type='organization_signup',
    )
    assert ok is True
    assert sent['count'] == 1


def test_registration_notification_failure_is_non_blocking(monkeypatch):
    monkeypatch.setenv('SUSTAIN_QUALITY_NOTIFY_EMAIL', 'ops@example.com')

    def fake_send(subject, text, to_addr, html=None):
        raise RuntimeError('smtp down')

    monkeypatch.setattr(api, '_send_notification_email', fake_send)
    ok = api.notify_sustain_quality_new_registration('test@example.com', 'OrgX', 'User X')
    assert ok is False


def test_registration_notification_default_recipient(monkeypatch):
    monkeypatch.delenv('SUSTAIN_QUALITY_NOTIFY_EMAIL', raising=False)

    sent = {'to': None}

    def fake_send(subject, text, to_addr, html=None):
        sent['to'] = to_addr

    monkeypatch.setattr(api, '_send_notification_email', fake_send)
    ok = api.notify_sustain_quality_new_registration('test@example.com', 'OrgX', 'User X')
    assert ok is True
    assert sent['to'] == api.DEFAULT_REGISTRATION_NOTIFY_EMAIL


def test_chatbot_core_handlers():
    assert 'Factor suggestion' in api.chatbot_assist('Suggest factor for electricity')
    assert 'Anomaly guidance' in api.chatbot_assist('detect anomaly')
    assert 'Tool usage' in api.chatbot_assist('how to use this tool')
    assert 'Concepts' in api.chatbot_assist('what is scope 3 emissions')
