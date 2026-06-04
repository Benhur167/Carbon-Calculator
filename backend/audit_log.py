"""
Organization audit log — diff MongoDB user_data and format entries for admins/consultants.
"""
from __future__ import annotations

import datetime
import json
from typing import Any

DATA_CATEGORIES = (
    'water',
    'energy',
    'transmissionDistribution',
    'waste',
    'transport',
    'businessTravel',
    'freight',
    'staffCommute',
    'wfh',
    'materials',
    'refrigerants',
)

_AUDIT_VALUE_MAX = 200
_AUDIT_DETAIL_MAX = 500
_MAX_CHANGES_PER_SAVE = 200


def _truncate(text: Any, limit: int = _AUDIT_VALUE_MAX) -> str:
    s = '' if text is None else str(text)
    s = s.replace('\r\n', '\n').replace('\r', '\n')
    if len(s) <= limit:
        return s
    return s[: limit - 3] + '...'


def _summarize_pref_value(key: str, value: Any) -> str:
    if value is None:
        return '(empty)'
    if key == 'companyLogo':
        s = str(value)
        if s.startswith('data:'):
            return '[company logo image updated]'
        return _truncate(s, 80)
    if key in ('hiddenWidgets', 'dashboardChartPreferences', 'qaChecklistState'):
        s = str(value)
        return _truncate(s, 120) if len(s) > 120 else s
    return _truncate(value)


def _stable_json(obj: Any) -> str:
    return json.dumps(obj, sort_keys=True, default=str)


def _months_summary(months: Any) -> str:
    if not isinstance(months, list):
        return 'no months'
    nz = sum(1 for m in months if isinstance(m, (int, float)) and m != 0)
    total = sum(float(m) for m in months if isinstance(m, (int, float)))
    return f'{nz} month(s) with values, sum={total:.4g}'


def _row_label(row: dict, index: int) -> str:
    desc = (row.get('description') or '').strip()
    year = row.get('year', '')
    base = f'row {index + 1}'
    if desc:
        base += f' "{_truncate(desc, 60)}"'
    if year:
        base += f' (year {year})'
    return base


def _describe_row_change(old: dict, new: dict) -> str:
    parts: list[str] = []
    if old.get('description') != new.get('description'):
        parts.append(
            f'description: {_truncate(old.get("description"), 40)!r} -> '
            f'{_truncate(new.get("description"), 40)!r}'
        )
    if old.get('year') != new.get('year'):
        parts.append(f'year: {old.get("year")} -> {new.get("year")}')
    if old.get('unit') != new.get('unit'):
        parts.append(f'unit: {old.get("unit")} -> {new.get("unit")}')
    if old.get('emissionType') != new.get('emissionType'):
        parts.append(f'emissionType: {old.get("emissionType")} -> {new.get("emissionType")}')
    if old.get('months') != new.get('months'):
        parts.append(
            f'monthly data: {_months_summary(old.get("months"))} -> '
            f'{_months_summary(new.get("months"))}'
        )
    return '; '.join(parts) if parts else 'row updated'


def diff_org_preferences(old: dict | None, new: dict | None) -> list[dict]:
    old = old if isinstance(old, dict) else {}
    new = new if isinstance(new, dict) else {}
    changes: list[dict] = []
    for key in sorted(set(old) | set(new)):
        ov, nv = old.get(key), new.get(key)
        if ov == nv:
            continue
        changes.append({
            'area': 'org_preferences',
            'path': key,
            'detail': f'Organization setting "{key}" changed',
            'old': _summarize_pref_value(key, ov),
            'new': _summarize_pref_value(key, nv),
        })
    return changes


