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

    evaluateBtn.addEventListener('click', async () => {
        evaluateBtn.disabled = true;
        evaluateBtn.innerText = 'Evaluating...';

        try {
            const res = await fetch('/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    n: currentN,
                    start: startCell,
                    end: endCell,
                    obstacles: obstacles,
                    gamma: parseFloat(gammaInput.value),
                    step_reward: parseFloat(stepRewardInput.value),
                    goal_reward: parseFloat(goalRewardInput.value)
                })
            });
            const data = await res.json();

            if (data.error) {
                alert(data.error);
                return;
            }

            renderResults(data.value_matrix, data.policy_matrix, data.optimal_path);
        } catch (e) {
            alert('Simulation failed. Make sure the Flask server is running.');
            console.error(e);
        } finally {
            evaluateBtn.disabled = false;
            evaluateBtn.innerText = 'Evaluate Policy';
        }
    });

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
