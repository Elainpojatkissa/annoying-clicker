let score = 0.0;
let pointsPerClick = 1.0;
let totalClicks = 0;
const achievementsUnlocked = new Set();
let isLagging = false; // To control game input during simulated lag
let annoyanceLevel = 0; // NEW: Initialize annoyance level
const gameGoal = 100000.0; // The BIG goal for YouTubers!

// DOM Elements
const body = document.body;
const scoreDisplay = document.getElementById('score-display');
const clickButton = document.getElementById('click-button');
const upgradeButton = document.getElementById('upgrade-button');
const popupArea = document.getElementById('popup-area');
const fakeProgressBar = document.getElementById('fake-progress-bar');
const goalDisplay = document.getElementById('goal-display'); // Get the new goal display element

// Audio elements
const errorSound = document.getElementById('error-sound');
const buzzSound = document.getElementById('buzz-sound');
const discordPingSound = document.getElementById('discord-ping-sound');
const allSounds = [errorSound, buzzSound, discordPingSound].filter(s => s); // Filter out null if not found

// Store original styles for reversion
const originalScoreDisplayFont = scoreDisplay.style.fontFamily;
const originalGoalDisplayFont = goalDisplay.style.fontFamily;
const originalScoreDisplayColor = scoreDisplay.style.color;
const originalGoalDisplayColor = goalDisplay.style.color;

// --- Core Game Functions ---

function updateScoreDisplay() {
    scoreDisplay.textContent = `Score: ${score.toFixed(1)}`;
}

// NEW: Function to check and escalate annoyance level
function checkAnnoyanceLevel() {
    if (score >= gameGoal) {
        if (!achievementsUnlocked.has("Game Won")) {
            achievementsUnlocked.add("Game Won");
            createPopup(`CONGRATULATIONS! You reached ${gameGoal.toLocaleString()} points! You are truly a legendary glutton for punishment.`, "GAME COMPLETE!");
            clickButton.disabled = true;
            upgradeButton.disabled = true;
            goalDisplay.textContent = "GAME OVER! YOU WON! (Finally...)";
            goalDisplay.style.color = 'gold'; // Make it stand out!
            // Stop all annoyance loops or set probabilities to 0
            // You might want to stop specific annoying intervals here
        }
        return; // Game won, stop escalating annoyance
    }

    let newLevel = 0;
    if (score >= 500) newLevel = 1; // Mild: More popups, button occasionally moves, minor audio.
    if (score >= 2000) newLevel = 2; // Medium: Upgrade downsides, flickering UI, typo popups, cursor changes.
    if (score >= 7000) newLevel = 3; // High: CAPTCHAs, visual glitches, lag, text distortions.
    if (score >= 25000) newLevel = 4; // Extreme: Fake crashes, body shakes, more intense audio, false inputs.
    if (score >= 75000) newLevel = 5; // MAXIMUM OVERDRIVE: All annoyances at peak, invisible button.

    if (newLevel > annoyanceLevel) {
        annoyanceLevel = newLevel;
        const messages = [
            "A faint buzzing begins...", // Level 1
            "The chaos machine whirs to life!", // Level 2
            "Prepare for true despair. Annoyance Level 3 reached!", // Level 3
            "The torment is almost complete! Annoyance Level 4!", // Level 4
            "THERE IS NO ESCAPE. MAX ANNOYANCE!", // Level 5
        ];
        if (messages[annoyanceLevel - 1]) { // Ensure message exists for the level
            createPopup(`Annoyance Level ${annoyanceLevel}: ${messages[annoyanceLevel - 1]}`, "Annoyance Escalated!");
        }
    }
}