def _diff_data_rows(site_id: str, category: str, old_rows: Any, new_rows: Any) -> list[dict]:
    old_rows = old_rows if isinstance(old_rows, list) else []
    new_rows = new_rows if isinstance(new_rows, list) else []
    changes: list[dict] = []
    max_len = max(len(old_rows), len(new_rows))
    for i in range(max_len):
        path = f'sites.{site_id}.data.{category}'
        if i >= len(old_rows):
            row = new_rows[i] if isinstance(new_rows[i], dict) else {}
            changes.append({
                'area': 'site_data',
                'path': path,
                'detail': f'Added {_row_label(row, i)} in {category}',
                'old': '(none)',
                'new': _describe_row_change({}, row),
            })
        elif i >= len(new_rows):
            row = old_rows[i] if isinstance(old_rows[i], dict) else {}
            changes.append({
                'area': 'site_data',
                'path': path,
                'detail': f'Removed {_row_label(row, i)} from {category}',
                'old': _describe_row_change(row, {}),
                'new': '(removed)',
            })
        else:
            o_row = old_rows[i] if isinstance(old_rows[i], dict) else {}
            n_row = new_rows[i] if isinstance(new_rows[i], dict) else {}
            if _stable_json(o_row) != _stable_json(n_row):
                changes.append({
                    'area': 'site_data',
                    'path': path,
                    'detail': f'Updated {_row_label(n_row, i)} in {category}',
                    'old': _describe_row_change(o_row, n_row),
                    'new': _describe_row_change(o_row, n_row),
                })
    return changes


def _diff_tab_questions(site_id: str, old_tq: Any, new_tq: Any) -> list[dict]:
    old_tq = old_tq if isinstance(old_tq, dict) else {}
    new_tq = new_tq if isinstance(new_tq, dict) else {}
    changes: list[dict] = []
    for cat in sorted(set(old_tq) | set(new_tq)):
        ov, nv = old_tq.get(cat), new_tq.get(cat)
        if ov == nv:
            continue
        changes.append({
            'area': 'tab_questions',
            'path': f'sites.{site_id}.tabQuestions.{cat}',
            'detail': f'Tab notes for "{cat}" at site {site_id}',
            'old': _truncate(ov, _AUDIT_DETAIL_MAX),
            'new': _truncate(nv, _AUDIT_DETAIL_MAX),
        })
    return changes


def _diff_financials(site_id: str, old_fin: Any, new_fin: Any) -> list[dict]:
    old_fin = old_fin if isinstance(old_fin, dict) else {}
    new_fin = new_fin if isinstance(new_fin, dict) else {}
    changes: list[dict] = []
    for key in sorted(set(old_fin) | set(new_fin)):
        ov, nv = old_fin.get(key), new_fin.get(key)
        if ov == nv:
            continue
        changes.append({
            'area': 'financials',
            'path': f'sites.{site_id}.financials.{key}',
            'detail': f'Financial field "{key}" at site {site_id}',
            'old': str(ov),
            'new': str(nv),
        })
    return changes


def _diff_record_list(site_id: str, field: str, old_items: Any, new_items: Any) -> list[dict]:
    old_items = old_items if isinstance(old_items, list) else []
    new_items = new_items if isinstance(new_items, list) else []
    changes: list[dict] = []
    if len(old_items) != len(new_items):
        changes.append({
            'area': field,
            'path': f'sites.{site_id}.{field}',
            'detail': f'{field} count at site {site_id}',
            'old': str(len(old_items)),
            'new': str(len(new_items)),
        })
    old_by_id = {
        str(x.get('id')): x for x in old_items if isinstance(x, dict) and x.get('id')
    }
    new_by_id = {
        str(x.get('id')): x for x in new_items if isinstance(x, dict) and x.get('id')
    }
    for rid in sorted(set(old_by_id) | set(new_by_id)):
        o, n = old_by_id.get(rid), new_by_id.get(rid)
        if o is None and n is not None:
            label = n.get('name') or n.get('amount') or rid
            changes.append({
                'area': field,
                'path': f'sites.{site_id}.{field}.{rid}',
                'detail': f'Added {field} record {rid} ({label})',
                'old': '(none)',
                'new': _truncate(_stable_json(n), _AUDIT_DETAIL_MAX),
            })
        elif n is None and o is not None:
            label = o.get('name') or o.get('amount') or rid
            changes.append({
                'area': field,
                'path': f'sites.{site_id}.{field}.{rid}',
                'detail': f'Removed {field} record {rid} ({label})',
                'old': _truncate(_stable_json(o), _AUDIT_DETAIL_MAX),
                'new': '(removed)',
            })
        elif o is not None and n is not None and _stable_json(o) != _stable_json(n):
            changes.append({
                'area': field,
                'path': f'sites.{site_id}.{field}.{rid}',
                'detail': f'Updated {field} record {rid}',
                'old': _truncate(_stable_json(o), _AUDIT_DETAIL_MAX),
                'new': _truncate(_stable_json(n), _AUDIT_DETAIL_MAX),
            })
    return changes


