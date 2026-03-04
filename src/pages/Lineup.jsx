import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useEmployees } from '../hooks/useEmployees';
import Avatar from '../components/Avatar';
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

function pickRandom(pool, count, exclude) {
  const filtered = pool.filter((x) => x.id !== exclude.id);
  return shuffle(filtered).slice(0, count);
}

function generatePrompt(employee, difficulty) {
  if (difficulty === 'easy') {
    return { type: 'name', text: employee.name };
  }
  if (difficulty === 'medium') {
    return {
      type: 'role',
      text: `${employee.role} at ${employee.facility}`,
    };
  }
  const clues = [
    ...(employee.likes || []).map((l) => `Likes: ${l}`),
    ...(employee.dislikes || []).map((d) => `Dislikes: ${d}`),
  ];
  if (clues.length === 0) return { type: 'name', text: employee.name };
  const clue = clues[Math.floor(Math.random() * clues.length)];
  return { type: 'clue', text: clue };
}

function generateRound(employees, difficulty) {
  const target = employees[Math.floor(Math.random() * employees.length)];
  const distractors = pickRandom(employees, 3, target);
  const options = shuffle([target, ...distractors]);
  const prompt = generatePrompt(target, difficulty);
  return { target, options, prompt };
}

const ROUNDS_PER_GAME = 6;

export default function Lineup() {
  const { employees } = useEmployees();
  const [difficulty, setDifficulty] = useState('easy');
  const [round, setRound] = useState(() =>
    employees.length >= 4 ? generateRound(employees, 'easy') : null
  );
  const [picked, setPicked] = useState(null);
  const [roundNum, setRoundNum] = useState(1);
  const [roundScore, setRoundScore] = useState({ correct: 0, total: 0 });
  const [scores, setScores] = useLocalStorage('lineup-scores', {
    correct: 0,
    total: 0,
  });
  const [gameOver, setGameOver] = useState(false);

  const handlePick = useCallback(
    (emp) => {
      if (picked || !round) return;
      setPicked(emp.id);
      const correct = emp.id === round.target.id;
      setRoundScore((s) => ({
        correct: s.correct + (correct ? 1 : 0),
        total: s.total + 1,
      }));
      setScores((s) => ({
        correct: s.correct + (correct ? 1 : 0),
        total: s.total + 1,
      }));
    },
    [picked, round, setScores]
  );

  const nextRound = () => {
    if (roundNum >= ROUNDS_PER_GAME) {
      setGameOver(true);
      return;
    }
    setRound(generateRound(employees, difficulty));
    setPicked(null);
    setRoundNum((n) => n + 1);
  };

  const restart = (newDifficulty) => {
    const d = newDifficulty || difficulty;
    setDifficulty(d);
    setRound(generateRound(employees, d));
    setPicked(null);
    setRoundNum(1);
    setRoundScore({ correct: 0, total: 0 });
    setGameOver(false);
  };

  if (employees.length < 4) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 mb-4">
          Need at least 4 employees for Photo Lineup. Currently{' '}
          {employees.length}.
        </p>
        <Link
          to="/admin"
          className="text-cascadia-600 hover:text-cascadia-700 font-medium"
        >
          Add more in Admin
        </Link>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-cascadia-900 mb-4">
          Lineup Complete!
        </h1>
        <div className="mb-6">
          <ScoreBadge
            correct={roundScore.correct}
            total={roundScore.total}
            label="Score"
          />
        </div>
        <p className="text-gray-500 mb-6 capitalize">
          Difficulty: {difficulty}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => restart()}
            className="px-6 py-3 bg-cascadia-600 text-white rounded-xl font-medium hover:bg-cascadia-700 transition-colors"
          >
            Play Again
          </button>
          {difficulty !== 'hard' && (
            <button
              onClick={() =>
                restart(difficulty === 'easy' ? 'medium' : 'hard')
              }
              className="px-6 py-3 border border-cascadia-200 text-cascadia-700 rounded-xl font-medium hover:bg-cascadia-50 transition-colors"
            >
              Try {difficulty === 'easy' ? 'Medium' : 'Hard'}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!round) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cascadia-900">
            Photo Lineup
          </h1>
          <p className="text-sm text-gray-500">
            Round {roundNum} of {ROUNDS_PER_GAME}
          </p>
        </div>
        <ScoreBadge
          correct={roundScore.correct}
          total={roundScore.total}
          label="Score"
        />
      </div>

      <div className="flex gap-2 mb-6">
        {['easy', 'medium', 'hard'].map((d) => (
          <button
            key={d}
            onClick={() => restart(d)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              difficulty === d
                ? 'bg-cascadia-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
        <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">
          {round.prompt.type === 'name'
            ? 'Find this person'
            : round.prompt.type === 'role'
            ? 'Who holds this role?'
            : 'Who does this describe?'}
        </p>
        <h2 className="text-xl font-bold text-gray-900">
          {round.prompt.text}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {round.options.map((emp) => {
          const isTarget = emp.id === round.target.id;
          const isPicked = picked === emp.id;
          let border = 'border-gray-100 hover:border-cascadia-300';
          if (picked !== null) {
            if (isTarget) border = 'border-forest-400 bg-forest-50';
            else if (isPicked) border = 'border-red-400 bg-red-50';
            else border = 'border-gray-100 opacity-50';
          }

          return (
            <button
              key={emp.id}
              onClick={() => handlePick(emp)}
              disabled={picked !== null}
              className={`bg-white rounded-2xl p-6 border-2 shadow-sm transition-all flex flex-col items-center gap-3 cursor-pointer disabled:cursor-default ${border}`}
            >
              <Avatar employee={emp} size="lg" />
              {picked !== null && (
                <div className="text-center">
                  <p className="font-semibold text-sm">{emp.name}</p>
                  <p className="text-xs text-gray-500">{emp.role}</p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-6 text-center">
          <div
            className={`inline-block px-4 py-2 rounded-lg text-sm font-medium mb-4 ${
              picked === round.target.id
                ? 'bg-forest-50 text-forest-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {picked === round.target.id
              ? 'Correct!'
              : `That's ${round.options.find((o) => o.id === picked)?.name}. The answer was ${round.target.name}.`}
          </div>
          <br />
          <button
            onClick={nextRound}
            className="px-6 py-3 bg-cascadia-600 text-white rounded-xl font-medium hover:bg-cascadia-700 transition-colors"
          >
            {roundNum < ROUNDS_PER_GAME ? 'Next Round' : 'See Results'}
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-4">
        All-time: {scores.correct}/{scores.total} correct
      </p>
    </div>
  );
}