function createPopup(message, title = "Just Another Useless Popup") {
    const popup = document.createElement('div');
    popup.className = 'popup';

    // Randomly introduce a typo to the message based on annoyance level
    if (annoyanceLevel >= 2 && Math.random() < (0.2 + annoyanceLevel * 0.05)) { // Starts at 20% + 5% per level (max 45%)
        const words = message.split(' ');
        if (words.length > 0) {
            const wordToTypos = words[Math.floor(Math.random() * words.length)];
            if (wordToTypos.length > 2) {
                let typoWord = Array.from(wordToTypos); // Convert to array to swap
                const idx1 = Math.floor(Math.random() * typoWord.length);
                let idx2 = Math.floor(Math.random() * typoWord.length);
                while(idx1 === idx2) { // Ensure different indices
                    idx2 = Math.floor(Math.random() * typoWord.length);
                }
                [typoWord[idx1], typoWord[idx2]] = [typoWord[idx2], typoWord[idx1]]; // Swap letters
                words[words.indexOf(wordToTypos)] = typoWord.join(''); // Put typo'd word back
            }
        }
        message = words.join(' ');
    }

    popup.innerHTML = `<h3>${title}</h3><p>${message}</p>`;
    
    // Close button logic: disappears at higher annoyance levels or becomes harder
    if (annoyanceLevel < 3 || (annoyanceLevel >= 3 && Math.random() < (0.5 - (annoyanceLevel * 0.1)))) { // Becomes less likely at high levels
        const closeButton = document.createElement('button');
        closeButton.textContent = "Click to Close";
        closeButton.onclick = () => popup.remove();
        popup.appendChild(closeButton);
    } else {
        // Force user to find the browser's 'X' or wait
        const waitingMessage = document.createElement('p');
        waitingMessage.textContent = "This popup will vanish... eventually. Or maybe not.";
        waitingMessage.style.fontSize = '0.8em';
        waitingMessage.style.color = '#777';
        popup.appendChild(waitingMessage);
        // Auto-remove popups with no close button after a longer, variable time
        setTimeout(() => popup.remove(), (Math.random() * 5000) + 5000 + (annoyanceLevel * 1000)); // 5-10s + up to 5s more
    }

    // Annoying random position
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    // Estimate popup size for positioning
    const popupWidth = Math.min(400, window.innerWidth * 0.8);
    const popupHeight = 150; 
    
    popup.style.right = `${Math.random() * (screenWidth - popupWidth - 50)}px`;
    popup.style.top = `${Math.random() * (screenHeight - popupHeight - 100)}px`;

    popupArea.appendChild(popup);
}

function clickHandler() {
    if (isLagging || achievementsUnlocked.has("Game Won")) {
        // Don't register clicks if lagging or game is won
        if (isLagging) createPopup("Still lagging... patience, padawan.", "Server Response Delayed");
        return; 
    }

    // Introduce fake input delay
    const delayDuration = (annoyanceLevel >= 2) ? (Math.random() * 100 + annoyanceLevel * 50) : 0; // Up to 500ms delay at max
    setTimeout(() => {
        score += pointsPerClick;
        totalClicks++;
        updateScoreDisplay();
        
        checkAchievements();
        checkAnnoyanceLevel(); // Check annoyance level on every click

        // Annoyance functions probabilities now scale with annoyance_level
        randomAnnoyance();
        randomButtonMove(); // Always call, but internal logic decides if it moves
        randomButtonTextChange(); // Always call, but internal logic decides if it changes
        
        // Annoyances that activate on click or higher levels
        if (annoyanceLevel >= 1) randomAnnoyingSound();
        if (annoyanceLevel >= 2) toggleCursor();
        if (annoyanceLevel >= 3) randomTextTransform();
        if (annoyanceLevel >= 4) {
            falseInput();
            alterButtonSize();
        }
        if (annoyanceLevel >= 5) invisibleClickTarget();

        if (annoyanceLevel >= 3) {
            if (Math.random() < (0.03 + annoyanceLevel * 0.01)) { // CAPTCHA becomes more likely at higher levels
                showCaptcha();
            }
        }
    }, delayDuration);
}

function upgradeHandler() {
    if (isLagging || achievementsUnlocked.has("Game Won")) {
        // Don't allow upgrades if lagging or game is won
        if (isLagging) createPopup("Can't upgrade while the network is unstable!", "Error");
        return;
    }

    if (score >= 10) {
        score -= 10;

        // Chance of doing nothing: 20% base + 5% per annoyance level (max 45%)
        if (Math.random() < (0.2 + annoyanceLevel * 0.05)) {
            createPopup("Oops. That upgrade did nothing. Again.", "Wasted Effort");
        } 
        // Chance to reduce points: 10% base + 5% per annoyance level (max 35%)
        else if (Math.random() < (0.1 + annoyanceLevel * 0.05)) {
            const decrease = parseFloat((Math.random() * (0.05 - 0.01) + 0.01).toFixed(2)) * (1 + annoyanceLevel * 0.1); // Larger decrease
            pointsPerClick = Math.max(1.0, pointsPerClick - decrease);
            createPopup(`Oh dear. Your points per click just decreased by ${decrease.toFixed(2)}. Unlucky!`, "Degradation!");
        } 
        // Chance to deduct score: 15% base + 7% per annoyance level (max 50%)
        else if (Math.random() < (0.15 + annoyanceLevel * 0.07)) {
            const deduction = parseFloat((Math.random() * (5.0 - 1.0) + 1.0).toFixed(1)) * (1 + annoyanceLevel * 0.2); // Larger deduction
            score = Math.max(0.0, score - deduction);
            createPopup(`A wild bug appeared! You lost ${deduction.toFixed(1)} points.`, "Bug Attack!");
        } else {
            const increase = parseFloat((Math.random() * (0.09 - 0.01) + 0.01).toFixed(2)) * (1 + annoyanceLevel * 0.02); // Slightly better increase
            pointsPerClick += increase;
            createPopup(`Upgrade added +${increase.toFixed(2)} per click. Feel that boost?`, "Upgrade Success (Maybe)");
        }
        updateScoreDisplay();
        checkAchievements();
    } else {
        upgradeButton.textContent = "Math says: not enough.";
        setTimeout(() => upgradeButton.textContent = "Upgrade (Random +, Cost: 10)", 2000); // Reset text
    }
}

