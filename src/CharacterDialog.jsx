import { characters } from './data'
import PropTypes from 'prop-types'

export default function CharacterDialog({ isOpen, onSelect, onClose }) {
  if (!isOpen) return null

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h2>Who did you find?</h2>
        <div className="character-options">
          {characters.map(char => (
            <button
              key={char.id}
              className="character-btn"
              onClick={() => onSelect(char.id)}
              disabled={char.found}
            >
              {char.name} {char.found && '✓'}
            </button>
          ))}
        </div>
        <button className="close-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

CharacterDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}
