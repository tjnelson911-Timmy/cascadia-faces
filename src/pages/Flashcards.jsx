import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useEmployees } from '../hooks/useEmployees';
import Avatar from '../components/Avatar';
import FacilityBadge from '../components/FacilityBadge';
import ScoreBadge from '../components/ScoreBadge';
import { useLocalStorage } from '../hooks/useLocalStorage';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Flashcards() {
  const { employees } = useEmployees();
  const [deck, setDeck] = useState(() => shuffle(employees));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState(null);
  const [scores, setScores] = useLocalStorage('flashcard-scores', {
    correct: 0,
    total: 0,
  });
  const [roundScore, setRoundScore] = useState({ correct: 0, total: 0 });

  const current = deck[index];
  const isFinished = index >= deck.length;

  const checkAnswer = useCallback(() => {
    if (!guess.trim()) return;
    const correct = current.name
      .toLowerCase()
      .includes(guess.trim().toLowerCase());
    setResult(correct ? 'correct' : 'wrong');
    setFlipped(true);
    setRoundScore((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }));
    setScores((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }));
  }, [guess, current, setScores]);

  const next = () => {
    setIndex((i) => i + 1);
    setFlipped(false);
    setGuess('');
    setResult(null);
  };

  const restart = () => {
    setDeck(shuffle(employees));
    setIndex(0);
    setFlipped(false);
    setGuess('');
    setResult(null);
    setRoundScore({ correct: 0, total: 0 });
  };

  if (employees.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 mb-4">No employees yet.</p>
        <Link to="/admin" className="text-cascadia-600 hover:text-cascadia-700 font-medium">
          Add some in Admin
        </Link>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-cascadia-900 mb-4">
          Round Complete!
        </h1>
        <div className="mb-6">
          <ScoreBadge
            correct={roundScore.correct}
            total={roundScore.total}
            label="This Round"
          />
        </div>
        <p className="text-gray-500 mb-6">
          You got {roundScore.correct} out of {roundScore.total} correct.
        </p>
        <button
          onClick={restart}
          className="px-6 py-3 bg-cascadia-600 text-white rounded-xl font-medium hover:bg-cascadia-700 transition-colors"
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-cascadia-900">Flashcards</h1>
          <p className="text-sm text-gray-500">
            Card {index + 1} of {deck.length}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <ScoreBadge
            correct={roundScore.correct}
            total={roundScore.total}
            label="Round"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8 flex flex-col items-center">
          <div className="mb-6">
            <Avatar employee={current} size="xl" />
          </div>

          {!flipped ? (
            <div className="w-full space-y-4">
              <p className="text-center text-gray-500 text-sm">
                Who is this person?
              </p>
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                placeholder="Type their name..."
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cascadia-400 text-center text-lg"
              />
              <div className="flex gap-3">
                <button
                  onClick={checkAnswer}
                  disabled={!guess.trim()}
                  className="flex-1 px-4 py-3 bg-cascadia-600 text-white rounded-xl font-medium hover:bg-cascadia-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Check
                </button>
                <button
                  onClick={() => {
                    setFlipped(true);
                    setResult('skip');
                    setRoundScore((s) => ({ ...s, total: s.total + 1 }));
                    setScores((s) => ({ ...s, total: s.total + 1 }));
                  }}
                  className="px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Reveal
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full text-center space-y-4">
              <div
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  result === 'correct'
                    ? 'bg-forest-50 text-forest-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {result === 'correct'
                  ? 'Correct!'
                  : result === 'skip'
                  ? 'Skipped'
                  : 'Not quite!'}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {current.name}
              </h2>
              <p className="text-gray-500">{current.role}</p>
              <FacilityBadge facility={current.facility} />
              <button
                onClick={next}
                className="w-full px-4 py-3 bg-cascadia-600 text-white rounded-xl font-medium hover:bg-cascadia-700 transition-colors mt-4"
              >
                {index < deck.length - 1 ? 'Next Card' : 'See Results'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">
          All-time: {scores.correct}/{scores.total} correct
        </p>
      </div>
    </div>
  );
}
