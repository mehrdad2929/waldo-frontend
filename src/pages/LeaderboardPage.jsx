import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { scoreAPI } from '../services/api';
import { levels } from '../levels';

export default function LeaderboardPage({ onBack }) {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLeaderboard(selectedLevel);
  }, [selectedLevel]);

  const loadLeaderboard = async (levelId) => {
    setLoading(true);
    setError('');
    try {
      const data = await scoreAPI.getLeaderboard(levelId);
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const levelNames = levels.map(l => l.name);

  return (
    <div className="leaderboard-page">
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>

      <h1>Leaderboard</h1>

      <div className="level-tabs">
        {levelNames.map((name, index) => (
          <button
            key={index + 1}
            className={`level-tab ${selectedLevel === index + 1 ? 'active' : ''}`}
            onClick={() => setSelectedLevel(index + 1)}
          >
            {name}
          </button>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : leaderboard.length === 0 ? (
        <div className="empty-leaderboard">
          <p>No scores yet for this level.</p>
          <p>Be the first to play!</p>
        </div>
      ) : (
        <div className="leaderboard-table">
          <div className="leaderboard-header">
            <span>Rank</span>
            <span>Player</span>
            <span>Time</span>
          </div>
          {leaderboard.map((entry) => (
            <div key={entry.rank} className="leaderboard-row">
              <span className={`rank rank-${entry.rank}`}>
                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
              </span>
              <span className="username">{entry.username}</span>
              <span className="time">{entry.timeFormatted}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

LeaderboardPage.propTypes = {
  onBack: PropTypes.func.isRequired,
};