function checkAchievements() {
    let i = 5;
    while (i <= parseInt(score)) {
        const name = `Achievement: ${i} Points`;
        if (!achievementsUnlocked.has(name)) {
            achievementsUnlocked.add(name);
            createPopup(`You unlocked: ${name}`, "Achievement Unlocked!");
        }
        i += 5;
    }

    if (pointsPerClick > 1.0 && !achievementsUnlocked.has("Upgrade Purchased")) {
        achievementsUnlocked.add("Upgrade Purchased");
        createPopup("You unlocked: Upgrade Purchased", "Achievement Unlocked!");
    }
}

// --- Annoyance Features (Scaled by annoyanceLevel) ---

// Visual Annoyances
function randomAnnoyance() {
    const annoyMessages = [
        "Still here? Amazing.", "Are you enjoying this? Because we are.",
        "Click. Click. Click. That's all you do.", "Just when you thought you were making progress...",
        "Another second passes. And another.", "Your dedication is... concerning.",
        "You know, there are other things to do.", "Error 404: Fun not found.",
        "Did you know? Cats sleep 16 hours a day!", "Keep clicking! The far side needs you!",
        "Random fact: The longest recorded clicker game session lasted 24 hours.",
        "Annoyance incoming! Click faster!",
        "Your focus wavers, just like your sanity.", "A watched pot never clicks enough.",
        "You're doing great! (No, not really.)", "The algorithms predict you'll quit soon.",
        "Is this what you do with your life now?", "Don't forget to hydrate. You'll need it for this torture."
    ];
    // Probability scales with annoyance_level: Base 5% + 5% per level (max 30% at level 5)
    if (Math.random() < (0.05 + annoyanceLevel * 0.05)) {
        createPopup(annoyMessages[Math.floor(Math.random() * annoyMessages.length)], "Random Interruption");
    }
}

function randomButtonMove() {
    // Only from annoyance level 1. Chance: 10% base + 5% per level (max 35%)
    if (annoyanceLevel >= 1 && Math.random() < (0.1 + annoyanceLevel * 0.05)) {
        const gameContainer = document.querySelector('.game-container');
        const containerRect = gameContainer.getBoundingClientRect();
        
        // Calculate new position relative to the container
        const newX = Math.random() * (containerRect.width - clickButton.offsetWidth - 100);
        const newY = Math.random() * (containerRect.height - clickButton.offsetHeight - 100);

        clickButton.style.position = 'absolute';
        clickButton.style.left = `${newX}px`;
        clickButton.style.top = `${newY}px`;
        createPopup("The button has moved! Try to catch it!", "Button Relocation!");

        // At higher levels, the button might stay "lost" longer
        const resetDelay = (annoyanceLevel >= 4) ? (Math.random() * 5000 + 5000) : 2000; // 5-10s at high levels, else 2s
        setTimeout(() => {
            clickButton.style.position = 'static'; // Reset to normal flow
            clickButton.style.left = ''; // Clear inline styles
            clickButton.style.top = ''; // Clear inline styles
        }, resetDelay);
    }
}

function randomButtonTextChange() {
    // Only from annoyance level 1. Chance: 5% base + 4% per level (max 25%)
    if (annoyanceLevel >= 1 && Math.random() < (0.05 + annoyanceLevel * 0.04)) {
        const annoyingTexts = [
            "Don't Click Me!", "Are You Sure?", "Click at Your Peril!",
            "Error: Button Not Found", "Why Are You Still Clicking?",
            "Press 'X' to Pay Respects", "You can do better... just kidding.",
            "Click. Fail. Repeat.", "Don't read this.",
            "The other button is better.", "Access Denied (to fun).",
            "This action is not permitted.", "Are you even trying?",
            "For science. (Not really)."
        ];
        clickButton.textContent = annoyingTexts[Math.floor(Math.random() * annoyingTexts.length)];
    } else {
        clickButton.textContent = "Click Me!"; // Reset to original text
    }
}

