import { useState, useRef } from 'react'
import CharacterDialog from './CharacterDialog'
import { characters as initialCharacters } from './data'

function App() {
  const [characters, setCharacters] = useState(initialCharacters)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [clickedCoords, setClickedCoords] = useState(null)
  const [showDebug, setShowDebug] = useState(false)
  const imageRef = useRef(null)
  const tolerance = 5

  const handleImageClick = (e) => {
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setClickedCoords({ x, y })
    
    console.log('🖱️ Image Clicked at:', { x: x.toFixed(2), y: y.toFixed(2) })
    characters.forEach(char => {
      const distance = Math.sqrt(
        Math.pow(x - char.x, 2) + Math.pow(y - char.y, 2)
      )
      console.log(`📍 Distance to ${char.name}: ${distance.toFixed(2)}%`, 
        `(${char.found ? 'Already found' : distance <= tolerance ? 'Would be FOUND!' : 'Not in range'})`)
    })
    
    setDialogOpen(true)
  }

  const handleCharacterSelect = (charId) => {
    const character = characters.find(c => c.id === charId)
    
    console.log('🔍 Character Selected:', character?.name, 'ID:', charId)
    console.log('📍 Click Coords:', { x: clickedCoords.x.toFixed(2), y: clickedCoords.y.toFixed(2) })
    console.log('🎯 Character Coords:', { x: character?.x, y: character?.y })
    
    if (!character || character.found) {
      console.log('❌ Character not found or already found')
      return
    }

    const distance = Math.sqrt(
      Math.pow(clickedCoords.x - character.x, 2) +
      Math.pow(clickedCoords.y - character.y, 2)
    )

    console.log('📏 Distance:', distance.toFixed(2), '% vs Tolerance:', tolerance, '%')

    if (distance <= tolerance) {
      console.log('✅ FOUND! Marking', character.name, 'as found')
      setCharacters(prev => prev.map(c => 
        c.id === charId ? { ...c, found: true } : c
      ))
    } else {
      console.log('❌ Not found. Click was too far from character.')
    }

    setDialogOpen(false)
  }

  const allFound = characters.every(c => c.found)

  return (
    <div className="app">
      <h1>Where&apos;s Waldo?</h1>
      
      <div className="character-list">
        {characters.map(char => (
          <div key={char.id} className={`character-item ${char.found ? 'found' : ''}`}>
            {char.found ? '✓' : '○'} {char.name}
          </div>
        ))}
      </div>

      <button className="debug-toggle" onClick={() => setShowDebug(!showDebug)}>
        {showDebug ? 'Hide Debug' : 'Show Debug'}
      </button>

      {showDebug && clickedCoords && (
        <div className="debug-panel">
          <h3>🔍 Debug Info</h3>
          <p><strong>Click Coordinates:</strong> x={clickedCoords.x.toFixed(2)}%, y={clickedCoords.y.toFixed(2)}%</p>
          <p><strong>Tolerance:</strong> {tolerance}%</p>
          <h4>Distances to Characters:</h4>
          {characters.map(char => {
            const distance = Math.sqrt(
              Math.pow(clickedCoords.x - char.x, 2) + Math.pow(clickedCoords.y - char.y, 2)
            )
            return (
              <div key={char.id} className={`debug-char ${distance <= tolerance && !char.found ? 'in-range' : ''}`}>
                <strong>{char.name}</strong>: {distance.toFixed(2)}% 
                (at x={char.x}%, y={char.y}%) 
                {char.found ? ' ✅ Found' : distance <= tolerance ? ' 🎯 IN RANGE!' : ' ❌ Not in range'}
              </div>
            )
          })}
        </div>
      )}

      <div className="image-container">
        <img
          ref={imageRef}
          src="/waldo.jpg"
          alt="Find the characters"
          className="game-image"
          onClick={handleImageClick}
          style={{ cursor: 'pointer' }}
        />
      </div>

      {allFound && (
        <div className="win-message">
          <h2>🎉 Congratulations! You found everyone!</h2>
        </div>
      )}

      <CharacterDialog
        isOpen={dialogOpen}
        onSelect={handleCharacterSelect}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  )
}

export default App
