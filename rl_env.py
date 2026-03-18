from typing import Dict, Tuple, List, Set, Any, Optional

ACTIONS = ['U', 'D', 'L', 'R']
ACTION_MAP = {
    'U': (-1, 0),
    'D': (1, 0),
    'L': (0, -1),
    'R': (0, 1)
}

def evaluate_random_policy(
    n: int, 
    start_rc: List[int], 
    end_rc: List[int], 
    obstacles: List[List[int]], 
    gamma: float = 0.9, 
    step_reward: float = -1.0, 
    goal_reward: float = 10.0, 
    theta: float = 1e-4
) -> Tuple[List[List[Any]], List[List[Any]], List[List[int]]]:
    """
    Runs Value Iteration to find the optimal policy and values.
    Uses pure Python standard libraries for maximum compatibility and clean type hints.
    """
    obstacles_set: Set[Tuple[int, int]] = {(int(o[0]), int(o[1])) for o in obstacles}
    end_tuple: Tuple[int, int] = (int(end_rc[0]), int(end_rc[1]))
    
    # Initialize Value Matrix with 0.0
    V: List[List[float]] = [[0.0 for _ in range(n)] for _ in range(n)]
    policy: Dict[Tuple[int, int], str] = {}

    # Value Iteration
    while True:
        delta = 0.0
        # Create a deep copy of V for V_new
        V_new: List[List[float]] = [[V[r][c] for c in range(n)] for r in range(n)]
        
        for r in range(n):
            for c in range(n):
                if (r, c) == end_tuple or (r, c) in obstacles_set:
                    continue # Terminal states remain 0.0
                
                best_val = -float('inf')
                
                for action in ACTIONS:
                    dr, dc = ACTION_MAP[action]
                    nr, nc = r + dr, c + dc
                    
                    # Check valid move
                    if nr < 0 or nr >= n or nc < 0 or nc >= n or (nr, nc) in obstacles_set:
                        nr, nc = r, c # Hit a wall or obstacle, stay in same state
                    
                    is_goal = ((nr, nc) == end_tuple)
                    r_val = goal_reward if is_goal else step_reward
                    future_v = 0.0 if is_goal else V[nr][nc]
                    
                    q_val = r_val + gamma * future_v
                    if q_val > best_val:
                        best_val = q_val
                
                V_new[r][c] = best_val
                delta = max(delta, abs(V_new[r][c] - V[r][c]))
                
        V = V_new
        if delta < theta:
            break

    # Extract Optimal Policy
    for r in range(n):
        for c in range(n):
            if (r, c) == end_tuple or (r, c) in obstacles_set:
                continue
                
            best_val = -float('inf')
            best_action = 'U'
            for action in ACTIONS:
                dr, dc = ACTION_MAP[action]
                nr, nc = r + dr, c + dc
                
                if nr < 0 or nr >= n or nc < 0 or nc >= n or (nr, nc) in obstacles_set:
                    nr, nc = r, c
                
                is_goal = ((nr, nc) == end_tuple)
                r_val = goal_reward if is_goal else step_reward
                future_v = 0.0 if is_goal else V[nr][nc]
                q_val = r_val + gamma * future_v
                
                # small epsilon for floating point comparison issues
                if q_val > best_val + 1e-9:
                    best_val = q_val
                    best_action = action
            policy[(r, c)] = best_action

    # Calculate optimal path from the derived Policy
    optimal_path: List[List[int]] = []
    curr_r, curr_c = int(start_rc[0]), int(start_rc[1])
    visited: Set[Tuple[int, int]] = set()
    
    while (curr_r, curr_c) != end_tuple and (curr_r, curr_c) not in visited:
        visited.add((curr_r, curr_c))
        optimal_path.append([curr_r, curr_c])
        
        action = policy.get((curr_r, curr_c))
        if not action:
            break
            
        dr, dc = ACTION_MAP[action]
        nr, nc = curr_r + dr, curr_c + dc
        
        if nr < 0 or nr >= n or nc < 0 or nc >= n or (nr, nc) in obstacles_set:
            break # Hits a wall (should not happen in optimal policy but safe guard)
            
        curr_r, curr_c = nr, nc
        
    optimal_path.append(end_rc) # Ensure the goal is marked in the path

    value_matrix: List[List[Any]] = [[None for _ in range(n)] for _ in range(n)]
    policy_matrix: List[List[Any]] = [[None for _ in range(n)] for _ in range(n)]
    
    for r in range(n):
        for c in range(n):
            if (r, c) == end_tuple:
                value_matrix[r][c] = "0.00"
                policy_matrix[r][c] = "End"
            elif (r, c) in obstacles_set:
                value_matrix[r][c] = ""
                policy_matrix[r][c] = "Obstacle"
            else:
                value_matrix[r][c] = f"{V[r][c]:.2f}"
                policy_matrix[r][c] = policy.get((r, c), "")
                
    return value_matrix, policy_matrix, optimal_path


def evaluate_true_random_policy(
    n: int, 
    start_rc: List[int], 
    end_rc: List[int], 
    obstacles: List[List[int]], 
    gamma: float = 0.9, 
    step_reward: float = -1.0, 
    goal_reward: float = 10.0, 
    theta: float = 1e-4
) -> Tuple[List[List[Any]], List[List[Any]], List[List[int]]]:
    import random
    obstacles_set: Set[Tuple[int, int]] = {(int(o[0]), int(o[1])) for o in obstacles}
    end_tuple: Tuple[int, int] = (int(end_rc[0]), int(end_rc[1]))
    
    policy: Dict[Tuple[int, int], str] = {}
    for r in range(n):
        for c in range(n):
            if (r, c) != end_tuple and (r, c) not in obstacles_set:
                policy[(r, c)] = random.choice(ACTIONS)
                
    V: List[List[float]] = [[0.0 for _ in range(n)] for _ in range(n)]

    while True:
        delta = 0.0
        V_new: List[List[float]] = [[V[r][c] for c in range(n)] for r in range(n)]
        
        for r in range(n):
            for c in range(n):
                if (r, c) == end_tuple or (r, c) in obstacles_set:
                    continue
                
                action = policy.get((r, c), 'U')
                dr, dc = ACTION_MAP[action]
                nr, nc = r + dr, c + dc
                
                if nr < 0 or nr >= n or nc < 0 or nc >= n or (nr, nc) in obstacles_set:
                    nr, nc = r, c
                
                is_goal = ((nr, nc) == end_tuple)
                r_val = goal_reward if is_goal else step_reward
                future_v = 0.0 if is_goal else V[nr][nc]
                
                V_new[r][c] = r_val + gamma * future_v
                delta = max(delta, abs(V_new[r][c] - V[r][c]))
                
        V = V_new
        if delta < theta:
            break
            
    value_matrix: List[List[Any]] = [[None for _ in range(n)] for _ in range(n)]
    policy_matrix: List[List[Any]] = [[None for _ in range(n)] for _ in range(n)]
    
    for r in range(n):
        for c in range(n):
            if (r, c) == end_tuple:
                value_matrix[r][c] = "0.00"
                policy_matrix[r][c] = "End"
            elif (r, c) in obstacles_set:
                value_matrix[r][c] = ""
                policy_matrix[r][c] = "Obstacle"
            else:
                value_matrix[r][c] = f"{V[r][c]:.2f}"
                policy_matrix[r][c] = policy.get((r, c), "")
                
    return value_matrix, policy_matrix, []
