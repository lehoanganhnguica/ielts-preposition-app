import { useMemo, useState } from 'react'
import { questionDatabase } from './data/questions'

const QUIZ_SIZE = 10

function shuffleArray(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function generateQuizData(difficulty) {
  const pool = questionDatabase.filter((q) => q.difficulty === difficulty)
  const shuffled = shuffleArray(pool)
  return shuffled.slice(0, Math.min(QUIZ_SIZE, shuffled.length))
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  )
}

function FeedbackBox({ isCorrect, selected, question }) {
  const explanation = isCorrect
    ? question.explanation
    : question.wrongExplanations[selected] || question.explanation

  return (
    <div className={`feedback-box ${isCorrect ? 'correct' : 'wrong'}`}>
      <div className="feedback-title">{isCorrect ? 'Correct' : 'Not quite'}</div>
      <div className="feedback-text">{explanation}</div>
      {!isCorrect && (
        <div className="feedback-text">
          <strong>Correct answer:</strong> {question.correctAnswer}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [difficulty, setDifficulty] = useState('easy')
  const [quiz, setQuiz] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [submittedMap, setSubmittedMap] = useState({})
  const [answerMap, setAnswerMap] = useState({})

  const hasQuiz = quiz.length > 0
  const currentQuestion = hasQuiz ? quiz[currentIndex] : null
  const currentQuestionId = currentQuestion?.id || null
  const isSubmitted = currentQuestionId ? !!submittedMap[currentQuestionId] : false
  const isLastQuestion = hasQuiz && currentIndex === quiz.length - 1

  const completedCount = useMemo(() => Object.keys(submittedMap).length, [submittedMap])

  const score = useMemo(() => {
    return quiz.reduce((total, question) => {
      if (submittedMap[question.id] && answerMap[question.id] === question.correctAnswer) {
        return total + 1
      }
      return total
    }, 0)
  }, [quiz, submittedMap, answerMap])

  const progress = hasQuiz ? Math.round((completedCount / quiz.length) * 100) : 0

  function generateNewQuiz() {
    const newQuiz = generateQuizData(difficulty)
    setQuiz(newQuiz)
    setCurrentIndex(0)
    setSelectedAnswer('')
    setSubmittedMap({})
    setAnswerMap({})
  }

  function handleCheckAnswer() {
    if (!currentQuestion || !selectedAnswer) return

    setAnswerMap((prev) => ({
      ...prev,
      [currentQuestion.id]: selectedAnswer,
    }))

    setSubmittedMap((prev) => ({
      ...prev,
      [currentQuestion.id]: true,
    }))
  }

  function handleNextQuestion() {
    setCurrentIndex((prev) => prev + 1)
    setSelectedAnswer('')
  }

  function handleRestart() {
    generateNewQuiz()
  }

  return (
    <div className="page">
      <div className="container">
        <section className="panel">
          <h1 className="title">IELTS Task 1: Prepositions for Line Graphs</h1>
          <p className="subtitle">
            Practice preposition patterns for line graphs and other time-based charts.
          </p>

          <div className="stats-grid">
            <StatCard label="Score" value={`${score}/${hasQuiz ? quiz.length : QUIZ_SIZE}`} />
            <StatCard label="Completed" value={completedCount} />
            <StatCard label="Current" value={hasQuiz ? currentIndex + 1 : 0} />
          </div>

          <div className="controls">
            <div className="control-group">
              <label htmlFor="difficulty" className="control-label">
                Difficulty
              </label>
              <select
                id="difficulty"
                className="select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="difficult">Difficult</option>
              </select>
            </div>

            <button className="button button-primary" onClick={generateNewQuiz}>
              Generate new quiz
            </button>
          </div>

          <div className="progress-wrapper">
            <div className="progress-top">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </section>

        {!hasQuiz && (
          <section className="panel empty-state">
            <h2>No quiz yet</h2>
            <p>
              Choose a difficulty level, then click <strong>Generate new quiz</strong> to begin.
            </p>
          </section>
        )}

        {hasQuiz && currentQuestion && (
          <section className="panel">
            <div className="question-top">
              <div>
                <h2 className="question-title">Question {currentIndex + 1}</h2>
                <p className="question-subtitle">
                  Choose the best preposition or preposition set for the sentence.
                </p>
              </div>
              <span className="badge">{currentQuestion.difficulty}</span>
            </div>

            <div className="sentence-box">{currentQuestion.sentence}</div>

            <div className="options-list">
              {currentQuestion.options.map((option) => (
                <label key={option} className="option-card">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={() => setSelectedAnswer(option)}
                    disabled={isSubmitted}
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>

            {isSubmitted && (
              <FeedbackBox
                isCorrect={answerMap[currentQuestion.id] === currentQuestion.correctAnswer}
                selected={answerMap[currentQuestion.id]}
                question={currentQuestion}
              />
            )}

            <div className="actions">
              {!isSubmitted && (
                <button
                  className="button button-primary"
                  onClick={handleCheckAnswer}
                  disabled={!selectedAnswer}
                >
                  Check answer
                </button>
              )}

              {isSubmitted && !isLastQuestion && (
                <button className="button button-secondary" onClick={handleNextQuestion}>
                  Next question
                </button>
              )}

              {isSubmitted && isLastQuestion && (
                <button className="button button-primary" onClick={handleRestart}>
                  Generate new quiz
                </button>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
