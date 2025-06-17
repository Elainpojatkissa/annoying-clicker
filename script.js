let score = 0.0;
let pointsPerClick = 1.0;
let totalClicks = 0;
const achievementsUnlocked = new Set();
let isLagging = false; // To control game input during lag

const scoreDisplay = document.getElementById('score-display');
const clickButton = document.getElementById('click-button');
const upgradeButton = document.getElementById('upgrade-button');
const popupArea = document.getElementById('popup-area');
const fakeProgressBar = document.getElementById('fake-progress-bar');

// --- Core Game Functions ---

function updateScoreDisplay() {
    scoreDisplay.textContent = `Score: ${score.toFixed(1)}`;
}

function createPopup(message, title = "Just Another Useless Popup") {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerHTML = `<h3>${title}</h3><p>${message}</p><button onclick="this.parentNode.remove()">Click to Close</button>`;
    
    // Annoying random position
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const popupWidth = 300; // Approximate
    const popupHeight = 150; // Approximate
    
    popup.style.right = `${Math.random() * (screenWidth - popupWidth - 50)}px`;
    popup.style.top = `${Math.random() * (screenHeight - popupHeight - 100)}px`;

    popupArea.appendChild(popup);

    // Optional: Auto-remove after a few seconds if you want
    // setTimeout(() => popup.remove(), 5000); 
}

function clickHandler() {
    if (isLagging) {
        createPopup("Still lagging... patience, padawan.", "Server Response Delayed");
        return;
    }

    score += pointsPerClick;
    totalClicks++;
    updateScoreDisplay();
    createPopup(`Total Clicks: ${totalClicks}`);
    checkAchievements();
    randomAnnoyance();
    randomButtonMove();
    randomButtonTextChange();

    if (Math.random() < 0.03) { // 3% chance for CAPTCHA
        showCaptcha();
    }
}

function upgradeHandler() {
    if (isLagging) {
        createPopup("Can't upgrade while the network is unstable!", "Error");
        return;
    }

    if (score >= 10) {
        score -= 10;

        if (Math.random() < 0.2) {
            createPopup("Oops. That upgrade did nothing. Again.");
        } else if (Math.random() < 0.1) { // 10% chance to reduce points
            const decrease = parseFloat((Math.random() * (0.05 - 0.01) + 0.01).toFixed(2));
            pointsPerClick = Math.max(1.0, pointsPerClick - decrease);
            createPopup(`Oh dear. Your points per click just decreased by ${decrease}. Unlucky!`);
        } else if (Math.random() < 0.15) { // 15% chance to deduct score
            const deduction = parseFloat((Math.random() * (5.0 - 1.0) + 1.0).toFixed(1));
            score = Math.max(0.0, score - deduction);
            createPopup(`A wild bug appeared! You lost ${deduction} points.`);
        } else {
            const increase = parseFloat((Math.random() * (0.09 - 0.01) + 0.01).toFixed(2));
            pointsPerClick += increase;
            createPopup(`Upgrade added +${increase} per click. Feel that boost?`);
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
            createPopup(`You unlocked: ${name}`);
        }
        i += 5;
    }

    if (pointsPerClick > 1.0 && !achievementsUnlocked.has("Upgrade Purchased")) {
        achievementsUnlocked.add("Upgrade Purchased");
        createPopup("You unlocked: Upgrade Purchased");
    }
}

// --- Annoyance Features ---

function randomAnnoyance() {
    const annoyMessages = [
        "Still here? Amazing.",
        "Are you enjoying this? Because we are.",
        "Click. Click. Click. That's all you do.",
        "Just when you thought you were making progress...",
        "Another second passes. And another.",
        "Your dedication is... concerning.",
        "You know, there are other things to do.",
        "Error 404: Fun not found."
    ];
    if (Math.random() < 0.3) { // 30% chance
        createPopup(annoyMessages[Math.floor(Math.random() * annoyMessages.length)]);
    }
}

