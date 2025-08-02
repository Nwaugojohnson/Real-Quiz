const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");

let currentQuestionIndex = 0;
let score = 0;
let questions = [];

async function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  nextButton.innerHTML = "Next";

  // Fetch questions from API
  try {
    questions = await fetchQuizQuestions();
    showQuestion();
  } catch (error) {
    questionElement.innerHTML = "Failed to load questions. Please try again.";
    console.error("Error fetching questions:", error);
  }
}

async function fetchQuizQuestions() {
  // You can customize the API URL with different parameters
  const apiUrl =
    "https://opentdb.com/api.php?amount=10&category=9&difficulty=medium&type=multiple";

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }

  const data = await response.json();

  // Convert API response to match our quiz format
  return data.results.map((question) => {
    // Combine incorrect and correct answers
    const allAnswers = [
      ...question.incorrect_answers.map((answer) => ({
        text: decodeHtmlEntities(answer),
        correct: false,
      })),
      { text: decodeHtmlEntities(question.correct_answer), correct: true },
    ];

    // Shuffle answers
    const shuffledAnswers = shuffleArray(allAnswers);

    return {
      question: decodeHtmlEntities(question.question),
      answers: shuffledAnswers,
    };
  });
}

// Helper function to decode HTML entities (like &quot; etc.)
function decodeHtmlEntities(text) {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = text;
  return textArea.value;
}

// Helper function to shuffle array
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function showQuestion() {
  resetState();
  let currentQuestion = questions[currentQuestionIndex];
  let questionNo = currentQuestionIndex + 1;
  questionElement.innerHTML = questionNo + ". " + currentQuestion.question;

  // Add progress bar update here
  const progressBar = document.getElementById("progress-bar");
  progressBar.style.width = `${
    ((currentQuestionIndex + 1) / questions.length) * 100
  }%`;

  currentQuestion.answers.forEach((answer) => {
    const button = document.createElement("button");
    button.innerHTML = answer.text;
    button.classList.add("btn");
    answerButtons.appendChild(button);
    if (answer.correct) {
      button.dataset.correct = answer.correct;
    }
    button.addEventListener("click", selectAnswer);
  });
}

function resetState() {
  nextButton.style.display = "none";
  while (answerButtons.firstChild) {
    answerButtons.removeChild(answerButtons.firstChild);
  }
}

function selectAnswer(e) {
  const selectedBtn = e.target;
  const isCorrect = selectedBtn.dataset.correct === "true";
  if (isCorrect) {
    selectedBtn.classList.add("correct");
    score++;
  } else {
    selectedBtn.classList.add("incorrect");
  }
  Array.from(answerButtons.children).forEach((button) => {
    if (button.dataset.correct === "true") {
      button.classList.add("correct");
    }
    button.disabled = true;
  });
  nextButton.style.display = "block";
}

function showScore() {
  resetState();
  questionElement.innerHTML = `
        You scored ${score} out of ${questions.length}!`;
  nextButton.innerHTML = "Play Again";
  nextButton.style.display = "block";
}

function handleNextButton() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
}

nextButton.addEventListener("click", () => {
  if (currentQuestionIndex < questions.length) {
    handleNextButton();
  } else {
    startQuiz();
  }
});

// Start the quiz when the page loads
startQuiz();
