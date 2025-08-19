class MathSpaceGame {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.currentProblem = null;
        this.currentNode = 0;
        this.visitedNodes = new Set([0]);
        
        this.mindMapData = this.generateMindMapStructure();
        
        this.initializeElements();
        this.createMindMap();
        this.generateNewProblem();
        this.createTwinkleStars();
        
        this.bindEvents();
    }
    
    initializeElements() {
        this.scoreElement = document.getElementById('score-value');
        this.levelElement = document.getElementById('level-value');
        this.problemElement = document.getElementById('problem');
        this.answerInput = document.getElementById('answer-input');
        this.submitButton = document.getElementById('submit-answer');
        this.feedbackElement = document.getElementById('feedback');
        this.mindmapSvg = document.getElementById('mindmap');
    }
    
    generateMindMapStructure() {
        const nodes = [
            { id: 0, x: 400, y: 300, label: "Aloitus", connections: [1, 2] },
            { id: 1, x: 200, y: 200, label: "Yhteenlasku", connections: [3, 4] },
            { id: 2, x: 600, y: 200, label: "Vähennyslasku", connections: [5, 6] },
            { id: 3, x: 100, y: 100, label: "Perus+", connections: [7] },
            { id: 4, x: 300, y: 100, label: "Isommat+", connections: [8] },
            { id: 5, x: 500, y: 100, label: "Perus-", connections: [9] },
            { id: 6, x: 700, y: 100, label: "Isommat-", connections: [10] },
            { id: 7, x: 50, y: 50, label: "Kertotaulu", connections: [11] },
            { id: 8, x: 250, y: 50, label: "Jakolasku", connections: [11] },
            { id: 9, x: 450, y: 50, label: "Murto-osat", connections: [12] },
            { id: 10, x: 650, y: 50, label: "Desimaalit", connections: [12] },
            { id: 11, x: 150, y: 20, label: "Matemestari", connections: [] },
            { id: 12, x: 550, y: 20, label: "Laskutaitaja", connections: [] }
        ];
        
        return nodes;
    }
    
    createMindMap() {
        const svg = this.mindmapSvg;
        svg.innerHTML = '';
        
        this.mindMapData.forEach(node => {
            node.connections.forEach(connectionId => {
                const targetNode = this.mindMapData.find(n => n.id === connectionId);
                if (targetNode) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', node.x);
                    line.setAttribute('y1', node.y);
                    line.setAttribute('x2', targetNode.x);
                    line.setAttribute('y2', targetNode.y);
                    line.classList.add('connection');
                    svg.appendChild(line);
                }
            });
        });
        
        this.mindMapData.forEach(node => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', 15);
            circle.classList.add('star');
            circle.setAttribute('data-node-id', node.id);
            
            if (this.visitedNodes.has(node.id)) {
                circle.classList.add('star-visited');
            } else if (node.id === this.currentNode) {
                circle.classList.add('star-current');
            } else {
                circle.classList.add('star-locked');
            }
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y + 25);
            text.classList.add('star-label');
            text.textContent = node.label;
            
            svg.appendChild(circle);
            svg.appendChild(text);
        });
    }
    
    generateNewProblem() {
        const currentNodeData = this.mindMapData.find(n => n.id === this.currentNode);
        let problem;
        
        switch(currentNodeData.label) {
            case "Aloitus":
            case "Yhteenlasku":
            case "Perus+":
                problem = this.generateAddition(this.level);
                break;
            case "Isommat+":
                problem = this.generateAddition(this.level + 2);
                break;
            case "Vähennyslasku":
            case "Perus-":
                problem = this.generateSubtraction(this.level);
                break;
            case "Isommat-":
                problem = this.generateSubtraction(this.level + 2);
                break;
            case "Kertotaulu":
                problem = this.generateMultiplication(this.level);
                break;
            case "Jakolasku":
                problem = this.generateDivision(this.level);
                break;
            case "Murto-osat":
                problem = this.generateFractions(this.level);
                break;
            case "Desimaalit":
                problem = this.generateDecimals(this.level);
                break;
            default:
                problem = this.generateAddition(this.level);
        }
        
        this.currentProblem = problem;
        this.problemElement.textContent = problem.question;
        this.answerInput.value = '';
        this.answerInput.focus();
    }
    
    generateAddition(difficulty) {
        const max = Math.min(10 + difficulty * 10, 100);
        const a = Math.floor(Math.random() * max) + 1;
        const b = Math.floor(Math.random() * max) + 1;
        return {
            question: `${a} + ${b} = ?`,
            answer: a + b
        };
    }
    
    generateSubtraction(difficulty) {
        const max = Math.min(10 + difficulty * 10, 100);
        const a = Math.floor(Math.random() * max) + 1;
        const b = Math.floor(Math.random() * a) + 1;
        return {
            question: `${a} - ${b} = ?`,
            answer: a - b
        };
    }
    
    generateMultiplication(difficulty) {
        const max = Math.min(5 + difficulty, 10);
        const a = Math.floor(Math.random() * max) + 1;
        const b = Math.floor(Math.random() * max) + 1;
        return {
            question: `${a} × ${b} = ?`,
            answer: a * b
        };
    }
    
    generateDivision(difficulty) {
        const max = Math.min(5 + difficulty, 10);
        const b = Math.floor(Math.random() * max) + 1;
        const answer = Math.floor(Math.random() * max) + 1;
        const a = b * answer;
        return {
            question: `${a} ÷ ${b} = ?`,
            answer: answer
        };
    }
    
    generateFractions(difficulty) {
        const denominator = Math.floor(Math.random() * 8) + 2;
        const numerator1 = Math.floor(Math.random() * denominator) + 1;
        const numerator2 = Math.floor(Math.random() * (denominator - numerator1)) + 1;
        return {
            question: `${numerator1}/${denominator} + ${numerator2}/${denominator} = ? (anna vastaus murto-osana, esim. 3/4)`,
            answer: `${numerator1 + numerator2}/${denominator}`
        };
    }
    
    generateDecimals(difficulty) {
        const a = (Math.random() * 10).toFixed(1);
        const b = (Math.random() * 10).toFixed(1);
        const result = (parseFloat(a) + parseFloat(b)).toFixed(1);
        return {
            question: `${a} + ${b} = ?`,
            answer: parseFloat(result)
        };
    }
    
    checkAnswer() {
        const userAnswer = this.answerInput.value.trim();
        const correct = this.isAnswerCorrect(userAnswer, this.currentProblem.answer);
        
        if (correct) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }
    
    isAnswerCorrect(userAnswer, correctAnswer) {
        if (typeof correctAnswer === 'string') {
            return userAnswer.toLowerCase() === correctAnswer.toLowerCase();
        }
        return parseFloat(userAnswer) === correctAnswer;
    }
    
    handleCorrectAnswer() {
        this.score += 10 * this.level;
        this.scoreElement.textContent = this.score;
        
        this.feedbackElement.textContent = "Oikein! 🎉 Loistavaa!";
        this.feedbackElement.className = "feedback-correct";
        
        this.moveToNextNode();
        
        setTimeout(() => {
            this.feedbackElement.textContent = "";
            this.feedbackElement.className = "";
            this.generateNewProblem();
        }, 1500);
    }
    
    handleWrongAnswer() {
        this.feedbackElement.textContent = "Väärin. Yritä uudelleen! 🤔";
        this.feedbackElement.className = "feedback-wrong";
        
        setTimeout(() => {
            this.feedbackElement.textContent = "";
            this.feedbackElement.className = "";
        }, 1500);
    }
    
    moveToNextNode() {
        const currentNodeData = this.mindMapData.find(n => n.id === this.currentNode);
        const availableConnections = currentNodeData.connections.filter(id => !this.visitedNodes.has(id));
        
        if (availableConnections.length > 0) {
            const nextNode = availableConnections[Math.floor(Math.random() * availableConnections.length)];
            this.currentNode = nextNode;
            this.visitedNodes.add(nextNode);
            
            if (this.visitedNodes.size % 3 === 0) {
                this.level++;
                this.levelElement.textContent = this.level;
            }
            
            this.createMindMap();
        } else {
            this.feedbackElement.textContent = "Onnittelut! Olet saavuttanut tämän polun lopun! 🏆";
            this.feedbackElement.className = "feedback-correct";
        }
    }
    
    createTwinkleStars() {
        const container = document.body;
        
        for (let i = 0; i < 30; i++) {
            const star = document.createElement('div');
            star.textContent = '✦';
            star.className = 'twinkle-star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            star.style.fontSize = (Math.random() * 10 + 10) + 'px';
            container.appendChild(star);
        }
    }
    
    bindEvents() {
        this.submitButton.addEventListener('click', () => this.checkAnswer());
        
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });
        
        this.answerInput.addEventListener('input', () => {
            this.feedbackElement.textContent = "";
            this.feedbackElement.className = "";
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MathSpaceGame();
});