def _diff_site(site_id: str, old_site: Any, new_site: Any) -> list[dict]:
    old_site = old_site if isinstance(old_site, dict) else {}
    new_site = new_site if isinstance(new_site, dict) else {}
    changes: list[dict] = []

    for text_key in ('name', 'companyName', 'notes'):
        ov, nv = old_site.get(text_key), new_site.get(text_key)
        if ov != nv:
            changes.append({
                'area': 'site_meta',
                'path': f'sites.{site_id}.{text_key}',
                'detail': f'Site {site_id} {text_key} changed',
                'old': _truncate(ov),
                'new': _truncate(nv),
            })

    changes.extend(_diff_financials(site_id, old_site.get('financials'), new_site.get('financials')))
    changes.extend(_diff_tab_questions(site_id, old_site.get('tabQuestions'), new_site.get('tabQuestions')))
    changes.extend(_diff_record_list(site_id, 'invoices', old_site.get('invoices'), new_site.get('invoices')))
    changes.extend(_diff_record_list(site_id, 'bills', old_site.get('bills'), new_site.get('bills')))

    old_data = old_site.get('data') if isinstance(old_site.get('data'), dict) else {}
    new_data = new_site.get('data') if isinstance(new_site.get('data'), dict) else {}
    for category in DATA_CATEGORIES:
        changes.extend(
            _diff_data_rows(site_id, category, old_data.get(category), new_data.get(category))
        )

    old_cash = old_site.get('cashTransactions')
    new_cash = new_site.get('cashTransactions')
    if _stable_json(old_cash) != _stable_json(new_cash):
        changes.append({
            'area': 'cash_transactions',
            'path': f'sites.{site_id}.cashTransactions',
            'detail': f'Cash transactions at site {site_id}',
            'old': _truncate(_stable_json(old_cash), _AUDIT_DETAIL_MAX),
            'new': _truncate(_stable_json(new_cash), _AUDIT_DETAIL_MAX),
        })

    old_flow = old_site.get('monthlyCashFlow')
    new_flow = new_site.get('monthlyCashFlow')
    if _stable_json(old_flow) != _stable_json(new_flow):
        changes.append({
            'area': 'monthly_cash_flow',
            'path': f'sites.{site_id}.monthlyCashFlow',
            'detail': f'Monthly cash flow at site {site_id}',
            'old': _truncate(_stable_json(old_flow), _AUDIT_DETAIL_MAX),
            'new': _truncate(_stable_json(new_flow), _AUDIT_DETAIL_MAX),
        })

    return changes


