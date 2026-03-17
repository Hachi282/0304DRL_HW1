document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const evaluateBtn = document.getElementById('evaluate-btn');
    const sizeInput = document.getElementById('grid-size');
    const interactiveGrid = document.getElementById('interactive-grid');
    const resultsSection = document.getElementById('results-section');
    const obsCountSpan = document.getElementById('obs-count');

    // Configs
    const gammaInput = document.getElementById('gamma');
    const stepRewardInput = document.getElementById('step-reward');
    const goalRewardInput = document.getElementById('goal-reward');

    let currentN = 5;
    let clickState = 0; // 0=Start, 1=End, 2=Obstacles
    let maxObstacles = 3; // n - 2
    let obstaclesCount = 0;

    let startCell = null;
    let endCell = null;
    let obstacles = [];

    function setupGrid(n) {
        currentN = n;
        clickState = 0;
        maxObstacles = n - 2;
        obstaclesCount = 0;
        startCell = null;
        endCell = null;
        obstacles = [];

        obsCountSpan.innerText = maxObstacles;
        evaluateBtn.style.display = 'none';
        resultsSection.style.display = 'none';

        // Dynamic scaling logic
        let cellSize = 45; // default for 5 and 6
        let fontSize = 0.9;
        let arrowSize = 1.15;
        
        if (n === 7) { cellSize = 38; fontSize = 0.8; arrowSize = 1.0; }
        else if (n === 8) { cellSize = 34; fontSize = 0.75; arrowSize = 0.9; }
        else if (n === 9) { cellSize = 30; fontSize = 0.7; arrowSize = 0.8; }
        
        // Update CSS variables globally on the main wrapper or document body
        document.documentElement.style.setProperty('--dynamic-cell-size', `${cellSize}px`);
        document.documentElement.style.setProperty('--dynamic-font-size', `${fontSize}rem`);
        document.documentElement.style.setProperty('--dynamic-arrow-size', `${arrowSize}rem`);

        interactiveGrid.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
        interactiveGrid.innerHTML = '';

        let cellId = 1;

        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.r = r;
                cell.dataset.c = c;
                cell.innerText = cellId++;

                cell.addEventListener('click', () => handleCellClick(cell, r, c));
                interactiveGrid.appendChild(cell);
            }
        }
    }

    function handleCellClick(cell, r, c) {
        if (cell.classList.contains('start') || cell.classList.contains('end') || cell.classList.contains('obstacle')) {
            return;
        }

        if (clickState === 0) {
            cell.classList.add('start');
            startCell = [r, c];
            clickState = 1;
        } else if (clickState === 1) {
            cell.classList.add('end');
            endCell = [r, c];
            clickState = 2;
            checkReady();
        } else if (clickState === 2) {
            if (obstaclesCount < maxObstacles) {
                cell.classList.add('obstacle');
                cell.innerText = '';
                obstacles.push([r, c]);
                obstaclesCount++;

                if (obstaclesCount === maxObstacles) {
                    checkReady();
                }
            }
        }
    }

    function checkReady() {
        if (startCell && endCell) {
            evaluateBtn.style.display = 'block';
        }
    }

    generateBtn.addEventListener('click', () => {
        let n = parseInt(sizeInput.value, 10);
        if (isNaN(n) || n < 5 || n > 9) {
            alert("Please enter a number between 5 and 9.");
            return;
        }
        setupGrid(n);
    });

    evaluateBtn.addEventListener('click', () => {
        evaluateBtn.disabled = true;
        evaluateBtn.innerText = 'Evaluating...';

        try {
            // Replicate Python's evaluate_random_policy via JavaScript purely for GitHub Pages
            const results = runValueIteration(
                currentN, 
                startCell, 
                endCell, 
                obstacles,
                parseFloat(gammaInput.value),
                parseFloat(stepRewardInput.value),
                parseFloat(goalRewardInput.value)
            );
            
            renderResults(results.value_matrix, results.policy_matrix, results.optimal_path);
        } catch (e) {
            alert('Simulation failed computationally.');
            console.error(e);
        } finally {
            evaluateBtn.disabled = false;
            evaluateBtn.innerText = 'Evaluate Policy';
        }
    });

    // JavaScript Core Policy Evaluation Engine
    function runValueIteration(n, start_rc, end_rc, obstacles, gamma, step_reward, goal_reward, theta = 1e-4) {
        const ACTIONS = ['U', 'D', 'L', 'R'];
        const ACTION_MAP = {
            'U': [-1, 0],
            'D': [1, 0],
            'L': [0, -1],
            'R': [0, 1]
        };

        const obstaclesSet = new Set(obstacles.map(o => `${o[0]},${o[1]}`));
        const endStr = `${end_rc[0]},${end_rc[1]}`;

        let V = Array.from({ length: n }, () => Array(n).fill(0.0));
        let policy = {};

        // 1. Value Iteration Loop
        while (true) {
            let delta = 0.0;
            let V_new = V.map(row => [...row]);

            for (let r = 0; r < n; r++) {
                for (let c = 0; c < n; c++) {
                    let stateStr = `${r},${c}`;
                    if (stateStr === endStr || obstaclesSet.has(stateStr)) continue;

                    let best_val = -Infinity;

                    for (let action of ACTIONS) {
                        let [dr, dc] = ACTION_MAP[action];
                        let nr = r + dr, nc = c + dc;

                        // Bounds and obstacles check
                        if (nr < 0 || nr >= n || nc < 0 || nc >= n || obstaclesSet.has(`${nr},${nc}`)) {
                            nr = r; nc = c;
                        }

                        let is_goal = (`${nr},${nc}` === endStr);
                        let r_val = is_goal ? goal_reward : step_reward;
                        let future_v = is_goal ? 0.0 : V[nr][nc];

                        let q_val = r_val + gamma * future_v;
                        if (q_val > best_val) {
                            best_val = q_val;
                        }
                    }

                    V_new[r][c] = best_val;
                    delta = Math.max(delta, Math.abs(V_new[r][c] - V[r][c]));
                }
            }
            V = V_new;
            if (delta < theta) break;
        }

        // 2. Extract Optimal Policy
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                let stateStr = `${r},${c}`;
                if (stateStr === endStr || obstaclesSet.has(stateStr)) continue;

                let best_val = -Infinity;
                let best_action = 'U';

                for (let action of ACTIONS) {
                    let [dr, dc] = ACTION_MAP[action];
                    let nr = r + dr, nc = c + dc;

                    if (nr < 0 || nr >= n || nc < 0 || nc >= n || obstaclesSet.has(`${nr},${nc}`)) {
                        nr = r; nc = c;
                    }

                    let is_goal = (`${nr},${nc}` === endStr);
                    let r_val = is_goal ? goal_reward : step_reward;
                    let future_v = is_goal ? 0.0 : V[nr][nc];

                    let q_val = r_val + gamma * future_v;

                    if (q_val > best_val + 1e-9) {
                        best_val = q_val;
                        best_action = action;
                    }
                }
                policy[stateStr] = best_action;
            }
        }

        // 3. Extract Optimal Path
        let optimal_path = [];
        let curr_r = start_rc[0], curr_c = start_rc[1];
        let visited = new Set();

        while (`${curr_r},${curr_c}` !== endStr && !visited.has(`${curr_r},${curr_c}`)) {
            visited.add(`${curr_r},${curr_c}`);
            optimal_path.push([curr_r, curr_c]);

            let action = policy[`${curr_r},${curr_c}`];
            if (!action) break;

            let [dr, dc] = ACTION_MAP[action];
            let nr = curr_r + dr, nc = curr_c + dc;

            if (nr < 0 || nr >= n || nc < 0 || nc >= n || obstaclesSet.has(`${nr},${nc}`)) break;

            curr_r = nr; curr_c = nc;
        }
        optimal_path.push(end_rc);

        // 4. Formatting output matrices
        let value_matrix = Array.from({ length: n }, () => Array(n).fill(null));
        let policy_matrix = Array.from({ length: n }, () => Array(n).fill(null));

        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                let stateStr = `${r},${c}`;
                if (stateStr === endStr) {
                    value_matrix[r][c] = "0.00";
                    policy_matrix[r][c] = "End";
                } else if (obstaclesSet.has(stateStr)) {
                    value_matrix[r][c] = "";
                    policy_matrix[r][c] = "Obstacle";
                } else {
                    value_matrix[r][c] = V[r][c].toFixed(2);
                    policy_matrix[r][c] = policy[stateStr] || "";
                }
            }
        }

        return { value_matrix, policy_matrix, optimal_path };
    }

    function renderResults(v_mat, p_mat, optimal_path) {
        resultsSection.style.display = 'flex';
        const vGrid = document.getElementById('value-grid');
        const pGrid = document.getElementById('policy-grid');

        vGrid.style.gridTemplateColumns = `repeat(${currentN}, 1fr)`;
        pGrid.style.gridTemplateColumns = `repeat(${currentN}, 1fr)`;

        vGrid.innerHTML = '';
        pGrid.innerHTML = '';

        const arrowMap = {
            'U': '↑',
            'D': '↓',
            'L': '←',
            'R': '→',
            'End': '★',
            'Obstacle': ''
        };

        // Convert optimal path list to a Set of string coordinates for easy lookup
        const pathSet = new Set(optimal_path.map(pt => `${pt[0]},${pt[1]}`));

        for (let r = 0; r < currentN; r++) {
            for (let c = 0; c < currentN; c++) {
                // Check if cell is in the optimal path
                const inOptimalPath = pathSet.has(`${r},${c}`);
                const isStart = (r === startCell[0] && c === startCell[1]);
                const isEnd = (r === endCell[0] && c === endCell[1]);

                // Value Cell
                const vc = document.createElement('div');
                vc.className = 'cell';
                if (inOptimalPath && !isStart && !isEnd) {
                    vc.classList.add('optimal-path');
                }

                if (v_mat[r][c] === "") {
                    vc.classList.add('obstacle');
                } else {
                    vc.innerText = v_mat[r][c];
                    if (isStart) vc.style.backgroundColor = '#dcfce7';
                    if (isEnd) {
                        vc.style.backgroundColor = '#fee2e2';
                        vc.style.fontWeight = 'bold';
                        vc.style.color = '#ef4444';
                    }
                }
                vGrid.appendChild(vc);

                // Policy Cell
                const pc = document.createElement('div');
                pc.className = 'cell arrow';
                if (inOptimalPath && !isStart && !isEnd) {
                    pc.classList.add('optimal-path');
                }

                let p_val = p_mat[r][c];

                if (p_val === 'Obstacle') {
                    pc.classList.add('obstacle');
                } else {
                    pc.innerText = arrowMap[p_val] || p_val;
                    if (isStart) pc.style.backgroundColor = '#dcfce7';
                    if (isEnd) {
                        pc.style.backgroundColor = '#fee2e2';
                        pc.style.color = '#ef4444';
                    }
                }
                pGrid.appendChild(pc);
            }
        }
    }

    // Initialize default grid
    setupGrid(5);
});