function randomButtonMove() {
    if (Math.random() < 0.3) {
        const gameContainer = document.querySelector('.game-container');
        const containerRect = gameContainer.getBoundingClientRect();
        
        // Calculate new position relative to the container
        const newX = Math.random() * (containerRect.width - clickButton.offsetWidth - 100);
        const newY = Math.random() * (containerRect.height - clickButton.offsetHeight - 100);

        clickButton.style.position = 'absolute'; // Ensure position is absolute for precise placement
        clickButton.style.left = `${newX}px`;
        clickButton.style.top = `${newY}px`;
        createPopup("The button has moved! Try to catch it!");
    } else {
        clickButton.style.position = 'static'; // Reset to normal flow
        // For web, re-inserting or re-applying 'pack' equivalent is harder.
        // It's better to manage position with CSS classes or direct style.
        // Here, 'static' makes it flow normally again.
    }
}

function randomButtonTextChange() {
    if (Math.random() < 0.15) {
        const annoyingTexts = [
            "Don't Click Me!", "Are You Sure?", "Click at Your Peril!",
            "Error: Button Not Found", "Why Are You Still Clicking?",
            "Press 'X' to Pay Respects"
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
    if (Math.random() < 0.6) {
        newValue = Math.min(100, currentValue + Math.floor(Math.random() * 16) + 5); // 5-20
    } else {
        newValue = Math.max(0, currentValue - Math.floor(Math.random() * 21) - 10); // 10-30
    }
    
    fakeProgressBar.style.width = `${newValue}%`;
    setTimeout(updateFakeProgress, Math.floor(Math.random() * 1501) + 500); // 0.5 to 2 seconds
}

function flickerUIElements() {
    if (Math.random() < 0.05) {
        const elements = [scoreDisplay, clickButton, upgradeButton];
        const elementToFlicker = elements[Math.floor(Math.random() * elements.length)];
        
        elementToFlicker.style.visibility = 'hidden'; // Hide
        setTimeout(() => {
            elementToFlicker.style.visibility = 'visible'; // Show
        }, Math.floor(Math.random() * 401) + 100); // 100-500ms
    }
    setTimeout(flickerUIElements, Math.floor(Math.random() * 2501) + 500); // 0.5 to 3 seconds
}

function showCaptcha() {
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
            createPopup("Verification successful. Now continue suffering!");
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
    if (Math.random() < 0.05) {
        const glitchFlash = document.createElement('div');
        glitchFlash.className = 'glitch-flash';
        document.body.appendChild(glitchFlash);
        setTimeout(() => glitchFlash.remove(), 100); // Remove quickly
    }
    setTimeout(visualGlitch, Math.floor(Math.random() * 5001) + 2000); // 2 to 7 seconds
}

function simulateLag() {
    if (Math.random() < 0.02) {
        createPopup("Network Lag Detected... just kidding, it's us.", "Simulation");
        isLagging = true;
        clickButton.disabled = true;
        upgradeButton.disabled = true;
        
        const lagDuration = Math.floor(Math.random() * 2001) + 1000; // 1 to 3 seconds
        setTimeout(() => {
            isLagging = false;
            clickButton.disabled = false;
            upgradeButton.disabled = false;
            createPopup("Lag resolved! For now...");
        }, lagDuration);
    }
    setTimeout(simulateLag, Math.floor(Math.random() * 10001) + 5000); // 5 to 15 seconds
}

function fakeCrashMessage() {
    if (Math.random() < 0.01) {
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

        const crashDuration = Math.floor(Math.random() * 4001) + 3000; // 3 to 7 seconds
        setTimeout(() => {
            crashPopup.remove();
            isLagging = false;
            clickButton.disabled = false;
            upgradeButton.disabled = false;
        }, crashDuration);
    }
    setTimeout(fakeCrashMessage, Math.floor(Math.random() * 60001) + 30000); // 30-90 seconds
}


// --- Event Listeners and Initial Calls ---
clickButton.addEventListener('click', clickHandler);
upgradeButton.addEventListener('click', upgradeHandler);

updateScoreDisplay();
updateFakeProgress();
flickerUIElements();
visualGlitch();
simulateLag();
fakeCrashMessage(); // Start the chaos!
