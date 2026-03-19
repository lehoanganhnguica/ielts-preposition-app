import { useMemo, useState } from 'react'

const subjects = [
  'Car sales',
  'House prices',
  'The number of tourists',
  'Exports',
  'Book sales',
  'Mobile phone ownership',
  'Oil production',
  'The unemployment rate',
  'Electricity consumption',
  'The birth rate',
]

const amounts = [
  '10%',
  '15%',
  '25%',
  '40 units',
  '50,000 dollars',
  '75,000 dollars',
  '100,000 dollars',
  '2 million tonnes',
  '3.5 million users',
  '12 percentage points',
]

const values = [
  ['5,000', '105,000'],
  ['10%', '35%'],
  ['2 million', '6 million'],
  ['40', '85'],
  ['120', '300'],
  ['15,000', '90,000'],
  ['8', '22'],
  ['1.2 million', '4.8 million'],
  ['60', '140'],
  ['18%', '42%'],
]

const periods = [
  ['1960', '2010'],
  ['1985', '2005'],
  ['1990', '2020'],
  ['2000', '2015'],
  ['2005', '2025'],
  ['1995', '2010'],
  ['1970', '1990'],
  ['1980', '2000'],
  ['1998', '2018'],
  ['2010', '2020'],
]

const patterns = {
  increase_by: {
    id: 'increase_by',
    difficulty: 'easy',
    explanation: "Use 'by' to show the size or amount of change.",
    wrong: {
      from: "'From' introduces a starting point, not the amount of change.",
      in: "'In' is not used here to show the amount of increase.",
      over: "'Over' refers to a period of time, not the size of the change.",
    },
    build(seed) {
      return {
        sentence: `${seed.subject} increased ___ ${seed.amount} from ${seed.year1} to ${seed.year2}.`,
        options: shuffleArray(['by', 'from', 'in', 'over']),
        answer: 'by',
        explanationTitle: 'increase by + amount',
      }
    },
  },
  from_to: {
    id: 'from_to',
    difficulty: 'easy',
    explanation: "Use 'from ... to ...' to show the starting and ending values or time points.",
    wrong: {
      by: "'By' shows the amount of change, not the starting and ending points.",
      between: "'Between' must be followed by 'and', not 'to'.",
      during: "'During' is used with a period, not two endpoints linked together.",
    },
    build(seed) {
      return {
        sentence: `${seed.subject} rose ___ ${seed.value1} to ${seed.value2} between ${seed.year1} and ${seed.year2}.`,
        options: shuffleArray(['from', 'by', 'between', 'during']),
        answer: 'from',
        explanationTitle: 'from + starting value + to + ending value',
      }
    },
  },
  between_and: {
    id: 'between_and',
    difficulty: 'easy',
    explanation: "Use 'between ... and ...' to mark two endpoints in time.",
    wrong: {
      from: "'From' normally pairs with 'to', not 'and'.",
      during: "'During' is followed by a period such as 'the decade', not two exact endpoints.",
      over: "'Over' can describe the whole period, but it does not fit the structure '___ X and Y'.",
    },
    build(seed) {
      return {
        sentence: `${seed.subject} climbed from ${seed.value1} to ${seed.value2} ___ ${seed.year1} and ${seed.year2}.`,
        options: shuffleArray(['between', 'from', 'during', 'over']),
        answer: 'between',
        explanationTitle: 'between + point A + and + point B',
      }
    },
  },
  increase_of: {
    id: 'increase_of',
    difficulty: 'medium',
    explanation: "Use 'of' after 'an increase' to state the amount of change.",
    wrong: {
      in: "Use 'in' before the thing that changes, such as 'in car sales', not before the amount.",
      by: "After the noun phrase 'an increase', the usual structure is 'of + amount'.",
      from: "'From' introduces a starting point, not the amount after 'an increase'.",
    },
    build(seed) {
      return {
        sentence: `${seed.subject} saw an increase ___ ${seed.amount} over the period.`,
        options: shuffleArray(['of', 'in', 'by', 'from']),
        answer: 'of',
        explanationTitle: 'an increase of + amount',
      }
    },
  },
  increase_in: {
    id: 'increase_in',
    difficulty: 'medium',
    explanation: "Use 'in' to identify what experienced the change.",
    wrong: {
      of: "Use 'of' for the amount of change, not the thing that changed.",
      by: "'By' shows the amount of change, not the category being measured.",
      during: "'During' refers to time, not the item that increased.",
    },
    build(seed) {
      return {
        sentence: `There was an increase of ${seed.amount} ___ ${seed.subject.toLowerCase()} during the period.`,
        options: shuffleArray(['in', 'of', 'by', 'during']),
        answer: 'in',
        explanationTitle: 'an increase in + noun',
      }
    },
  },
  over_period: {
    id: 'over_period',
    difficulty: 'medium',
    explanation: "Use 'over' to describe change across the whole span of time.",
    wrong: {
      by: "'By' shows the amount of change, not the time span.",
      between: "'Between' needs two endpoints, for example 'between 1960 and 2010'.",
      from: "'From' must usually pair with 'to' when giving a time range.",
    },
    build(seed) {
      return {
        sentence: `${seed.subject} had an increase of ${seed.amount} ___ the period.`,
        options: shuffleArray(['over', 'by', 'between', 'from']),
        answer: 'over',
        explanationTitle: 'over + the period',
      }
    },
  },
  during_period: {
    id: 'during_period',
    difficulty: 'medium',
    explanation: "Use 'during' to show that something happened within a period of time.",
    wrong: {
      over: "'Over' emphasizes the whole time span as a range; here the fixed phrase is 'during the period'.",
      between: "'Between' needs two endpoints and cannot be followed directly by 'the period'.",
      from: "'From' requires a second point introduced by 'to'.",
    },
    build(seed) {
      return {
        sentence: `There was an increase of ${seed.amount} in ${seed.subject.toLowerCase()} ___ the period.`,
        options: shuffleArray(['during', 'over', 'between', 'from']),
        answer: 'during',
        explanationTitle: 'during + the period',
      }
    },
  },
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffleArray(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function createSeed() {
  const [value1, value2] = pick(values)
  const [year1, year2] = pick(periods)
  return {
    subject: pick(subjects),
    amount: pick(amounts),
    value1,
    value2,
    year1,
    year2,
  }
}

function generateQuizData(difficulty) {
  const pool = Object.values(patterns).filter(
    (pattern) => pattern.difficulty === difficulty
  )

  const questions = []
  for (let i = 0; i < 10; i += 1) {
    const pattern = pool[i % pool.length]
    const seed = createSeed()
    const built = pattern.build(seed)

    questions.push({
      id: `${pattern.id}_${i}_${Date.now()}_${Math.random()}`,
      difficulty: pattern.difficulty,
      sentence: built.sentence,
      options: built.options,
      answer: built.answer,
      explanationTitle: built.explanationTitle,
      masterExplanation: pattern.explanation,
      wrongExplanations: pattern.wrong,
    })
  }

  return shuffleArray(questions)
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
    ? question.masterExplanation
    : question.wrongExplanations[selected] || question.masterExplanation

  return (
    <div className={`feedback-box ${isCorrect ? 'correct' : 'wrong'}`}>
      <div className="feedback-title">
        {isCorrect ? 'Correct' : 'Not quite'}
      </div>
      <div className="feedback-text">
        <strong>Rule:</strong> {question.explanationTitle}
      </div>
      <div className="feedback-text">{explanation}</div>
      {!isCorrect && (
        <div className="feedback-text">
          <strong>Correct answer:</strong> {question.answer}
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
      if (submittedMap[question.id] && answerMap[question.id] === question.answer) {
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
          <h1 className="title">IELTS Task 1 Preposition Trainer</h1>
          <p className="subtitle">
            Practice key preposition patterns for describing change over time, then get instant feedback and explanations.
          </p>

          <div className="stats-grid">
            <StatCard label="Score" value={`${score}/${hasQuiz ? quiz.length : 10}`} />
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
            <p>Choose a difficulty level, then click <strong>Generate new quiz</strong> to begin.</p>
          </section>
        )}

        {hasQuiz && currentQuestion && (
          <section className="panel">
            <div className="question-top">
              <div>
                <h2 className="question-title">Question {currentIndex + 1}</h2>
                <p className="question-subtitle">
                  Choose the best preposition for the sentence.
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
                isCorrect={answerMap[currentQuestion.id] === currentQuestion.answer}
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