function updateFakeProgress() {
    let currentValue = parseFloat(fakeProgressBar.style.width);
    if (isNaN(currentValue)) currentValue = 0; // Initialize if not set

    let newValue;
    // More erratic movement, less likely to go up at higher levels
    if (Math.random() < (0.6 - (annoyanceLevel * 0.05))) {
        newValue = Math.min(100, currentValue + Math.floor(Math.random() * 16) + 5); // 5-20
    } else {
        newValue = Math.max(0, currentValue - Math.floor(Math.random() * 21) - 10 - (annoyanceLevel * 5)); // 10-30, larger drops
    }
    
    fakeProgressBar.style.width = `${newValue}%`;
    const delay = Math.floor(Math.random() * 1501) + 500 - (annoyanceLevel * 100); // Faster updates
    setTimeout(updateFakeProgress, Math.max(100, delay)); // Minimum 100ms delay
}

function flickerUIElements() {
    // Only from annoyance level 2. Chance: 2% base + 2% per level (max 12%)
    if (annoyanceLevel >= 2 && Math.random() < (0.02 + annoyanceLevel * 0.02)) {
        const elements = [scoreDisplay, clickButton, upgradeButton, goalDisplay]; // Include goalDisplay
        const elementToFlicker = elements[Math.floor(Math.random() * elements.length)];
        
        elementToFlicker.style.visibility = 'hidden'; // Hide
        setTimeout(() => {
            elementToFlicker.style.visibility = 'visible'; // Show
        }, Math.floor(Math.random() * 401) + 100); // 100-500ms
    }
    const delay = Math.floor(Math.random() * 2501) + 500 - (annoyanceLevel * 200); // Faster checks
    setTimeout(flickerUIElements, Math.max(100, delay)); // Minimum 100ms delay
}

function showCaptcha() {
    // Only from annoyance level 3. Chance: 3% base + 1% per level
    if (annoyanceLevel < 3 || Math.random() >= (0.03 + annoyanceLevel * 0.01)) {
        return;
    }

    const captchaOverlay = document.createElement('div');
    captchaOverlay.className = 'captcha-overlay';
    captchaOverlay.innerHTML = `
        <div class="captcha-box">
            <h3 id="captcha-text">Please type 'I hate this game' to continue:</h3>
            <input type="text" id="captcha-input" style="padding: 8px; font-size: 1em;">
            <button id="captcha-submit" style="margin-top: 15px;">Submit</button>
        </div>
    `;
    document.body.appendChild(captchaOverlay);

    const captchaInput = document.getElementById('captcha-input');
    const captchaSubmit = document.getElementById('captcha-submit');
    const captchaText = document.getElementById('captcha-text');

    isLagging = true; // Disable game interaction during CAPTCHA
    clickButton.disabled = true;
    upgradeButton.disabled = true;

    const checkCaptcha = () => {
        if (captchaInput.value === "I hate this game") {
            captchaOverlay.remove();
            createPopup("Verification successful. Now continue suffering!", "Captcha Solved");
            isLagging = false;
            clickButton.disabled = false;
            upgradeButton.disabled = false;
        } else {
            captchaText.textContent = "Incorrect. Try again. (Hint: 'I hate this game')";
            captchaInput.value = '';
            captchaInput.focus();
        }
    };

    captchaSubmit.addEventListener('click', checkCaptcha);
    captchaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkCaptcha();
    });
    captchaInput.focus();
}

function visualGlitch() {
    // Only from annoyance level 3. Chance: 2% base + 1% per level
    if (annoyanceLevel >= 3 && Math.random() < (0.02 + annoyanceLevel * 0.01)) {
        const glitchFlash = document.createElement('div');
        glitchFlash.className = 'glitch-flash';
        document.body.appendChild(glitchFlash);
        setTimeout(() => glitchFlash.remove(), 50); // Shorter, more jarring flashes

        if (Math.random() < (0.5 + annoyanceLevel * 0.1)) { // More likely to affect label at higher levels
            const originalColor = scoreDisplay.style.color; // Store original color
            const colors = ["red", "blue", "green", "purple", "yellow", "orange"];
            scoreDisplay.style.color = colors[Math.floor(Math.random() * colors.length)];
            setTimeout(() => scoreDisplay.style.color = originalColor || '#333', 100); // Brief color change
        }
    }
    const delay = Math.floor(Math.random() * 5001) + 2000 - (annoyanceLevel * 300); // Faster checks
    setTimeout(visualGlitch, Math.max(200, delay)); // Minimum 200ms delay
}

