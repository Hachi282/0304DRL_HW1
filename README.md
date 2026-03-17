# GridWorld RL Project (0304DRL_HW1)

This project is a web-based GridWorld environment designed for Reinforcement Learning Homework 1. It implements a grid interface where users can interactively configure the environment and subsequently run Iterative Policy Evaluation (Value Iteration) to find the Optimal Value Matrix, Policy Matrix, and the Optimal Path.

## 🌟 Live Demo
Play with the fully client-side JavaScript version on GitHub Pages:
**[GridWorld Online Demo](https://hachi282.github.io/0304DRL_HW1/)**

## ✨ Features
1. **Interactive UI**: Generate an $n \times n$ ($5 \le n \le 9$) grid.
2. **Dynamic Scaling**: The grid and font sizes dynamically adapt to fit $9\times9$ bounds within the screen comfortably without vertical scrolling.
3. **Environment Setup**: 
   - 1st Click: Define the **Start** state (Green).
   - 2nd Click: Define the **End/Goal** state (Red).
   - Remaining Clicks: Place up to $n-2$ **Obstacles** (Dark Slate).
4. **Configurable RL Parameters**:
   - **Discount ($\gamma$)**: Controls the importance of future rewards.
   - **Step Reward**: Standard penalty for each movement.
   - **Goal Reward**: The ultimate reward received upon entering the End state.
5. **Dual Engine Support**:
   - **Python (Flask)**: The `app.py` server processes the Value Iteration engine locally using pure standard Python without dependencies like NumPy!
   - **JavaScript**: A 100% JS port inside `gh_script.js` directly supports execution natively on GitHub Pages with identical logic.
6. **Optimal Path Highlighting**: Clearly demarcates the most optimal trajectory (Yellow) traversing from Start to End derived automatically from the output Value Matrix.

## 🚀 How to Run Locally (Flask Server)
If you wish to run the backend natively using Python's Value Iteration implementation:

1. Clone the repository.
2. Run the Flask web app:
```bash
python app.py
```
3. Open `http://127.0.0.1:5000` in your web browser.

## 🤖 Development Record
Throughout the development of this project, I collaborated with an AI Pair Programmer (Antigravity). We tackled complex Value Iteration logic, handled Python/JS Type constraints, and iterated upon sophisticated CSS Grid scaling.

For the full transcript of this development conversation, please refer to the attached document:
* [Conversation Record / Chat History](conversation_record.md)

---
**Author**: Hsin Yu Jou 7114029031
