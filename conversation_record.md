# AI Assistant Conversation Record
**Project**: 0304DRL_HW1
**Objective**: Build a Gridworld reinforcement learning environment utilizing a full-stack Flask/JS web app to configure policies and evaluate matrices.

## Prompt 1: Project Initialization
**User**: Provided the `simple_rl_cheatsheet.pdf` alongside 3 assignment specification images to develop the backend and frontend components.

**AI Action**: 
- Evaluated assignment rubrics (Reward/Gamma specifications absent in images).
- Initialized Task checklist and Implementation Plan.
- Requested user review to define default assumptions (-1 Step Penalties, 0.9 Discount factor).

## Prompt 2: Core Development
**User**: Approved the parameters and prompted to commence coding.

**AI Action**:
- Created `rl_env.py` (NumPy backend RL solver), `app.py` (Flask REST API).
- Constructed `index.html` structure with interactive Start/End point configuration logic in `script.js`.
- Authored a premium `style.css` matching grading rubrics for "User Interface Friendliness."

## Prompt 3: Bug Fixing & New Logic
**User**: Reported the Value matrix converging to -10.00 and numerous Pylance runtime type errors in standard execution. Requested capabilities to manually configure Gamma/Step/Goal metrics, and to visualize the **Optimal Path**.

**AI Action**:
- Remodeled the RL backend logic in `rl_env.py`. Replaced random policy mapping with formal Iterative Policy Evaluation (Value Iteration).
- Altered output structures to return the most explicit route greedily parsing the Maximum Values computed path.
- Injected interactive input fields into the DOM allowing explicit definitions of Gamma, Goal Reward, and Step Reward values dynamically.
- Authored custom CSS highlighting the optimal array natively in striking yellow.

## Prompt 4: Addressing Pylance Type Safety & Dependencies
**User**: Maintained errors existed in `.py` modules specifically citing NumPy resolution conflicts and mismatched variables involving `__add__` binaries over untyped arrays.

**AI Action**:
- Realized the user's host environment lacked extensive pip installations inside `.venv`.
- Converted the entire Python value iteration stack into **Pure Python Native Types** eliminating the `numpy` module.
- Injected strict Type Hints (`Set`, `Tuple`, `Dict`, `List`, `Any`) across properties solving VS Code Pylance lint warnings natively yielding a 0 Error project execution template.

## Prompt 5: Scaling & UX Enhancements
**User**: Identified max-obstacles restricted immediate test runs and noted UX vertical scrolls for layouts larger than 7x7 maps.

**AI Action**:
- Formatted `checkReady` logic omitting the strict `obstaclesCount == maxObstacles` condition, supporting generic pathing runs.
- Proposed 3 distinct solutions.
- Implemented **Dynamic CSS Variables**. The framework now injects `font-size`, `cell-size` explicitly dependent upon the HTML generation logic ensuring grids scaled from $5$ up to $9$ always fit harmoniously inside absolute parent coordinates alongside their companion matrices.

## Prompt 6: Personalization & Deploy Specs
**User**: Instructed UI stylistic changes (Dark Slate Obstacles), Header title inclusion (*GridWorld*), and Footer insertion targeting identification variables. Requested GitHub publishing procedures using user-specific remote git credentials.

**AI Action**:
- Configured CSS definitions.
- Authenticated via `.gitconfig` parsing the user's explicit email & username natively triggering generic `add`, `commit` pushing states into the target origin main tracking branch cleanly.

## Prompt 7: GitHub Pages Integration
**User**: Cited that the GitHub Page initialization yielded 404 responses and mistakenly observed the `.venv` was tracked natively in the GitHub tree. Requested retaining the default Flask operations locally but deploying a Static compatible iteration for web hosting.

**AI Action**:
- Cleaned the `git rm --cached` tree appending a formalized `.gitignore`.
- Authored a root `index.html` paired flawlessly with `gh_script.js`.
- Rewrote the entire Value Iteration architecture spanning nested mathematical array traversal & validation entirely via ES6 Vanilla JS, negating Flask API obligations supporting absolute static web functionality.