function simulateLag() {
    // Only from annoyance level 3. Chance: 1% base + 1% per level
    if (annoyanceLevel >= 3 && Math.random() < (0.01 + annoyanceLevel * 0.01)) {
        createPopup("Network Lag Detected... just kidding, it's us.", "Simulation");
        isLagging = true;
        clickButton.disabled = true;
        upgradeButton.disabled = true;
        
        const lagDuration = Math.floor(Math.random() * 2001) + 1000 + (annoyanceLevel * 500); // Longer lag
        setTimeout(() => {
            isLagging = false;
            clickButton.disabled = false;
            upgradeButton.disabled = false;
            createPopup("Lag resolved! For now...", "Lag Cleared");
        }, lagDuration);
    }
    const delay = Math.floor(Math.random() * 10001) + 5000 - (annoyanceLevel * 500); // Faster checks
    setTimeout(simulateLag, Math.max(1000, delay)); // Minimum 1000ms delay
}

function fakeCrashMessage() {
    // Only from annoyance level 4. Chance: 0.5% base + 0.2% per level
    if (annoyanceLevel >= 4 && Math.random() < (0.005 + annoyanceLevel * 0.002)) {
        const crashPopup = document.createElement('div');
        crashPopup.className = 'popup'; // Reuse popup styling
        crashPopup.style.backgroundColor = 'black';
        crashPopup.style.border = '3px solid red';
        crashPopup.style.color = 'red';
        crashPopup.style.fontWeight = 'bold';
        crashPopup.style.fontSize = '1.5em';
        crashPopup.style.textAlign = 'center';
        crashPopup.style.width = '60%';
        crashPopup.style.height = '40%';
        crashPopup.style.display = 'flex';
        crashPopup.style.flexDirection = 'column';
        crashPopup.style.justifyContent = 'center';
        crashPopup.style.alignItems = 'center';
        crashPopup.style.left = '50%';
        crashPopup.style.top = '50%';
        crashPopup.style.transform = 'translate(-50%, -50%)'; // Center it
        crashPopup.innerHTML = `
            <p>FATAL EXCEPTION: Game State Corrupted.</p>
            <p>DO NOT RESTART. Or do. We don't care.</p>
        `;
        document.body.appendChild(crashPopup);

        isLagging = true; // Disable input during "crash"
        clickButton.disabled = true;
        upgradeButton.disabled = true;

        const crashDuration = Math.floor(Math.random() * 4001) + 3000 + (annoyanceLevel * 1000); // Longer crash
        setTimeout(() => {
            crashPopup.remove();
            isLagging = false;
            clickButton.disabled = false;
            upgradeButton.disabled = false;
        }, crashDuration);
    }
    const delay = Math.floor(Math.random() * 60001) + 30000 - (annoyanceLevel * 5000); // More frequent
    setTimeout(fakeCrashMessage, Math.max(10000, delay)); // Minimum 10 seconds delay
}

// NEW ANNOYANCES START HERE

// Audio Annoyances
function playAnnoyingSound(soundElement) {
    if (soundElement && annoyanceLevel >= 1 && Math.random() < (0.05 + annoyanceLevel * 0.03)) { // Starts at 5%, up to 20%
        try {
            soundElement.currentTime = 0; // Rewind to start
            soundElement.play().catch(e => console.error("Audio playback error:", e)); // Catch potential autoplay policy errors
        } catch (e) {
            console.error("Could not play sound:", e);
        }
    }
}

function randomAnnoyingSound() {
    if (allSounds.length === 0) return; // No sounds loaded
    const randomSound = allSounds[Math.floor(Math.random() * allSounds.length)];
    playAnnoyingSound(randomSound);
}

