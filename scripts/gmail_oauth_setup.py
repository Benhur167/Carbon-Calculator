#!/usr/bin/env python3
"""
One-time helper to obtain GMAIL_REFRESH_TOKEN for Render (Gmail API over HTTPS).

Google Cloud setup (required before running):
  1. Create a project → enable "Gmail API"
  2. OAuth consent screen → External → Publishing status "Testing"
     - Add scope: https://www.googleapis.com/auth/gmail.send
     - Add test user: coreembeddedlabs@gmail.com
  3. Credentials → Create OAuth client ID → type "Web application" (recommended)
     - Authorized redirect URIs: http://127.0.0.1:8765/
     - (must match exactly, including trailing slash)

Usage (PowerShell):
  $env:GMAIL_CLIENT_ID="....apps.googleusercontent.com"
  $env:GMAIL_CLIENT_SECRET="GOCSPX-...."
  python scripts/gmail_oauth_setup.py
"""
from __future__ import annotations

import json
import os
import urllib.parse
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Thread

REDIRECT_PORT = int(os.environ.get('GMAIL_OAUTH_PORT', '8765'))
REDIRECT_URI = (
    (os.environ.get('GMAIL_OAUTH_REDIRECT_URI') or '').strip()
    or f'http://127.0.0.1:{REDIRECT_PORT}/'
)
SCOPE = 'https://www.googleapis.com/auth/gmail.send'


class _OAuthHandler(BaseHTTPRequestHandler):
    auth_code: str | None = None

    def do_GET(self) -> None:
        query = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(query)
        code = (params.get('code') or [''])[0]
        if code:
            type(self).auth_code = code
            body = b'<h1>Authorization complete.</h1><p>You can close this tab and return to the terminal.</p>'
            status = 200
        else:
            err = (params.get('error') or ['unknown'])[0]
            body = f'<h1>Authorization failed: {err}</h1>'.encode('utf-8')
            status = 400
        self.send_response(status)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args) -> None:
        return


def _exchange_code(client_id: str, client_secret: str, code: str) -> dict:
    body = urllib.parse.urlencode({
        'code': code,
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': REDIRECT_URI,
        'grant_type': 'authorization_code',
    }).encode('utf-8')
    req = urllib.request.Request(
        'https://oauth2.googleapis.com/token',
        data=body,
        method='POST',
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as http_err:
        detail = (http_err.read() or b'').decode('utf-8', errors='ignore').strip()
        raise SystemExit(f'Token exchange failed: HTTP {http_err.code} {detail}') from http_err


def _extract_code_from_paste(value: str) -> str:
    value = (value or '').strip()
    if not value:
        return ''
    if 'code=' in value:
        query = urllib.parse.urlparse(value).query
        if not query and '?' in value:
            query = value.split('?', 1)[1]
        return (urllib.parse.parse_qs(query).get('code') or [''])[0]
    return value


def _print_google_cloud_checklist() -> None:
    print('\n--- If Google shows "Request details" or redirect error ---')
    print('Your OAuth client must allow this exact redirect URI:')
    print(f'  {REDIRECT_URI}')
    print('')
    print('Google Cloud Console → APIs & Services → Credentials → your OAuth client')
    print('  • Recommended type: Web application')
    print('  • Authorized redirect URIs → Add URI → paste the line above')
    print('  • Save, wait ~1 minute, then run this script again')
    print('')
    print('Also check OAuth consent screen → Test users → add:')
    print('  coreembeddedlabs@gmail.com')
    print('---\n')


def main() -> None:
    client_id = (os.environ.get('GMAIL_CLIENT_ID') or '').strip()
    client_secret = (os.environ.get('GMAIL_CLIENT_SECRET') or '').strip()
    if not client_id or not client_secret:
        raise SystemExit('Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET environment variables first.')

    _print_google_cloud_checklist()

    params = urllib.parse.urlencode({
        'client_id': client_id,
        'redirect_uri': REDIRECT_URI,
        'response_type': 'code',
        'scope': SCOPE,
        'access_type': 'offline',
        'prompt': 'consent',
    })
    auth_url = f'https://accounts.google.com/o/oauth2/v2/auth?{params}'

    server = HTTPServer(('127.0.0.1', REDIRECT_PORT), _OAuthHandler)
    thread = Thread(target=server.handle_request, daemon=True)
    thread.start()

    print('Opening browser for Google authorization...')
    print(f'If it does not open, visit:\n{auth_url}\n')
    webbrowser.open(auth_url)
    thread.join(timeout=180)
    server.server_close()

    code = _OAuthHandler.auth_code
    if not code:
        print('No authorization code received from localhost callback.')
        _print_google_cloud_checklist()
        pasted = input(
            'If Google DID redirect to localhost with ?code=... in the URL, paste that full URL here\n'
            '(otherwise fix redirect URI in Google Cloud first, then press Enter to quit): '
        ).strip()
        code = _extract_code_from_paste(pasted)
        if not code:
            raise SystemExit('No authorization code. Fix redirect URI in Google Cloud and retry.')

    tokens = _exchange_code(client_id, client_secret, code)
    refresh = (tokens.get('refresh_token') or '').strip()
    if not refresh:
        raise SystemExit(
            'No refresh_token returned. Revoke app access at '
            'https://myaccount.google.com/permissions and run again.'
        )

    print('\nAdd these to Render environment variables:\n')
    print(f'GMAIL_CLIENT_ID={client_id}')
    print(f'GMAIL_CLIENT_SECRET={client_secret}')
    print(f'GMAIL_REFRESH_TOKEN={refresh}')
    print('\nAlso set:')
    print('MAIL_DEFAULT_SENDER=SQ Audit <coreembeddedlabs@gmail.com>')


if __name__ == '__main__':
    main()
