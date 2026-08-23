import json
import sys
from pathlib import Path

sys.path.append('/opt/.manus/.sandbox-runtime')
from data_api import ApiClient

DOMAIN = 'alro3agift-v6dgouz7.manus.space'
OUTPUT = Path('/home/ubuntu/alro3a-gifts-store/docs/similarweb_raw_2026-07.json')

client = ApiClient()

requests = {
    'global_rank': ('SimilarWeb/get_global_rank', {}, {}),
    'visits_total': (
        'SimilarWeb/get_visits_total',
        {},
        {'country': 'world', 'granularity': 'monthly', 'start_date': '2026-02', 'end_date': '2026-07'},
    ),
    'unique_visits': (
        'SimilarWeb/get_unique_visit',
        {},
        {'start_date': '2026-02', 'end_date': '2026-07'},
    ),
    'bounce_rate': (
        'SimilarWeb/get_bounce_rate',
        {},
        {'country': 'world', 'granularity': 'monthly', 'start_date': '2026-02', 'end_date': '2026-07'},
    ),
    'traffic_sources_desktop': (
        'SimilarWeb/get_traffic_sources_desktop',
        {},
        {'country': 'world', 'granularity': 'monthly', 'start_date': '2026-05', 'end_date': '2026-07'},
    ),
    'traffic_sources_mobile': (
        'SimilarWeb/get_traffic_sources_mobile',
        {},
        {'country': 'world', 'granularity': 'monthly', 'start_date': '2026-05', 'end_date': '2026-07'},
    ),
    'countries': (
        'SimilarWeb/get_total_traffic_by_country',
        {},
        {'start_date': '2026-05', 'end_date': '2026-07', 'limit': '10'},
    ),
}

results = {'domain': DOMAIN, 'period': {'six_months': '2026-02 to 2026-07', 'three_months': '2026-05 to 2026-07'}, 'metrics': {}}

for name, (endpoint, path_values, query) in requests.items():
    try:
        results['metrics'][name] = {
            'status': 'ok',
            'data': client.call_api(endpoint, path_params={'domain': DOMAIN, **path_values}, query=query),
        }
    except Exception as error:
        results['metrics'][name] = {'status': 'unavailable', 'error': str(error)}
    OUTPUT.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')

print(OUTPUT)
