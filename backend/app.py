import json
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from google.cloud import firestore

app = Flask(__name__)
CORS(app)

try:
    db = firestore.Client()
    collection_name = 'golf-scores'
except:
    db = None

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
    if not db:
        return get_default_scores()
    
    try:
        doc_ref = db.collection(collection_name).document('current_tournament')
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict()['scores']
        else:
            return get_default_scores()
    except Exception as e:
        print(f"Error getting scores from DB: {e}")
        return get_default_scores()

def save_scores_to_db(scores):
    if not db:
        return False
    
    try:
        doc_ref = db.collection(collection_name).document('current_tournament')
        doc_ref.set({
            'scores': scores,
            'lastUpdated': datetime.now().isoformat()
        })
        return True
    except Exception as e:
        print(f"Error saving scores to DB: {e}")
        return False

@app.route('/api/scores', methods=['GET'])
def get_scores():
    return '', 404
    scores = get_scores_from_db()
    return jsonify({
        'scores': scores,
        'lastUpdated': datetime.now().isoformat()
    })

@app.route('/api/scores', methods=['PUT'])
def update_score():
    return '', 404
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
    return '', 404
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/takes-a-lot-of-balls.mp3')
def serve_audio():
    return '', 404
    return send_from_directory('static', 'takes-a-lot-of-balls.mp3')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return '', 404


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)