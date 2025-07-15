import json
import boto3
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

dynamodb = boto3.resource('dynamodb')
table_name = 'golf-scores'

try:
    table = dynamodb.Table(table_name)
except:
    table = None

COURSE_INFO = {
    "par": [4, 4, 5, 4, 3, 5, 4, 3, 5, 4, 4, 5, 4, 4, 5, 4, 3, 5],
    "totalPar": 72,
    "frontNinePar": 37,
    "backNinePar": 35
}

TEAMS = {
    "Chiefs": [
        {"id": 1, "pairing": "Chris-Tyler"},
        {"id": 2, "pairing": "Todd-Joe"},
        {"id": 3, "pairing": "Steve-Darby"},
        {"id": 4, "pairing": "Gardner-Russ"}
    ],
    "Royals": [
        {"id": 5, "pairing": "Dowell-Rick"},
        {"id": 6, "pairing": "Andy-Zac"},
        {"id": 7, "pairing": "Marrah-Ben"},
        {"id": 8, "pairing": "Ethan-Bross"}
    ]
}

def get_default_scores():
    scores = {}
    for team_pairings in TEAMS.values():
        for pairing in team_pairings:
            scores[str(pairing["id"])] = {
                "round1": [None] * 18,
                "round2": [None] * 18
            }
    return scores

def get_scores_from_db():
    if not table:
        return get_default_scores()
    
    try:
        response = table.get_item(Key={'id': 'current_tournament'})
        if 'Item' in response:
            return response['Item']['scores']
        else:
            return get_default_scores()
    except Exception as e:
        print(f"Error getting scores from DB: {e}")
        return get_default_scores()

def save_scores_to_db(scores):
    if not table:
        return False
    
    try:
        table.put_item(
            Item={
                'id': 'current_tournament',
                'scores': scores,
                'lastUpdated': datetime.now().isoformat()
            }
        )
        return True
    except Exception as e:
        print(f"Error saving scores to DB: {e}")
        return False

@app.route('/api/scores', methods=['GET'])
def get_scores():
    scores = get_scores_from_db()
    return jsonify({
        'scores': scores,
        'lastUpdated': datetime.now().isoformat()
    })

@app.route('/api/scores', methods=['PUT'])
def update_score():
    data = request.get_json()
    
    if not data or not all(key in data for key in ['pairingId', 'round', 'holeIndex', 'score']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    pairing_id = str(data['pairingId'])
    round_name = data['round']
    hole_index = data['holeIndex']
    score = data['score']
    
    if round_name not in ['round1', 'round2']:
        return jsonify({'error': 'Invalid round'}), 400
    
    if not (0 <= hole_index <= 17):
        return jsonify({'error': 'Invalid hole index'}), 400
    
    if score is not None and not (1 <= score <= 10):
        return jsonify({'error': 'Invalid score'}), 400
    
    scores = get_scores_from_db()
    
    if pairing_id not in scores:
        return jsonify({'error': 'Invalid pairing ID'}), 400
    
    scores[pairing_id][round_name][hole_index] = score
    
    if save_scores_to_db(scores):
        return jsonify({
            'success': True,
            'message': 'Score updated successfully',
            'updatedScore': {
                'pairingId': pairing_id,
                'round': round_name,
                'holeIndex': hole_index,
                'score': score
            },
            'timestamp': datetime.now().isoformat()
        })
    else:
        return jsonify({'error': 'Failed to save score'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

def lambda_handler(event, context):
    from werkzeug.serving import WSGIRequestHandler
    from io import StringIO
    import sys
    
    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    headers = event.get('headers', {})
    query_params = event.get('queryStringParameters') or {}
    body = event.get('body', '')
    
    environ = {
        'REQUEST_METHOD': method,
        'PATH_INFO': path,
        'QUERY_STRING': '&'.join([f"{k}={v}" for k, v in query_params.items()]),
        'CONTENT_TYPE': headers.get('Content-Type', ''),
        'CONTENT_LENGTH': str(len(body)) if body else '0',
        'wsgi.input': StringIO(body),
        'wsgi.errors': sys.stderr,
        'wsgi.version': (1, 0),
        'wsgi.multithread': False,
        'wsgi.multiprocess': True,
        'wsgi.run_once': False,
        'wsgi.url_scheme': 'https',
        'SERVER_NAME': headers.get('Host', 'localhost'),
        'SERVER_PORT': '443',
    }
    
    for key, value in headers.items():
        key = key.upper().replace('-', '_')
        if key not in ('CONTENT_TYPE', 'CONTENT_LENGTH'):
            key = 'HTTP_' + key
        environ[key] = value
    
    response_data = []
    
    def start_response(status, response_headers, exc_info=None):
        response_data.append(status)
        response_data.append(response_headers)
    
    result = app(environ, start_response)
    response_body = b''.join(result).decode('utf-8')
    
    status_code = int(response_data[0].split(' ')[0])
    headers = dict(response_data[1])
    
    return {
        'statusCode': status_code,
        'headers': headers,
        'body': response_body,
        'isBase64Encoded': False
    }

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)