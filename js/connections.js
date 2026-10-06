/**
 * Georgia's Connections - Game Logic Engine
 * Solves exactly one board themed around personal academic/tech landmarks.
 */

const puzzles = [
    {
        name: "Georgia's Connections",
        categories: [
            {
                title: "Oxford Locations",
                words: ["EXETER", "BODLEIAN", "RADCLIFFE", "SCHWARZMAN"],
                difficulty: 0 // Yellow
            },
            {
                title: "Google New York Offices",
                words: ["CHELSEA", "PIER 57", "ST. JOHN'S", "EIGHTH AVE"],
                difficulty: 1 // Green
            },
            {
                title: "Columbia Locations",
                words: ["LOW", "BUTLER", "HAMILTON", "HAVEMEYER"],
                difficulty: 2 // Blue
            },
            {
                title: "New York Landmarks",
                words: ["MCCARREN PARK", "HIGH LINE", "BROOKLYN BRIDGE", "PROSPECT PARK"],
                difficulty: 3 // Purple
            }
        ]
    }
];

class ConnectionsGame {
    constructor() {
        this.selectedWords = [];
        this.solvedCategories = [];
        this.mistakesRemaining = 4;
        this.boardWords = [];      // remaining words on screen
        this.guessHistory = [];    // array of sets of sorted guessed words
        this.emojiGrid = [];       // visual share grid tracker
        
        this.elements = {};
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.loadPuzzle();
    }

    cacheElements() {
        this.elements = {
            solvedContainer: document.getElementById('solved-categories'),
            gridContainer: document.getElementById('connections-grid'),
            gameMessage: document.getElementById('game-message'),
            mistakeDots: document.getElementById('mistake-dots'),
            
            // Buttons
            btnShuffle: document.getElementById('btn-shuffle'),
            btnDeselect: document.getElementById('btn-deselect'),
            btnSubmit: document.getElementById('btn-submit'),
            
            // Modal Elements
            modalGameOver: document.getElementById('game-over-overlay'),
            modalTitle: document.getElementById('game-over-title'),
            modalSubtitle: document.getElementById('game-over-subtitle'),
            emojiGridDisplay: document.getElementById('emoji-result-grid'),
            btnShare: document.getElementById('btn-share-results'),
            btnRestart: document.getElementById('btn-restart-game'),
            btnCloseModal: document.getElementById('btn-close-game-modal')
        };
    }

    setupEventListeners() {
        // Board buttons
        this.elements.btnShuffle.addEventListener('click', () => this.shuffleBoard());
        this.elements.btnDeselect.addEventListener('click', () => this.deselectAll());
        this.elements.btnSubmit.addEventListener('click', () => this.submitSelection());

        // Modal buttons
        this.elements.btnShare.addEventListener('click', () => this.copyResultsToClipboard());
        this.elements.btnRestart.addEventListener('click', () => {
            this.elements.modalGameOver.classList.remove('open');
            this.loadPuzzle();
        });
        this.elements.btnCloseModal.addEventListener('click', () => {
            this.elements.modalGameOver.classList.remove('open');
        });
        
        // Close modal on overlay click
        this.elements.modalGameOver.addEventListener('click', (e) => {
            if (e.target === this.elements.modalGameOver) {
                this.elements.modalGameOver.classList.remove('open');
            }
        });
    }

