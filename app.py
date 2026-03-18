from flask import Flask, render_template, request, jsonify
from rl_env import evaluate_random_policy

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/evaluate', methods=['POST'])
def evaluate():
    data = request.json
    n = data.get('n', 5)
    start = data.get('start')
    end = data.get('end')
    obstacles = data.get('obstacles', [])
    
    # Config parameters
    gamma = float(data.get('gamma', 0.9))
    step_reward = float(data.get('step_reward', -1.0))
    goal_reward = float(data.get('goal_reward', 0.0))
    
    if not start or not end:
        return jsonify({'error': 'Start or end not set.'}), 400
        
    v_mat, p_mat, optimal_path = evaluate_random_policy(
        n, start, end, obstacles, 
        gamma=gamma, 
        step_reward=step_reward, 
        goal_reward=goal_reward
    )
    
    return jsonify({
        'value_matrix': v_mat,
        'policy_matrix': p_mat,
        'optimal_path': optimal_path
    })

@app.route('/evaluate-random', methods=['POST'])
def evaluate_random():
    from rl_env import evaluate_true_random_policy
    data = request.json
    n = data.get('n', 5)
    start = data.get('start')
    end = data.get('end')
    obstacles = data.get('obstacles', [])
    
    gamma = float(data.get('gamma', 0.9))
    step_reward = float(data.get('step_reward', -1.0))
    goal_reward = float(data.get('goal_reward', 0.0))
    
    if not start or not end:
        return jsonify({'error': 'Start or end not set.'}), 400
        
    v_mat, p_mat, optimal_path = evaluate_true_random_policy(
        n, start, end, obstacles, 
        gamma=gamma, 
        step_reward=step_reward, 
        goal_reward=goal_reward
    )
    
    return jsonify({
        'value_matrix': v_mat,
        'policy_matrix': p_mat,
        'optimal_path': optimal_path
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