def diff_user_data_payload(old_doc: dict | None, new_doc: dict | None) -> list[dict]:
    """Compare previous and incoming Mongo user_data documents."""
    old_doc = old_doc if isinstance(old_doc, dict) else {}
    new_doc = new_doc if isinstance(new_doc, dict) else {}
    changes: list[dict] = []

    changes.extend(
        diff_org_preferences(old_doc.get('org_preferences'), new_doc.get('org_preferences'))
    )

    old_sites = old_doc.get('sites') if isinstance(old_doc.get('sites'), dict) else {}
    new_sites = new_doc.get('sites') if isinstance(new_doc.get('sites'), dict) else {}

    for site_id in sorted(set(old_sites) | set(new_sites)):
        if site_id not in old_sites:
            name = (new_sites.get(site_id) or {}).get('name') or site_id
            changes.append({
                'area': 'sites',
                'path': f'sites.{site_id}',
                'detail': f'Added building/site "{name}" ({site_id})',
                'old': '(none)',
                'new': site_id,
            })
            changes.extend(_diff_site(site_id, {}, new_sites.get(site_id)))
        elif site_id not in new_sites:
            name = (old_sites.get(site_id) or {}).get('name') or site_id
            changes.append({
                'area': 'sites',
                'path': f'sites.{site_id}',
                'detail': f'Removed building/site "{name}" ({site_id})',
                'old': site_id,
                'new': '(removed)',
            })
        else:
            changes.extend(_diff_site(site_id, old_sites[site_id], new_sites[site_id]))

    if len(changes) > _MAX_CHANGES_PER_SAVE:
        extra = len(changes) - _MAX_CHANGES_PER_SAVE
        changes = changes[:_MAX_CHANGES_PER_SAVE]
        changes.append({
            'area': 'summary',
            'path': 'truncated',
            'detail': f'{extra} additional change(s) not listed',
            'old': '',
            'new': '',
        })
    return changes


def build_audit_summary(changes: list[dict], action: str) -> str:
    if not changes:
        return f'{action}: no field changes detected'
    areas: dict[str, int] = {}
    for c in changes:
        area = c.get('area') or 'other'
        areas[area] = areas.get(area, 0) + 1
    parts = [f'{count} {area}' for area, count in sorted(areas.items())]
    return f'{action}: ' + ', '.join(parts)


def format_audit_log_txt(
    organization_id: str,
    organization_name: str | None,
    entries: list[dict],
    *,
    generated_at: datetime.datetime | None = None,
) -> str:
    """Plain-text audit log for download."""
    ts = generated_at or datetime.datetime.now(datetime.timezone.utc)
    lines = [
        'Carbon Calculator — Organization Audit Log',
        '=' * 60,
        f'Organization ID: {organization_id}',
    ]
    if organization_name:
        lines.append(f'Organization name: {organization_name}')
    lines.append(f'Generated (UTC): {ts.strftime("%Y-%m-%d %H:%M:%S")}')
    lines.append(f'Entries: {len(entries)}')
    lines.append('=' * 60)
    lines.append('')

    if not entries:
        lines.append('No audit entries recorded yet.')
        return '\n'.join(lines) + '\n'

    for entry in entries:
        when = entry.get('timestamp')
        if isinstance(when, datetime.datetime):
            when_str = when.astimezone(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')
        else:
            when_str = str(when or '')
        actor = entry.get('actor_email') or entry.get('actor_username') or 'unknown'
        name = entry.get('actor_name') or ''
        role = entry.get('actor_role') or 'user'
        action = entry.get('action') or 'change'
        summary = entry.get('summary') or ''
        lines.append(f'[{when_str}] {actor}' + (f' ({name})' if name else '') + f' — {role} — {action}')
        if summary:
            lines.append(f'  Summary: {summary}')
        for ch in entry.get('changes') or []:
            detail = ch.get('detail') or ch.get('path') or 'change'
            lines.append(f'  - {detail}')
            old_v = ch.get('old')
            new_v = ch.get('new')
            if old_v not in (None, '') or new_v not in (None, ''):
                if old_v not in (None, ''):
                    lines.append(f'      Before: {old_v}')
                if new_v not in (None, ''):
                    lines.append(f'      After:  {new_v}')
        lines.append('')

    return '\n'.join(lines).rstrip() + '\n'
