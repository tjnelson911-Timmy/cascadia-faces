import { useState } from 'react';
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

function generateQuestions(employees) {
  const questions = [];

  for (const emp of employees) {
    const correctLike =
      emp.likes && emp.likes.length > 0
        ? emp.likes[Math.floor(Math.random() * emp.likes.length)]
        : null;
    if (correctLike) {
      const otherLikes = employees
        .filter((e) => e.id !== emp.id)
        .flatMap((e) => e.likes || [])
        .filter((l) => !(emp.likes || []).includes(l));
      const wrongLikes = shuffle(otherLikes).slice(0, 3);
      if (wrongLikes.length === 3) {
        questions.push({
          question: `Which of these does ${emp.name} enjoy?`,
          options: shuffle([correctLike, ...wrongLikes]),
          answer: correctLike,
          employee: emp,
        });
      }
    }

    const correctDislike =
      emp.dislikes && emp.dislikes.length > 0
        ? emp.dislikes[Math.floor(Math.random() * emp.dislikes.length)]
        : null;
    if (correctDislike) {
      const otherDislikes = employees
        .filter((e) => e.id !== emp.id)
        .flatMap((e) => e.dislikes || [])
        .filter((d) => !(emp.dislikes || []).includes(d));
      const wrongDislikes = shuffle(otherDislikes).slice(0, 3);
      if (wrongDislikes.length === 3) {
        questions.push({
          question: `What does ${emp.name} dislike?`,
          options: shuffle([correctDislike, ...wrongDislikes]),
          answer: correctDislike,
          employee: emp,
        });
      }
    }

    const otherFacilities = [
      ...new Set(
        employees.filter((e) => e.id !== emp.id).map((e) => e.facility)
      ),
    ].filter((f) => f !== emp.facility);
    if (otherFacilities.length >= 2) {
      questions.push({
        question: `Which facility does ${emp.name} work at?`,
        options: shuffle([emp.facility, ...otherFacilities.slice(0, 3)]),
        answer: emp.facility,
        employee: emp,
      });
    }

    const otherRoles = [
      ...new Set(
        employees.filter((e) => e.id !== emp.id).map((e) => e.role)
      ),
    ].filter((r) => r !== emp.role);
    if (otherRoles.length >= 3) {
      questions.push({
        question: `What is ${emp.name}'s role?`,
        options: shuffle([emp.role, ...shuffle(otherRoles).slice(0, 3)]),
        answer: emp.role,
        employee: emp,
      });
    }
  }

  return shuffle(questions).slice(0, 10);
}

export default function Quiz() {
  const { employees } = useEmployees();
  const [questions, setQuestions] = useState(() =>
    generateQuestions(employees)
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [roundScore, setRoundScore] = useState({ correct: 0, total: 0 });
  const [scores, setScores] = useLocalStorage('quiz-scores', {
    correct: 0,
    total: 0,
  });

  const current = questions[index];
  const isFinished = index >= questions.length;

  const handleSelect = (option) => {
    if (selected) return;
    setSelected(option);
    const correct = option === current.answer;
    setRoundScore((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }));
    setScores((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }));
  };

  const next = () => {
    setIndex((i) => i + 1);
    setSelected(null);
  };

  const restart = () => {
    setQuestions(generateQuestions(employees));
    setIndex(0);
    setSelected(null);
    setRoundScore({ correct: 0, total: 0 });
  };

  if (employees.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 mb-4">No employees yet.</p>
        <Link
          to="/admin"
          className="text-cascadia-600 hover:text-cascadia-700 font-medium"
        >
          Add some in Admin
        </Link>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 mb-4">
          Not enough data to generate quiz questions. Add more employees with
          likes, dislikes, and varied roles.
        </p>
        <Link
          to="/admin"
          className="text-cascadia-600 hover:text-cascadia-700 font-medium"
        >
          Go to Admin
        </Link>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-cascadia-900 mb-4">
          Quiz Complete!
        </h1>
        <div className="mb-6">
          <ScoreBadge
            correct={roundScore.correct}
            total={roundScore.total}
            label="Score"
          />
        </div>
        <p className="text-gray-500 mb-8">
          {roundScore.correct === roundScore.total
            ? 'Perfect score! You really know your team!'
            : roundScore.correct >= roundScore.total * 0.7
            ? 'Great job! You know your colleagues well.'
            : 'Keep learning! Check the directory to brush up.'}
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
          <h1 className="text-2xl font-bold text-cascadia-900">Quiz Mode</h1>
          <p className="text-sm text-gray-500">
            Question {index + 1} of {questions.length}
          </p>
        </div>
        <ScoreBadge
          correct={roundScore.correct}
          total={roundScore.total}
          label="Score"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Avatar employee={current.employee} size="sm" />
          <div>
            <p className="font-medium text-gray-900">
              {current.employee.name}
            </p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {current.question}
        </h2>

        <div className="space-y-3">
          {current.options.map((option) => {
            let style =
              'border-gray-200 hover:border-cascadia-300 hover:bg-cascadia-50';
            if (selected) {
              if (option === current.answer) {
                style = 'border-forest-400 bg-forest-50 text-forest-800';
              } else if (option === selected) {
                style = 'border-red-400 bg-red-50 text-red-800';
              } else {
                style = 'border-gray-100 opacity-50';
              }
            }
            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                disabled={selected !== null}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm disabled:cursor-default cursor-pointer ${style}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="mt-6">
            <div
              className={`px-4 py-2 rounded-lg text-sm font-medium mb-4 text-center ${
                selected === current.answer
                  ? 'bg-forest-50 text-forest-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {selected === current.answer
                ? 'Correct!'
                : `The answer was: ${current.answer}`}
            </div>
            <button
              onClick={next}
              className="w-full px-4 py-3 bg-cascadia-600 text-white rounded-xl font-medium hover:bg-cascadia-700 transition-colors"
            >
              {index < questions.length - 1 ? 'Next Question' : 'See Results'}
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        All-time: {scores.correct}/{scores.total} correct
      </p>

      <div className="mt-4 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cascadia-500 to-forest-500 rounded-full transition-all duration-300"
          style={{
            width: `${((index + (selected ? 1 : 0)) / questions.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
