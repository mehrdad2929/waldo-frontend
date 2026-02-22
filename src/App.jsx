import { useState, useRef, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { scoreAPI } from './services/api'
import CharacterDialog from './CharacterDialog'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import LeaderboardPage from './pages/LeaderboardPage'
import { levels } from './levels'

function AppContent() {
    const [currentScreen, setCurrentScreen] = useState('menu')
    const [selectedLevel, setSelectedLevel] = useState(null)
    const [characters, setCharacters] = useState([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [clickedCoords, setClickedCoords] = useState(null)
    const [gameStatus, setGameStatus] = useState('ready')
    const [timer, setTimer] = useState(0)
    const [startTime, setStartTime] = useState(null)
    const [scoreSubmitted, setScoreSubmitted] = useState(false)
    const imageRef = useRef(null)
    const tolerance = 5
    const { user, isAuthenticated, logout, loading } = useAuth()

    useEffect(() => {
        let interval
        if (gameStatus === 'playing' && startTime) {
            interval = setInterval(() => {
                setTimer(Date.now() - startTime)
            }, 10)
        }
        return () => clearInterval(interval)
    }, [gameStatus, startTime])

    const selectLevel = (level) => {
        setSelectedLevel(level)
        setCharacters(level.characters.map(c => ({ ...c, found: false })))
        setCurrentScreen('pregame')
        setGameStatus('ready')
        setTimer(0)
        setStartTime(null)
        setScoreSubmitted(false)
    }

    const startGame = () => {
        setGameStatus('playing')
        setStartTime(Date.now())
        setTimer(0)
    }

    const backToMenu = () => {
        setCurrentScreen('menu')
        setSelectedLevel(null)
        setCharacters([])
        setGameStatus('ready')
        setTimer(0)
        setStartTime(null)
        setDialogOpen(false)
        setScoreSubmitted(false)
    }

    const formatTime = (ms) => {
        const seconds = Math.floor(ms / 1000)
        const milliseconds = Math.floor((ms % 1000) / 10)
        return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`
    }

    const handleImageClick = (e) => {
        const rect = imageRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        setClickedCoords({ x, y })
        setDialogOpen(true)
    }

    const handleCharacterSelect = async (charId) => {
        const character = characters.find(c => c.id === charId)

        if (!character || character.found) {
            return
        }

        const distance = Math.sqrt(
            Math.pow(clickedCoords.x - character.x, 2) +
            Math.pow(clickedCoords.y - character.y, 2)
        )

        if (distance <= tolerance) {
            const updatedCharacters = characters.map(c =>
                c.id === charId ? { ...c, found: true } : c
            )
            setCharacters(updatedCharacters)

            const allFound = updatedCharacters.every(c => c.found)
            if (allFound) {
                setGameStatus('won')
                if (isAuthenticated && !scoreSubmitted) {
                    try {
                        await scoreAPI.submitScore(selectedLevel.id, timer)
                        setScoreSubmitted(true)
                    } catch (err) {
                        console.error('Failed to submit score:', err.message)
                    }
                }
            }
        }

        setDialogOpen(false)
    }

    const showLogin = () => setCurrentScreen('login')
    const showSignup = () => setCurrentScreen('signup')
    const showLeaderboard = () => setCurrentScreen('leaderboard')
    const showMenu = () => setCurrentScreen('menu')

    if (loading) {
        return (
            <div className="app">
                <div className="loading">Loading...</div>
            </div>
        )
    }

    return (
        <div className="app">
            {currentScreen === 'menu' && (
                <div className="menu-screen">
                    <div className="menu-header">
                        <h1>Choose a Level</h1>
                        <div className="header-buttons">
                            {isAuthenticated ? (
                                <>
                                    <span className="user-info">Welcome, {user?.username}</span>
                                    <button className="header-btn" onClick={showLeaderboard}>
                                        Leaderboard
                                    </button>
                                    <button className="header-btn" onClick={logout}>
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="header-btn" onClick={showLeaderboard}>
                                        Leaderboard
                                    </button>
                                    <button className="header-btn primary" onClick={showLogin}>
                                        Login
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="level-grid">
                        {levels.map(level => (
                            <div
                                key={level.id}
                                className="level-card"
                                onClick={() => selectLevel(level)}
                            >
                                <img
                                    src={level.thumbnail}
                                    alt={level.name}
                                    className="level-thumbnail"
                                />
                                <span className="level-name">{level.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {currentScreen === 'login' && (
                <LoginPage onBack={showMenu} onSwitchToSignup={showSignup} />
            )}

            {currentScreen === 'signup' && (
                <SignupPage onBack={showMenu} onSwitchToLogin={showLogin} />
            )}

            {currentScreen === 'leaderboard' && (
                <LeaderboardPage onBack={showMenu} />
            )}

            {currentScreen === 'pregame' && selectedLevel && gameStatus === 'ready' && (
                <div className="pre-game-screen">
                    <button className="back-btn" onClick={backToMenu}>
                        ← Back to Menu
                    </button>
                    <h1>Find the Characters in {selectedLevel.name}!</h1>
                    <p className="instructions">Look for these characters in the image:</p>

                    <div className="character-preview">
                        {selectedLevel.characters.map((char, index) => (
                            <div key={char.id} className="preview-card">
                                <img
                                    src={selectedLevel.characterImages[index]}
                                    alt={char.name}
                                    className="preview-image"
                                />
                                <span className="preview-name">{char.name}</span>
                            </div>
                        ))}
                    </div>

                    <button className="start-btn" onClick={startGame}>
                        Start Game
                    </button>
                </div>
            )}

            {currentScreen === 'pregame' && selectedLevel && (gameStatus === 'playing' || gameStatus === 'won') && (
                <>
                    <div className="game-header">
                        <button className="back-btn" onClick={backToMenu}>
                            ← Back to Menu
                        </button>
                        <h1>{selectedLevel.name}</h1>
                        <div className="timer-display">
                            Time: {formatTime(timer)}
                        </div>
                    </div>

                    <div className="character-list">
                        {characters.map((char, index) => (
                            <div key={char.id} className={`character-item ${char.found ? 'found' : ''}`}>
                                <img
                                    src={selectedLevel.characterImages[index]}
                                    alt={char.name}
                                    className="character-list-image"
                                />
                                <span>{char.found ? '✓' : '○'} {char.name}</span>
                            </div>
                        ))}
                    </div>

                    <div className="image-container">
                        <img
                            ref={imageRef}
                            src={selectedLevel.gameImage}
                            alt="Find the characters"
                            className="game-image"
                            onClick={gameStatus === 'playing' ? handleImageClick : undefined}
                            style={{ cursor: gameStatus === 'playing' ? 'pointer' : 'default' }}
                        />
                    </div>

                    {gameStatus === 'won' && (
                        <div className="win-message">
                            <h2>🎉 Congratulations! You found everyone!</h2>
                            <p>Final Time: {formatTime(timer)}</p>
                            {scoreSubmitted && <p className="score-submitted">Score submitted to leaderboard!</p>}
                            <button className="back-btn" onClick={backToMenu}>
                                Back to Menu
                            </button>
                        </div>
                    )}

                    <CharacterDialog
                        isOpen={dialogOpen}
                        onSelect={handleCharacterSelect}
                        onClose={() => setDialogOpen(false)}
                        characters={characters}
                    />
                </>
            )}
        </div>
    )
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    )
}

export default App