function randomVolumeSpike() {
    if (annoyanceLevel >= 4 && Math.random() < (0.01 + annoyanceLevel * 0.005)) { // Low chance, but increases
        const originalVolume = allSounds[0] ? allSounds[0].volume : 0.5; // Assume one sound for volume control
        const spikeDuration = Math.random() * 500 + 200; // 200-700ms
        const spikeVolume = Math.min(1.0, originalVolume + Math.random() * 0.5 + 0.2); // Original + 0.2-0.7

        allSounds.forEach(s => s.volume = spikeVolume);
        createPopup("WHOOPS! Volume Spike!", "EAR DRUM DAMAGE");
        setTimeout(() => {
            allSounds.forEach(s => s.volume = originalVolume);
        }, spikeDuration);
    }
}


// Visual Distortions
function applyVisualDistortion() {
    // Only from annoyance level 3. Chance: 1% base + 0.5% per level
    if (annoyanceLevel >= 3 && Math.random() < (0.01 + annoyanceLevel * 0.005)) {
        const distortions = [
            'blur(3px)', 'invert(100%)', 'hue-rotate(180deg)', 'grayscale(100%)', 'sepia(100%)'
        ];
        const randomDistortion = distortions[Math.floor(Math.random() * distortions.length)];
        const duration = Math.random() * 500 + 200; // 200-700ms

        body.style.filter = randomDistortion;
        createPopup(`Visual Anomaly: ${randomDistortion}`, "Screen Glitch");
        setTimeout(() => {
            body.style.filter = 'none'; // Revert
        }, duration);
    }
}

function shakeEffect() {
    // Only from annoyance level 4. Chance: 0.5% base + 0.2% per level
    if (annoyanceLevel >= 4 && Math.random() < (0.005 + annoyanceLevel * 0.002)) {
        body.classList.add('body-shake');
        createPopup("Earthquake detected! Or is it just your screen?", "SHAKY!");
        setTimeout(() => {
            body.classList.remove('body-shake');
        }, 500); // Shake for half a second
    }
}

function randomTextTransform() {
    // Only from annoyance level 3. Chance: 2% base + 1% per level
    if (annoyanceLevel >= 3 && Math.random() < (0.02 + annoyanceLevel * 0.01)) {
        const targetElement = Math.random() < 0.5 ? scoreDisplay : goalDisplay;
        const transforms = [
            `skewX(${Math.random() * 20 - 10}deg)`, // -10 to 10 deg
            `rotate(${Math.random() * 10 - 5}deg)`, // -5 to 5 deg
            `scale(${Math.random() * 0.3 + 0.8})` // 0.8 to 1.1 scale
        ];
        const randomTransform = transforms[Math.floor(Math.random() * transforms.length)];
        const originalTransform = targetElement.style.transform;
        
        targetElement.style.transform = randomTransform;
        createPopup("Your text just got a mind of its own!", "Text Trouble");
        setTimeout(() => {
            targetElement.style.transform = originalTransform; // Revert
        }, Math.random() * 500 + 200); // 200-700ms

        // Also change font for extra fun
        const fonts = ["Comic Sans MS", "Impact", "Courier New", "fantasy", "monospace"];
        const originalFont = targetElement === scoreDisplay ? originalScoreDisplayFont : originalGoalDisplayFont;
        const newFont = fonts[Math.floor(Math.random() * fonts.length)];
        targetElement.style.fontFamily = newFont;
        setTimeout(() => {
            targetElement.style.fontFamily = originalFont;
        }, Math.random() * 1000 + 500); // 500-1500ms
    }
}

// Input/Interaction Annoyances

function toggleCursor() {
    // Only from annoyance level 2. Chance: 1% base + 0.5% per level
    if (annoyanceLevel >= 2 && Math.random() < (0.01 + annoyanceLevel * 0.005)) {
        const cursors = ['none', 'wait', 'not-allowed', 'help'];
        const currentCursor = body.style.cursor;
        let newCursor = cursors[Math.floor(Math.random() * cursors.length)];
        while(newCursor === currentCursor) { // Avoid setting same cursor
            newCursor = cursors[Math.floor(Math.random() * cursors.length)];
        }
        
        body.style.cursor = newCursor;
        createPopup(`Cursor changed to: ${newCursor}! Good luck!`, "Mouse Mischief");
        setTimeout(() => {
            body.style.cursor = ''; // Revert to default or 'auto'
        }, Math.random() * 1000 + 500); // 500-1500ms
    }
}

function disableRightClick() {
    // Only from annoyance level 3. Apply persistently at high levels
    if (annoyanceLevel >= 3 && Math.random() < (0.01 + annoyanceLevel * 0.005)) {
        window.oncontextmenu = (e) => {
            e.preventDefault();
            createPopup("Right-click disabled. No cheating!", "Access Denied");
            return false;
        };
    } else if (window.oncontextmenu) { // Periodically enable it if not at high level
        if (Math.random() < 0.1) window.oncontextmenu = null;
    }
}