    loadPuzzle() {
        this.selectedWords = [];
        this.solvedCategories = [];
        this.mistakesRemaining = 4;
        this.guessHistory = [];
        this.emojiGrid = [];

        // Compile words list from categories
        const puzzle = puzzles[0];
        this.boardWords = [];
        puzzle.categories.forEach((cat, catIdx) => {
            cat.words.forEach(word => {
                this.boardWords.push({
                    text: word,
                    categoryIdx: catIdx,
                    difficulty: cat.difficulty
                });
            });
        });

        // Shuffle board on fresh load
        this.shuffle(this.boardWords);

        // Render UI
        this.elements.solvedContainer.innerHTML = "";
        this.renderBoard();
        this.renderMistakes();
        
        this.elements.gameMessage.textContent = "Select 4 cards to start!";
        this.elements.gameMessage.classList.remove('highlight');
        
        this.elements.btnSubmit.disabled = true;
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    shuffleBoard() {
        if (this.boardWords.length === 0) return;
        
        // Animate out cards
        const cards = this.elements.gridContainer.querySelectorAll('.connection-card');
        cards.forEach(card => card.style.transform = 'scale(0.8)');
        
        setTimeout(() => {
            this.shuffle(this.boardWords);
            this.renderBoard();
        }, 150);
    }

    deselectAll() {
        this.selectedWords = [];
        const cards = this.elements.gridContainer.querySelectorAll('.connection-card');
        cards.forEach(card => card.classList.remove('selected'));
        this.elements.btnSubmit.disabled = true;
        this.elements.gameMessage.textContent = "Select 4 cards.";
        this.elements.gameMessage.classList.remove('highlight');
    }

    renderBoard() {
        this.elements.gridContainer.innerHTML = "";
        
        this.boardWords.forEach((wordObj) => {
            const btn = document.createElement('button');
            btn.className = "connection-card";
            btn.textContent = wordObj.text;
            
            // Re-apply select highlights if necessary
            if (this.selectedWords.includes(wordObj.text)) {
                btn.classList.add('selected');
            }

            btn.addEventListener('click', () => this.toggleCardSelection(btn, wordObj.text));
            this.elements.gridContainer.appendChild(btn);
        });
    }

    renderMistakes() {
        const dots = this.elements.mistakeDots.querySelectorAll('.dot');
        dots.forEach((dot, idx) => {
            // Mistakes remaining are active dots
            if (idx < this.mistakesRemaining) {
                dot.className = "dot active";
            } else {
                dot.className = "dot lost";
            }
        });
    }

    toggleCardSelection(btn, wordText) {
        const isSelected = this.selectedWords.includes(wordText);

        if (isSelected) {
            // Deselect
            this.selectedWords = this.selectedWords.filter(w => w !== wordText);
            btn.classList.remove('selected');
        } else {
            // Select (limit to 4)
            if (this.selectedWords.length >= 4) return;
            
            this.selectedWords.push(wordText);
            btn.classList.add('selected');
        }

        // Enable or disable submit
        const count = this.selectedWords.length;
        this.elements.btnSubmit.disabled = (count !== 4);
        
        if (count > 0 && count < 4) {
            this.elements.gameMessage.textContent = `${count} selected (need 4)`;
            this.elements.gameMessage.classList.remove('highlight');
        } else if (count === 4) {
            this.elements.gameMessage.textContent = "Ready to submit!";
            this.elements.gameMessage.classList.add('highlight');
        } else {
            this.elements.gameMessage.textContent = "Select 4 cards.";
            this.elements.gameMessage.classList.remove('highlight');
        }
    }

    submitSelection() {
        if (this.selectedWords.length !== 4) return;

        // Sort guessed words to create a unique history key
        const sortedGuess = [...this.selectedWords].sort();
        const guessKey = sortedGuess.join('|');

        if (this.guessHistory.includes(guessKey)) {
            this.elements.gameMessage.textContent = "Already guessed this combination!";
            this.elements.gameMessage.classList.add('highlight');
            return;
        }

        // Find active puzzle categories
        const puzzle = puzzles[0];
        
        // Find category indices for each selected word
        const selectedWordObjects = this.boardWords.filter(w => this.selectedWords.includes(w.text));
        const categoryCounts = {};
        
        selectedWordObjects.forEach(w => {
            categoryCounts[w.categoryIdx] = (categoryCounts[w.categoryIdx] || 0) + 1;
        });

        // Record guess in history
        this.guessHistory.push(guessKey);

        // Add guess results to emoji sharing grid
        this.recordEmojiGuess(selectedWordObjects);

        // Check for match: one category has all 4 words
        const matchedCategoryIndexStr = Object.keys(categoryCounts).find(key => categoryCounts[key] === 4);
        
        if (matchedCategoryIndexStr !== undefined) {
            // Success!
            const matchedCategoryIdx = parseInt(matchedCategoryIndexStr);
            const matchedCategory = puzzle.categories[matchedCategoryIdx];
            
            // Render solved banner row
            this.renderSolvedRow(matchedCategory);

            // Remove solved words from board arrays
            this.boardWords = this.boardWords.filter(w => !this.selectedWords.includes(w.text));
            
            // Clear selected buffer
            this.selectedWords = [];

            // Re-render remaining grid
            this.renderBoard();
            this.elements.btnSubmit.disabled = true;

            // Track category count
            this.solvedCategories.push(matchedCategoryIdx);

            if (this.solvedCategories.length === 4) {
                // Game Won!
                this.elements.gameMessage.textContent = "Incredible! You solved the puzzle!";
                setTimeout(() => this.endGame(true), 800);
            } else {
                this.elements.gameMessage.textContent = "Awesome match!";
                this.elements.gameMessage.classList.remove('highlight');
            }
        } else {
            // Fail! Shake cards
            this.shakeSelectedCards();

            // Subtract mistake
            this.mistakesRemaining--;
            this.renderMistakes();

            // Check if "One away" (one category has 3 correct words)
            const oneAwayMatch = Object.values(categoryCounts).some(count => count === 3);
            
            if (oneAwayMatch) {
                this.elements.gameMessage.textContent = "One away...";
                this.elements.gameMessage.classList.add('highlight');
            } else {
                this.elements.gameMessage.textContent = "Not a connection!";
                this.elements.gameMessage.classList.remove('highlight');
            }

            if (this.mistakesRemaining === 0) {
                // Game Over!
                setTimeout(() => this.endGame(false), 800);
            }
        }
    }

    shakeSelectedCards() {
        const selectedElements = this.elements.gridContainer.querySelectorAll('.connection-card.selected');
        selectedElements.forEach(el => {
            el.classList.add('shake');
            setTimeout(() => el.classList.remove('shake'), 350);
        });
    }

    renderSolvedRow(cat) {
        const row = document.createElement('div');
        row.className = `solved-row difficulty-${cat.difficulty}`;
        
        row.innerHTML = `
            <div class="solved-row-title">${cat.title}</div>
            <div class="solved-row-words">${cat.words.join(', ')}</div>
        `;
        
        this.elements.solvedContainer.appendChild(row);
    }

    recordEmojiGuess(wordObjects) {
        // Map word objects back to difficulty difficulty-0,1,2,3 -> Emojis
        const emojiMap = {
            0: "🟨",
            1: "🟩",
            2: "🟦",
            3: "🟪"
        };
        
        // Arrange guess by input order to show exactly what they selected
        const rowEmojis = wordObjects.map(w => emojiMap[w.difficulty]).join("");
        this.emojiGrid.push(rowEmojis);
    }

    endGame(isWin) {
        const puzzle = puzzles[0];
        
        if (isWin) {
            this.elements.modalTitle.textContent = "Incredible! You Solved It!";
            this.elements.modalTitle.style.color = "var(--accent)";
        } else {
            this.elements.modalTitle.textContent = "Game Over!";
            this.elements.modalTitle.style.color = "var(--text-light)";
        }

        this.elements.modalSubtitle.textContent = puzzle.name;
        
        // Draw emoji grid
        this.elements.emojiGridDisplay.innerHTML = this.emojiGrid.join("\n");
        
        // Show Modal
        this.elements.modalGameOver.classList.add('open');
    }

    copyResultsToClipboard() {
        const puzzleName = puzzles[0].name;
        const gridText = this.emojiGrid.join("\n");
        
        const shareText = `Georgia's Connections\n${puzzleName}\n\n${gridText}\n\nPlay at georgiaessig.com`;
        
        navigator.clipboard.writeText(shareText).then(() => {
            const originalText = this.elements.btnShare.innerHTML;
            this.elements.btnShare.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            setTimeout(() => {
                this.elements.btnShare.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error("Clipboard copy failed", err);
            alert("Could not copy automatically. You can copy the grid from the screen!");
        });
    }
}

// Attach to window scope
window.Connections = new ConnectionsGame();