function disableTextSelection() {
    // Only from annoyance level 2. Applied via CSS class (no-select)
    // The `no-select` class is applied by default in index.html to ensure it's always off
    // We can make it temporarily enable/disable for annoyance, but usually you want it off
    // for a clicker game. This function remains as a placeholder for more advanced toggling.
}

function falseInput() {
    // Only from annoyance level 4. Chance: 0.5% base + 0.2% per level
    if (annoyanceLevel >= 4 && Math.random() < (0.005 + annoyanceLevel * 0.002)) {
        const type = Math.random() < 0.5 ? 'positive' : 'negative';
        let change = Math.random() * 10 + 1; // 1 to 10 points
        if (type === 'negative') {
            change *= -1;
            createPopup(`A phantom force stole ${Math.abs(change).toFixed(1)} points!`, "Unintended Consequence");
        } else {
            createPopup(`A glitch just gave you ${change.toFixed(1)} points! (You're welcome?)`, "Ghostly Bonus");
        }
        score = Math.max(0, score + change);
        updateScoreDisplay();
    }
}

function alterButtonSize() {
    // Only from annoyance level 4. Chance: 1% base + 0.5% per level
    if (annoyanceLevel >= 4 && Math.random() < (0.01 + annoyanceLevel * 0.005)) {
        const originalWidth = clickButton.style.width;
        const originalHeight = clickButton.style.height;
        const originalPadding = clickButton.style.padding;

        if (Math.random() < 0.5) { // Make it tiny
            clickButton.style.width = '50px';
            clickButton.style.height = '20px';
            clickButton.style.padding = '5px';
            createPopup("Your button shrunk! Good luck hitting that!", "Shrink Ray!");
        } else { // Make it huge and cover things
            clickButton.style.width = '300px';
            clickButton.style.height = '150px';
            clickButton.style.padding = '50px';
            createPopup("The button consumes all! Find a way!", "Giant Button!");
        }

        setTimeout(() => {
            clickButton.style.width = originalWidth;
            clickButton.style.height = originalHeight;
            clickButton.style.padding = originalPadding;
            // Best to reset to original styles from CSS if possible
            clickButton.style.width = '';
            clickButton.style.height = '';
            clickButton.style.padding = '';
        }, Math.random() * 1000 + 500); // 0.5-1.5 seconds
    }
}

function invisibleClickTarget() {
    // Only from annoyance level 5. Chance: 0.5% base + 0.1% per level
    if (annoyanceLevel >= 5 && Math.random() < (0.005 + annoyanceLevel * 0.001)) {
        clickButton.style.opacity = '0';
        createPopup("Where did the button go?! Keep clicking blindly!", "Now You See It...");
        setTimeout(() => {
            clickButton.style.opacity = '1';
        }, Math.random() * 1000 + 500); // 0.5-1.5 seconds invisible
    }
}

function insertTemporaryScrollbars() {
    // Only from annoyance level 4. Chance: 0.5% base + 0.1% per level
    if (annoyanceLevel >= 4 && Math.random() < (0.005 + annoyanceLevel * 0.001)) {
        const originalOverflowX = body.style.overflowX;
        const originalOverflowY = body.style.overflowY;

        body.style.overflowX = 'scroll';
        body.style.overflowY = 'scroll';

        // Add temporary large element to force scrolling
        const tempScrollInducer = document.createElement('div');
        tempScrollInducer.style.width = `${window.innerWidth * 1.5}px`;
        tempScrollInducer.style.height = `${window.innerHeight * 1.5}px`;
        tempScrollInducer.style.position = 'absolute';
        tempScrollInducer.style.top = '0';
        tempScrollInducer.style.left = '0';
        tempScrollInducer.style.zIndex = '-1'; // Behind everything
        body.appendChild(tempScrollInducer);

        createPopup("Sudden scrollbars! Why are you scrolling?!", "Scroll-Lock");

        setTimeout(() => {
            body.style.overflowX = originalOverflowX;
            body.style.overflowY = originalOverflowY;
            tempScrollInducer.remove();
        }, Math.random() * 2000 + 1000); // 1-3 seconds
    }
}


// Psychological Annoyances
function fakeProgressBarJump() {
    // Always active, but severity scales
    const currentValue = parseFloat(fakeProgressBar.style.width);
    if (annoyanceLevel >= 2 && Math.random() < (0.1 + annoyanceLevel * 0.05)) { // Chance to jump backwards
        let jumpBack = Math.random() * 20 + 10 + (annoyanceLevel * 5); // 10-30 + more for level
        fakeProgressBar.style.width = `${Math.max(0, currentValue - jumpBack)}%`;
        if (currentValue - jumpBack < 50) { // Only show popup if it's a significant setback
             createPopup("Your progress took a... detour. Backwards.", "Progress Regression");
        }
    }
    // The continuous `updateFakeProgress` handles forward movement.
}

function conflictingMessagePopup() {
    // Only from annoyance level 3. Chance: 2% base + 1% per level
    if (annoyanceLevel >= 3 && Math.random() < (0.02 + annoyanceLevel * 0.01)) {
        const msgs1 = ["You're doing great!", "Keep it up!", "Almost there!"];
        const msgs2 = ["But also, you're failing.", "This is pointless.", "You'll never make it."];
        createPopup(`${msgs1[Math.floor(Math.random() * msgs1.length)]} ${msgs2[Math.floor(Math.random() * msgs2.length)]}`, "Conflicting Signals");
    }
}

function fakeErrorPopup() {
    // Only from annoyance level 4. Chance: 1% base + 0.5% per level
    if (annoyanceLevel >= 4 && Math.random() < (0.01 + annoyanceLevel * 0.005)) {
        const errorCodes = [
            "ERROR: 0x80070005 - Access is denied. But not to you.",
            "SYNTAX ERROR: Brain.exe not found.",
            "CRITICAL WARNING: User is performing repetitive actions. Seek help?",
            "EXCEPTION: NullPointer.toYourSanity",
            "STATUS_STACK_BUFFER_OVERRUN: Your patience buffer overflowed."
        ];
        createPopup(errorCodes[Math.floor(Math.random() * errorCodes.length)], "Cryptic Error");
    }
}

function selfDoubtPopup() {
    // Only from annoyance level 4. Chance: 0.5% base + 0.1% per level
    if (annoyanceLevel >= 4 && Math.random() < (0.005 + annoyanceLevel * 0.001)) {
        const doubts = [
            "Are you sure this is fun?", "Is your life fulfilling?", "Don't you have something better to do?",
            "You could be learning a new skill right now.", "This game judges your choices.",
            "Your parents are watching.", "Just give up. It's okay."
        ];
        createPopup(doubts[Math.floor(Math.random() * doubts.length)], "Existential Crisis");
    }
}


// --- Event Listeners and Initial Calls ---
clickButton.addEventListener('click', clickHandler);
upgradeButton.addEventListener('click', upgradeHandler);

// Prevent right-click and text selection persistently (with occasional annoyance overrides)
document.addEventListener('contextmenu', (e) => {
    if (annoyanceLevel >= 3) e.preventDefault(); // Only prevent at higher levels
});

// Initial display updates
updateScoreDisplay();
goalDisplay.textContent = `Grand Goal: ${gameGoal.toLocaleString()} Points!`; // Set initial goal text

// Start all background annoyance timers
// These timers check annoyanceLevel internally to decide if they should execute
updateFakeProgress(); // This now incorporates fakeProgressBarJump
flickerUIElements();
visualGlitch();
simulateLag();
fakeCrashMessage();

// New timed annoyances
setInterval(applyVisualDistortion, 5000); // Check every 5 seconds
setInterval(shakeEffect, 7000); // Check every 7 seconds
setInterval(randomTextTransform, 3000); // Check every 3 seconds
setInterval(toggleCursor, 4000); // Check every 4 seconds
setInterval(disableRightClick, 10000); // Check every 10 seconds
setInterval(falseInput, 15000); // Check every 15 seconds
setInterval(alterButtonSize, 8000); // Check every 8 seconds
setInterval(insertTemporaryScrollbars, 20000); // Check every 20 seconds
setInterval(conflictingMessagePopup, 6000); // Check every 6 seconds
setInterval(fakeErrorPopup, 12000); // Check every 12 seconds
setInterval(selfDoubtPopup, 9000); // Check every 9 seconds
setInterval(randomVolumeSpike, 10000); // Check every 10 seconds (adjust as needed for audio events)

// Initial audio trigger (needed for browser autoplay policies)
document.addEventListener('click', () => {
    if (!errorSound.played.length) { // Only try to play once
        errorSound.play().catch(e => console.log("Initial audio playback blocked or failed:", e));
        errorSound.pause(); // Immediately pause it
        errorSound.currentTime = 0;
    }
}, { once: true }); // Only run this listener once
